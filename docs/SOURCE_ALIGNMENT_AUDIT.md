# Kaynak Uyum Denetimi

## Güncel durum — v0.11.0

Proje, Steam Yayıncısı master kaynağı korunarak kaynak sırasına alınmıştır. İlk yedi sektör silinmemiştir; kontrollü geçiş için geriye uyumlu motorla çalışmaya devam eder.

## Tamamlanan aşamalar

### Aşama 0 — Master kaynağı koruma

- Orijinal HTML kayıpsız arşivlendi.
- SHA-256 değeri testle kilitlendi.
- Kaynak tek komutla yeniden üretilebilir.

### Aşama 1 — Golden sonuçlar

- Kötümser, beklenen ve iyimser sonuçlar testlerde sabitlendi.
- Kaynak davranışının istemeden değişmesi engellendi.

### Aşama 2 — v2 motor çıkarımı

- Master hesap sırası saf fonksiyonlara ayrıldı.
- Steam sektör hesabı bu motoru kullanır.
- İlk yedi sektör geriye uyumluluk motorunda bırakıldı.

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

Mobil oyun MAU, ödeme dönüşümü, IAP ve reklam geliriyle; DLC sahip tabanı ve satın alma oranıyla; dijital ürün aylık satış ve dönem uzunluğuyla hesaplanır. Kendi yayınlama profilinde harici geliştirici paylaşımı sıfırlanır. Steam master golden sonucu korunur.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5B — Kafe/Restoran v2 geçişi:

1. Kafe gelir, masa/paket servis ve kapasite yapısını v2 derinliğine taşımak
2. Kafe alt iş türlerini ayrı varsayım profillerine ayırmak
3. Kafe özel KPI ve uyarılarını genişletmek
4. Eski kafe kabul testlerini koruyup yeni v2 testlerini eklemek

## Daha sonraki işler

- sonraki sektörlerin kendi iş yapısıyla v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
