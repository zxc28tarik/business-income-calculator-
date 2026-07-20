# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.17.0 — Fiziksel Perakende v2 profilleri

Fiziksel Perakende sektörü artık yedi ayrı iş türü profiliyle çalışır:

1. Butik mağaza
2. Pet shop
3. Telefon aksesuar mağazası
4. Kırtasiye
5. Oyuncak mağazası
6. Çiçekçi
7. Küçük market

Profiller yalnız etiket değildir:

- Butik, telefon aksesuarı, kırtasiye ve oyuncak: mağaza trafiği × dönüşüm
- Pet shop: aktif müşteri tabanı × aylık alışveriş sıklığı
- Çiçekçi: günlük standart sipariş + düğün/etkinlik siparişi
- Küçük market: saatlik kasa işlemi × günlük açık saat

Perakende v2 ayrıca şunları içerir:

- düzenlenebilir ürün / kategori karması
- kategori bazlı fiyat, maliyet, iade, iskonto ve bozulma/fire
- düzenlenebilir tedarikçi karması
- tedarikçi bazlı vade, teslim süresi, alım indirimi ve asgari sipariş
- stok kapsam günü, hedef stok ve yeniden sipariş noktası
- stok işletme sermayesi açığı ve fazla stok maliyeti
- mağaza işlem kapasitesi ve profile özgü başabaş
- amortismanın P&L gideri olarak, nakitten ayrı izlenmesi
- finansman ile faaliyet hibesi ayrımı
- perakendeye özel KPI, uyarı, senaryo ve nakit kolonları

Eski Butik mağaza varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/RETAIL_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.16.0`: SaaS / Abonelik — sekiz iş türü profili
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
6. Fiziksel Perakende — v2 profil derinliği
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

Yedi sektör ailesi kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör Oto Hizmetleri olacaktır.

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

Güncel paket: **190/190 test** ve otomatik kaynak modülü kontrolü başarılı.

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- İlk stok yatırımı nakitte bir kez gösterilir; satılan ürün maliyeti dönemsel P&L gideridir.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
