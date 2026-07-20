# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.16.0 — SaaS / Abonelik v2 profilleri

SaaS sektörü artık sekiz ayrı iş türü profiliyle çalışır:

1. B2B SaaS
2. B2C abonelik
3. Mikro SaaS
4. API / kullanım bazlı servis
5. Mobil uygulama aboneliği
6. Üyelik / içerik platformu
7. Freemium SaaS
8. Kurumsal lisans

Profiller yalnız etiket değildir:

- B2B, B2C, mikro SaaS, mobil ve üyelik: ücretli müşteri / abone hareketi
- API: müşteri × kullanım birimi × birim fiyat
- Freemium: ücretsiz kullanıcı, ücretliye dönüşüm ve ücretsiz kullanıcı maliyeti
- Kurumsal lisans: müşteri × yıllık sözleşme / 12 + onboarding geliri

SaaS v2 ayrıca şunları içerir:

- düzenlenebilir paket / plan karması
- aylık ve yıllık faturalama payı ile yıllık indirim
- yıllık peşin tahsilatın P&L'yi değiştirmeden nakit zamanlamasını öne çekmesi
- deneme dönüşümü, yeniden aktivasyon ve freemium dönüşümü
- churn, expansion ve contraction MRR
- GRR ve NRR
- API kullanım maliyeti
- App Store / platform komisyonu
- içerik ve topluluk yönetimi giderleri
- destek / müşteri başarı kapasitesi
- profile özgü başabaş, KPI, uyarı ve nakit kolonları
- finansmanın P&L dışında tutulması
- faaliyet hibesi ile tek seferlik hibe nakit girişinin ayrı izlenmesi

Eski B2B SaaS varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/SAAS_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.15.0`: Ajans / Freelancer / Danışmanlık — on iş türü profili
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
5. SaaS / Abonelik — v2 profil derinliği
6. Fiziksel Perakende — temel model
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

## Geçiş durumu

Altı sektör ailesi kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör Fiziksel Perakende olacaktır.

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

Güncel paket: 176/176 test ve otomatik kaynak modülü kontrolü başarılı.

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Yıllık peşin tahsilat aylık geliri yapay biçimde şişirmez.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
