import { escapeHtml, formatValue } from "./formatters.js";

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const SECTOR_REVENUE_CARD = {
  cafe_restaurant: (result) => ({
    label: "Aylık ciro",
    value: result.grossRevenue,
    note: "Brüt müşteri satışları",
  }),
  ecommerce_marketplace: (result) => ({
    label: "Aylık net satış geliri",
    value: result.adjustedRevenue,
    note: "Vergi, iade ve kayıp sonrası",
  }),
  beauty_personal_care: (result) => ({
    label: "Aylık hizmet geliri",
    value: result.completedServiceRevenue,
    note: "Tamamlanan hizmet ve seanslar",
  }),
  agency_freelance_consulting: (result) => ({
    label: "Aylık tahsilat",
    value: result.revenueAfterCommission,
    note: `${formatNumber(result.totalAvailableDeliveryHours)} saat kullanılabilir kapasite`,
  }),
  physical_retail: (result) => ({
    label: "Aylık net satış",
    value: result.adjustedRevenue,
    note: "İade ve kayıplar sonrası",
  }),
  auto_services: (result) => ({
    label: "Aylık hizmet geliri",
    value: result.adjustedRevenue,
    note: `${formatNumber(result.monthlyVehicles)} tamamlanan iş`,
  }),
  game_digital_publishing: (result) => ({
    label: "Yayıncı tahsilatı",
    value: result.receipt?.receiptTry,
    note: "Banka, kur ve sağlayıcı giderleri sonrası",
  }),
};

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("tr-TR");
}

function formatNumber(value) {
  const numeric = finite(value);
  return numeric == null ? "—" : numeric.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
}

function findCard(cards, predicate) {
  const index = cards.findIndex(predicate);
  return index < 0 ? { card: null, index: -1 } : { card: cards[index], index };
}

function resolveNetProfit(result, cards) {
  return finite(result.netProfit)
    ?? finite(result.tax?.publisherNetProfitTry)
    ?? finite(cards.find((card) => card.id === "net_profit")?.value)
    ?? finite(cards.find((card) => /^(aylık net kâr|yayıncı net kârı)$/iu.test(card.label ?? ""))?.value);
}

function resolveCash(result) {
  const rows = result.cashFlow?.rows ?? [];
  const rowCash = rows.map((row) => finite(row.cashEnd)).filter((value) => value != null);
  const endingCash = finite(result.cashFlow?.endingCash)
    ?? finite(result.cashFlow?.endingCashTry)
    ?? rowCash.at(-1)
    ?? null;
  const minimumCash = finite(result.cashFlow?.minimumCash)
    ?? finite(result.cashFlow?.minimumCashTry)
    ?? (rowCash.length ? Math.min(...rowCash) : endingCash);
  return { endingCash, minimumCash };
}

function resolveRevenueCard(sector, result, cards) {
  if (sector.id === "saas_subscription") {
    const existing = findCard(cards, (card) => card.id === "mrr");
    if (existing.card) return existing;
  }
  const factory = SECTOR_REVENUE_CARD[sector.id];
  const card = factory?.(result) ?? {
    label: "Aylık ana gelir",
    value: result.grossRevenue ?? result.adjustedRevenue,
    note: "Sektörün ana gelir göstergesi",
  };
  return {
    card: {
      id: "main_revenue",
      format: "money",
      ...card,
      negative: finite(card.value) != null && finite(card.value) < 0,
    },
    index: -1,
  };
}

function decisionMessage({ netProfit, minimumCash, hardCount, softCount }) {
  if (netProfit != null && netProfit < 0 && minimumCash != null && minimumCash < 0) {
    return "Mevcut varsayımlarda işletme aylık zarar ediyor ve nakit dengesi dönem içinde negatife düşüyor.";
  }
  if (netProfit != null && netProfit < 0) {
    return "Mevcut varsayımlarda işletme aylık zarar ediyor; ana riskler düzeltilmeden model dayanıklı görünmüyor.";
  }
  if (minimumCash != null && minimumCash < 0) {
    return "Aylık sonuç pozitif olsa da nakit dengesi dönem içinde negatife düşüyor.";
  }
  if (hardCount > 0) {
    return `Finans sonucu pozitif görünse de ${hardCount} kritik risk modelin uygulanabilirliğini zayıflatıyor.`;
  }
  if (softCount > 0) {
    return `Model aylık olarak dengeli görünüyor; ${softCount} konu yakından izlenmeli.`;
  }
  return "Mevcut varsayımlarda aylık sonuç ve nakit dengesi pozitif; kritik risk görünmüyor.";
}

export function buildDecisionHierarchy({ sector, result, presentation }) {
  const cards = presentation.kpis ?? [];
  const warnings = result.warnings ?? [];
  const hardCount = warnings.filter((warning) => warning.severity === "hard").length;
  const softCount = warnings.filter((warning) => warning.severity === "soft").length;
  const netProfit = resolveNetProfit(result, cards);
  const { endingCash, minimumCash } = resolveCash(result);

  const net = findCard(cards, (card) =>
    card.id === "net_profit"
    || /^(aylık net kâr|yayıncı net kârı)$/iu.test(card.label ?? ""));
  const revenue = resolveRevenueCard(sector, result, cards);
  const breakeven = findCard(cards, (card) =>
    normalize(card.id).startsWith("breakeven")
    || normalize(card.label).includes("başabaş"));
  const cash = findCard(cards, (card) =>
    card.id === "ending_cash"
    || normalize(card.label).includes("12 ay sonu nakit"));

  const primaryKpis = [
    {
      label: "Aylık net sonuç",
      format: "money",
      note: "Vergi ve paydaş ödemeleri sonrası",
      ...(net.card ?? {}),
      id: "net_profit",
      value: netProfit,
      negative: netProfit != null && netProfit < 0,
      positive: netProfit != null && netProfit >= 0,
    },
    revenue.card,
    {
      label: "Başabaş",
      format: "number",
      note: netProfit != null && netProfit >= 0 ? "Mevcut sonuç başabaşı aşıyor" : "Mevcut sonuç başabaşın altında",
      ...(breakeven.card ?? {}),
      id: "breakeven",
      positive: netProfit != null && netProfit >= 0,
      negative: netProfit != null && netProfit < 0,
    },
    {
      label: "12 ay sonu nakit",
      format: "money",
      ...(cash.card ?? {}),
      id: "ending_cash",
      value: endingCash,
      note: minimumCash == null ? "Minimum nakit hesaplanamadı" : `Minimum: ${money.format(minimumCash)}`,
      negative: (endingCash != null && endingCash < 0) || (minimumCash != null && minimumCash < 0),
      positive: endingCash != null && endingCash >= 0 && minimumCash != null && minimumCash >= 0,
    },
  ];

  const selectedIndexes = new Set([net.index, revenue.index, breakeven.index, cash.index].filter((index) => index >= 0));
  const secondaryKpis = cards.filter((_, index) => !selectedIndexes.has(index));
  const status = hardCount > 0
    || (netProfit != null && netProfit < 0)
    || (minimumCash != null && minimumCash < 0)
    ? "riskli"
    : softCount > 0
      ? "dikkat"
      : "dengeli";

  return {
    decision: {
      status,
      statusLabel: `${status.charAt(0).toLocaleUpperCase("tr-TR") + status.slice(1)} model`,
      message: decisionMessage({ netProfit, minimumCash, hardCount, softCount }),
      netProfit,
      endingCash,
      breakevenStatus: netProfit == null ? "Belirsiz" : netProfit >= 0 ? "Aşıldı" : "Henüz aşılmadı",
      hardCount,
    },
    primaryKpis,
    secondaryKpis,
  };
}

export function renderDecisionSummary(element, decision) {
  element.innerHTML = `
    <article class="decision-card ${escapeHtml(decision.status)}">
      <div class="decision-status-row">
        <span class="decision-status">${escapeHtml(decision.statusLabel)}</span>
        <span>Mevcut varsayımlara göre</span>
      </div>
      <p class="decision-message">${escapeHtml(decision.message)}</p>
      <dl class="decision-facts">
        <div><dt>Aylık net</dt><dd>${formatValue(decision.netProfit, "money")}</dd></div>
        <div><dt>12 ay nakit</dt><dd>${formatValue(decision.endingCash, "money")}</dd></div>
        <div><dt>Başabaş</dt><dd>${escapeHtml(decision.breakevenStatus)}</dd></div>
        <div><dt>Kritik risk</dt><dd>${formatValue(decision.hardCount, "number")}</dd></div>
      </dl>
      <p class="decision-limit">Bu durum yatırım tavsiyesi değildir; yalnız mevcut hesap sonucu ve uyarı kurallarını özetler.</p>
    </article>
  `;
}
