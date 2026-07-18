# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi ayrımı, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: Steam master kaynağından çıkarılan ayrıntılı yayıncı motoru
- `src/core/sector-schema.js`: alan, tablo ve görünürlük sözleşmesi
- `src/ui/`: ortak form ve sonuç görünümü
- `src/sectors/registry.js`: aktif sektör listesi

## Oyun / Dijital Yayıncılık profil katmanı

- `steam-publisher-config.js`: master varsayımları
- `steam-publisher-core.js`: v2 finans hesabı
- `steam-publisher-form.js`: master formu
- `steam-publisher-profile-form.js`: alt iş türüne göre koşullu alanlar
- `steam-business-profile-engine.js`: satış sürücülerini master motor girdilerine dönüştürür
- `steam-business-profile-presentation.js`: özel KPI ve uyarılar
- `steam-publisher-presentation.js`: ortak sonuç görünümü

Profil katmanı vergi, tahsilat, P&L ve nakit motorunu kopyalamaz; yalnız iş türünün gelir sürücülerini ortak v2 girdilerine çevirir.

## Kafe / Restoran v2 profil katmanı

- `cafe-business-profile-engine.js`: on bir iş türünün varsayımları, talep sürücüsü, kapasite, KPI ve uyarıları
- `cafe-config.js`: koşullu form, satış kanalı ve ürün karması tabloları, senaryolar ve normalizasyon
- `cafe-core.js`: kanal bazlı ciro/komisyon, ürün karması maliyeti, P&L, vergi ön tahmini, başabaş ve nakit hesabı
- `cafe-presentation.js`: iş türü, kanal, ürün, amortisman ve nakit denetim izi
- `cafe-restaurant.js`: sektör sözleşmesi ve profil dışa aktarımları

Kafe profil sürücüleri:

- Kafe, kahveci, pastane, burgerci, dönerci ve büfe: günlük müşteri
- Restoran ve franchise restoran: koltuk × masa devri × doluluk
- Kahve kiosk: saatlik sipariş × servis saati
- Dark kitchen: günlük paket siparişi
- Food truck: aylık etkinlik × etkinlik başı müşteri

Satış kanalı tablosu sipariş payı, fiş çarpanı, komisyon ve paketleme maliyeti taşır. Ürün karması tablosu ciro payı, malzeme oranı ve fire oranı taşır.

Amortisman yalnız P&L sabit giderine eklenir. Nakit akışı `cashFixedCosts` üzerinden çalıştığı için kurulum yatırımı nakitten ikinci kez düşülmez. Finansman P&L dışıdır; P&L hibe geliri ile hibe nakit girişi ayrı alanlardır.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil kullanan sektörler ayrıca `businessProfiles` ve isteğe bağlı `applyBusinessType` sözleşmesi sağlayabilir. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- master kaynak hash ve golden testleri
- gelişmiş şema testleri
- gerçek HTML smoke testi
- Steam render testi
- altı oyun/dijital yayıncılık profil testi
- on bir Kafe / Restoran profil testi
- eski Kafe varsayılan sonuç koruma testi
- amortisman P&L / nakit ayrımı testi
- GitHub Actions sözdizimi kontrolü

## Sonraki aşama

Sıradaki çalışma E-Ticaret / Pazaryeri sektörünün kendi sipariş, iade, kargo, stok ve reklam ekonomisiyle v2 derinliğine taşınmasıdır. Rapor katmanına henüz geçilmez.
