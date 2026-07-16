# Gelişmiş Sektör Şeması v2

## Amaç

Bu şema, Steam Yayıncısı master formunu ve daha sonra her sektörün kendi iş koluna özgü ayrıntılı girdilerini tek platform arayüzünde eksiltmeden ifade etmek için hazırlanmıştır.

## Alan türleri

- `number`: para, adet, gün ve süre
- `rate`: 0–1 arasında saklanan yüzde
- `select`: sabit seçenek
- `text`: serbest metin
- `boolean`: checkbox
- `table`: eklenebilir/silinebilir satır tablosu

## Tablo sütunları

Tablo sütunları `text`, `number`, `rate`, `select` ve `boolean` olabilir. Böylece aynı satırda:

- kalem adı,
- tutar,
- para birimi,
- recoup işareti,
- geliştirici payından düşme işareti,
- vergi matrahına dahil olma işareti

tutulabilir.

`minRows`, `maxRows`, `allowAdd`, `allowRemove` ve `newRow` seçenekleri desteklenir.

## Koşullu görünürlük

Bölüm veya alan üzerinde `visibleWhen` kullanılabilir.

Desteklenen ifadeler:

```js
{ key: "regionMode", equals: true }
{ key: "entity", in: ["company", "individual"] }
{ key: "recoupOn", truthy: true }
{ all: [conditionA, conditionB] }
{ any: [conditionA, conditionB] }
{ not: conditionA }
```

## Senaryo güvenliği

`initializeScenarioInputs` artık tüm iç içe değerleri derin kopyalar. Bir senaryodaki tablo hücresinin değiştirilmesi diğer senaryoları değiştirmez.

## Sektöre özel nakit tablosu

Sektör tanımı isteğe bağlı `cashFlowColumns` listesi verebilir. Böylece SaaS aktif abone, Steam recoup bakiyesi veya perakende stok ödemesi gibi sektörel kolonlar ortak tabloya zorla çevrilmeden gösterilebilir.

## Geriye uyumluluk

Eski `number`, `rate` ve `select` tanımları değişmedi. Mevcut yedi sektörün tanımları ve kayıtlı kullanıcı girdileri çalışmaya devam eder.
