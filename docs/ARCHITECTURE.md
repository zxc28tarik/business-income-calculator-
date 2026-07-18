# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: ilk yedi sektörün geriye uyumlu motoru
- `src/core/master-finance-engine-v2.js`: Steam master kaynağından çıkarılan ayrıntılı motor
- `src/core/sector-schema.js`: alan, tablo ve görünürlük sözleşmesi
- `src/ui/`: ortak form ve sonuç görünümü
- `src/sectors/registry.js`: aktif sektör listesi

## Sektör modülleri

Her sektör yapılandırma, hesap ve sunum katmanlarına ayrılır. Oyun / Dijital Yayıncılık için ek profil katmanı vardır:

- `steam-publisher-config.js`: master varsayımları
- `steam-publisher-core.js`: v2 finans hesabı
- `steam-publisher-form.js`: master formu
- `steam-publisher-profile-form.js`: alt iş türüne göre koşullu alanlar
- `steam-business-profile-engine.js`: satış sürücülerini master motor girdilerine dönüştürür
- `steam-business-profile-presentation.js`: özel KPI ve uyarılar
- `steam-publisher-presentation.js`: ortak sonuç görünümü

## Profil dönüşümleri

- Mobil oyun: MAU, ödeme dönüşümü, IAP ve reklam geliri
- DLC: sahip tabanı ve satın alma oranı
- Dijital ürün: aylık satış ve projeksiyon dönemi
- Indie kendi yayınlama: harici geliştirici payı yok
- Publisher–developer: sözleşme ve recoup paylaşımı korunur

Profil katmanı vergi, tahsilat, P&L ve nakit motorunu kopyalamaz; yalnız iş türünün gelir sürücülerini ortak v2 girdilerine çevirir.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- master kaynak hash ve golden testleri
- gelişmiş şema testleri
- gerçek HTML smoke testi
- Steam render testi
- altı oyun/dijital yayıncılık profil testi
- GitHub Actions sözdizimi kontrolü

## Sonraki aşama

Sıradaki çalışma Kafe/Restoran sektörünün kendi ekonomik yapısıyla v2 derinliğine taşınması ve kafe alt iş türlerinin ayrı profillere ayrılmasıdır. Rapor katmanına henüz geçilmez.
