const OPTIONAL_NUMBER_FIELDS = [
  "collections",
  "variableCosts",
  "fixedCosts",
  "stakeholderPayouts",
  "estimatedTax",
  "financing",
  "support",
  "setupCosts",
  "loanPayment",
  "cashEnd",
  "volume",
];

export const TRACKING_REASON_OPTIONS = [
  ["", "Neden seçilmedi"],
  ["volume", "Satış / işlem hacmi"],
  ["price", "Fiyat / sepet / birim gelir"],
  ["commission", "Komisyon / kanal kesintisi"],
  ["material", "Ürün / malzeme / sarf maliyeti"],
  ["personnel", "Personel ve kapasite"],
  ["fixed_cost", "Sabit gider değişimi"],
  ["tax", "Vergi / yasal ödeme"],
  ["collection_delay", "Tahsilat gecikmesi"],
  ["seasonality", "Mevsimsellik / dönem etkisi"],
  ["one_off", "Tek seferlik olay"],
  ["other", "Diğer"],
];

const VALID_REASONS = new Set(TRACKING_REASON_OPTIONS.map(([value]) => value));

function optionalNumber(value, { allowNegative = false } = {}) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return allowNegative ? parsed : Math.max(0, parsed);
}

function sumKnown(values) {
  return values.reduce((total, value) => total + (value ?? 0), 0);
}

function percentVariance(variance, plan) {
  if (variance == null || !Number.isFinite(plan)) return null;
  if (Math.abs(plan) < 1e-9) return Math.abs(variance) < 1e-9 ? 0 : null;
  return variance / Math.abs(plan);
}

function statusFromVariance(rate) {
  if (rate == null) return "missing";
  if (rate >= -0.05) return "on_track";
  if (rate >= -0.15) return "watch";
  return "off_track";
}

function summarizeTrend(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length < 2) return { direction: "insufficient", change: null, rate: null };
  const first = clean[0];
  const last = clean.at(-1);
  const change = last - first;
  const rate = Math.abs(first) > 1e-9 ? change / Math.abs(first) : null;
  const direction = Math.abs(change) < 1e-9 ? "flat" : change > 0 ? "up" : "down";
  return { direction, change, rate };
}

export function resolveTrackingScope(inputs = {}) {
  const value = inputs.businessType ?? inputs.profileType ?? inputs.businessProfile ?? "default";
  return String(value || "default").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
}

export function normalizeTrackingRecord(raw = {}) {
  const month = Math.min(120, Math.max(1, Math.round(Number(raw.month) || 1)));
  const record = {
    month,
    period: String(raw.period ?? "").trim().slice(0, 20),
    reason: VALID_REASONS.has(raw.reason) ? raw.reason : "",
    note: String(raw.note ?? "").trim().slice(0, 500),
  };
  for (const key of OPTIONAL_NUMBER_FIELDS) {
    record[key] = optionalNumber(raw[key], { allowNegative: key === "cashEnd" });
  }
  return record;
}

export function normalizeTrackingRecords(records = []) {
  const byMonth = new Map();
  for (const raw of Array.isArray(records) ? records : []) {
    const record = normalizeTrackingRecord(raw);
    byMonth.set(record.month, record);
  }
  return [...byMonth.values()].sort((a, b) => a.month - b.month).slice(0, 120);
}

export function hasTrackingData(record) {
  return OPTIONAL_NUMBER_FIELDS.some((key) => record?.[key] != null)
    || Boolean(record?.period || record?.reason || record?.note);
}

function buildForecast(row = {}) {
  const variableCosts = Number(row.variableCostsPaid ?? row.variableCostsAccrued ?? 0) || 0;
  const fixedCosts = Number(row.fixedCosts ?? row.publisherCostTry ?? 0) || 0;
  const stakeholderPayouts = Number(row.stakeholderPayouts ?? row.developerOutflowTry ?? 0) || 0;
  const estimatedTax = Number(row.estimatedTax ?? 0) || 0;
  const collections = Number(row.collections ?? row.receiptTry ?? 0) || 0;
  const financing = Number(row.financing ?? 0) || 0;
  const support = Number(row.support ?? 0) || 0;
  const setupCosts = Number(row.setupCosts ?? 0) || 0;
  const loanPayment = Number(row.loanPayment ?? 0) || 0;
  const cashStart = Number(row.cashStart ?? 0) || 0;
  const cashEnd = Number(row.cashEnd ?? row.cashTry ?? 0) || 0;
  const operatingResult = collections - variableCosts - fixedCosts - stakeholderPayouts - estimatedTax;
  const netCashMovement = collections + financing + support
    - variableCosts - fixedCosts - stakeholderPayouts - estimatedTax - setupCosts - loanPayment;
  return {
    month: Number(row.month) || 0,
    collections,
    variableCosts,
    fixedCosts,
    stakeholderPayouts,
    estimatedTax,
    financing,
    support,
    setupCosts,
    loanPayment,
    cashStart,
    cashEnd,
    operatingResult,
    netCashMovement,
  };
}

function buildActual(record) {
  if (!record || !hasTrackingData(record)) return null;
  const coreComplete = [record.collections, record.variableCosts, record.fixedCosts]
    .every((value) => value != null);
  const operatingResult = coreComplete
    ? record.collections - record.variableCosts - record.fixedCosts
      - (record.stakeholderPayouts ?? 0) - (record.estimatedTax ?? 0)
    : null;
  const netCashMovement = coreComplete
    ? operatingResult + (record.financing ?? 0) + (record.support ?? 0)
      - (record.setupCosts ?? 0) - (record.loanPayment ?? 0)
    : null;
  return { ...record, coreComplete, operatingResult, netCashMovement };
}

function buildRow(forecastRow, actualRecord) {
  const plan = buildForecast(forecastRow);
  const actual = buildActual(actualRecord);
  const variance = {
    collections: actual?.collections == null ? null : actual.collections - plan.collections,
    variableCosts: actual?.variableCosts == null ? null : plan.variableCosts - actual.variableCosts,
    fixedCosts: actual?.fixedCosts == null ? null : plan.fixedCosts - actual.fixedCosts,
    operatingResult: actual?.operatingResult == null ? null : actual.operatingResult - plan.operatingResult,
    netCashMovement: actual?.netCashMovement == null ? null : actual.netCashMovement - plan.netCashMovement,
    cashEnd: actual?.cashEnd == null ? null : actual.cashEnd - plan.cashEnd,
    volume: actual?.volume == null ? null : actual.volume,
  };
  const varianceRates = {
    collections: percentVariance(variance.collections, plan.collections),
    variableCosts: percentVariance(variance.variableCosts, plan.variableCosts),
    fixedCosts: percentVariance(variance.fixedCosts, plan.fixedCosts),
    operatingResult: percentVariance(variance.operatingResult, plan.operatingResult),
    netCashMovement: percentVariance(variance.netCashMovement, plan.netCashMovement),
    cashEnd: percentVariance(variance.cashEnd, plan.cashEnd),
  };
  const primaryRate = varianceRates.operatingResult ?? varianceRates.collections;
  return {
    month: plan.month,
    label: actual?.period || `Ay ${plan.month}`,
    plan,
    actual,
    variance,
    varianceRates,
    status: actual ? statusFromVariance(primaryRate) : "missing",
  };
}

function resolveForecastRows(result) {
  if (Array.isArray(result?.cashFlow?.rows)) return result.cashFlow.rows;
  if (!Array.isArray(result?.cashFlow?.months)) return [];
  let previousCash = Number(result.cashFlow.startCashTry ?? 0) - Number(result.cashFlow.preLaunchCashNeedTry ?? 0);
  return result.cashFlow.months.map((row) => {
    const adapted = { ...row, cashStart: previousCash };
    previousCash = Number(row.cashTry ?? previousCash);
    return adapted;
  });
}

export function buildTrackingModel({ sector, scenarioId = "expected", result, records = [] }) {
  const normalizedRecords = normalizeTrackingRecords(records);
  const actualByMonth = new Map(normalizedRecords.map((record) => [record.month, record]));
  const forecastRows = resolveForecastRows(result);
  const rows = forecastRows.map((row) => buildRow(row, actualByMonth.get(Number(row.month))));
  const completedRows = rows.filter((row) => row.actual && hasTrackingData(row.actual));
  const completeFinancialRows = completedRows.filter((row) => row.actual.coreComplete);

  const totals = {
    planCollections: sumKnown(completeFinancialRows.map((row) => row.plan.collections)),
    actualCollections: sumKnown(completeFinancialRows.map((row) => row.actual.collections)),
    planOperatingResult: sumKnown(completeFinancialRows.map((row) => row.plan.operatingResult)),
    actualOperatingResult: sumKnown(completeFinancialRows.map((row) => row.actual.operatingResult)),
    planNetCashMovement: sumKnown(completeFinancialRows.map((row) => row.plan.netCashMovement)),
    actualNetCashMovement: sumKnown(completeFinancialRows.map((row) => row.actual.netCashMovement)),
  };
  totals.collectionsVariance = totals.actualCollections - totals.planCollections;
  totals.operatingResultVariance = totals.actualOperatingResult - totals.planOperatingResult;
  totals.netCashMovementVariance = totals.actualNetCashMovement - totals.planNetCashMovement;
  totals.collectionsVarianceRate = percentVariance(totals.collectionsVariance, totals.planCollections);
  totals.operatingResultVarianceRate = percentVariance(totals.operatingResultVariance, totals.planOperatingResult);
  totals.netCashMovementVarianceRate = percentVariance(totals.netCashMovementVariance, totals.planNetCashMovement);

  const lastCompleted = completedRows.at(-1) ?? null;
  const overallRate = totals.operatingResultVarianceRate ?? totals.collectionsVarianceRate;
  const overallStatus = completeFinancialRows.length ? statusFromVariance(overallRate) : "missing";
  const reasonCounts = {};
  for (const row of completedRows) {
    const reason = row.actual.reason || "unspecified";
    reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1;
  }

  return {
    sector: { id: sector?.id ?? "", name: sector?.name ?? "" },
    scenarioId,
    rows,
    completedRows,
    completedMonths: completedRows.length,
    completeFinancialMonths: completeFinancialRows.length,
    totals,
    overallStatus,
    lastCompleted,
    reasonCounts,
    trends: {
      collections: summarizeTrend(completeFinancialRows.map((row) => row.actual.collections)),
      operatingResult: summarizeTrend(completeFinancialRows.map((row) => row.actual.operatingResult)),
      cashEnd: summarizeTrend(completedRows.map((row) => row.actual.cashEnd).filter((value) => value != null)),
      volume: summarizeTrend(completedRows.map((row) => row.actual.volume).filter((value) => value != null)),
    },
  };
}
