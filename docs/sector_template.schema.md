# Sektör Tanımı Şeması v2

Bu belge `src/core/sector-schema.js` dosyasındaki çalışan sözleşmeyi açıklar.

## Zorunlu kimlik alanları

- `id`
- `name`
- `family`
- `version`
- `status`

## Zorunlu veri alanları

- `businessTypes`
- `defaultInputs`
- `scenarios`
- `formSections`

`cashFlowColumns` isteğe bağlıdır. Tanımlanırsa sektörün nakit tablosunda kullanılacak kolonları belirler.

## Alan türleri

- `number`: para, adet, gün ve süre
- `rate`: kodda 0 ile 1 arasında saklanan oran
- `select`: sabit seçenek listesi
- `text`: serbest metin
- `boolean`: checkbox
- `table`: eklenebilir ve silinebilir satır tablosu

Her alanın `key` değeri `defaultInputs` içinde bulunmalıdır. Aynı anahtar iki kez kullanılamaz.

## Tablo alanı

Bir tablo şu ek özellikleri kullanabilir:

- `columns`
- `newRow`
- `minRows`
- `maxRows`
- `addLabel`
- `visibleWhen`

Tablo kolonları sayı, oran, seçim, metin veya checkbox olabilir. Tablo verileri senaryolar arasında derin kopyalanır.

## Koşullu görünürlük

Bölüm ve alanlar `visibleWhen` kullanabilir. Desteklenen koşullar:

- `equals`
- `notEquals`
- `in`
- `truthy`
- `exists`
- `all`
- `any`
- `not`

## Zorunlu fonksiyonlar

- `normalizeInputs(rawInputs)`
- `applyScenario(baseInputs, scenarioId)`
- `calculateModel(inputs)`
- `calculateScenarioComparison(baseOrScenarioInputs)`
- `buildPresentation(result)`

## Ortak UI için gerekli sonuçlar

`calculateModel()` sonucu en az şu görünüm verilerini sağlamalıdır:

- `warnings`
- `waterfall`
- `cashFlow.rows`

`buildPresentation()` şu listeleri döndürmelidir:

- `kpis`
- `keySplit`
- `scenarioMetrics`
- `breakdown`

Hesap sonucunun diğer alanları sektöre özgü olabilir. Eski sektörlerde düz alanlar, Steam v2 modelinde katmanlı nesneler kullanılabilir.

## İş türü uyarlama kuralı

`businessTypes` yalnız isim listesi değildir. Tam uyarlama aşamasında her iş türü için şu parçalar tanımlanır:

- ayrı varsayılan değerler
- gerekli özel alanlar
- özel KPI'lar
- özel uyarılar
- gerekiyorsa farklı hesap yolu

Bir sektörün bütün alt türlerini aynı varsayımla çalıştırmak geçici temel model sayılır; tamamlanmış iş türü uyarlaması sayılmaz.
