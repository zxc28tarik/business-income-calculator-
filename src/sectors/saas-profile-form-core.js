import { numberField, rateField, selectField } from "../core/sector-schema.js";
import { SAAS_V2_BUSINESS_TYPES } from "./saas-business-profiles.js";

const visibleIn = (values) => ({ key: "businessType", in: values });
export const SAAS_SUBSCRIBER_TYPES = ["b2b_saas", "b2c_subscription", "micro_saas", "mobile_subscription", "membership_site", "freemium_saas"];

export const SAAS_PROFILE_CORE_SECTIONS = [{
  title: "1 · İş türü ve gelir sürücüsü", open: true,
  fields: [
    selectField("businessType", "İş türü", SAAS_V2_BUSINESS_TYPES, { full: true }),
    numberField("openingSubscribers", "Ay başı ücretli müşteri / abone", 1, { visibleWhen: visibleIn(SAAS_SUBSCRIBER_TYPES) }),
    numberField("monthlyNewSubscribers", "Aylık yeni ücretli müşteri / abone", 1, { visibleWhen: visibleIn(SAAS_SUBSCRIBER_TYPES) }),
    numberField("monthlyPrice", "Aylık ortalama ücret (TL)", 10, { visibleWhen: visibleIn(SAAS_SUBSCRIBER_TYPES) }),
    rateField("monthlyChurnRate", "Aylık müşteri / abone kaybı", { visibleWhen: visibleIn(SAAS_SUBSCRIBER_TYPES) }),
    numberField("apiCustomers", "Ay başı API müşterisi", 1, { visibleWhen: { key: "businessType", equals: "api_service" } }),
    numberField("apiNewCustomers", "Aylık yeni API müşterisi", 1, { visibleWhen: { key: "businessType", equals: "api_service" } }),
    rateField("apiMonthlyChurnRate", "API müşteri kaybı", { visibleWhen: { key: "businessType", equals: "api_service" } }),
    numberField("usageUnitsPerCustomer", "Müşteri başı aylık kullanım birimi", 1000, { visibleWhen: { key: "businessType", equals: "api_service" } }),
    numberField("pricePerUsageUnit", "Kullanım birimi satış fiyatı (TL)", 0.001, { visibleWhen: { key: "businessType", equals: "api_service" } }),
    numberField("costPerUsageUnit", "Kullanım birimi altyapı maliyeti (TL)", 0.001, { visibleWhen: { key: "businessType", equals: "api_service" } }),
    numberField("enterpriseCustomers", "Ay başı kurumsal müşteri", 1, { visibleWhen: { key: "businessType", equals: "enterprise_license" } }),
    numberField("enterpriseNewCustomers", "Aylık yeni kurumsal müşteri", 1, { visibleWhen: { key: "businessType", equals: "enterprise_license" } }),
    rateField("enterpriseMonthlyChurnRate", "Kurumsal müşteri kaybı", { visibleWhen: { key: "businessType", equals: "enterprise_license" } }),
    numberField("annualContractValue", "Yıllık sözleşme bedeli / müşteri (TL)", 1000, { visibleWhen: { key: "businessType", equals: "enterprise_license" } }),
    numberField("onboardingRevenuePerNewCustomer", "Yeni müşteri onboarding geliri (TL)", 1000, { visibleWhen: visibleIn(["b2b_saas", "enterprise_license"]) }),
  ],
}];
