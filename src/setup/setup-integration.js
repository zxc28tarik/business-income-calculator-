import { buildDebtServiceSchedule } from "./debt-service.js";

const ACTIVE_FUNDING_STATUSES = new Set(["available", "used"]);
const DEBT_TYPES = new Set(["loan", "supplier_credit"]);

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[;"\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function fundingInflows(funding, maxMonth) {
  const rows = Array.from({ length: maxMonth + 1 }, (_, month) => ({ month, cashInflow: 0 }));
  for (const item of Array.isArray(funding) ? funding : []) {
    if (!ACTIVE_FUNDING_STATUSES.has(item?.status) || DEBT_TYPES.has(item?.type)) continue;
    const month = Math.min(maxMonth, Math.max(0, Math.floor(number(item.availableMonth))));
    rows[month].cashInflow += number(item.amount);
  }
  for (const row of rows) row.cashInflow = roundMoney(row.cashInflow);
  return rows;
}

function hasDetailedSetupCosts(setupResult) {
  return (setupResult?.cashBridge?.summary?.includedItems ?? [])
    .some((item) => number(item.cashAmount) > 0);
}

function hasDetailedFunding(funding) {
  return (Array.isArray(funding) ? funding : [])
    .some((item) => ACTIVE_FUNDING_STATUSES.has(item?.status) && number(item.amount) > 0);
}

export const SETUP_CASH_COLUMNS = Object.freeze([
  { key: "legacyStartupAdjustment", label: "Eski kuruluş düzeltmesi", format: "money" },
  { key: "setupFundingInflow", label: "Kuruluş finansmanı", format: "money" },
  { key: "setupPaymentOutflow", label: "Kuruluş ödemesi", format: "money" },
  { key: "debtPrincipalPayment", label: "Borç anapara", format: "money" },
  { key: "debtInterestPayment", label: "Borç faizi", format: "money" },
  { key: "debtFeePayment", label: "Finansman masrafı", format: "money" },
  { key: "baseCashEnd", label: "Faaliyet sonu", format: "money" },
  { key: "cashEnd", label: "Birleşik dönem sonu", format: "money" },
]);

export function appendSetupCashColumns(baseColumns = []) {
  const replacedKeys = new Set(["cashEnd"]);
  const withoutEnding = (Array.isArray(baseColumns) ? baseColumns : [])
    .filter((column) => !replacedKeys.has(column.key));
  return [...withoutEnding, ...SETUP_CASH_COLUMNS];
}

export function buildIntegratedCashFlow(baseRows = [], setupResult, maxMonth = 12) {
  const monthLimit = Math.min(120, Math.max(0, Math.floor(number(maxMonth) || 12)));
  const baseByMonth = new Map((Array.isArray(baseRows) ? baseRows : []).map((row, index) => [
    Number.isFinite(Number(row?.month)) ? Number(row.month) : index + 1,
    row,
  ]));
  const setupSchedule = setupResult?.paymentSchedule?.rows ?? [];
  const setupByMonth = new Map(setupSchedule.map((row) => [Number(row.month), row]));
  const funding = setupResult?.workspace?.funding ?? [];
  const replaceLegacySetup = hasDetailedSetupCosts(setupResult);
  const replaceLegacyFunding = hasDetailedFunding(funding);
  const nonDebtFunding = fundingInflows(funding, monthLimit);
  const debt = buildDebtServiceSchedule(funding, monthLimit);
  const debtByMonth = new Map(debt.rows.map((row) => [row.month, row]));
  const rows = [];
  let cumulativeSetupCash = 0;
  let totalLegacySetupCostsRemoved = 0;
  let totalLegacyFinancingRemoved = 0;

  for (let month = 0; month <= monthLimit; month += 1) {
    const base = baseByMonth.get(month) ?? {};
    const setup = setupByMonth.get(month) ?? {};
    const debtRow = debtByMonth.get(month) ?? {};
    const legacySetupCostsRemoved = replaceLegacySetup ? number(base.setupCosts) : 0;
    const legacyFinancingRemoved = replaceLegacyFunding ? number(base.financing) : 0;
    const legacyStartupAdjustment = legacySetupCostsRemoved - legacyFinancingRemoved;
    totalLegacySetupCostsRemoved += legacySetupCostsRemoved;
    totalLegacyFinancingRemoved += legacyFinancingRemoved;

    const setupFundingInflow = number(nonDebtFunding[month]?.cashInflow) + number(debtRow.fundingInflow);
    const setupPaymentOutflow = number(setup.cashOutflow);
    const debtPrincipalPayment = number(debtRow.principalPayment);
    const debtInterestPayment = number(debtRow.interestPayment);
    const debtFeePayment = number(debtRow.feePayment);
    const setupNetCashFlow = setupFundingInflow
      - setupPaymentOutflow
      - debtPrincipalPayment
      - debtInterestPayment
      - debtFeePayment;
    cumulativeSetupCash += setupNetCashFlow;
    const originalBaseCashEnd = number(base.cashEnd);
    const baseCashEnd = originalBaseCashEnd + legacyStartupAdjustment;

    rows.push({
      ...base,
      month,
      originalBaseCashEnd: roundMoney(originalBaseCashEnd),
      legacySetupCostsRemoved: roundMoney(legacySetupCostsRemoved),
      legacyFinancingRemoved: roundMoney(legacyFinancingRemoved),
      legacyStartupAdjustment: roundMoney(legacyStartupAdjustment),
      setupFundingInflow: roundMoney(setupFundingInflow),
      setupPaymentOutflow: roundMoney(setupPaymentOutflow),
      debtPrincipalPayment: roundMoney(debtPrincipalPayment),
      debtInterestPayment: roundMoney(debtInterestPayment),
      debtFeePayment: roundMoney(debtFeePayment),
      setupNetCashFlow: roundMoney(setupNetCashFlow),
      cumulativeSetupCash: roundMoney(cumulativeSetupCash),
      baseCashEnd: roundMoney(baseCashEnd),
      cashEnd: roundMoney(baseCashEnd + cumulativeSetupCash),
      endingDebtBalance: roundMoney(number(debtRow.endingBalance)),
    });
  }

  const hasOpeningActivity = rows[0].setupFundingInflow !== 0
    || rows[0].setupPaymentOutflow !== 0
    || rows[0].debtFeePayment !== 0;
  const visibleRows = hasOpeningActivity ? rows : rows.slice(1);
  const cashValues = visibleRows.map((row) => row.cashEnd);

  return {
    rows: visibleRows,
    debt,
    replacedLegacySetup: replaceLegacySetup,
    replacedLegacyFunding: replaceLegacyFunding,
    totalLegacySetupCostsRemoved: roundMoney(totalLegacySetupCostsRemoved),
    totalLegacyFinancingRemoved: roundMoney(totalLegacyFinancingRemoved),
    setupPaymentAfterHorizon: roundMoney(number(setupResult?.paymentSchedule?.afterHorizon)),
    endingCash: roundMoney(cashValues.at(-1) ?? 0),
    minimumCash: roundMoney(cashValues.length ? Math.min(...cashValues) : 0),
    additionalFundingNeed: roundMoney(cashValues.length ? Math.max(0, -Math.min(...cashValues)) : 0),
    firstNegativeMonth: visibleRows.find((row) => row.cashEnd < 0)?.month ?? null,
  };
}

export function buildSetupCsvRows(setupResult, integratedCashFlow) {
  const workspace = setupResult?.workspace ?? { profile: {}, items: [], funding: [] };
  const bridge = setupResult?.cashBridge ?? { summary: { totals: {} } };
  const totals = bridge.summary?.totals ?? {};
  const rows = [
    ["KURULUŞ VE AÇILIŞ ÖZETİ"],
    ["Güvenli başlangıç nakdi", bridge.grossStartupCashNeed ?? 0],
    ["Gerekli özkaynak", bridge.requiredOwnCash ?? 0],
    ["Hazır / kullanılmış finansman", bridge.availableFunding ?? 0],
    ["Planlanan finansman", setupResult?.fundingSummary?.plannedAmount ?? 0],
    ["Beklenmeyen gider rezervi", bridge.contingencyReserve ?? 0],
    ["Giderleşecek taban", totals.expenseBasis ?? 0],
    ["Varlık tabanı", totals.assetBasis ?? 0],
    ["Açılış stoğu", totals.inventoryBasis ?? 0],
    ["Bağlı nakit", totals.tiedCash ?? 0],
    ["Doğrulanmamış KDV", totals.unverifiedVat ?? 0],
    ["Eski toplu kurulum etkisi nötrlendi", integratedCashFlow?.totalLegacySetupCostsRemoved ?? 0],
    ["Eski toplu finansman etkisi nötrlendi", integratedCashFlow?.totalLegacyFinancingRemoved ?? 0],
    [],
    ["KURULUŞ KALEMLERİ"],
    ["Durum", "Kalem", "Sınıf", "Adet", "Birim tutar", "Net", "KDV", "Nakit", "Ödeme ayı", "Taksit", "Not"],
    ...workspace.items.map((item) => [
      item.status,
      item.label,
      item.costType,
      item.quantity,
      item.unitCost,
      item.netAmount,
      item.vatAmount,
      item.cashAmount,
      item.paymentMonth,
      item.installmentCount,
      item.note,
    ]),
    [],
    ["FİNANSMAN KAYNAKLARI"],
    ["Durum", "Kaynak", "Tür", "Tutar", "Hazır ay", "Yıllık faiz", "Vade", "Ödemesiz ay", "Masraf oranı", "Yöntem", "Not"],
    ...workspace.funding.map((item) => [
      item.status,
      item.label,
      item.type,
      item.amount,
      item.availableMonth,
      item.annualInterestRate ?? 0,
      item.termMonths ?? 0,
      item.graceMonths ?? 0,
      item.upfrontFeeRate ?? 0,
      item.repaymentMethod ?? "",
      item.note,
    ]),
    [],
    ["KURULUŞ VE BORÇ ÖDEME TAKVİMİ"],
    ["Ay", "Eski kuruluş düzeltmesi", "Kuruluş finansmanı", "Kuruluş ödemesi", "Anapara", "Faiz", "Masraf", "Net kuruluş etkisi", "Kalan borç"],
    ...(integratedCashFlow?.rows ?? []).map((row) => [
      row.month,
      row.legacyStartupAdjustment,
      row.setupFundingInflow,
      row.setupPaymentOutflow,
      row.debtPrincipalPayment,
      row.debtInterestPayment,
      row.debtFeePayment,
      row.setupNetCashFlow,
      row.endingDebtBalance,
    ]),
    [],
    ["12 ay sonrasına kalan kuruluş ödemesi", integratedCashFlow?.setupPaymentAfterHorizon ?? 0],
    ["12 ay sonu kalan borç", integratedCashFlow?.debt?.endingBalance ?? 0],
    ["Toplam kredi faizi (tüm vade)", integratedCashFlow?.debt?.lifetimeInterest ?? 0],
  ];
  return rows;
}

export function buildSetupCsv(setupResult, integratedCashFlow) {
  return `\uFEFF${buildSetupCsvRows(setupResult, integratedCashFlow).map((row) => row.map(csvCell).join(";")).join("\n")}`;
}

export function downloadSetupCsv(setupResult, integratedCashFlow, filename = "kurulus-acilis-plani.csv") {
  const csv = buildSetupCsv(setupResult, integratedCashFlow);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  return csv;
}
