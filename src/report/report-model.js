import { evaluateVisibility } from "../core/sector-schema.js";
import { buildDecisionHierarchy } from "../ui/decision-summary.js";
import { formatValue } from "../ui/formatters.js";
import {
  buildWarningViewModel,
  resolveCashFlowColumns,
} from "../ui/results-view.js";

const SEVERITY_ORDER = { hard: 0, soft: 1, info: 2, positive: 3 };

function fieldFormat(type) {
  if (type === "rate") return "percent";
  if (type === "boolean") return "boolean";
  if (type === "text" || type === "select") return "text";
  return "number";
}

function optionLabel(options = [], value) {
  const match = options.find((option) => Array.isArray(option)
    ? Object.is(option[0], value)
    : Object.is(option?.value, value));
  if (Array.isArray(match)) return match[1];
  return match?.label ?? value;
}

function fieldValue(field, value) {
  return field.type === "select" ? optionLabel(field.options, value) : value;
}

function buildAssumptions(sector, inputs) {
  const sections = [];
  for (const section of sector.formSections) {
    if (!evaluateVisibility(section.visibleWhen, inputs)) continue;
    const items = [];
    for (const field of section.fields) {
      if (!evaluateVisibility(field.visibleWhen, inputs)) continue;
      if (field.type === "table") {
        const rows = Array.isArray(inputs[field.key]) ? inputs[field.key] : [];
        items.push({
          type: "table",
          key: field.key,
          label: field.label,
          columns: field.columns.map((column) => ({
            key: column.key,
            label: column.label,
            format: fieldFormat(column.type),
            options: column.options,
          })),
          rows: rows.map((row) => Object.fromEntries(field.columns.map((column) => [
            column.key,
            column.type === "select" ? optionLabel(column.options, row?.[column.key]) : row?.[column.key],
          ]))),
        });
      } else {
        items.push({
          type: "value",
          key: field.key,
          label: field.label,
          value: fieldValue(field, inputs[field.key]),
          format: fieldFormat(field.type),
        });
      }
    }
    if (items.length) sections.push({ title: section.title, items });
  }
  return sections;
}

function findKpi(presentation, patterns) {
  return presentation.kpis.find((card) => patterns.some((pattern) =>
    card.id?.includes(pattern) || card.label?.toLocaleLowerCase("tr-TR").includes(pattern),
  ));
}

function finite(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function cashMetrics(result) {
  const rows = result.cashFlow?.rows ?? [];
  const cashValues = rows.map((row) => Number(row.cashEnd)).filter(Number.isFinite);
  const endingCash = finite(
    result.cashFlow?.endingCash,
    result.cashFlow?.endingCashTry,
    cashValues.at(-1),
  );
  const minimumCash = finite(
    result.cashFlow?.minimumCash,
    result.cashFlow?.minimumCashTry,
    cashValues.length ? Math.min(...cashValues) : null,
  );
  const firstNegativeMonth = rows.find((row) => Number(row.cashEnd) < 0)?.month ?? null;
  return {
    endingCash,
    minimumCash,
    firstNegativeMonth,
    additionalFundingNeed: minimumCash == null ? null : Math.max(0, -minimumCash),
  };
}

function buildReportDecision({ sector, result, presentation }) {
  const hierarchy = buildDecisionHierarchy({ sector, result, presentation });
  const warnings = result.warnings ?? [];
  const softCount = warnings.filter((warning) => warning.severity === "soft").length;
  const cash = cashMetrics(result);
  const status = hierarchy.decision.status;
  return {
    id: status,
    status,
    label: hierarchy.decision.statusLabel,
    tone: status === "riskli" ? "hard" : status === "dikkat" ? "soft" : "positive",
    message: hierarchy.decision.message,
    breakevenStatus: hierarchy.decision.breakevenStatus,
    hardCount: hierarchy.decision.hardCount,
    softCount,
    netProfit: hierarchy.decision.netProfit,
    ...cash,
    primaryKpis: hierarchy.primaryKpis,
    secondaryKpis: hierarchy.secondaryKpis,
  };
}

function buildExecutiveSummary(sector, scenarioLabel, decision, presentation) {
  const primary = decision.primaryKpis?.[0]
    ?? findKpi(presentation, ["net_profit", "net kâr", "net sonuç"])
    ?? presentation.kpis[0];
  const cash = decision.primaryKpis?.find((card) => card.id === "ending_cash")
    ?? findKpi(presentation, ["ending_cash", "12 ay sonu nakit", "nakit"]);
  const sentences = [
    `${sector.name} için ${scenarioLabel} senaryosu ${decision.label.toLocaleLowerCase("tr-TR")} üretiyor.`,
    decision.message,
  ];
  if (primary) sentences.push(`${primary.label}: ${formatValue(primary.value, primary.format, primary)}.`);
  if (cash && cash !== primary) sentences.push(`${cash.label}: ${formatValue(cash.value, cash.format, cash)}.`);
  if (decision.hardCount > 0) sentences.push(`${decision.hardCount} kritik ve ${decision.softCount} dikkat gerektiren uyarı bulunuyor.`);
  else if (decision.softCount > 0) sentences.push(`Kritik uyarı yok; ${decision.softCount} konu izlenmeli.`);
  else sentences.push("Temel eşiklerde kritik veya dikkat gerektiren uyarı oluşmadı.");
  return sentences;
}

function buildScenarioComparison(sector, scenarios) {
  const rows = scenarios.map((scenario) => ({
    ...scenario,
    metrics: sector.buildPresentation(scenario.result).scenarioMetrics,
  }));
  const metricIds = [];
  for (const row of rows) {
    for (const metric of row.metrics) if (!metricIds.includes(metric.id)) metricIds.push(metric.id);
  }
  return {
    scenarios: rows.map(({ id, label }) => ({ id, label })),
    metrics: metricIds.map((id) => {
      const template = rows.flatMap((row) => row.metrics).find((metric) => metric.id === id);
      return {
        id,
        label: template?.label ?? id,
        format: template?.format ?? "number",
        values: Object.fromEntries(rows.map((row) => [row.id, row.metrics.find((metric) => metric.id === id)?.value ?? null])),
      };
    }),
  };
}

function resolveBusinessType(sector, inputs) {
  for (const section of sector.formSections) {
    for (const field of section.fields) {
      if (field.type !== "select") continue;
      if (!field.key.toLowerCase().includes("business") && !field.label.toLocaleLowerCase("tr-TR").includes("iş tür")) continue;
      return optionLabel(field.options, inputs[field.key]);
    }
  }
  return null;
}

export function buildFinancialReportModel({
  sector,
  scenarioId,
  inputs,
  result,
  presentation,
  scenarios,
  generatedAt = new Date(),
}) {
  const scenarioLabel = sector.scenarios[scenarioId]?.label ?? scenarioId;
  const decision = buildReportDecision({ sector, result, presentation });
  const warnings = [...(result.warnings ?? [])].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );
  const warningCards = buildWarningViewModel(warnings, { expanded: true }).allItems.map((warning) => ({
    id: warning.id,
    severity: warning.severity,
    levelLabel: warning.levelLabel,
    title: warning.title,
    message: warning.message,
  }));
  const cashColumns = resolveCashFlowColumns(sector, result.cashFlow?.rows ?? []);

  return {
    reportVersion: "1.1",
    generatedAt: generatedAt instanceof Date ? generatedAt.toISOString() : String(generatedAt),
    sector: { id: sector.id, name: sector.name, family: sector.family, version: sector.version },
    businessType: resolveBusinessType(sector, inputs),
    scenario: { id: scenarioId, label: scenarioLabel },
    decision,
    executiveSummary: buildExecutiveSummary(sector, scenarioLabel, decision, presentation),
    primaryKpis: decision.primaryKpis,
    secondaryKpis: decision.secondaryKpis,
    kpis: presentation.kpis,
    keySplit: presentation.keySplit,
    warnings,
    warningCards,
    scenarios: buildScenarioComparison(sector, scenarios),
    assumptions: buildAssumptions(sector, inputs),
    cashFlow: {
      summary: cashMetrics(result),
      columns: cashColumns,
      rows: result.cashFlow?.rows ?? [],
    },
    disclaimer: "Bu rapor düzenlenebilir varsayımlara dayalı ön fizibilite çıktısıdır; yatırım tavsiyesi, mali müşavirlik, vergi danışmanlığı veya hukuki görüş değildir.",
  };
}
