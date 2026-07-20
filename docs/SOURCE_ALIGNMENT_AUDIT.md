# Kaynak Uyum Denetimi

## Güncel durum — v0.15.0

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

On iş türü satış adedi, trafik/dönüşüm, sosyal talep, üretim veya aktif abone sürücülerine ayrıldı. Satış kanalı, ürün, reklam, stok, lojistik ve profile özgü maliyet katmanları eklendi. Eski Trendyol varsayılan sonucu korunur.

### Aşama 5D — Güzellik / Kuaför / Bakım v2 profilleri

Sekiz iş türü koltuk, masa, oda, cihaz, uzman veya genel istasyon kapasitesine bağlandı. Hizmet ve personel tabloları, tekrar ziyaret, no-show geri kazanımı, ürün satışı ve cihaz amortismanı eklendi. Eski güzellik salonu sonucu korunur.

### Aşama 5E — Ajans / Freelancer / Danışmanlık v2 profilleri

On iş türü ayrı gelir sürücüsüne bağlandı:

1. Yazılım ajansı — proje
2. Sosyal medya ajansı — retainer
3. Reklam ajansı — kampanya
4. Tasarım ajansı — proje
5. Danışmanlık şirketi — danışmanlık günü
6. Freelancer yazılımcı — faturalandırılan saat
7. Freelancer tasarımcı — faturalandırılan saat
8. Video / editing hizmeti — proje
9. SEO ajansı — retainer
10. Performans reklam ajansı — yönetilen bütçe ve performans primi

Ajans v2 kapsamında:

- rol bazlı ekip kapasitesi, faturalandırılabilir oran ve saatlik maliyet tablosu
- teorik kapasite, hedef faturalandırılabilir kapasite ve iç ekip yükü
- taşeron maliyeti ile sağlanan taşeron saatinin ayrı izlenmesi
- sözleşmeli revizyon, kapsam taşması ve revizyon tahsilatı
- peşinat payına göre etkin tahsilat gecikmesi
- müşteri yoğunlaşması, kapasite ve tahsilat uyarıları
- profile özgü başabaş, KPI ve denetim izi
- finansmanın P&L dışında tutulması
- faaliyet hibe geliri ile hibe nakit girişinin ayrı izlenmesi

uygulandı. Eski Yazılım Ajansı varsayılan sonucu testle korunur.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5F — SaaS / Abonelik v2 geçişi:

1. B2B, B2C, mobil abonelik, üyelik ve API kullanımı gelir sürücülerini ayırmak
2. plan/fiyat karması, yeni müşteri, churn, expansion ve contraction hareketlerini derinleştirmek
3. sunucu, destek, ödeme, satış ve müşteri edinme ekonomisini profile göre kurmak
4. alt iş türlerine özel KPI ve uyarıları eklemek
5. mevcut SaaS kabul sonuçlarını korumak

## Daha sonraki işler

- Fiziksel Perakende v2 geçişi
- Oto Hizmetleri v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
