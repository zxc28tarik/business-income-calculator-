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

- Steam master formu ve v2 motoru
- altı iş türü profili
- recoup, geliştirici anlaşması, vergi ve nakit
- master golden sonuçları

### Kafe / Restoran

- on bir iş türü profili
- talep ve kapasite sürücüleri
- satış kanalı ve ürün karması tabloları
- amortisman P&L/nakit ayrımı
- eski Kafe varsayılan sonucu koruması

### E-Ticaret / Pazaryeri

- on iş türü profili
- satış adedi, trafik/dönüşüm, talep/dönüşüm, üretim ve abone sürücüleri
- satış kanalı, ürün karması ve reklam tabloları
- kanal kesintileri ve ağırlıklı tahsilat vadesi
- ürün/iade, lojistik ve profile özgü ek maliyetler
- stok kapsamı, yeniden sipariş noktası ve devir hızı
- amortisman P&L/nakit ayrımı
- eski Trendyol varsayılan sonucu koruması

## Sabit finans kuralları

- Finansman ve yatırım P&L geliri değildir.
- Net kâr ve nakit hareketi ayrı hesaplanır.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Kurulum ve ilk stok yatırımı tek seferlik nakit çıkışıdır.
- Satılan ürün/malzeme maliyeti dönemsel P&L gideridir.
- Hibe nakit girişi ile vergilendirilebilir P&L hibe geliri ayrı alanlardır.
- Vergi oranları düzenlenebilir varsayımdır ve uzman teyidi gerektirir.

## Bekleyen geçişler

1. Güzellik / Kuaför / Bakım
2. Ajans / Freelancer / Danışmanlık
3. SaaS / Abonelik
4. Fiziksel Perakende
5. Oto Hizmetleri

Bunlardan sonra bağımsız tek HTML çıktıları, rapor katmanı ve gerçek takip modu ele alınacaktır.

## Geçiş kuralı

Mevcut sektör sonucu, koruma testi eklenmeden değiştirilmez. Her geçişte alt iş türleri için ayrı varsayımlar, koşullu alanlar, KPI, uyarı ve senaryo sürücüleri kurulmalıdır.
