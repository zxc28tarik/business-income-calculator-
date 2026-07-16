# Kaynak Uyum Denetimi

## Güncel durum — v0.10.1

Proje, Steam Yayıncısı master kaynağı korunarak yeniden kaynak sırasına alınmıştır. İlk yedi sektör silinmemiştir; kontrollü geçiş için eski uyumluluk motoruyla çalışmaya devam eder.

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

### Düzeltme paketi — v0.10.1

- Bozuk `index.html` temiz UTF-8 olarak yeniden kuruldu.
- Sürüm etiketi güncellendi.
- Zorunlu uyarı metni geri getirildi.
- Smoke testi gerçek HTML kimliklerini kullanacak şekilde değiştirildi.
- Steam ekranı smoke testine eklendi.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5, iş türü profilleridir:

1. Oyun/dijital yayıncılık alt türlerini ayrı profillere ayırmak
2. Kafe/Restoranı v2 derinliğine taşımak
3. Kafe alt iş türlerini ayrı varsayım ve alanlarla uyarlamak
4. Sonraki sektörleri aynı yöntemle sırayla taşımak

## Daha sonraki işler

- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
