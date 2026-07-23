# Kaynak Uyum Denetimi

## Güncel durum — v0.23.0

Proje, korunan Steam Yayıncısı master kaynağı ve ortak sektör şeması üzerinde ilerler. Finans motorları çıktı, takip, portföy, migrasyon veya yayın katmanlarında yeniden yazılmaz. Ana platform, bağımsız HTML, rapor, gerçek takip, portföy karşılaştırması ve production artefaktı aynı sektör sözleşmelerini kullanır.

## Tamamlanan aşamalar

### Aşama 0–4 — Kaynak, golden motor, şema ve Steam entegrasyonu

- Orijinal Steam HTML kayıpsız arşivlendi ve SHA-256 testiyle kilitlendi.
- Kötümser, beklenen ve iyimser master sonuçları golden testlerle korundu.
- Master hesap sırası saf fonksiyonlara ayrıldı.
- Checkbox, metin, tablo, koşullu görünürlük ve sektöre özel nakit kolonları eklendi.
- Steam formu ve sonuç görünümü ortak platforma bağlandı.
- `index.html` temiz UTF-8 olarak kuruldu ve gerçek HTML smoke testi eklendi.

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

Her geçişte eski varsayılan finans sonucu testle korundu. İş türüne özel talep/gelir, kapasite, gider, başabaş, KPI, uyarı, senaryo ve nakit katmanları kuruldu.

### Aşama 6 — Bağımsız tek HTML çıktıları

- Sekiz sektör için çevrimdışı tek HTML hesaplayıcı üretildi.
- Ortak CSS, UI ve yalnız ilgili sektör bağımlılıkları dosyaya gömüldü.
- Harici CDN, script ve stil bağlantıları kullanılmadı.
- Ana platformla aynı sektör motorları korundu.
- Dosya sayısı, boyut, bağımsızlık ve deterministik üretim testleri eklendi.

### Aşama 7 — Finansal rapor katmanı

Ana ve bağımsız hesaplayıcılar yönetici özeti, model görünümü, sektör KPI’ları, uyarılar, senaryo karşılaştırması, finansal dağılım, 12 aylık nakit ve görünür varsayımlar içeren çevrimdışı HTML raporuna bağlandı.

Rapor sonucu yeniden hesaplamaz; normalize girdi, `calculateModel`, `buildPresentation`, uyarı ve nakit çıktılarını kullanır. Kullanıcı metni HTML olarak çalıştırılmaz.

### Aşama 8 — Gerçek takip modu

- Tahmin ile gerçekleşen veri ayrıldı.
- Aylık tahsilat, gider, vergi, finansman, destek, kurulum, kredi, nakit ve hacim kaydı eklendi.
- Tahsilat, faaliyet sonucu, net nakit ve dönem sonu nakit sapmaları üretildi.
- Sapma nedeni, dönem notu ve trendler eklendi.
- Takip CSV’si ve çevrimdışı HTML takip raporu üretildi.
- Boş gerçekleşen alanlar otomatik sıfır sayılmadı.
- Finansman ve destek faaliyet sonucuna değil yalnız net nakit hareketine girdi.
- Steam master `months`, `receiptTry`, `publisherCostTry`, `developerOutflowTry` ve `cashTry` alanları yalnız okuma adaptörüyle desteklendi.

### Aşama 9 — Çoklu kayıt ve veri taşınabilirliği

Ana platform ve bağımsız hesaplayıcılar adlandırılmış işletme/proje kayıtlarına bağlandı.

Uygulanan sözleşme:

1. yeni kayıt oluşturma
2. kayıt adlandırma
3. çalışma alanı ve takip verisiyle kopyalama
4. son kayıt hariç silme
5. kayıtlar arasında geçiş
6. sektör, senaryo, brüt gelir, net sonuç, 12 ay sonu nakit ve risk karşılaştırması
7. bütün çalışma alanları ve proje takip verileriyle JSON yedeği
8. şema, sürüm, kapsam, boyut, proje sayısı ve takip anahtarı doğrulaması
9. platform ve bağımsız sektör yedeklerinin birbirinden ayrılması
10. yalnız mevcut portföye ait takip anahtarlarının dışa aktarılması ve değiştirilmesi

Portföy karşılaştırması mevcut sektör motorlarını çağırır; yeni finans formülü oluşturmaz. Steam master motoru ve golden sonuçlar değişmez.

### Aşama 10 — Yayınlama ve son kalite

`v0.23.0` ile yayın öncesi kalite ve dağıtım katmanı tamamlandı:

- Playwright Chromium masaüstü ve Pixel 7 mobil matrisi
- sektör/form, portföy, proje takip izolasyonu, JSON yedeği ve standalone gerçek tarayıcı akışları
- ciddi/kritik WCAG A/AA ihlallerini durduran axe denetimi
- mobil sayfa düzeyinde yatay taşma kontrolü
- erişilebilir dinamik tablo etiketleri, skip-link ve görünür klavye odağı
- `scripts/build-production.mjs` ile ayrı `dist/` üretim paketi
- production paketine test, geliştirme betiği ve `node_modules` sızmasını engelleyen sınır testi
- v0.21 proje kimliği içermeyen takip anahtarlarını hedef veriyi ezmeden taşıyan migrasyon
- `package-lock.json` ile sabitlenmiş tarayıcı test bağımlılıkları
- gerçek `dist/` artefaktını Chromium içinde doğrulayan release kalite kapısı
- yalnız `main` veya elle tetiklenen, kalite kapılı GitHub Pages workflow’u
- sürümleme, yayın kontrol listesi ve geri alma belgesi

Pages workflow dosyası hazırdır; taslak PR production ortamına dağıtılmaz. Gerçek Pages yayını için PR’nin açık onayla `main` dalına birleştirilmesi ve depo Pages kaynağının GitHub Actions olarak ayarlanması gerekir.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- Tedarikçi indirimi maliyeti; tedarikçi vadesi ödeme zamanını etkiler.
- Amortisman P&L gideridir ve nakitten ikinci kez düşülmez.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.
- Bağımsız HTML, rapor, takip, portföy, migrasyon ve yayın katmanı yeni finans motoru oluşturamaz.
- Rapor, takip ve portföy görünümü yatırım tavsiyesi değildir.

## Güncel doğrulama

- 234/234 birim ve entegrasyon testi
- sekiz sektör v2 profil sözleşmesi
- eski varsayılan ve Steam golden sonuç korumaları
- gerçek uygulama smoke testi
- rapor ve takip HTML kaçış güvenliği
- takip proje/iş türü izolasyonu
- portföy kayıt yaşam döngüsü ve 50 kayıt sınırı
- yedek şema, kapsam ve yabancı takip anahtarı reddi
- eski takip anahtarı migrasyon testleri
- bütün JavaScript modüllerinin içe aktarım kontrolü
- portföy özellikli sekiz bağımsız HTML’nin deterministik üretimi
- production artefakt sınır testi
- gerçek `dist/` üzerinde Chromium masaüstü ve mobil E2E
- ciddi/kritik WCAG A/AA axe ihlali bulunmaması
- sürüm ve Pages workflow sözleşmesinin otomatik testi

## Yayın durumu

- Taslak PR açık ve birleştirilmemiştir.
- `main` dalı doğrudan değiştirilmemiştir.
- Production `dist/` paketi CI artefaktı olarak üretilir.
- GitHub Pages dağıtımı yalnız `main` dalında veya elle çalışır.
- Birleştirme ve canlı yayın kullanıcı onayı olmadan yapılmaz.
