# Mimari Notları

## Katmanlar

- `src/core/finance-engine.js`: Sektörden bağımsız vergi ayrımı, komisyon, paydaş tabanı, başabaş, nakit akışı ve şelale yardımcıları.
- `src/sectors/cafe-restaurant.js`: Yiyecek-içecek sektörünün veri varsayımları ve hesap zinciri.
- `src/app.js`: Form, senaryo durumu, localStorage ve sonuç panellerinin render katmanı.
- `tests/finance-engine.test.mjs`: Ortak finans ve kafe kabul testlerinin otomatik karşılığı.

## Hesap zinciri

```text
Brüt müşteri harcaması
- KDV ayrımı
- gerçekleşmeyen satış
- paket servis ve POS komisyonu
= komisyon sonrası net gelir

Komisyon sonrası net gelir
- malzeme
- fire
- paketleme
- diğer değişken maliyet
= katkı

Katkı
- sabit giderler
- franchise / ortak payı
= vergi öncesi kâr

Vergi öncesi kâr
- pozitif kâr üzerinden vergi ön tahmini
= net kâr
```

Finansman bu zincire girmez; yalnız 12 aylık nakit akışının ilk ayına nakit girişi olarak eklenir.

## Sonraki sektör ekleme yöntemi

Yeni sektörler `src/sectors/` altında kendi normalize, aylık hesap, tam model, senaryo ve uyarı fonksiyonlarını sağlar. Ortak vergi, nakit, başabaş ve şelale yardımcıları tekrar kullanılmalıdır.
