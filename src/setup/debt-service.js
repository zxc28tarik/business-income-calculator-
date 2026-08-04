const ACTIVE_STATUSES = new Set(["available", "used"]);
const DEBT_TYPES = new Set(["loan", "supplier_credit"]);
const REPAYMENT_METHODS = new Set(["annuity", "equal_principal"]);

function nonNegative(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function nonNegativeInteger(value, fallback = 0) {
  return Math.floor(nonNegative(value, fallback));
}

function boundedRate(value, fallback = 0) {
  return Math.min(1, nonNegative(value, fallback));
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function normalizeDebtFunding(raw = {}, index = 0) {
  return {
    id: String(raw.id ?? `debt-${index + 1}`),
    label: String(raw.label ?? `Borç ${index + 1}`),
    type: DEBT_TYPES.has(raw.type) ? raw.type : "loan",
    status: ACTIVE_STATUSES.has(raw.status) ? raw.status : "planned",
    amount: roundMoney(nonNegative(raw.amount)),
    availableMonth: Math.min(120, nonNegativeInteger(raw.availableMonth)),
    annualInterestRate: boundedRate(raw.annualInterestRate),
    termMonths: Math.min(120, Math.max(1, nonNegativeInteger(raw.termMonths, 12))),
    graceMonths: Math.min(120, nonNegativeInteger(raw.graceMonths)),
    upfrontFeeRate: boundedRate(raw.upfrontFeeRate),
    repaymentMethod: REPAYMENT_METHODS.has(raw.repaymentMethod) ? raw.repaymentMethod : "annuity",
  };
}

function annuityPayment(principal, monthlyRate, termMonths) {
  if (termMonths <= 0 || principal <= 0) return 0;
  if (monthlyRate <= 0) return principal / termMonths;
  const factor = (1 + monthlyRate) ** termMonths;
  return principal * monthlyRate * factor / (factor - 1);
}

function buildSingleDebtSchedule(raw, maxMonth) {
  const debt = normalizeDebtFunding(raw);
  const rows = Array.from({ length: maxMonth + 1 }, (_, month) => ({
    month,
    fundingInflow: 0,
    feePayment: 0,
    principalPayment: 0,
    interestPayment: 0,
    debtPayment: 0,
    endingBalance: 0,
  }));

  if (!ACTIVE_STATUSES.has(debt.status) || debt.amount <= 0) {
    return { debt, rows, afterHorizonPrincipal: 0, totalInterest: 0, totalFees: 0 };
  }

  if (debt.availableMonth <= maxMonth) {
    rows[debt.availableMonth].fundingInflow += debt.amount;
    rows[debt.availableMonth].feePayment += debt.amount * debt.upfrontFeeRate;
  }

  let lifetimeBalance = debt.amount;
  let totalInterest = 0;
  const monthlyRate = debt.annualInterestRate / 12;
  const firstPaymentMonth = debt.availableMonth + debt.graceMonths + 1;
  const fixedAnnuity = annuityPayment(debt.amount, monthlyRate, debt.termMonths);
  const fixedPrincipal = debt.amount / debt.termMonths;

  for (let installment = 0; installment < debt.termMonths; installment += 1) {
    const month = firstPaymentMonth + installment;
    const interest = lifetimeBalance * monthlyRate;
    const isFinalInstallment = installment === debt.termMonths - 1;
    const principal = isFinalInstallment
      ? lifetimeBalance
      : debt.repaymentMethod === "equal_principal"
        ? Math.min(lifetimeBalance, fixedPrincipal)
        : Math.min(lifetimeBalance, Math.max(0, fixedAnnuity - interest));
    totalInterest += interest;
    lifetimeBalance = Math.max(0, lifetimeBalance - principal);

    if (month <= maxMonth) {
      rows[month].principalPayment += principal;
      rows[month].interestPayment += interest;
      rows[month].debtPayment += principal + interest;
    }
  }

  let runningBalance = debt.amount;
  for (const row of rows) {
    runningBalance = Math.max(0, runningBalance - row.principalPayment);
    row.fundingInflow = roundMoney(row.fundingInflow);
    row.feePayment = roundMoney(row.feePayment);
    row.principalPayment = roundMoney(row.principalPayment);
    row.interestPayment = roundMoney(row.interestPayment);
    row.debtPayment = roundMoney(row.debtPayment);
    row.endingBalance = roundMoney(runningBalance);
  }

  return {
    debt,
    rows,
    afterHorizonPrincipal: roundMoney(runningBalance),
    totalInterest: roundMoney(totalInterest),
    totalFees: roundMoney(debt.amount * debt.upfrontFeeRate),
  };
}

export function buildDebtServiceSchedule(funding = [], maxMonth = 12) {
  const monthLimit = Math.min(120, nonNegativeInteger(maxMonth, 12));
  const debts = (Array.isArray(funding) ? funding : [])
    .filter((item) => DEBT_TYPES.has(item?.type))
    .map((item, index) => normalizeDebtFunding(item, index));
  const schedules = debts.map((debt) => buildSingleDebtSchedule(debt, monthLimit));
  const rows = Array.from({ length: monthLimit + 1 }, (_, month) => ({
    month,
    fundingInflow: 0,
    feePayment: 0,
    principalPayment: 0,
    interestPayment: 0,
    debtPayment: 0,
    endingBalance: 0,
  }));

  for (const schedule of schedules) {
    for (const source of schedule.rows) {
      const row = rows[source.month];
      row.fundingInflow += source.fundingInflow;
      row.feePayment += source.feePayment;
      row.principalPayment += source.principalPayment;
      row.interestPayment += source.interestPayment;
      row.debtPayment += source.debtPayment;
    }
  }

  for (const row of rows) {
    row.fundingInflow = roundMoney(row.fundingInflow);
    row.feePayment = roundMoney(row.feePayment);
    row.principalPayment = roundMoney(row.principalPayment);
    row.interestPayment = roundMoney(row.interestPayment);
    row.debtPayment = roundMoney(row.debtPayment);
    row.endingBalance = roundMoney(schedules.reduce(
      (sum, schedule) => sum + Number(schedule.rows[row.month]?.endingBalance ?? 0),
      0,
    ));
  }

  const endingBalance = roundMoney(rows.at(-1)?.endingBalance ?? 0);
  return {
    debts,
    rows,
    activeDebtAmount: roundMoney(debts.filter((item) => ACTIVE_STATUSES.has(item.status)).reduce((sum, item) => sum + item.amount, 0)),
    totalPrincipalPaid: roundMoney(rows.reduce((sum, row) => sum + row.principalPayment, 0)),
    totalInterestPaid: roundMoney(rows.reduce((sum, row) => sum + row.interestPayment, 0)),
    totalFeesPaid: roundMoney(rows.reduce((sum, row) => sum + row.feePayment, 0)),
    endingBalance,
    afterHorizonPrincipal: roundMoney(schedules.reduce((sum, item) => sum + item.afterHorizonPrincipal, 0)),
    lifetimeInterest: roundMoney(schedules.reduce((sum, item) => sum + item.totalInterest, 0)),
  };
}
