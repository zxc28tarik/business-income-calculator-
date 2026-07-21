# Kaynak Uyumlu Finans Motoru v2

## Kaynak

Ayrıntılı yayıncı motoru, korunan Steam Yayıncısı master prototipinin hesap sırasından çıkarılmıştır. Orijinal kaynak değiştirilmez ve hash testiyle korunur.

## Motor katmanları

- `src/core/master-finance-engine-v2.js`: Steam master hesap zinciri
- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/sector-schema.js`: sayı, oran, seçim, metin, checkbox, tablo ve koşullu görünürlük sözleşmesi

Her sektör Steam formülünü kopyalamaz. Ortak yardımcıları kullanır; kendi gelir, gider, kapasite, paydaş ve nakit yapısını sektör modüllerinde kurar.

## Tamamlanan geçişler

### Oyun / Dijital Yayıncılık

- altı iş türü profili
- Steam master formu, recoup, geliştirici anlaşması, vergi ve nakit
- master golden sonuçları

### Kafe / Restoran

- on bir iş türü profili
- talep, kapasite, satış kanalı ve ürün karması
- amortisman P&L/nakit ayrımı
- eski Kafe sonucu koruması

### E-Ticaret / Pazaryeri

- on iş türü profili
- satış, trafik/dönüşüm, ürün, reklam, lojistik ve stok
- eski Trendyol sonucu koruması

### Güzellik / Kuaför / Bakım

- sekiz iş türü profili
- fiziksel/personel kapasitesi, hizmet karması, tekrar ziyaret ve no-show
- eski güzellik salonu sonucu koruması

### Ajans / Freelancer / Danışmanlık

- on iş türü profili
- proje, retainer, saat, danışmanlık günü, kampanya ve performans geliri
- ekip/taşeron kapasitesi, revizyon ve peşinat
- eski Yazılım Ajansı sonucu koruması

### SaaS / Abonelik

- sekiz iş türü profili
- plan/fiyat karması, yıllık ödeme, churn, expansion, API, freemium ve destek kapasitesi
- eski B2B SaaS sonucu koruması

### Fiziksel Perakende

- yedi iş türü profili
- trafik/dönüşüm, müşteri sıklığı, sipariş ve saatlik işlem sürücüleri
- ürün/kategori, tedarikçi, stok kapsamı ve işletme sermayesi
- eski Butik mağaza sonucu koruması

### Oto Hizmetleri

- sekiz iş türü profili
- talep, randevu, no-show, iptal/kapora ve tekrar ziyaret
- istasyon/lift ile personel üretken kapasitesinin karşılaştırılması
- hizmet karması: fiyat, süre, sarf, enerji, parça ve tekrar işçilik
- parça/sarf stok kapsamı, tedarikçi indirimi/vadesi ve yeniden sipariş noktası
- taşeron iş geliri, maliyeti ve katkı marjı
- otoya özel başabaş, uyarı ve nakit kolonları
- eski Oto Yıkama sonucu koruması

## Sabit finans kuralları

- Finansman ve yatırım P&L geliri değildir.
- Net kâr ve nakit hareketi ayrı hesaplanır.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Kurulum, ekipman ve ilk stok yatırımı tek seferlik nakit çıkışıdır.
- Satılan ürün, malzeme, sarf, teslimat, kullanım, tekrar işçilik ve taşeron dönemsel P&L gideridir.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi nakit zamanlamasını etkiler.
- Hibe nakit girişi ile vergilendirilebilir P&L faaliyet hibesi ayrı alanlardır.
- Vergi oranları düzenlenebilir varsayımdır ve uzman teyidi gerektirir.

## Profil geçiş durumu

Aktif sekiz sektör ailesinin tamamı v2 profil derinliğine taşınmıştır. Bundan sonraki çalışma finans formüllerini yeniden yazmak değil, mevcut tek kaynak sözleşmelerinden farklı çıktı biçimleri üretmektir.

## Sıradaki aşama

1. bağımsız tek HTML çıktıları
2. rapor katmanı
3. gerçek takip modu

## Tek kaynak kuralı

Bağımsız HTML veya rapor çıktısı yeni bir finans motoru oluşturamaz. Platform, tek HTML ve rapor aynı sektör tanımı ve aynı hesap fonksiyonlarını kullanmalı; aynı girdide aynı finans sonucunu üretmelidir.


## Tek HTML çıktılarında motor bütünlüğü

Bağımsız HTML dosyaları yeni finans formülü tanımlamaz. Seçilen sektörün normalizasyon, senaryo, hesaplama ve sunum modülleri kaynak haliyle dosyaya gömülür. Bu nedenle ana platform ve bağımsız çıktı aynı girdide aynı finans sonucunu üretir.
