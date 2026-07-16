export const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
export const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
export const percent = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 });

export function formatValue(value, format = "number", options = {}) {
  if (format === "text") return escapeHtml(value ?? "");
  if (format === "boolean") return value ? "Evet" : "Hayır";
  if (value == null || !Number.isFinite(Number(value))) return "—";
  const numeric = Number(value);
  switch (format) {
    case "money": return currency.format(numeric);
    case "percent": return percent.format(numeric);
    case "numberSuffix": return `${number.format(numeric)}${escapeHtml(options.suffix ?? "")}`;
    case "multiple": return `${number.format(numeric)}x`;
    case "months": return `${number.format(numeric)} ay`;
    default: return number.format(numeric);
  }
}

export function exportValue(value, format) {
  if (format === "text") return String(value ?? "");
  if (format === "boolean") return value ? "Evet" : "Hayır";
  if (value == null || !Number.isFinite(Number(value))) return "";
  return Number(value);
}

export function csvCell(value) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

export function round(value, digits = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  const power = 10 ** digits;
  return Math.round((parsed + Number.EPSILON) * power) / power;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
