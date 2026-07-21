# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.19.0 — Bağımsız tek HTML çıktıları

Aşama 6 tamamlandı. Sekiz sektörün her biri ana platformdan bağımsız açılabilen tek HTML dosyası olarak üretilebilir.

- CSS, ortak UI ve sektör motoru dosyanın içine gömülür.
- Harici CDN, JavaScript veya stil dosyası kullanılmaz.
- Senaryo, tablo, CSV, yazdırma, KPI, uyarı ve 12 aylık nakit görünümü korunur.
- Çıktılar aynı sektör motorlarını kullanır; ayrı formül kopyası içermez.
- Üretim komutu: `npm run build:standalone`
- Dosyalar `standalone/` altında oluşur ve CI tarafından `standalone-html` artefaktı olarak yayımlanır.

Ayrıntılar: `docs/STANDALONE_HTML_OUTPUTS.md`.

## v0.18.0 — Oto Hizmetleri v2 profilleri

Oto Hizmetleri artık sekiz ayrı iş türü profiliyle çalışır:

1. Oto yıkama
2. Oto kuaför
3. Detaylı temizlik
4. Lastikçi
5. Cam filmi / kaplama
6. Küçük bakım / servis
7. Kaporta / boya
8. Mobil oto servis

Profiller yalnız etiket değildir:

- Oto yıkama: günlük talep × hizmete dönüşüm
- Randevulu işler: planlanan randevu × gerçekleşme oranı
- Kaporta / boya: aylık planlanan iş
- Mobil servis: ekip × günlük servis rotası
- İsteğe bağlı müşteri tabanı: aktif müşteri × tekrar ziyaret + yeni müşteri işi

Oto v2 ayrıca şunları içerir:

- düzenlenebilir hizmet / iş karması
- hizmet bazlı fiyat, süre, sarf, enerji, parça ve tekrar işçilik
- istasyon/lift kapasitesi ile personel üretken kapasitesinin karşılaştırılması
- randevuya gelmeme, iptal ve kapora tahsilatı
- düzenlenebilir personel rolleri
- parça/sarf stok kapsamı, hedef stok, yeniden sipariş noktası ve işletme sermayesi açığı
- düzenlenebilir tedarikçi vadesi, teslim süresi ve alım indirimi
- taşeron iş geliri, maliyeti ve katkı marjı
- profile özgü başabaş, KPI, uyarı ve nakit kolonları
- finansman ile faaliyet hibesi ayrımı
- ekipman amortismanının P&L–nakit ayrımı

Eski Oto Yıkama varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/AUTO_SERVICE_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.17.0`: Fiziksel Perakende — yedi iş türü profili
- `v0.16.0`: SaaS / Abonelik — sekiz iş türü profili
- `v0.15.0`: Ajans / Freelancer / Danışmanlık — on iş türü profili
- `v0.14.0`: Güzellik / Kuaför / Bakım — sekiz iş türü profili
- `v0.13.0`: E-Ticaret / Pazaryeri — on iş türü profili
- `v0.12.0`: Kafe / Restoran — on bir iş türü profili
- `v0.11.0`: Oyun / Dijital Yayıncılık — altı iş türü profili ve Steam master golden koruması
- `v0.10.1`: UTF-8, gerçek HTML kabuğu ve smoke test düzeltmeleri

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

## Çalıştırma

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test

```bash
npm test
npm run check
```

Güncel paket: **201/201 test** ve otomatik kaynak modülü kontrolü başarılı.

## Sıradaki aşama

Aşama 7 — Rapor katmanı: sektör sonuçlarını yönetici özeti, risk/varsayım tablosu ve paylaşılabilir çıktı yapısına dönüştürmek. Sonrasında gerçek takip modu ele alınacaktır.

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Tedarikçi vadesi maliyeti silmez; ödeme zamanını değiştirir.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
