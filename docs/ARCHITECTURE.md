# Mimari Notları

## Katmanlar

- `src/core/finance-engine.js`: Sektörden bağımsız vergi ayrımı, komisyon, paydaş tabanı, başabaş, nakit akışı ve şelale yardımcıları.
- `src/core/sector-schema.js`: Her sektörün kimlik, form ve fonksiyon sözleşmesini doğrular.
- `src/sectors/registry.js`: Uygulamada kullanılabilen sektörleri tek listede toplar.
- `src/sectors/cafe-restaurant.js`: Yiyecek-içecek sektörünün veri varsayımları ve hesap zinciri.
- `src/sectors/ecommerce.js`: E-ticaret/pazaryeri sektörünün veri varsayımları ve hesap zinciri.
- `src/app.js`: Sektörden bağımsız form, senaryo durumu, localStorage, CSV/PDF ve sonuç panellerinin render katmanı.
- `tests/`: Ortak finans, şema ve sektör özel kabul testleri.

## Ortak hesap zinciri

```text
Brüt müşteri harcaması
- KDV ayrımı
- iade / kayıp
- platform ve ödeme komisyonları
= komisyon sonrası net gelir

Komisyon sonrası net gelir
- satışa bağlı değişken maliyetler
= katkı

Katkı
- reklam ve sabit giderler
- paydaş / ortak payı
= vergi öncesi kâr

Vergi öncesi kâr
- pozitif kâr üzerinden vergi ön tahmini
= net kâr
```

Finansman ve hibe/destek bu P&L zincirine girmez; nakit akışında ayrı giriş olarak gösterilir.

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

## Sonraki sektör ekleme yöntemi

1. `src/sectors/` altında yeni sektör dosyası oluşturulur.
2. Sektör tanımı `assertSectorDefinition()` ile doğrulanır.
3. `src/sectors/registry.js` listesine eklenir.
4. Sektör özel finans testleri yazılır.
5. Ortak kabul testleri ve tarayıcı açılış kontrolü çalıştırılır.
