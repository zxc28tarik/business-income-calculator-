# Mimari Notları

## Katmanlar

- `src/core/finance-engine.js`: Sektörden bağımsız vergi ayrımı, komisyon, paydaş tabanı, başabaş, nakit akışı ve şelale yardımcıları.
- `src/core/sector-schema.js`: Her sektörün kimlik, form ve fonksiyon sözleşmesini doğrular.
- `src/sectors/registry.js`: Uygulamada kullanılabilen sektörleri tek listede toplar.
- `src/sectors/cafe-*.js`: Yiyecek-içecek sektörünün yapılandırma, hesap ve sunum katmanları.
- `src/sectors/ecommerce-*.js`: E-ticaret/pazaryeri sektörünün yapılandırma, hesap ve sunum katmanları.
- `src/sectors/beauty-*.js`: Güzellik/kuaför/bakım sektörünün yapılandırma, hesap ve sunum katmanları.
- `src/sectors/agency-*.js`: Ajans/freelancer/danışmanlık sektörünün yapılandırma, hesap ve sunum katmanları.
- `src/app.js`: Sektörden bağımsız form, senaryo durumu, localStorage, CSV/PDF ve sonuç panellerinin render katmanı.
- `tests/`: Ortak finans, şema, uygulama açılışı ve sektör özel kabul testleri.
- `.github/workflows/test.yml`: Push ve pull requestlerde Node.js test/sözdizimi doğrulaması.

## Ortak hesap zinciri

```text
Brüt müşteri harcaması / planlanan hizmet değeri / proje geliri
- fiyata dahil KDV ayrımı
- iade / kayıp / no-show
- platform ve ödeme komisyonları
= komisyon sonrası net gelir

Komisyon sonrası net gelir
- satışa veya hizmete bağlı değişken maliyetler
= katkı

Katkı
- reklam ve sabit giderler
- nakit dışı amortisman
- paydaş / ortak payı
= vergi öncesi kâr

Vergi öncesi kâr
- pozitif kâr üzerinden vergi ön tahmini
= net kâr
```

Finansman ve hibe/destek bu P&L zincirine girmez; nakit akışında ayrı giriş olarak gösterilir.

## Hizmet kapasitesi modeli

Ajans/freelancer sektörü iki kapasite ölçüsünü ayırır:

- `theoreticalCapacityHours`: ekip kişi sayısı × kişi başı aylık çalışma saati.
- `targetBillableCapacityHours`: teorik kapasite × hedef faturalandırılabilir kapasite oranı.

Proje ve revizyon saatleri toplamı gerçek iş yüküdür. Bu yükün teorik kapasiteyi aşması teslim riski, hedef faturalandırılabilir kapasiteyi aşması ise planlama uyarısı üretir.

Saatlik ekip maliyeti üretim saatlerine uygulanır. İdari/satış personeli, ofis, yazılım ve pazarlama sabit giderlerde tutulur; böylece aynı personel maliyeti iki kez sayılmaz.

## Tahsilat vadesi

Tahsilat gecikmesi P&L gelirini veya net kârı değiştirmez. `calculateCashFlow()` tahsilatı sonraki aya kaydırarak işletme sermayesi etkisini gösterir. Prototip motoru vade etkisini en fazla bir aylık kaydırma olarak modeller.

## Nakit ve P&L sabit gider ayrımı

Sektör sonucu iki farklı sabit gider toplamı sağlayabilir:

- `totalFixedCosts`: P&L’de görünen sabit giderler ve amortisman.
- `cashFixedCosts`: İlgili ayda gerçekten nakitten çıkan sabit giderler.

`calculateCashFlow()` varsa `cashFixedCosts` değerini kullanır; yoksa geriye uyumluluk için `totalFixedCosts` değerine döner. Böylece cihaz yatırımı kurulumda nakitten bir kez düşerken aylık amortisman kâr-zarar tablosunda kalır ve nakitten tekrar düşülmez.

## Sektör sözleşmesi

Her sektör şu parçaları sağlar:

```text
kimlik ve durum
iş türleri
varsayılan girdiler
senaryo tanımları
form bölümleri
normalizeInputs
applyScenario
calculateModel
calculateScenarioComparison
buildPresentation
```

Uygulama arayüzü formülleri bilmez. Sektör modeli standart sonuç ve sunum verisi üretir; ortak UI aynı KPI, şelale, senaryo, nakit ve döküm panellerini render eder.

## Senaryo durumu

Kötümser, beklenen ve iyimser senaryolar ilk açılışta sektör presetlerinden üretilir. Kullanıcının yaptığı değişiklik yalnız aktif senaryoya kaydedilir. Bu sayede senaryolar birbirinden bağımsızdır.

## Nakit akışı

- Kurulum maliyeti kullanıcı tarafından seçilen ayda bir kez düşer.
- Tahsilat gecikmesi bir aya kadar satış tahsilatını kaydırır.
- Tedarikçi vadesi bir aya kadar değişken maliyet ödemesini kaydırır.
- Finansman ve destek ilk ay ayrı nakit girişi olarak gösterilir.
- Kredi/taksit P&L geliri veya gideri olarak değil, nakit çıkışı olarak tutulur.
- Amortisman ve benzeri nakit dışı giderler nakit akışından ikinci kez düşülmez.

## Sonraki sektör ekleme yöntemi

1. `src/sectors/` altında yapılandırma, hesap, sunum ve sektör giriş dosyaları oluşturulur.
2. Sektör tanımı `assertSectorDefinition()` ile doğrulanır.
3. `src/sectors/registry.js` listesine eklenir.
4. Sektör özel finans testleri yazılır.
5. Ortak kabul testleri ve tarayıcı açılış kontrolü çalıştırılır.
6. Devir notu ve README güncellenir.
7. GitHub Actions sonucu doğrulanır.
