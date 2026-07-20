# Kaynak Uyum Denetimi

## Güncel durum — v0.14.0

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

Sekiz iş türü ayrı fiziksel kaynak ve operasyon profiline bağlandı:

1. Kuaför — koltuk
2. Berber — koltuk
3. Güzellik salonu — genel istasyon
4. Tırnak stüdyosu — masa
5. Cilt bakım salonu — bakım odası
6. Lazer / epilasyon merkezi — cihaz
7. Kaş / kirpik stüdyosu — uzman
8. Masaj / spa salonu — masaj odası

Güzellik v2 kapsamında:

- düzenlenebilir hizmet / seans karması
- hizmet bazlı fiyat, süre, sarf ve çalışan primi
- düzenlenebilir personel rol tablosu
- fiziksel kaynak ile personel üretken kapasitesinin düşük olanına göre etkin kapasite
- aktif müşteri tabanı, yeni müşteri ve tekrar ziyaret talebi
- no-show ve ön ödeme / iptal bedeli geri kazanımı
- bakım / kozmetik ürün geliri ve ürün maliyeti
- profile özgü başabaş, KPI ve uyarılar
- cihaz amortismanının P&L gideri; kurulum yatırımının nakit çıkışı olarak ayrılması
- finansmanın P&L dışında tutulması
- faaliyet hibe geliri ile hibe nakit girişinin ayrı izlenmesi

uygulandı. Eski güzellik salonu varsayılan sonucu testle korunur.

## Kaynak ilkesi

Steam formu diğer sektörlere kopyalanmaz. Her sektör ve alt iş türü kendi gelir, gider, kapasite, gösterge ve uyarılarıyla uyarlanır.

## Sıradaki aşama

Aşama 5E — Ajans / Freelancer / Danışmanlık v2 geçişi:

1. proje, saatlik çalışma, retainer ve performans bazlı gelir sürücülerini ayırmak
2. ekip kapasitesi, faturalandırılabilir saat ve kullanım oranını kurmak
3. müşteri yoğunlaşması, revizyon, taşeron ve tahsilat ekonomisini derinleştirmek
4. alt iş türlerine özel KPI ve uyarıları eklemek
5. mevcut ajans kabul sonuçlarını korumak

## Daha sonraki işler

- SaaS / Abonelik v2 geçişi
- Fiziksel Perakende v2 geçişi
- Oto Hizmetleri v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
