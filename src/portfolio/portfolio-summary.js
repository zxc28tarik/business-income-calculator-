function finite(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

export function buildProjectFinancialSummary({ sector, scenarioId = "expected", inputs }) {
  const normalizedInputs = sector.normalizeInputs(inputs);
  const result = sector.calculateModel(normalizedInputs);
  const presentation = sector.buildPresentation(result);
  const grossRevenue = finite(
    result.grossRevenue,
    result.actualGrossRevenue,
    result.revenueAfterCommission,
    result.receipt?.receiptTry,
    result.platform?.customerPayment != null && result.input?.usdTry != null
      ? result.platform.customerPayment * result.input.usdTry
      : null,
  );
  const netProfit = finite(
    result.netProfit,
    result.tax?.publisherNetProfitTry,
    result.pnl?.netProfit,
    result.pnl?.earningsBeforeTaxTry,
  );
  const endingCash = finite(
    result.cashFlow?.endingCash,
    result.cashFlow?.endingCashTry,
    result.cashFlow?.rows?.at?.(-1)?.cashEnd,
    result.cashFlow?.months?.at?.(-1)?.cashTry,
  );
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  const hardWarnings = warnings.filter((warning) => warning.severity === "hard").length;
  const softWarnings = warnings.filter((warning) => warning.severity === "soft").length;
  const status = hardWarnings > 0 || netProfit < 0 || endingCash < 0
    ? "riskli"
    : softWarnings > 0 ? "dikkat" : "dengeli";
  return {
    sectorId: sector.id,
    sectorName: sector.name,
    scenarioId,
    scenarioLabel: "Kullanıcı girdileri",
    businessType: normalizedInputs.businessType ?? normalizedInputs.profileType ?? normalizedInputs.businessProfile ?? "",
    grossRevenue,
    netProfit,
    endingCash,
    hardWarnings,
    softWarnings,
    status,
    kpis: Array.isArray(presentation?.kpis) ? presentation.kpis.slice(0, 4) : [],
  };
}
