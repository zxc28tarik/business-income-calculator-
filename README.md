# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.15.0 — Ajans / Freelancer / Danışmanlık v2 profilleri

Ajans sektörü artık on ayrı iş türü profiliyle çalışır:

1. Yazılım ajansı
2. Sosyal medya ajansı
3. Reklam ajansı
4. Tasarım ajansı
5. Danışmanlık şirketi
6. Freelancer yazılımcı
7. Freelancer tasarımcı
8. Video / editing hizmeti
9. SEO ajansı
10. Performans reklam ajansı

Profiller yalnız etiket değildir:

- Yazılım, tasarım ve video: proje sayısı × proje bedeli
- Sosyal medya ve SEO: retainer müşteri × aylık retainer
- Freelancer: faturalandırılan saat × saatlik satış fiyatı
- Danışmanlık: danışmanlık günü × günlük bedel
- Reklam ajansı: kampanya sayısı × kampanya bedeli
- Performans ajansı: yönetilen reklam bütçesi × yönetim ücreti + performans primi

Ajans v2 ayrıca şunları içerir:

- rol bazlı ekip kapasitesi ve saatlik maliyet tablosu
- teorik, hedef faturalandırılabilir ve kullanılan kapasite ayrımı
- taşeron maliyeti ile taşeron tarafından sağlanan saatin ayrı izlenmesi
- sözleşmeli revizyon, kapsam taşması ve müşteriye yansıtılan revizyon geliri
- peşinat oranına göre etkin tahsilat gecikmesi
- müşteri yoğunlaşması ve tahsilat riski uyarıları
- profile özgü başabaş, KPI ve denetim izi
- finansmanın P&L dışında tutulması
- faaliyet hibesi ile tek seferlik nakit desteğinin ayrı izlenmesi

Eski Yazılım Ajansı varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/AGENCY_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.14.0`: Güzellik / Kuaför / Bakım — sekiz iş türü profili
- `v0.13.0`: E-Ticaret / Pazaryeri — on iş türü profili
- `v0.12.0`: Kafe / Restoran — on bir iş türü profili
- `v0.11.0`: Oyun / Dijital Yayıncılık — altı iş türü profili ve Steam master golden koruması
- `v0.10.1`: UTF-8, gerçek HTML kabuğu ve smoke test düzeltmeleri

## Aktif sektörler

1. Kafe / Restoran — v2 profil derinliği
2. E-Ticaret / Pazaryeri — v2 profil derinliği
3. Güzellik / Kuaför / Bakım — v2 profil derinliği
4. Ajans / Freelancer / Danışmanlık — v2 profil derinliği
5. SaaS / Abonelik — temel model
6. Fiziksel Perakende — temel model
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

## Geçiş durumu

Beş sektör ailesi kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör SaaS / Abonelik olacaktır.

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

Güncel paket: 163/163 test ve otomatik kaynak modülü kontrolü başarılı.

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
