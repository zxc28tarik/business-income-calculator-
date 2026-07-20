import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import { RETAIL_V2_BUSINESS_TYPES } from "./retail-business-profiles.js";

const visibleIn = (values) => ({ key: "businessType", in: values });

export const RETAIL_PROFILE_SALES_SECTIONS = [
  {
    title: "1 · İş türü ve mağaza talebi", open: true,
    fields: [
      selectField("businessType", "İş türü", RETAIL_V2_BUSINESS_TYPES, { full: true }),
      booleanField("profileDriverEnabled", "İş türüne özel satış sürücüsünü kullan", { full: true }),
      numberField("dailyCustomers", "Günlük müşteri / işlem", 1, { visibleWhen: { key: "profileDriverEnabled", equals: false } }),
      numberField("dailyFootTraffic", "Günlük mağaza trafiği", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, visibleIn(["boutique", "phone_accessories", "stationery", "toy_store"])] } }),
      rateField("conversionRate", "Trafikten alışverişe dönüşüm", { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, visibleIn(["boutique", "phone_accessories", "stationery", "toy_store"])] } }),
      numberField("activeCustomerBase", "Aktif müşteri tabanı", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "pet_shop" }] } }),
      numberField("monthlyPurchaseFrequency", "Müşteri başı aylık alışveriş", 0.1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "pet_shop" }] } }),
      numberField("dailyOrders", "Günlük standart sipariş", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "florist" }] } }),
      numberField("eventOrdersPerMonth", "Aylık düğün / etkinlik siparişi", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "florist" }] } }),
      numberField("eventOrderValue", "Etkinlik siparişi ortalaması (TL)", 100, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "florist" }] } }),
      numberField("transactionsPerHour", "Saatlik kasa işlemi", 1, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "mini_market" }] } }),
      numberField("openHoursPerDay", "Günlük açık saat", 0.5, { visibleWhen: { all: [{ key: "profileDriverEnabled", equals: true }, { key: "businessType", equals: "mini_market" }] } }),
      numberField("openDays", "Açık gün / ay", 1),
      rateField("seasonalityMultiplier", "Sezon / dönem satış çarpanı", { allowAboveOne: true }),
      numberField("storeDailyCapacity", "Günlük işlem kapasitesi", 1),
    ],
  },
  {
    title: "2 · Sepet, ürün karması ve iskonto", open: true,
    fields: [
      numberField("averageBasket", "Ortalama sepet (TL)", 10),
      booleanField("advancedProductMixEnabled", "Gelişmiş ürün karmasını kullan", { full: true }),
      tableField("productMix", "Ürün / kategori karması", [
        { type: "text", key: "name", label: "Kategori", defaultValue: "Yeni kategori" },
        { type: "rate", key: "salesShareRate", label: "Satış payı", defaultValue: 0 },
        { type: "number", key: "salePrice", label: "Fiyat", step: 1, defaultValue: 0 },
        { type: "number", key: "unitCost", label: "Maliyet", step: 1, defaultValue: 0 },
        { type: "rate", key: "returnRate", label: "İade", defaultValue: 0 },
        { type: "rate", key: "markdownShareRate", label: "İskontolu pay", defaultValue: 0 },
        { type: "rate", key: "markdownDiscountRate", label: "İskonto", defaultValue: 0 },
        { type: "rate", key: "spoilageRate", label: "Bozulma/fire", defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedProductMixEnabled", equals: true }, minRows: 1, maxRows: 30,
        newRow: { name: "Yeni kategori", salesShareRate: 0, salePrice: 0, unitCost: 0, returnRate: 0, markdownShareRate: 0, markdownDiscountRate: 0, spoilageRate: 0 },
      }),
      numberField("averageUnitSalePrice", "Ortalama ürün satış fiyatı (TL)", 1, { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      numberField("averageUnitCost", "Ortalama ürün maliyeti (TL)", 1, { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("returnRate", "İade oranı", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("markdownShareRate", "İskontolu satış payı", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("markdownDiscountRate", "Ortalama iskonto oranı", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
      rateField("inventoryLossRate", "Sayım kaybı / çalınma oranı"),
      rateField("spoilageRate", "Bozulma / son kullanma fire oranı", { visibleWhen: { key: "advancedProductMixEnabled", equals: false } }),
    ],
  },
];
