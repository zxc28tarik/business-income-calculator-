import { buildSaasPresentation as buildLegacyPresentation } from "./saas-presentation.js";

const fixedLabels = {
  contentProductionCost: "İçerik üretimi",
  communityManagementCost: "Topluluk yönetimi",
};

function driverLabel(type) {
  if (type === "api_service") return "API müşterisi";
  if (type === "enterprise_license") return "Kurumsal müşteri";
  if (type === "b2b_saas") return "B2B müşteri";
  return "Ücretli abone";
}

export function buildSaasPresentation(result) {
  const presentation = buildLegacyPresentation(result);
  const label = driverLabel(result.input.businessType);

  const mrr = presentation.kpis.find((item) => item.id === "mrr");
  if (mrr) mrr.note = `${round(result.endingSubscribers, 0)} ay sonu ${label.toLocaleLowerCase("tr-TR")}`;
  const breakeven = presentation.kpis.find((item) => item.id === "breakeven");
  if (breakeven) {
    breakeven.label = `Başabaş ${label.toLocaleLowerCase("tr-TR")}`;
    breakeven.suffix = "";
  }

  presentation.kpis.splice(4, 0,
    { id: "nrr", label: "Net gelir tutma (NRR)", value: result.netRevenueRetention, format: "percent", note: "Churn + downgrade + expansion", negative: result.netRevenueRetention < 1 },
    { id: "grr", label: "Brüt gelir tutma (GRR)", value: result.grossRevenueRetention, format: "percent", note: "Expansion hariç gelir tutma", negative: result.grossRevenueRetention < 0.90 },
    { id: "support_capacity", label: "Destek kapasite yükü", value: result.supportCapacityLoad, format: "percent", note: `${round(result.supportCapacity, 0)} müşteri kapasitesi`, negative: result.supportCapacityLoad > 1 },
  );

  presentation.keySplit.splice(4, 0,
    { label: "Onboarding geliri", value: result.onboardingNet },
    { label: "Faaliyet hibesi / destek geliri", value: result.operatingGrantIncome },
  );
  if (result.annualPrepaymentIncrement > 0) {
    presentation.keySplit.push({ label: "İlk ay ek yıllık peşin nakit", value: result.annualPrepaymentIncrement });
  }

  presentation.scenarioMetrics.splice(3, 0,
    { id: "nrr", label: "NRR", value: result.netRevenueRetention, format: "percent" },
    { id: "gross_margin", label: "Brüt katkı marjı", value: result.grossMargin, format: "percent" },
  );

  presentation.breakdown.unshift({
    title: "Profil · İş modeli ve gelir sürücüsü",
    rows: [
      ["İş türü", result.profile.label, "text"],
      [label, result.endingSubscribers, "number"],
      ["Plan ağırlıklı aylık fiyat", result.planMetrics.monthlyPrice],
      ["Yıllık peşin ödeme payı", result.planMetrics.annualBillingShareRate, "percent"],
      ["Expansion MRR oranı", result.input.expansionMrrRate, "percent"],
      ["Contraction MRR oranı", result.input.contractionMrrRate, "percent"],
      ["Onboarding geliri", result.onboardingNet],
    ],
  });

  presentation.breakdown.splice(5, 0, {
    title: "Profil · Altyapı, freemium ve destek kapasitesi",
    rows: [
      ["API kullanım maliyeti", -result.apiUsageCost],
      ["Ücretsiz kullanıcı maliyeti", -result.freeUserCost],
      ["Destek / müşteri başarı kapasitesi", result.supportCapacity, "number"],
      ["Destek kapasite yükü", result.supportCapacityLoad, "percent"],
      ["Brüt gelir tutma (GRR)", result.grossRevenueRetention, "percent"],
      ["Net gelir tutma (NRR)", result.netRevenueRetention, "percent"],
      ["İlk ay ek yıllık peşin nakit", result.annualPrepaymentIncrement],
      ...Object.entries(result.fixedCostItems)
        .filter(([key]) => fixedLabels[key])
        .map(([key, value]) => [fixedLabels[key], -value]),
    ],
  });

  const cashSection = presentation.breakdown.find((section) => section.title.includes("Nakit akışı"));
  if (cashSection) cashSection.rows.push(["İlk ay ek yıllık peşin nakit", result.annualPrepaymentIncrement]);
  return presentation;
}

function round(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const power = 10 ** digits;
  return Math.round((number + Number.EPSILON) * power) / power;
}
