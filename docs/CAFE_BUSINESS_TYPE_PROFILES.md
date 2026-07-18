# Kafe / Restoran İş Türü Profilleri

## Amaç

Kafe / Restoran sektöründeki iş türlerinin yalnız seçim etiketi olarak kalmasını engellemek ve her alt türü kendi gerçek talep, kapasite, kanal ve maliyet yapısıyla hesaplamak.

## Profiller

| İş türü | Ana talep sürücüsü | Öne çıkan ekonomik yapı |
|---|---|---|
| Kafe | Günlük müşteri | Salon ve paket servis dengesi |
| Restoran | Koltuk × masa devri × doluluk | Masa kapasitesi, salon ağırlığı, yüksek personel ve kira |
| Kahveci | Günlük müşteri | İçecek ağırlıklı ürün karması, gel-al kanalı |
| Kahve kiosk | Saatlik sipariş × servis saati | Saatlik üretim kapasitesi, düşük alan maliyeti |
| Tatlıcı / pastane | Günlük müşteri | Yüksek fire ve kategori bazlı ürün karması |
| Burgerci | Günlük müşteri | Paket servis, komisyon ve paketleme yükü |
| Dönerci | Günlük müşteri | Yüksek malzeme oranı ve hızlı servis |
| Tostçu / büfe | Günlük müşteri | Yüksek işlem adedi ve düşük ortalama fiş |
| Dark kitchen | Günlük paket siparişi | Tam paket servis, platform komisyonu, mutfak kapasitesi |
| Food truck | Etkinlik × etkinlik başı müşteri | Etkinlik yoğunluğu, araç kapasitesi ve izin maliyeti |
| Franchise restoran | Koltuk × masa devri × doluluk | Franchise payı, yüksek kurulum ve marka giderleri |

## Satış kanalı karması

Gelişmiş kanal tablosundaki her satır şunları taşır:

- sipariş payı
- ortalama fiş çarpanı
- kanal komisyonu
- sipariş başı paketleme maliyeti
- paket servis işareti

Toplam sipariş payı yüzde 100 değilse sert uyarı oluşur.

## Ürün / kategori karması

Her ürün kategorisi şunları taşır:

- ciro payı
- malzeme maliyet oranı
- fire oranı

Toplam ciro payı yüzde 100 değilse sert uyarı oluşur. Malzeme ve fire maliyetleri kategori bazında hesaplanır.

## P&L ve nakit ayrımı

- Kurulum yatırımları nakitte tek sefer düşülür.
- Amortisman açılırsa tadilat, ekipman, mobilya ve yazılım kurulumu üzerinden aylık P&L gideri hesaplanır.
- Amortisman nakitten ikinci kez düşülmez.
- Finansman yalnız nakit girişidir ve kâr-zarar geliri değildir.
- Aylık P&L hibe geliri ile hibe/destek nakit girişi ayrı alanlarda izlenir.
- Kredi taksiti nakit çıkışıdır; prototipte P&L faiz/anapara ayrımı yapılmaz.

## Başabaş

Başabaş değeri profile göre farklı bir sürücüyle çözülür:

- restoran: gerekli doluluk
- kiosk: gerekli saatlik sipariş
- dark kitchen: gerekli günlük paket siparişi
- food truck: gerekli etkinlik başı müşteri
- diğer profiller: gerekli günlük müşteri

Ayrıca günlük müşteri karşılığı ve başabaş ciro gösterilir.

## Geriye uyumluluk

Eski Kafe varsayılanında gelişmiş kanal, ürün karması ve amortisman kapalıdır. Bu nedenle önceki varsayılan finans sonucu değişmez ve kabul testiyle korunur.

## Kullanım sınırı

Vergi, amortisman süresi, hibe muhasebesi ve kredi uygulamaları örnek varsayımlardır. Kesin uygulama mali müşavir ve ilgili uzmanlarla teyit edilmelidir.
