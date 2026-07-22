import { buildAgencyPresentation as buildLegacyAgencyPresentation } from "./agency-presentation.js";
import { buildAgencyProfileKpis } from "./agency-profile-presentation.js";

export function buildAgencyPresentation(result) {
  const presentation = buildLegacyAgencyPresentation(result);
  const rawDriverLabel = result.profileMetrics.driverLabel.replace(/^Aylık\s+/u, "");
  const driverLabel = rawDriverLabel.charAt(0).toLocaleUpperCase("tr-TR") + rawDriverLabel.slice(1);
  const driverKpi = presentation.kpis.find((item) => item.id === "project_profit");
  if (driverKpi) {
    driverKpi.label = `${driverLabel} başı net kâr`;
    driverKpi.value = result.projectNetProfit;
    driverKpi.note = `${round(result.profileMetrics.equivalentUnits, 1)} birim`;
  }
  const breakevenKpi = presentation.kpis.find((item) => item.id === "breakeven_projects");
  if (breakevenKpi) {
    breakevenKpi.label = `Başabaş ${driverLabel.toLocaleLowerCase("tr-TR")}`;
    breakevenKpi.value = result.breakevenDriverValue;
    breakevenKpi.suffix = "";
  }
  const projectScenario = presentation.scenarioMetrics.find((item) => item.id === "projects");
  if (projectScenario) {
    projectScenario.label = result.profileMetrics.driverLabel;
    projectScenario.value = result.profileMetrics.driverValue;
  }

  presentation.kpis = [
    ...presentation.kpis.slice(0, 2),
    ...buildAgencyProfileKpis(result),
    ...presentation.kpis.slice(2),
  ];

  presentation.keySplit.splice(1, 0, { label: "Revizyon / kapsam tahsilatı", value: result.profileMetrics.revisionRevenue });
  if (result.operatingGrantIncome > 0) {
    presentation.keySplit.splice(2, 0, { label: "Faaliyet hibesi / destek geliri", value: result.operatingGrantIncome });
  }

  presentation.breakdown.unshift({
    title: "Profil · Gelir sürücüsü ve sözleşme",
    rows: [
      ["İş türü", result.profile.label, "text"],
      [result.profileMetrics.driverLabel, result.profileMetrics.driverValue, result.input.businessType === "performance_marketing" ? undefined : "number"],
      ["Ana hizmet geliri", result.profileMetrics.coreRevenue],
      ["Revizyon / kapsam tahsilatı", result.profileMetrics.revisionRevenue],
      ["Peşinat oranı", result.input.advanceCollectionRate, "percent"],
      ["Etkin tahsilat gecikmesi", result.effectiveCollectionDelayDays, "number"],
    ],
  });

  presentation.breakdown.splice(4, 0, {
    title: "Profil · Ekip ve taşeron kapasitesi",
    rows: [
      ["İç ekip hedef kapasitesi", result.targetBillableCapacityHours, "number"],
      ["İç ekip kullanılan saat", result.internalDeliveryHours, "number"],
      ["Taşeron tarafından sağlanan saat", result.subcontractorHours, "number"],
      ["Toplam karşılanabilir teslimat saati", result.totalAvailableDeliveryHours, "number"],
      ["Karşılanamayan teslimat saati", -result.unfundedDeliveryHours, "number"],
      ...result.staffRows.map((row) => [`Ekip · ${row.role}`, row.billableHours, "number"]),
      ...result.subcontractorRows.map((row) => [`Taşeron · ${row.name}`, -row.monthlyCost]),
    ],
  });

  return presentation;
}

function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const power = 10 ** digits;
  return Math.round((number + Number.EPSILON) * power) / power;
}
