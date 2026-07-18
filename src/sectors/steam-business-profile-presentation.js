export function buildSteamBusinessProfileWarnings(result) {
  const { profile, profileMetrics: m, input } = result;
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });
  if (profile.id === "mobile_game") {
    if (input.mobilePayerConversionRate < 0.01) add("mobile_low_payer_conversion", "soft", "Mobil oyunda ödeyen kullanıcı dönüşümü %1'in altında.");
    if (m.blendedArpuUsd < 0.20) add("mobile_low_arpu", "soft", "Kullanıcı başı aylık IAP + reklam geliri 0,20 USD'nin altında.");
    if (input.mobileStoreCommissionRate > 0.30) add("mobile_store_cut", "soft", "Mobil mağaza komisyonu %30'un üzerinde.");
  }
  if (profile.id === "dlc_supporter_pack" && input.dlcAttachRate < 0.05) add("dlc_low_attach", "soft", "DLC satın alma oranı %5'in altında.");
  if (profile.id === "game_asset_digital_product" && input.assetMonthlyUnits < 50) add("asset_low_volume", "soft", "Aylık dijital ürün satış hacmi 50 adedin altında.");
  if (profile.id === "indie_self_publish" && result.settlement.developerTotalPaymentTry !== 0) add("self_publish_external_split", "hard", "Kendi yayınlama profilinde harici geliştirici ödemesi oluşmamalıdır.");
  return warnings;
}

export function buildSteamBusinessProfileKpis(result) {
  const { profile, profileMetrics: m, input, tax } = result;
  if (profile.id === "mobile_game") return [
    { label: "Aylık aktif kullanıcı", value: m.monthlyActiveUsers, format: "number" },
    { label: "Aylık ödeyen kullanıcı", value: m.payerCountMonthly, format: "number" },
    { label: "Kullanıcı başı aylık gelir", value: m.blendedArpuUsd * input.usdTry, format: "money", note: "IAP + reklam" },
  ];
  if (profile.id === "dlc_supporter_pack") return [
    { label: "DLC satın alma oranı", value: m.attachRate, format: "percent" },
    { label: "Öngörülen DLC satışı", value: m.projectedUnits, format: "number" },
    { label: "Sahip başı yayıncı neti", value: m.eligibleOwners ? tax.publisherNetProfitTry / m.eligibleOwners : 0, format: "money" },
  ];
  if (profile.id === "game_asset_digital_product") return [
    { label: "Aylık ürün satışı", value: m.monthlyUnits, format: "number" },
    { label: "Dönem toplam satışı", value: m.projectedUnits, format: "number" },
    { label: "Ürün başı yayıncı neti", value: m.projectedUnits ? tax.publisherNetProfitTry / m.projectedUnits : 0, format: "money" },
  ];
  if (profile.id === "indie_self_publish") return [
    { label: "Harici geliştirici payı", value: result.settlement.developerTotalPaymentTry, format: "money", note: "Kendi yayınlamada sıfır" },
    { label: "IP sahibine kalan", value: tax.publisherNetProfitTry, format: "money" },
  ];
  return [];
}

export function buildSteamBusinessProfileBreakdown(result) {
  const { profile, profileMetrics: m, input } = result;
  const rows = [["Profil", profile.label, "text"]];
  if (profile.id === "mobile_game") rows.push(["Aylık aktif kullanıcı", m.monthlyActiveUsers, "number"], ["Aylık ödeyen kullanıcı", m.payerCountMonthly, "number"], ["Aylık IAP geliri", m.monthlyIapRevenueUsd * input.usdTry], ["Aylık reklam geliri", m.monthlyAdRevenueUsd * input.usdTry]);
  if (profile.id === "dlc_supporter_pack") rows.push(["Uygun sahip tabanı", m.eligibleOwners, "number"], ["Satın alma oranı", m.attachRate, "percent"], ["Öngörülen satış", m.projectedUnits, "number"]);
  if (profile.id === "game_asset_digital_product") rows.push(["Aylık satış", m.monthlyUnits, "number"], ["Dönem ayı", m.periodMonths, "number"], ["Toplam satış", m.projectedUnits, "number"]);
  if (profile.id === "indie_self_publish") rows.push(["Harici gelir paylaşımı", 0, "percent"]);
  return { title: "Profil · İş modeli sürücüleri", rows };
}
