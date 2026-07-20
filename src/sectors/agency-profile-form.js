import { booleanField, numberField, rateField, selectField, tableField } from "../core/sector-schema.js";
import { AGENCY_BUSINESS_TYPES } from "./agency-config.js";

const PROJECT_TYPES = ["software_agency", "design_agency", "video_editing"];
const RETAINER_TYPES = ["social_media_agency", "seo_agency"];
const HOURLY_TYPES = ["freelance_developer", "freelance_designer"];
const visibleIn = (values) => ({ key: "businessType", in: values });

export const AGENCY_PROFILE_FORM_SECTIONS = [
  {
    title: "1 · İş türü ve gelir modeli", open: true,
    fields: [
      selectField("businessType", "İş türü", AGENCY_BUSINESS_TYPES, { full: true }),
      booleanField("advancedProfileDriverEnabled", "İş türüne özel gelir sürücüsünü kullan", { full: true }),
      numberField("averageProjectFee", "Ortalama proje bedeli (TL)", 1000, { visibleWhen: visibleIn(PROJECT_TYPES) }),
      numberField("monthlyProjectCount", "Aylık proje sayısı", 0.1, { visibleWhen: visibleIn(PROJECT_TYPES) }),
      numberField("averageProjectHours", "Proje başına baz üretim saati", 1, { visibleWhen: visibleIn(PROJECT_TYPES) }),
      numberField("retainerClientCount", "Aylık retainer müşteri", 1, { visibleWhen: visibleIn(RETAINER_TYPES) }),
      numberField("averageMonthlyRetainer", "Müşteri başı aylık retainer (TL)", 1000, { visibleWhen: visibleIn(RETAINER_TYPES) }),
      numberField("retainerHoursPerClient", "Müşteri başı aylık üretim saati", 1, { visibleWhen: visibleIn(RETAINER_TYPES) }),
      numberField("monthlyBillableHours", "Aylık faturalandırılan saat", 1, { visibleWhen: visibleIn([...HOURLY_TYPES, "performance_marketing"]) }),
      numberField("hourlySalesPrice", "Saatlik satış fiyatı (TL)", 10, { visibleWhen: visibleIn(HOURLY_TYPES) }),
      numberField("consultingDaysPerMonth", "Aylık danışmanlık günü", 0.5, { visibleWhen: { key: "businessType", equals: "consulting_company" } }),
      numberField("dailyConsultingFee", "Günlük danışmanlık bedeli (TL)", 1000, { visibleWhen: { key: "businessType", equals: "consulting_company" } }),
      numberField("hoursPerConsultingDay", "Danışmanlık günü başı saat", 0.5, { visibleWhen: { key: "businessType", equals: "consulting_company" } }),
      numberField("monthlyCampaignCount", "Aylık kampanya sayısı", 0.5, { visibleWhen: { key: "businessType", equals: "advertising_agency" } }),
      numberField("averageCampaignFee", "Kampanya başı ajans bedeli (TL)", 1000, { visibleWhen: { key: "businessType", equals: "advertising_agency" } }),
      numberField("campaignHours", "Kampanya başı üretim saati", 1, { visibleWhen: { key: "businessType", equals: "advertising_agency" } }),
      numberField("managedAdSpend", "Aylık yönetilen reklam bütçesi (TL)", 10000, { visibleWhen: { key: "businessType", equals: "performance_marketing" } }),
      rateField("managementFeeRate", "Reklam bütçesi yönetim ücreti", { visibleWhen: { key: "businessType", equals: "performance_marketing" } }),
      numberField("performanceBonusRevenue", "Aylık performans primi geliri (TL)", 1000, { visibleWhen: { key: "businessType", equals: "performance_marketing" } }),
      numberField("clientCount", "Aktif müşteri sayısı", 1),
      rateField("largestClientRevenueShare", "En büyük müşterinin ciro payı"),
    ],
  },
  {
    title: "2 · Ekip kapasitesi, revizyon ve kapsam", open: true,
    fields: [
      booleanField("advancedStaffMixEnabled", "Rol bazlı ekip kapasitesini kullan", { full: true }),
      tableField("staffRoles", "Üretim ekibi rolleri", [
        { type: "text", key: "role", label: "Rol", defaultValue: "Uzman" },
        { type: "number", key: "count", label: "Kişi", step: 1, defaultValue: 1 },
        { type: "number", key: "monthlyHoursPerPerson", label: "Aylık saat", step: 1, defaultValue: 176 },
        { type: "rate", key: "billableRate", label: "Faturalandırılabilir", defaultValue: 0.70 },
        { type: "number", key: "hourlyCost", label: "Saatlik maliyet", step: 10, defaultValue: 750 },
      ], {
        visibleWhen: { key: "advancedStaffMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { role: "Uzman", count: 1, monthlyHoursPerPerson: 176, billableRate: 0.70, hourlyCost: 750 },
      }),
      numberField("teamSize", "Üretim ekibi kişi sayısı", 1, { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
      numberField("monthlyHoursPerPerson", "Kişi başı aylık çalışma saati", 1, { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
      rateField("targetUtilizationRate", "Hedef faturalandırılabilir kapasite", { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
      numberField("hourlyCost", "Ekip saatlik üretim maliyeti (TL)", 10, { visibleWhen: { key: "advancedStaffMixEnabled", equals: false } }),
      numberField("revisionHoursPerProject", "Birim iş başına sözleşmeli revizyon saati", 1),
      rateField("scopeCreepRate", "Kapsam taşması / baz üretim saati"),
      rateField("revisionRecoveryRate", "Revizyon saatlerinin müşteriye yansıtılan payı"),
    ],
  },
  {
    title: "3 · Taşeron, tahsilat ve ek faaliyet geliri", open: true,
    fields: [
      booleanField("advancedSubcontractorMixEnabled", "Taşeron kalemlerini tabloyla izle", { full: true }),
      tableField("subcontractors", "Taşeron / freelancer kalemleri", [
        { type: "text", key: "name", label: "Kalem", defaultValue: "Taşeron" },
        { type: "number", key: "monthlyCost", label: "Aylık maliyet", step: 1000, defaultValue: 0 },
        { type: "number", key: "hoursSupplied", label: "Sağlanan saat", step: 1, defaultValue: 0 },
      ], {
        visibleWhen: { key: "advancedSubcontractorMixEnabled", equals: true }, minRows: 1, maxRows: 20,
        newRow: { name: "Taşeron", monthlyCost: 0, hoursSupplied: 0 },
      }),
      numberField("freelancerPayments", "Aylık freelancer / taşeron ödemesi (TL)", 1000, { visibleWhen: { key: "advancedSubcontractorMixEnabled", equals: false } }),
      rateField("otherVariableCostRate", "Diğer değişken maliyet / net hizmet geliri"),
      rateField("advanceCollectionRate", "Sözleşme başlangıcında alınan peşinat payı"),
      numberField("monthlyOperatingGrantIncome", "Aylık P&L hibe / destek geliri (TL)", 1000, { hint: "Finansmandan ayrıdır; faaliyet gelirine ayrı eklenir." }),
    ],
  },
];
