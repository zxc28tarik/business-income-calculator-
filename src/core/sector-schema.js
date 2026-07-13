const REQUIRED_FUNCTIONS = [
  "normalizeInputs",
  "applyScenario",
  "calculateModel",
  "calculateScenarioComparison",
  "buildPresentation",
];

const VALID_FIELD_TYPES = new Set(["number", "rate", "select"]);

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
        if (!(field.key in (definition.defaultInputs ?? {}))) {
          errors.push(`${field.key} için defaultInputs değeri bulunamadı.`);
        }
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

export function initializeScenarioInputs(definition, baseInputs = definition.defaultInputs) {
  const expected = definition.normalizeInputs(baseInputs);
  return Object.fromEntries(
    Object.keys(definition.scenarios).map((scenarioId) => [scenarioId, definition.applyScenario(expected, scenarioId)]),
  );
}
