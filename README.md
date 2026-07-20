# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.13.0 — E-Ticaret / Pazaryeri v2 iş türü profilleri

E-Ticaret / Pazaryeri sektörü artık on ayrı iş türü profiliyle çalışır:

1. Trendyol mağazası
2. Hepsiburada mağazası
3. Amazon Türkiye
4. Amazon global
5. Shopify mağazası
6. Stoklu e-ticaret
7. Dropshipping
8. Instagram satış
9. El yapımı ürün satışı
10. Abonelik kutusu

Profiller yalnız etiket değildir. Trendyol, Hepsiburada, Amazon Türkiye ve stoklu e-ticaret satış adediyle; Amazon global, Shopify ve dropshipping trafik × dönüşüm × sipariş başı ürünle; Instagram talep × dönüşümle; el yapımı ürün üretim kapasitesiyle; abonelik kutusu aktif aboneyle hesaplanır.

E-ticaret v2 ayrıca şunları içerir:

- düzenlenebilir satış kanalı tablosu
- kanal bazlı fiyat çarpanı, komisyon, ödeme kesintisi, kargo, paketleme ve tahsilat vadesi
- düzenlenebilir ürün / kategori karması
- ürün bazlı fiyat çarpanı, birim maliyet ve iade oranı
- düzenlenebilir reklam kanalı tablosu, ROAS ve edinme maliyeti
- stok kapsamı, yeniden sipariş noktası, güvenlik stoğu ve stok devir hızı
- Amazon global sınır ötesi maliyet, dropshipping tedarikçi kalite kaybı, el yapımı birim emek maliyeti ve abonelik kutusu kayıp oranı
- profile özgü kapasite, başabaş, KPI ve uyarılar
- amortismanın P&L gideri; yatırımın nakit çıkışı olarak ayrılması
- finansmanın P&L dışında tutulması
- P&L hibe geliri ile hibe nakit girişinin ayrı izlenmesi

Eski Trendyol varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/ECOMMERCE_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.12.0`: Kafe / Restoran — on bir iş türü profili
- `v0.11.0`: Oyun / Dijital Yayıncılık — altı iş türü profili ve Steam master golden koruması
- `v0.10.1`: UTF-8, gerçek HTML kabuğu ve smoke test düzeltmeleri

## Aktif sektörler

1. Kafe / Restoran — v2 profil derinliği
2. E-Ticaret / Pazaryeri — v2 profil derinliği
3. Güzellik / Kuaför / Bakım — temel model
4. Ajans / Freelancer / Danışmanlık — temel model
5. SaaS / Abonelik — temel model
6. Fiziksel Perakende — temel model
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

## Geçiş durumu

Oyun / Dijital Yayıncılık, Kafe / Restoran ve E-Ticaret / Pazaryeri kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör Güzellik / Kuaför / Bakım olacaktır.

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

Güncel paket: 137/137 test ve JavaScript sözdizimi kontrolü başarılı.

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
