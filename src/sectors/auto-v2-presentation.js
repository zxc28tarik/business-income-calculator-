import { buildAutoServicePresentation as buildLegacyPresentation } from "./auto-presentation.js";

export function buildAutoServicePresentation(result) {
  const base = buildLegacyPresentation(result);
  const profileKpis = [
    { id: "demand_fulfillment", label: "Talep karşılama oranı", value: result.demandFulfillmentRate, format: "percent", note: `${round(result.unmetDailyJobs, 1)} günlük karşılanamayan iş`, negative: result.demandFulfillmentRate < 0.9 },
    { id: "station_capacity", label: `${result.profile.capacityLabel} kapasitesi`, value: result.stationDailyCapacity, format: "numberSuffix", suffix: " iş/gün", note: `Etkin kapasite: ${round(result.dailyCapacity, 1)}` },
    { id: "staff_capacity", label: "Personel kapasitesi", value: Number.isFinite(result.staffDailyCapacity) ? result.staffDailyCapacity : null, format: "numberSuffix", suffix: " iş/gün", note: result.input.advancedStaffEnabled ? `${round(result.staffMetrics.productiveHours, 0)} üretken saat/ay` : "Personel tablosu kapalı" },
    { id: "stock_coverage", label: "Parça / sarf stok kapsamı", value: result.stockCoverageDays, format: "numberSuffix", suffix: " gün", note: result.inventoryPlanningEnabled ? `Hedef: ${round(result.input.targetPartsCoverageDays, 0)} gün` : "Stok planı kapalı", negative: result.stockCoverageDays != null && result.stockCoverageDays < result.input.targetPartsCoverageDays },
    { id: "working_capital", label: "Stok işletme sermayesi açığı", value: result.workingCapitalGap, format: "money", note: `Yeniden sipariş noktası: ${formatMoneyPlain(result.reorderPointCost)}`, negative: result.workingCapitalGap > 0 },
  ];

  const breakdown = [
    {
      title: "Profil · Talep, randevu ve kapasite",
      rows: [
        ["İş türü", result.profile.label, "text"],
        ["Günlük planlanan talep / iş", result.demandMetrics.requestedDaily, "number"],
        ["Randevuya gelmeme / iptal", result.demandMetrics.noShowRate, "percent"],
        ["Aylık iptal edilen iş", -result.demandMetrics.cancelledMonthly, "number"],
        ["İptal / kapora tahsilatı", result.cancellationRecoveryRevenue],
        ["Tamamlanan günlük iş", result.input.dailyVehicles, "number"],
        ["Karşılanamayan günlük iş", -result.unmetDailyJobs, "number"],
        ["Talep karşılama oranı", result.demandFulfillmentRate, "percent"],
        [`${result.profile.capacityLabel} günlük kapasitesi`, result.stationDailyCapacity, "number"],
        ["Personel günlük kapasitesi", Number.isFinite(result.staffDailyCapacity) ? result.staffDailyCapacity : null, "number"],
        ["Etkin günlük kapasite", result.dailyCapacity, "number"],
      ],
    },
    {
      title: "Profil · Hizmet, personel ve tekrar işçilik",
      rows: [
        ["Ortalama hizmet fiyatı", result.serviceMetrics.servicePrice],
        ["Ortalama hizmet süresi", result.serviceMetrics.durationMinutes, "number"],
        ["Tekrar işçilik oranı", result.serviceMetrics.reworkRate, "percent"],
        ["Tekrar işçilik malzeme maliyeti", -result.reworkMaterialCost],
        ["Personel aylık maliyeti", -result.staffMetrics.monthlyCost],
        ["Personel üretken saati", result.staffMetrics.productiveHours, "number"],
        ["Aktif müşteri tabanı", result.input.customerBaseDemandEnabled ? result.input.activeCustomerBase : null, "number"],
        ["Aylık tekrar ziyaret oranı", result.input.customerBaseDemandEnabled ? result.input.monthlyRepeatVisitRate : null, "percent"],
      ],
    },
    {
      title: "Profil · Parça, stok, tedarikçi ve taşeron",
      rows: [
        ["Araç başı parça / ürün geliri", result.serviceMetrics.partsRevenue],
        ["Parça / ürün maliyet oranı", result.serviceMetrics.partsCostRate, "percent"],
        ["Tedarikçi ortalama indirimi", result.supplierMetrics.discountRate, "percent"],
        ["Tedarikçi vadesi", result.supplierMetrics.paymentDelayDays, "number"],
        ["Tedarik süresi", result.supplierMetrics.leadTimeDays, "number"],
        ["Parça / sarf stok maliyeti", result.inventoryCapital],
        ["Stok kapsamı", result.stockCoverageDays, "number"],
        ["Hedef stok maliyeti", result.targetInventoryCost],
        ["Stok işletme sermayesi açığı", -result.workingCapitalGap],
        ["Yeniden sipariş noktası", result.reorderPointCost],
        ["Taşeron iş sayısı", result.subcontractMetrics.jobs, "number"],
        ["Taşeron brüt geliri", result.subcontractGrossRevenue],
        ["Taşeron maliyeti", -result.subcontractCost],
        ["Taşeron net katkı marjı", result.subcontractMargin, "percent"],
        ["Aylık faaliyet hibesi", result.operatingGrantIncome],
      ],
    },
  ];

  return {
    ...base,
    kpis: [...base.kpis, ...profileKpis],
    scenarioMetrics: [
      ...base.scenarioMetrics,
      { id: "demand_fulfillment", label: "Talep karşılama", value: result.demandFulfillmentRate, format: "percent" },
      { id: "stock_gap", label: "Stok sermaye açığı", value: result.workingCapitalGap, format: "money" },
    ],
    breakdown: [...breakdown, ...base.breakdown],
  };
}

function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const power = 10 ** digits;
  return Math.round((number + Number.EPSILON) * power) / power;
}

function formatMoneyPlain(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("tr-TR")} TL`;
}
