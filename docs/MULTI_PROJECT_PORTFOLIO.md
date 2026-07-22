# Aşama 9 — Çoklu İşletme / Proje ve Veri Taşınabilirliği

## Amaç

Farklı fizibiliteleri tek tarayıcıda birbirine karıştırmadan saklamak, adlandırmak, kopyalamak, karşılaştırmak ve takip verileriyle birlikte taşınabilir yedek haline getirmek.

## Kayıt yapısı

Her işletme/proje kaydı şunları taşır:

- kayıt kimliği ve kullanıcı tarafından verilen ad
- oluşturulma ve son güncellenme zamanı
- aktif sektör
- üç senaryonun normalize edilmiş bütün girdileri
- aktif senaryo
- gerçek takip verileri için proje kimliği kapsamı

Ana platformda bir kayıt sekiz sektörün çalışma alanını taşır. Bağımsız tek HTML hesaplayıcıda kayıt yalnız o dosyanın sektör çalışma alanını taşır.

## Kullanıcı işlemleri

- **Yeni:** varsayılan girdilerle boş kayıt oluşturur.
- **Adlandır:** aktif kaydın görünen adını değiştirir.
- **Kopyala:** fizibilite girdilerini ve projeye ait gerçek takip kayıtlarını bağımsız bir kimlikle çoğaltır.
- **Aktif kaydı sil:** kayıt ile yalnız o kimliğe ait takip verilerini siler. Son kalan kayıt silinemez.
- **Portföy:** kayıtları sektör, senaryo, brüt gelir, net sonuç, 12 ay sonu nakit ve risk durumu ile karşılaştırır.

En fazla 50 işletme/proje kaydı tutulur. Kayıt adı 80 karakterle sınırlandırılır ve gereksiz boşluklar temizlenir.

## Portföy karşılaştırması

`src/portfolio/portfolio-summary.js` her kaydın aktif sektör ve senaryosunu mevcut sektör motoruyla hesaplar. Ortak karşılaştırma alanları:

- sektör ve senaryo
- iş türü
- brüt gelir
- net sonuç
- 12 ay sonu nakit
- kritik ve dikkat uyarısı sayısı
- dengeli / dikkat / riskli durumu

Portföy katmanı yeni finans formülü tanımlamaz. `calculateModel` ve `buildPresentation` sonuçlarını ortak görünümde toplar. Steam Yayıncısı master motoru değiştirilmez.

## Gerçek takip ayrımı

Takip anahtarı şu kapsamı kullanır:

```text
trackingPrefix : projectId : sectorId : businessType
```

Bu yapı sayesinde aynı sektör ve iş türü iki farklı projede kullanıldığında gerçekleşen kayıtlar karışmaz.

- Eski proje kimliği içermeyen takip anahtarları ilk aktif projeye kopyalanır.
- Proje kopyalandığında yalnız kaynak projeye ait takip anahtarları çoğaltılır.
- Proje silindiğinde yalnız o proje kimliğine ait takip anahtarları silinir.
- Yedek dışa aktarılırken yalnız portföyde bulunan proje kimlikleri alınır.

## Tam yedek

Yedek dosyası JSON biçimindedir ve şu üst alanları taşır:

- `schema`: `business-income-calculator-backup-v1`
- `version`: `1`
- `scope`
- uygulama sürümü
- oluşturulma zamanı
- portföy ve çalışma alanları
- projelere ait doğrulanmış takip anahtarları

Kapsam değerleri:

- ana platform: `platform`
- bağımsız hesaplayıcı: `standalone:<sectorId>`

Platform yedeği bağımsız sektör dosyasına, başka sektörün bağımsız yedeği de farklı bağımsız hesaplayıcıya aktarılamaz.

## İçe aktarma doğrulaması

- Dosya en fazla 5 MB olabilir.
- Geçerli JSON olmak zorundadır.
- Şema, sürüm ve kapsam eşleşmelidir.
- En fazla 50 proje kabul edilir.
- Her çalışma alanı hedef uygulamanın normalizasyonundan geçirilir.
- Yinelenen veya geçersiz kimlikler güvenli benzersiz kimliğe çevrilir.
- Takip değeri JSON dizi olmak zorundadır.
- Yalnız içe aktarılan portföyde bulunan proje kimliklerinin takip anahtarları kabul edilir.
- İçe aktarma yalnız mevcut portföye ait takip anahtarlarını değiştirir; başka hesaplayıcıların yerel verisini temizlemez.

## Kaynak dosyaları

- `src/portfolio/portfolio-model.js`: kayıt ve yedek sözleşmesi
- `src/portfolio/portfolio-controller.js`: yerel saklama, kayıt işlemleri ve dışa/içe aktarma
- `src/portfolio/portfolio-summary.js`: sektörler arası karşılaştırma özeti
- `tests/portfolio-model.test.mjs`: kayıt yaşam döngüsü ve yedek testleri
- `tests/portfolio-backup-scope.test.mjs`: kapsam ve takip izolasyonu testleri

## Sınır

Yerel saklama tarayıcı profiline bağlıdır. Yedek alınmadan tarayıcı verileri temizlenirse kayıtlar kaybolabilir. Bu aşama kullanıcı hesabı, sunucu veritabanı veya bulut eşitleme içermez.
