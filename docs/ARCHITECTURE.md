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
- Oto Hizmetleri

## Oto Hizmetleri v2

- `auto-business-profiles.js`: sekiz iş türünün varsayımları ve talep sürücüsü
- `auto-profile-form-operations.js`: iş türü, randevu, tekrar ziyaret, istasyon ve hizmet karması
- `auto-profile-form-staff.js`: personel rol tablosu ile vergi/ödeme alanları
- `auto-profile-form-supply.js`: parça/sarf stoğu, tedarikçi ve taşeron alanları
- `auto-v2-config.js`: eski veriyi koruyan profil geçişi, normalizasyon ve senaryolar
- `auto-profile-engine.js`: talep, no-show, istasyon/personel kapasitesi, hizmet, tedarikçi ve taşeron türetimi
- `auto-v2-month.js`: aylık gelir, iptal tahsilatı, parça/sarf, tekrar işçilik, taşeron, P&L ve stok metrikleri
- `auto-v2-core.js`: profile özgü başabaş, nakit akışı ve uyarılar
- `auto-v2-presentation.js`: profil KPI ve denetim izi
- `auto-v2.js`: v2 sektör sözleşmesi ve otoya özel nakit kolonları

Talep sürücüleri:

- Oto yıkama: günlük talep × dönüşüm
- Oto kuaför, detaylı temizlik, lastik, kaplama ve küçük servis: randevu × gerçekleşme
- Kaporta / boya: aylık planlanan iş
- Mobil servis: mobil ekip × günlük rota
- İsteğe bağlı müşteri tabanı: aktif müşteri × tekrar ziyaret + yeni iş

Etkin kapasite; istasyon/lift kapasitesi ile personel üretken kapasitesinin düşük olanıdır. Tekrar işçilik süreyi ve malzeme maliyetini artırır. Taşeron işler iç kapasiteyi kullanmadan gelir ve maliyet üretir. Parça/sarf stoğu hedef kapsam, tedarik süresi ve güvenlik stoğuyla karşılaştırılır.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L faaliyet hibesi ile tek seferlik hibe nakit girişi ayrıdır.
- Parça, sarf, enerji, yol, tekrar işçilik ve taşeron dönemsel P&L gideridir.
- Tedarikçi vadesi maliyeti silmez; nakit ödeme zamanını değiştirir.
- Ekipman yatırımı kurulum nakdinde bir kez gösterilir.
- Amortisman yalnız P&L gideridir ve nakitten ikinci kez düşülmez.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil sektörleri ayrıca `businessProfiles` ve `applyBusinessType` sunabilir. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- Steam kaynak hash ve golden testleri
- gerçek HTML smoke testi
- eski sektör sonucu koruma testleri
- alt iş türü, tablo, senaryo, P&L/nakit ve kapasite testleri
- Oto Hizmetleri için sekiz profil, hizmet/personel, stok/tedarikçi, taşeron ve eski Oto Yıkama sonucu testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin içe aktarım kontrolü

## Sonraki aşama

Aşama 6, her sektör için bağımsız tek HTML çıktısı üretimidir. Tek HTML dosyaları ortak sektör sözleşmelerini kullanmalı; finans motorunu kopyalayan ikinci bir formül kaynağı oluşturmamalıdır. Platform ve bağımsız çıktı aynı girdide aynı sonucu vermelidir.
