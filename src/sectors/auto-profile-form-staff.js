import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";

export const AUTO_PROFILE_STAFF_SECTIONS = [
  {
    title: "3 · Personel ve üretken kapasite", open: true,
    fields: [
      booleanField("advancedStaffEnabled", "Personel rollerini tabloyla izle", { full: true }),
      tableField("staffRoles", "Personel rolleri", [
        { type: "text", key: "name", label: "Rol", defaultValue: "Yeni rol" },
        { type: "number", key: "count", label: "Kişi", step: 1, defaultValue: 1 },
        { type: "number", key: "monthlyCostPerPerson", label: "Aylık kişi maliyeti", step: 1000, defaultValue: 0 },
        { type: "number", key: "productiveHoursPerMonth", label: "Üretken saat / kişi", step: 1, defaultValue: 160 },
      ], {
        visibleWhen: { key: "advancedStaffEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Yeni rol", count: 1, monthlyCostPerPerson: 0, productiveHoursPerMonth: 160 },
      }),
      numberField("staffCost", "Personel toplam maliyeti (TL)", 1000, { visibleWhen: { key: "advancedStaffEnabled", equals: false } }),
    ],
  },
  {
    title: "5 · Vergi, ödeme ve faaliyet desteği", open: true,
    fields: [
      selectField("taxType", "KDV biçimi", [["included", "Fiyata dahil"], ["excluded", "Fiyat üstü"], ["none", "Vergi yok"]]),
      rateField("vatRate", "KDV oranı", { hint: "Örnek varsayımdır; mali müşavirinizle teyit edin." }),
      rateField("cardSalesShare", "Kartlı satış payı"),
      rateField("posCommissionRate", "POS / ödeme komisyonu"),
      numberField("monthlyOperatingGrantIncome", "Aylık faaliyet hibe geliri (P&L) (TL)", 1000, { hint: "Tek seferlik hibe nakit girişinden ayrıdır." }),
    ],
  },
];
