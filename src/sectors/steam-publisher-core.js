import {
  calculatePublisherModel,
  solvePublisherBreakevenUnits,
} from "../core/master-finance-engine-v2.js";
import {
  STEAM_PUBLISHER_SCENARIOS,
  applySteamPublisherScenario,
  normalizeSteamPublisherInputs,
} from "./steam-publisher-config.js";

export function buildSteamPublisherWarnings(result) {
  const { input, platform, receipt, recoup, settlement, pnl, cashFlow } = result;
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (Math.abs(input.publisherShareRate + input.developerShareRate - 1) > 0.001) {
    add("share_total", "hard", "Yayıncı ve geliştirici paylarının toplamı %100 etmiyor.");
  }
  if (input.regionMode) {
    const regionShareTotal = input.regions.reduce((total, region) => total + region.shareRate, 0);
    if (Math.abs(regionShareTotal - 1) > 0.005) {
      add("region_share_total", "hard", "Bölge satış paylarının toplamı %100 olmalıdır.");
    }
  }
  if (input.ipShareRate + input.coPublisherShareRate > 0.50) {
    add("secondary_share_high", "soft", "IP ve co-publisher paylarının toplamı %50’yi aşıyor.");
  }
  if (pnl.earningsBeforeTaxTry < 0) {
    add("publisher_loss", "hard", "Bu senaryoda yayıncı vergi öncesi zarar ediyor.");
  }
  if (settlement.unrecoupedExpenseTry > 0) {
    add("recoup_open", "soft", "Recoup havuzunun bir bölümü kapanmıyor.");
  }
  if (settlement.unrecoupedAdvanceTry > 0) {
    add("advance_open", "soft", "Advance veya milestone tutarının bir bölümü geri alınamıyor.");
  }
  if (receipt.receiptTry < 0) {
    add("negative_receipt", "hard", "Banka ve tahsilat masrafları platform ödemesini aşıyor.");
  }
  if (cashFlow.firstThreeMonthGapTry < 0) {
    add("cash_gap", "soft", "İlk üç ayda ek finansman gerektirebilecek nakit açığı oluşuyor.");
  }
  if (platform.adjustedGross <= 0) {
    add("no_adjusted_revenue", "hard", "Vergi, iade ve ters ibraz sonrasında paylaşılabilir gelir oluşmuyor.");
  }
  if (recoup.recoupableTotalTry > receipt.receiptTry && input.recoupEnabled) {
    add("recoup_larger_than_receipt", "soft", "Recoup havuzu net yayıncı tahsilatından yüksek.");
  }

  return warnings;
}

export function buildSteamPublisherWaterfall(result) {
  const { input, platform, receipt, recoup, settlement, pnl, tax } = result;
  const usdTry = input.usdTry;
  return [
    { name: "Brüt oyuncu harcaması", amount: platform.customerPayment * usdTry, kind: "keep", subtext: "Vergiler dahil oyuncunun ödediği" },
    { name: "VAT / sales tax / GST", amount: -platform.transactionTax * usdTry, kind: "cut", subtext: "Dahil ve fiyat üstü vergi ayrımı" },
    { name: "İade ve ters ibraz", amount: -platform.refundAndChargeback * usdTry, kind: "cut", subtext: "Gelir kaybı" },
    { name: "Platform komisyonu", amount: -platform.platformCommission * usdTry, kind: "cut", subtext: input.tieredCommissionEnabled ? "Kademeli" : "Sabit" },
    { name: "ABD stopajı", amount: -platform.usWithholdingUsd * usdTry, kind: "cut", subtext: "ABD kaynaklı gelir payı" },
    { name: "Banka ve kur masrafı", amount: -(receipt.bankAndProviderUsd * usdTry + receipt.fxSpreadCostTry), kind: "cut", subtext: "SWIFT, sağlayıcı ve kur makası" },
    { name: "Doğrudan oyun giderleri", amount: -recoup.directGameCostsTry, kind: "cut", subtext: "Recoupable ve non-recoupable toplam" },
    { name: "Geliştirici toplam ödemesi", amount: -settlement.developerTotalPaymentTry, kind: "stakeholder", subtext: "Advance + nakit royalty" },
    { name: "IP / co-publisher payı", amount: -(settlement.ipShareTry + settlement.coPublisherShareTry), kind: "stakeholder", subtext: "Sözleşme payları" },
    { name: "Yayıncı operasyon ve genel gider", amount: -(input.publisherOperationsTry + pnl.allocatedOverheadTry + input.depreciationTry), kind: "cut", subtext: "Amortisman dahil P&L gideri" },
    { name: "Türkiye vergisi", amount: -tax.turkeyTaxTry, kind: "cut", subtext: "Stopaj mahsubu sonrası" },
    { name: "Temettü stopajı", amount: -tax.dividendWithholdingTry, kind: "cut", subtext: "Dağıtım varsa" },
    { name: "Yayıncı net kârı", amount: tax.publisherNetProfitTry, kind: "total", subtext: "Vergi ve dağıtım sonrası" },
  ];
}

export function calculateSteamPublisherReferenceModel(rawInputs = {}) {
  const input = normalizeSteamPublisherInputs(rawInputs);
  const result = calculatePublisherModel(input);
  const breakevenUnits = solvePublisherBreakevenUnits(input);
  const totalPublisherOutlayTry = result.recoup.directGameCostsTry
    + input.publisherOperationsTry
    + result.pnl.allocatedOverheadTry
    + result.settlement.advanceTry;
  const publisherRoi = totalPublisherOutlayTry > 0
    ? result.tax.publisherNetProfitTry / totalPublisherOutlayTry
    : 0;

  return {
    ...result,
    breakevenUnits,
    publisherRoi,
    warnings: buildSteamPublisherWarnings(result),
    waterfall: buildSteamPublisherWaterfall(result),
  };
}

export function calculateSteamPublisherScenarioComparison(baseInputs = {}) {
  return Object.entries(STEAM_PUBLISHER_SCENARIOS).map(([id, scenario]) => {
    const input = applySteamPublisherScenario(baseInputs, id);
    return { id, label: scenario.label, input, result: calculateSteamPublisherReferenceModel(input) };
  });
}
