# Kaynak Uyum Denetimi

## Güncel durum

Başlangıçta master prototip bulunmadan sade bir ortak motor oluşturulmuş ve sektör geliştirmesine geçilmişti. Steam Yayıncı Finansal Fizibilite v2 dosyasının yüklenmesinden sonra kaynak planına geri dönüldü.

## Tamamlanan düzeltmeler

### Aşama 0 — Master prototipi koruma

- Master HTML kayıpsız arşivlendi.
- SHA-256 değeri kilitlendi.
- Tek komutla birebir yeniden üretim sağlandı.
- Hash ve ana işaret koruma testleri eklendi.
- Master hesap zinciri belgelendi.

### Aşama 1 — Ortak finans motoru çıkarma, ilk paket

- Masterdaki saf hesap zinciri `src/core/master-finance-engine-v2.js` dosyasına çıkarıldı.
- Basit ve bölgesel satış, para birimi, vergi, kademeli komisyon ve stopaj katmanları taşındı.
- Banka/kur tahsilatı, recoup, advance, geliştirici settlement ve yayıncı P&L taşındı.
- Kurum/şahıs vergisi, stopaj mahsubu, Teknopark, yüzde 80 indirim ve temettü ayrımı taşındı.
- 12 aylık nakit, runway, recoup kapanışı ve başabaş çözümü taşındı.
- Üç master senaryonun beklenen sonuçları golden testlerle kilitlendi.

## Kaynak ilkesi

Steam yayıncısı bütün sektörlere aynen kopyalanacak genel bir form değildir. Kendi iş kolunun ayrıntılı modelidir ve kalite referansıdır.

Her sektör:

- kendi gelir mantığını,
- kendi kesinti ve komisyonlarını,
- kendi değişken/sabit giderlerini,
- kendi paydaş veya ortaklık ilişkilerini,
- kendi kapasite ve sektör KPI'larını,
- kendi nakit zamanlamasını

masterdaki finansal açıklık ve ayrım seviyesinde uygular.

Steam'e özgü recoup, ABD stopajı veya geliştirici royalty'si ilgisiz sektörlere eklenmez. Kafe için paket servis/franchise, e-ticaret için pazaryeri/stok/iade, SaaS için abone/churn/CAC/LTV gibi kendi dalına özgü yapılar kullanılır.

## Henüz tamamlanmayanlar

1. Sektör şemasında checkbox, tablo ve koşullu grup desteği
2. Steam yayıncısının eksiksiz formuyla registry'ye bağlanması
3. Oyun/dijital yayıncılıktaki diğer iş türleri için ayrı profil varsayımları
4. Kafe/restoranın v2 derinlik modeline taşınması
5. Sonraki sektörlerin tek tek kendi iş yapısıyla taşınması
6. Bağımsız tek HTML üretimi
7. Rapor çıktıları

## Güvenli geçiş kararı

Mevcut `finance-engine.js` ve yedi çalışan sektör henüz kaldırılmadı. Kaynak uyumlu v2 motor paralel çalışıyor. Her sektörün taşınması sırasında eski kabul testleri korunacak, yeni sektör-özel derinlik testleri eklenecek ve sonuç farkları belgelenmeden eski motor kaldırılmayacaktır.
