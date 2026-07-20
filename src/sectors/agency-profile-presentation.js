export function buildAgencyProfileWarnings(result) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (result.internalCapacityLoad > 1) add("internal_capacity_over", "hard", "Teslimat saati iç ekip kapasitesini aşıyor; taşeron veya teslim tarihi planı gerekir.");
  if (result.unfundedDeliveryHours > 0) add("unfunded_hours", "hard", "İç ekip ve taşeron saatleri toplam iş yükünü karşılamıyor.");
  if (result.input.scopeCreepRate > 0.15 && result.input.revisionRecoveryRate < 0.5) add("scope_creep", "soft", "Kapsam taşması yüksek ve revizyon saatlerinin yarısından azı müşteriye yansıtılıyor.");
  if (result.input.advanceCollectionRate < 0.20 && result.input.collectionDelayDays > 30) add("advance_low", "soft", "Düşük peşinat ve uzun tahsilat vadesi işletme sermayesi riskini artırıyor.");
  if (["social_media_agency", "seo_agency"].includes(result.input.businessType) && result.input.retainerClientCount < 3) add("retainer_concentration", "soft", "Retainer müşteri sayısı düşük; tek müşteri kaybı aylık geliri sert etkileyebilir.");
  if (result.input.businessType === "performance_marketing" && result.input.managementFeeRate < 0.06) add("management_fee_low", "soft", "Yönetim ücreti oranı düşük; ekip ve yazılım maliyetlerini karşılamayabilir.");
  return warnings;
}

export function buildAgencyProfileKpis(result) {
  return [
    {
      id: "profile_driver",
      label: result.profileMetrics.driverLabel,
      value: result.profileMetrics.driverValue,
      format: result.input.businessType === "performance_marketing" ? "money" : "number",
    },
    {
      id: "internal_capacity",
      label: "İç ekip kapasite yükü",
      value: result.internalCapacityLoad,
      format: "percent",
      negative: result.internalCapacityLoad > 1,
    },
    {
      id: "scope_recovery",
      label: "Revizyon tahsil oranı",
      value: result.input.revisionRecoveryRate,
      format: "percent",
      note: `${Math.round(result.profileMetrics.revisionRevenue || 0).toLocaleString("tr-TR")} TL revizyon geliri`,
    },
  ];
}
