const clone = (value) => structuredClone(value);
const rate = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const nonNegative = (value) => Math.max(0, Number(value) || 0);

const service = (name, sessionShareRate, price, durationMinutes, consumableCost, employeeCommissionRate) => ({
  name, sessionShareRate, price, durationMinutes, consumableCost, employeeCommissionRate,
});
const staff = (role, count, monthlyCostPerPerson, productiveHoursPerDay, revenueCommissionRate) => ({
  role, count, monthlyCostPerPerson, productiveHoursPerDay, revenueCommissionRate,
});

export const BEAUTY_PROFILE_INPUT_DEFAULTS = {
  chairCount: 4,
  tableCount: 4,
  roomCount: 4,
  deviceCount: 2,
  specialistCount: 4,
  advancedServiceMixEnabled: false,
  serviceMix: [
    service("Standart hizmet", 0.60, 1400, 60, 135, 0.08),
    service("Kısa hizmet", 0.25, 850, 35, 75, 0.06),
    service("Premium hizmet", 0.15, 2400, 90, 260, 0.10),
  ],
  advancedStaffMixEnabled: false,
  staffRoles: [
    staff("Uzman", 4, 45000, 7, 0.08),
    staff("Destek", 1, 35000, 5, 0),
  ],
  customerBaseDemandEnabled: false,
  activeCustomerBase: 420,
  monthlyNewCustomers: 120,
  repeatVisitRate: 0.55,
  visitsPerReturningCustomer: 1,
  demandScale: 1,
  noShowRecoveryRate: 0,
  retailSalesEnabled: false,
  monthlyRetailRevenue: 0,
  retailProductCostRate: 0.45,
};

export const BEAUTY_BUSINESS_PROFILES = {
  hair_salon: {
    label: "Kuaför", resourceKey: "chairCount", resourceLabel: "Koltuk",
    defaults: {
      servicePrice: 1150, sessionDurationMinutes: 70, chairCount: 5, occupancyRate: 0.72,
      noShowRate: 0.07, staffCount: 6, staffCost: 300000, employeeCommissionRate: 0.12,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Kesim / şekillendirme", 0.38, 900, 55, 90, 0.12),
        service("Boya / işlem", 0.34, 2300, 130, 420, 0.14),
        service("Fön / bakım", 0.28, 650, 40, 75, 0.10),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Kuaför", 4, 48000, 7, 0.12), staff("Yardımcı", 2, 33000, 6, 0)],
      retailSalesEnabled: true, monthlyRetailRevenue: 60000, retailProductCostRate: 0.52,
    },
  },
  barber: {
    label: "Berber", resourceKey: "chairCount", resourceLabel: "Koltuk",
    defaults: {
      servicePrice: 550, sessionDurationMinutes: 35, chairCount: 4, occupancyRate: 0.76,
      noShowRate: 0.05, staffCount: 4, staffCost: 210000, employeeCommissionRate: 0.10,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Saç kesimi", 0.52, 520, 35, 35, 0.10),
        service("Sakal", 0.28, 300, 20, 20, 0.08),
        service("Bakım paketi", 0.20, 950, 60, 130, 0.12),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Berber", 4, 50000, 7.5, 0.10)],
      rent: 85000, deviceInvestment: 350000, renovation: 300000,
    },
  },
  beauty_salon: {
    label: "Güzellik salonu", resourceKey: "stations", resourceLabel: "Koltuk / oda / cihaz",
    defaults: {},
  },
  nail_studio: {
    label: "Tırnak stüdyosu", resourceKey: "tableCount", resourceLabel: "Masa",
    defaults: {
      servicePrice: 950, sessionDurationMinutes: 90, tableCount: 4, occupancyRate: 0.70,
      noShowRate: 0.09, staffCount: 4, staffCost: 220000, consumableCostPerSession: 180,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Manikür / kalıcı oje", 0.50, 850, 75, 150, 0.10),
        service("Protez tırnak", 0.32, 1450, 125, 280, 0.12),
        service("Bakım / çıkarma", 0.18, 500, 45, 70, 0.08),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Tırnak uzmanı", 4, 50000, 7, 0.10)],
      customerBaseDemandEnabled: true, activeCustomerBase: 360, monthlyNewCustomers: 90,
      repeatVisitRate: 0.62, visitsPerReturningCustomer: 1,
    },
  },
  skin_care: {
    label: "Cilt bakım salonu", resourceKey: "roomCount", resourceLabel: "Bakım odası",
    defaults: {
      servicePrice: 1900, sessionDurationMinutes: 80, roomCount: 3, occupancyRate: 0.64,
      noShowRate: 0.08, staffCount: 4, staffCost: 250000, consumableCostPerSession: 260,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Klasik bakım", 0.45, 1650, 75, 230, 0.08),
        service("İleri bakım", 0.35, 2600, 95, 390, 0.10),
        service("Hızlı bakım", 0.20, 950, 45, 120, 0.07),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Estetisyen", 3, 55000, 7, 0.09), staff("Danışma", 1, 38000, 4, 0)],
      roomCount: 3, deviceInvestment: 1200000,
      retailSalesEnabled: true, monthlyRetailRevenue: 80000, retailProductCostRate: 0.48,
    },
  },
  laser_epilation: {
    label: "Lazer / epilasyon merkezi", resourceKey: "deviceCount", resourceLabel: "Cihaz",
    defaults: {
      servicePrice: 2200, sessionDurationMinutes: 30, deviceCount: 2, occupancyRate: 0.68,
      noShowRate: 0.10, staffCount: 4, staffCost: 280000, consumableCostPerSession: 95,
      deviceInvestment: 2800000, deviceUsefulLifeMonths: 72, maintenance: 30000,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Bölgesel seans", 0.48, 1450, 22, 65, 0.07),
        service("Çoklu bölge", 0.37, 2850, 38, 110, 0.08),
        service("Tüm vücut", 0.15, 5200, 65, 180, 0.09),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Uygulama uzmanı", 3, 60000, 7, 0.08), staff("Danışma", 1, 42000, 5, 0)],
      customerBaseDemandEnabled: true, activeCustomerBase: 650, monthlyNewCustomers: 120,
      repeatVisitRate: 0.70, visitsPerReturningCustomer: 1,
      noShowRecoveryRate: 0.20,
    },
  },
  brow_lash: {
    label: "Kaş / kirpik stüdyosu", resourceKey: "specialistCount", resourceLabel: "Uzman",
    defaults: {
      servicePrice: 1250, sessionDurationMinutes: 85, specialistCount: 4, occupancyRate: 0.72,
      noShowRate: 0.10, staffCount: 4, staffCost: 230000, consumableCostPerSession: 170,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Kaş tasarım", 0.35, 800, 45, 90, 0.10),
        service("Kirpik lifting", 0.30, 1200, 70, 150, 0.11),
        service("İpek kirpik", 0.35, 1850, 125, 260, 0.13),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Kaş / kirpik uzmanı", 4, 52000, 7, 0.11)],
      customerBaseDemandEnabled: true, activeCustomerBase: 430, monthlyNewCustomers: 110,
      repeatVisitRate: 0.58, visitsPerReturningCustomer: 1,
    },
  },
  massage_spa: {
    label: "Masaj / spa salonu", resourceKey: "roomCount", resourceLabel: "Masaj odası",
    defaults: {
      servicePrice: 2450, sessionDurationMinutes: 75, roomCount: 5, occupancyRate: 0.58,
      noShowRate: 0.08, staffCount: 7, staffCost: 420000, consumableCostPerSession: 210,
      rent: 180000, utilities: 65000, deviceInvestment: 650000, renovation: 1000000,
      advancedServiceMixEnabled: true,
      serviceMix: [
        service("Klasik masaj", 0.45, 2100, 60, 160, 0.10),
        service("Terapi / özel masaj", 0.35, 2900, 90, 240, 0.12),
        service("Spa paketi", 0.20, 4200, 120, 380, 0.12),
      ],
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Terapist", 5, 58000, 7, 0.11), staff("Destek / resepsiyon", 2, 40000, 5, 0)],
    },
  },
};

export function getBeautyBusinessProfile(businessType) {
  return BEAUTY_BUSINESS_PROFILES[businessType] ?? BEAUTY_BUSINESS_PROFILES.beauty_salon;
}

export function calculateBeautyServiceEconomics(input) {
  if (!input.advancedServiceMixEnabled || !input.serviceMix.length) {
    return {
      shareTotal: 1,
      effectivePrice: nonNegative(input.servicePrice),
      effectiveDurationMinutes: Math.max(5, nonNegative(input.sessionDurationMinutes)),
      effectiveConsumableCost: nonNegative(input.consumableCostPerSession),
      effectiveEmployeeCommissionRate: rate(input.employeeCommissionRate),
      rows: [],
    };
  }
  const shareTotal = input.serviceMix.reduce((sum, row) => sum + rate(row.sessionShareRate), 0);
  const denominator = shareTotal || 1;
  const weighted = (key) => input.serviceMix.reduce(
    (sum, row) => sum + rate(row.sessionShareRate) * nonNegative(row[key]), 0,
  ) / denominator;
  return {
    shareTotal,
    effectivePrice: weighted("price"),
    effectiveDurationMinutes: Math.max(5, weighted("durationMinutes")),
    effectiveConsumableCost: weighted("consumableCost"),
    effectiveEmployeeCommissionRate: input.serviceMix.reduce(
      (sum, row) => sum + rate(row.sessionShareRate) * rate(row.employeeCommissionRate), 0,
    ) / denominator,
    rows: clone(input.serviceMix),
  };
}

export function calculateBeautyStaffEconomics(input, durationMinutes) {
  if (!input.advancedStaffMixEnabled || !input.staffRoles.length) {
    return {
      enabled: false,
      staffCount: nonNegative(input.staffCount),
      monthlyStaffCost: nonNegative(input.staffCost),
      dailyStaffCapacity: Number.POSITIVE_INFINITY,
      effectiveCommissionRate: null,
      rows: [],
    };
  }
  const rows = input.staffRoles.map((row) => ({
    ...row,
    monthlyCost: nonNegative(row.count) * nonNegative(row.monthlyCostPerPerson),
    dailyCapacity: nonNegative(row.count) * nonNegative(row.productiveHoursPerDay) * 60 / Math.max(5, durationMinutes),
  }));
  const staffCount = rows.reduce((sum, row) => sum + nonNegative(row.count), 0);
  const denominator = staffCount || 1;
  return {
    enabled: true,
    staffCount,
    monthlyStaffCost: rows.reduce((sum, row) => sum + row.monthlyCost, 0),
    dailyStaffCapacity: rows.reduce((sum, row) => sum + row.dailyCapacity, 0),
    effectiveCommissionRate: rows.reduce(
      (sum, row) => sum + nonNegative(row.count) * rate(row.revenueCommissionRate), 0,
    ) / denominator,
    rows,
  };
}

export function deriveBeautyOperations(input) {
  const profile = getBeautyBusinessProfile(input.businessType);
  const serviceEconomics = calculateBeautyServiceEconomics(input);
  const staffEconomics = calculateBeautyStaffEconomics(input, serviceEconomics.effectiveDurationMinutes);
  const resourceCount = Math.max(1, nonNegative(input[profile.resourceKey]));
  const resourceDailyCapacity = resourceCount * nonNegative(input.workingHoursPerDay) * 60
    / serviceEconomics.effectiveDurationMinutes;
  const dailyCapacity = staffEconomics.enabled
    ? Math.min(resourceDailyCapacity, staffEconomics.dailyStaffCapacity)
    : resourceDailyCapacity;
  const monthlyCapacity = dailyCapacity * Math.max(1, nonNegative(input.openDays));

  let rawDemandAppointments;
  let driverLabel;
  let driverValue;
  if (input.customerBaseDemandEnabled) {
    const returningAppointments = nonNegative(input.activeCustomerBase)
      * rate(input.repeatVisitRate)
      * nonNegative(input.visitsPerReturningCustomer);
    rawDemandAppointments = (nonNegative(input.monthlyNewCustomers) + returningAppointments)
      * nonNegative(input.demandScale, 1);
    driverLabel = "Aylık talep";
    driverValue = rawDemandAppointments;
  } else {
    rawDemandAppointments = monthlyCapacity * rate(input.occupancyRate) * nonNegative(input.demandScale, 1);
    driverLabel = "Doluluk";
    driverValue = rate(input.occupancyRate) * nonNegative(input.demandScale, 1);
  }
  const bookedAppointments = Math.min(monthlyCapacity, rawDemandAppointments);
  const unmetDemandAppointments = Math.max(0, rawDemandAppointments - monthlyCapacity);
  const effectiveOccupancyRate = monthlyCapacity > 0 ? bookedAppointments / monthlyCapacity : 0;

  return {
    profile,
    serviceEconomics,
    staffEconomics,
    resourceCount,
    resourceDailyCapacity,
    dailyCapacity,
    monthlyCapacity,
    rawDemandAppointments,
    bookedAppointments,
    unmetDemandAppointments,
    effectiveOccupancyRate,
    driverLabel,
    driverValue,
  };
}

export function applyBeautyProfileDemandScenario(input, scenarioId) {
  const factor = scenarioId === "pessimistic" ? 0.68 : scenarioId === "optimistic" ? 1.28 : 1;
  const next = clone(input);
  if (next.customerBaseDemandEnabled) {
    next.monthlyNewCustomers = nonNegative(next.monthlyNewCustomers * factor);
    next.activeCustomerBase = nonNegative(next.activeCustomerBase * factor);
  } else {
    next.occupancyRate = rate(next.occupancyRate * factor);
  }
  return next;
}

export function buildBeautyProfileWarnings(result) {
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (result.unmetDemandAppointments > 0) add("profile_unmet_demand", "soft", "Talep kapasiteyi aşıyor; karşılanamayan randevu oluşuyor.");
  if (result.capacityUtilization > 0.92) add("profile_capacity_tight", "soft", "Kapasite kullanımı %92'nin üzerinde; yoğun saatlerde esneklik azalıyor.");
  if (result.input.advancedServiceMixEnabled && Math.abs(result.serviceMixShareTotal - 1) > 0.02) {
    add("service_mix_share", "hard", "Hizmet karması seans paylarının toplamı %100 olmalıdır.");
  }
  if (result.input.advancedStaffMixEnabled && result.staffCapacityBottleneck) {
    add("staff_bottleneck", "hard", "Personel üretken saatleri fiziksel koltuk/oda/cihaz kapasitesini sınırlıyor.");
  }
  if (result.input.customerBaseDemandEnabled && result.input.repeatVisitRate < 0.35) {
    add("repeat_visit_low", "soft", "Tekrar ziyaret oranı düşük; müşteri edinme maliyeti üzerindeki baskı artabilir.");
  }
  if (result.input.businessType === "laser_epilation" && result.devicePaybackMonths != null && result.devicePaybackMonths > 36) {
    add("laser_device_payback", "soft", "Lazer cihazı geri dönüşü 36 ayı aşıyor.");
  }
  if (result.input.businessType === "massage_spa" && result.capacityUtilization < 0.35) {
    add("spa_room_idle", "soft", "Spa odalarının büyük bölümü boş kalıyor; oda ve terapist planı gözden geçirilmeli.");
  }
  if (["hair_salon", "barber"].includes(result.input.businessType) && result.revenuePerResource <= 0) {
    add("chair_revenue", "hard", "Koltuk başı gelir oluşmuyor.");
  }
  return warnings;
}

export function buildBeautyProfileKpis(result) {
  return [
    { id: "profile_resource", label: result.profile.resourceLabel, value: result.resourceCount, format: "number" },
    { id: "capacity_utilization", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent", negative: result.capacityUtilization > 0.95 },
    { id: "revenue_per_resource", label: `${result.profile.resourceLabel} başı ciro`, value: result.revenuePerResource, format: "money" },
    { id: "repeat_visit", label: "Tekrar ziyaret oranı", value: result.input.repeatVisitRate, format: "percent", negative: result.input.customerBaseDemandEnabled && result.input.repeatVisitRate < 0.35 },
  ];
}
