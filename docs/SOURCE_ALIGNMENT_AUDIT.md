# Kaynak Uyum Denetimi

## Güncel durum — v0.20.0

Proje, korunan Steam Yayıncısı master kaynağı ve ortak sektör şeması üzerinde ilerler. Çalışan finans motorları silinmez veya çıktı katmanlarında yeniden yazılmaz. Sektör, bağımsız HTML ve rapor aynı hesap sözleşmesini kullanır.

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

### Aşama 6 — Bağımsız tek HTML çıktıları

- Sekiz sektör için çevrimdışı tek HTML hesaplayıcı üretildi.
- Ortak CSS, UI ve yalnız ilgili sektör bağımlılıkları dosyaya gömüldü.
- Harici CDN, script ve stil bağlantıları kaldırıldı.
- Ana platformla aynı sektör motorları kullanıldı.
- Dosya sayısı, boyut, bağımsızlık ve deterministik üretim testleri eklendi.
- Çıktılar `standalone/` klasörüne ve CI artefaktına bağlandı.

### Aşama 7 — Finansal rapor katmanı

Ana platform ve bağımsız hesaplayıcılar ortak rapor sözleşmesine bağlandı.

Rapor şunları taşır:

1. sektör, iş türü, aktif senaryo ve motor sürümü
2. yönetici özeti
3. dengeli / koşullu / riskli model görünümü
4. sektörün kendi KPI kartları
5. kritik, dikkat ve bilgi uyarıları
6. üç senaryo karşılaştırması
7. finansal dağılım
8. minimum nakit, dönem sonu nakit ve ilk negatif ay
9. 12 aylık nakit akışı
10. yalnız görünür form varsayımları ve tablolar
11. kullanım sınırı

Rapor finansal sonucu yeniden hesaplamaz. Sektörün normalize girdisi, `calculateModel`, `buildPresentation`, uyarı ve nakit çıktıları kullanılır. Kullanıcı metni HTML olarak çalıştırılmaz; belgeye kaçışlanarak yazılır.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi ödeme zamanını etkiler.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.
- Bağımsız HTML ve rapor yeni finans motoru oluşturamaz.
- Rapor görünümü yatırım tavsiyesi değildir.

## Sıradaki aşama

### Aşama 8 — Gerçek takip modu

1. Tahmin ve gerçekleşen dönem verilerini ayrı saklamak
2. Aylık gerçekleşen ciro, gider, kâr ve nakit kayıtlarını girmek
3. Bütçe-gerçekleşen farkını göstermek
4. Sapma nedenlerini ve dönem trendini izlemek
5. Tahmin raporu ile gerçekleşen raporu karşılaştırmak
6. Finans motorlarının mevcut golden sonuçlarını korumak
