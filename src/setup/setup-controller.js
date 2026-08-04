import { escapeHtml, formatValue } from "../ui/formatters.js";
import { renderCashFlow, resolveCashFlowColumns } from "../ui/results-view.js";
import { createWorkspacePanel } from "../ui/workspace-panel.js";
import {
  SETUP_COST_TYPES,
  SETUP_ITEM_STATUSES,
  VAT_RECOVERABILITY,
} from "./setup-model.js";
import {
  appendSetupCashColumns,
  buildIntegratedCashFlow,
  downloadSetupCsv,
} from "./setup-integration.js";
import {
  addCustomSetupItem,
  addSetupFunding,
  buildSetupWorkspaceResult,
  removeSetupFunding,
  removeSetupItem,
  synchronizeSetupWorkspace,
  updateSetupFunding,
  updateSetupItem,
  updateSetupProfile,
  updateSetupReserveRate,
} from "./setup-workspace.js";

const COST_TYPE_LABELS = {
  [SETUP_COST_TYPES.SETUP_EXPENSE]: "Kuruluş gideri",
  [SETUP_COST_TYPES.CAPEX]: "Sabit kıymet",
  [SETUP_COST_TYPES.FIT_OUT]: "Tadilat / yer hazırlığı",
  [SETUP_COST_TYPES.DEPOSIT]: "Depozito / teminat",
  [SETUP_COST_TYPES.OPENING_INVENTORY]: "Açılış stoğu",
  [SETUP_COST_TYPES.CONSUMABLES]: "İlk sarf",
  [SETUP_COST_TYPES.PREPAID]: "Peşin gider",
  [SETUP_COST_TYPES.WORKING_CAPITAL]: "İşletme sermayesi",
  [SETUP_COST_TYPES.REFUNDABLE]: "Geri alınabilir tutar",
  [SETUP_COST_TYPES.TAX_CREDIT]: "Vergi / KDV alacağı",
  [SETUP_COST_TYPES.NON_RECOVERABLE_TAX]: "İndirilemeyen vergi",
  [SETUP_COST_TYPES.RECURRING_COMPLIANCE]: "Tekrarlanan uyum",
};

const STATUS_LABELS = {
  [SETUP_ITEM_STATUSES.INCLUDED]: "Hesaba dahil",
  [SETUP_ITEM_STATUSES.QUOTE]: "Teklif alınacak",
  [SETUP_ITEM_STATUSES.VERIFY]: "Doğrulanacak",
  [SETUP_ITEM_STATUSES.EXCLUDED]: "Hariç",
};

const VAT_LABELS = {
  [VAT_RECOVERABILITY.RECOVERABLE]: "İndirilebilir",
  [VAT_RECOVERABILITY.NON_RECOVERABLE]: "İndirilemez",
  [VAT_RECOVERABILITY.UNKNOWN]: "Doğrulanacak",
};

const FUNDING_TYPE_LABELS = {
  equity: "Özkaynak / ortak sermayesi",
  loan: "Kredi",
  grant: "Hibe",
  support: "Destek / teşvik",
  supplier_credit: "Tedarikçi kredisi",
  other: "Diğer",
};

const FUNDING_STATUS_LABELS = {
  planned: "Planlandı",
  available: "Kullanılabilir",
  used: "Kullanıldı",
  excluded: "Hariç",
};

const REPAYMENT_METHOD_LABELS = {
  annuity: "Eşit taksit",
  equal_principal: "Eşit anapara",
};

const REQUIREMENT_LEVEL_LABELS = {
  required: "Zorunlu",
  conditional: "Koşullu",
  verify: "Doğrulama",
  optional: "İsteğe bağlı",
};

function selected(value, expected) {
  return value === expected ? " selected" : "";
}

function checked(value) {
  return value ? " checked" : "";
}

function setupContext(context) {
  return {
    sectorId: String(context?.sector?.id ?? ""),
    businessType: String(context?.inputs?.businessType ?? context?.inputs?.businessTypeId ?? ""),
  };
}

function profileSelect(key, label, value, options) {
  return `<label class="setup-field"><span>${escapeHtml(label)}</span><select data-setup-profile="${escapeHtml(key)}">${options
    .map(([optionValue, optionLabel]) => `<option value="${escapeHtml(optionValue)}"${selected(value, optionValue)}>${escapeHtml(optionLabel)}</option>`)
    .join("")}</select></label>`;
}

function profileInput(key, label, value, type = "text", extra = "") {
  return `<label class="setup-field"><span>${escapeHtml(label)}</span><input type="${escapeHtml(type)}" data-setup-profile="${escapeHtml(key)}" value="${escapeHtml(value ?? "")}" ${extra}></label>`;
}

function profileToggle(key, label, value) {
  return `<label class="setup-toggle"><input type="checkbox" data-setup-profile="${escapeHtml(key)}"${checked(value)}><span>${escapeHtml(label)}</span></label>`;
}

function renderProfile(profile, reserveRate, context) {
  const businessType = context?.inputs?.businessType ?? context?.inputs?.businessTypeId ?? "—";
  return `
    <div class="setup-profile-heading">
      <div><p class="eyebrow">İŞLETME KOŞULLARI</p><h3>Kuruluş profili</h3></div>
      <p>${escapeHtml(context?.sector?.name ?? "")} · İş türü: ${escapeHtml(String(businessType || "belirtilmedi"))}</p>
    </div>
    <div class="setup-profile-grid">
      ${profileSelect("legalStructure", "Hukuki yapı", profile.legalStructure, [
        ["undecided", "Henüz karar verilmedi"],
        ["sole_proprietorship", "Şahıs işletmesi"],
        ["limited_company", "Limited şirket"],
        ["joint_stock_company", "Anonim şirket"],
        ["other", "Diğer"],
      ])}
      ${profileSelect("premisesType", "İşyeri türü", profile.premisesType, [
        ["unknown", "Henüz belli değil"],
        ["none", "Fiziksel işyeri yok"],
        ["home_office", "Ev / home office"],
        ["rented", "Kiralanacak"],
        ["owned", "Mülk"],
        ["shared", "Ortak / paylaşımlı"],
        ["other", "Diğer"],
      ])}
      ${profileInput("province", "İl", profile.province)}
      ${profileInput("district", "İlçe", profile.district)}
      ${profileInput("employeeCount", "Çalışan sayısı", profile.employeeCount, "number", 'min="0" step="1"')}
      ${profileInput("openingTargetDate", "Hedef açılış tarihi", profile.openingTargetDate, "date")}
      <label class="setup-field"><span>Beklenmeyen gider rezervi (%)</span><input type="number" data-setup-reserve value="${escapeHtml((reserveRate * 100).toFixed(1))}" min="0" max="100" step="0.5"></label>
    </div>
    <div class="setup-toggle-grid">
      ${profileToggle("hasPhysicalPremises", "Fiziksel işyeri var", profile.hasPhysicalPremises)}
      ${profileToggle("handlesFood", "Gıda / içecek faaliyeti var", profile.handlesFood)}
      ${profileToggle("hasEmployees", "Çalışan kullanılacak", profile.hasEmployees)}
      ${profileToggle("acceptsCardPayments", "Kartlı ödeme alınacak", profile.acceptsCardPayments)}
      ${profileToggle("usesMarketplace", "Pazaryeri / platform kullanılacak", profile.usesMarketplace)}
      ${profileToggle("storesPersonalData", "Kişisel veri saklanacak", profile.storesPersonalData)}
    </div>`;
}

function renderRequirements(result) {
  const items = result.requirements.requirements;
  if (!items.length) return '<p class="setup-empty">Seçilen koşullara göre ek kontrol bulunmadı.</p>';
  return `<div class="setup-requirement-list">${items.map((item) => `
    <article class="setup-requirement ${escapeHtml(item.level)}">
      <div><span>${escapeHtml(REQUIREMENT_LEVEL_LABELS[item.level] ?? item.level)}</span><strong>${escapeHtml(item.title)}</strong></div>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      <small>${item.verificationOwner ? `Doğrulama: ${escapeHtml(item.verificationOwner.replaceAll("_", " "))}` : "Kullanıcı kontrolü"}</small>
    </article>`).join("")}</div>`;
}

function optionList(labels, current) {
  return Object.entries(labels)
    .map(([value, label]) => `<option value="${escapeHtml(value)}"${selected(current, value)}>${escapeHtml(label)}</option>`)
    .join("");
}

function renderItemsTable(workspace) {
  if (!workspace.items.length) return '<tbody><tr><td colspan="11" class="setup-empty">Henüz kuruluş kalemi yok.</td></tr></tbody>';
  return `<thead><tr>
    <th>Durum</th><th>Kalem</th><th>Sınıf</th><th>Adet</th><th>Birim tutar</th><th>KDV %</th><th>Dahil</th><th>KDV durumu</th><th>Ödeme ayı</th><th>Taksit</th><th></th>
  </tr></thead><tbody>${workspace.items.map((item) => `
    <tr data-setup-row="${escapeHtml(item.id)}">
      <td><select data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="status">${optionList(STATUS_LABELS, item.status)}</select></td>
      <td><input class="setup-label-input" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="label" value="${escapeHtml(item.label)}"><small>${item.requirementId ? "Önerilen kalem" : "Özel kalem"}</small></td>
      <td><select data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="costType">${optionList(COST_TYPE_LABELS, item.costType)}</select></td>
      <td><input type="number" min="0" step="1" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="quantity" value="${escapeHtml(item.quantity)}"></td>
      <td><input type="number" min="0" step="100" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="unitCost" value="${escapeHtml(item.unitCost)}"></td>
      <td><input type="number" min="0" max="100" step="1" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="vatRate" value="${escapeHtml((item.vatRate * 100).toFixed(1))}"></td>
      <td class="setup-checkbox-cell"><input type="checkbox" aria-label="KDV fiyata dahil" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="vatIncluded"${checked(item.vatIncluded)}></td>
      <td><select data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="vatRecoverability">${optionList(VAT_LABELS, item.vatRecoverability)}</select></td>
      <td><input type="number" min="0" max="120" step="1" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="paymentMonth" value="${escapeHtml(item.paymentMonth)}"></td>
      <td><input type="number" min="1" max="120" step="1" data-setup-item-id="${escapeHtml(item.id)}" data-setup-item-field="installmentCount" value="${escapeHtml(item.installmentCount)}"></td>
      <td><button type="button" class="setup-remove-button" data-setup-remove="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)} kalemini kaldır">Kaldır</button></td>
    </tr>`).join("")}</tbody>`;
}

function fundingDebtFields(item) {
  const isDebt = item.type === "loan" || item.type === "supplier_credit";
  const disabled = isDebt ? "" : " disabled";
  return `
    <td><input type="number" min="0" max="100" step="0.1" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="annualInterestRate" value="${escapeHtml((item.annualInterestRate * 100).toFixed(2))}"${disabled}></td>
    <td><input type="number" min="1" max="120" step="1" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="termMonths" value="${escapeHtml(item.termMonths || 12)}"${disabled}></td>
    <td><input type="number" min="0" max="120" step="1" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="graceMonths" value="${escapeHtml(item.graceMonths)}"${disabled}></td>
    <td><input type="number" min="0" max="100" step="0.1" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="upfrontFeeRate" value="${escapeHtml((item.upfrontFeeRate * 100).toFixed(2))}"${disabled}></td>
    <td><select data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="repaymentMethod"${disabled}>${optionList(REPAYMENT_METHOD_LABELS, item.repaymentMethod || "annuity")}</select></td>`;
}

function renderFundingTable(result) {
  const funding = result.workspace.funding;
  if (!funding.length) return '<tbody><tr><td colspan="11" class="setup-empty">Henüz finansman kaynağı eklenmedi. Planlanan kaynaklar özkaynak ihtiyacından düşülmez.</td></tr></tbody>';
  return `<thead><tr>
    <th>Durum</th><th>Kaynak</th><th>Tür</th><th>Tutar</th><th>Hazır ay</th><th>Yıllık faiz %</th><th>Vade</th><th>Ödemesiz ay</th><th>Masraf %</th><th>Yöntem</th><th></th>
  </tr></thead><tbody>${funding.map((item) => `
    <tr data-setup-funding-row="${escapeHtml(item.id)}">
      <td><select data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="status">${optionList(FUNDING_STATUS_LABELS, item.status)}</select></td>
      <td><input class="setup-label-input" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="label" value="${escapeHtml(item.label)}"></td>
      <td><select data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="type">${optionList(FUNDING_TYPE_LABELS, item.type)}</select></td>
      <td><input type="number" min="0" step="1000" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="amount" value="${escapeHtml(item.amount)}"></td>
      <td><input type="number" min="0" max="120" step="1" data-setup-funding-id="${escapeHtml(item.id)}" data-setup-funding-field="availableMonth" value="${escapeHtml(item.availableMonth)}"></td>
      ${fundingDebtFields(item)}
      <td><button type="button" class="setup-remove-button" data-setup-funding-remove="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)} finansmanını kaldır">Kaldır</button></td>
    </tr>`).join("")}</tbody>`;
}

function renderPaymentSchedule(result, integrated) {
  const totalSetup = integrated.rows.reduce((sum, row) => sum + row.setupPaymentOutflow, 0);
  const totalDebt = integrated.rows.reduce((sum, row) => sum + row.debtPrincipalPayment + row.debtInterestPayment + row.debtFeePayment, 0);
  return `<thead><tr><th>Dönem</th><th>Finansman girişi</th><th>Kuruluş ödemesi</th><th>Anapara</th><th>Faiz</th><th>Masraf</th><th>Net etki</th><th>Kalan borç</th></tr></thead>
    <tbody>${integrated.rows.map((row) => `<tr><td>${row.month === 0 ? "Açılış / Ay 0" : `Ay ${row.month}`}</td><td>${formatValue(row.setupFundingInflow, "money")}</td><td>${formatValue(row.setupPaymentOutflow, "money")}</td><td>${formatValue(row.debtPrincipalPayment, "money")}</td><td>${formatValue(row.debtInterestPayment, "money")}</td><td>${formatValue(row.debtFeePayment, "money")}</td><td>${formatValue(row.setupNetCashFlow, "money")}</td><td>${formatValue(row.endingDebtBalance, "money")}</td></tr>`).join("")}</tbody>
    <tfoot><tr><th>İlk dönem toplamı</th><th></th><th>${formatValue(totalSetup, "money")}</th><th colspan="3">Borç servisi: ${formatValue(totalDebt, "money")}</th><th></th><th>${formatValue(integrated.debt.endingBalance, "money")}</th></tr>
    <tr><th>Ufuk sonrası</th><th colspan="2">Kuruluş ödemesi: ${formatValue(integrated.setupPaymentAfterHorizon, "money")}</th><th colspan="5">Kalan anapara: ${formatValue(integrated.debt.afterHorizonPrincipal, "money")}</th></tr></tfoot>`;
}

function summaryCard(label, value, note, tone = "") {
  return `<article class="setup-summary-card ${tone}"><span>${escapeHtml(label)}</span><strong>${formatValue(value, "money")}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderCashSummary(result, integrated) {
  const bridge = result.cashBridge;
  const totals = bridge.summary.totals;
  const intro = totals.includedCount
    ? `${totals.includedCount} dahil kalem üzerinden hesaplandı. Teklif veya doğrulama bekleyen ${result.unresolvedCount} kalem ayrıca izleniyor.`
    : `Henüz hesaba dahil edilen tutarlı kalem yok. ${result.unresolvedCount} kalem teklif veya doğrulama bekliyor.`;
  return `
    <div class="setup-cash-intro"><strong>${escapeHtml(intro)}</strong><span>Yalnız açılışta kullanılabilir veya kullanılmış finansman özkaynak ihtiyacını azaltır. Borç anapara ve faiz ödemeleri kâra değil nakit akışına bağlanır.</span></div>
    <div class="setup-summary-grid">
      ${summaryCard("Güvenli başlangıç nakdi", bridge.grossStartupCashNeed, `Rezerv: ${formatValue(bridge.contingencyReserve, "money")}`, bridge.grossStartupCashNeed > 0 ? "primary" : "")}
      ${summaryCard("Gerekli özkaynak", bridge.requiredOwnCash, `Hazır / kullanılmış: ${formatValue(bridge.availableFunding, "money")}`)}
      ${summaryCard("Planlanan finansman", result.fundingSummary.plannedAmount, "Henüz özkaynaktan düşülmez", result.fundingSummary.plannedAmount > 0 ? "warning" : "")}
      ${summaryCard("12 ay borç servisi", integrated.debt.totalPrincipalPaid + integrated.debt.totalInterestPaid + integrated.debt.totalFeesPaid, `Kalan borç: ${formatValue(integrated.debt.endingBalance, "money")}`, integrated.debt.activeDebtAmount > 0 ? "warning" : "")}
      ${summaryCard("Giderleşecek taban", totals.expenseBasis, "Kuruluş, sarf ve uyum giderleri")}
      ${summaryCard("Varlık + stok + bağlı nakit", totals.assetBasis + totals.inventoryBasis + totals.tiedCash, "Demirbaş, stok ve depozito")}
      ${summaryCard("Doğrulanmamış KDV", totals.unverifiedVat, "KDV niteliği henüz teyit edilmedi", totals.unverifiedVat > 0 ? "warning" : "")}
    </div>`;
}

function profilePatch(target) {
  const key = target.dataset.setupProfile;
  if (!key) return null;
  let value = target.type === "checkbox" ? target.checked : target.value;
  if (target.type === "number") value = Number(value);
  const patch = { [key]: value };
  if (key === "premisesType") patch.hasPhysicalPremises = ["rented", "owned", "shared", "other"].includes(value);
  if (key === "employeeCount" && Number(value) > 0) patch.hasEmployees = true;
  return patch;
}

function integratedSector(sector, baseRows) {
  return {
    ...sector,
    cashFlowColumns: appendSetupCashColumns(resolveCashFlowColumns(sector, baseRows)),
  };
}

export function createSetupController({ elements, getContext, setSetup }) {
  let panelControl = null;
  let lastIntegrated = null;
  let lastResult = null;
  const fundingTable = elements.fundingTable ?? elements.panel.querySelector("#setupFundingTable");
  const paymentSchedule = elements.paymentSchedule ?? elements.panel.querySelector("#setupPaymentSchedule");
  const addFundingButton = elements.addFundingButton ?? elements.panel.querySelector("#setupAddFundingButton");
  const exportCsvButton = elements.exportCsvButton ?? elements.panel.querySelector("#setupExportCsvButton");
  const mainCashTable = document.querySelector("#cashFlowTable");

  function current() {
    const context = getContext();
    const result = buildSetupWorkspaceResult(context.setup, setupContext(context));
    const baseResult = context.result ?? context.sector?.calculateModel?.(context.inputs);
    const baseRows = baseResult?.cashFlow?.rows ?? [];
    const integrated = buildIntegratedCashFlow(baseRows, result, 12);
    return { context, result, integrated, baseRows };
  }

  function render() {
    const { context, result, integrated, baseRows } = current();
    lastResult = result;
    lastIntegrated = integrated;
    elements.profile.innerHTML = renderProfile(result.workspace.profile, result.workspace.reserveRate, context);
    elements.requirements.innerHTML = renderRequirements(result);
    elements.table.innerHTML = renderItemsTable(result.workspace);
    fundingTable.innerHTML = renderFundingTable(result);
    paymentSchedule.innerHTML = renderPaymentSchedule(result, integrated);
    elements.cashSummary.innerHTML = renderCashSummary(result, integrated);
    elements.syncButton.textContent = `Koşulları yenile · ${result.requirements.summary.total} kontrol`;
    if (mainCashTable && context.sector) renderCashFlow(mainCashTable, integratedSector(context.sector, baseRows), integrated.rows);
  }

  elements.profile.addEventListener("change", (event) => {
    const context = getContext();
    const normalized = synchronizeSetupWorkspace(context.setup, setupContext(context));
    if (event.target.dataset.setupReserve != null) {
      setSetup(updateSetupReserveRate(normalized, Number(event.target.value) / 100, setupContext(context)));
      return;
    }
    const patch = profilePatch(event.target);
    if (patch) setSetup(updateSetupProfile(normalized, patch, setupContext(context)));
  });

  elements.table.addEventListener("change", (event) => {
    const itemId = event.target.dataset.setupItemId;
    const field = event.target.dataset.setupItemField;
    if (!itemId || !field) return;
    const context = getContext();
    let value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    if (["quantity", "unitCost", "paymentMonth", "installmentCount"].includes(field)) value = Number(value);
    if (field === "vatRate") value = Number(value) / 100;
    setSetup(updateSetupItem(context.setup, itemId, { [field]: value }, setupContext(context)));
  });

  elements.table.addEventListener("click", (event) => {
    const itemId = event.target.dataset.setupRemove;
    if (!itemId) return;
    const context = getContext();
    setSetup(removeSetupItem(context.setup, itemId, setupContext(context)));
  });

  fundingTable.addEventListener("change", (event) => {
    const fundingId = event.target.dataset.setupFundingId;
    const field = event.target.dataset.setupFundingField;
    if (!fundingId || !field) return;
    const context = getContext();
    let value = event.target.value;
    if (["amount", "availableMonth", "termMonths", "graceMonths"].includes(field)) value = Number(value);
    if (["annualInterestRate", "upfrontFeeRate"].includes(field)) value = Number(value) / 100;
    const patch = { [field]: value };
    if (field === "type" && ["loan", "supplier_credit"].includes(value)) {
      patch.termMonths = 12;
      patch.repaymentMethod = "annuity";
    }
    setSetup(updateSetupFunding(context.setup, fundingId, patch, setupContext(context)));
  });

  fundingTable.addEventListener("click", (event) => {
    const fundingId = event.target.dataset.setupFundingRemove;
    if (!fundingId) return;
    const context = getContext();
    setSetup(removeSetupFunding(context.setup, fundingId, setupContext(context)));
  });

  elements.addButton.addEventListener("click", () => {
    const context = getContext();
    setSetup(addCustomSetupItem(context.setup, {}, setupContext(context)));
  });

  addFundingButton?.addEventListener("click", () => {
    const context = getContext();
    setSetup(addSetupFunding(context.setup, {}, setupContext(context)));
  });

  exportCsvButton?.addEventListener("click", () => {
    if (!lastResult || !lastIntegrated) render();
    const sectorId = getContext()?.sector?.id ?? "isletme";
    downloadSetupCsv(lastResult, lastIntegrated, `${sectorId}-kurulus-acilis.csv`);
  });

  elements.syncButton.addEventListener("click", () => {
    const context = getContext();
    setSetup(synchronizeSetupWorkspace(context.setup, setupContext(context)));
  });

  panelControl = createWorkspacePanel({
    id: "setup",
    panel: elements.panel,
    toggleButton: elements.toggleButton,
    closeButton: elements.closeButton,
    onOpen: render,
  });
  render();

  return {
    render,
    isOpen: () => panelControl?.isOpen() ?? false,
    open: () => panelControl?.open?.(),
    close: () => panelControl?.close?.(),
  };
}
