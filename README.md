# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.10.1

- `index.html` temiz UTF-8 olarak yeniden kuruldu.
- Bozuk Türkçe metinler düzeltildi.
- Sürüm etiketi güncellendi.
- Uygulama testi gerçek HTML kimliklerini okur.
- Steam sektörü form, KPI, ayrıntı ve nakit görünümüyle smoke testine eklendi.
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

Steam Yayıncısı master profili ayrıntılı v2 motoru kullanır. Diğer yedi sektör çalışan temel modellerdir ve sırayla kendi iş yapılarına göre v2 derinliğine taşınacaktır. Alt iş türleri için ayrı varsayım, alan, KPI ve uyarı profilleri henüz tamamlanmamıştır.

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

- Her sektör kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
