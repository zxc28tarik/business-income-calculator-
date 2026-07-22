const rate = (v, d = 0) => Math.min(1, Math.max(0, Number.isFinite(+v) ? +v : d));
const amount = (v, d = 0) => Math.max(0, Number.isFinite(+v) ? +v : d);
const integer = (v, d = 0, max = Number.MAX_SAFE_INTEGER) => Math.min(max, Math.max(0, Math.round(amount(v, d))));
const clone = (v) => structuredClone(v);

export const STEAM_BUSINESS_PROFILE_DEFAULTS = {
  mobileMonthlyActiveUsers: 100000,
  mobilePeriodMonths: 12,
  mobilePayerConversionRate: 0.025,
  mobileAverageIapRevenuePerPayerUsd: 18,
  mobileAdRevenuePerActiveUserUsd: 0.08,
  mobileStoreCommissionRate: 0.30,
  mobileRefundRate: 0.02,
  dlcEligibleOwners: 50000,
  dlcAttachRate: 0.12,
  dlcPriceUsd: 7.99,
  dlcRefundRate: 0.05,
  assetMonthlyUnits: 350,
  assetAveragePriceUsd: 29,
  assetPeriodMonths: 12,
  assetMarketplaceCommissionRate: 0.30,
  assetRefundRate: 0.04,
};

export const STEAM_BUSINESS_PROFILES = {
  steam_publisher: ["Steam oyun yayıncısı", "Yayıncı yatırımı, recoup ve geliştirici paylaşımı bulunan ana master profil.", "Başabaş oyun satışı"],
  indie_self_publish: ["Indie oyun kendi yayınlama", "Harici yayıncı payı olmadan IP sahibinin kendi yayınladığı oyun.", "Başabaş oyun satışı"],
  mobile_game: ["Mobil oyun", "Aktif kullanıcı, ödeme dönüşümü, IAP ve reklam gelirine dayalı profil.", "Başabaş kullanıcı-ay"],
  dlc_supporter_pack: ["DLC / supporter pack", "Sahip tabanı ve satın alma oranına dayalı ek içerik profili.", "Başabaş DLC satışı"],
  game_asset_digital_product: ["Oyun asset / dijital ürün", "Aylık satış ve pazar yeri komisyonuna dayalı dijital ürün profili.", "Başabaş ürün satışı"],
  publisher_developer_split: ["Publisher–developer paylaşımı", "Gelirin sözleşme, recoup ve pay oranlarıyla dağıtıldığı profil.", "Başabaş oyun satışı"],
};

function normalized(raw = {}) {
  return {
    ...raw,
    mobileMonthlyActiveUsers: integer(raw.mobileMonthlyActiveUsers, 100000),
    mobilePeriodMonths: integer(raw.mobilePeriodMonths, 12, 120) || 1,
    mobilePayerConversionRate: rate(raw.mobilePayerConversionRate, 0.025),
    mobileAverageIapRevenuePerPayerUsd: amount(raw.mobileAverageIapRevenuePerPayerUsd, 18),
    mobileAdRevenuePerActiveUserUsd: amount(raw.mobileAdRevenuePerActiveUserUsd, 0.08),
    mobileStoreCommissionRate: rate(raw.mobileStoreCommissionRate, 0.30),
    mobileRefundRate: rate(raw.mobileRefundRate, 0.02),
    dlcEligibleOwners: integer(raw.dlcEligibleOwners, 50000),
    dlcAttachRate: rate(raw.dlcAttachRate, 0.12),
    dlcPriceUsd: amount(raw.dlcPriceUsd, 7.99),
    dlcRefundRate: rate(raw.dlcRefundRate, 0.05),
    assetMonthlyUnits: integer(raw.assetMonthlyUnits, 350),
    assetAveragePriceUsd: amount(raw.assetAveragePriceUsd, 29),
    assetPeriodMonths: integer(raw.assetPeriodMonths, 12, 120) || 1,
    assetMarketplaceCommissionRate: rate(raw.assetMarketplaceCommissionRate, 0.30),
    assetRefundRate: rate(raw.assetRefundRate, 0.04),
  };
}

function selfPublish(input) {
  Object.assign(input, {
    publisherShareRate: 1,
    developerShareRate: 0,
    recoupEnabled: false,
    minimumGuaranteeUsd: 0,
    milestonesUsd: 0,
    advanceRecoupable: false,
    ipShareRate: 0,
    coPublisherShareRate: 0,
    developerPaymentFrequency: "manual",
  });
}

export function buildSteamBusinessProfileInput(raw = {}) {
  const sourceInput = normalized({ ...clone(STEAM_BUSINESS_PROFILE_DEFAULTS), ...clone(raw) });
  const id = STEAM_BUSINESS_PROFILES[sourceInput.businessType] ? sourceInput.businessType : "steam_publisher";
  const [label, description, breakevenLabel] = STEAM_BUSINESS_PROFILES[id];
  const engineInput = clone(sourceInput);
  const metrics = {};

  if (id === "indie_self_publish") selfPublish(engineInput);
  if (id === "mobile_game") {
    const payers = sourceInput.mobileMonthlyActiveUsers * sourceInput.mobilePayerConversionRate;
    const iap = payers * sourceInput.mobileAverageIapRevenuePerPayerUsd;
    const ads = sourceInput.mobileMonthlyActiveUsers * sourceInput.mobileAdRevenuePerActiveUserUsd;
    const monthly = iap + ads;
    const userMonths = sourceInput.mobileMonthlyActiveUsers * sourceInput.mobilePeriodMonths;
    Object.assign(engineInput, {
      units: userMonths,
      listPriceUsd: sourceInput.mobileMonthlyActiveUsers ? monthly / sourceInput.mobileMonthlyActiveUsers : 0,
      discountRate: 0,
      refundRate: sourceInput.mobileRefundRate,
      regionMode: false,
      tieredCommissionEnabled: false,
      flatCommissionRate: sourceInput.mobileStoreCommissionRate,
      directFeeRefundEnabled: false,
    });
    selfPublish(engineInput);
    Object.assign(metrics, { monthlyActiveUsers: sourceInput.mobileMonthlyActiveUsers, payerCountMonthly: payers, monthlyIapRevenueUsd: iap, monthlyAdRevenueUsd: ads, monthlyGrossRevenueUsd: monthly, blendedArpuUsd: sourceInput.mobileMonthlyActiveUsers ? monthly / sourceInput.mobileMonthlyActiveUsers : 0, userMonths });
  }
  if (id === "dlc_supporter_pack") {
    const projectedUnits = Math.round(sourceInput.dlcEligibleOwners * sourceInput.dlcAttachRate);
    Object.assign(engineInput, { units: projectedUnits, listPriceUsd: sourceInput.dlcPriceUsd, refundRate: sourceInput.dlcRefundRate });
    Object.assign(metrics, { eligibleOwners: sourceInput.dlcEligibleOwners, attachRate: sourceInput.dlcAttachRate, projectedUnits });
  }
  if (id === "game_asset_digital_product") {
    const projectedUnits = sourceInput.assetMonthlyUnits * sourceInput.assetPeriodMonths;
    Object.assign(engineInput, { units: projectedUnits, listPriceUsd: sourceInput.assetAveragePriceUsd, refundRate: sourceInput.assetRefundRate, regionMode: false, tieredCommissionEnabled: false, flatCommissionRate: sourceInput.assetMarketplaceCommissionRate, directFeeRefundEnabled: false });
    selfPublish(engineInput);
    Object.assign(metrics, { monthlyUnits: sourceInput.assetMonthlyUnits, periodMonths: sourceInput.assetPeriodMonths, projectedUnits });
  }
  if (id === "publisher_developer_split") Object.assign(metrics, { publisherShareRate: engineInput.publisherShareRate, developerShareRate: engineInput.developerShareRate });

  return { sourceInput, engineInput, profile: { id, label, description, breakevenLabel }, metrics };
}

const MULTIPLIERS = {
  mobile_game: { pessimistic: { mobileMonthlyActiveUsers: 0.65, mobilePayerConversionRate: 0.80, mobileAdRevenuePerActiveUserUsd: 0.85 }, optimistic: { mobileMonthlyActiveUsers: 1.35, mobilePayerConversionRate: 1.15, mobileAdRevenuePerActiveUserUsd: 1.15 } },
  dlc_supporter_pack: { pessimistic: { dlcAttachRate: 0.60, dlcPriceUsd: 0.95 }, optimistic: { dlcAttachRate: 1.35, dlcPriceUsd: 1.05 } },
  game_asset_digital_product: { pessimistic: { assetMonthlyUnits: 0.65, assetAveragePriceUsd: 0.90 }, optimistic: { assetMonthlyUnits: 1.40, assetAveragePriceUsd: 1.05 } },
};

export function applySteamBusinessProfileScenario(raw, scenarioId) {
  const next = normalized(clone(raw));
  for (const [key, multiplier] of Object.entries(MULTIPLIERS[next.businessType]?.[scenarioId] ?? {})) next[key] *= multiplier;
  return normalized(next);
}
