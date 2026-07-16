# Sektör Tanımı Şeması

Bu belge, `04_SEKTOR_SABLONU_SPEC.md` kararlarının çalışan kod karşılığıdır. Her yeni sektör `src/sectors/` altında bir sektör tanımı dışa aktarır ve `src/core/sector-schema.js` tarafından doğrulanır.

## Zorunlu kimlik alanları

```text
id
name
family
version
status
simulationMode
realTrackingMode
```

## Zorunlu veri alanları

```text
businessTypes
defaultInputs
scenarios
formSections
```

Her form alanı şu yapıyı kullanır:

```js
{
  type: "number" | "rate" | "select",
  key: "unitsSold",
  label: "Aylık satış adedi",
  step: 1,
  options: [],
  hint: "İsteğe bağlı açıklama",
  allowNegative: false
}
```

`key`, sektörün `defaultInputs` nesnesinde bulunmak zorundadır. Aynı anahtar birden fazla form bölümünde tanımlanamaz.

## Zorunlu fonksiyonlar

```text
normalizeInputs(rawInputs)
applyScenario(baseInputs, scenarioId)
calculateModel(inputs)
calculateScenarioComparison(baseOrScenarioInputs)
buildPresentation(result)
```

## Standart model sonucu

Her sektörün `calculateModel()` sonucu en az şu alanları üretmelidir:

```text
grossRevenue
customerPayment
taxAmount
lostSalesAmount
totalCommissions
revenueAfterCommission
totalVariableCosts
totalFixedCosts
totalStakeholderPayouts
preTaxProfit
estimatedTax
netProfit
totalSetupCost
breakevenUnits
breakevenRevenue
cashFlow
warnings
waterfall
```

## Sunum sözleşmesi

`buildPresentation(result)` şu grupları döndürür:

```text
kpis
keySplit
scenarioMetrics
breakdown
```

Böylece uygulama katmanı sektör formüllerini bilmeden aynı ekran düzenini kafe, e-ticaret ve sonraki sektörlerde korur.

## Muhasebe sınırı

Kurulum, stok, ekipman ve amortisman kalemlerinin vergi/muhasebe etkisi otomatik kesin hüküm olarak verilmez. Prototip, operasyonel P&L ile nakit akışını ayırır ve kullanıcıya mali müşavir teyidi notu gösterir.
