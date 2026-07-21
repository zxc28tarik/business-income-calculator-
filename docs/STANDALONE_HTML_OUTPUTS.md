# Aşama 6 — Bağımsız Tek HTML Çıktıları

## Amaç

Sekiz sektör hesaplayıcısını ana platformdan bağımsız, çevrimdışı açılabilen tek HTML dosyaları olarak üretmek.

## Üretim

`npm run build:standalone` komutu `scripts/build-standalone.mjs` üreticisini çalıştırır. Üretici seçilen sektörün modül grafiğini takip eder, ortak CSS ve UI katmanını gömer ve Blob tabanlı yerel ES modülleriyle dosyayı başlatır.

## Çıktılar

- `cafe-restaurant-calculator.html` — Kafe / Restoran
- `ecommerce-marketplace-calculator.html` — E-Ticaret / Pazaryeri
- `beauty-personal-care-calculator.html` — Güzellik / Kuaför / Bakım
- `agency-freelance-consulting-calculator.html` — Ajans / Freelancer / Danışmanlık
- `saas-subscription-calculator.html` — SaaS / Abonelik
- `physical-retail-calculator.html` — Fiziksel Perakende
- `auto-services-calculator.html` — Oto Hizmetleri
- `game-digital-publishing-calculator.html` — Oyun / Dijital Yayıncılık

## Garanti edilen özellikler

- harici script veya stil bağlantısı yoktur
- her modül dosyaya yalnız bir kez gömülür
- aynı sektör normalizasyonu, hesap motoru ve sunum katmanı kullanılır
- senaryo, koşullu form, tablo satırı ekleme/silme, CSV, yazdırma ve yerel kayıt çalışır
- çıktı üretimi deterministiktir
- her dosya 2 MB altında tutulur

## CI

GitHub Actions testlerden sonra sekiz dosyayı yeniden üretir ve `standalone-html` artefaktı olarak yükler. Kabul testleri dosya sayısını, çevrimdışı bağımsızlığı, boyut sınırını ve deterministik üretimi doğrular.
