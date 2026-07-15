# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve nakit akışı hesaplayıcıları platformu.

## v0.7 kapsamı

### Kafe / Restoran

- Günlük müşteri × ortalama fiş × açık gün ciro modeli
- KDV, paket servis ve POS komisyonları
- Malzeme, fire, paketleme, sabit gider ve kurulum maliyeti
- Franchise/ortak payı ve günlük başabaş müşteri

### E-Ticaret / Pazaryeri

- Satış adedi × ürün fiyatı ve indirim modeli
- Pazaryeri/ödeme komisyonları, iade, kargo, paketleme ve fulfillment
- Reklam sonrası kâr, ürün başı net kâr, stok ihtiyacı ve başabaş satış

### Güzellik / Kuaför / Bakım

- Randevu kapasitesi, doluluk ve no-show
- Seans başı sarf, çalışan primi ve personel maliyet yükü
- Günlük başabaş randevu, cihaz yatırımı ve amortisman

### Ajans / Freelancer / Danışmanlık

- Proje sayısı × proje bedeli
- Üretim ve revizyon saatleri, ekip kapasitesi ve taşeron ödemeleri
- Proje/saat başı kâr, kişi başı ciro ve tahsilat vadesi

### SaaS / Abonelik

- Abone hareketi, MRR, ARR ve churn
- CAC, LTV, LTV/CAC ve CAC geri ödeme süresi
- Başabaş abone ve 12 aylık abone-nakit gelişimi

### Fiziksel Perakende

- Günlük müşteri × ortalama sepet
- Ürün maliyeti, iade, fire/kayıp, POS ve stok yatırımı
- Ürün başı net kâr, stok devir hızı ve günlük başabaş müşteri

### Oto Hizmetleri

- 6 iş türü: oto yıkama, oto kuaför, detaylı temizlik, lastikçi, cam filmi/kaplama ve küçük servis
- Günlük araç × hizmet fiyatı × açık gün gelir modeli
- Hizmet ve parça/ürün gelirinin ayrı izlenmesi
- İstasyon, çalışma saati ve hizmet süresinden kapasite hesabı
- Araç başı sarf, su/elektrik ve parça maliyeti
- Araç başı net kâr, günlük başabaş araç ve kapasite kullanımı
- Ekipman yatırımı, amortisman ve yaklaşık geri dönüş süresi

### Ortak platform özellikleri

- Kötümser, beklenen ve iyimser senaryolar
- Her senaryo için bağımsız kaydedilen girdiler
- Kural tabanlı uyarılar
- KPI kartları, “kim ne alıyor?” paneli, şelale ve ayrıntılı döküm
- 12 aylık nakit akışı
- Finansman, hibe/destek ve operasyonel gelir ayrımı
- Tahsilat ve tedarikçi ödeme vadesi
- Nakit dışı sabit gider desteği
- CSV/Excel uyumlu dışa aktarım ve tarayıcı yazdırma ile PDF
- Sektör tanımı şeması ve registry sistemi
- GitHub Actions ile otomatik test ve sözdizimi doğrulaması

## Çalıştırma

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

v0.7 test paketi ortak finans, şema, uygulama açılışı ve yedi sektörün özel kabul testlerini kapsar.

## Mimari

- `src/core/finance-engine.js`: Ortak vergi, komisyon, paydaş, başabaş, nakit ve şelale motoru.
- `src/core/sector-schema.js`: Sektör tanımı doğrulama ve form alanı yardımcıları.
- `src/sectors/registry.js`: Aktif sektör listesi.
- `src/sectors/*-config.js`: Sektör girdileri, senaryolar ve formlar.
- `src/sectors/*-core.js`: Sektör hesap motorları.
- `src/sectors/*-presentation.js`: KPI ve ayrıntılı çıktı modelleri.
- `src/app.js`: Sektörden bağımsız arayüz, kayıt, CSV ve yazdırma katmanı.

## Finansal model ilkeleri

- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Hibe/destek nakit akışında ayrı gösterilir; vergi etkisi otomatik varsayılmaz.
- Net kâr ve nakit akışı ayrı hesaplanır.
- Tahsilat ve tedarikçi vadeleri kârı değil nakit zamanlamasını değiştirir.
- Kurulum ve ilk stok/ekipman yatırımları seçilen ayda nakitten bir kez düşer.
- Amortisman P&L gideridir fakat aynı yatırım nakitten ikinci kez düşülmez.
- Vergi yalnız pozitif vergi öncesi kâr üzerinden ön tahmin olarak hesaplanır.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

Bu proje **GNU Affero General Public License v3.0 (AGPL-3.0)** ile yayımlanır.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Vergi, amortisman, hibe ve muhasebe uygulamaları kullanıcı tarafından uzmanlarla teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. Ayrıntılar için `LICENSE` dosyasına bakın.
