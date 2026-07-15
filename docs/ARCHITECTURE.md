# Mimari Notları

## Katmanlar

- `src/core/finance-engine.js`: Vergi ayrımı, komisyon, paydaş tabanı, başabaş, nakit akışı ve şelale yardımcıları.
- `src/core/sector-schema.js`: Her sektörün kimlik, form ve fonksiyon sözleşmesini doğrular.
- `src/sectors/registry.js`: Uygulamada kullanılabilen sektörleri tek listede toplar.
- `src/sectors/cafe-*.js`: Yiyecek-içecek yapılandırma, hesap ve sunum katmanları.
- `src/sectors/ecommerce-*.js`: E-ticaret/pazaryeri katmanları.
- `src/sectors/beauty-*.js`: Güzellik/kuaför/bakım katmanları.
- `src/sectors/agency-*.js`: Ajans/freelancer/danışmanlık katmanları.
- `src/sectors/saas-*.js`: SaaS abone hareketi, birim ekonomi ve sunum katmanları.
- `src/sectors/retail-*.js`: Fiziksel perakende satış, stok, mağaza gideri ve sunum katmanları.
- `src/app.js`: Sektörden bağımsız form, senaryo, localStorage, CSV/PDF ve sonuç render katmanı.
- `tests/`: Ortak finans, şema, uygulama açılışı ve sektör özel kabul testleri.
- `.github/workflows/test.yml`: Push ve pull requestlerde test/sözdizimi doğrulaması.

## Ortak hesap zinciri

```text
Brüt müşteri harcaması / hizmet değeri / proje geliri / abonelik MRR / mağaza satışı
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

Finansman ve hibe/destek P&L zincirine girmez; nakit akışında ayrı giriş olarak gösterilir.

## Fiziksel perakende modeli

```text
gross_revenue = daily_customers × average_basket × open_days
returned_revenue = gross_revenue × return_rate
recognized_revenue = gross_revenue − returned_revenue
retained_units = (gross_revenue / average_unit_sale_price) × (1 − return_rate)
product_cost = retained_units × average_unit_cost
inventory_loss_cost = gross_units × average_unit_cost × inventory_loss_rate
```

İade geliri azaltır. Satılan ürün maliyeti ve fire/kayıp ayrı kalemlerdir. İlk stok yatırımı aylık P&L gideri değildir; kurulum sırasında nakitten bir kez düşer.

Stok göstergeleri:

```text
annual_stock_turnover = monthly_product_cost × 12 / initial_stock_investment
stock_coverage_months = initial_stock_investment / monthly_product_cost
```

Bu prototip stok devir hızını ilk stok yatırımını yaklaşık ortalama stok seviyesi kabul ederek hesaplar. Gerçek takip modunda dönem başı ve dönem sonu stok ortalaması kullanılmalıdır.

## Hizmet kapasitesi modeli

Ajans/freelancer sektöründe teorik kapasite ile hedef faturalandırılabilir kapasite ayrıdır. Proje ve revizyon saatleri gerçek iş yükünü oluşturur; üretim maliyeti yalnız üretim saatlerine uygulanır.

## SaaS abone ve birim ekonomi modeli

```text
churned_subscribers = opening_subscribers × monthly_churn_rate
ending_subscribers = opening_subscribers − churned_subscribers + new_subscribers
MRR = ending_subscribers × monthly_price
ARR = MRR × 12
LTV = contribution_per_subscriber / monthly_churn_rate
```

Her ayın ay sonu abonesi sonraki ayın ay başı abonesidir. Churn sıfırsa sonsuz LTV gösterilmez.

## Tahsilat ve tedarikçi vadesi

Tahsilat gecikmesi P&L sonucunu değiştirmez; nakdin geliş zamanını kaydırır. Tedarikçi vadesi değişken maliyet ödemesini kaydırır. Prototip iki etkiyi de en fazla bir aylık kaydırma olarak modeller.

## Nakit ve P&L ayrımı

- `totalFixedCosts`: P&L’de görünen sabit giderler ve varsa amortisman.
- `cashFixedCosts`: O ay gerçekten nakitten çıkan sabit giderler.
- Kurulum ve ilk stok seçilen ayda bir kez düşer.
- Kredi/taksit P&L’den ayrı nakit çıkışıdır.
- Finansman ve destek ilk ay ayrı nakit girişidir.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri ve şu fonksiyonları sağlar:

```text
normalizeInputs
applyScenario
calculateModel
calculateScenarioComparison
buildPresentation
```

Uygulama arayüzü sektör formüllerini bilmez. Sektör standart sonuç ve sunum verisi üretir; ortak UI KPI, şelale, senaryo, nakit ve döküm panellerini render eder.

## Yeni sektör ekleme yöntemi

1. Yapılandırma, hesap, sunum ve giriş dosyalarını oluştur.
2. Tanımı `assertSectorDefinition()` ile doğrula.
3. Registry listesine ekle.
4. Sektör özel testleri yaz.
5. Uygulama geçiş testini güncelle.
6. README, sektör spesifikasyonu ve devir notunu güncelle.
7. GitHub Actions sonucunu doğrula.
