import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";

export const RETAIL_PROFILE_INVENTORY_SECTIONS = [
  {
    title: "3 · Tedarikçi, stok ve işletme sermayesi", open: true,
    fields: [
      booleanField("advancedSupplierMixEnabled", "Tedarikçi karmasını tabloyla izle", { full: true }),
      tableField("suppliers", "Tedarikçiler", [
        { type: "text", key: "name", label: "Tedarikçi", defaultValue: "Yeni tedarikçi" },
        { type: "rate", key: "purchaseShareRate", label: "Alım payı", defaultValue: 0 },
        { type: "number", key: "paymentDelayDays", label: "Vade (gün)", step: 1, defaultValue: 0 },
        { type: "number", key: "leadTimeDays", label: "Teslim süresi", step: 1, defaultValue: 0 },
        { type: "rate", key: "discountRate", label: "Alım indirimi", defaultValue: 0 },
        { type: "number", key: "minimumOrderAmount", label: "Asgari sipariş", step: 100, defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedSupplierMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni tedarikçi", purchaseShareRate: 0, paymentDelayDays: 0, leadTimeDays: 0, discountRate: 0, minimumOrderAmount: 0 },
      }),
      rateField("purchaseDiscountRate", "Ortalama tedarikçi indirimi", { visibleWhen: { key: "advancedSupplierMixEnabled", equals: false } }),
      numberField("supplierPaymentDelayDays", "Tedarikçi vadesi (gün)", 1, { visibleWhen: { key: "advancedSupplierMixEnabled", equals: false } }),
      numberField("supplierLeadTimeDays", "Tedarik süresi (gün)", 1, { visibleWhen: { key: "advancedSupplierMixEnabled", equals: false } }),
      booleanField("inventoryPlanningEnabled", "Stok kapsamı ve işletme sermayesini izle", { full: true }),
      numberField("currentInventoryCost", "Mevcut / açılış stok maliyeti (TL)", 1000, { visibleWhen: { key: "inventoryPlanningEnabled", equals: true } }),
      numberField("targetStockCoverageDays", "Hedef stok kapsamı (gün)", 1, { visibleWhen: { key: "inventoryPlanningEnabled", equals: true } }),
      numberField("safetyStockDays", "Güvenlik stoğu (gün)", 1, { visibleWhen: { key: "inventoryPlanningEnabled", equals: true } }),
    ],
  },
  {
    title: "4 · Vergi, ödeme ve dönemsel gider", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("posCommissionRate", "POS / ödeme komisyonu"),
      numberField("shoppingBagCostPerCustomer", "Poşet / ambalaj gideri, işlem başı (TL)", 1),
      rateField("otherVariableCostRate", "Diğer değişken gider / net satış"),
      numberField("monthlyDepreciation", "Aylık amortisman (P&L) (TL)", 1000, { hint: "Nakit akışından ikinci kez düşülmez." }),
      numberField("monthlyOperatingGrantIncome", "Aylık faaliyet hibe geliri (P&L) (TL)", 1000, { hint: "Tek seferlik nakit destekten ayrıdır." }),
    ],
  },
];
