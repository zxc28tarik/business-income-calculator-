# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi ayrımı, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: Steam master kaynağından çıkarılan ayrıntılı yayıncı motoru
- `src/core/sector-schema.js`: alan, tablo ve görünürlük sözleşmesi
- `src/ui/`: ortak form ve sonuç görünümü
- `src/sectors/registry.js`: aktif sektör listesi

## Profil katmanı ilkesi

Profil katmanı ortak UI'ı veya finans yardımcılarını kopyalamaz. İş türünün talep/satış sürücüsünü, kapasitesini, varsayımlarını, KPI ve uyarılarını sektör motoruna verir. Sektör motoru P&L, başabaş ve nakit akışını üretir.

## Oyun / Dijital Yayıncılık

- `steam-publisher-config.js`: master varsayımları
- `steam-publisher-core.js`: v2 finans hesabı
- `steam-publisher-form.js`: master formu
- `steam-publisher-profile-form.js`: alt iş türüne göre koşullu alanlar
- `steam-business-profile-engine.js`: profil satış sürücüleri
- `steam-business-profile-presentation.js`: profil KPI ve uyarıları
- `steam-publisher-presentation.js`: ortak sonuç görünümü

## Kafe / Restoran v2

- `cafe-business-profile-engine.js`: on bir iş türünün talep, kapasite, varsayım, KPI ve uyarıları
- `cafe-config.js`: koşullu form, satış kanalı ve ürün karması tabloları
- `cafe-core.js`: kanal ciro/komisyonu, ürün maliyeti, P&L, başabaş ve nakit
- `cafe-presentation.js`: profil, kanal, ürün, amortisman ve nakit denetim izi
- `cafe-restaurant.js`: sektör sözleşmesi

Talep sürücüleri günlük müşteri; koltuk × masa devri × doluluk; saatlik sipariş; günlük paket siparişi veya etkinlik × müşteri olabilir.

## E-Ticaret / Pazaryeri v2

- `ecommerce-business-profile-engine.js`: on iş türünün varsayım, talep, kapasite, KPI ve uyarıları
- `ecommerce-config.js`: koşullu profil alanları; satış kanalı, ürün karması ve reklam tabloları
- `ecommerce-core.js`: kanal kesintileri, ürün/iade, lojistik, reklam, stok, P&L, başabaş ve nakit hesabı
- `ecommerce-presentation.js`: profil, kanal, ürün, reklam, stok ve nakit denetim izi
- `ecommerce.js`: sektör sözleşmesi ve profil dışa aktarımları

Talep sürücüleri satış adedi, trafik × dönüşüm, sosyal talep × dönüşüm, üretim kapasitesi veya aktif abonedir.

## Güzellik / Kuaför / Bakım v2

- `beauty-business-profile-engine.js`: sekiz iş türünün kaynak varsayımları, hizmet/personel ekonomisi, talep, KPI ve uyarıları
- `beauty-profile-form.js`: kapasite, tekrar ziyaret, hizmet karması, personel ve ürün satışı alanları
- `beauty-finance-form.js`: sabit gider, kurulum, hibe, vergi ön tahmini ve nakit alanları
- `beauty-v2-config.js`: eski veriyi koruyan profil geçişi, normalizasyon ve senaryolar
- `beauty-v2-core.js`: kapasite, no-show, hizmet/ürün geliri, sarf, personel, P&L, başabaş ve nakit hesabı
- `beauty-v2-presentation.js`: profil KPI ve ayrıntılı denetim izi
- `beauty-v2.js`: v2 sektör sözleşmesi

Etkin kapasite, fiziksel kaynak kapasitesi ile personel üretken saat kapasitesinin düşük olanıdır.

## Ajans / Freelancer / Danışmanlık v2

- `agency-business-profiles.js`: on iş türünün gelir sürücüsü ve varsayımları
- `agency-profile-engine.js`: gelir, teslimat saati, ekip kapasitesi ve taşeron saati türetimi
- `agency-profile-form.js`: proje, retainer, saat, danışmanlık, kampanya, performans, ekip ve taşeron alanları
- `agency-v2-config.js`: eski veriyi koruyan profil geçişi, normalizasyon ve senaryolar
- `agency-v2-month.js`: aylık gelir, komisyon, üretim, revizyon, taşeron, P&L ve maliyet hesabı
- `agency-v2-core.js`: profile özgü başabaş, peşinat etkili nakit akışı ve senaryo karşılaştırması
- `agency-profile-presentation.js`: profil KPI ve uyarıları
- `agency-v2-presentation.js`: eski sunumu profile özgü etiket ve denetim iziyle genişletir
- `agency-v2.js`: v2 sektör sözleşmesi

Gelir sürücüleri:

- Yazılım, tasarım ve video: proje sayısı × proje bedeli
- Sosyal medya ve SEO: retainer müşteri × aylık retainer
- Freelancer: faturalandırılan saat × saatlik satış fiyatı
- Danışmanlık: danışmanlık günü × günlük ücret
- Reklam ajansı: kampanya sayısı × kampanya bedeli
- Performans ajansı: yönetilen reklam bütçesi × yönetim ücreti + performans primi

İç ekip kapasitesi rol tablosundaki kişi, aylık saat ve faturalandırılabilir oranlardan hesaplanır. Taşeron saati iç ekip yükünü azaltır; taşeron maliyeti değişken gider olarak kalır. Kapsam taşması ek teslimat saati üretir; tahsil edilen revizyon payı ayrıca gelire dönüşür. Peşinat oranı nakit modelindeki etkin tahsilat gecikmesini azaltır.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L hibe geliri ile hibe nakit girişi ayrı alanlardır.
- Amortisman yalnız P&L sabit giderine eklenir.
- Nakit akışı `cashFixedCosts` kullandığı için amortisman nakitten ikinci kez düşülmez.
- Kurulum ve ilk stok yatırımı nakitte tek sefer gösterilir; dönemsel maliyetler P&L'de ayrıca hesaplanır.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil kullanan sektörler ayrıca `businessProfiles` ve isteğe bağlı `applyBusinessType` sözleşmesi sağlayabilir. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- master kaynak hash ve Steam golden testleri
- gelişmiş şema testleri
- gerçek HTML smoke testi
- oyun/dijital yayıncılık profil testleri
- Kafe / Restoran profil ve eski sonuç koruma testleri
- E-Ticaret / Pazaryeri profil, tablo, stok ve eski sonuç testleri
- Güzellik / Kuaför / Bakım profil, kapasite, hizmet/personel karması ve eski sonuç testleri
- Ajans / Freelancer / Danışmanlık on profil, eski sonuç, ekip/taşeron, revizyon ve tahsilat testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin otomatik içe aktarım kontrolü

## Sonraki aşama

Sıradaki çalışma SaaS / Abonelik sektörünün plan karması, churn, expansion, müşteri edinme, sunucu ve destek ekonomisiyle v2 derinliğine taşınmasıdır. Rapor katmanına henüz geçilmez.
