# Business Income Calculator

Sektör bazlı maliyet, ciro, net kâr, başabaş ve nakit akışı hesaplayıcıları platformunun ilk çalışan sürümü.

## v0.1 kapsamı

İlk sektör: **Kafe / Restoran / Yiyecek-İçecek**

- 11 iş türü
- Kötümser, beklenen ve iyimser senaryolar
- Fiyata dahil, fiyat üstü veya vergisiz hesap
- Paket servis komisyonunun yalnız paket servis payına uygulanması
- POS komisyonu
- Malzeme, fire, paketleme ve diğer değişken maliyetler
- Sabit giderler
- Kurulum maliyeti
- Franchise ve ortak payı
- Vergi ön tahmini
- Aylık net kâr, başabaş ve ROI
- 12 aylık nakit akışı
- Kural tabanlı uyarılar
- Şelale, senaryo tablosu ve ayrıntılı döküm

## Çalıştırma

Bu sürüm bağımlılıksız statik web uygulamasıdır. `index.html` dosyasını bir statik sunucuyla açın.

Örnek:

```bash
python -m http.server 8080
```

Ardından `http://localhost:8080` adresine gidin.

## Test

Node.js 20 veya üzeri gerekir.

```bash
npm test
npm run check
```

## Finansal model ilkeleri

- Yatırım ve finansman P&L geliri sayılmaz; yalnız nakit akışını etkiler.
- Net kâr ve nakit akışı ayrı hesaplanır.
- KDV türü düzenlenebilir.
- Vergi yalnız pozitif vergi öncesi kâr üzerinden ön tahmin olarak hesaplanır.
- Kurulum maliyeti ilk ay nakitten bir kez düşer.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Uyarı

Bu araç ön fizibilite ve işletme içi tahmin içindir. Mali müşavirlik, vergi danışmanlığı veya hukuki danışmanlık değildir. Oranlar örnektir ve kullanıcı tarafından mali müşavirle teyit edilmelidir.

Copyright © 2026 Mustafa Tarık Küçük. All rights reserved. Bu depoda açık kaynak lisansı verilmemiştir.
