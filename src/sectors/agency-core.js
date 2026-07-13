import {
  buildWaterfall, calcCommission, calcTaxSplit, calculateCashFlow, findLargestExpense,
  percent, solveBreakeven, stakeholderBasisAmount, sumValues,
} from "../core/finance-engine.js";
import { AGENCY_SCENARIOS, applyAgencyScenario, normalizeAgencyInputs } from "./agency-config.js";

export function calculateAgencyMonth(rawInputs, overrides = {}) {
  const input = normalizeAgencyInputs({ ...rawInputs, ...overrides });
  const grossRevenue = input.monthlyProjectCount * input.averageProjectFee;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const adjustedRevenue = tax.netBase;
  const platformCommission = calcCommission(adjustedRevenue * input.platformSalesShare, input.platformCommissionRate);
  const paymentCommission = calcCommission(adjustedRevenue * input.cardPaymentShare, input.paymentCommissionRate);
  const totalCommissions = platformCommission + paymentCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;

  const baseProjectHours = input.monthlyProjectCount * input.averageProjectHours;
  const revisionHours = input.monthlyProjectCount * input.revisionHoursPerProject;
  const totalDeliveryHours = baseProjectHours + revisionHours;
  const theoreticalCapacityHours = input.teamSize * input.monthlyHoursPerPerson;
  const targetBillableCapacityHours = theoreticalCapacityHours * input.targetUtilizationRate;
  const capacityUtilization = percent(totalDeliveryHours, theoreticalCapacityHours);
  const targetCapacityLoad = percent(totalDeliveryHours, targetBillableCapacityHours);

  const baseTeamCost = baseProjectHours * input.hourlyCost;
  const revisionCost = revisionHours * input.hourlyCost;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = baseTeamCost + revisionCost + input.freelancerPayments + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;

  const fixedCostItems = {
    adminStaffCost: input.adminStaffCost,
    officeRent: input.officeRent,
    utilities: input.utilities,
    accounting: input.accounting,
    softwareSubscriptions: input.softwareSubscriptions,
    monthlyMarketing: input.monthlyMarketing,
    insurance: input.insurance,
    otherFixedExpenses: input.otherFixedExpenses,
  };
  const totalFixedCosts = sumValues(Object.values(fixedCostItems));
  const basisValues = { grossRevenue, revenueAfterCommission, contribution, preTaxBeforePartner: contribution - totalFixedCosts };
  const partnerBasis = stakeholderBasisAmount("pre_tax_profit", basisValues);
  const partnerPayout = partnerBasis * input.partnerProfitShareRate;
  const totalStakeholderPayouts = partnerPayout;
  const preTaxProfit = contribution - totalFixedCosts - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;

  const setupCostItems = {
    hardwareInvestment: input.hardwareInvestment,
    officeSetup: input.officeSetup,
    deposit: input.deposit,
    legalAndCompanySetup: input.legalAndCompanySetup,
    websiteAndBranding: input.websiteAndBranding,
    initialMarketing: input.initialMarketing,
    softwareSetup: input.softwareSetup,
  };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  const effectiveHourlySales = percent(grossRevenue, totalDeliveryHours);
  const effectiveHourlyContribution = percent(contribution, totalDeliveryHours);
  const referenceHourlyRevenue = totalDeliveryHours * input.hourlySalesPrice;
  const pricingGap = grossRevenue - referenceHourlyRevenue;
  const revisionCostRatio = percent(revisionCost, adjustedRevenue);
  const deliveryCostRatio = percent(baseTeamCost + revisionCost + input.freelancerPayments, adjustedRevenue);
  const revenuePerEmployee = percent(grossRevenue, input.teamSize);
  const projectNetProfit = percent(netProfit, input.monthlyProjectCount);
  const hourlyNetProfit = percent(netProfit, totalDeliveryHours);
  const largestExpense = findLargestExpense({ ...fixedCostItems, baseTeamCost, revisionCost, freelancerPayments: input.freelancerPayments, platformCommission, paymentCommission });

  return {
    input, grossRevenue, customerPayment: tax.customerPayment, taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: adjustedRevenue, lostSalesAmount: 0, adjustedRevenue,
    platformCommission, paymentCommission, totalCommissions, revenueAfterCommission,
    baseProjectHours, revisionHours, totalDeliveryHours, theoreticalCapacityHours,
    targetBillableCapacityHours, capacityUtilization, targetCapacityLoad,
    baseTeamCost, revisionCost, freelancerPayments: input.freelancerPayments, otherVariableCost,
    totalVariableCosts, cashVariableCosts: totalVariableCosts, contribution,
    fixedCostItems, totalFixedCosts, cashFixedCosts: totalFixedCosts,
    partnerPayout, totalStakeholderPayouts, preTaxProfit, estimatedTax, netProfit,
    setupCostItems, totalSetupCost, effectiveHourlySales, effectiveHourlyContribution,
    referenceHourlyRevenue, pricingGap, revisionCostRatio, deliveryCostRatio,
    revenuePerEmployee, projectNetProfit, hourlyNetProfit,
    profitMargin: percent(netProfit, adjustedRevenue), largestExpense,
  };
}

export function calculateAgencyModel(rawInputs) {
  const input = normalizeAgencyInputs(rawInputs);
  const current = calculateAgencyMonth(input);
  const breakevenProjectCount = solveBreakeven({
    min: 0,
    max: Math.max(1000, input.monthlyProjectCount * 30 + 10),
    tolerance: 0.0001,
    evaluate: (monthlyProjectCount) => calculateAgencyMonth(input, { monthlyProjectCount }).netProfit,
  });
  const breakevenRevenue = breakevenProjectCount == null ? null : breakevenProjectCount * input.averageProjectFee;
  const breakevenCapacityUtilization = breakevenProjectCount == null ? null : percent(
    breakevenProjectCount * (input.averageProjectHours + input.revisionHoursPerProject),
    current.theoreticalCapacityHours,
  );
  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: 0,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateAgencyMonth(input, { monthlyProjectCount: input.monthlyProjectCount * growthMultiplier }),
  });
  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildAgencyWarnings({ current, cashFlow, breakevenProjectCount, breakevenCapacityUtilization, input });
  return {
    ...current, breakevenProjectCount, breakevenRevenue, breakevenCapacityUtilization,
    cashFlow, annualNetProfit, roi, paybackMonths, warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Proje geliri", loss: "Gelir kaybı", commission: "Platform ve ödeme kesintisi",
        variable: "Üretim ve revizyon maliyeti", fixed: "Sabit giderler", stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: "Proje sayısı × ortalama proje bedeli",
      lossSubtext: "Bu modelde ayrıca gelir kaybı tanımlanmadı",
      commissionSubtext: "Aracı platform ve ödeme kesintileri",
      variableSubtext: "Baz ekip saati, revizyon ve taşeron",
      fixedSubtext: "İdari ekip, ofis, yazılım ve satış giderleri",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateAgencyScenarioComparison(baseOrScenarioInputs) {
  const isScenarioMap = baseOrScenarioInputs && Object.keys(AGENCY_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(AGENCY_SCENARIOS).map(([id, preset]) => {
    const inputs = isScenarioMap ? normalizeAgencyInputs(baseOrScenarioInputs[id]) : applyAgencyScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateAgencyModel(inputs) };
  });
}

export function buildAgencyWarnings({ current, cashFlow, breakevenProjectCount, breakevenCapacityUtilization, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda ajans/freelancer işletmesi aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Tahsilat vadesi ve kurulum giderleri ilk 3 ayda nakit açığı oluşturuyor.");
  if (input.collectionDelayDays > 45) add("collection_delay_hard", "hard", "Tahsilat vadesi 45 günü aşıyor; kârlı görünen model ciddi nakit açığı üretebilir.");
  else if (input.collectionDelayDays > 20) add("collection_delay_soft", "soft", "Tahsilat gecikmesi işletme sermayesi ihtiyacını artırıyor.");
  if (current.capacityUtilization > 1) add("over_capacity", "hard", "Planlanan proje ve revizyon saatleri ekibin teorik kapasitesini aşıyor.");
  else if (current.capacityUtilization < 0.35) add("capacity_low", "soft", "Kapasite kullanımı düşük; ekip saatlerinin önemli bölümü faturalandırılamıyor.");
  if (current.targetCapacityLoad > 1.10) add("target_capacity", "soft", "İş yükü hedef faturalandırılabilir kapasitenin %110'unu aşıyor; teslim riski oluşabilir.");
  const hourlyCostShare = percent(input.hourlyCost, current.effectiveHourlySales);
  if (hourlyCostShare > 0.80) add("hourly_cost_hard", "hard", "Saatlik ekip maliyeti gerçekleşen saatlik satış gelirinin %80'ini aşıyor.");
  else if (hourlyCostShare > 0.60) add("hourly_cost_soft", "soft", "Saatlik maliyet satış fiyatına göre yüksek; fiyat veya üretim verimliliği gözden geçirilmeli.");
  if (current.revisionCostRatio > 0.15) add("revision_hard", "hard", "Revizyon maliyeti net proje gelirinin %15'ini aşıyor.");
  else if (current.revisionCostRatio > 0.08) add("revision_soft", "soft", "Revizyon maliyeti kârı belirgin şekilde düşürüyor; kapsam ve revizyon sınırları netleştirilmeli.");
  if (input.largestClientRevenueShare > 0.50) add("client_concentration_hard", "hard", "Ciroun yarısından fazlası tek müşteriye bağlı; müşteri kaybı işletmeyi doğrudan riske atar.");
  else if (input.largestClientRevenueShare > 0.30) add("client_concentration_soft", "soft", "En büyük müşteri payı yüksek; müşteri yoğunlaşması azaltılmalı.");
  if (current.pricingGap < 0) add("pricing_gap", "soft", "Proje bedelleri, girilen hedef saatlik satış fiyatının altında kalıyor.");
  if (breakevenProjectCount == null) add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle başabaş proje sayısı bulunamıyor.");
  else if (breakevenCapacityUtilization > 1) add("breakeven_capacity", "hard", "Başabaş için ekip kapasitesinin üzerinde proje yükü gerekiyor.");
  else if (breakevenProjectCount > input.monthlyProjectCount * 1.5) add("breakeven_high", "soft", "Başabaş proje sayısı mevcut proje hacminin belirgin üzerinde.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.08) add("low_margin", "soft", "Net kâr marjı %8'in altında; revizyon veya tahsilat sapmaları modeli kolayca zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir ajans/freelancer uyarısı oluşmadı.");
  return warnings;
}
