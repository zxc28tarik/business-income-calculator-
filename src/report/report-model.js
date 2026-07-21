import { evaluateVisibility } from "../core/sector-schema.js";
import { formatValue } from "../ui/formatters.js";
import { resolveCashFlowColumns } from "../ui/results-view.js";

const SEVERITY_ORDER = { hard: 0, soft: 1, info: 2 };

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

function cashMetrics(result) {
  const rows = result.cashFlow?.rows ?? [];
  const cashValues = rows.map((row) => Number(row.cashEnd)).filter(Number.isFinite);
  const endingCash = Number.isFinite(Number(result.cashFlow?.endingCash))
    ? Number(result.cashFlow.endingCash)
    : cashValues.at(-1) ?? null;
  const minimumCash = Number.isFinite(Number(result.cashFlow?.minimumCash))
    ? Number(result.cashFlow.minimumCash)
    : cashValues.length ? Math.min(...cashValues) : null;
  const firstNegativeMonth = rows.find((row) => Number(row.cashEnd) < 0)?.month ?? null;
  return { endingCash, minimumCash, firstNegativeMonth };
}

function buildDecision({ result, presentation }) {
  const warnings = result.warnings ?? [];
  const hardCount = warnings.filter((warning) => warning.severity === "hard").length;
  const softCount = warnings.filter((warning) => warning.severity === "soft").length;
  const netCard = findKpi(presentation, ["net_profit", "net kâr", "net sonuç"]);
  const netProfit = Number.isFinite(Number(result.netProfit))
    ? Number(result.netProfit)
    : Number.isFinite(Number(netCard?.value)) ? Number(netCard.value) : null;
  const cash = cashMetrics(result);

  if ((cash.endingCash != null && cash.endingCash < 0) || hardCount >= 2 || (netProfit != null && netProfit < 0 && hardCount > 0)) {
    return { id: "riskli", label: "Riskli görünüm", tone: "hard", hardCount, softCount, netProfit, ...cash };
  }
  if ((netProfit != null && netProfit < 0) || hardCount === 1 || softCount >= 3) {
    return { id: "kosullu", label: "Koşullu görünüm", tone: "soft", hardCount, softCount, netProfit, ...cash };
  }
  return { id: "dengeli", label: "Dengeli görünüm", tone: "positive", hardCount, softCount, netProfit, ...cash };
}

function buildExecutiveSummary(sector, scenarioLabel, decision, presentation) {
  const primary = findKpi(presentation, ["net_profit", "net kâr", "net sonuç"]) ?? presentation.kpis[0];
  const cash = findKpi(presentation, ["ending_cash", "12 ay sonu nakit", "nakit"]);
  const sentences = [
    `${sector.name} için ${scenarioLabel} senaryosu ${decision.label.toLocaleLowerCase("tr-TR")} üretiyor.`,
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
    id: scenario.id,
    label: scenario.label,
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
  const decision = buildDecision({ result, presentation });
  const warnings = [...(result.warnings ?? [])].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );
  const cashColumns = resolveCashFlowColumns(sector, result.cashFlow?.rows ?? []);

  return {
    reportVersion: "1.0",
    generatedAt: generatedAt instanceof Date ? generatedAt.toISOString() : String(generatedAt),
    sector: { id: sector.id, name: sector.name, family: sector.family, version: sector.version },
    businessType: resolveBusinessType(sector, inputs),
    scenario: { id: scenarioId, label: scenarioLabel },
    decision,
    executiveSummary: buildExecutiveSummary(sector, scenarioLabel, decision, presentation),
    kpis: presentation.kpis,
    keySplit: presentation.keySplit,
    warnings,
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
