# Güzellik / Kuaför / Bakım İş Türü Profilleri

## Amaç

Bu belge, Güzellik / Kuaför / Bakım sektörünün v0.14.0 profil yapısını tanımlar. Profiller yalnız isim seçeneği değildir; kapasite kaynağını, varsayımları, hizmet ve personel ekonomisini, KPI ve uyarıları değiştirir.

## İş türleri ve kapasite kaynakları

| İş türü | Ana kapasite kaynağı |
|---|---|
| Kuaför | Koltuk sayısı |
| Berber | Koltuk sayısı |
| Güzellik salonu | Genel koltuk / oda / cihaz istasyonu |
| Tırnak stüdyosu | Tırnak masası |
| Cilt bakım salonu | Bakım odası |
| Lazer / epilasyon merkezi | Aktif cihaz |
| Kaş / kirpik stüdyosu | Aktif uzman |
| Masaj / spa salonu | Masaj odası |

Fiziksel günlük kapasite:

`kaynak sayısı × günlük çalışma saati × 60 / etkin seans süresi`

Gelişmiş personel tablosu açıksa personel üretken kapasitesi de hesaplanır. Etkin kapasite, fiziksel kaynak kapasitesi ile personel kapasitesinin düşük olanıdır.

## Hizmet karması

Gelişmiş hizmet karması tablosu her hizmet için şunları taşır:

- seans payı
- fiyat
- seans süresi
- sarf maliyeti
- çalışan prim oranı

Etkin fiyat, süre, sarf ve prim oranı seans paylarına göre ağırlıklı hesaplanır. Pay toplamı yüzde 100'den anlamlı biçimde saparsa uyarı oluşur.

## Personel rolleri

Personel tablosu her rol için şunları taşır:

- kişi sayısı
- kişi başı aylık maliyet
- günlük üretken saat
- ciro primi

Bu tablo açıldığında sabit personel maliyeti ve personel kapasitesi satır bazında hesaplanır. Personel üretken saati fiziksel kapasiteyi sınırlıyorsa kapasite darboğazı uyarısı oluşur.

## Talep ve tekrar ziyaret

İki talep modu vardır:

1. Doluluk modu: aylık kapasite × doluluk oranı
2. Müşteri tabanı modu: aylık yeni müşteri + aktif müşteri tabanı × tekrar ziyaret oranı × ziyaret sıklığı

Hesaplanan talep kapasiteyi aşarsa karşılanamayan randevu ayrı gösterilir.

## No-show ve geri kazanım

No-show randevuların brüt hizmet değeri gelir kaybıdır. Ön ödeme veya iptal bedeliyle geri kazanılan pay ayrıca girilebilir. Geri kazanılan bölüm gelire eklenir; kalan bölüm no-show kaybı olarak tutulur.

## Perakende ürün satışı

Bakım veya kozmetik ürün satışı ayrı gelir ve ürün maliyeti olarak modellenir. Ürün geliri hizmet gelirine eklenir; ürün maliyeti değişken gider olarak ayrı izlenir.

## P&L ve nakit ayrımı

- Cihaz yatırımı kurulumda tek seferlik nakit çıkışıdır.
- Cihaz amortismanı aylık P&L gideridir.
- Amortisman nakitten ikinci kez düşülmez.
- Finansman P&L geliri değildir.
- Faaliyet hibe / destek geliri P&L'de ayrı alandır.
- Hibe / destek nakit girişi nakit akışında ayrı alandır.

## Koruma testleri

Varsayılan güzellik salonu eski model sonucunu korur:

- günlük kapasite: `36`
- aylık kapasite: `936`
- planlanan randevu: `636.48`
- tamamlanan seans: `585.5616`
- aylık net kâr: `27,077.526 TL`

Bu değerler otomatik testle sabitlenmiştir.

## Kabul kapsamı

- sekiz profil tanımı
- profile göre varsayım geçişi
- bütün profillerde sonlu finans sonucu
- hizmet karması ağırlıklı hesapları
- personel kapasite darboğazı
- no-show geri kazanımı
- ürün satışı ve ürün maliyeti
- finansman / P&L hibe ayrımı
- amortisman P&L / nakit ayrımı
- senaryo bağımsızlığı
- gerçek uygulama form, KPI ve ayrıntı render testi
