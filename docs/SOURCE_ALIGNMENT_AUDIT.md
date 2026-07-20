# Kaynak Uyum Denetimi

## Güncel durum — v0.13.0

Proje, Steam Yayıncısı master kaynağı korunarak kaynak sırasına alınmıştır. Çalışan sektörler silinmez; her sektör kendi ekonomik yapısına göre kontrollü biçimde v2 derinliğine taşınır.

## Tamamlanan aşamalar

### Aşama 0 — Master kaynağı koruma

- Orijinal HTML kayıpsız arşivlendi.
- SHA-256 değeri testle kilitlendi.
- Kaynak tek komutla yeniden üretilebilir.

### Aşama 1 — Golden sonuçlar

- Kötümser, beklenen ve iyimser Steam sonuçları testlerde sabitlendi.
- Kaynak davranışının istemeden değişmesi engellendi.

### Aşama 2 — v2 motor çıkarımı

- Master hesap sırası saf fonksiyonlara ayrıldı.
- Steam sektör hesabı bu motoru kullanır.
- Diğer sektörler kendi ekonomik yapılarına göre ayrı geçiş paketleriyle derinleştirilir.

### Aşama 3 — Gelişmiş sektör şeması

- checkbox ve metin alanları
- düzenlenebilir tablolar
- koşullu görünürlük
- derin senaryo kopyalama
- sektöre özel nakit kolonları

### Aşama 4 — Steam Yayıncısı master profilini bağlama

- On giriş bölümü platform formuna taşındı.
- Steam sektör listesine eklendi.
- KPI, şelale, senaryo, ayrıntı ve nakit görünümü bağlandı.
- Gerçek HTML kabuğu ve Steam render testi eklendi.

### Denetim düzeltmesi — v0.10.1

- Bozuk `index.html` temiz UTF-8 olarak yeniden kuruldu.
- Zorunlu uzman teyidi uyarısı geri getirildi.
- Smoke testi gerçek HTML kimliklerini kullanacak şekilde değiştirildi.

### Aşama 5A — Oyun ve dijital yayıncılık profilleri

Altı profil ayrı satış sürücüsü, koşullu form, gösterge, uyarı ve senaryo yapısına bağlandı. Steam master golden sonucu korunur.

### Aşama 5B — Kafe / Restoran v2 profilleri

On bir iş türü ayrı talep ve kapasite sürücüsüne bağlandı. Satış kanalı ve ürün karması tabloları, profile özgü başabaş, amortisman P&L/nakit ayrımı ve hibe/finansman sınıflandırması eklendi. Eski Kafe varsayılan sonucu korunur.

### Aşama 5C — E-Ticaret / Pazaryeri v2 profilleri

On iş türü ayrı talep sürücüsüne bağlandı:

1. Trendyol mağazası
2. Hepsiburada mağazası
3. Amazon Türkiye
4. Amazon global
5. Shopify mağazası
6. Stoklu e-ticaret
7. Dropshipping
8. Instagram satış
9. El yapımı ürün satışı
10. Abonelik kutusu

E-ticaret v2 kapsamında:

- pazaryeri / stoklu türlerde aylık satış adedi
- Amazon global, Shopify ve dropshipping için trafik × dönüşüm × sipariş başı ürün
- Instagram için talep × dönüşüm
- el yapımı ürün için üretim kapasitesi × kullanım
- abonelik kutusu için aktif abone, yeni abone ve aylık kayıp
- düzenlenebilir satış kanalı, ürün karması ve reklam kanalı tabloları
- kanal bazlı komisyon, ödeme kesintisi, lojistik ve tahsilat vadesi
- ürün bazlı fiyat, maliyet ve iade
- stok kapsamı, yeniden sipariş noktası, güvenlik stoğu ve stok devir hızı
- sınır ötesi maliyet, tedarikçi kalite kaybı, birim emek ve abonelik fulfillment alanları
- profile özgü kapasite, başabaş, KPI ve uyarılar
- amortismanın P&L gideri; kurulum ve ilk stokun nakit çıkışı olarak ayrılması
- finansmanın P&L dışında tutulması
- P&L hibe geliri ile hibe nakit girişinin ayrı izlenmesi

uygulandı. Eski Trendyol varsayılan finans sonucu testle korunur.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5D — Güzellik / Kuaför / Bakım v2 geçişi:

1. randevu, koltuk/oda/cihaz ve personel kapasitesini iş türlerine göre ayırmak
2. hizmet ve ürün satış karmasını derinleştirmek
3. sarf malzemesi, komisyon, tekrar ziyaret ve iptal ekonomisini kurmak
4. alt iş türlerine özel KPI ve uyarıları eklemek
5. mevcut güzellik sektörü kabul sonuçlarını korumak

## Daha sonraki işler

- sonraki sektörlerin kendi iş yapısıyla v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
