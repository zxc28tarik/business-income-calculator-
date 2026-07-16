# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve nakit akışı hesaplayıcıları platformu.

## v0.10 — Steam Yayıncısı tam sektör bağlantısı

Steam Yayıncı master modeli artık platformun aktif sektörlerinden biridir. Masterdaki on giriş bölümü yeni gelişmiş şemaya taşındı:

- satış ve kur varsayımları
- bölge bazlı satış tablosu
- kademeli platform komisyonu ve ABD stopajı
- banka, tahsilat ve kur makası
- yayıncı / geliştirici anlaşması
- recoup ve doğrudan oyun giderleri
- yayıncı operasyon ve genel giderleri
- ek gelir, hibe ve yatırım sınıfları
- Türkiye vergi ve muhasebe seçenekleri
- 12 aylık nakit akışı

Bölge, recoup, ek gelir ve gelir vergisi dilimleri düzenlenebilir tablo olarak çalışır. Yatırım/finansman P&L geliri sayılmaz; geliştirici ödemesi ile yayıncı kârı ayrı izlenir. Master golden sonuçları korunur.

## v0.9 — Gelişmiş sektör şeması

- checkbox, metin ve düzenlenebilir tablo alanları
- koşullu görünürlük
- derin senaryo kopyalama
- sektöre özel nakit tablosu kolonları
- form, sonuç ve biçimlendirme UI modülleri

## Aktif sektörler

1. Kafe / Restoran
2. E-Ticaret / Pazaryeri
3. Güzellik / Kuaför / Bakım
4. Ajans / Freelancer / Danışmanlık
5. SaaS / Abonelik
6. Fiziksel Perakende
7. Oto Hizmetleri
8. Oyun / Dijital Yayıncılık

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

## Finansal model ilkeleri

- Her sektör master modelin derinliğine kendi ekonomik yapısıyla uyarlanır; Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Hibe/destek ayrı gösterilir.
- Net kâr ve nakit akışı ayrı hesaplanır.
- Amortisman P&L gideridir; yatırım nakitten ikinci kez düşülmez.
- Vergi oranları kullanıcı tarafından değiştirilebilir varsayımlardır.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

Bu proje **GNU Affero General Public License v3.0 (AGPL-3.0)** ile yayımlanır.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Vergi, amortisman, hibe ve muhasebe uygulamaları kullanıcı tarafından uzmanlarla teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. Ayrıntılar için `LICENSE` dosyasına bakın.
