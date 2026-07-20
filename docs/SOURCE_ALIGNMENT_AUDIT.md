# Kaynak Uyum Denetimi

## Güncel durum — v0.17.0

Proje, Steam Yayıncısı master kaynağı korunarak kaynak sırasına alınmıştır. Çalışan sektörler silinmez; her sektör kendi ekonomik yapısına göre kontrollü biçimde v2 derinliğine taşınır.

## Tamamlanan aşamalar

### Aşama 0–4 — Kaynak, golden motor, gelişmiş şema ve Steam entegrasyonu

- Orijinal Steam HTML kayıpsız arşivlendi ve SHA-256 testiyle kilitlendi.
- Kötümser, beklenen ve iyimser master sonuçları golden testlerle korundu.
- Master hesap sırası saf fonksiyonlara ayrıldı.
- Checkbox, metin, tablo, koşullu görünürlük ve sektöre özel nakit kolonları eklendi.
- Steam formu, KPI, şelale, senaryo, ayrıntı ve nakit görünümü platforma bağlandı.
- Bozuk `index.html` temiz UTF-8 olarak yeniden kuruldu ve gerçek HTML smoke testi eklendi.

### Aşama 5A–5F — Tamamlanan profil geçişleri

- Oyun / Dijital Yayıncılık: 6 profil
- Kafe / Restoran: 11 profil
- E-Ticaret / Pazaryeri: 10 profil
- Güzellik / Kuaför / Bakım: 8 profil
- Ajans / Freelancer / Danışmanlık: 10 profil
- SaaS / Abonelik: 8 profil

Her geçişte eski varsayılan sonuç testle korundu; iş türüne özel gelir, kapasite, gider, KPI, uyarı ve senaryo sürücüleri kuruldu.

### Aşama 5G — Fiziksel Perakende v2 profilleri

Yedi iş türü ayrı ekonomik sürücülere bağlandı:

1. Butik mağaza — mağaza trafiği × dönüşüm
2. Pet shop — aktif müşteri × aylık alışveriş sıklığı
3. Telefon aksesuar mağazası — mağaza trafiği × dönüşüm
4. Kırtasiye — mağaza trafiği × dönüşüm ve sezon çarpanı
5. Oyuncak mağazası — mağaza trafiği × dönüşüm ve sezon çarpanı
6. Çiçekçi — günlük standart sipariş + etkinlik siparişi
7. Küçük market — saatlik kasa işlemi × açık saat

Perakende v2 kapsamında:

- düzenlenebilir ürün / kategori karması
- fiyat, maliyet, iade, iskonto ve bozulma/fire katmanı
- düzenlenebilir tedarikçi karması
- vade, teslim süresi, alım indirimi ve asgari sipariş
- stok kapsam günü, hedef stok ve yeniden sipariş noktası
- stok işletme sermayesi açığı ve fazla stok maliyeti
- mağaza işlem kapasitesi ve profile özgü başabaş
- amortismanın P&L–nakit ayrımı
- finansman ile faaliyet hibesi ayrımı
- profile özgü KPI, uyarı, senaryo ve nakit kolonları

uygulandı. Eski Butik mağaza varsayılan sonucu testle korunur.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- İlk stok yatırımı tek seferlik nakit çıkışıdır; satılan ürün maliyeti dönemsel P&L gideridir.
- Tedarikçi vadesi kârı değiştirmez, nakit zamanlamasını değiştirir.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.

## Sıradaki aşama

Aşama 5H — Oto Hizmetleri v2 geçişi:

1. oto yıkama, detaylı temizlik, bakım-servis, lastik, kaporta ve mobil servis profillerini ayırmak
2. randevu, istasyon/lift, personel saati ve günlük araç kapasitesini derinleştirmek
3. hizmet, parça, sarf, taşeron ve tedarikçi ekonomisini profile göre kurmak
4. tekrar ziyaret, paket/abonelik, garanti/yeniden iş ve tahsilat uyarılarını eklemek
5. mevcut Oto Hizmetleri varsayılan sonucunu korumak

## Daha sonraki işler

- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
