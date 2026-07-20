# Kaynak Uyumlu Finans Motoru v2

## Kaynak

Ayrıntılı yayıncı motoru, korunan Steam Yayıncısı master prototipinin hesap sırasından çıkarılmıştır. Orijinal kaynak değiştirilmez ve hash testiyle korunur.

## Motor katmanları

- `src/core/master-finance-engine-v2.js`: Steam master hesap zinciri
- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/sector-schema.js`: sayı, oran, seçim, metin, checkbox, tablo ve koşullu görünürlük sözleşmesi

Her sektör Steam formülünü kopyalamaz. Ortak yardımcıları kullanır; kendi gerçek gelir, gider, kapasite, paydaş ve nakit yapısını sektör modüllerinde kurar.

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
- ürün/kategori karması: fiyat, maliyet, iade, iskonto ve bozulma/fire
- tedarikçi karması: vade, teslim süresi, alım indirimi ve asgari sipariş
- stok kapsamı, hedef stok, yeniden sipariş noktası ve işletme sermayesi açığı
- mağaza kapasitesi, profile özgü başabaş ve perakende nakit kolonları
- amortisman P&L/nakit ayrımı
- eski Butik mağaza sonucu koruması

## Sabit finans kuralları

- Finansman ve yatırım P&L geliri değildir.
- Net kâr ve nakit hareketi ayrı hesaplanır.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Kurulum ve ilk stok yatırımı tek seferlik nakit çıkışıdır.
- Satılan ürün, malzeme, sarf, teslimat ve kullanım maliyeti dönemsel P&L gideridir.
- Sayım kaybı ve bozulma/fire satılan ürün maliyetinden ayrı izlenebilir.
- Tedarikçi indirimi ürün maliyetini; tedarikçi vadesi nakit zamanlamasını etkiler.
- Hibe nakit girişi ile vergilendirilebilir P&L faaliyet hibesi ayrı alanlardır.
- Vergi oranları düzenlenebilir varsayımdır ve uzman teyidi gerektirir.

## Bekleyen geçişler

1. Oto Hizmetleri

Bundan sonra bağımsız tek HTML çıktıları, rapor katmanı ve gerçek takip modu ele alınacaktır.

## Geçiş kuralı

Mevcut sektör sonucu, koruma testi eklenmeden değiştirilmez. Her geçişte alt iş türleri için ayrı varsayımlar, koşullu alanlar, KPI, uyarı ve senaryo sürücüleri kurulmalıdır.
