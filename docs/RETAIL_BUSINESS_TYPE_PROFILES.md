# Fiziksel Perakende İş Türü Profilleri

## Amaç

Bu belge `v0.17.0` Fiziksel Perakende geçişinin iş türü, satış sürücüsü, ürün, tedarikçi, stok ve kabul kurallarını tanımlar.

## Profiller

| İş türü | Ana satış sürücüsü |
|---|---|
| Butik mağaza | Günlük mağaza trafiği × dönüşüm × sezon çarpanı |
| Pet shop | Aktif müşteri tabanı × aylık alışveriş sıklığı |
| Telefon aksesuar mağazası | Günlük mağaza trafiği × dönüşüm × sezon çarpanı |
| Kırtasiye | Günlük mağaza trafiği × dönüşüm × sezon çarpanı |
| Oyuncak mağazası | Günlük mağaza trafiği × dönüşüm × sezon çarpanı |
| Çiçekçi | Günlük standart sipariş + aylık etkinlik siparişi |
| Küçük market | Saatlik kasa işlemi × günlük açık saat × sezon çarpanı |

İş türü değiştirildiğinde profile özgü satış, sepet, maliyet, iade, fire, vade ve stok varsayımları uygulanır. Vergi, finansman ve nakit tercihleri korunur.

## Ürün ve kategori karması

Gelişmiş ürün karması açıldığında her satır şu alanları taşır:

- satış payı
- satış fiyatı
- birim maliyet
- iade oranı
- iskontolu satış payı
- iskonto oranı
- bozulma / son kullanma fire oranı

Ağırlıklı ürün fiyatı ve maliyeti satış paylarına göre hesaplanır. İskonto satış gelirini, iade tanınan satışı, bozulma ve sayım kaybı stok maliyetini etkiler.

## Tedarikçi karması

Gelişmiş tedarikçi tablosu her tedarikçi için:

- alım payı
- ödeme vadesi
- teslim süresi
- alım indirimi
- asgari sipariş tutarı

alanlarını taşır. Alım indirimi ürün maliyetini düşürür. Ödeme vadesi P&L kârını değiştirmez; nakit çıkış zamanını değiştirir.

## Stok ve işletme sermayesi

Stok planı etkinleştirildiğinde:

- mevcut / açılış stok maliyeti
- hedef stok kapsam günü
- tedarik süresi
- güvenlik stoğu

kullanılarak şu sonuçlar üretilir:

- stok kapsam günü
- hedef stok maliyeti
- stok işletme sermayesi açığı
- fazla stok maliyeti
- yeniden sipariş noktası
- yıllık stok devir hızı

Stok işletme sermayesi açığı otomatik P&L gideri değildir; işletmenin hedef stok seviyesine ulaşmak için ihtiyaç duyduğu ek finansman göstergesidir.

## P&L ve nakit kuralları

- İlk stok yatırımı kurulumda nakitten bir kez düşer.
- Satılan ürün maliyeti aylık P&L gideridir.
- Sayım kaybı ve bozulma/fire aylık değişken maliyettir.
- Finansman P&L geliri değildir.
- Faaliyet hibesi ile tek seferlik hibe nakit girişi ayrı tutulur.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Tedarikçi vadesi maliyeti silmez, ödeme zamanını değiştirir.

## KPI ve uyarılar

Başlıca göstergeler:

- günlük ve aylık işlem
- mağaza kapasite yükü
- ürün başı net kâr
- ürün brüt marjı
- yıllık stok devir hızı
- stok kapsam günü
- stok işletme sermayesi açığı
- tedarikçi vadesi ve teslim süresi
- başabaş günlük işlem
- 12 ay sonu nakit

Uyarılar; kapasite aşımı, düşük marj, yüksek iade, yüksek fire, yavaş stok devri, stok açığı, yeniden sipariş riski, yüksek asgari sipariş ve nakit açığı durumlarında üretilir.

## Kabul kriterleri

- Yedi profil sonlu finans sonucu üretmelidir.
- Eski Butik mağaza varsayılan sonucu korunmalıdır.
- Ürün ve tedarikçi tabloları ağırlıklı sonuç üretmelidir.
- Stok planı işletme sermayesi açığı ve yeniden sipariş noktası üretmelidir.
- Finansman net kârı değiştirmemelidir.
- Amortisman nakit sabit giderinden ikinci kez düşülmemelidir.
- Gerçek uygulama smoke testi Perakende v2 formunu, KPI'ları, nakit kolonlarını ve denetim izini render etmelidir.
