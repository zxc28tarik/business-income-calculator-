# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: korunan Steam master motoru
- `src/core/sector-schema.js`: alan, tablo ve koşullu görünürlük sözleşmesi
- `src/ui/`: ortak form ve sonuç görünümü
- `src/sectors/registry.js`: aktif sektör listesi

## Profil katmanı ilkesi

Profil katmanı ortak UI veya finans yardımcılarını kopyalamaz. İş türünün gelir/talep sürücüsünü, kapasitesini, varsayımlarını, KPI ve uyarılarını sektör motoruna verir. Sektör motoru P&L, başabaş ve nakit akışını üretir.

## Tamamlanan v2 sektörleri

- Oyun / Dijital Yayıncılık
- Kafe / Restoran
- E-Ticaret / Pazaryeri
- Güzellik / Kuaför / Bakım
- Ajans / Freelancer / Danışmanlık
- SaaS / Abonelik
- Fiziksel Perakende

## Fiziksel Perakende v2

- `retail-business-profiles.js`: yedi iş türünün varsayımları ve satış sürücüsü
- `retail-profile-form-sales.js`: trafik, dönüşüm, müşteri sıklığı, sipariş, saatlik işlem ve ürün karması
- `retail-profile-form-inventory.js`: tedarikçi tablosu, vade, teslim süresi, stok ve işletme sermayesi alanları
- `retail-v2-config.js`: eski veriyi koruyan profil geçişi, normalizasyon ve senaryolar
- `retail-profile-engine.js`: talep, iskonto, ürün maliyeti, fire, tedarikçi indirimi ve stok metrikleri
- `retail-v2-core.js`: profile özgü başabaş, nakit akışı ve uyarılar
- `retail-v2-presentation.js`: profil KPI, stok/tedarikçi denetim izi ve nakit kolonları
- `retail-v2.js`: v2 sektör sözleşmesi

Satış sürücüleri:

- Butik, aksesuar, kırtasiye ve oyuncak: mağaza trafiği × dönüşüm × sezon çarpanı
- Pet shop: aktif müşteri tabanı × aylık alışveriş sıklığı
- Çiçekçi: standart günlük sipariş + etkinlik siparişi
- Küçük market: saatlik kasa işlemi × günlük açık saat

Ürün karması satış payı, fiyat, maliyet, iade, iskonto ve bozulma/fire alanlarını taşır. Tedarikçi karması alım payı, ödeme vadesi, teslim süresi, alım indirimi ve asgari siparişi taşır. Stok planı mevcut stok maliyetini hedef kapsamla karşılaştırarak işletme sermayesi açığı, fazla stok ve yeniden sipariş noktasını üretir.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L faaliyet hibesi ile tek seferlik hibe nakit girişi ayrıdır.
- İlk stok yatırımı kurulum nakdinde bir kez gösterilir.
- Satılan ürün ve stok kaybı dönemsel P&L gideridir.
- Tedarikçi vadesi P&L maliyetini silmez; nakit ödeme zamanını değiştirir.
- Amortisman yalnız P&L gideridir ve nakitten ikinci kez düşülmez.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil sektörleri ayrıca `businessProfiles` ve `applyBusinessType` sunabilir. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- Steam kaynak hash ve golden testleri
- gerçek HTML smoke testi
- eski sektör sonucu koruma testleri
- alt iş türü, tablo, senaryo, P&L/nakit ve kapasite testleri
- Fiziksel Perakende için yedi profil, ürün/tedarikçi karması, stok işletme sermayesi ve eski Butik sonucu testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin içe aktarım kontrolü

## Sonraki aşama

Sıradaki çalışma Oto Hizmetleri sektörünün hizmet türü, randevu, lift/istasyon, personel saati, parça, sarf, taşeron, tekrar ziyaret ve paket ekonomisiyle v2 derinliğine taşınmasıdır. Rapor katmanına henüz geçilmez.
