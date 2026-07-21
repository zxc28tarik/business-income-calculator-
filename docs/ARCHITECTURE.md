# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: korunan Steam master motoru
- `src/core/sector-schema.js`: alan, tablo ve koşullu görünürlük sözleşmesi
- `src/sectors/`: sektöre ve iş türüne özel talep, gelir, kapasite, maliyet ve sunum motorları
- `src/ui/`: ortak form ve sonuç görünümü
- `src/report/`: ortak rapor modeli ve paylaşılabilir belge üretimi
- `src/sectors/registry.js`: aktif sektör listesi

## Profil katmanı ilkesi

Profil katmanı ortak UI veya finans yardımcılarını kopyalamaz. İş türünün gelir/talep sürücüsünü, kapasitesini, varsayımlarını, KPI ve uyarılarını sektör motoruna verir. Sektör motoru P&L, başabaş ve nakit akışını üretir.

## Tamamlanan v2 sektörleri

- Oyun / Dijital Yayıncılık
- Kafe / Restoran
- E-Ticaret / Pazaryeri
- Güzellik / Kuaför / Bakım
- Ajans / Freelancer / Danışmanlık
- SaaS / Abonelik
- Fiziksel Perakende
- Oto Hizmetleri

Sekiz sektör ailesinin tamamı kendi ekonomik sürücüleri, başabaş, KPI, uyarı ve nakit sözleşmesiyle v2 derinliğindedir.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil sektörleri ayrıca `businessProfiles` ve `applyBusinessType` sunabilir. UI ve rapor katmanı sektör formüllerini bilmez.

## Bağımsız HTML paketleme katmanı

- `src/standalone-runtime.js`: tek sektör durumu, form olayları, sonuç renderı, CSV, rapor ve yerel kayıt
- `scripts/build-standalone.mjs`: bağımlılık grafiği, CSS gömme ve çevrimdışı Blob modül paketi
- `tests/standalone-build.test.mjs`: sekiz çıktı, harici kaynak yasağı, boyut ve deterministik üretim

Bu katman finans formülü içermez; doğrudan mevcut sektör sözleşmesini paketler.

## Finansal rapor katmanı

- `src/report/report-model.js`: aktif sektör sonucundan ortak rapor modeli üretir
- `src/report/report-document.js`: rapor modelini çevrimdışı, yazdırılabilir tek HTML belgeye dönüştürür
- `src/report/report-controller.js`: ana platform ve bağımsız hesaplayıcıların ortak dışa aktarma girişidir
- `tests/report-layer.test.mjs`: sekiz sektör, görünür varsayım, risk sınıflandırması, bağımsız HTML ve kaçış güvenliği testleri

Rapor modelinin kaynakları:

1. aktif senaryonun normalize edilmiş girdileri
2. sektörün `calculateModel` sonucu
3. sektörün `buildPresentation` KPI ve senaryo metrikleri
4. sektörün kendi uyarıları
5. form şemasındaki görünür bölüm, alan ve tablolar
6. sektörün nakit akışı kolonları

Rapor katmanı finansal sonucu yeniden hesaplamaz. Dengeli, koşullu ve riskli görünüm yalnız mevcut kâr, nakit ve uyarı sonuçlarını sınıflandırır; yatırım tavsiyesi değildir.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L faaliyet hibesi ile tek seferlik hibe nakit girişi ayrıdır.
- Ürün, parça, sarf, enerji, kullanım, tekrar işçilik ve taşeron dönemsel P&L gideridir.
- Tedarikçi vadesi maliyeti silmez; nakit ödeme zamanını değiştirir.
- Ekipman ve ilk stok yatırımı kurulum nakdinde bir kez gösterilir.
- Amortisman yalnız P&L gideridir ve nakitten ikinci kez düşülmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- Steam kaynak hash ve golden testleri
- gerçek HTML smoke testi
- eski sektör sonucu koruma testleri
- alt iş türü, tablo, senaryo, P&L/nakit ve kapasite testleri
- sekiz bağımsız HTML için üretim ve deterministik paketleme testleri
- sekiz sektör için ortak rapor sözleşmesi ve belge güvenliği testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin içe aktarım kontrolü

## Sonraki aşama

Aşama 8 gerçek takip modudur. Tahmin ile gerçekleşen dönem kayıtları birbirinden ayrılacak; bütçe-gerçekleşen farkı, sapma nedenleri, dönem trendi ve rapor karşılaştırması kurulacaktır. Finans motorları değişmeden kalacaktır.
