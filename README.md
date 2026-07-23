# Business Income Calculator

Sektör bazlı finansal fizibilite, 12 aylık nakit akışı, tahmin-gerçekleşen takip ve çoklu işletme/proje portföyü.

## v0.23.0 — Yayınlama ve son kalite

Aşama 10 tamamlandı. Uygulama artık gerçek tarayıcı kalite kapısı, erişilebilirlik denetimi, üretim paketi, sağlamlaştırılmış veri migrasyonu ve korumalı GitHub Pages yayın akışına sahiptir.

- Playwright ile gerçek Chromium masaüstü ve Pixel 7 mobil testleri
- sektör değiştirme ve form girdisinin finans sonucuna yansıması
- çoklu kayıt, portföy ve proje bazlı gerçek takip akışları
- JSON yedeğinin gerçek tarayıcıdan indirilmesi
- bağımsız tek HTML hesaplayıcıların Chromium’da açılması
- mobil sayfa düzeyinde yatay taşma denetimi
- axe ile ciddi/kritik WCAG A/AA ihlali denetimi
- erişilebilir form tablosu etiketleri, skip-link ve görünür klavye odağı
- `dist/` üretim paketi ve üretim paketi sınır testleri
- v0.21 takip anahtarları için tekrar çalıştırılabilir ve veri ezmeyen migrasyon
- `package-lock.json` ile sabitlenmiş tarayıcı test bağımlılıkları
- yalnız `main` dalında çalışan, kalite kapılı GitHub Pages workflow’u

Ayrıntılar: `docs/RELEASE_AND_DEPLOYMENT.md`.

## v0.22.0 — Çoklu işletme / proje ve veri taşınabilirliği

Ana platform ve sekiz bağımsız hesaplayıcı birden fazla adlandırılmış fizibilite kaydı tutar.

- kayıt oluşturma, adlandırma, kopyalama, silme ve geçiş
- proje kimliğiyle ayrılmış gerçek takip verileri
- sektör, senaryo, gelir, net sonuç, nakit ve risk portföy karşılaştırması
- kapsam doğrulamalı tam JSON yedeği ve içe aktarma
- 50 kayıt, 80 karakter kayıt adı ve 5 MB yedek sınırı

Ayrıntılar: `docs/MULTI_PROJECT_PORTFOLIO.md`.

## v0.21.0 — Gerçek takip modu

Tahmin bütçesi ile aylık gerçekleşen sonuçlar ayrı saklanır ve karşılaştırılır.

- aylık tahsilat, gider, vergi, finansman, destek, kurulum, kredi, nakit ve hacim kaydı
- tahsilat, faaliyet sonucu, net nakit ve dönem sonu nakit sapmaları
- sapma nedeni, not ve dönem trendleri
- takip CSV’si ve çevrimdışı tek HTML takip raporu
- finansman ve desteğin faaliyet sonucundan ayrı tutulması
- Steam master nakit sözleşmesi için yalnız okuma adaptörü

Ayrıntılar: `docs/ACTUAL_TRACKING_MODE.md`.

## v0.20.0 — Finansal rapor katmanı

Ana platform ve bağımsız hesaplayıcılar aktif sektör, iş türü, senaryo ve girdilerden çevrimdışı tek HTML fizibilite raporu üretir.

- yönetici özeti ve model görünümü
- sektör KPI’ları ve uyarılar
- üç senaryo karşılaştırması
- 12 aylık nakit ve görünür varsayım denetim izi
- yazdırma / PDF

Ayrıntılar: `docs/REPORT_LAYER.md`.

## v0.19.0 — Bağımsız tek HTML çıktıları

Sekiz sektörün her biri ana platformdan bağımsız, çevrimdışı tek HTML dosyası olarak üretilebilir.

- CSS, ortak UI ve sektör motorları dosyaya gömülür.
- Harici CDN, script veya stil bağlantısı yoktur.
- Senaryo, tablo, CSV, rapor, takip, portföy ve yerel kayıt korunur.
- Üretim komutu: `npm run build:standalone`

Ayrıntılar: `docs/STANDALONE_HTML_OUTPUTS.md`.

## Aktif sektörler

Sekiz sektör ailesinin tamamı v2 profil derinliğindedir:

1. Kafe / Restoran
2. E-Ticaret / Pazaryeri
3. Güzellik / Kuaför / Bakım
4. Ajans / Freelancer / Danışmanlık
5. SaaS / Abonelik
6. Fiziksel Perakende
7. Oto Hizmetleri
8. Oyun / Dijital Yayıncılık

Profil geçişleri:

- `v0.18.0`: Oto Hizmetleri — 8 profil
- `v0.17.0`: Fiziksel Perakende — 7 profil
- `v0.16.0`: SaaS / Abonelik — 8 profil
- `v0.15.0`: Ajans / Freelancer / Danışmanlık — 10 profil
- `v0.14.0`: Güzellik / Kuaför / Bakım — 8 profil
- `v0.13.0`: E-Ticaret / Pazaryeri — 10 profil
- `v0.12.0`: Kafe / Restoran — 11 profil
- `v0.11.0`: Oyun / Dijital Yayıncılık — 6 profil ve Steam master golden koruması

## Yerel çalıştırma

```bash
npm ci
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test ve üretim

```bash
npm test
npm run check
npm run build:standalone
npm run build:production
npm run test:e2e
```

Tam yayın kontrolü:

```bash
npm run verify:release
```

Güncel paket:

- **232/232 birim ve entegrasyon testi**
- bütün JavaScript kaynak modüllerinin içe aktarım kontrolü
- sekiz bağımsız HTML’nin deterministik üretimi
- `dist/` üretim artefaktı
- Chromium masaüstü ve mobil E2E matrisi
- ciddi/kritik WCAG A/AA ihlali bulunmayan axe denetimi

## Yayın

`.github/workflows/deploy-pages.yml` yalnız `main` dalına push veya elle çalıştırma ile devreye girer. Test, production build ve `dist/` Chromium doğrulaması geçmeden GitHub Pages dağıtımı yapılmaz.

Depo Pages ayarlarında yayın kaynağı olarak **GitHub Actions** seçilmelidir. Taslak PR production ortamına dağıtılmaz.

## İlkeler

- Her sektör kendi ekonomik yapısına göre uyarlanır.
- Steam’e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Gerçekleşen takipte boş alanlar otomatik sıfır kabul edilmez.
- Tedarikçi vadesi maliyeti silmez; ödeme zamanını değiştirir.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Rapor, takip ve portföy görünümü yatırım tavsiyesi değildir.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite ve işletme içi takip içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
