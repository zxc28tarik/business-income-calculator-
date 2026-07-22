export const AUTO_V2_BUSINESS_TYPES = [
  ["car_wash", "Oto yıkama"],
  ["auto_detailing", "Oto kuaför"],
  ["deep_cleaning", "Detaylı temizlik"],
  ["tire_shop", "Lastikçi"],
  ["window_film_wrap", "Cam filmi / kaplama"],
  ["small_repair_shop", "Küçük bakım / servis"],
  ["body_paint", "Kaporta / boya"],
  ["mobile_service", "Mobil oto servis"],
];

export const AUTO_PROFILE_DEFAULT_INPUTS = {
  profileDriverEnabled: true,
  profileTypeApplied: "car_wash",
  dailyDemandRequests: 40,
  bookingConversionRate: 0.85,
  scheduledJobsPerDay: 34,
  monthlyJobs: 0,
  mobileTechnicians: 2,
  routesPerTechnicianPerDay: 4,
  appointmentNoShowRate: 0,
  cancellationRecoveryRate: 0,
  cancellationFee: 0,
  customerBaseDemandEnabled: false,
  activeCustomerBase: 0,
  monthlyRepeatVisitRate: 0,
  newCustomerJobsPerMonth: 0,
  advancedServiceMixEnabled: false,
  services: [{ name: "Karışık hizmet", serviceShareRate: 1, servicePrice: 850, durationMinutes: 55, consumableCost: 115, energyCost: 55, partsRevenue: 0, partsCostRate: 0.62, reworkRate: 0 }],
  advancedStaffEnabled: false,
  staffRoles: [{ name: "Usta / uygulayıcı", count: 4, monthlyCostPerPerson: 62500, productiveHoursPerMonth: 220 }],
  partsInventoryEnabled: false,
  currentPartsInventoryCost: 90000,
  targetPartsCoverageDays: 30,
  safetyStockDays: 7,
  supplierLeadTimeDays: 10,
  advancedSupplierMixEnabled: false,
  suppliers: [{ name: "Ana tedarikçi", purchaseShareRate: 1, paymentDelayDays: 20, leadTimeDays: 10, discountRate: 0 }],
  subcontractEnabled: false,
  subcontractItems: [{ name: "Dış hizmet", monthlyJobs: 0, salePrice: 0, costPerJob: 0 }],
  mobileTravelCostPerJob: 0,
  monthlyOperatingGrantIncome: 0,
};

export const AUTO_BUSINESS_PROFILES = {
  car_wash: {
    label: "Oto yıkama",
    driver: "walk_in",
    capacityLabel: "Yıkama alanı",
    defaults: {
      dailyDemandRequests: 40, bookingConversionRate: 0.85, appointmentNoShowRate: 0,
      averageServicePrice: 850, averagePartsRevenuePerVehicle: 0, serviceStations: 4,
      averageServiceDurationMinutes: 55, consumableCostPerVehicle: 115, waterElectricityCostPerVehicle: 55,
      partsCostRate: 0.62, mobileTravelCostPerJob: 0,
    },
  },
  auto_detailing: {
    label: "Oto kuaför",
    driver: "appointment",
    capacityLabel: "Uygulama alanı",
    defaults: {
      scheduledJobsPerDay: 5, appointmentNoShowRate: 0.08, cancellationRecoveryRate: 0.25, cancellationFee: 500,
      averageServicePrice: 3500, averagePartsRevenuePerVehicle: 250, serviceStations: 2,
      averageServiceDurationMinutes: 240, consumableCostPerVehicle: 450, waterElectricityCostPerVehicle: 150,
      partsCostRate: 0.55,
    },
  },
  deep_cleaning: {
    label: "Detaylı temizlik",
    driver: "appointment",
    capacityLabel: "Detay istasyonu",
    defaults: {
      scheduledJobsPerDay: 4, appointmentNoShowRate: 0.10, cancellationRecoveryRate: 0.30, cancellationFee: 750,
      averageServicePrice: 4500, averagePartsRevenuePerVehicle: 350, serviceStations: 2,
      averageServiceDurationMinutes: 300, consumableCostPerVehicle: 650, waterElectricityCostPerVehicle: 180,
      partsCostRate: 0.55,
    },
  },
  tire_shop: {
    label: "Lastikçi",
    driver: "appointment",
    capacityLabel: "Lastik istasyonu",
    defaults: {
      scheduledJobsPerDay: 18, appointmentNoShowRate: 0.05, cancellationRecoveryRate: 0.10, cancellationFee: 250,
      averageServicePrice: 1200, averagePartsRevenuePerVehicle: 5500, serviceStations: 4,
      averageServiceDurationMinutes: 90, consumableCostPerVehicle: 80, waterElectricityCostPerVehicle: 30,
      partsCostRate: 0.72, partsInventoryEnabled: true, currentPartsInventoryCost: 1200000,
      targetPartsCoverageDays: 45, safetyStockDays: 10, supplierLeadTimeDays: 14,
    },
  },
  window_film_wrap: {
    label: "Cam filmi / kaplama",
    driver: "appointment",
    capacityLabel: "Kaplama alanı",
    defaults: {
      scheduledJobsPerDay: 4, appointmentNoShowRate: 0.08, cancellationRecoveryRate: 0.35, cancellationFee: 1000,
      averageServicePrice: 6500, averagePartsRevenuePerVehicle: 1500, serviceStations: 2,
      averageServiceDurationMinutes: 240, consumableCostPerVehicle: 600, waterElectricityCostPerVehicle: 60,
      partsCostRate: 0.55, partsInventoryEnabled: true, currentPartsInventoryCost: 300000,
      targetPartsCoverageDays: 30, safetyStockDays: 7, supplierLeadTimeDays: 10,
    },
  },
  small_repair_shop: {
    label: "Küçük bakım / servis",
    driver: "appointment",
    capacityLabel: "Lift / servis istasyonu",
    defaults: {
      scheduledJobsPerDay: 10, appointmentNoShowRate: 0.08, cancellationRecoveryRate: 0.20, cancellationFee: 500,
      averageServicePrice: 2500, averagePartsRevenuePerVehicle: 3000, serviceStations: 3,
      averageServiceDurationMinutes: 150, consumableCostPerVehicle: 180, waterElectricityCostPerVehicle: 45,
      partsCostRate: 0.68, partsInventoryEnabled: true, currentPartsInventoryCost: 650000,
      targetPartsCoverageDays: 35, safetyStockDays: 10, supplierLeadTimeDays: 12,
    },
  },
  body_paint: {
    label: "Kaporta / boya",
    driver: "monthly_jobs",
    capacityLabel: "Kaporta / boya alanı",
    defaults: {
      monthlyJobs: 35, appointmentNoShowRate: 0.03, cancellationRecoveryRate: 0.25, cancellationFee: 1500,
      averageServicePrice: 18000, averagePartsRevenuePerVehicle: 7000, serviceStations: 3,
      averageServiceDurationMinutes: 900, consumableCostPerVehicle: 1800, waterElectricityCostPerVehicle: 250,
      partsCostRate: 0.62, partsInventoryEnabled: true, currentPartsInventoryCost: 800000,
      targetPartsCoverageDays: 40, safetyStockDays: 12, supplierLeadTimeDays: 15,
      subcontractEnabled: true,
    },
  },
  mobile_service: {
    label: "Mobil oto servis",
    driver: "mobile_routes",
    capacityLabel: "Mobil ekip",
    defaults: {
      mobileTechnicians: 3, routesPerTechnicianPerDay: 3, appointmentNoShowRate: 0.06,
      cancellationRecoveryRate: 0.20, cancellationFee: 400,
      averageServicePrice: 2200, averagePartsRevenuePerVehicle: 1200, serviceStations: 3,
      averageServiceDurationMinutes: 90, consumableCostPerVehicle: 140, waterElectricityCostPerVehicle: 0,
      partsCostRate: 0.66, mobileTravelCostPerJob: 220,
    },
  },
};

export function getAutoBusinessProfile(type) {
  return AUTO_BUSINESS_PROFILES[type] ?? AUTO_BUSINESS_PROFILES.car_wash;
}
