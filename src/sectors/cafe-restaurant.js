import {
  buildWaterfall,
  calcCommission,
  calcTaxSplit,
  calculateCashFlow,
  clampRate,
  nonNegative,
  percent,
  solveBreakeven,
  stakeholderBasisAmount,
  sumValues,
} from "../core/finance-engine.js";

export const BUSINESS_TYPES = [
  ["cafe", "Kafe"], ["restaurant", "Restoran"], ["coffee_shop", "Kahveci"],
  ["coffee_kiosk", "Kahve kiosk"], ["pastry_shop", "Tatlıcı / pastane"],
  ["burger_shop", "Burgerci"], ["doner_shop", "Dönerci"], ["buffet", "Tostçu / büfe"],
  ["dark_kitchen", "Dark kitchen"], ["food_truck", "Food truck"],
  ["franchise_restaurant", "Franchise restoran"],
];

export const DEFAULT_INPUTS = {
  businessType: "cafe", dailyCustomers: 120, averageTicket: 240, openDays: 30,
  serviceCapacity: 180, deliverySalesShare: 0.25, cardSalesShare: 0.85,
  lostSalesRate: 0.01, taxType: "included", vatRate: 0.10,
  deliveryCommissionRate: 0.30, posCommissionRate: 0.025,
  materialCostRate: 0.30, wasteRate: 0.05, packagingCostPerDeliveryOrder: 8,
  otherVariableCostRate: 0.01, rent: 120000, staffCost: 260000, utilities: 45000,
  accounting: 10000, software: 5000, cleaning: 12000, maintenance: 8000,
  insurance: 4000, otherFixedExpenses: 15000, loanPayment: 0,
  renovation: 500000, equipment: 850000, furniture: 250000, deposit: 240000,
  initialStock: 100000, licenseFees: 50000, openingMarketing: 75000, softwareSetup: 25000,
  franchiseRoyaltyRate: 0, franchiseRoyaltyBasis: "net_revenue_after_commission",
  partnerProfitShareRate: 0, estimatedTaxRate: 0.25, startingCash: 2500000,
  financingAmount: 0, collectionDelayDays: 2, monthlyGrowthRate: 0.02,
};

export const SCENARIO_PRESETS = {
  pessimistic: { label: "Kötümser", multipliers: { dailyCustomers: 0.72, averageTicket: 0.94, materialCostRate: 1.12, wasteRate: 1.25, utilities: 1.10 } },
  expected: { label: "Beklenen", multipliers: {} },
  optimistic: { label: "İyimser", multipliers: { dailyCustomers: 1.28, averageTicket: 1.06, materialCostRate: 0.94, wasteRate: 0.80, utilities: 1.05 } },
};

export function normalizeCafeInputs(raw = {}) {
  const input = { ...DEFAULT_INPUTS, ...raw };
  const rateKeys = ["deliverySalesShare", "cardSalesShare", "lostSalesRate", "vatRate", "deliveryCommissionRate", "posCommissionRate", "materialCostRate", "wasteRate", "otherVariableCostRate", "franchiseRoyaltyRate", "partnerProfitShareRate", "estimatedTaxRate"];
  for (const key of rateKeys) input[key] = clampRate(input[key]);
  const numberKeys = Object.keys(DEFAULT_INPUTS).filter((key) => typeof DEFAULT_INPUTS[key] === "number" && !rateKeys.includes(key) && key !== "monthlyGrowthRate");
  for (const key of numberKeys) input[key] = nonNegative(input[key]);
  input.monthlyGrowthRate = Math.max(-0.95, Number(input.monthlyGrowthRate) || 0);
  input.openDays = Math.min(31, input.openDays);
  input.taxType = ["included", "excluded", "none"].includes(input.taxType) ? input.taxType : "included";
  return input;
}

export function applyScenario(baseInputs, scenarioId) {
  const normalized = normalizeCafeInputs(baseInputs);
  const preset = SCENARIO_PRESETS[scenarioId] ?? SCENARIO_PRESETS.expected;
  const next = { ...normalized };
  for (const [key, multiplier] of Object.entries(preset.multipliers)) next[key] = normalized[key] * multiplier;
  return normalizeCafeInputs(next);
}

export function calculateCafeMonth(rawInputs, overrides = {}) {
  const input = normalizeCafeInputs({ ...rawInputs, ...overrides });
  const grossRevenue = input.dailyCustomers * input.averageTicket * input.openDays;
  const tax = calcTaxSplit({ grossRevenue, taxType: input.taxType, taxRate: input.vatRate });
  const lostSalesAmount = tax.netBase * input.lostSalesRate;
  const adjustedRevenue = tax.netBase - lostSalesAmount;
  const deliveryRevenue = adjustedRevenue * input.deliverySalesShare;
  const dineInRevenue = adjustedRevenue - deliveryRevenue;
  const deliveryCommission = calcCommission(deliveryRevenue, input.deliveryCommissionRate);
  const posCommission = calcCommission(adjustedRevenue * input.cardSalesShare, input.posCommissionRate);
  const totalCommissions = deliveryCommission + posCommission;
  const revenueAfterCommission = adjustedRevenue - totalCommissions;
  const materialCost = adjustedRevenue * input.materialCostRate;
  const wasteCost = materialCost * input.wasteRate;
  const monthlyCustomers = input.dailyCustomers * input.openDays;
  const deliveryOrders = monthlyCustomers * input.deliverySalesShare;
  const packagingCost = deliveryOrders * input.packagingCostPerDeliveryOrder;
  const otherVariableCost = adjustedRevenue * input.otherVariableCostRate;
  const totalVariableCosts = materialCost + wasteCost + packagingCost + otherVariableCost;
  const contribution = revenueAfterCommission - totalVariableCosts;
  const fixedCostItems = { rent: input.rent, staffCost: input.staffCost, utilities: input.utilities, accounting: input.accounting, software: input.software, cleaning: input.cleaning, maintenance: input.maintenance, insurance: input.insurance, otherFixedExpenses: input.otherFixedExpenses };
  const totalFixedCosts = sumValues(Object.values(fixedCostItems));
  const basisValues = { grossRevenue, revenueAfterCommission, contribution, preTaxBeforePartner: contribution - totalFixedCosts };
  const royaltyBasis = stakeholderBasisAmount(input.franchiseRoyaltyBasis, basisValues);
  const franchiseRoyalty = royaltyBasis * input.franchiseRoyaltyRate;
  const preTaxBeforePartner = contribution - totalFixedCosts - franchiseRoyalty;
  const partnerPayout = Math.max(0, preTaxBeforePartner) * input.partnerProfitShareRate;
  const totalStakeholderPayouts = franchiseRoyalty + partnerPayout;
  const preTaxProfit = preTaxBeforePartner - partnerPayout;
  const estimatedTax = Math.max(0, preTaxProfit) * input.estimatedTaxRate;
  const netProfit = preTaxProfit - estimatedTax;
  const setupCostItems = { renovation: input.renovation, equipment: input.equipment, furniture: input.furniture, deposit: input.deposit, initialStock: input.initialStock, licenseFees: input.licenseFees, openingMarketing: input.openingMarketing, softwareSetup: input.softwareSetup };
  const totalSetupCost = sumValues(Object.values(setupCostItems));
  return {
    input, grossRevenue, customerPayment: tax.customerPayment, taxAmount: tax.taxAmount,
    taxTypeLabel: input.taxType === "included" ? "Fiyata dahil KDV" : input.taxType === "excluded" ? "Fiyat üstü KDV" : "Vergi yok",
    netSalesBeforeLoss: tax.netBase, lostSalesAmount, adjustedRevenue, deliveryRevenue, dineInRevenue,
    deliveryCommission, posCommission, totalCommissions, revenueAfterCommission,
    materialCost, wasteCost, packagingCost, otherVariableCost, totalVariableCosts, contribution,
    fixedCostItems, totalFixedCosts, royaltyBasis, franchiseRoyalty, partnerPayout,
    totalStakeholderPayouts, preTaxBeforePartner, preTaxProfit, estimatedTax, netProfit,
    setupCostItems, totalSetupCost, monthlyCustomers, deliveryOrders, grossProfit: contribution,
    profitMargin: percent(netProfit, tax.netBase), rentToRevenue: percent(input.rent, tax.netBase),
    foodCostRate: percent(materialCost + wasteCost, adjustedRevenue),
    commissionLoad: percent(totalCommissions, adjustedRevenue), unitNetProfit: percent(netProfit, monthlyCustomers),
  };
}

export function calculateCafeModel(rawInputs) {
  const input = normalizeCafeInputs(rawInputs);
  const current = calculateCafeMonth(input);
  const breakevenDailyCustomers = solveBreakeven({ min: 0, max: Math.max(10000, input.serviceCapacity * 20), evaluate: (dailyCustomers) => calculateCafeMonth(input, { dailyCustomers }).netProfit });
  const breakevenRevenue = breakevenDailyCustomers == null ? null : breakevenDailyCustomers * input.averageTicket * input.openDays;
  const cashFlow = calculateCashFlow({
    startingCash: input.startingCash, financingAmount: input.financingAmount, setupCost: current.totalSetupCost,
    collectionDelayDays: input.collectionDelayDays, monthlyGrowthRate: input.monthlyGrowthRate,
    loanPayment: input.loanPayment, evaluateMonth: (growthMultiplier) => calculateCafeMonth(input, { dailyCustomers: input.dailyCustomers * growthMultiplier }),
  });
  const annualNetProfit = current.netProfit * 12;
  const roi = current.totalSetupCost > 0 ? annualNetProfit / current.totalSetupCost : null;
  const paybackMonths = current.netProfit > 0 ? current.totalSetupCost / current.netProfit : null;
  const warnings = buildCafeWarnings({ current, cashFlow, breakevenDailyCustomers, input });
  return { ...current, breakevenDailyCustomers, breakevenRevenue, cashFlow, annualNetProfit, roi, paybackMonths, warnings, waterfall: buildWaterfall(current) };
}

export function calculateScenarioComparison(baseInputs) {
  return Object.entries(SCENARIO_PRESETS).map(([id, preset]) => {
    const inputs = applyScenario(baseInputs, id);
    return { id, label: preset.label, inputs, result: calculateCafeModel(inputs) };
  });
}

export function buildCafeWarnings({ current, cashFlow, breakevenDailyCustomers, input }) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (current.netProfit < 0) add("negative_profit", "hard", "Bu varsayımlarda işletme aylık zarar ediyor.");
  if (cashFlow.cashGapFirstThreeMonths < 0) add("cash_gap", "hard", "İlk 3 ay içinde nakit eksiye düşüyor; ek işletme sermayesi gerekebilir.");
  if (current.rentToRevenue > 0.20) add("rent_hard", "hard", "Kira/ciro oranı %20'nin üzerinde.");
  else if (current.rentToRevenue > 0.15) add("rent_soft", "soft", "Kira/ciro oranı yüksek görünüyor.");
  if (current.foodCostRate > 0.40) add("food_cost_hard", "hard", "Malzeme ve fire toplamı net satışın %40'ını aşıyor.");
  else if (current.foodCostRate > 0.35) add("food_cost_soft", "soft", "Malzeme maliyeti oranı dikkat gerektiriyor.");
  if (current.commissionLoad > 0.10) add("commission", "soft", "Platform ve POS komisyon yükü satışların %10'unu aşıyor.");
  if (breakevenDailyCustomers != null && input.serviceCapacity > 0 && breakevenDailyCustomers > input.serviceCapacity) add("capacity", "hard", "Günlük başabaş müşteri sayısı girilen servis kapasitesinin üzerinde.");
  if (current.profitMargin >= 0 && current.profitMargin < 0.05) add("low_margin", "soft", "Net kâr marjı %5'in altında; küçük sapmalar zarara çevirebilir.");
  if (!warnings.length) add("healthy", "info", "Temel eşiklerde kritik bir finansal uyarı oluşmadı.");
  return warnings;
}
