# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: ilk yedi sektör için geriye uyumlu ortak yardımcılar
- `src/core/master-finance-engine-v2.js`: Steam master kaynağından çıkarılan ayrıntılı motor
- `src/core/sector-schema.js`: sektör tanımı, gelişmiş alanlar ve görünürlük sözleşmesi
- `src/sectors/registry.js`: aktif sektör listesi
- `src/ui/form-view.js`: sektör formu ve düzenlenebilir tablolar
- `src/ui/results-view.js`: KPI, şelale, senaryo, nakit ve ayrıntı panelleri
- `src/app.js`: sektör seçimi, senaryo durumu, yerel kayıt ve dışa aktarma

## Sektör modülleri

Her sektör yapılandırma, hesap ve sunum katmanlarına ayrılır:

- `cafe-*`: Kafe / Restoran
- `ecommerce-*`: E-Ticaret / Pazaryeri
- `beauty-*`: Güzellik / Kuaför / Bakım
- `agency-*`: Ajans / Freelancer / Danışmanlık
- `saas-*`: SaaS / Abonelik
- `retail-*`: Fiziksel Perakende
- `auto-*`: Oto Hizmetleri
- `steam-publisher-*`: Oyun / Dijital Yayıncılık master profili

## Sektör sözleşmesi

Her sektör şu parçaları sağlar:

- kimlik, aile, sürüm ve durum
- iş türleri
- varsayılan girdiler
- senaryolar
- form bölümleri
- isteğe bağlı özel nakit kolonları
- girdi normalizasyonu
- senaryo uygulama
- model hesaplama
- senaryo karşılaştırması
- sunum verisi üretimi

UI sektör formüllerini bilmez. Sektör modülü standart sunum verisi üretir; ortak arayüz bunu gösterir.

## Gelişmiş form şeması

Desteklenen alanlar:

- sayı
- oran
- seçim
- metin
- checkbox
- düzenlenebilir tablo

Bölüm ve alan görünürlüğü giriş değerlerine göre koşullu olabilir. Tablo satırları senaryolar arasında derin kopyalanır.

## Hesap motoru geçişi

- Steam sektörü ayrıntılı v2 motoru kullanır.
- İlk yedi sektör eski ortak motoru kullanmaya devam eder.
- Her sektör v2 derinliğine ayrı ayrı taşınacaktır.
- Sonuç değişiklikleri test ve devir notu olmadan kabul edilmez.

## Test mimarisi

- ortak motor testleri
- sektör özel kabul testleri
- master kaynak hash testi
- Steam golden testleri
- şema ve tablo testleri
- gerçek `index.html` kimliklerini kullanan smoke testi
- Steam seçim ve render testi
- GitHub Actions test ve sözdizimi kontrolü

## Güncel sonraki aşama

Rapor katmanına henüz geçilmez. Önce iş türü profilleri ve sektörlerin kendi ekonomik yapılarına göre v2 geçişleri tamamlanır.
