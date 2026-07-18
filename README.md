# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.11.0 — Oyun ve dijital yayıncılık iş türü profilleri

Oyun / Dijital Yayıncılık sektörü artık altı ayrı hesap profiliyle çalışır:

1. Steam oyun yayıncısı
2. Indie oyun kendi yayınlama
3. Mobil oyun
4. DLC / supporter pack
5. Oyun asset / dijital ürün
6. Publisher–developer paylaşımı

Profiller yalnız isim seçeneği değildir. Mobil oyun MAU, ödeme dönüşümü, IAP ve reklam gelirini; DLC sahip tabanı ve satın alma oranını; dijital ürün aylık satış ve dönem uzunluğunu kullanır. Kendi yayınlama profilinde harici geliştirici paylaşımı oluşmaz. Her profil koşullu alan, özel KPI, özel uyarı ve senaryo sürücülerine sahiptir.

Steam Yayıncısı master golden sonucu korunur. Ayrıntılar: `docs/STEAM_BUSINESS_TYPE_PROFILES.md`.

## v0.10.1 — Denetim düzeltmeleri

- `index.html` temiz UTF-8 olarak yeniden kuruldu.
- Gerçek HTML ve Steam render smoke testi eklendi.
- Kaynak uyumu ve mimari belgeleri güncellendi.

## Aktif sektörler

1. Kafe / Restoran
2. E-Ticaret / Pazaryeri
3. Güzellik / Kuaför / Bakım
4. Ajans / Freelancer / Danışmanlık
5. SaaS / Abonelik
6. Fiziksel Perakende
7. Oto Hizmetleri
8. Oyun / Dijital Yayıncılık

## Geçiş durumu

Steam ve oyun/dijital yayıncılık profilleri ayrıntılı v2 motoru kullanır. Diğer yedi sektör çalışan temel modellerdir ve sırayla kendi ekonomik yapılarına göre v2 derinliğine taşınacaktır. Sıradaki çalışma Kafe/Restoran v2 geçişidir.

## Çalıştırma

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test

```bash
npm test
npm run check
```

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
