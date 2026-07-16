# Devir Notu — v0.6

## Tamamlananlar

- Altıncı sektör olarak Fiziksel Perakende eklendi.
- Butik, pet shop, telefon aksesuar, kırtasiye, oyuncak, çiçekçi ve küçük market tanımlandı.
- Günlük müşteri × ortalama sepet × açık gün satış modeli kuruldu.
- Ortalama ürün fiyatı ve ürün maliyetinden satılan ürün adedi ile ürün maliyeti hesaplandı.
- İade, fire/kayıp, POS komisyonu, poşet ve diğer değişken giderler ayrıştırıldı.
- Ürün başı net kâr, ürün brüt marjı, kira/ciro, stok devir hızı ve stok kapsamı eklendi.
- İlk stok yatırımı P&L dışında kurulum nakit çıkışı olarak tutuldu.
- Günlük başabaş müşteri ve başabaş ciro hesaplandı.
- Tedarikçi vadesi 12 aylık nakit akışına bağlandı.
- Fiziksel perakende uyarıları ve sunum katmanı eklendi.
- Registry ve uygulama geçiş testi altı sektörü kapsayacak şekilde güncellendi.

## Test durumu

- Fiziksel perakende için 11 yeni kabul testi eklendi.
- Yerel modül testlerinin 11/11’i geçti.
- Önceki v0.5 paketinde 58 test vardı; GitHub Actions üzerinde toplam 69 test bekleniyor.
- Perakende JavaScript modüllerinin sözdizimi kontrolü geçti.

## Finansal kararlar

- İade, tanınan satışı ve satılan ürün adedini azaltır.
- Satılan ürün maliyeti ile fire/kayıp maliyeti aynı kalem değildir.
- POS komisyonu yalnız kartlı satış payına uygulanır.
- İlk stok yatırımı aylık P&L gideri değildir.
- Stok devir hızı prototipte yıllık satılan ürün maliyeti / ilk stok yatırımı formülüyle hesaplanır.
- Tahsilat ve tedarikçi vadesi P&L sonucunu değil nakit zamanlamasını değiştirir.

## Sonraki backlog

MD sırasındaki sonraki sektör: **Oto Hizmetleri**.
