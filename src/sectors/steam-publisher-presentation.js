import {
  buildSteamBusinessProfileBreakdown,
  buildSteamBusinessProfileKpis,
} from "./steam-business-profile-presentation.js";

export function buildSteamPublisherPresentation(result) {
  const { input, platform, receipt, recoup, settlement, pnl, tax, cashFlow, profile } = result;
  const perUnit = input.units > 0 ? tax.publisherNetProfitTry / input.units : 0;
  const profileKpis = buildSteamBusinessProfileKpis(result);

  return {
    kpis: [
      ...profileKpis,
      { label: "Yayıncı net kârı", value: tax.publisherNetProfitTry, format: "money", negative: tax.publisherNetProfitTry < 0, note: "Vergi ve temettü sonrası" },
      { label: "Yayıncı ROI", value: result.publisherRoi, format: "percent", note: "Net kâr / yayıncı toplam harcaması" },
      { label: "Geliştiriciye toplam", value: settlement.developerTotalPaymentTry, format: "money", note: "Advance + nakit royalty" },
      { label: "Kapanmamış recoup", value: settlement.unrecoupedExpenseTry, format: "money", negative: settlement.unrecoupedExpenseTry > 0, note: settlement.unrecoupedExpenseTry > 0 ? "Recoup kapanmadı" : "Recoup kapandı" },
      { label: profile.breakevenLabel, value: result.breakevenUnits, format: "number", note: "Yayıncı net kârı sıfır noktası" },
      { label: "Birim başı yayıncı kârı", value: perUnit, format: "money", note: "Vergi sonrası" },
      { label: "Vergi öncesi kâr", value: pnl.earningsBeforeTaxTry, format: "money", negative: pnl.earningsBeforeTaxTry < 0, note: "EBT" },
      { label: "Runway", value: cashFlow.runwayMonths, format: "months", note: "Başlangıç nakdi / lansman öncesi yakım" },
    ],
    keySplit: [
      { label: "Platform sonrası ödeme", value: platform.platformPaymentUsd * input.usdTry, format: "money" },
      { label: "Yayıncı kasasına giren tahsilat", value: receipt.receiptTry, format: "money" },
      { label: "Recoup edilen gider", value: settlement.expenseRecoupedTry, format: "money" },
      { label: "Geliştirici hakedişi", value: settlement.developerEarnedTry, format: "money" },
      { label: "Geliştirici toplam ödemesi", value: settlement.developerTotalPaymentTry, format: "money" },
      { label: "Yayıncı vergi öncesi kârı", value: pnl.earningsBeforeTaxTry, format: "money" },
      { label: "Ortaklara kalan", value: tax.shareholderCashTry, format: "money" },
      { label: "Yayıncı net kârı", value: tax.publisherNetProfitTry, format: "money" },
    ],
    scenarioMetrics: [
      { id: "customer_payment", label: "Brüt müşteri harcaması", value: platform.customerPayment * input.usdTry, format: "money" },
      { id: "receipt", label: "Yayıncı tahsilatı", value: receipt.receiptTry, format: "money" },
      { id: "developer_payment", label: "Geliştiriciye ödeme", value: settlement.developerTotalPaymentTry, format: "money" },
      { id: "ebt", label: "Vergi öncesi kâr", value: pnl.earningsBeforeTaxTry, format: "money" },
      { id: "net_profit", label: "Yayıncı net kârı", value: tax.publisherNetProfitTry, format: "money" },
      { id: "roi", label: "Yayıncı ROI", value: result.publisherRoi, format: "percent" },
      { id: "breakeven", label: profile.breakevenLabel, value: result.breakevenUnits, format: "number" },
    ],
    breakdown: [
      buildSteamBusinessProfileBreakdown(result),
      { title: "A · Platform tarafı", rows: [
        ["Brüt müşteri harcaması", platform.customerPayment * input.usdTry],
        ["İşlem vergileri", platform.transactionTax * input.usdTry],
        ["İade ve ters ibraz", platform.refundAndChargeback * input.usdTry],
        ["Platform komisyonu", platform.platformCommission * input.usdTry],
        ["ABD stopajı", platform.usWithholdingUsd * input.usdTry],
        ["Platform ödemesi", platform.platformPaymentUsd * input.usdTry],
      ] },
      { title: "B · Yayıncı tahsilatı ve recoup", rows: [
        ["Banka ve sağlayıcı gideri", receipt.bankAndProviderUsd * input.usdTry],
        ["Kur makası maliyeti", receipt.fxSpreadCostTry],
        ["Kasaya giren net tahsilat", receipt.receiptTry],
        ["Recoupable gider havuzu", recoup.recoupableTotalTry],
        ["Recoup edilen gider", settlement.expenseRecoupedTry],
        ["Kapanmamış recoup", settlement.unrecoupedExpenseTry],
      ] },
      { title: "C · Geliştirici settlement", rows: [
        ["Advance / milestone", settlement.advanceTry],
        ["Geliştirici hakedişi", settlement.developerEarnedTry],
        ["Gider recoup mahsubu", settlement.developerExpenseRecoupedTry],
        ["Advance mahsubu", settlement.advanceRecoupedTry],
        ["Ödenecek royalty", settlement.developerRoyaltyPaymentTry],
        ["Geliştirici toplam ödemesi", settlement.developerTotalPaymentTry],
      ] },
      { title: "D · Yayıncı P&L ve vergi", rows: [
        ["P&L geliri", pnl.revenueTry],
        ["Doğrudan ürün giderleri", recoup.directGameCostsTry],
        ["Yayıncı operasyon giderleri", input.publisherOperationsTry],
        ["Atanan genel gider", pnl.allocatedOverheadTry],
        ["Amortisman", input.depreciationTry],
        ["Vergi öncesi kâr", pnl.earningsBeforeTaxTry],
        ["Türkiye vergisi", tax.turkeyTaxTry],
        ["Temettü stopajı", tax.dividendWithholdingTry],
        ["Şirkette kalan kâr", tax.retainedProfitTry],
        ["Yayıncı net kârı", tax.publisherNetProfitTry],
      ] },
      { title: "E · Nakit görünümü", rows: [
        ["Başlangıç nakdi (+ yatırım)", cashFlow.startCashTry],
        ["Lansmana kadar nakit ihtiyacı", cashFlow.preLaunchCashNeedTry],
        ["İlk üç ay nakit açığı", cashFlow.firstThreeMonthGapTry],
        ["Runway", cashFlow.runwayMonths, "months"],
        ["Recoup kapanış ayı", cashFlow.recoupClosingMonth, "number"],
        ["İlk geliştirici ödeme ayı", cashFlow.firstDeveloperPaymentMonth, "number"],
        ["12. ay dönem sonu nakdi", cashFlow.endingCashTry],
      ] },
    ],
  };
}

export function mapSteamPublisherCashFlow(result) {
  return {
    ...result.cashFlow,
    rows: result.cashFlow.months.map((row) => ({
      month: row.month,
      collections: row.receiptTry,
      publisherCosts: row.publisherCostTry,
      developerPayments: row.developerOutflowTry,
      cashEnd: row.cashTry,
      recoupBalance: row.recoupBalanceTry,
    })),
  };
}
