/**
 * Steam Yayıncı Finansal Fizibilite v2 master prototipinden birebir çıkarılan
 * saf hesap fonksiyonları.
 *
 * Bu dosya mevcut sade motorun yerine hemen geçmez. Kaynak uyumlu v2 motoru
 * paralel olarak kurar; mevcut sektörler kontrollü biçimde buraya taşınacaktır.
 */

export function toUsd(amount, currency, input) {
  if (currency === "USD") return amount;
  if (currency === "EUR") return amount * input.eurUsd;
  if (currency === "GBP") return amount * input.gbpUsd;
  if (currency === "TRY" || currency === "TL") return amount / input.usdTry;
  return amount;
}

export function splitTransactionTax(grossList, rate, type) {
  if (type === "inclusive") {
    const tax = grossList * rate / (1 + rate);
    return { customerPayment: grossList, taxAmount: tax, netBase: grossList - tax };
  }
  if (type === "additive") {
    const tax = grossList * rate;
    return { customerPayment: grossList + tax, taxAmount: tax, netBase: grossList };
  }
  return { customerPayment: grossList, taxAmount: 0, netBase: grossList };
}

export function calculateTieredPlatformCut(adjustedGross, input) {
  if (!input.tieredCommissionEnabled) return adjustedGross * input.flatCommissionRate;
  const tier1Cap = Math.max(input.tier1Cap, 0);
  const tier2Cap = Math.max(input.tier2Cap, tier1Cap);
  const tier1Base = Math.min(adjustedGross, tier1Cap);
  const tier2Base = Math.min(Math.max(adjustedGross - tier1Cap, 0), tier2Cap - tier1Cap);
  const tier3Base = Math.max(adjustedGross - tier2Cap, 0);
  return tier1Base * input.tier1Rate
    + tier2Base * input.tier2Rate
    + tier3Base * input.tier3Rate;
}

export function calculatePlatformLayer(input) {
  let customerPayment = 0;
  let grossList = 0;
  let transactionTax = 0;
  let refundAndChargeback = 0;
  let usAdjustedRevenue = 0;
  let adjustedGross = 0;

  if (input.regionMode) {
    for (const region of input.regions) {
      const priceUsd = toUsd(region.localPrice, region.currency, input);
      const regionGrossList = priceUsd * (1 - region.discountRate) * input.units * region.shareRate;
      const taxSplit = splitTransactionTax(regionGrossList, region.taxRate, region.taxType);
      const regionLoss = taxSplit.netBase * (region.refundRate + input.chargebackRate);
      customerPayment += taxSplit.customerPayment;
      grossList += regionGrossList;
      transactionTax += taxSplit.taxAmount;
      refundAndChargeback += regionLoss;
      const regionAdjusted = taxSplit.netBase - regionLoss;
      adjustedGross += regionAdjusted;
      if (region.isUsSource) usAdjustedRevenue += regionAdjusted;
    }
  } else {
    grossList = input.listPriceUsd * input.units * (1 - input.discountRate);
    const taxSplit = splitTransactionTax(grossList, input.averageTransactionTaxRate, input.transactionTaxType);
    customerPayment = taxSplit.customerPayment;
    transactionTax = taxSplit.taxAmount;
    refundAndChargeback = taxSplit.netBase * (input.refundRate + input.chargebackRate);
    adjustedGross = taxSplit.netBase - refundAndChargeback;
    usAdjustedRevenue = adjustedGross * input.usRevenueShareRate;
  }

  const usRevenueShareRate = adjustedGross > 0 ? usAdjustedRevenue / adjustedGross : 0;
  const platformCommission = calculateTieredPlatformCut(adjustedGross, input);
  const partnerGrossUsd = adjustedGross - platformCommission;
  const withholdingRate = input.withholdingMode === "custom"
    ? input.customWithholdingRate
    : Number(input.withholdingMode) / 100;
  const usWithholdingUsd = partnerGrossUsd * usRevenueShareRate * withholdingRate;
  const directFeeRefunded = input.directFeeRefundEnabled && adjustedGross >= 1000;
  const directFeeUsd = directFeeRefunded ? 0 : 100;
  const valvePaymentUsd = partnerGrossUsd - usWithholdingUsd - directFeeUsd;

  let additionalOperatingNetUsd = 0;
  let grantIncomeTry = 0;
  let investmentCashTry = 0;
  let nonTaxableIncomeTry = 0;

  for (const item of input.additionalIncomeItems) {
    if (item.grossAmount <= 0) continue;
    const grossUsd = toUsd(item.grossAmount, item.currency, input);
    let netUsd = grossUsd / (1 + item.vatRate) * (1 - item.deductionRate);
    if (item.applyWithholding) netUsd *= (1 - withholdingRate);
    const netTry = netUsd * input.usdTry;

    if (item.category === "operating") {
      additionalOperatingNetUsd += netUsd;
      if (!item.taxable) nonTaxableIncomeTry += netTry;
    } else if (item.category === "grant") {
      grantIncomeTry += netTry;
      if (!item.taxable) nonTaxableIncomeTry += netTry;
    } else if (item.category === "investment") {
      investmentCashTry += netTry;
    }
  }

  return {
    customerPayment,
    grossList,
    transactionTax,
    refundAndChargeback,
    adjustedGross,
    usRevenueShareRate,
    platformCommission,
    usWithholdingUsd,
    withholdingRate,
    directFeeUsd,
    directFeeRefunded,
    valvePaymentUsd,
    additionalOperatingNetUsd,
    grantIncomeTry,
    investmentCashTry,
    nonTaxableIncomeTry,
    platformPaymentUsd: valvePaymentUsd + additionalOperatingNetUsd,
  };
}

export function calculatePublisherReceipt(input, platform) {
  const bankAndProviderUsd = input.wireFeeUsdPerMonth * input.collectionPeriodMonths
    + Math.max(platform.platformPaymentUsd, 0) * input.paymentProviderRate;
  const netUsd = platform.platformPaymentUsd - bankAndProviderUsd;
  const effectiveUsdTry = input.usdTry * (1 - input.fxSpreadRate);
  const fxSpreadCostTry = Math.max(netUsd, 0) * input.usdTry * input.fxSpreadRate;
  const receiptTry = netUsd * effectiveUsdTry;
  return { bankAndProviderUsd, netUsd, effectiveUsdTry, fxSpreadCostTry, receiptTry };
}

export function calculateRecoup(input) {
  const toTry = (item) => item.currency === "USD" ? item.amount * input.usdTry : item.amount;
  let poolRecoupTry = 0;
  let developerRecoupTry = 0;
  let nonRecoupableTry = 0;
  let directGameCostsTry = 0;

  for (const item of input.recoupItems) {
    const amountTry = toTry(item);
    directGameCostsTry += amountTry;
    if (!input.recoupEnabled || !item.recoupable) {
      nonRecoupableTry += amountTry;
      continue;
    }
    if (item.fromDeveloperShare || input.recoupOrder === "after_split") developerRecoupTry += amountTry;
    else poolRecoupTry += amountTry;
  }

  if (input.shareBasis === "platform_net") {
    developerRecoupTry += poolRecoupTry;
    poolRecoupTry = 0;
  }

  let recoupableTotalTry = poolRecoupTry + developerRecoupTry;
  if (input.recoupCapTry > 0 && recoupableTotalTry > input.recoupCapTry) {
    const scale = input.recoupCapTry / recoupableTotalTry;
    nonRecoupableTry += recoupableTotalTry - input.recoupCapTry;
    poolRecoupTry *= scale;
    developerRecoupTry *= scale;
    recoupableTotalTry = input.recoupCapTry;
  }

  return { poolRecoupTry, developerRecoupTry, recoupableTotalTry, nonRecoupableTry, directGameCostsTry };
}

export function calculateDeveloperSettlement(input, receipt, recoup) {
  const advanceTry = (input.minimumGuaranteeUsd + input.milestonesUsd) * input.usdTry;
  let splitPoolTry = Math.max(receipt.receiptTry, 0);
  const poolRecoupedTry = Math.min(recoup.poolRecoupTry, splitPoolTry);
  splitPoolTry -= poolRecoupedTry;

  if (input.shareBasis === "after_publisher_expenses") {
    splitPoolTry = Math.max(
      splitPoolTry - input.publisherOperationsTry
        - input.monthlyOverheadTry * input.overheadMonths * input.overheadAllocationRate,
      0,
    );
  }

  const ipShareTry = splitPoolTry * input.ipShareRate;
  const coPublisherShareTry = splitPoolTry * input.coPublisherShareRate;
  splitPoolTry -= ipShareTry + coPublisherShareTry;

  const developerEarnedTry = splitPoolTry * input.developerShareRate;
  const developerExpenseRecoupedTry = Math.min(recoup.developerRecoupTry, developerEarnedTry);
  const afterExpenseRecoupTry = developerEarnedTry - developerExpenseRecoupedTry;
  const advanceRecoupedTry = input.advanceRecoupable
    ? Math.min(advanceTry, afterExpenseRecoupTry)
    : 0;
  const developerRoyaltyPaymentTry = afterExpenseRecoupTry - advanceRecoupedTry;
  const developerTotalPaymentTry = advanceTry + developerRoyaltyPaymentTry;
  const expenseRecoupedTry = poolRecoupedTry + developerExpenseRecoupedTry;
  const unrecoupedExpenseTry = Math.max(recoup.recoupableTotalTry - expenseRecoupedTry, 0);
  const unrecoupedAdvanceTry = input.advanceRecoupable ? Math.max(advanceTry - advanceRecoupedTry, 0) : 0;
  const publisherGrossShareTry = splitPoolTry - developerEarnedTry;

  return {
    advanceTry,
    poolRecoupedTry,
    ipShareTry,
    coPublisherShareTry,
    splitPoolTry,
    developerEarnedTry,
    developerExpenseRecoupedTry,
    advanceRecoupedTry,
    developerRoyaltyPaymentTry,
    developerTotalPaymentTry,
    expenseRecoupedTry,
    unrecoupedExpenseTry,
    unrecoupedAdvanceTry,
    publisherGrossShareTry,
  };
}

export function calculatePublisherPnl(input, platform, receipt, recoup, settlement) {
  const allocatedOverheadTry = input.monthlyOverheadTry * input.overheadMonths * input.overheadAllocationRate;
  const revenueTry = receipt.receiptTry + platform.grantIncomeTry;
  const expensesTry = recoup.directGameCostsTry
    + input.publisherOperationsTry
    + allocatedOverheadTry
    + input.depreciationTry;
  const earningsBeforeTaxTry = revenueTry
    - settlement.developerTotalPaymentTry
    - settlement.ipShareTry
    - settlement.coPublisherShareTry
    - expensesTry
    + input.fxGainLossTry;
  return { allocatedOverheadTry, revenueTry, expensesTry, earningsBeforeTaxTry };
}

export function calculateProgressiveIncomeTax(baseTry, brackets) {
  let taxTry = 0;
  let previousLimit = 0;
  for (const bracket of brackets) {
    if (baseTry > previousLimit) {
      taxTry += (Math.min(baseTry, bracket.upTo) - previousLimit) * bracket.rate;
    }
    previousLimit = bracket.upTo;
    if (baseTry <= previousLimit) break;
  }
  return taxTry;
}

export function calculatePublisherTax(input, pnl, platform) {
  let taxBaseTry = Math.max(
    pnl.earningsBeforeTaxTry - platform.nonTaxableIncomeTry - input.lossCarryforwardTry,
    0,
  );
  let taxRegime = "standard";
  if (input.technoparkExemption) {
    taxBaseTry = 0;
    taxRegime = "technopark";
  } else if (input.softwareExportDeduction80) {
    taxBaseTry *= 0.20;
    taxRegime = "export_deduction_80";
  }

  const grossTaxTry = input.entityType === "company"
    ? taxBaseTry * input.corporateTaxRate
    : calculateProgressiveIncomeTax(taxBaseTry, input.incomeTaxBrackets);
  const foreignWithholdingTry = platform.usWithholdingUsd * input.usdTry;
  const withholdingCreditTry = input.foreignWithholdingCreditEnabled
    ? Math.min(foreignWithholdingTry, grossTaxTry)
    : 0;
  const turkeyTaxTry = grossTaxTry - withholdingCreditTry;
  const afterTaxProfitTry = pnl.earningsBeforeTaxTry - turkeyTaxTry;
  const distributableProfitTry = Math.max(afterTaxProfitTry, 0) * input.profitDistributionRate;
  const dividendWithholdingTry = input.entityType === "company"
    ? distributableProfitTry * input.dividendWithholdingRate
    : 0;
  const shareholderCashTry = distributableProfitTry - dividendWithholdingTry;
  const retainedProfitTry = afterTaxProfitTry - distributableProfitTry;

  return {
    taxBaseTry,
    taxRegime,
    grossTaxTry,
    withholdingCreditTry,
    turkeyTaxTry,
    afterTaxProfitTry,
    distributableProfitTry,
    dividendWithholdingTry,
    shareholderCashTry,
    retainedProfitTry,
    publisherNetProfitTry: afterTaxProfitTry - dividendWithholdingTry,
  };
}

export function calculatePublisherCashFlow(input, platform, receipt, recoup, settlement, pnl) {
  const preLaunchCashNeedTry = input.monthsToLaunch * input.preLaunchMonthlyBurnTry
    + input.launchMarketingTry;
  const startCashTry = input.cashOnHandTry + platform.investmentCashTry;
  const runwayMonths = input.preLaunchMonthlyBurnTry > 0
    ? startCashTry / input.preLaunchMonthlyBurnTry
    : Infinity;
  const firstMonthReceiptTry = receipt.receiptTry * input.firstMonthSalesShareRate;
  const remainingMonthlyReceiptTry = (receipt.receiptTry - firstMonthReceiptTry) / 11;
  const platformCollectionLagMonths = Math.ceil(input.platformPaymentDelayDays / 30);
  const receiptForMonth = (month) => {
    const salesMonth = month - platformCollectionLagMonths;
    if (salesMonth < 1) return 0;
    if (salesMonth === 1) return firstMonthReceiptTry;
    return salesMonth <= 12 ? remainingMonthlyReceiptTry : 0;
  };
  const monthlyPublisherCostTry = (input.publisherOperationsTry + pnl.allocatedOverheadTry) / 12;
  const developerPaymentLagMonths = Math.ceil(input.developerPaymentDelayDays / 30);

  let cumulativeReceiptTry = 0;
  let recoupClosingMonth = null;
  let cashBreakevenMonth = null;
  let cashTry = startCashTry - preLaunchCashNeedTry;
  let developerPaidTry = 0;
  const months = [];

  for (let month = 1; month <= 36; month += 1) {
    const receiptTry = receiptForMonth(month);
    cumulativeReceiptTry += receiptTry;
    if (
      recoupClosingMonth === null
      && recoup.recoupableTotalTry > 0
      && cumulativeReceiptTry >= recoup.recoupableTotalTry
    ) {
      recoupClosingMonth = month;
    }

    let developerOutflowTry = 0;
    const developerStartMonth = (recoup.recoupableTotalTry > 0 ? (recoupClosingMonth || 99) : 1)
      + developerPaymentLagMonths;
    if (month >= developerStartMonth && receipt.receiptTry > 0) {
      const owedTry = settlement.developerRoyaltyPaymentTry
        * Math.min(cumulativeReceiptTry / receipt.receiptTry, 1);
      developerOutflowTry = Math.max(owedTry - developerPaidTry, 0);
      developerPaidTry += developerOutflowTry;
    }

    cashTry += receiptTry - monthlyPublisherCostTry - developerOutflowTry;
    if (month <= 12) {
      months.push({
        month,
        receiptTry,
        publisherCostTry: monthlyPublisherCostTry,
        developerOutflowTry,
        cashTry,
        recoupBalanceTry: Math.max(recoup.recoupableTotalTry - cumulativeReceiptTry, 0),
      });
    }
    if (cashBreakevenMonth === null && cashTry >= startCashTry) cashBreakevenMonth = month;
  }

  if (recoup.recoupableTotalTry <= 0) recoupClosingMonth = 0;
  const firstThreeMonthGapTry = Math.min(
    0,
    startCashTry - preLaunchCashNeedTry
      + receiptForMonth(1) + receiptForMonth(2) + receiptForMonth(3)
      - 3 * monthlyPublisherCostTry,
  );
  const firstDeveloperPaymentMonth = recoup.recoupableTotalTry <= 0
    ? 1 + developerPaymentLagMonths
    : recoupClosingMonth === null ? null : recoupClosingMonth + developerPaymentLagMonths;

  return {
    preLaunchCashNeedTry,
    startCashTry,
    runwayMonths,
    recoupClosingMonth,
    cashBreakevenMonth,
    firstThreeMonthGapTry,
    firstDeveloperPaymentMonth,
    months,
    endingCashTry: months.at(-1)?.cashTry ?? cashTry,
  };
}

export function calculatePublisherModel(input) {
  const platform = calculatePlatformLayer(input);
  const receipt = calculatePublisherReceipt(input, platform);
  const recoup = calculateRecoup(input);
  const settlement = calculateDeveloperSettlement(input, receipt, recoup);
  const pnl = calculatePublisherPnl(input, platform, receipt, recoup, settlement);
  const tax = calculatePublisherTax(input, pnl, platform);
  const cashFlow = calculatePublisherCashFlow(input, platform, receipt, recoup, settlement, pnl);
  return { input, platform, receipt, recoup, settlement, pnl, tax, cashFlow };
}

export function solvePublisherBreakevenUnits(input) {
  if (input.listPriceUsd <= 0 && !input.regionMode) return 0;
  const netAt = (units) => calculatePublisherModel({ ...input, units }).tax.publisherNetProfitTry;
  let low = 0;
  let high = 50_000_000;
  if (netAt(high) < 0) return null;
  if (netAt(0) >= 0) return 0;
  for (let index = 0; index < 60; index += 1) {
    const midpoint = (low + high) / 2;
    if (netAt(midpoint) < 0) low = midpoint;
    else high = midpoint;
  }
  return Math.ceil(high);
}
