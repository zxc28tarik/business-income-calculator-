# Kaynak Uyum Denetimi

## Güncel durum — v0.12.0

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

- Checkbox ve metin alanları
- Düzenlenebilir tablolar
- Koşullu görünürlük
- Derin senaryo kopyalama
- Sektöre özel nakit kolonları

### Aşama 4 — Steam Yayıncısı master profilini bağlama

- On giriş bölümü platform formuna taşındı.
- Steam sektör listesine eklendi.
- KPI, şelale, senaryo, ayrıntı ve nakit görünümü bağlandı.
- Gerçek HTML kabuğu ve Steam render testi eklendi.

### Denetim düzeltmesi — v0.10.1

- Bozuk `index.html` temiz UTF-8 olarak yeniden kuruldu.
- Zorunlu uzman teyidi uyarısı geri getirildi.
- Smoke testi gerçek HTML kimliklerini kullanacak şekilde değiştirildi.

### Aşama 5A — Oyun ve dijital yayıncılık iş türü profilleri

Altı profil ayrı satış sürücüsü, koşullu form, gösterge, uyarı ve senaryo yapısına bağlandı:

1. Steam oyun yayıncısı
2. Indie oyun kendi yayınlama
3. Mobil oyun
4. DLC / supporter pack
5. Oyun asset / dijital ürün
6. Publisher–developer paylaşımı

Steam master golden sonucu korunur.

### Aşama 5B — Kafe / Restoran v2 iş türü profilleri

On bir profil ayrı talep ve kapasite sürücüsüne bağlandı:

1. Kafe
2. Restoran
3. Kahveci
4. Kahve kiosk
5. Tatlıcı / pastane
6. Burgerci
7. Dönerci
8. Tostçu / büfe
9. Dark kitchen
10. Food truck
11. Franchise restoran

Kafe v2 kapsamında:

- restoran için koltuk × masa devri × doluluk
- kiosk için saatlik sipariş × servis saati
- dark kitchen için günlük paket siparişi
- food truck için etkinlik × etkinlik başı müşteri
- düzenlenebilir satış kanalı karması
- düzenlenebilir ürün ve maliyet karması
- profile özgü kapasite, başabaş, KPI ve uyarılar
- amortismanın P&L gideri, kurulumun nakit çıkışı olarak ayrılması
- finansmanın P&L dışında tutulması
- P&L hibe geliri ile hibe nakit girişinin ayrı izlenmesi

uygulandı. Eski Kafe varsayılan sonucu testle korunur.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5C — E-Ticaret / Pazaryeri v2 geçişi:

1. pazaryeri, kendi site, sosyal satış ve dropshipping gelir sürücülerini ayırmak
2. ürün, sipariş, iade, kargo, stok ve reklam ekonomisini derinleştirmek
3. alt iş türlerine özel KPI ve uyarıları kurmak
4. mevcut e-ticaret kabul sonuçlarını korumak

## Daha sonraki işler

- sonraki sektörlerin kendi iş yapısıyla v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
