import {
  BUSINESS_TYPES,
  DEFAULT_INPUTS,
  SCENARIO_PRESETS,
  applyScenario,
  calculateCafeModel,
  calculateScenarioComparison,
  normalizeCafeInputs,
} from "./sectors/cafe-restaurant.js";

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 });
const STORAGE_KEY = "business-income-calculator:cafe:v0.1";

const fieldSections = [
  { title: "1 · İşletme ve satış varsayımları", open: true, fields: [
    select("businessType", "İş türü", BUSINESS_TYPES), num("dailyCustomers", "Günlük müşteri", 1),
    num("averageTicket", "Ortalama fiş (TL)", 10), num("openDays", "Açık gün / ay", 1),
    num("serviceCapacity", "Günlük servis kapasitesi", 1), rate("deliverySalesShare", "Paket servis satış payı"),
    rate("cardSalesShare", "Kartlı satış payı"), rate("lostSalesRate", "İptal / gerçekleşmeyen satış"),
  ]},
  { title: "2 · Vergi ve komisyonlar", open: true, fields: [
    select("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
    rate("vatRate", "KDV oranı"), rate("deliveryCommissionRate", "Paket servis komisyonu"), rate("posCommissionRate", "POS komisyonu"),
  ]},
  { title: "3 · Değişken maliyetler", open: true, fields: [
    rate("materialCostRate", "Malzeme maliyeti / net satış"), rate("wasteRate", "Fire / malzeme maliyeti"),
    num("packagingCostPerDeliveryOrder", "Paketleme / teslimat siparişi (TL)", 1), rate("otherVariableCostRate", "Diğer değişken maliyet / net satış"),
  ]},
  { title: "4 · Sabit giderler", fields: [
    num("rent", "Kira (TL)", 1000), num("staffCost", "Personel toplam maliyeti (TL)", 1000),
    num("utilities", "Faturalar (TL)", 1000), num("accounting", "Muhasebe (TL)", 500),
    num("software", "Yazılım / abonelikler (TL)", 500), num("cleaning", "Temizlik (TL)", 500),
    num("maintenance", "Bakım (TL)", 500), num("insurance", "Sigorta (TL)", 500),
    num("otherFixedExpenses", "Diğer sabit gider (TL)", 500), num("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500),
  ]},
  { title: "5 · Kurulum maliyetleri", fields: [
    num("renovation", "Tadilat (TL)", 1000), num("equipment", "Ekipman (TL)", 1000),
    num("furniture", "Mobilya (TL)", 1000), num("deposit", "Depozito (TL)", 1000),
    num("initialStock", "İlk stok (TL)", 1000), num("licenseFees", "Ruhsat / izin (TL)", 1000),
    num("openingMarketing", "Açılış reklamı (TL)", 1000), num("softwareSetup", "Yazılım kurulumu (TL)", 1000),
  ]},
  { title: "6 · Paydaş ve vergi varsayımı", fields: [
    rate("franchiseRoyaltyRate", "Franchise / lisans payı"),
    select("franchiseRoyaltyBasis", "Paylaşım tabanı", [["gross_revenue", "Brüt ciro"], ["net_revenue_after_commission", "Komisyon sonrası net gelir"], ["contribution_after_variable_cost", "Değişken maliyet sonrası katkı"], ["pre_tax_profit", "Vergi öncesi kâr"]]),
    rate("partnerProfitShareRate", "Ortak kâr payı"), rate("estimatedTaxRate", "Vergi ön tahmin oranı"),
  ]},
  { title: "7 · Nakit akışı", fields: [
    num("startingCash", "Başlangıç nakdi (TL)", 1000), num("financingAmount", "Yatırım / finansman (TL)", 1000),
    num("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1), rate("monthlyGrowthRate", "Aylık müşteri büyümesi", { allowNegative: true }),
  ]},
];

let state = loadState();
renderStaticForm();
renderScenarioButtons();
attachEvents();
render();

function num(key, label, step = 1) { return { type: "number", key, label, step }; }
function rate(key, label, options = {}) { return { type: "rate", key, label, step: 0.1, ...options }; }
function select(key, label, options) { return { type: "select", key, label, options }; }

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { activeScenario: saved?.activeScenario || "expected", baseInputs: normalizeCafeInputs(saved?.baseInputs || DEFAULT_INPUTS) };
  } catch {
    return { activeScenario: "expected", baseInputs: { ...DEFAULT_INPUTS } };
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function renderStaticForm() {
  document.querySelector("#formSections").innerHTML = fieldSections.map((section) => `
    <details class="form-section" ${section.open ? "open" : ""}>
      <summary>${section.title}</summary>
      <div class="form-fields">${section.fields.map(renderField).join("")}</div>
    </details>`).join("");
}

function renderField(field) {
  if (field.type === "select") {
    return `<div class="field"><label for="${field.key}">${field.label}</label><select id="${field.key}" data-key="${field.key}">${field.options.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></div>`;
  }
  const isRate = field.type === "rate";
  return `<div class="field"><label for="${field.key}">${field.label}</label><input id="${field.key}" data-key="${field.key}" data-rate="${isRate}" data-negative="${Boolean(field.allowNegative)}" type="number" step="${field.step}" />${isRate ? '<span class="field-hint">Yüzde olarak girin (ör. 25 = %25)</span>' : ""}</div>`;
}

function renderScenarioButtons() {
  document.querySelector("#scenarioSwitcher").innerHTML = Object.entries(SCENARIO_PRESETS).map(([id, preset]) => `<button type="button" class="scenario-button ${state.activeScenario === id ? "active" : ""}" data-scenario="${id}">${preset.label}</button>`).join("");
}

function attachEvents() {
  document.querySelector("#formSections").addEventListener("input", (event) => {
    const target = event.target;
    const key = target.dataset.key;
    if (!key) return;
    let value = target.value;
    if (target.tagName !== "SELECT") {
      value = Number(value);
      if (target.dataset.rate === "true") value /= 100;
      if (target.dataset.negative !== "true") value = Math.max(0, value || 0);
    }
    const activeInputs = getActiveInputs();
    activeInputs[key] = value;
    state.baseInputs = normalizeCafeInputs(activeInputs);
    state.activeScenario = "expected";
    saveState();
    renderScenarioButtons();
    render();
  });
  document.querySelector("#scenarioSwitcher").addEventListener("click", (event) => {
    const scenarioId = event.target.dataset.scenario;
    if (!scenarioId) return;
    state.activeScenario = scenarioId;
    saveState();
    renderScenarioButtons();
    render();
  });
  document.querySelector("#resetButton").addEventListener("click", () => {
    state = { activeScenario: "expected", baseInputs: { ...DEFAULT_INPUTS } };
    saveState();
    renderScenarioButtons();
    render();
  });
}

function getActiveInputs() { return applyScenario(state.baseInputs, state.activeScenario); }

function syncInputs(inputs) {
  document.querySelectorAll("[data-key]").forEach((element) => {
    const key = element.dataset.key;
    if (element.tagName === "SELECT") element.value = inputs[key];
    else element.value = element.dataset.rate === "true" ? round(inputs[key] * 100, 2) : round(inputs[key], 2);
  });
}

function render() {
  const inputs = getActiveInputs();
  const result = calculateCafeModel(inputs);
  syncInputs(inputs);
  renderWarnings(result.warnings);
  renderKPIs(result);
  renderKeySplit(result);
  renderWaterfall(result);
  renderScenarioTable(calculateScenarioComparison(state.baseInputs));
  renderCashFlow(result.cashFlow.rows);
  renderBreakdown(result);
}

function renderWarnings(warnings) {
  document.querySelector("#warnings").innerHTML = warnings.map((item) => `<div class="warning ${item.severity}">${item.message}</div>`).join("");
}

function renderKPIs(result) {
  const cards = [
    ["Aylık net kâr", money(result.netProfit), `${percent.format(result.profitMargin)} net kâr marjı`, result.netProfit < 0],
    ["Aylık brüt katkı", money(result.contribution), `${percent.format(result.contribution / Math.max(1, result.netSalesBeforeLoss))} net satış`, false],
    ["Günlük başabaş", result.breakevenDailyCustomers == null ? "Bulunamadı" : `${number.format(result.breakevenDailyCustomers)} müşteri`, `Kapasite: ${number.format(result.input.serviceCapacity)}`, false],
    ["Başabaş ciro", result.breakevenRevenue == null ? "—" : money(result.breakevenRevenue), "Aylık brüt ciro", false],
    ["12 ay sonu nakit", money(result.cashFlow.endingCash), `Minimum: ${money(result.cashFlow.minimumCash)}`, result.cashFlow.endingCash < 0],
    ["Kurulum maliyeti", money(result.totalSetupCost), result.paybackMonths ? `${number.format(result.paybackMonths)} ay tahmini geri dönüş` : "Geri dönüş oluşmuyor", false],
    ["Kira / ciro", percent.format(result.rentToRevenue), "Net satış tabanına göre", result.rentToRevenue > .20],
    ["Malzeme + fire", percent.format(result.foodCostRate), "Düzeltilmiş net satışa göre", result.foodCostRate > .40],
  ];
  document.querySelector("#kpiGrid").innerHTML = cards.map(([label, value, note, negative]) => `<article class="kpi-card ${negative ? "negative" : ""}"><div class="label">${label}</div><div class="value">${value}</div><div class="note">${note}</div></article>`).join("");
}

function renderKeySplit(r) {
  const rows = [["Brüt müşteri harcaması", r.customerPayment], ["KDV ayrımı sonrası net satış", r.netSalesBeforeLoss], ["Platform ve POS sonrası tahsilat tabanı", r.revenueAfterCommission], ["Malzeme / fire sonrası katkı", r.contribution], ["Franchise / ortak payı", r.totalStakeholderPayouts], ["Vergi öncesi işletme kârı", r.preTaxProfit], ["Aylık net kâr", r.netProfit]];
  document.querySelector("#keySplit").innerHTML = rows.map(([label, value]) => `<div class="split-row"><span>${label}</span><span>${money(value)}</span></div>`).join("");
}

function renderWaterfall(r) {
  const max = Math.max(...r.waterfall.map((item) => Math.abs(item.amount)), 1);
  document.querySelector("#waterfall").innerHTML = r.waterfall.map((item) => `<div class="waterfall-row"><div class="waterfall-label"><strong>${item.name}</strong><small>${item.subtext}</small></div><div class="bar-track"><div class="bar ${item.kind}" style="width:${Math.max(1, Math.abs(item.amount) / max * 100)}%"></div></div><div class="waterfall-value">${money(item.amount)}</div></div>`).join("");
}

function renderScenarioTable(scenarios) {
  const rows = [["Brüt ciro", (r) => money(r.grossRevenue)], ["Net tahsilat", (r) => money(r.revenueAfterCommission)], ["Toplam gider", (r) => money(r.totalVariableCosts + r.totalFixedCosts + r.totalStakeholderPayouts + r.estimatedTax)], ["Vergi öncesi kâr", (r) => money(r.preTaxProfit)], ["Net kâr", (r) => money(r.netProfit)], ["Günlük başabaş", (r) => r.breakevenDailyCustomers == null ? "—" : number.format(r.breakevenDailyCustomers)], ["12 ay sonu nakit", (r) => money(r.cashFlow.endingCash)], ["Yıllık ROI", (r) => r.roi == null ? "—" : percent.format(r.roi)]];
  document.querySelector("#scenarioTable").innerHTML = `<thead><tr><th>Gösterge</th>${scenarios.map((s) => `<th>${s.label}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, get]) => `<tr><td>${label}</td>${scenarios.map((s) => `<td>${get(s.result)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

function renderCashFlow(rows) {
  document.querySelector("#cashFlowTable").innerHTML = `<thead><tr><th>Ay</th><th>Tahsilat</th><th>Değişken</th><th>Sabit</th><th>Paydaş</th><th>Vergi</th><th>Kredi</th><th>Dönem sonu</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.month}</td><td>${money(r.collections)}</td><td>${money(r.variableCosts)}</td><td>${money(r.fixedCosts)}</td><td>${money(r.stakeholderPayouts)}</td><td>${money(r.estimatedTax)}</td><td>${money(r.loanPayment)}</td><td>${money(r.cashEnd)}</td></tr>`).join("")}</tbody>`;
}

function renderBreakdown(r) {
  const fixedLabels = { rent: "Kira", staffCost: "Personel", utilities: "Faturalar", accounting: "Muhasebe", software: "Yazılım", cleaning: "Temizlik", maintenance: "Bakım", insurance: "Sigorta", otherFixedExpenses: "Diğer sabit gider" };
  const groups = [
    ["A · Gelir tarafı", [["Brüt ciro", r.grossRevenue], ["Müşteri ödemesi", r.customerPayment], ["KDV hariç satış", r.netSalesBeforeLoss], ["İptal / kayıp", -r.lostSalesAmount]]],
    ["B · Vergi / kesinti / komisyon", [["KDV ayrımı", -r.taxAmount], ["Paket servis komisyonu", -r.deliveryCommission], ["POS komisyonu", -r.posCommission], ["Komisyon sonrası gelir", r.revenueAfterCommission]]],
    ["C · Değişken maliyet", [["Malzeme", -r.materialCost], ["Fire", -r.wasteCost], ["Paketleme", -r.packagingCost], ["Diğer değişken", -r.otherVariableCost], ["Katkı", r.contribution]]],
    ["D · Sabit gider", [...Object.entries(r.fixedCostItems).map(([key, value]) => [fixedLabels[key] || key, -value]), ["Toplam sabit gider", -r.totalFixedCosts]]],
    ["E · Paydaş / franchise", [["Franchise payı", -r.franchiseRoyalty], ["Ortak kâr payı", -r.partnerPayout], ["Toplam paydaş", -r.totalStakeholderPayouts]]],
    ["F · Kâr-zarar", [["Vergi öncesi kâr", r.preTaxProfit], ["Vergi ön tahmini", -r.estimatedTax], ["Net kâr", r.netProfit]]],
    ["G · Nakit akışı", [["Başlangıç nakdi", r.input.startingCash], ["Finansman (P&L dışı)", r.input.financingAmount], ["Kurulum maliyeti", -r.totalSetupCost], ["İlk 3 ay minimum nakit", r.cashFlow.cashGapFirstThreeMonths], ["12 ay sonu nakit", r.cashFlow.endingCash]]],
  ];
  document.querySelector("#breakdown").innerHTML = groups.map(([title, rows]) => `<div class="breakdown-group"><h3>${title}</h3>${rows.map(([label, value]) => `<div class="breakdown-row"><span>${label}</span><span>${money(value)}</span></div>`).join("")}</div>`).join("");
}

function money(value) { return currency.format(Number(value) || 0); }
function round(value, digits = 2) { const p = 10 ** digits; return Math.round((Number(value) + Number.EPSILON) * p) / p; }
