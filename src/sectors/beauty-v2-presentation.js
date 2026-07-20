import { buildBeautyProfileKpis } from "./beauty-business-profile-engine.js";
import { buildBeautyPresentation as buildLegacyBeautyPresentation } from "./beauty-presentation.js";

export function buildBeautyPresentation(result) {
  const presentation = buildLegacyBeautyPresentation(result);
  const baseKpis = presentation.kpis.filter((item) => item.id !== "occupancy");
  presentation.kpis = [
    ...baseKpis,
    ...buildBeautyProfileKpis(result),
  ];

  presentation.keySplit = [
    ...presentation.keySplit.slice(0, 5),
    ...(result.retailRevenue > 0 ? [{ label: "Perakende ürün geliri", value: result.retailRevenue }] : []),
    ...(result.operatingGrantIncome > 0 ? [{ label: "Faaliyet hibe / destek geliri", value: result.operatingGrantIncome }] : []),
    ...presentation.keySplit.slice(5),
  ];

  presentation.scenarioMetrics = [
    ...presentation.scenarioMetrics,
    { id: "capacity_utilization", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent" },
    { id: "unmet_demand", label: "Karşılanamayan randevu", value: result.unmetDemandAppointments, format: "number" },
  ];

  const profileRows = [
    ["İş türü", result.profile.label, "text"],
    [result.profile.resourceLabel, result.resourceCount, "number"],
    ["Fiziksel günlük kapasite", result.resourceDailyCapacity, "number"],
    ["Personel günlük kapasitesi", Number.isFinite(result.staffDailyCapacity) ? result.staffDailyCapacity : null, "number"],
    ["Etkin günlük kapasite", result.dailyCapacity, "number"],
    ["Aylık hesaplanan talep", result.rawDemandAppointments, "number"],
    ["Karşılanamayan randevu", -result.unmetDemandAppointments, "number"],
    ["Kapasite kullanımı", result.capacityUtilization, "percent"],
    ["Etkin ortalama seans fiyatı", result.effectiveServicePrice],
    ["Etkin ortalama seans süresi", result.effectiveSessionDurationMinutes, "number"],
  ];

  const serviceRows = result.serviceMixRows.length
    ? [
      ...result.serviceMixRows.map((row) => [
        `${row.name} · pay ${formatRate(row.sessionShareRate)} · ${row.durationMinutes} dk`,
        row.price,
      ]),
      ["Hizmet karması pay toplamı", result.serviceMixShareTotal, "percent"],
      ["Etkin seans sarfı", -result.effectiveConsumableCostPerSession],
      ["Etkin çalışan prim oranı", result.effectiveEmployeeCommissionRate, "percent"],
    ]
    : [["Gelişmiş hizmet karması", 0, "number"]];

  const staffRows = result.staffRoleRows.length
    ? [
      ...result.staffRoleRows.map((row) => [
        `${row.role} · ${row.count} kişi · ${row.productiveHoursPerDay} saat`,
        -row.monthlyCost,
      ]),
      ["Etkin personel sayısı", result.effectiveStaffCount, "number"],
      ["Personel kapasite darboğazı", result.staffCapacityBottleneck ? "Evet" : "Hayır", "text"],
    ]
    : [["Etkin personel sayısı", result.effectiveStaffCount, "number"]];

  const retentionRows = [
    ["Müşteri tabanı modu", result.input.customerBaseDemandEnabled ? "Aktif" : "Kapalı", "text"],
    ["Aktif müşteri tabanı", result.input.activeCustomerBase, "number"],
    ["Aylık yeni müşteri", result.input.monthlyNewCustomers, "number"],
    ["Tekrar ziyaret oranı", result.input.repeatVisitRate, "percent"],
    ["Tekrar müşteri ziyaret sıklığı", result.input.visitsPerReturningCustomer, "number"],
    ["No-show brüt kaybı", -result.grossNoShowLoss],
    ["Ön ödeme / iptal bedeli geri kazanımı", result.noShowRecoveredRevenue],
  ];

  const extraFinancialRows = [
    ["Perakende ürün geliri", result.retailRevenue],
    ["Perakende ürün maliyeti", -result.retailProductCost],
    ["Faaliyet hibe / destek geliri", result.operatingGrantIncome],
    ["Finansman (P&L dışı)", result.input.financingAmount],
  ];

  presentation.breakdown = [
    { title: "Profil · Kapasite ve talep", rows: profileRows },
    { title: "Profil · Hizmet karması", rows: serviceRows },
    { title: "Profil · Personel rolleri", rows: staffRows },
    { title: "Profil · Tekrar ziyaret ve no-show", rows: retentionRows },
    ...presentation.breakdown,
    { title: "Ek gelir ve sınıflandırma", rows: extraFinancialRows },
  ];
  return presentation;
}

function formatRate(value) {
  return `${Math.round((Number(value) || 0) * 1000) / 10}%`;
}
