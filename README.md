# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve 12 aylık nakit akışı hesaplayıcıları platformu.

## v0.6 kapsamı

### Kafe / Restoran
- 11 iş türü
- Günlük müşteri × ortalama fiş × açık gün ciro modeli
- KDV, paket servis ve POS komisyonları
- Malzeme, fire, paketleme, sabit gider ve kurulum maliyeti
- Franchise / ortak payı ve günlük başabaş müşteri

### E-Ticaret / Pazaryeri
- 10 iş türü
- Satış adedi × ürün fiyatı ve indirim modeli
- Pazaryeri, ödeme, kargo, paketleme, iade ve fulfillment
- Reklam sonrası kâr, ROAS, stok nakit ihtiyacı ve başabaş satış adedi

### Güzellik / Kuaför / Bakım
- 8 iş türü
- Randevu kapasitesi, doluluk ve no-show
- Seans sarfı, çalışan primi, cihaz yatırımı ve amortisman
- Günlük başabaş randevu ve cihaz geri dönüşü

### Ajans / Freelancer / Danışmanlık
- 10 iş türü
- Proje geliri, baz üretim saati ve revizyon saati
- Ekip kapasitesi, freelancer ödemesi, proje ve saat başı net kâr
- Tahsilat vadesi ve müşteri yoğunlaşması riski

### SaaS / Abonelik
- 6 iş türü
- Ay başı abone + yeni kazanım − churn modeli
- MRR, ARR, CAC, LTV, LTV/CAC ve CAC geri ödeme süresi
- Abone başı altyapı maliyeti ve başabaş abone sayısı
- 12 aylık abone gelişimi ile nakit akışı

### Fiziksel Perakende
- 7 iş türü: butik, pet shop, telefon aksesuar, kırtasiye, oyuncak, çiçekçi ve küçük market
- Günlük müşteri × ortalama sepet × açık gün satış modeli
- Ortalama ürün satış fiyatı ve ürün maliyeti
- İade, fire/kayıp ve POS komisyonu
- Ürün başı net kâr, stok devir hızı ve stok kapsamı
- Kira/ciro oranı, günlük başabaş müşteri ve ilk stok nakit ihtiyacı
- İlk stok yatırımının P&L’den ayrı tutulduğu 12 aylık nakit akışı

### Ortak platform özellikleri
- Kötümser, beklenen ve iyimser senaryolar
- Her senaryo için bağımsız kaydedilen girdiler
- Kural tabanlı uyarılar
- KPI, “kim ne alıyor?”, şelale ve ayrıntılı döküm panelleri
- 12 aylık nakit akışı
- Finansman, hibe/destek ve operasyonel gelir ayrımı
- Tahsilat ve tedarikçi ödeme vadesi
- Nakit dışı sabit gider desteği
- CSV/Excel uyumlu dışa aktarım ve tarayıcı PDF çıktısı
- Sektör şeması, registry ve GitHub Actions doğrulaması

## Çalıştırma

Bağımlılıksız statik web uygulamasıdır:

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test

Node.js 20 veya üzeri gerekir.

```bash
npm test
npm run check
```

v0.6 test paketi ortak finans, şema, uygulama açılışı ve altı sektörün özel kabul testlerini kapsar.

## Mimari

- `src/core/finance-engine.js`: Ortak vergi, komisyon, paydaş, başabaş, nakit ve şelale motoru.
- `src/core/sector-schema.js`: Sektör tanımı doğrulama ve form alanı yardımcıları.
- `src/sectors/registry.js`: Aktif sektör listesi.
- `src/sectors/cafe-restaurant.js`: Kafe/restoran modeli.
- `src/sectors/ecommerce.js`: E-ticaret/pazaryeri modeli.
- `src/sectors/beauty.js`: Güzellik/kuaför/bakım modeli.
- `src/sectors/agency.js`: Ajans/freelancer/danışmanlık modeli.
- `src/sectors/saas.js`: SaaS/abonelik ve birim ekonomisi modeli.
- `src/sectors/retail.js`: Fiziksel perakende, stok ve mağaza ekonomisi modeli.
- `src/app.js`: Sektörden bağımsız form ve sonuç arayüzü.

## Finansal model ilkeleri

- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Hibe/destek nakit akışında ayrı gösterilir; vergi etkisi otomatik varsayılmaz.
- Net kâr ve nakit akışı ayrı hesaplanır.
- Tahsilat vadesi kârı değiştirmez; tahsilat zamanını değiştirir.
- İlk stok yatırımı kurulum nakit çıkışıdır; satılan ürün maliyeti aylık P&L’de ayrıca hesaplanır.
- Stok devir hızı, yıllık satılan ürün maliyetinin ilk stok yatırımına oranıdır.
- Vergi yalnız pozitif vergi öncesi kâr üzerinden ön tahmin olarak hesaplanır.
- Kurulum maliyeti seçilen ayda nakitten bir kez düşer.
- Amortisman P&L gideridir fakat aynı yatırım nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

Bu proje **GNU Affero General Public License v3.0 (AGPL-3.0)** ile yayımlanır.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Vergi, stok değerleme, amortisman, hibe ve muhasebe uygulamaları kullanıcı tarafından mali müşavirle teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. Ayrıntılar için `LICENSE` dosyasına bakın.
