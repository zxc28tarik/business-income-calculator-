const EPSILON = 1e-9;

export function finiteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function nonNegative(value, fallback = 0) {
  return Math.max(0, finiteNumber(value, fallback));
}

export function clampRate(value, fallback = 0) {
  return Math.min(1, Math.max(0, finiteNumber(value, fallback)));
}

export function clampInteger(value, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = min) {
  return Math.min(max, Math.max(min, Math.round(finiteNumber(value, fallback))));
}

export function sumValues(values) {
  return values.reduce((total, value) => total + nonNegative(value), 0);
}

export function calcTaxSplit({ grossRevenue, taxType = "included", taxRate = 0 }) {
  const gross = nonNegative(grossRevenue);
  const rate = clampRate(taxRate);

  if (taxType === "excluded") {
    return {
      customerPayment: gross * (1 + rate),
      taxAmount: gross * rate,
      netBase: gross,
    };
  }

  if (taxType === "none") {
    return { customerPayment: gross, taxAmount: 0, netBase: gross };
  }

  const taxAmount = rate > 0 ? (gross * rate) / (1 + rate) : 0;
  return {
    customerPayment: gross,
    taxAmount,
    netBase: gross - taxAmount,
  };
}

export function calcCommission(base, rate) {
  return nonNegative(base) * clampRate(rate);
}

export function stakeholderBasisAmount(basis, values) {
  const bases = {
    gross_revenue: values.grossRevenue,
    net_revenue_after_commission: values.revenueAfterCommission,
    contribution_after_variable_cost: values.contribution,
    fixed_cost_after_profit: values.preTaxBeforePartner,
    pre_tax_profit: values.preTaxBeforePartner,
  };
  return Math.max(0, finiteNumber(bases[basis], 0));
}

export function solveBreakeven({ evaluate, min = 0, max = 100000, tolerance = 0.01, iterations = 80 }) {
  if (evaluate(min) >= 0) return min;
  if (evaluate(max) < 0) return null;

  let low = min;
  let high = max;
  for (let index = 0; index < iterations && high - low > tolerance; index += 1) {
    const midpoint = (low + high) / 2;
    if (evaluate(midpoint) >= 0) high = midpoint;
    else low = midpoint;
  }
  return high;
}

export function buildWaterfall(result, overrides = {}) {
  const labels = {
    gross: "Brüt ciro",
    tax: "Vergi ayrımı",
    loss: "İade / kayıp",
    commission: "Komisyonlar",
    variable: "Değişken maliyet",
    fixed: "Sabit gider",
    stakeholder: "Paydaş ödemesi",
    estimatedTax: "Vergi ön tahmini",
    net: "Net kâr",
    ...overrides.labels,
  };

  return [
    { name: labels.gross, amount: result.grossRevenue, kind: "keep", subtext: overrides.grossSubtext ?? "Müşteri harcaması" },
    { name: labels.tax, amount: -result.taxAmount, kind: "cut", subtext: result.taxTypeLabel },
    { name: labels.loss, amount: -result.lostSalesAmount, kind: "cut", subtext: overrides.lossSubtext ?? "Gerçekleşmeyen satış" },
    { name: labels.commission, amount: -result.totalCommissions, kind: "cut", subtext: overrides.commissionSubtext ?? "Platform ve ödeme" },
    { name: labels.variable, amount: -result.totalVariableCosts, kind: "cut", subtext: overrides.variableSubtext ?? "Satışa bağlı maliyetler" },
    { name: labels.fixed, amount: -result.totalFixedCosts, kind: "cut", subtext: overrides.fixedSubtext ?? "Aylık sabit giderler" },
    { name: labels.stakeholder, amount: -result.totalStakeholderPayouts, kind: "stakeholder", subtext: overrides.stakeholderSubtext ?? "Ortak ve lisans payları" },
    { name: labels.estimatedTax, amount: -result.estimatedTax, kind: "cut", subtext: "Pozitif kâr üzerinden" },
    { name: labels.net, amount: result.netProfit, kind: "total", subtext: "Aylık tahmini sonuç" },
  ];
}

/**
 * 12 aylık nakit akışı.
 *
 * Finansman ve destek nakit girişidir; evaluateMonth tarafından hesaplanan P&L sonucuna eklenmez.
 * Tahsilat ve tedarikçi vadesi prototipte en fazla bir aylık kaydırma olarak modellenir.
 */
export function calculateCashFlow({
  months = 12,
  startingCash = 0,
  financingAmount = 0,
  supportAmount = 0,
  setupCost = 0,
  setupPaymentMonth = 1,
  collectionDelayDays = 0,
  supplierPaymentDelayDays = 0,
  firstMonthSalesShare = 1,
  monthlyGrowthRate = 0,
  loanPayment = 0,
  evaluateMonth,
}) {
  const monthCount = clampInteger(months, 1, 120, 12);
  const collectionDelayRatio = Math.min(1, nonNegative(collectionDelayDays) / 30);
  const supplierDelayRatio = Math.min(1, nonNegative(supplierPaymentDelayDays) / 30);
  const growthRate = Math.max(-0.95, finiteNumber(monthlyGrowthRate, 0));
  const firstMonthMultiplier = clampRate(firstMonthSalesShare, 1);
  const setupMonth = clampInteger(setupPaymentMonth, 1, monthCount, 1);

  let cash = nonNegative(startingCash);
  let previousCollectible = 0;
  let previousVariableCosts = 0;
  const rows = [];

  for (let month = 1; month <= monthCount; month += 1) {
    const growthMultiplier = Math.pow(1 + growthRate, month - 1) * (month === 1 ? firstMonthMultiplier : 1);
    const result = evaluateMonth(growthMultiplier);
    const currentCollectible = nonNegative(result.revenueAfterCommission);
    const collections = currentCollectible * (1 - collectionDelayRatio) + previousCollectible * collectionDelayRatio;

    const currentVariableCosts = nonNegative(result.cashVariableCosts ?? result.totalVariableCosts);
    const variableCostsPaid = currentVariableCosts * (1 - supplierDelayRatio) + previousVariableCosts * supplierDelayRatio;
    const fixedCostsPaid = nonNegative(result.totalFixedCosts);
    const estimatedTaxPaid = nonNegative(result.estimatedTax);
    const stakeholderPayouts = nonNegative(result.totalStakeholderPayouts);
    const monthlyLoanPayment = nonNegative(loanPayment);
    const setupCosts = month === setupMonth ? nonNegative(setupCost) : 0;
    const financing = month === 1 ? nonNegative(financingAmount) : 0;
    const support = month === 1 ? nonNegative(supportAmount) : 0;
    const cashStart = cash;

    cash += collections + financing + support
      - setupCosts
      - variableCostsPaid
      - fixedCostsPaid
      - estimatedTaxPaid
      - stakeholderPayouts
      - monthlyLoanPayment;

    rows.push({
      month,
      cashStart,
      collections,
      financing,
      support,
      setupCosts,
      variableCostsAccrued: currentVariableCosts,
      variableCostsPaid,
      fixedCosts: fixedCostsPaid,
      stakeholderPayouts,
      estimatedTax: estimatedTaxPaid,
      loanPayment: monthlyLoanPayment,
      cashEnd: cash,
    });

    previousCollectible = currentCollectible;
    previousVariableCosts = currentVariableCosts;
  }

  const firstThree = rows.slice(0, 3).map((row) => row.cashEnd);
  const firstNegativeMonth = rows.find((row) => row.cashEnd < 0)?.month ?? null;
  return {
    rows,
    endingCash: rows.at(-1)?.cashEnd ?? nonNegative(startingCash),
    minimumCash: rows.length ? Math.min(...rows.map((row) => row.cashEnd)) : nonNegative(startingCash),
    cashGapFirstThreeMonths: firstThree.length ? Math.min(...firstThree) : nonNegative(startingCash),
    firstNegativeMonth,
  };
}

export function percent(numerator, denominator) {
  return Math.abs(denominator) < EPSILON ? 0 : numerator / denominator;
}

export function findLargestExpense(items) {
  return Object.entries(items).reduce(
    (largest, [key, amount]) => nonNegative(amount) > largest.amount ? { key, amount: nonNegative(amount) } : largest,
    { key: null, amount: 0 },
  );
}
