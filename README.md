# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.12.0 — Kafe / Restoran v2 iş türü profilleri

Kafe / Restoran sektörü artık on bir ayrı iş türü profiliyle çalışır:

1. Kafe
2. Restoran
3. Kahveci
4. Kahve kiosk
5. Tatlıcı / pastane
6. Burgerci
7. Dönerci
8. Tostçu / büfe
9. Dark kitchen
10. Food truck
11. Franchise restoran

Profiller yalnız etiket değildir. Restoran koltuk, masa devri ve dolulukla; kiosk saatlik sipariş ve servis saatiyle; dark kitchen günlük paket siparişiyle; food truck etkinlik ve etkinlik başı müşteriyle hesaplanır.

Kafe v2 ayrıca şunları içerir:

- düzenlenebilir satış kanalı karması
- düzenlenebilir ürün / kategori karması
- kanal bazlı fiş çarpanı, komisyon ve paketleme
- kategori bazlı malzeme ve fire oranı
- profile özgü kapasite, başabaş, KPI ve uyarılar
- kurulum yatırımı ile amortismanın P&L / nakit ayrımı
- finansmanın P&L dışı tutulması
- hibe / desteğin P&L geliri ve nakit girişi olarak ayrı alanlarda izlenmesi

Eski Kafe varsayılan finans sonucu golden testle korunur. Ayrıntılar: `docs/CAFE_BUSINESS_TYPE_PROFILES.md`.

## v0.11.0 — Oyun ve dijital yayıncılık profilleri

Steam yayıncısı, indie kendi yayınlama, mobil oyun, DLC, dijital ürün ve publisher–developer paylaşımı ayrı profil sürücülerine sahiptir. Steam master golden sonucu korunur.

## Aktif sektörler

1. Kafe / Restoran — v2 profil derinliği
2. E-Ticaret / Pazaryeri — temel model
3. Güzellik / Kuaför / Bakım — temel model
4. Ajans / Freelancer / Danışmanlık — temel model
5. SaaS / Abonelik — temel model
6. Fiziksel Perakende — temel model
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

## Geçiş durumu

Oyun / Dijital Yayıncılık ve Kafe / Restoran kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör E-Ticaret / Pazaryeri olacaktır.

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
