# Kaynak Uyumlu Finans Motoru v2

## Kaynak

Ayrıntılı yayıncı motoru, korunan Steam Yayıncısı master prototipinin hesap sırasından çıkarılmıştır. Orijinal kaynak değiştirilmez ve hash testiyle korunur.

## Motor katmanları

- `src/core/master-finance-engine-v2.js`: Steam master hesap zinciri
- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/sector-schema.js`: sayı, oran, seçim, metin, checkbox, tablo ve koşullu görünürlük sözleşmesi

Her sektör Steam formülünü kopyalamaz. Ortak yardımcıları kullanır; kendi gelir, gider, kapasite, paydaş ve nakit yapısını sektör modüllerinde kurar.

## Tamamlanan sektör geçişleri

- Oyun / Dijital Yayıncılık: 6 profil, Steam master ve recoup sözleşmesi
- Kafe / Restoran: 11 profil, talep, kapasite, kanal ve ürün karması
- E-Ticaret / Pazaryeri: 10 profil, trafik, ürün, reklam, lojistik ve stok
- Güzellik / Kuaför / Bakım: 8 profil, fiziksel/personel kapasitesi ve tekrar ziyaret
- Ajans / Freelancer / Danışmanlık: 10 profil, proje, retainer, saat, ekip ve taşeron
- SaaS / Abonelik: 8 profil, plan karması, churn, expansion, API ve destek
- Fiziksel Perakende: 7 profil, trafik, ürün, tedarikçi ve işletme sermayesi
- Oto Hizmetleri: 8 profil, randevu, istasyon/personel, parça, stok ve taşeron

Her sektörün eski varsayılan finans sonucu koruma testine sahiptir.

## Sabit finans kuralları

- Finansman ve yatırım P&L geliri değildir.
- Net kâr ve nakit hareketi ayrı hesaplanır.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Kurulum, ekipman ve ilk stok yatırımı tek seferlik nakit çıkışıdır.
- Satılan ürün, malzeme, sarf, teslimat, kullanım, tekrar işçilik ve taşeron dönemsel P&L gideridir.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi nakit zamanlamasını etkiler.
- Hibe nakit girişi ile vergilendirilebilir P&L faaliyet hibesi ayrı alanlardır.
- Vergi oranları düzenlenebilir varsayımdır ve uzman teyidi gerektirir.

## Tek kaynak kuralı

Platform, bağımsız HTML ve rapor aynı sektör tanımı ve aynı hesap fonksiyonlarını kullanır. Çıktı katmanları yeni bir finans motoru oluşturamaz ve aynı girdide farklı finans sonucu üretemez.

### Bağımsız HTML

Bağımsız HTML dosyaları seçilen sektörün normalizasyon, senaryo, hesaplama ve sunum modüllerini kaynak haliyle gömer. Ayrı formül kopyası içermez.

### Finansal rapor

Rapor katmanı şu hazır sonuçları kullanır:

1. aktif senaryonun normalize edilmiş girdisi
2. `calculateModel` sonucu
3. `buildPresentation` KPI, dağılım ve senaryo metrikleri
4. sektörün kendi uyarıları
5. sektörün nakit akışı satır ve kolonları
6. form şemasındaki görünür varsayımlar

Rapor katmanı vergi, maliyet, kâr, başabaş veya nakit değerini yeniden hesaplamaz. Dengeli, koşullu ve riskli görünüm; var olan net sonuç, dönem sonu nakit ve uyarı seviyelerinin rapor amaçlı sınıflandırmasıdır. Yatırım tavsiyesi değildir.

## Çıktı güvenliği

- Kullanıcı metni HTML olarak çalıştırılmaz; kaçışlanır.
- Rapor harici script, stil veya CDN kullanmaz.
- Raporun yazdırma/PDF işlevi tarayıcı üzerinden çalışır.
- Rapor kullanım sınırını ve uzman teyidi uyarısını taşır.

## Geçiş durumu

- Aşama 5: sekiz sektörün v2 profil geçişi tamamlandı.
- Aşama 6: sekiz bağımsız tek HTML hesaplayıcı tamamlandı.
- Aşama 7: ortak finansal rapor katmanı tamamlandı.

## Sıradaki aşama

Aşama 8 gerçek takip modudur. Tahmin girdileri ile gerçekleşen aylık sonuçlar ayrı veri sözleşmelerinde tutulacak; bütçe-gerçekleşen farkı ve dönem trendi mevcut finans motorları bozulmadan üretilecektir.
