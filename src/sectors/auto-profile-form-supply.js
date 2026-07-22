import { booleanField, numberField, rateField, tableField } from "../core/sector-schema.js";

export const AUTO_PROFILE_SUPPLY_SECTIONS = [
  {
    title: "4 · Parça, sarf, tedarikçi ve taşeron", open: true,
    fields: [
      rateField("otherVariableCostRate", "Diğer değişken gider / KDV sonrası gelir"),
      numberField("mobileTravelCostPerJob", "Mobil servis yol gideri / iş (TL)", 10, { visibleWhen: { key: "businessType", equals: "mobile_service" } }),
      booleanField("partsInventoryEnabled", "Parça / sarf stok kapsamını izle", { full: true }),
      numberField("currentPartsInventoryCost", "Mevcut parça / sarf stok maliyeti (TL)", 1000, { visibleWhen: { key: "partsInventoryEnabled", equals: true } }),
      numberField("targetPartsCoverageDays", "Hedef stok kapsamı (gün)", 1, { visibleWhen: { key: "partsInventoryEnabled", equals: true } }),
      numberField("safetyStockDays", "Güvenlik stoğu (gün)", 1, { visibleWhen: { key: "partsInventoryEnabled", equals: true } }),
      booleanField("advancedSupplierMixEnabled", "Tedarikçileri tabloyla izle", { full: true, visibleWhen: { key: "partsInventoryEnabled", equals: true } }),
      tableField("suppliers", "Parça / sarf tedarikçileri", [
        { type: "text", key: "name", label: "Tedarikçi", defaultValue: "Yeni tedarikçi" },
        { type: "rate", key: "purchaseShareRate", label: "Alım payı", defaultValue: 0 },
        { type: "number", key: "paymentDelayDays", label: "Vade", step: 1, defaultValue: 0 },
        { type: "number", key: "leadTimeDays", label: "Teslim süresi", step: 1, defaultValue: 0 },
        { type: "rate", key: "discountRate", label: "Alım indirimi", defaultValue: 0 },
      ], {
        visibleWhen: { all: [{ key: "partsInventoryEnabled", equals: true }, { key: "advancedSupplierMixEnabled", equals: true }] }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni tedarikçi", purchaseShareRate: 0, paymentDelayDays: 0, leadTimeDays: 0, discountRate: 0 },
      }),
      numberField("supplierPaymentDelayDays", "Parça / sarf tedarikçi vadesi (gün)", 1, { visibleWhen: { key: "advancedSupplierMixEnabled", equals: false } }),
      numberField("supplierLeadTimeDays", "Tedarik süresi (gün)", 1, { visibleWhen: { key: "advancedSupplierMixEnabled", equals: false } }),
      booleanField("subcontractEnabled", "Taşeron işleri ayrı izle", { full: true }),
      tableField("subcontractItems", "Taşeron işler", [
        { type: "text", key: "name", label: "İş", defaultValue: "Dış hizmet" },
        { type: "number", key: "monthlyJobs", label: "Aylık iş", step: 1, defaultValue: 0 },
        { type: "number", key: "salePrice", label: "Müşteriye satış", step: 100, defaultValue: 0 },
        { type: "number", key: "costPerJob", label: "Taşeron maliyeti", step: 100, defaultValue: 0 },
      ], {
        visibleWhen: { key: "subcontractEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Dış hizmet", monthlyJobs: 0, salePrice: 0, costPerJob: 0 },
      }),
    ],
  },
];
