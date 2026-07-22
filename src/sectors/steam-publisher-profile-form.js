import {
  numberField,
  rateField,
  selectField,
} from "../core/sector-schema.js";
import {
  STEAM_PUBLISHER_CASH_FLOW_COLUMNS,
  STEAM_PUBLISHER_FORM_SECTIONS as BASE_FORM_SECTIONS,
} from "./steam-publisher-form.js";

const STANDARD_GAME_TYPES = ["steam_publisher", "indie_self_publish", "publisher_developer_split"];
const REGION_TYPES = [...STANDARD_GAME_TYPES, "dlc_supporter_pack"];
const AGREEMENT_TYPES = ["steam_publisher", "dlc_supporter_pack", "publisher_developer_split"];

const profileSection = {
  title: "1 · İş modeli ve satış sürücüleri",
  open: true,
  fields: [
    selectField("businessType", "İş modeli", [
      ["steam_publisher", "Steam oyun yayıncısı"],
      ["indie_self_publish", "Indie oyun kendi yayınlama"],
      ["mobile_game", "Mobil oyun gelir modeli"],
      ["dlc_supporter_pack", "DLC / supporter pack modeli"],
      ["game_asset_digital_product", "Oyun asset / dijital ürün satışı"],
      ["publisher_developer_split", "Publisher–developer gelir paylaşımı"],
    ], { full: true }),
    numberField("listPriceUsd", "Liste fiyatı (USD)", 0.01, { visibleWhen: { key: "businessType", in: STANDARD_GAME_TYPES } }),
    numberField("units", "Satış adedi (ilk yıl)", 100, { visibleWhen: { key: "businessType", in: STANDARD_GAME_TYPES } }),
    rateField("discountRate", "Ortalama indirim", { visibleWhen: { key: "businessType", in: STANDARD_GAME_TYPES } }),
    rateField("refundRate", "İade oranı", { visibleWhen: { key: "businessType", in: STANDARD_GAME_TYPES } }),

    numberField("mobileMonthlyActiveUsers", "Aylık aktif kullanıcı", 1000, { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
    numberField("mobilePeriodMonths", "Projeksiyon dönemi (ay)", 1, { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
    rateField("mobilePayerConversionRate", "Ödeyen kullanıcı dönüşümü", { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
    numberField("mobileAverageIapRevenuePerPayerUsd", "Ödeyen kullanıcı başı aylık IAP (USD)", 0.01, { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
    numberField("mobileAdRevenuePerActiveUserUsd", "Aktif kullanıcı başı aylık reklam (USD)", 0.01, { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
    rateField("mobileRefundRate", "Mobil iade / ters işlem oranı", { visibleWhen: { key: "businessType", equals: "mobile_game" } }),

    numberField("dlcEligibleOwners", "DLC satın alabilecek sahip tabanı", 1000, { visibleWhen: { key: "businessType", equals: "dlc_supporter_pack" } }),
    rateField("dlcAttachRate", "DLC satın alma oranı", { visibleWhen: { key: "businessType", equals: "dlc_supporter_pack" } }),
    numberField("dlcPriceUsd", "DLC / supporter pack fiyatı (USD)", 0.01, { visibleWhen: { key: "businessType", equals: "dlc_supporter_pack" } }),
    rateField("dlcRefundRate", "DLC iade oranı", { visibleWhen: { key: "businessType", equals: "dlc_supporter_pack" } }),

    numberField("assetMonthlyUnits", "Aylık dijital ürün satışı", 1, { visibleWhen: { key: "businessType", equals: "game_asset_digital_product" } }),
    numberField("assetAveragePriceUsd", "Ortalama ürün fiyatı (USD)", 0.01, { visibleWhen: { key: "businessType", equals: "game_asset_digital_product" } }),
    numberField("assetPeriodMonths", "Projeksiyon dönemi (ay)", 1, { visibleWhen: { key: "businessType", equals: "game_asset_digital_product" } }),
    rateField("assetRefundRate", "Dijital ürün iade oranı", { visibleWhen: { key: "businessType", equals: "game_asset_digital_product" } }),

    rateField("chargebackRate", "Ters ibraz oranı"),
    numberField("usdTry", "USD/TRY", 0.01),
    numberField("eurUsd", "EUR/USD", 0.01),
    numberField("gbpUsd", "GBP/USD", 0.01),
  ],
};

function withVisibility(field, visibleWhen) {
  return { ...field, visibleWhen };
}

const sections = structuredClone(BASE_FORM_SECTIONS.slice(1));
sections[0].visibleWhen = { key: "businessType", in: REGION_TYPES };

const platform = sections[1];
platform.title = "3 · Platform kesintileri";
platform.fields = platform.fields.map((field) => {
  if (field.key === "tieredCommissionEnabled" || field.key === "directFeeRefundEnabled") {
    return withVisibility(field, { key: "businessType", in: REGION_TYPES });
  }
  if (["tier1Cap", "tier1Rate", "tier2Cap", "tier2Rate", "tier3Rate"].includes(field.key)) {
    return withVisibility(field, { all: [{ key: "businessType", in: REGION_TYPES }, { key: "tieredCommissionEnabled", equals: true }] });
  }
  if (field.key === "flatCommissionRate") {
    return withVisibility(field, { all: [{ key: "businessType", in: REGION_TYPES }, { key: "tieredCommissionEnabled", equals: false }] });
  }
  return field;
});
platform.fields.splice(7, 0,
  rateField("mobileStoreCommissionRate", "Mobil mağaza komisyonu", { visibleWhen: { key: "businessType", equals: "mobile_game" } }),
  rateField("assetMarketplaceCommissionRate", "Dijital pazar yeri komisyonu", { visibleWhen: { key: "businessType", equals: "game_asset_digital_product" } }),
);

const agreement = sections.find((section) => section.title.startsWith("5 ·"));
agreement.visibleWhen = { key: "businessType", in: AGREEMENT_TYPES };

const directCosts = sections.find((section) => section.title.startsWith("6 ·"));
directCosts.title = "6 · Doğrudan ürün giderleri ve recoup";

export const STEAM_PROFILED_FORM_SECTIONS = [profileSection, ...sections];
export { STEAM_PUBLISHER_CASH_FLOW_COLUMNS };
