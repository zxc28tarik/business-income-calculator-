# Aşama 8 — Gerçek Takip Modu

## Amaç

Tahmin bütçesi ile aylık gerçekleşen sonuçları birbirine karıştırmadan saklamak; bütçe-gerçekleşen farkını, sapma nedenlerini, dönem trendini ve paylaşılabilir takip raporunu üretmek.

## Veri kapsamı

Her aylık kayıtta aşağıdaki alanlar bulunabilir:

- takvim dönemi
- tahsilat
- değişken gider
- sabit gider
- paydaş ödemesi
- vergi
- finansman
- destek
- kurulum ödemesi
- kredi ödemesi
- dönem sonu nakit
- operasyon hacmi
- ana sapma nedeni
- dönem notu

Boş bırakılan alanlar otomatik olarak sıfır sayılmaz. Faaliyet sonucu karşılaştırması için tahsilat, değişken gider ve sabit gider alanlarının bulunması gerekir.

## Saklama sınırı

Takip kayıtları tarayıcı yerel depolamasında sektör ve alt iş türü kapsamında tutulur. Örneğin aynı sektör içindeki kafe ve restoran kayıtları ya da B2B ve B2C SaaS kayıtları birbirine karışmaz.

## Hesap ayrımı

### Faaliyet sonucu

Gerçek tahsilat eksi değişken gider, sabit gider, paydaş ödemesi ve vergi.

Finansman ve destek faaliyet sonucu değildir.

### Net nakit hareketi

Faaliyet sonucuna finansman ve destek eklenir; kurulum ve kredi ödemeleri düşülür.

### Sapma işaretleri

- Tahsilat: gerçekleşen eksi plan
- Gider: plan eksi gerçekleşen
- Faaliyet sonucu: gerçekleşen eksi plan
- Net nakit hareketi: gerçekleşen eksi plan
- Dönem sonu nakit: gerçekleşen eksi plan

Bu nedenle pozitif sapma genel olarak olumlu, negatif sapma olumsuz yöndedir.

## Durum sınıflandırması

Karşılaştırılabilir dönemlerin toplu faaliyet sonucu sapması kullanılır:

- plana yakın: %-5 veya üzeri
- dikkat gerektiriyor: %-15 ile %-5 arası
- planın gerisinde: %-15 altı
- gerçekleşen veri bekleniyor: karşılaştırılabilir dönem yok

Plan ve gerçekleşen değerlerinin ikisi de sıfırsa sapma yüzde sıfır kabul edilir.

## Trendler

En az iki gerçekleşen dönem olduğunda aşağıdaki yönler hesaplanır:

- tahsilat
- faaliyet sonucu
- dönem sonu nakit
- operasyon hacmi

Trend, ilk ve son kullanılabilir gerçekleşen değer arasındaki değişimi gösterir. Mevsimsellikten arındırılmış istatistiksel tahmin değildir.

## Sapma nedenleri

Aylık ana neden seçenekleri:

- satış / işlem hacmi
- fiyat / sepet / birim gelir
- komisyon / kanal kesintisi
- ürün / malzeme / sarf maliyeti
- personel ve kapasite
- sabit gider değişimi
- vergi / yasal ödeme
- tahsilat gecikmesi
- mevsimsellik / dönem etkisi
- tek seferlik olay
- diğer

## Çıktılar

### Takip CSV

Kaydedilmiş dönemlerin plan, gerçekleşen ve sapma değerlerini dışa aktarır.

### Takip Raporu

Çevrimdışı tek HTML dosyasıdır. Şunları içerir:

- genel takip durumu
- toplam tahsilat sapması
- toplam faaliyet sonucu sapması
- toplam net nakit hareketi sapması
- dönem karşılaştırma tablosu
- trend özeti
- sapma nedenleri ve notlar

Tarayıcıdan yazdırılabilir veya PDF'ye dönüştürülebilir.

## Oyun / Dijital Yayıncılık uyumu

Korunan yayıncı master motoru ortak sektörlerden farklı nakit alanları kullanır:

- `months`
- `receiptTry`
- `publisherCostTry`
- `developerOutflowTry`
- `cashTry`

Takip modeli bu alanları yalnız okuma uyum katmanında ortak takip sözleşmesine dönüştürür. Master finans motoru değiştirilmez.

## Modüller

- `src/tracking/tracking-model.js`: kayıt normalizasyonu, plan uyumu, sapma, durum ve trend
- `src/tracking/tracking-controller.js`: yerel kayıt, tablo, CSV ve uygulama bağlantısı
- `src/tracking/tracking-report.js`: çevrimdışı takip raporu
- `tests/tracking-mode.test.mjs`: ortak ve sektörler arası kabul testleri

## Sınırlar

- Yerel depolama muhasebe defteri değildir.
- Takip raporu mali müşavirlik, vergi danışmanlığı veya yatırım tavsiyesi değildir.
- Gerçekleşen değerlerin doğruluğu kullanıcının girdiği kaynağa bağlıdır.
- Trend hesabı mevsimsellik veya enflasyon düzeltmesi yapmaz.
