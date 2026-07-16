const REQUIRED_FUNCTIONS = [
  "normalizeInputs",
  "applyScenario",
  "calculateModel",
  "calculateScenarioComparison",
  "buildPresentation",
];

const VALID_FIELD_TYPES = new Set(["number", "rate", "select", "text", "boolean", "table"]);
const VALID_TABLE_COLUMN_TYPES = new Set(["number", "rate", "select", "text", "boolean"]);

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key);
}

function optionValues(options = []) {
  return options.map((option) => Array.isArray(option) ? option[0] : option?.value);
}

function validateCondition(condition, knownKeys, context, errors) {
  if (condition == null || typeof condition === "boolean" || typeof condition === "function") return;

  if (typeof condition !== "object" || Array.isArray(condition)) {
    errors.push(`${context} görünürlük koşulu geçersiz.`);
    return;
  }

  if (Array.isArray(condition.all)) {
    condition.all.forEach((item, index) => validateCondition(item, knownKeys, `${context}.all[${index}]`, errors));
    return;
  }
  if (Array.isArray(condition.any)) {
    condition.any.forEach((item, index) => validateCondition(item, knownKeys, `${context}.any[${index}]`, errors));
    return;
  }
  if (condition.not != null) {
    validateCondition(condition.not, knownKeys, `${context}.not`, errors);
    return;
  }

  if (typeof condition.key !== "string" || !knownKeys.has(condition.key)) {
    errors.push(`${context} görünürlük koşulunda geçerli bir alan anahtarı bulunmalıdır.`);
  }
  if (Object.prototype.hasOwnProperty.call(condition, "in") && !Array.isArray(condition.in)) {
    errors.push(`${context} görünürlük koşulundaki in değeri liste olmalıdır.`);
  }
}

function validateTableField(field, defaultValue, sectionTitle, errors) {
  if (!Array.isArray(defaultValue)) {
    errors.push(`${field.key} tablo alanının varsayılan değeri liste olmalıdır.`);
  }
  if (!Array.isArray(field.columns) || field.columns.length === 0) {
    errors.push(`${field.key} tablo alanında en az bir sütun bulunmalıdır.`);
    return;
  }

  const seenColumns = new Set();
  for (const column of field.columns) {
    if (!column?.key || !column?.label || !VALID_TABLE_COLUMN_TYPES.has(column?.type)) {
      errors.push(`${sectionTitle} bölümündeki ${field.key} tablosunda geçersiz sütun tanımı var.`);
      continue;
    }
    if (seenColumns.has(column.key)) {
      errors.push(`${field.key}.${column.key} tablo sütunu birden fazla tanımlanmış.`);
    }
    seenColumns.add(column.key);
    if (column.type === "select" && (!Array.isArray(column.options) || column.options.length === 0)) {
      errors.push(`${field.key}.${column.key} siçim sütununda seçenek bulunmalıdır.`);
    }
  }

  if (field.newRow != null && (typeof field.newRow !== "object" || Array.isArray(field.newRow))) {
    errors.push(`${field.key} tablo alanının newRow değeri nesne olmalıdır.`);
  }
  if (field.minRows != null && (!Number.isInteger(field.minRows) || field.minRows < 0)) {
    errors.push(`${field.key} tablo alanının minRows değeri sıfır veya pozitif tam sayı olmalıdır.`);
  }
  if (field.maxRows != null && (!Number.isInteger(field.maxRows) || field.maxRows < 1)) {
    errors.push(`${field.key} tablo alanının maxRows değeri pozitif tam sayı olmalıdır.`);
  }
  if (field.minRows != null && field.maxRows != null && field.minRows > field.maxRows) {
    errors.push(`${field.key} tablo alanında minRows, maxRows değerini aşamaz.`);
  }
}

export function validateSectorDefinition(definition) {
  const errors = [];
  const requiredText = ["id", "name", "family", "version", "status"];

  for (const key of requiredText) {
    if (typeof definition?.[key] !== "string" || !definition[key].trim()) {
      errors.push(`${key} alanı boş olamaz.`);
    }
  }

  if (!Array.isArray(definition?.businessTypes) || definition.businessTypes.length === 0) {
    errors.push("En az bir iş türü tanımlanmalıdır.");
  }

  if (!definition?.defaultInputs || typeof definition.defaultInputs !== "object") {
    errors.push("defaultInputs nesnesi zorunludur.");
  }

  if (!definition?.scenarios || typeof definition.scenarios !== "object") {
    errors.push("scenarios nesnesi zorunludur.");
  }

  if (!Array.isArray(definition?.formSections) || definition.formSections.length === 0) {
    errors.push("formSections listesi zorunludur.");
  } else {
    const seenKeys = new Set();
    const fields = [];

    for (const section of definition.formSections) {
      if (!section?.title || !Array.isArray(section.fields)) {
        errors.push("Her form bölümü başlık ve fields listesi içermelidir.");
        continue;
      }
      for (const field of section.fields) {
        if (!field?.key || !field?.label || !VALID_FIELD_TYPES.has(field?.type)) {
          errors.push(`${section.title} bölümünde geçersiz alan tanımı var.`);
          continue;
        }
        if (seenKeys.has(field.key)) errors.push(`${field.key} form alanı birden fazla tanımlanmış.`);
        seenKeys.add(field.key);
        fields.push({ field, sectionTitle: section.title });
        if (!(field.key in (definition.defaultInputs ?? {}))) {
          errors.push(`${field.key} için defaultInputs değeri bulunamadı.`);
          continue;
        }

        const defaultValue = definition.defaultInputs[field.key];
        if (field.type === "boolean" && typeof defaultValue !== "boolean") {
          errors.push(`${field.key} boolean alanının varsayılan değeri true/false olmalıdır.`);
        }
        if (field.type === "table") validateTableField(field, defaultValue, section.title, errors);
        if (field.type === "select" && (!Array.isArray(field.options) || field.options.length === 0)) {
          errors.push(`${field.key} seçim alanında seçenek bulunmalıdır.`);
        }
      }
    }

    for (const section of definition.formSections) {
      validateCondition(section.visibleWhen, seenKeys, `${section.title} bölümü`, errors);
    }
    for (const { field, sectionTitle } of fields) {
      validateCondition(field.visibleWhen, seenKeys, `${sectionTitle}.${field.key}`, errors);
    }
  }

  if (definition?.cashFlowColumns != null) {
    if (!Array.isArray(definition.cashFlowColumns) || definition.cashFlowColumns.length === 0) {
      errors.push("cashFlowColumns tanımlanırsa boş olmayan bir liste olmalıdır.");
    } else {
      const seenCashKeys = new Set();
      for (const column of definition.cashFlowColumns) {
        if (!column?.key || !column?.label) {
          errors.push("Her nakit tablosu sütununda key ve label bulunmalıdır.");
          continue;
        }
        if (seenCashKeys.has(column.key)) errors.push(`${column.key} nakit tablosu sütunu birden fazla tanımlanmış.`);
        seenCashKeys.add(column.key);
      }
    }
  }

  for (const functionName of REQUIRED_FUNCTIONS) {
    if (typeof definition?.[functionName] !== "function") {
      errors.push(`${functionName} fonksiyonu zorunludur.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertSectorDefinition(definition) {
  const validation = validateSectorDefinition(definition);
  if (!validation.valid) {
    throw new Error(`Geçersiz sektör tanımı (${definition?.id ?? "bilinmiyor"}):\n- ${validation.errors.join("\n- ")}`);
  }
  return definition;
}

export function numberField(key, label, step = 1, options = {}) {
  return { type: "number", key, label, step, ...options };
}

export function rateField(key, label, options = {}) {
  return { type: "rate", key, label, step: 0.1, ...options };
}

export function selectField(key, label, options, extra = {}) {
  return { type: "select", key, label, options, ...extra };
}

export function textField(key, label, options = {}) {
  return { type: "text", key, label, ...options };
}

export function booleanField(key, label, options = {}) {
  return { type: "boolean", key, label, ...options };
}

export function tableField(key, label, columns, options = {}) {
  return { type: "table", key, label, columns, full: true, ...options };
}

export function evaluateVisibility(condition, inputs = {}) {
  if (condition == null) return true;
  if (typeof condition === "boolean") return condition;
  if (typeof condition === "function") return Boolean(condition(inputs));
  if (Array.isArray(condition.all)) return condition.all.every((item) => evaluateVisibility(item, inputs));
  if (Array.isArray(condition.any)) return condition.any.some((item) => evaluateVisibility(item, inputs));
  if (condition.not != null) return !evaluateVisibility(condition.not, inputs);

  const value = inputs?.[condition.key];
  if (Object.prototype.hasOwnProperty.call(condition, "equals")) return Object.is(value, condition.equals);
  if (Object.prototype.hasOwnProperty.call(condition, "notEquals")) return !Object.is(value, condition.notEquals);
  if (Object.prototype.hasOwnProperty.call(condition, "in")) return condition.in.includes(value);
  if (Object.prototype.hasOwnProperty.call(condition, "truthy")) return Boolean(value) === Boolean(condition.truthy);
  if (Object.prototype.hasOwnProperty.call(condition, "exists")) return (value !== undefined && value !== null) === Boolean(condition.exists);
  return Boolean(value);
}

export function cloneInputValue(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  if (Array.isArray(value)) return value.map(cloneInputValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneInputValue(item)]));
  }
  return value;
}

export function coerceFieldValue(field, rawValue, checked = false) {
  switch (field?.type) {
    case "boolean":
      return Boolean(checked);
    case "text":
      return String(rawValue ?? "");
    case "select": {
      const allowed = optionValues(field.options);
      return allowed.includes(rawValue) ? rawValue : (allowed[0] ?? "");
    }
    case "number":
    case "rate": {
      let numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) numeric = Number(field.defaultValue) || 0;
      if (field.type === "rate" && !field.allowAboveOne) numeric = Math.min(1, numeric);
      if (!field.allowNegative) numeric = Math.max(0, numeric);
      return numeric;
    }
    default:
      return rawValue;
  }
}

export function createTableRow(field, seed = field?.newRow ?? {}) {
  return Object.fromEntries((field?.columns ?? []).map((column) => {
    const raw = Object.prototype.hasOwnProperty.call(seed ?? {}, column.key) ? seed[column.key] : column.defaultValue;
    return [column.key, coerceFieldValue(column, raw, raw)];
  }));
}

export function normalizeTableRows(rows, columns, fallbackRows = []) {
  const source = Array.isArray(rows) ? rows : fallbackRows;
  const field = { columns };
  return source.map((row) => createTableRow(field, row));
}

export function updateTableCell(rows, field, rowIndex, columnKey, rawValue, checked = false) {
  const column = field?.columns?.find((item) => item.key === columnKey);
  if (!column || !Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) return cloneInputValue(rows);
  const next = cloneInputValue(rows);
  next[rowIndex] = { ...next[rowIndex], [columnKey]: coerceFieldValue(column, rawValue, checked) };
  return next;
}

export function initializeScenarioInputs(definition, baseInputs = definition.defaultInputs) {
  const expected = definition.normalizeInputs(cloneInputValue(baseInputs));
  return Object.fromEntries(
    Object.keys(definition.scenarios).map((scenarioId) => {
      const scenario = definition.applyScenario(cloneInputValue(expected), scenarioId);
      return [scenarioId, cloneInputValue(definition.normalizeInputs(scenario))];
    }),
  );
}
