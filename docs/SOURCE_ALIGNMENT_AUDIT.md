# Kaynak Uyum Denetimi

## Güncel durum — v0.21.0

Proje, korunan Steam Yayıncısı master kaynağı ve ortak sektör şeması üzerinde ilerler. Çalışan finans motorları silinmez veya çıktı/takip katmanlarında yeniden yazılmaz. Sektör, bağımsız HTML, fizibilite raporu ve gerçek takip aynı hesap sözleşmesini kullanır.

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

Ana platform ve bağımsız hesaplayıcılar ortak rapor sözleşmesine bağlandı. Rapor yönetici özeti, model görünümü, sektör KPI’ları, uyarılar, senaryo karşılaştırması, finansal dağılım, 12 aylık nakit ve görünür varsayım denetim izi taşır.

Rapor finansal sonucu yeniden hesaplamaz. Sektörün normalize girdisi, `calculateModel`, `buildPresentation`, uyarı ve nakit çıktıları kullanılır. Kullanıcı metni HTML olarak çalıştırılmaz; belgeye kaçışlanarak yazılır.

### Aşama 8 — Gerçek takip modu

Tahmin ve gerçekleşen veri birbirinden ayrıldı.

Takip kapsamı:

1. sektör + alt iş türü bazlı yerel kayıt
2. aylık tahsilat, değişken/sabit gider, paydaş, vergi ve dönem sonu nakit
3. finansman, destek, kurulum ve kredi hareketlerinin ayrı kaydı
4. operasyon hacmi, sapma nedeni ve dönem notu
5. tahsilat, faaliyet sonucu, net nakit hareketi ve dönem sonu nakit sapmaları
6. tahsilat, faaliyet sonucu, nakit ve hacim trendleri
7. takip CSV’si ve çevrimdışı tek HTML takip raporu

Takip katmanı gerçekleşen verileri finans motorunun girdilerine geri yazmaz. Boş alanlar otomatik sıfır sayılmaz. Finansman ve destek faaliyet sonucuna değil yalnız net nakit hareketine girer.

Oyun / Dijital Yayıncılık için korunan master nakit alanları (`months`, `receiptTry`, `publisherCostTry`, `developerOutflowTry`, `cashTry`) yalnız okuma adaptörüyle ortak takip modeline çevrilir. Master finans motoru ve golden sonuçlar değiştirilmez.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi ödeme zamanını etkiler.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.
- Bağımsız HTML, rapor ve takip yeni finans motoru oluşturamaz.
- Rapor ve takip görünümü yatırım tavsiyesi değildir.

## Güncel doğrulama

- 212/212 test
- sekiz sektör gerçek takip sözleşmesi
- Steam nakit adaptörü
- HTML kaçış güvenliği
- gerçek uygulama smoke testi
- bütün JavaScript modüllerinin içe aktarım kontrolü
- takip özellikli sekiz bağımsız HTML’nin deterministik üretimi

## Sıradaki aşama

### Aşama 9 — Çoklu kayıt ve veri taşınabilirliği

1. fizibiliteleri işletme/proje adıyla saklamak
2. birden fazla kayıt arasında geçiş yapmak
3. takip verileri dahil tam yedek dışa aktarmak
4. yedeği doğrulayarak içe aktarmak
5. kayıtları yan yana karşılaştıran portföy görünümü oluşturmak
