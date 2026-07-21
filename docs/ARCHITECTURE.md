# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: korunan Steam master motoru
- `src/core/sector-schema.js`: alan, tablo ve koşullu görünürlük sözleşmesi
- `src/sectors/`: sektöre ve iş türüne özel talep, gelir, kapasite, maliyet ve sunum motorları
- `src/ui/`: ortak form ve sonuç görünümü
- `src/report/`: fizibilite raporu modeli ve paylaşılabilir belge üretimi
- `src/tracking/`: gerçekleşen kayıt, bütçe sapması, trend ve takip raporu
- `src/portfolio/`: çoklu kayıt, yedek doğrulama ve portföy karşılaştırması
- `src/sectors/registry.js`: aktif sektör listesi

## Sektör ve profil ilkesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil sektörleri ayrıca `businessProfiles` ve `applyBusinessType` sunabilir.

UI, rapor, takip ve portföy katmanları sektör formüllerini bilmez. İş türü ekonomik sürücüsünü sektör motoruna verir; sektör motoru P&L, başabaş ve nakit akışını üretir.

Sekiz sektör ailesinin tamamı v2 profil derinliğindedir:

- Oyun / Dijital Yayıncılık
- Kafe / Restoran
- E-Ticaret / Pazaryeri
- Güzellik / Kuaför / Bakım
- Ajans / Freelancer / Danışmanlık
- SaaS / Abonelik
- Fiziksel Perakende
- Oto Hizmetleri

## Bağımsız HTML paketleme

- `src/standalone-runtime.js`: tek sektör formu, sonuç, CSV, rapor, takip, portföy ve yerel kayıt
- `scripts/build-standalone.mjs`: bağımlılık grafiği, CSS gömme ve çevrimdışı Blob modül paketi
- `tests/standalone-build.test.mjs`: sekiz çıktı, harici kaynak yasağı, boyut ve deterministik üretim

Bu katman finans formülü içermez; seçilen sektörün gerçek kaynak modüllerini dosyaya gömer.

## Finansal rapor katmanı

- `src/report/report-model.js`: aktif sektör sonucundan ortak rapor modeli
- `src/report/report-document.js`: çevrimdışı, yazdırılabilir tek HTML belge
- `src/report/report-controller.js`: ana ve bağımsız uygulamaların ortak dışa aktarma girişi
- `tests/report-layer.test.mjs`: sektör, görünür varsayım, risk, bağımsız HTML ve kaçış güvenliği

Rapor finansal sonucu yeniden hesaplamaz; mevcut kâr, nakit, KPI ve uyarıları sınıflandırır.

## Gerçek takip katmanı

- `src/tracking/tracking-model.js`: kayıt normalizasyonu, plan uyumu, sapma, durum ve trend
- `src/tracking/tracking-controller.js`: proje kapsamlı yerel kayıt, aylık giriş, CSV ve uygulama bağlantısı
- `src/tracking/tracking-report.js`: çevrimdışı tahmin-gerçekleşen raporu
- `tests/tracking-mode.test.mjs`: kayıt, sapma, Steam uyumu, trend ve belge güvenliği

Takip anahtarı `projectId + sectorId + businessType` kapsamındadır. Tahmin aktif senaryonun nakit satırlarından okunur; gerçekleşen kayıt finans motoruna geri yazılmaz.

Ortak sektörlerde `cashFlow.rows`, Oyun / Dijital Yayıncılık master yapısında `cashFlow.months` okunur. Steam alanları yalnız okuma adaptörüyle ortak takip sözleşmesine çevrilir.

## Çoklu kayıt ve portföy katmanı

- `src/portfolio/portfolio-model.js`: proje yaşam döngüsü, sınırlar, yedek şeması ve içe aktarma doğrulaması
- `src/portfolio/portfolio-controller.js`: yerel saklama, kayıt seçimi, kopyalama, silme ve yedek işlemleri
- `src/portfolio/portfolio-summary.js`: aktif sektör/senaryodan ortak finans özeti
- `tests/portfolio-model.test.mjs`: kayıt yaşam döngüsü, limit, backup ve sekiz sektör özeti
- `tests/portfolio-backup-scope.test.mjs`: platform/standalone kapsam ve takip izolasyonu

Portföy durumu:

```text
portfolio
  activeProjectId
  projects[]
    id
    name
    createdAt / updatedAt
    workspace
```

Ana platform projesinin `workspace` alanı sekiz sektörün bütün senaryo girdilerini taşır. Bağımsız HTML projesi yalnız kendi sektörünün senaryolarını taşır.

Takip kayıtları çalışma alanına gömülmez; proje kimlikli ayrı yerel anahtarlarda tutulur. Yedek üretiminde yalnız portföydeki proje kimliklerine ait anahtarlar alınır.

Yedek `scope` alanı ana platform ile bağımsız sektör dosyalarını birbirinden ayırır. İçe aktarma çalışma alanlarını hedef normalizasyonundan geçirir ve yabancı proje takip anahtarlarını reddeder.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L faaliyet hibesi ile tek seferlik hibe nakit girişi ayrıdır.
- Ürün, parça, sarf, enerji, kullanım, tekrar işçilik ve taşeron dönemsel P&L gideridir.
- Tedarikçi vadesi maliyeti silmez; nakit ödeme zamanını değiştirir.
- Ekipman ve ilk stok yatırımı kurulum nakdinde bir kez gösterilir.
- Amortisman yalnız P&L gideridir ve nakitten ikinci kez düşülmez.
- Gerçek takipte finansman/destek net nakit hareketine girer, faaliyet sonucuna girmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- Steam kaynak hash ve golden testleri
- gerçek HTML smoke testi
- eski sektör sonucu koruma testleri
- profil, tablo, senaryo, P&L/nakit ve kapasite testleri
- sekiz bağımsız HTML üretim ve deterministik paketleme testleri
- rapor sözleşmesi ve belge güvenliği testleri
- takip normalizasyonu, sapma, trend ve Steam nakit uyumu testleri
- portföy yaşam döngüsü, yedek, kapsam ve takip izolasyonu testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin içe aktarım kontrolü

## Sonraki aşama

Aşama 10 yayınlama ve son kalite çalışmasıdır: gerçek tarayıcı E2E, mobil/erişilebilirlik, veri migrasyonu, production dağıtımı ve sürümleme.
