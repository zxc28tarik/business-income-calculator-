# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve nakit akışı hesaplayıcıları platformu.

## v0.9 kaynak uyumu — 2. adım

Sektör form şeması, Steam Yayıncısı master modelindeki karmaşık girdileri ve ileride her sektörün kendi iş koluna özgü ayrıntılarını eksiltmeden ifade edebilecek biçimde genişletildi.

- `boolean`: checkbox ve açık/kapalı iş kuralları
- `text`: serbest metin ve satır adları
- `table`: eklenip silinebilen; metin, sayı, oran, seçim ve checkbox sütunları taşıyan düzenlenebilir tablolar
- `visibleWhen`: alan ve panel seviyesinde koşullu görünürlük
- derin senaryo kopyalama: iç içe tablo satırları senaryolar arasında paylaşılmaz
- `cashFlowColumns`: sektöre özel nakit tablosu kolonları
- arayüzde tablo satırı ekleme/silme, hücre güncelleme ve koşullu görünürlük
- CSV dışa aktarımında sektörün kendi nakit kolonlarının kullanılması

Arayüz kodu `src/ui/form-view.js`, `src/ui/results-view.js` ve `src/ui/formatters.js` olarak ayrıldı. Mevcut yedi sektörün hesap modelleri değiştirilmedi.

Doğrulama: **103/103 test** ve JavaScript sözdizimi kontrolü geçti.

## v0.8 kaynak uyumu — 1. adım

Steam Yayıncı Finansal Fizibilite & Net Kâr Hesaplayıcı v2 master prototipi artık yalnız arşivlenmiş bir referans değil; hesap zinciri kaynak sonuçlarını koruyan saf modüllere çıkarılmıştır.

- `src/core/master-finance-engine-v2.js`: kur, vergi, kademeli komisyon, stopaj, tahsilat, recoup, geliştirici settlement, yayıncı P&L, vergi, temettü ve nakit akışı
- `src/sectors/steam-publisher-config.js`: master varsayımları, 6 oyun/dijital yayıncılık iş türü ve üç senaryo
- `src/sectors/steam-publisher-core.js`: kaynak sektör modeli, uyarılar, şelale ve senaryo karşılaştırması
- `tests/master-finance-engine-v2.test.mjs`: üç senaryonun golden sonuçları ve kaynak finans kuralları

Yeni v2 motor mevcut sade motorun üzerine yazılmadı. Çalışan yedi sektör korunuyor; şema genişletildikten sonra sektörler kendi iş yapılarına uygun biçimde v2 derinliğine taşınacak.

## v0.7 sektör kapsamı

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
- Gelişmiş sektör tanımı şeması ve registry sistemi
- GitHub Actions ile otomatik test, test çıktısı artefaktı ve sözdizimi doğrulaması

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

Test paketi ortak finans, kaynak master koruması, v2 golden sonuçları, gelişmiş şema, uygulama açılışı ve yedi aktif sektörün özel kabul testlerini kapsar.

## Mimari

- `src/core/finance-engine.js`: Çalışan sektörlerin mevcut ortak vergi, komisyon, paydaş, başabaş, nakit ve şelale motoru.
- `src/core/master-finance-engine-v2.js`: Steam masterdan çıkarılan kaynak uyumlu zengin finans motoru.
- `src/core/sector-schema.js`: Sayı, oran, seçim, metin, checkbox, tablo, görünürlük ve senaryo kopyalama şeması.
- `src/ui/form-view.js`: Sektörden bağımsız gelişmiş form ve düzenlenebilir tablo arayüzü.
- `src/ui/results-view.js`: KPI, şelale, senaryo, nakit ve döküm arayüzü.
- `src/ui/formatters.js`: Ortak görüntüleme ve CSV biçimlendirmesi.
- `src/sectors/steam-publisher-*`: Oyun/dijital yayıncılık kaynak modeli; eksiksiz form tanımı tamamlanana kadar registry dışında tutulur.
- `src/sectors/registry.js`: Aktif sektör listesi.
- `src/sectors/*-config.js`: Sektör girdileri, senaryolar ve formlar.
- `src/sectors/*-core.js`: Sektör hesap motorları.
- `src/sectors/*-presentation.js`: KPI ve ayrıntılı çıktı modelleri.
- `src/app.js`: Sektörden bağımsız durum, kayıt, olay ve dışa aktarım denetleyicisi.

## Finansal model ilkeleri

- Her sektör master modelin derinliğine kendi ekonomik yapısıyla uyarlanır; Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Hibe/destek nakit akışında ayrı gösterilir; vergi etkisi otomatik varsayılmaz.
- Net kâr ve nakit akışı ayrı hesaplanır.
- Tahsilat ve tedarikçi vadeleri kârı değil nakit zamanlamasını değiştirir.
- Kurulum ve ilk stok/ekipman yatırımları seçilen ayda nakitten bir kez düşer.
- Amortisman P&L gideridir fakat aynı yatırım nakitten ikinci kez düşülmez.
- Vergi oranları kullanıcı tarafından değiştirilebilir varsayımlardır.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

Bu proje **GNU Affero General Public License v3.0 (AGPL-3.0)** ile yayımlanır.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Vergi, amortisman, hibe ve muhasebe uygulamaları kullanıcı tarafından uzmanlarla teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. Ayrıntılar için `LICENSE` dosyasına bakın.
