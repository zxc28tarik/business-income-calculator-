import test from "node:test";
import assert from "node:assert/strict";
import { buildSetupWorkspaceResult } from "../src/setup/setup-workspace.js";
import {
  appendSetupCashColumns,
  buildIntegratedCashFlow,
  buildSetupCsv,
} from "../src/setup/setup-integration.js";

const context = { sectorId: "cafe_restaurant", businessType: "cafe" };
const baseRows = Array.from({ length: 12 }, (_, index) => ({
  month: index + 1,
  collections: 100_000,
  cashEnd: (index + 1) * 10_000,
}));

function setupResult(seed = {}) {
  return buildSetupWorkspaceResult({
    profile: { sectorId: "cafe_restaurant", businessType: "cafe" },
    reserveRate: 0,
    items: [],
    funding: [],
    ...seed,
  }, context, { scheduleMonths: 12, asOf: "2026-08-04" });
}

test("kuruluş hareketi yoksa faaliyet nakit satırları ve sonuçları korunur", () => {
  const integrated = buildIntegratedCashFlow(baseRows, setupResult(), 12);
  assert.equal(integrated.rows.length, 12);
  assert.equal(integrated.rows[0].month, 1);
  assert.equal(integrated.rows[0].cashEnd, 10_000);
  assert.equal(integrated.rows[11].cashEnd, 120_000);
  assert.equal(integrated.replacedLegacySetup, false);
  assert.equal(integrated.replacedLegacyFunding, false);
});

test("kuruluş taksiti ve hazır özkaynak birleşik nakde kümülatif bağlanır", () => {
  const result = setupResult({
    items: [{
      id: "equipment",
      label: "Ekipman",
      status: "included",
      costType: "CAPEX",
      quantity: 1,
      unitCost: 12_000,
      vatRate: 0,
      paymentMonth: 2,
      installmentCount: 3,
    }],
    funding: [{
      id: "equity",
      label: "Hazır sermaye",
      type: "equity",
      status: "available",
      amount: 5_000,
      availableMonth: 0,
    }],
  });
  const integrated = buildIntegratedCashFlow(baseRows, result, 12);
  assert.equal(integrated.rows[0].month, 0);
  assert.equal(integrated.rows[0].cashEnd, 5_000);
  assert.equal(integrated.rows.find((row) => row.month === 2).setupPaymentOutflow, 4_000);
  assert.equal(integrated.rows.find((row) => row.month === 2).cashEnd, 21_000);
  assert.equal(integrated.rows.find((row) => row.month === 4).cashEnd, 33_000);
});

test("planlanan finansman birleşik nakit girişi üretmez", () => {
  const result = setupResult({
    funding: [{ type: "grant", status: "planned", amount: 50_000, availableMonth: 0 }],
  });
  const integrated = buildIntegratedCashFlow(baseRows, result, 12);
  assert.equal(integrated.rows.length, 12);
  assert.equal(integrated.rows.reduce((sum, row) => sum + row.setupFundingInflow, 0), 0);
  assert.equal(integrated.replacedLegacyFunding, false);
});

test("kredi girişi anapara faiz ve masrafı ayrı sütunlarda taşır", () => {
  const result = setupResult({
    funding: [{
      id: "loan",
      label: "Banka kredisi",
      type: "loan",
      status: "available",
      amount: 120_000,
      availableMonth: 0,
      annualInterestRate: 0.12,
      termMonths: 12,
      graceMonths: 0,
      upfrontFeeRate: 0.01,
      repaymentMethod: "annuity",
    }],
  });
  const integrated = buildIntegratedCashFlow(baseRows, result, 12);
  assert.equal(integrated.rows[0].setupFundingInflow, 120_000);
  assert.equal(integrated.rows[0].debtFeePayment, 1_200);
  assert.ok(integrated.rows[1].debtPrincipalPayment > 0);
  assert.ok(integrated.rows[1].debtInterestPayment > 0);
  assert.equal(integrated.debt.endingBalance, 0);
});

test("ayrıntılı kuruluş planı eski toplu kurulum ve finansmanı bir kez nötrler", () => {
  const legacyRows = [
    { month: 1, setupCosts: 30_000, financing: 20_000, cashEnd: 90_000 },
    { month: 2, setupCosts: 0, financing: 0, cashEnd: 110_000 },
  ];
  const result = setupResult({
    items: [{
      id: "detailed-setup",
      label: "Ayrıntılı ekipman",
      status: "included",
      costType: "CAPEX",
      unitCost: 30_000,
      paymentMonth: 1,
      installmentCount: 1,
    }],
    funding: [{
      id: "detailed-equity",
      label: "Ayrıntılı sermaye",
      type: "equity",
      status: "available",
      amount: 20_000,
      availableMonth: 1,
    }],
  });
  const integrated = buildIntegratedCashFlow(legacyRows, result, 2);
  const firstMonth = integrated.rows.find((row) => row.month === 1);

  assert.equal(integrated.replacedLegacySetup, true);
  assert.equal(integrated.replacedLegacyFunding, true);
  assert.equal(integrated.totalLegacySetupCostsRemoved, 30_000);
  assert.equal(integrated.totalLegacyFinancingRemoved, 20_000);
  assert.equal(firstMonth.legacyStartupAdjustment, 10_000);
  assert.equal(firstMonth.baseCashEnd, 100_000);
  assert.equal(firstMonth.setupFundingInflow, 20_000);
  assert.equal(firstMonth.setupPaymentOutflow, 30_000);
  assert.equal(firstMonth.cashEnd, 90_000);
});

test("nakit kolonları eski kuruluş düzeltmesini, faaliyet sonunu ve birleşik sonucu gösterir", () => {
  const columns = appendSetupCashColumns([
    { key: "month", label: "Ay" },
    { key: "collections", label: "Tahsilat" },
    { key: "cashEnd", label: "Dönem sonu" },
  ]);
  assert.deepEqual(columns.map((column) => column.key), [
    "month",
    "collections",
    "legacyStartupAdjustment",
    "setupFundingInflow",
    "setupPaymentOutflow",
    "debtPrincipalPayment",
    "debtInterestPayment",
    "debtFeePayment",
    "baseCashEnd",
    "cashEnd",
  ]);
});

test("kuruluş CSV çıktısı maliyet finansman borç ve çift sayım düzeltmesini içerir", () => {
  const result = setupResult({
    items: [{ id: "deposit", label: "Kira depozitosu", status: "included", costType: "DEPOSIT", unitCost: 20_000 }],
    funding: [{ id: "loan", label: "Banka kredisi", type: "loan", status: "available", amount: 30_000, termMonths: 12 }],
  });
  const integrated = buildIntegratedCashFlow(baseRows, result, 12);
  const csv = buildSetupCsv(result, integrated);
  assert.match(csv, /KURULUŞ VE AÇILIŞ ÖZETİ/);
  assert.match(csv, /Kira depozitosu/);
  assert.match(csv, /Banka kredisi/);
  assert.match(csv, /Eski toplu kurulum etkisi nötrlendi/);
  assert.match(csv, /KURULUŞ VE BORÇ ÖDEME TAKVİMİ/);
  assert.doesNotMatch(csv, /\[object Object\]/);
});
