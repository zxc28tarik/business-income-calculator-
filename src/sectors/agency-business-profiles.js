const staff = (role, count, monthlyHoursPerPerson, billableRate, hourlyCost) => ({ role, count, monthlyHoursPerPerson, billableRate, hourlyCost });
const subcontractor = (name, monthlyCost, hoursSupplied) => ({ name, monthlyCost, hoursSupplied });

export const AGENCY_PROFILE_INPUT_DEFAULTS = {
  profileTypeApplied: "software_agency",
  advancedProfileDriverEnabled: false,
  retainerClientCount: 4,
  averageMonthlyRetainer: 180000,
  retainerHoursPerClient: 70,
  monthlyBillableHours: 520,
  consultingDaysPerMonth: 16,
  dailyConsultingFee: 18000,
  hoursPerConsultingDay: 7,
  monthlyCampaignCount: 4,
  averageCampaignFee: 220000,
  campaignHours: 120,
  managedAdSpend: 2500000,
  managementFeeRate: 0.12,
  performanceBonusRevenue: 0,
  scopeCreepRate: 0,
  revisionRecoveryRate: 0,
  advanceCollectionRate: 0,
  advancedStaffMixEnabled: false,
  staffRoles: [staff("Üretim ekibi", 6, 176, 0.72, 850)],
  advancedSubcontractorMixEnabled: false,
  subcontractors: [subcontractor("Genel taşeron", 90000, 80)],
  monthlyOperatingGrantIncome: 0,
};

export const AGENCY_BUSINESS_PROFILES = {
  software_agency: { label: "Yazılım ajansı", driver: "project", defaults: {} },
  social_media_agency: {
    label: "Sosyal medya ajansı", driver: "retainer",
    defaults: {
      advancedProfileDriverEnabled: true, retainerClientCount: 8, averageMonthlyRetainer: 90000,
      retainerHoursPerClient: 42, clientCount: 8, largestClientRevenueShare: 0.18,
      advancedStaffMixEnabled: true,
      staffRoles: [staff("Sosyal medya uzmanı", 3, 176, 0.72, 650), staff("Tasarımcı", 2, 176, 0.68, 780)],
    },
  },
  advertising_agency: {
    label: "Reklam ajansı", driver: "campaign",
    defaults: {
      advancedProfileDriverEnabled: true, monthlyCampaignCount: 5, averageCampaignFee: 260000,
      campaignHours: 115, clientCount: 6, largestClientRevenueShare: 0.25,
      advancedSubcontractorMixEnabled: true,
      subcontractors: [subcontractor("Prodüksiyon", 180000, 120), subcontractor("Medya / kreatif destek", 90000, 60)],
    },
  },
  design_agency: {
    label: "Tasarım ajansı", driver: "project",
    defaults: { advancedProfileDriverEnabled: true, averageProjectFee: 120000, monthlyProjectCount: 8, averageProjectHours: 62, revisionHoursPerProject: 12, teamSize: 4, hourlyCost: 720 },
  },
  consulting_company: {
    label: "Danışmanlık şirketi", driver: "consulting_days",
    defaults: { advancedProfileDriverEnabled: true, consultingDaysPerMonth: 42, dailyConsultingFee: 22000, hoursPerConsultingDay: 7, teamSize: 4, targetUtilizationRate: 0.66, clientCount: 7 },
  },
  freelance_developer: {
    label: "Freelancer yazılımcı", driver: "billable_hours",
    defaults: { advancedProfileDriverEnabled: true, monthlyBillableHours: 125, hourlySalesPrice: 2600, teamSize: 1, monthlyHoursPerPerson: 176, targetUtilizationRate: 0.72, hourlyCost: 900, adminStaffCost: 0, officeRent: 10000, freelancerPayments: 0, clientCount: 3 },
  },
  freelance_designer: {
    label: "Freelancer tasarımcı", driver: "billable_hours",
    defaults: { advancedProfileDriverEnabled: true, monthlyBillableHours: 120, hourlySalesPrice: 1900, teamSize: 1, monthlyHoursPerPerson: 176, targetUtilizationRate: 0.70, hourlyCost: 650, adminStaffCost: 0, officeRent: 8000, freelancerPayments: 0, clientCount: 4 },
  },
  video_editing: {
    label: "Video / editing hizmeti", driver: "project",
    defaults: { advancedProfileDriverEnabled: true, averageProjectFee: 70000, monthlyProjectCount: 12, averageProjectHours: 34, revisionHoursPerProject: 8, teamSize: 3, hourlyCost: 700, hardwareInvestment: 650000 },
  },
  seo_agency: {
    label: "SEO ajansı", driver: "retainer",
    defaults: { advancedProfileDriverEnabled: true, retainerClientCount: 10, averageMonthlyRetainer: 65000, retainerHoursPerClient: 28, clientCount: 10, largestClientRevenueShare: 0.14, teamSize: 4, softwareSubscriptions: 45000 },
  },
  performance_marketing: {
    label: "Performans reklam ajansı", driver: "managed_spend",
    defaults: { advancedProfileDriverEnabled: true, managedAdSpend: 6000000, managementFeeRate: 0.10, performanceBonusRevenue: 120000, monthlyBillableHours: 420, clientCount: 6, largestClientRevenueShare: 0.24, softwareSubscriptions: 65000 },
  },
};

export function getAgencyBusinessProfile(businessType) {
  return AGENCY_BUSINESS_PROFILES[businessType] ?? AGENCY_BUSINESS_PROFILES.software_agency;
}
