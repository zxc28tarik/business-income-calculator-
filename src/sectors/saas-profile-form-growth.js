import { booleanField, numberField, rateField, tableField } from "../core/sector-schema.js";
import { SAAS_SUBSCRIBER_TYPES } from "./saas-profile-form-core.js";

const visibleIn = (values) => ({ key: "businessType", in: values });

export const SAAS_PROFILE_GROWTH_SECTIONS = [
  {
    title: "2 · Plan karması ve faturalama", open: true,
    fields: [
      booleanField("advancedPlanMixEnabled", "Gelişmiş paket / plan karmasını kullan", { full: true, visibleWhen: { key: "businessType", notEquals: "api_service" } }),
      tableField("plans", "Paket / plan karması", [
        { type: "text", key: "name", label: "Plan", defaultValue: "Yeni plan" },
        { type: "rate", key: "subscriberShareRate", label: "Müşteri payı", defaultValue: 0 },
        { type: "number", key: "monthlyPrice", label: "Aylık fiyat", step: 10, defaultValue: 0 },
        { type: "rate", key: "annualBillingShareRate", label: "Yıllık ödeme payı", defaultValue: 0 },
        { type: "rate", key: "annualDiscountRate", label: "Yıllık indirim", defaultValue: 0 },
      ], {
        visibleWhen: { all: [{ key: "advancedPlanMixEnabled", equals: true }, { key: "businessType", notEquals: "api_service" }] },
        minRows: 1, maxRows: 12,
        newRow: { name: "Yeni plan", subscriberShareRate: 0, monthlyPrice: 0, annualBillingShareRate: 0, annualDiscountRate: 0 },
      }),
      rateField("annualBillingShareRate", "Yıllık peşin ödeme payı", { visibleWhen: { all: [{ key: "advancedPlanMixEnabled", equals: false }, { key: "businessType", notEquals: "api_service" }] } }),
      rateField("annualDiscountRate", "Yıllık ödeme indirimi", { visibleWhen: { all: [{ key: "advancedPlanMixEnabled", equals: false }, { key: "businessType", notEquals: "api_service" }] } }),
      numberField("seatsPerAccount", "Hesap başına ortalama koltuk / lisans", 1, { visibleWhen: { key: "businessType", equals: "b2b_saas" } }),
    ],
  },
  {
    title: "3 · Deneme, freemium ve gelir tutma", open: true,
    fields: [
      numberField("trialUsers", "Aylık deneme kullanıcısı", 1, { visibleWhen: visibleIn(["b2c_subscription", "mobile_subscription"]) }),
      rateField("trialConversionRate", "Denemeden ücretliye dönüşüm", { visibleWhen: visibleIn(["b2c_subscription", "mobile_subscription"]) }),
      numberField("freeUsers", "Aktif ücretsiz kullanıcı", 1, { visibleWhen: { key: "businessType", equals: "freemium_saas" } }),
      numberField("monthlyNewFreeUsers", "Aylık yeni ücretsiz kullanıcı", 1, { visibleWhen: { key: "businessType", equals: "freemium_saas" } }),
      rateField("freeToPaidConversionRate", "Ücretsizden ücretliye dönüşüm", { visibleWhen: { key: "businessType", equals: "freemium_saas" } }),
      numberField("freeUserCostPerMonth", "Ücretsiz kullanıcı başı aylık maliyet (TL)", 1, { visibleWhen: { key: "businessType", equals: "freemium_saas" } }),
      numberField("reactivatedSubscribers", "Aylık yeniden aktifleştirilen müşteri", 1, { visibleWhen: visibleIn(SAAS_SUBSCRIBER_TYPES) }),
      rateField("expansionMrrRate", "Upgrade / expansion MRR oranı"),
      rateField("contractionMrrRate", "Downgrade / contraction MRR oranı"),
    ],
  },
  {
    title: "4 · İçerik, destek ve müşteri başarısı", open: true,
    fields: [
      numberField("contentProductionCost", "Aylık içerik üretim maliyeti (TL)", 1000, { visibleWhen: { key: "businessType", equals: "membership_site" } }),
      numberField("communityManagementCost", "Topluluk yönetimi maliyeti (TL)", 1000, { visibleWhen: { key: "businessType", equals: "membership_site" } }),
      numberField("supportStaffCount", "Destek / müşteri başarı personeli", 1),
      numberField("supportCapacityPerStaff", "Personel başı destek kapasitesi", 10),
      numberField("monthlyOperatingGrantIncome", "Aylık faaliyet hibe geliri (P&L) (TL)", 1000, { hint: "Finansman ve tek seferlik hibe nakit girişinden ayrıdır." }),
    ],
  },
];
