# Business Income Calculator

Sektör bazlı finansal fizibilite, 12 aylık nakit akışı, tahmin-gerçekleşen takip ve çoklu işletme/proje portföyü.

## v0.22.0 — Çoklu işletme / proje ve veri taşınabilirliği

Aşama 9 tamamlandı. Ana platform ve sekiz bağımsız hesaplayıcı artık birden fazla adlandırılmış fizibilite kaydı tutar.

- **Kayıt** seçicisiyle işletme/projeler arasında geçiş yapılır.
- **Yeni**, **Adlandır** ve **Kopyala** işlemleri bulunur.
- Her kayıt kendi sektör, senaryo ve bütün form girdilerini taşır.
- Gerçek takip verileri proje kimliğiyle ayrılır; farklı kayıtlar karışmaz.
- Kopyalama ilgili takip verilerini de bağımsız kimlikle çoğaltır.
- Silme yalnız aktif kayıt ve ona ait takip verilerini kaldırır; son kayıt silinemez.
- **Portföy** görünümü sektör, senaryo, brüt gelir, net sonuç, 12 ay sonu nakit ve risk durumunu karşılaştırır.
- Tam JSON yedeği bütün kayıtlar ve projeye ait takip verileriyle dışa aktarılır.
- İçe aktarma şema, sürüm, kapsam, dosya boyutu, proje sayısı ve takip anahtarlarını doğrular.
- Ana platform ile bağımsız sektör yedekleri birbirine yanlışlıkla aktarılamaz.
- En fazla 50 kayıt, 80 karakterlik kayıt adı ve 5 MB yedek sınırı uygulanır.

Ayrıntılar: `docs/MULTI_PROJECT_PORTFOLIO.md`.

## v0.21.0 — Gerçek takip modu

Tahmin bütçesi ile aylık gerçekleşen sonuçlar ayrı saklanır ve karşılaştırılır.

- Aylık tahsilat, gider, vergi, finansman, destek, kurulum, kredi, dönem sonu nakit ve hacim kaydı
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
- Senaryo, tablo, CSV, rapor, takip ve yerel kayıt korunur.
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

Önceki profil geçişleri:

- `v0.18.0`: Oto Hizmetleri — 8 profil
- `v0.17.0`: Fiziksel Perakende — 7 profil
- `v0.16.0`: SaaS / Abonelik — 8 profil
- `v0.15.0`: Ajans / Freelancer / Danışmanlık — 10 profil
- `v0.14.0`: Güzellik / Kuaför / Bakım — 8 profil
- `v0.13.0`: E-Ticaret / Pazaryeri — 10 profil
- `v0.12.0`: Kafe / Restoran — 11 profil
- `v0.11.0`: Oyun / Dijital Yayıncılık — 6 profil ve Steam master golden koruması

## Çalıştırma

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test ve üretim

```bash
npm test
npm run check
npm run build:standalone
```

Güncel paket: **222/222 test**, otomatik kaynak modülü kontrolü ve sekiz bağımsız HTML üretimi başarılı.

## Sıradaki aşama

Aşama 10 — Yayınlama ve son kalite: gerçek tarayıcı uçtan uca testleri, mobil/erişilebilirlik denetimi, veri migrasyonu sağlamlaştırması, production dağıtımı ve sürümleme.

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
