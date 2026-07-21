import { readFile, writeFile } from "node:fs/promises";

async function patchModel() {
  const file = "src/tracking/tracking-model.js";
  let content = await readFile(file, "utf8");
  content = content.replace(
    `  const fixedCosts = Number(row.fixedCosts ?? 0) || 0;\n  const stakeholderPayouts = Number(row.stakeholderPayouts ?? 0) || 0;\n  const estimatedTax = Number(row.estimatedTax ?? 0) || 0;\n  const collections = Number(row.collections ?? 0) || 0;`,
    `  const fixedCosts = Number(row.fixedCosts ?? row.publisherCostTry ?? 0) || 0;\n  const stakeholderPayouts = Number(row.stakeholderPayouts ?? row.developerOutflowTry ?? 0) || 0;\n  const estimatedTax = Number(row.estimatedTax ?? 0) || 0;\n  const collections = Number(row.collections ?? row.receiptTry ?? 0) || 0;`,
  );
  content = content.replace(
    `  const cashStart = Number(row.cashStart ?? 0) || 0;\n  const cashEnd = Number(row.cashEnd ?? 0) || 0;`,
    `  const cashStart = Number(row.cashStart ?? 0) || 0;\n  const cashEnd = Number(row.cashEnd ?? row.cashTry ?? 0) || 0;`,
  );
  const marker = `export function buildTrackingModel({ sector, scenarioId = "expected", result, records = [] }) {\n`;
  if (!content.includes("function resolveForecastRows(result)")) {
    content = content.replace(marker, `function resolveForecastRows(result) {\n  if (Array.isArray(result?.cashFlow?.rows)) return result.cashFlow.rows;\n  if (!Array.isArray(result?.cashFlow?.months)) return [];\n  let previousCash = Number(result.cashFlow.startCashTry ?? 0) - Number(result.cashFlow.preLaunchCashNeedTry ?? 0);\n  return result.cashFlow.months.map((row) => {\n    const adapted = { ...row, cashStart: previousCash };\n    previousCash = Number(row.cashTry ?? previousCash);\n    return adapted;\n  });\n}\n\n${marker}`);
  }
  content = content.replace(
    `  const forecastRows = Array.isArray(result?.cashFlow?.rows) ? result.cashFlow.rows : [];`,
    `  const forecastRows = resolveForecastRows(result);`,
  );
  await writeFile(file, content, "utf8");
}

async function patchTests() {
  const file = "tests/tracking-mode.test.mjs";
  let content = await readFile(file, "utf8");
  content = content.replace(
    `  assert.ok(row.actual.netCashMovement > row.actual.operatingResult, "finansman nakde eklenmeli");`,
    `  assert.equal(row.actual.netCashMovement, row.actual.operatingResult + row.actual.financing + row.actual.support - row.actual.setupCosts - row.actual.loanPayment);`,
  );
  const oldBlock = `    const first = result.cashFlow.rows[0];\n    const model = buildTrackingModel({`;
  const newBlock = `    const first = result.cashFlow.rows?.[0] ?? result.cashFlow.months?.[0];\n    const collections = first.collections ?? first.receiptTry ?? 0;\n    const variableCosts = first.variableCostsPaid ?? first.variableCostsAccrued ?? 0;\n    const fixedCosts = first.fixedCosts ?? first.publisherCostTry ?? 0;\n    const stakeholderPayouts = first.stakeholderPayouts ?? first.developerOutflowTry ?? 0;\n    const cashEnd = first.cashEnd ?? first.cashTry ?? 0;\n    const model = buildTrackingModel({`;
  content = content.replace(oldBlock, newBlock);
  content = content.replace(
    `        collections: first.collections,\n        variableCosts: first.variableCostsPaid,\n        fixedCosts: first.fixedCosts,\n        stakeholderPayouts: first.stakeholderPayouts,\n        estimatedTax: first.estimatedTax,\n        financing: first.financing,\n        support: first.support,\n        setupCosts: first.setupCosts,\n        loanPayment: first.loanPayment,\n        cashEnd: first.cashEnd,`,
    `        collections,\n        variableCosts,\n        fixedCosts,\n        stakeholderPayouts,\n        estimatedTax: first.estimatedTax ?? 0,\n        financing: first.financing ?? 0,\n        support: first.support ?? 0,\n        setupCosts: first.setupCosts ?? 0,\n        loanPayment: first.loanPayment ?? 0,\n        cashEnd,`,
  );
  await writeFile(file, content, "utf8");
}

await patchModel();
await patchTests();
console.log("v0.21 tracking Steam uyumu ve test beklentileri düzeltildi.");
