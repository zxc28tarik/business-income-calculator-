import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDebtServiceSchedule,
  normalizeDebtFunding,
} from "../src/setup/debt-service.js";

test("borç normalizasyonu oran, vade ve yöntem sınırlarını uygular", () => {
  const debt = normalizeDebtFunding({
    type: "loan",
    status: "available",
    amount: -1,
    annualInterestRate: 3,
    termMonths: 0,
    graceMonths: -2,
    upfrontFeeRate: 2,
    repaymentMethod: "invalid",
  });
  assert.equal(debt.amount, 0);
  assert.equal(debt.annualInterestRate, 1);
  assert.equal(debt.termMonths, 1);
  assert.equal(debt.graceMonths, 0);
  assert.equal(debt.upfrontFeeRate, 1);
  assert.equal(debt.repaymentMethod, "annuity");
});

test("planlanan kredi nakit ve borç servisi üretmez", () => {
  const schedule = buildDebtServiceSchedule([{ type: "loan", status: "planned", amount: 120_000 }], 12);
  assert.equal(schedule.activeDebtAmount, 0);
  assert.equal(schedule.rows.reduce((sum, row) => sum + row.fundingInflow, 0), 0);
  assert.equal(schedule.rows.reduce((sum, row) => sum + row.debtPayment, 0), 0);
});

test("sıfır faizli kredi eşit taksitlerle anaparayı kapatır", () => {
  const schedule = buildDebtServiceSchedule([{
    type: "loan",
    status: "available",
    amount: 120_000,
    availableMonth: 0,
    annualInterestRate: 0,
    termMonths: 12,
    repaymentMethod: "annuity",
  }], 12);
  assert.equal(schedule.rows[0].fundingInflow, 120_000);
  assert.equal(schedule.rows[1].principalPayment, 10_000);
  assert.equal(schedule.rows[12].principalPayment, 10_000);
  assert.equal(schedule.totalInterestPaid, 0);
  assert.equal(schedule.endingBalance, 0);
});

test("ödemesiz dönem ilk taksiti ileri taşır ve masraf açılışta ödenir", () => {
  const schedule = buildDebtServiceSchedule([{
    type: "loan",
    status: "used",
    amount: 100_000,
    availableMonth: 0,
    annualInterestRate: 0.24,
    termMonths: 10,
    graceMonths: 2,
    upfrontFeeRate: 0.02,
  }], 12);
  assert.equal(schedule.rows[0].feePayment, 2_000);
  assert.equal(schedule.rows[1].debtPayment, 0);
  assert.equal(schedule.rows[2].debtPayment, 0);
  assert.ok(schedule.rows[3].debtPayment > 0);
  assert.ok(schedule.totalInterestPaid > 0);
});

test("eşit anapara yöntemi anaparayı sabit, faizi azalan üretir", () => {
  const schedule = buildDebtServiceSchedule([{
    type: "supplier_credit",
    status: "available",
    amount: 60_000,
    annualInterestRate: 0.12,
    termMonths: 6,
    repaymentMethod: "equal_principal",
  }], 6);
  assert.equal(schedule.rows[1].principalPayment, 10_000);
  assert.equal(schedule.rows[6].principalPayment, 10_000);
  assert.ok(schedule.rows[1].interestPayment > schedule.rows[6].interestPayment);
  assert.equal(schedule.endingBalance, 0);
});

test("12 ayı aşan borç bakiyesi ufuk sonrası anapara olarak korunur", () => {
  const schedule = buildDebtServiceSchedule([{
    type: "loan",
    status: "available",
    amount: 240_000,
    annualInterestRate: 0,
    termMonths: 24,
  }], 12);
  assert.equal(schedule.totalPrincipalPaid, 120_000);
  assert.equal(schedule.endingBalance, 120_000);
  assert.equal(schedule.afterHorizonPrincipal, 120_000);
});
