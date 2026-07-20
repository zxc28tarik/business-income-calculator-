import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import { BEAUTY_BUSINESS_TYPES } from "./beauty-config.js";

const visibleIn = (values) => ({ key: "businessType", in: values });

export const BEAUTY_PROFILE_FORM_SECTIONS = [
  {
    title: "1 · İş türü, kapasite ve randevu talebi", open: true,
    fields: [
      selectField("businessType", "İş türü", BEAUTY_BUSINESS_TYPES, { full: true }),
      numberField("stations", "Koltuk / oda / cihaz istasyonu", 1, { visibleWhen: { key: "businessType", equals: "beauty_salon" } }),
      numberField("chairCount", "Koltuk sayısı", 1, { visibleWhen: visibleIn(["hair_salon", "barber"]) }),
      numberField("tableCount", "Tırnak masası", 1, { visibleWhen: { key: "businessType", equals: "nail_studio" } }),
      numberField("roomCount", "Bakım / masaj odası", 1, { visibleWhen: visibleIn(["skin_care", "massage_spa"]) }),
      numberField("deviceCount", "Aktif cihaz", 1, { visibleWhen: { key: "businessType", equals: "laser_epilation" } }),
      numberField("specialistCount", "Aktif uzman", 1, { visibleWhen: { key: "businessType", equals: "brow_lash" } }),
      numberField("workingHoursPerDay", "Günlük çalışma süresi (saat)", 0.5),
      numberField("openDays", "Açık gün / ay", 1),
      booleanField("customerBaseDemandEnabled", "Müşteri tabanı ve tekrar ziyaret talebini kullan", { full: true }),
      rateField("occupancyRate", "Randevu doluluk oranı", { visibleWhen: { key: "customerBaseDemandEnabled", equals: false } }),
      numberField("activeCustomerBase", "Aktif müşteri tabanı", 1, { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      numberField("monthlyNewCustomers", "Aylık yeni müşteri", 1, { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      rateField("repeatVisitRate", "Tekrar ziyaret oranı", { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      numberField("visitsPerReturningCustomer", "Tekrar gelen müşteri başı aylık ziyaret", 0.1, { visibleWhen: { key: "customerBaseDemandEnabled", equals: true } }),
      rateField("noShowRate", "İptal / no-show oranı"),
      rateField("noShowRecoveryRate", "Ön ödeme / iptal bedeliyle geri kazanılan pay"),
    ],
  },
  {
    title: "2 · Hizmet karması ve seans ekonomisi", open: true,
    fields: [
      booleanField("advancedServiceMixEnabled", "Gelişmiş hizmet karmasını kullan", { full: true }),
      tableField("serviceMix", "Hizmet / seans karması", [
        { type: "text", key: "name", label: "Hizmet", defaultValue: "Yeni hizmet" },
        { type: "rate", key: "sessionShareRate", label: "Seans payı", defaultValue: 0 },
        { type: "number", key: "price", label: "Fiyat", step: 10, defaultValue: 0 },
        { type: "number", key: "durationMinutes", label: "Dakika", step: 5, defaultValue: 60 },
        { type: "number", key: "consumableCost", label: "Sarf", step: 1, defaultValue: 0 },
        { type: "rate", key: "employeeCommissionRate", label: "Prim", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedServiceMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni hizmet", sessionShareRate: 0, price: 0, durationMinutes: 60, consumableCost: 0, employeeCommissionRate: 0 },
      }),
      numberField("servicePrice", "Ortalama hizmet / seans fiyatı (TL)", 10, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("sessionDurationMinutes", "Ortalama seans süresi (dakika)", 5, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      numberField("consumableCostPerSession", "Sarf malzeme / tamamlanan seans (TL)", 1, { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      rateField("employeeCommissionRate", "Çalışan primi / net hizmet geliri", { visibleWhen: { key: "advancedServiceMixEnabled", equals: false } }),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net hizmet geliri"),
    ],
  },
  {
    title: "3 · Personel kapasitesi ve maliyeti", open: true,
    fields: [
      booleanField("advancedStaffMixEnabled", "Gelişmiş personel rol tablosunu kullan", { full: true }),
      tableField("staffRoles", "Personel rolleri", [
        { type: "text", key: "role", label: "Rol", defaultValue: "Uzman" },
        { type: "number", key: "count", label: "Kişi", step: 1, defaultValue: 1 },
        { type: "number", key: "monthlyCostPerPerson", label: "Aylık maliyet / kişi", step: 1000, defaultValue: 0 },
        { type: "number", key: "productiveHoursPerDay", label: "Üretken saat", step: 0.5, defaultValue: 7 },
        { type: "rate", key: "revenueCommissionRate", label: "Ciro primi", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedStaffMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { role: "Uzman", count: 1, monthlyCostPerPerson: 0, productiveHoursPerDay: 7, revenueCommissionRate: 0 },
      }),
      numberField("staffCount", "Aktif çalışan sayısı", 1, { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
      numberField("staffCost", "Personel toplam sabit maliyeti (TL)", 1000, { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
    ],
  },
  {
    title: "4 · Perakende ürün, vergi ve ödeme", open: true,
    fields: [
      booleanField("retailSalesEnabled", "Bakım / kozmetik ürün satışı ekle", { full: true }),
      numberField("monthlyRetailRevenue", "Aylık ürün satış geliri (TL)", 1000, { visibleWhen: { key: "retailSalesEnabled", equals: true } }),
      rateField("retailProductCostRate", "Ürün satış maliyeti oranı", { visibleWhen: { key: "retailSalesEnabled", equals: true } }),
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardPaymentShare", "Kartlı ödeme payı"),
      rateField("paymentCommissionRate", "POS / ödeme komisyonu"),
    ],
  },
];
