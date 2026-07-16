# Mimari Notları

## Katmanlar

- `src/core/finance-engine.js`: Sektörden bağımsız vergi, komisyon, paydaş, başabaş, nakit akışı ve şelale yardımcıları.
- `src/core/sector-schema.js`: Her sektörün kimlik, form ve fonksiyon sözleşmesini doğrular.
- `src/sectors/registry.js`: Uygulamada kullanılabilen sektörleri tek listede toplar.
- `src/sectors/cafe-*.js`: Yiyecek-içecek modeli.
- `src/sectors/ecommerce-*.js`: E-ticaret/pazaryeri modeli.
- `src/sectors/beauty-*.js`: Güzellik/kuaför/bakım modeli.
- `src/sectors/agency-*.js`: Ajans/freelancer/danışmanlık modeli.
- `src/sectors/saas-*.js`: SaaS/abonelik ve birim ekonomisi modeli.
- `src/sectors/retail-*.js`: Fiziksel perakende, stok ve mağaza modeli.
- `src/sectors/auto-*.js`: Oto hizmetleri, kapasite, parça geliri ve ekipman modeli.
- `src/app.js`: Sektörden bağımsız form, senaryo, yerel kayıt, CSV/PDF ve sonuç render katmanı.
- `tests/`: Ortak finans, şema, uygulama açılışı ve sektör özel kabul testleri.
- `.github/workflows/test.yml`: Push ve pull requestlerde test/sözdizimi doğrulaması.

## Ortak hesap zinciri

```text
Brüt müşteri harcaması / hizmet / proje / abonelik / mağaza / araç geliri
- fiyata dahil KDV ayrımı
- iade / kayıp / no-show (sektörde varsa)
- platform ve ödeme komisyonları
= komisyon sonrası net gelir

Komisyon sonrası net gelir
- satışa veya hizmete bağlı değişken maliyetler
= katkı

Katkı
- sabit giderler
- nakit dışı amortisman
- paydaş / ortak payı
= vergi öncesi kâr

Vergi öncesi kâr
- pozitif kâr üzerinden vergi ön tahmini
= net kâr
```

Finansman ve hibe/destek P&L zincirine girmez; nakit akışında ayrı gösterilir.

## Oto hizmetleri kapasite ve gelir modeli

```text
monthly_vehicles = daily_vehicles × open_days
daily_capacity = service_stations × working_hours × 60 / service_duration
service_revenue = monthly_vehicles × service_price
parts_revenue = monthly_vehicles × parts_revenue_per_vehicle
```

Parça maliyeti yalnız parça gelirine uygulanır. Sarf ve araç başı su/elektrik değişken giderdir. Sabit abonelik/fatura, personel, kira ve reklam sabit giderdir.

Ekipman yatırımı kurulum sırasında nakitten bir kez düşer. Aylık amortisman `totalFixedCosts` içinde P&L gideridir; `cashFixedCosts` içine alınmaz. Bu nedenle nakit akışında ikinci kez düşmez.

## Nakit ve P&L ayrımı

- `totalFixedCosts`: P&L sabit giderleri ve amortisman.
- `cashFixedCosts`: Gerçek aylık sabit nakit çıkışları.
- `cashVariableCosts`: Tedarikçi vadesine tabi değişken nakit çıkışları.
- Kurulum, stok ve ekipman yatırımı seçilen ayda tek seferlik nakit çıkışıdır.
- Tahsilat ve tedarikçi vadeleri P&L sonucunu değiştirmez.

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

Uygulama arayüzü sektör formüllerini bilmez. Sektör modeli standart sonuç ve sunum verisi üretir; ortak UI aynı KPI, şelale, senaryo, nakit ve döküm panellerini kullanır.

## Sonraki geliştirme aşaması

İlk sektör backlogu v0.7 ile tamamlanır. Sonraki mimari çalışma rapor katmanıdır:

- PDF rapor şablonu
- Excel/CSV rapor yapısı
- paylaşılabilir senaryo bağlantısı
- mali müşavir özeti
- yatırımcı/ortak özeti
