# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve nakit akışı hesaplayıcıları platformu.

## v0.4 kapsamı

### Kafe / Restoran

- 11 iş türü
- Günlük müşteri × ortalama fiş × açık gün ciro modeli
- KDV, paket servis ve POS komisyonları
- Malzeme, fire, paketleme, sabit gider ve kurulum maliyeti
- Franchise / ortak payı
- Günlük başabaş müşteri ve kira/ciro KPI’ları

### E-Ticaret / Pazaryeri

- 10 iş türü
- Satış adedi × ürün fiyatı ve indirim modeli
- Pazaryeri / ödeme komisyonları
- İade, iade kargo, kargo, paketleme ve fulfillment
- Reklam sonrası kâr ve ROAS
- Ürün başı net kâr, stok nakit ihtiyacı ve başabaş satış adedi

### Güzellik / Kuaför / Bakım

- 8 iş türü
- Randevu kapasitesi, doluluk ve no-show etkisi
- Seans başı sarf, çalışan primi ve personel maliyet yükü
- Günlük başabaş randevu ve başabaş doluluk
- Cihaz yatırımı, amortisman ve yaklaşık cihaz geri dönüşü

### Ajans / Freelancer / Danışmanlık

- 10 iş türü: yazılım, sosyal medya, reklam, tasarım, danışmanlık, freelancer, video/editing, SEO ve performans reklam
- Proje sayısı × ortalama proje bedeli ciro modeli
- Baz üretim saati ve revizyon saatinin ayrı maliyetlenmesi
- Ekip kapasitesi, hedef faturalandırılabilir kapasite ve aşırı yük kontrolü
- Freelancer/taşeron ödemeleri
- Aracı platform ve ödeme komisyonları
- Proje başı ve saatlik net kâr
- Kişi başı ciro ve başabaş proje sayısı
- Tahsilat vadesinin P&L’den ayrı olarak nakit akışına yansıması
- Müşteri yoğunlaşması, revizyon maliyeti ve saatlik fiyat uyarıları

### Ortak platform özellikleri

- Kötümser, beklenen ve iyimser senaryolar
- Her senaryo için bağımsız kaydedilen girdiler
- Kural tabanlı uyarılar
- KPI kartları ve “kim ne alıyor?” paneli
- Şelale ve ayrıntılı döküm
- 12 aylık nakit akışı
- Finansman, hibe/destek ve operasyonel gelir ayrımı
- Tahsilat ve tedarikçi ödeme vadesi
- Nakit dışı sabit gider desteği
- CSV/Excel uyumlu dışa aktarım
- Tarayıcı yazdırma ile PDF çıktısı
- Sektör tanımı şeması ve registry sistemi
- GitHub Actions ile test ve sözdizimi doğrulaması

## Çalıştırma

Bu sürüm bağımlılıksız statik web uygulamasıdır:

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

v0.4 test paketi ortak finans, şema, uygulama açılışı ve dört sektörün özel kabul testlerini kapsar.

## Mimari

- `src/core/finance-engine.js`: Ortak vergi, komisyon, paydaş, başabaş, nakit ve şelale motoru.
- `src/core/sector-schema.js`: Sektör tanımı doğrulama ve form alanı yardımcıları.
- `src/sectors/registry.js`: Aktif sektör listesi.
- `src/sectors/cafe-restaurant.js`: Kafe/restoran modeli.
- `src/sectors/ecommerce.js`: E-ticaret/pazaryeri modeli.
- `src/sectors/beauty.js`: Güzellik/kuaför/bakım modeli.
- `src/sectors/agency.js`: Ajans/freelancer/danışmanlık modeli.
- `src/app.js`: Sektörden bağımsız form ve sonuç arayüzü.

## Finansal model ilkeleri

- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Hibe/destek nakit akışında ayrı gösterilir; vergi etkisi otomatik varsayılmaz.
- Net kâr ve nakit akışı ayrı hesaplanır.
- Tahsilat vadesi kârı değiştirmez; tahsilat zamanını ve işletme sermayesi ihtiyacını değiştirir.
- KDV türü ve örnek vergi oranları düzenlenebilir.
- Vergi yalnız pozitif vergi öncesi kâr üzerinden ön tahmin olarak hesaplanır.
- Kurulum maliyeti seçilen ayda nakitten bir kez düşer.
- Amortisman P&L gideridir fakat aynı yatırım nakit akışından ikinci kez düşülmez.
- Fiyat üstü KDV müşteri ödemesine eklenir; şelalede işletme gelirinden tekrar kesilmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

Bu proje **GNU Affero General Public License v3.0 (AGPL-3.0)** ile yayımlanır. Değiştirilmiş sürümü ağ üzerinden hizmet olarak sunanların, ilgili kaynak kodunu kullanıcılarına AGPL-3.0 koşullarıyla erişilebilir kılması gerekir.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Vergi, amortisman, hibe ve muhasebe uygulamaları kullanıcı tarafından mali müşavirle teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. Proje GNU Affero General Public License v3.0 (AGPL-3.0) ile lisanslanmıştır. Ayrıntılar için `LICENSE` dosyasına bakın.
