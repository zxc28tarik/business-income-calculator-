import { buildWaterfall, calculateCashFlow, percent, solveBreakeven } from "../core/finance-engine.js";
import { AUTO_SERVICE_SCENARIOS, applyAutoServiceScenario, normalizeAutoServiceInputs } from "./auto-v2-config.js";
import { calculateAutoProfileMonth } from "./auto-v2-month.js";

function driverKey(input, profile) {
  if (!input.profileDriverEnabled) return "dailyVehicles";
  if (input.customerBaseDemandEnabled) return "newCustomerJobsPerMonth";
  if (profile.driver === "walk_in") return "dailyDemandRequests";
  if (profile.driver === "appointment") return "scheduledJobsPerDay";
  if (profile.driver === "monthly_jobs") return "monthlyJobs";
  return "routesPerTechnicianPerDay";
}

function growthOverride(input, profile, multiplier) {
  const key = driverKey(input, profile);
  return { [key]: input[key] * multiplier };
}

export function calculateAutoServiceMonth(rawInputs, overrides = {}) {
  return calculateAutoProfileMonth(rawInputs, overrides);
}

export function calculateAutoServiceModel(rawInputs) {
  const input = normalizeAutoServiceInputs(rawInputs);
  const current = calculateAutoProfileMonth(input);
  const key = driverKey(input, current.profile);
  const currentDriver = input[key];
  const max = key === "monthlyJobs" ? Math.max(100000, currentDriver * 100 + 100) : Math.max(10000, currentDriver * 100 + 100);
  const breakevenDriverRaw = solveBreakeven({
    min: 0,
    max,
    tolerance: 0.0001,
    evaluate: (value) => calculateAutoProfileMonth(input, { [key]: value }).netProfit,
  });
  const breakevenDriver = breakevenDriverRaw == null ? null : breakevenDriverRaw;
  const breakevenResult = breakevenDriver == null ? null : calculateAutoProfileMonth(input, { [key]: breakevenDriver });
  const breakevenDailyVehicles = breakevenResult == null ? null : breakevenResult.monthlyVehicles / input.openDays;
  const breakevenCapacityUtilization = breakevenResult == null ? null : breakevenResult.capacityUtilization;
  const breakevenRevenue = breakevenResult?.grossRevenue ?? null;

  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash,
    financingAmount: input.financingAmount,
    supportAmount: input.supportAmount,
    setupCost: current.totalSetupCost,
    setupPaymentMonth: input.setupPaymentMonth,
    collectionDelayDays: input.collectionDelayDays,
    supplierPaymentDelayDays: current.supplierMetrics.paymentDelayDays,
    firstMonthSalesShare: input.firstMonthSalesShare,
    monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment,
    evaluateMonth: (growthMultiplier) => calculateAutoProfileMonth(input, growthOverride(input, current.profile, growthMultiplier)),
  });

  cashFlow.rows = cashFlow.rows.map((row, index) => {
    const multiplier = Math.pow(1 + input.monthlyGrowthRate, index) * (index === 0 ? input.firstMonthSalesShare : 1);
    const month = calculateAutoProfileMonth(input, growthOverride(input, current.profile, multiplier));
    return {
      ...row,
      completedJobs: month.monthlyVehicles,
      unmetJobs: month.unmetDailyJobs * input.openDays,
      subcontractJobs: month.subcontractMetrics.jobs,
      partsInventory: input.currentPartsInventoryCost,
    };
  });

  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.operatingCashProfit > 0 ? current.totalSetupCost / current.operatingCashProfit : null;
  const equipmentPaybackMonths = input.equipmentInvestment > 0 && current.operatingCashProfit > 0
    ? input.equipmentInvestment / current.operatingCashProfit : null;
  const warnings = buildAutoServiceWarnings({ current, cashFlow, breakevenCapacityUtilization, input });

  return {
    ...current,
    breakevenDriverKey: key,
    breakevenDriver,
    breakevenDailyVehicles,
    breakevenCapacityUtilization,
    breakevenRevenue,
    cashFlow,
    annualNetProfit,
    roi,
    paybackMonths,
    equipmentPaybackMonths,
    warnings,
    waterfall: buildWaterfall(current, {
      labels: {
        gross: "Brüt hizmet, parça ve taşeron geliri",
        loss: "İptal / kapasite kaybı",
        commission: "POS komisyonu",
        variable: "Sarf, parça, tekrar işçilik ve taşeron",
        fixed: "Sabit gider + amortisman",
        stakeholder: "Ortak / yatırımcı payı",
      },
      grossSubtext: `${current.profile.label} gelir sürücüsü`,
      lossSubtext: `${current.unmetDailyJobs.toFixed(1)} karşılanamayan günlük iş`,
      commissionSubtext: "Kartlı satışlara uygulanan ödeme kesintisi",
      variableSubtext: "Sarf, enerji, parça, yol, tekrar işçilik ve dış hizmet",
      fixedSubtext: "Personel, kira, bakım, pazarlama ve amortisman",
      stakeholderSubtext: "Pozitif vergi öncesi kârdan",
    }),
  };
}

export function calculateAutoServiceScenarioComparison(baseOrScenarioInputs) {
  const scenarioMap = baseOrScenarioInputs
    && Object.keys(AUTO_SERVICE_SCENARIOS).every((id) => typeof baseOrScenarioInputs[id] === "object");
  return Object.entries(AUTO_SERVICE_SCENARIOS).map(([id, preset]) => {
    const inputs = scenarioMap
      ? normalizeAutoServiceInputs(baseOrScenarioInputs[id])
      : applyAutoServiceScenario(baseOrScenarioInputs, id);
    return { id, label: preset.label, inputs, result: calculateAutoServiceModel(inputs) };
  });
}

export function buildAutoServiceWarnings({ current, cashFlow, breakevenCapacityUtilization, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda oto hizmet işletmesi aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "Kurulum, ekipman ve ilk operasyonlar ilk üç ayda nakit açığı oluşturuyor.");
  if (current.capacityUtilization > 0.98) add("capacity_tight", "soft", "Etkin hizmet kapasitesi neredeyse tamamen dolu; gecikme ve kalite riski oluşabilir.");
  else if (current.capacityUtilization < 0.35) add("capacity_low", "soft", "Hizmet kapasitesinin büyük bölümü boş kalıyor.");
  if (current.unmetDailyJobs > 0.5) add("unmet_demand", "hard", "Talebin bir bölümü istasyon veya personel kapasitesi nedeniyle karşılanamıyor.");
  if (Number.isFinite(current.staffDailyCapacity) && current.staffDailyCapacity < current.stationDailyCapacity) add("staff_bottleneck", "soft", "Personel üretken kapasitesi fiziksel istasyon kapasitesinin altında.");
  if (current.demandMetrics.noShowRate > 0.15) add("no_show", "soft", "Randevuya gelmeme ve iptal oranı %15'in üzerinde.");
  if (current.serviceMetrics.reworkRate > 0.10) add("rework", "hard", "Tekrar işçilik oranı %10'un üzerinde; kapasite ve malzeme maliyeti aşınıyor.");
  if (input.customerBaseDemandEnabled && input.monthlyRepeatVisitRate < 0.08) add("repeat_visit", "soft", "Aylık tekrar ziyaret oranı düşük; müşteri tutma planı gözden geçirilmeli.");
  if (current.inventoryPlanningEnabled && current.workingCapitalGap > 0) add("inventory_gap", "soft", "Hedef parça/sarf stoğu için ek işletme sermayesi gerekiyor.");
  if (current.stockCoverageDays != null && current.stockCoverageDays < current.supplierMetrics.leadTimeDays + input.safetyStockDays) add("stock_shortage", "hard", "Stok kapsamı tedarik süresi ve güvenlik stoğunun altında.");
  if (current.subcontractMargin != null && current.subcontractMargin < 0.10) add("subcontract_margin", "soft", "Taşeron işlerinde net katkı marjı %10'un altında.");
  if (current.staffCostRatio > 0.55) add("staff_cost_hard", "hard", "Personel maliyeti KDV sonrası gelirin %55'ini aşıyor.");
  else if (current.staffCostRatio > 0.42) add("staff_cost_soft", "soft", "Personel maliyeti gelire göre yüksek görünüyor.");
  if (current.rentToRevenue > 0.20) add("rent_hard", "hard", "Kira KDV sonrası gelirin %20'sini aşıyor.");
  if (current.consumableAndEnergyRatio > 0.30) add("consumables_hard", "hard", "Sarf, enerji, yol ve tekrar işçilik yükü gelirin %30'unu aşıyor.");
  if (breakevenCapacityUtilization == null || breakevenCapacityUtilization > 1) add("breakeven_impossible", "hard", "Mevcut fiyat ve maliyetlerle etkin kapasite içinde başabaş oluşmuyor.");
  else if (breakevenCapacityUtilization > 0.85) add("breakeven_high", "soft", "Başabaş için etkin kapasitenin %85'inden fazlası gerekiyor.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük maliyet artışları sonucu zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir oto hizmetleri uyarısı oluşmadı.");
  return warnings;
}
