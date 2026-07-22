# E-Ticaret / Pazaryeri v2 İş Türü Profilleri

## Amaç

E-ticaret alt türlerini tek bir `aylık adet × fiyat` formülüne sıkıştırmadan, ortak P&L ve nakit kurallarını koruyarak kendi talep, kanal, ürün, reklam ve stok yapılarıyla hesaplamak.

## Profiller ve talep sürücüleri

| İş türü | Ana talep sürücüsü | Ayırt edici ekonomik yapı |
|---|---|---|
| Trendyol mağazası | Aylık satış adedi | Pazaryeri komisyonu, tahsilat vadesi, stok |
| Hepsiburada mağazası | Aylık satış adedi | Kanal komisyonu, fulfillment ve tahsilat |
| Amazon Türkiye | Aylık satış adedi | Amazon komisyonu, fulfillment, stok |
| Amazon global | Trafik × dönüşüm × ürün/sipariş | Sınır ötesi maliyet, yüksek kargo, global tahsilat |
| Shopify mağazası | Trafik × dönüşüm × ürün/sipariş | Doğrudan ödeme kesintisi, reklam ROAS/CAC |
| Stoklu e-ticaret | Aylık satış adedi | Karma kanal, stok kapsamı ve işletme sermayesi |
| Dropshipping | Trafik × dönüşüm × ürün/sipariş | Stoksuz model, tedarikçi kalite kaybı, reklam bağımlılığı |
| Instagram satış | Talep/DM × dönüşüm × ürün/sipariş | Sosyal reklam, doğrudan ve kapıda ödeme kanalları |
| El yapımı ürün | Üretim/gün × üretim günü × kullanım | Birim emek maliyeti ve üretim kapasitesi |
| Abonelik kutusu | Aktif abone | Yeni abone, churn ve kutu fulfillment maliyeti |

## Gelişmiş satış kanalı tablosu

Her satır şunları taşır:

- sipariş payı
- fiyat çarpanı
- kanal komisyonu
- ödeme kesintisi
- sipariş başı kargo
- sipariş başı paketleme
- tahsilat gecikmesi
- pazaryeri etiketi

Kanal paylarının toplamı %100 değilse sert uyarı üretilir. Ağırlıklı tahsilat vadesi, 12 aylık nakit akışına aktarılır.

## Gelişmiş ürün karması

Her ürün/kategori satırı şunları taşır:

- adet payı
- temel fiyata göre fiyat çarpanı
- birim ürün maliyeti
- iade oranı

Ürün payları, toplam liste cirosu, ağırlıklı iade, satılan ürün maliyeti ve ürün başı net sonucu etkiler. Ürün adet paylarının toplamı %100 değilse sert uyarı üretilir.

## Reklam ekonomisi

Gelişmiş reklam tablosunda kanal bazında:

- harcama
- atfedilen sipariş
- atfedilen ciro

izlenir. Buradan toplam reklam gideri, ROAS ve edinme maliyeti hesaplanır. Gelişmiş tablo kapalıysa eski `monthlyAdSpend` davranışı korunur.

## Stok ve işletme sermayesi

Stok takibi açıldığında model şunları hesaplar:

- mevcut stok kapsam günü
- tedarik süresi + güvenlik stoğu ihtiyacı
- yeniden sipariş noktası
- hedef stok çalışma sermayesi
- stok nakit ihtiyacı
- yıllık stok devir hızı
- stok kayıp/fire maliyeti
- yavaş veya değersiz stok maliyeti

Dropshipping gibi stoksuz profillerde stok takibi varsayılan olarak kapalıdır.

## Profile özgü alanlar

- Amazon global: sınır ötesi ek maliyet oranı
- Dropshipping: tedarikçi kalite/hasar kaybı
- El yapımı ürün: birim emek maliyeti
- Abonelik kutusu: yeni abone, churn ve kutu hazırlama maliyeti

## P&L ve nakit ayrımı

- Finansman P&L geliri değildir; yalnız nakdi artırır.
- Aylık faaliyet hibesi P&L geliri olarak ayrı girilir.
- Hibe/destek nakit girişi ayrıca izlenir.
- Amortisman P&L sabit gideridir.
- Nakit akışı `cashFixedCosts` kullandığı için amortisman nakitten ikinci kez düşülmez.
- İlk stok ve kurulum nakitte tek sefer düşülür.
- Satılan ürün maliyeti dönemsel P&L gideridir; ilk stok yatırımıyla aynı kalem değildir.

## Geriye uyumluluk

Varsayılan Trendyol profili gelişmiş tablolar kapalıyken eski temel formülü üretir:

- brüt satış: `478.400 TL`
- komisyon sonrası gelir: `301.487,68 TL`
- aylık net sonuç: `-207.900,053333... TL`

Bu değerler kabul testinde kilitlidir.

## Kabul testleri

- on profil tanımı ve hesaplanabilirlik
- eski Trendyol sonucunun korunması
- trafik, talep, üretim ve abone sürücüleri
- satış kanalı, ürün ve reklam tabloları
- finansmanın P&L dışında kalması
- amortisman P&L/nakit ayrımı
- stok kapsamı ve profile özgü uyarılar
- sektör sözleşmesi ve gerçek uygulama smoke testi

v0.13 paketinde toplam `137/137` test ve JavaScript sözdizimi kontrolü başarılıdır.
