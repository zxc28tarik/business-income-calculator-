import { numberField, rateField } from "../core/sector-schema.js";

export const BEAUTY_FINANCE_FORM_SECTIONS = [
  {
    title: "5 · Reklam ve sabit giderler",
    fields: [
      numberField("rent", "Kira (TL)", 1000),
      numberField("utilities", "Faturalar (TL)", 500),
      numberField("accounting", "Muhasebe (TL)", 500),
      numberField("software", "Randevu / yazılım (TL)", 500),
      numberField("monthlyAdSpend", "Aylık reklam gideri (TL)", 1000),
      numberField("maintenance", "Bakım / servis (TL)", 500),
      numberField("insurance", "Sigorta (TL)", 500),
      numberField("otherFixedExpenses", "Diğer sabit gider (TL)", 500),
      numberField("loanPayment", "Aylık kredi / taksit (nakit) (TL)", 500, { hint: "P&L gideri değildir; nakit akışında ayrıca düşülür." }),
    ],
  },
  {
    title: "6 · Cihaz, amortisman ve kurulum",
    note: "Cihaz yatırımı kurulumda nakitten bir kez düşer. Aylık amortisman P&L gideridir ancak nakit çıkışı değildir.",
    fields: [
      numberField("renovation", "Tadilat (TL)", 1000),
      numberField("deviceInvestment", "Cihaz / ekipman yatırımı (TL)", 1000),
      numberField("deviceUsefulLifeMonths", "Cihaz amortisman süresi (ay)", 1),
      numberField("furniture", "Mobilya / dekorasyon (TL)", 1000),
      numberField("deposit", "Depozito (TL)", 1000),
      numberField("licenseFees", "Ruhsat / izin giderleri (TL)", 1000),
      numberField("openingMarketing", "Açılış reklamı (TL)", 1000),
      numberField("initialConsumables", "İlk sarf stoku (TL)", 1000),
      numberField("softwareSetup", "Yazılım kurulumu (TL)", 1000),
    ],
  },
  {
    title: "7 · Paydaş, hibe ve vergi ön tahmini",
    fields: [
      rateField("partnerProfitShareRate", "Ortak / yatırımcı kâr payı"),
      rateField("estimatedTaxRate", "Vergi ön tahmin oranı", { hint: "Kesin vergi hesabı değildir." }),
      numberField("monthlyOperatingGrantIncome", "Aylık P&L hibe / destek geliri (TL)", 1000, { hint: "Finansmandan ayrıdır; kâr-zarar hesabına ayrı gelir olarak girer." }),
    ],
  },
  {
    title: "8 · Nakit akışı",
    fields: [
      numberField("startingCash", "Başlangıç nakdi (TL)", 1000),
      numberField("financingAmount", "Yatırım / finansman (TL)", 1000, { hint: "P&L geliri değildir." }),
      numberField("supportAmount", "Hibe / destek nakit girişi (TL)", 1000, { hint: "Ayrı gösterilir; vergi etkisi hesaplanmaz." }),
      numberField("setupPaymentMonth", "Kurulum ödeme ayı", 1),
      numberField("collectionDelayDays", "Tahsilat gecikmesi (gün)", 1),
      numberField("supplierPaymentDelayDays", "Sarf tedarikçi vadesi (gün)", 1),
      rateField("firstMonthSalesShare", "İlk ay randevu gerçekleşme oranı"),
      rateField("monthlyGrowthRate", "Aylık talep büyümesi", { allowNegative: true }),
    ],
  },
];
