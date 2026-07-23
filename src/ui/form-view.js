import { evaluateVisibility } from "../core/sector-schema.js";
import { escapeHtml, round } from "./formatters.js";
import {
  getFieldImportance,
  getFieldMicrocopy,
  getSectionSummary,
  isFieldAvailableInMode,
  isSectionAvailableInMode,
} from "./view-mode.js";

export function findFieldDefinition(sector, key) {
  for (const section of sector.formSections) {
    const field = section.fields.find((candidate) => candidate.key === key);
    if (field) return field;
  }
  return null;
}

function fieldWrapper(sector, field, inputs, viewMode, content, extraClass = "") {
  const hidden = evaluateVisibility(field.visibleWhen, inputs) ? "" : "conditional-hidden";
  const importance = getFieldImportance(sector, field);
  const modeHidden = isFieldAvailableInMode(sector, field, viewMode) ? "" : "view-mode-hidden";
  return `<div class="field ${field.full ? "full" : ""} ${extraClass} ${hidden} ${modeHidden}"
    data-field-wrapper="${field.key}" data-field-importance="${importance}">
    ${content}
  </div>`;
}

function tableControlLabel(column, rowIndex) {
  return `${column.label} · Satır ${rowIndex + 1}`;
}

function renderTableCell(field, column, row, rowIndex) {
  const attrs = `data-table-key="${field.key}" data-row-index="${rowIndex}" data-column-key="${column.key}" data-cell-type="${column.type}" aria-label="${escapeHtml(tableControlLabel(column, rowIndex))}"`;
  if (column.type === "boolean") {
    return `<input ${attrs} type="checkbox" />`;
  }
  if (column.type === "select") {
    return `<select ${attrs}>${column.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}</select>`;
  }
  if (column.type === "text") {
    return `<input ${attrs} type="text" value="${escapeHtml(row?.[column.key] ?? "")}" />`;
  }
  const isRate = column.type === "rate";
  return `<input ${attrs} data-rate="${isRate}" data-negative="${Boolean(column.allowNegative)}" type="number" step="${column.step ?? (isRate ? 0.1 : 1)}" />`;
}

function renderTableField(sector, field, inputs, viewMode) {
  const rows = Array.isArray(inputs[field.key]) ? inputs[field.key] : [];
  const maxReached = Number.isInteger(field.maxRows) && rows.length >= field.maxRows;
  const table = `
    <div class="table-field-heading">
      <div><span class="table-field-label">${escapeHtml(field.label)}</span>${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}</div>
      ${field.allowAdd === false ? "" : `<button type="button" class="table-action" data-table-add="${field.key}" ${maxReached ? "disabled" : ""}>Satır ekle</button>`}
    </div>
    <div class="input-table-scroll" role="region" aria-label="${escapeHtml(field.label)}" tabindex="0">
      <table class="input-table">
        <thead><tr>${field.columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join("")}${field.allowRemove === false ? "" : "<th scope=\"col\">İşlem</th>"}</tr></thead>
        <tbody>
          ${rows.length ? rows.map((row, rowIndex) => `
            <tr>${field.columns.map((column) => `<td>${renderTableCell(field, column, row, rowIndex)}</td>`).join("")}
            ${field.allowRemove === false ? "" : `<td><button type="button" class="table-remove" data-table-remove="${field.key}" data-row-index="${rowIndex}" aria-label="${escapeHtml(`${field.label} satır ${rowIndex + 1} sil`)}" ${rows.length <= (field.minRows ?? 0) ? "disabled" : ""}>Sil</button></td>`}</tr>
          `).join("") : `<tr><td colspan="${field.columns.length + (field.allowRemove === false ? 0 : 1)}" class="empty-table">Henüz satır yok.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  return fieldWrapper(sector, field, inputs, viewMode, table, "table-field");
}

function renderField(sector, field, inputs, viewMode) {
  if (field.type === "table") return renderTableField(sector, field, inputs, viewMode);
  const hint = getFieldMicrocopy(field);

  if (field.type === "boolean") {
    return fieldWrapper(sector, field, inputs, viewMode, `
      <label class="checkbox-control" for="${field.key}">
        <input id="${field.key}" data-key="${field.key}" data-field-type="boolean" type="checkbox" />
        <span><strong>${escapeHtml(field.label)}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</span>
      </label>
    `, "boolean-field");
  }

  if (field.type === "select") {
    return fieldWrapper(sector, field, inputs, viewMode, `
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <select id="${field.key}" data-key="${field.key}" data-field-type="select">
        ${field.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}
      </select>
      ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
    `);
  }

  if (field.type === "text") {
    return fieldWrapper(sector, field, inputs, viewMode, `
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <input id="${field.key}" data-key="${field.key}" data-field-type="text" type="text" />
      ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
    `);
  }

  const isRate = field.type === "rate";
  return fieldWrapper(sector, field, inputs, viewMode, `
    <label for="${field.key}">${escapeHtml(field.label)}</label>
    <input id="${field.key}" data-key="${field.key}" data-field-type="${field.type}" data-rate="${isRate}"
      data-negative="${Boolean(field.allowNegative)}" type="number" step="${field.step ?? 1}" />
    ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
  `);
}

export function renderFormHtml(sector, inputs, { viewMode = "simple" } = {}) {
  return sector.formSections.map((section, sectionIndex) => `
    <details class="form-section ${evaluateVisibility(section.visibleWhen, inputs) ? "" : "conditional-hidden"} ${isSectionAvailableInMode(sector, section, viewMode) ? "" : "view-mode-hidden"}"
      data-section-index="${sectionIndex}" ${section.open || (viewMode === "simple" && sectionIndex === 0) ? "open" : ""}>
      <summary>
        <span class="section-title">${escapeHtml(section.title)}</span>
        <span class="section-summary" data-section-summary>${escapeHtml(getSectionSummary(sector, section, inputs, viewMode))}</span>
      </summary>
      ${section.note ? `<p class="section-note">${escapeHtml(section.note)}</p>` : ""}
      <div class="form-fields">${section.fields.map((field) => renderField(sector, field, inputs, viewMode)).join("")}</div>
    </details>
  `).join("");
}

export function syncFormInputs(root, inputs) {
  root.querySelectorAll("[data-key]").forEach((element) => {
    const key = element.dataset.key;
    if (!(key in inputs)) return;
    if (element.type === "checkbox") {
      element.checked = Boolean(inputs[key]);
    } else if (element.tagName === "SELECT" || element.type === "text") {
      element.value = inputs[key] ?? "";
    } else {
      element.value = element.dataset.rate === "true" ? round(inputs[key] * 100, 2) : round(inputs[key], 2);
    }
  });

  root.querySelectorAll("[data-table-key]").forEach((element) => {
    const rows = inputs[element.dataset.tableKey];
    const row = Array.isArray(rows) ? rows[Number(element.dataset.rowIndex)] : null;
    if (!row) return;
    const value = row[element.dataset.columnKey];
    if (element.type === "checkbox") element.checked = Boolean(value);
    else if (element.tagName === "SELECT" || element.type === "text") element.value = value ?? "";
    else element.value = element.dataset.rate === "true" ? round(Number(value) * 100, 2) : round(value, 2);
  });
}

export function syncFormVisibility(root, sector, inputs, viewMode = "simple") {
  root.querySelectorAll("[data-section-index]").forEach((element) => {
    const section = sector.formSections[Number(element.dataset.sectionIndex)];
    element.classList.toggle("conditional-hidden", !evaluateVisibility(section?.visibleWhen, inputs));
    element.classList.toggle("view-mode-hidden", !isSectionAvailableInMode(sector, section, viewMode));
    const summary = element.querySelector?.("[data-section-summary]");
    if (summary) summary.textContent = getSectionSummary(sector, section, inputs, viewMode);
  });
  root.querySelectorAll("[data-field-wrapper]").forEach((element) => {
    const field = findFieldDefinition(sector, element.dataset.fieldWrapper);
    element.classList.toggle("conditional-hidden", !evaluateVisibility(field?.visibleWhen, inputs));
    element.classList.toggle("view-mode-hidden", !isFieldAvailableInMode(sector, field, viewMode));
  });
}
