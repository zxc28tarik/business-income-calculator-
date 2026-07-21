import { buildFinancialReportModel } from "./report-model.js";
import { downloadFinancialReport } from "./report-document.js";

export function exportFinancialReport(context) {
  const report = buildFinancialReportModel(context);
  const html = downloadFinancialReport(report);
  return { report, html };
}
