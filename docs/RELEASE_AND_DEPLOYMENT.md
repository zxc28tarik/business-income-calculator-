# Aşama 10 — Yayınlama ve Son Kalite

## Amaç

`v0.23.0`, uygulamanın üretim paketi, gerçek tarayıcı kalite kapısı, erişilebilirlik denetimi, eski yerel veri migrasyonu ve GitHub Pages yayın akışını tanımlar.

Bu aşama finans formüllerini değiştirmez. Sekiz sektör motoru, golden sonuçlar, rapor, gerçek takip ve portföy sözleşmeleri korunur.

## Kalite kapısı

`.github/workflows/test.yml` her push ve pull request için şu sırayı çalıştırır:

1. `npm ci`
2. Chromium ve gerekli sistem bağımlılıklarının kurulması
3. `npm test`
4. `npm run check`
5. `npm run build:production`
6. `dist/` klasörünün gerçek Chromium içinde masaüstü ve mobil testleri
7. WCAG 2 A/AA axe denetimi
8. test logları, Playwright raporu ve üretim sitesinin CI artefaktı olarak yüklenmesi

Tarayıcı kapısı şu davranışları sınar:

- ana uygulamanın JavaScript hatası olmadan açılması
- sektör değişimi ve form girdisinin finans sonucunu değiştirmesi
- çoklu kayıt oluşturma ve portföy görünümü
- proje kimlikli gerçek takip ayrımı
- tam JSON yedeği indirme
- bağımsız tek HTML hesaplayıcının açılması
- mobil görünümde sayfa düzeyinde yatay taşma olmaması
- ciddi veya kritik WCAG A/AA ihlali bulunmaması

## Üretim paketi

```bash
npm ci
npm run build:production
```

Çıktı `dist/` altında oluşur ve şunları içerir:

- ana `index.html`
- `404.html`
- ortak CSS dosyaları
- `src/` çalışma modülleri
- sekiz bağımsız HTML hesaplayıcı
- `LICENSE`
- `.nojekyll`
- `build-info.json`

Testler, geliştirme betikleri, GitHub workflow dosyaları, `node_modules` ve paket yönetim dosyaları yayın artefaktına alınmaz.

## GitHub Pages yayını

`.github/workflows/deploy-pages.yml` yalnız:

- `main` dalına push yapıldığında
- veya elle `workflow_dispatch` çalıştırıldığında

etkinleşir.

Yayın öncesinde test, modül kontrolü, production build ve `dist/` Chromium testleri yeniden çalışır. Başarısız kalite kapısı Pages dağıtımını durdurur.

Depo ayarlarında **Settings → Pages → Build and deployment → Source: GitHub Actions** seçilmelidir. Bu ayar yapılmadan workflow dosyası mevcut olsa bile Pages sitesi yayınlanmaz.

PR veya özellik dalı doğrudan production ortamına dağıtılmaz.

## Yerel veri migrasyonu

`src/migrations/storage-migrations.js`, v0.21 döneminden kalan proje kimliği içermeyen gerçek takip anahtarlarını v0.23 portföy yapısına taşır.

Kurallar:

- migrasyon kapsam başına bir kez çalışır
- eski takip verisi ilk aktif projeye kopyalanır
- hedef anahtar zaten varsa üzerine yazılmaz
- bozuk veya aşırı büyük kayıtlar atlanır
- bağımsız hesaplayıcı yalnız kendi sektörünün eski verisini taşır
- eski anahtarlar geri dönüş güvenliği için silinmez
- migrasyon sonucu yerel işaret kaydıyla saklanır

Mevcut tek çalışma alanı, Aşama 9 portföy normalizasyonu tarafından ilk işletme/proje kaydına dönüştürülür.

## Sürümleme

Proje `0.x` aşamasında SemVer düzenini kullanır:

- küçük geriye uyumlu özellik: minor sürüm
- hata düzeltmesi: patch sürüm
- kullanıcı verisi veya sözleşmesi açısından geriye uyumsuz değişiklik: major sürüm değerlendirmesi

Bir sürümde aşağıdaki işaretler eşit olmalıdır:

- `package.json`
- `package-lock.json`
- ana uygulama üst çubuğu
- bağımsız HTML üreticisi
- `build-info.json`
- README ve değişiklik kaydı

## Yayın kontrol listesi

1. Taslak PR üzerindeki tüm kontroller yeşil olmalı.
2. Finans golden testleri korunmalı.
3. Birim/entegrasyon testinde başarısızlık olmamalı.
4. Chromium masaüstü ve mobil testleri geçmeli.
5. Ciddi/kritik axe ihlali olmamalı.
6. `dist/` CI artefaktı indirilebilir olmalı.
7. Veri yedeği dışa aktarma ve içe aktarma testi geçmeli.
8. Sürüm numaraları eşleşmeli.
9. PR açıkça onaylanmadan `main` ile birleştirilmemeli.
10. Birleştirme sonrası Pages workflow sonucu kontrol edilmeli.

## Geri alma

Bir yayın sonrasında kritik sorun görülürse:

1. Kullanıcı verileri JSON yedeğiyle korunur.
2. Sorunlu commit geri alınır veya bilinen iyi sürüm yeniden `main` dalına uygulanır.
3. Pages workflow yeniden çalıştırılır.
4. Yerel veri şeması geriye uyumsuz değiştiyse otomatik silme yapılmaz; eski anahtarlar korunur ve düzeltme migrasyonu hazırlanır.

## Sınırlar

- Kullanıcı verileri tarayıcı `localStorage` alanında tutulur.
- Bulut senkronizasyonu, kullanıcı hesabı veya sunucu veritabanı yoktur.
- Tarayıcı verileri temizlenirse yerel kayıtlar kaybolabilir; düzenli JSON yedeği alınmalıdır.
- Uygulama muhasebe, vergi, hukuk veya yatırım danışmanlığı sunmaz.
