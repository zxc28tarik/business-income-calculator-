import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import { AUTO_V2_BUSINESS_TYPES } from "./auto-business-profiles.js";

const APPOINTMENT_TYPES = ["auto_detailing", "deep_cleaning", "tire_shop", "window_film_wrap", "small_repair_shop"];
const visibleIn = (values) => ({ key: "businessType", in: values });

export const AUTO_PROFILE_OPERATION_SECTIONS = [
  {
    title: "1 · İş türü, talep ve randevu", open: true,
    fields: [
      selectField("businessType", "İş türü", AUTO_V2_BUSINESS_TYPES, { full: true }),
      booleanField("profileDriverEnabled", "İş türüne özel araç / iş sürücüsünü kullan", { full: true }),
      numberField("dailyVehicles", "Günlük tamamlanan araç / iş", 1, { visibleWhen: { key: "profileDriverEnabled", equals: false } }),
      numberField("dailyDemandRequests", "Günlük araç talebi", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "car_wash" }] } }),
      rateField("bookingConversionRate", "Talebin hizmete dönüşme oranı", { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "car_wash" }] } }),
      numberField("scheduledJobsPerDay", "Günlük planlanan randevu / iş", 0.1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, visibleIn(APPOINTMENT_TYPES)] } }),
      numberField("monthlyJobs", "Aylık planlanan kaporta / boya işi", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "body_paint" }] } }),
      numberField("mobileTechnicians", "Mobil teknisyen / ekip sayısı", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "mobile_service" }] } }),
      numberField("routesPerTechnicianPerDay", "Ekip başı günlük servis rotası", 0.1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "mobile_service" }] } }),
      rateField("appointmentNoShowRate", "Randevuya gelmeme / iptal oranı", { visibleWhen: { key: "businessType", in: [...APPOINTMENT_TYPES, "body_paint", "mobile_service"] } }),
      rateField("cancellationRecoveryRate", "İptal ücretinin tahsil edilebildiği pay", { visibleWhen: { key: "businessType", in: [...APPOINTMENT_TYPES, "body_paint", "mobile_service"] } }),
      numberField("cancellationFee", "Tahsil edilen iptal / kapora bedeli (TL)", 50, { visibleWhen: { key: "businessType", in: [...APPOINTMENT_TYPES, "body_paint", "mobile_service"] } }),
      booleanField("customerBaseDemandEnabled", "Tekrar ziyaret eden müşteri tabanını kullan", { full: true }),
      numberField("activeCustomerBase", "Aktif müşteri tabanı", 1, { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      rateField("monthlyRepeatVisitRate", "Aylık tekrar ziyaret oranı", { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      numberField("newCustomerJobsPerMonth", "Aylık yeni müşteri işi", 1, { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      numberField("openDays", "Açık gün / ay", 1),
    ],
  },
  {
    title: "2 · İstasyon, hizmet karması ve kapasite", open: true,
    fields: [
      numberField("serviceStations", "Yıkama alanı / lift / hizmet istasyonu", 1),
      numberField("workingHoursPerDay", "Günlük çalışma süresi (saat)", 0.5),
      booleanField("advancedServiceMixEnabled", "Hizmet karmasını tabloyla izle", { full: true }),
      tableField("services", "Hizmet / iş karması", [
        { type: "text", key: "name", label: "Hizmet", defaultValue: "Yeni hizmet" },
        { type: "rate", key: "serviceShareRate", label: "İş payı", defaultValue: 0 },
        { type: "number", key: "servicePrice", label: "Hizmet fiyatı", step: 50, defaultValue: 0 },
        { type: "number", key: "durationMinutes", label: "Süre (dk)", step: 5, defaultValue: 60 },
        { type: "number", key: "consumableCost", label: "Sarf", step: 10, defaultValue: 0 },
        { type: "number", key: "energyCost", label: "Enerji / su", step: 10, defaultValue: 0 },
        { type: "number", key: "partsRevenue", label: "Parça geliri", step: 50, defaultValue: 0 },
        { type: "rate", key: "partsCostRate", label: "Parça maliyet oranı", defaultValue: 0 },
        { type: "rate", key: "reworkRate", label: "Tekrar işçilik", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedServiceMixEnabled", equals: true }, minRows: 1, maxRows: 30,
        newRow: { name: "Yeni hizmet", serviceShareRate: 0, servicePrice: 0, durationMinutes: 60, consumableCost: 0, energyCost: 0, partsRevenue: 0, partsCostRate: 0, reworkRate: 0 },
      }),
      selectField("packageType", "Paket / hizmet karması", [["basic", "Temel paket"], ["standard", "Standart paket"], ["premium", "Premium paket"], ["mixed", "Karışık hizmet ortalaması"]], { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("averageServicePrice", "Ortalama hizmet fiyatı (TL)", 10, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("averagePartsRevenuePerVehicle", "Araç başı parça / ürün geliri (TL)", 10, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("averageServiceDurationMinutes", "Araç başı hizmet süresi (dakika)", 5, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("consumableCostPerVehicle", "Sarf malzeme / araç (TL)", 1, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("waterElectricityCostPerVehicle", "Su / elektrik / araç (TL)", 1, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      rateField("partsCostRate", "Parça / ürün maliyet oranı", { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
    ],
  },
];
