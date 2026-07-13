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

export function sumValues(values) {
  return values.reduce((total, value) => total + nonNegative(value), 0);
}

export function calcTaxSplit({ grossRevenue, taxType = "included", taxRate = 0 }) {
  const gross = nonNegative(grossRevenue);
  const rate = clampRate(taxRate);
  if (taxType === "excluded") return { customerPayment: gross * (1 + rate), taxAmount: gross * rate, netBase: gross };
  if (taxType === "none") return { customerPayment: gross, taxAmount: 0, netBase: gross };
  const taxAmount = rate > 0 ? (gross * rate) / (1 + rate) : 0;
  return { customerPayment: gross, taxAmount, netBase: gross - taxAmount };
}

export function calcCommission(base, rate) {
  return nonNegative(base) * clampRate(rate);
}

export function stakeholderBasisAmount(basis, values) {
  const bases = {
    gross_revenue: values.grossRevenue,
    net_revenue_after_commission: values.revenueAfterCommission,
    contribution_after_variable_cost: values.contribution,
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

export function buildWaterfall(result) {
  return [
    { name: "Brüt ciro", amount: result.grossRevenue, kind: "keep", subtext: "Müşteri harcaması" },
    { name: "KDV ayrımı", amount: -result.taxAmount, kind: "cut", subtext: result.taxTypeLabel },
    { name: "İptal / kayıp", amount: -result.lostSalesAmount, kind: "cut", subtext: "Gerçekleşmeyen satış" },
    { name: "Komisyonlar", amount: -result.totalCommissions, kind: "cut", subtext: "Platform ve POS" },
    { name: "Değişken maliyet", amount: -result.totalVariableCosts, kind: "cut", subtext: "Malzeme, fire, paketleme" },
    { name: "Sabit gider", amount: -result.totalFixedCosts, kind: "cut", subtext: "Aylık sabit giderler" },
    { name: "Paydaş ödemesi", amount: -result.totalStakeholderPayouts, kind: "stakeholder", subtext: "Franchise ve ortak" },
    { name: "Vergi ön tahmini", amount: -result.estimatedTax, kind: "cut", subtext: "Pozitif kâr üzerinden" },
    { name: "Net kâr", amount: result.netProfit, kind: "total", subtext: "Aylık tahmini sonuç" },
  ];
}

export function calculateCashFlow({ months = 12, startingCash = 0, financingAmount = 0, setupCost = 0, collectionDelayDays = 0, monthlyGrowthRate = 0, loanPayment = 0, evaluateMonth }) {
  const delayRatio = Math.min(1, nonNegative(collectionDelayDays) / 30);
  const growthRate = Math.max(-0.95, finiteNumber(monthlyGrowthRate, 0));
  let cash = nonNegative(startingCash) + nonNegative(financingAmount) - nonNegative(setupCost);
  let previousCollectible = 0;
  const rows = [];
  for (let month = 1; month <= months; month += 1) {
    const result = evaluateMonth(Math.pow(1 + growthRate, month - 1));
    const currentCollectible = result.revenueAfterCommission;
    const collections = currentCollectible * (1 - delayRatio) + previousCollectible * delayRatio;
    const setupCosts = month === 1 ? nonNegative(setupCost) : 0;
    const financing = month === 1 ? nonNegative(financingAmount) : 0;
    const operatingExpenses = result.totalVariableCosts + result.totalFixedCosts + result.estimatedTax;
    const stakeholderPayouts = result.totalStakeholderPayouts;
    const monthlyLoanPayment = nonNegative(loanPayment);
    const cashStart = month === 1 ? nonNegative(startingCash) : rows[rows.length - 1].cashEnd;
    if (month === 1) cash = cashStart + financing - setupCosts;
    cash += collections - operatingExpenses - stakeholderPayouts - monthlyLoanPayment;
    rows.push({ month, cashStart, collections, financing, setupCosts, variableCosts: result.totalVariableCosts, fixedCosts: result.totalFixedCosts, stakeholderPayouts, estimatedTax: result.estimatedTax, loanPayment: monthlyLoanPayment, cashEnd: cash });
    previousCollectible = currentCollectible;
  }
  const firstThree = rows.slice(0, 3).map((row) => row.cashEnd);
  return {
    rows,
    endingCash: rows.at(-1)?.cashEnd ?? nonNegative(startingCash),
    minimumCash: rows.length ? Math.min(...rows.map((row) => row.cashEnd)) : nonNegative(startingCash),
    cashGapFirstThreeMonths: firstThree.length ? Math.min(...firstThree) : nonNegative(startingCash),
  };
}

export function percent(numerator, denominator) {
  return Math.abs(denominator) < EPSILON ? 0 : numerator / denominator;
}
