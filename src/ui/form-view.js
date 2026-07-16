import { evaluateVisibility } from "../core/sector-schema.js";
import { escapeHtml, round } from "./formatters.js";

export function findFieldDefinition(sector, key) {
  for (const section of sector.formSections) {
    const field = section.fields.find((candidate) => candidate.key === key);
    if (field) return field;
  }
  return null;
}

function fieldWrapper(field, inputs, content, extraClass = "") {
  const hidden = evaluateVisibility(field.visibleWhen, inputs) ? "" : "conditional-hidden";
  return `<div class="field ${field.full ? "full" : ""} ${extraClass} ${hidden}" data-field-wrapper="${field.key}">
    ${content}
  </div>`;
}

function renderTableCell(field, column, row, rowIndex) {
  const attrs = `data-table-key="${field.key}" data-row-index="${rowIndex}" data-column-key="${column.key}" data-cell-type="${column.type}"`;
  if (column.type === "boolean") {
    return `<input ${attrs} type="checkbox" aria-label="${escapeHtml(column.label)}" />`;
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

function renderTableField(field, inputs) {
  const rows = Array.isArray(inputs[field.key]) ? inputs[field.key] : [];
  const maxReached = Number.isInteger(field.maxRows) && rows.length >= field.maxRows;
  const table = `
    <div class="table-field-heading">
      <div><label>${escapeHtml(field.label)}</label>${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}</div>
      ${field.allowAdd === false ? "" : `<button type="button" class="table-action" data-table-add="${field.key}" ${maxReached ? "disabled" : ""}>Satır ekle</button>`}
    </div>
    <div class="input-table-scroll">
      <table class="input-table">
        <thead><tr>${field.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}${field.allowRemove === false ? "" : "<th>İşlem</th>"}</tr></thead>
        <tbody>
          ${rows.length ? rows.map((row, rowIndex) => `
            <tr>${field.columns.map((column) => `<td>${renderTableCell(field, column, row, rowIndex)}</td>`).join("")}
            ${field.allowRemove === false ? "" : `<td><button type="button" class="table-remove" data-table-remove="${field.key}" data-row-index="${rowIndex}" ${rows.length <= (field.minRows ?? 0) ? "disabled" : ""}>Sil</button></td>`}</tr>
          `).join("") : `<tr><td colspan="${field.columns.length + (field.allowRemove === false ? 0 : 1)}" class="empty-table">Henüz satır yok.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  return fieldWrapper(field, inputs, table, "table-field");
}

function renderField(field, inputs) {
  if (field.type === "table") return renderTableField(field, inputs);

  if (field.type === "boolean") {
    return fieldWrapper(field, inputs, `
      <label class="checkbox-control" for="${field.key}">
        <input id="${field.key}" data-key="${field.key}" data-field-type="boolean" type="checkbox" />
        <span><strong>${escapeHtml(field.label)}</strong>${field.hint ? `<small>${escapeHtml(field.hint)}</small>` : ""}</span>
      </label>
    `, "boolean-field");
  }

  if (field.type === "select") {
    return fieldWrapper(field, inputs, `
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <select id="${field.key}" data-key="${field.key}" data-field-type="select">
        ${field.options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("")}
      </select>
      ${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}
    `);
  }

  if (field.type === "text") {
    return fieldWrapper(field, inputs, `
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <input id="${field.key}" data-key="${field.key}" data-field-type="text" type="text" />
      ${field.hint ? `<span class="field-hint">${escapeHtml(field.hint)}</span>` : ""}
    `);
  }

  const isRate = field.type === "rate";
  const hint = field.hint ?? (isRate ? "Yüzde olarak girin (ör. 25 = %25)" : "");
  return fieldWrapper(field, inputs, `
    <label for="${field.key}">${escapeHtml(field.label)}</label>
    <input id="${field.key}" data-key="${field.key}" data-field-type="${field.type}" data-rate="${isRate}"
      data-negative="${Boolean(field.allowNegative)}" type="number" step="${field.step ?? 1}" />
    ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
  `);
}

export function renderFormHtml(sector, inputs) {
  return sector.formSections.map((section, sectionIndex) => `
    <details class="form-section ${evaluateVisibility(section.visibleWhen, inputs) ? "" : "conditional-hidden"}"
      data-section-index="${sectionIndex}" ${section.open ? "open" : ""}>
      <summary>${escapeHtml(section.title)}</summary>
      ${section.note ? `<p class="section-note">${escapeHtml(section.note)}</p>` : ""}
      <div class="form-fields">${section.fields.map((field) => renderField(field, inputs)).join("")}</div>
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

export function syncFormVisibility(root, sector, inputs) {
  root.querySelectorAll("[data-section-index]").forEach((element) => {
    const section = sector.formSections[Number(element.dataset.sectionIndex)];
    element.classList.toggle("conditional-hidden", !evaluateVisibility(section?.visibleWhen, inputs));
  });
  root.querySelectorAll("[data-field-wrapper]").forEach((element) => {
    const field = findFieldDefinition(sector, element.dataset.fieldWrapper);
    element.classList.toggle("conditional-hidden", !evaluateVisibility(field?.visibleWhen, inputs));
  });
}
