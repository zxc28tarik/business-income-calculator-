# Kaynak Uyum Denetimi

## Güncel durum — v0.18.0

Proje, korunan Steam Yayıncısı master kaynağı ve ortak sektör şeması üzerinde ilerler. Çalışan sektörler silinmez; her sektör kendi ekonomik yapısına göre ayrı profil katmanıyla derinleştirilir.

## Tamamlanan aşamalar

### Aşama 0–4 — Kaynak, golden motor, gelişmiş şema ve Steam entegrasyonu

- Orijinal Steam HTML kayıpsız arşivlendi ve SHA-256 testiyle kilitlendi.
- Kötümser, beklenen ve iyimser master sonuçları golden testlerle korundu.
- Master hesap sırası saf fonksiyonlara ayrıldı.
- Checkbox, metin, tablo, koşullu görünürlük ve sektöre özel nakit kolonları eklendi.
- Steam formu ve sonuç görünümü ortak platforma bağlandı.
- `index.html` temiz UTF-8 olarak yeniden kuruldu ve gerçek HTML smoke testi eklendi.

### Aşama 5A–5H — Sektör profil geçişleri

Sekiz sektör ailesinin tamamı v2 profil derinliğine taşındı:

- Oyun / Dijital Yayıncılık: 6 profil
- Kafe / Restoran: 11 profil
- E-Ticaret / Pazaryeri: 10 profil
- Güzellik / Kuaför / Bakım: 8 profil
- Ajans / Freelancer / Danışmanlık: 10 profil
- SaaS / Abonelik: 8 profil
- Fiziksel Perakende: 7 profil
- Oto Hizmetleri: 8 profil

Her geçişte eski varsayılan finans sonucu testle korundu; iş türüne özel talep/gelir, kapasite, gider, başabaş, KPI, uyarı, senaryo ve nakit katmanları kuruldu.

### Aşama 5H — Oto Hizmetleri v2 profilleri

Sekiz iş türü ayrı ekonomik sürücülere bağlandı:

1. Oto yıkama — günlük talep × dönüşüm
2. Oto kuaför — randevu × gerçekleşme
3. Detaylı temizlik — randevu × gerçekleşme
4. Lastikçi — randevu × gerçekleşme ve parça satışı
5. Cam filmi / kaplama — randevu × gerçekleşme
6. Küçük bakım / servis — randevu × gerçekleşme ve parça satışı
7. Kaporta / boya — aylık planlanan iş
8. Mobil oto servis — mobil ekip × günlük rota

Oto v2 kapsamında:

- hizmet/iş karması: fiyat, süre, sarf, enerji, parça ve tekrar işçilik
- istasyon/lift kapasitesi ile personel üretken kapasitesinin karşılaştırılması
- randevuya gelmeme, iptal ve kapora tahsilatı
- müşteri tabanı ve tekrar ziyaret talebi
- personel rol tablosu
- parça/sarf stok kapsamı, hedef stok ve yeniden sipariş noktası
- tedarikçi vadesi, teslim süresi ve alım indirimi
- taşeron iş geliri, maliyeti ve katkı marjı
- faaliyet hibesi ile finansman ayrımı
- profile özgü başabaş, KPI, uyarı ve nakit kolonları

uygulandı. Eski Oto Yıkama varsayılan sonucu testle korunur.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi ödeme zamanını etkiler.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.

## Sıradaki aşama

### Aşama 6 — Bağımsız tek HTML çıktıları

1. Her sektör için kendi başına açılan tek HTML üretmek
2. Gerekli stil ve JavaScript'i dosya içine gömmek
3. Sektör ve alt iş türü hesap sözleşmesini ortak platformla aynı kaynaktan üretmek
4. Bağımsız çıktıların golden ve smoke testlerini eklemek
5. Platform ile tek HTML sonuçlarının aynı girdide aynı finans sonucunu verdiğini doğrulamak

## Daha sonraki işler

- rapor katmanı
- gerçek takip modu
