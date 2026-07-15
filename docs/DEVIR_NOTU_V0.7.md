# Devir Notu — v0.7

## Tamamlananlar

- Yedinci sektör olarak Oto Hizmetleri eklendi.
- Oto yıkama, oto kuaför, detaylı temizlik, lastikçi, cam filmi/kaplama ve küçük servis tanımlandı.
- Günlük araç, hizmet fiyatı ve açık gün üzerinden hizmet geliri hesaplandı.
- Araç başı parça/ürün geliri hizmet gelirinden ayrıldı.
- İstasyon, çalışma saati ve hizmet süresinden teorik kapasite üretildi.
- Kapasite kullanımı ve kapasite aşımı uyarıları eklendi.
- Araç başı sarf ile su/elektrik gideri ayrı hesaplandı.
- Parça maliyeti yalnız parça/ürün gelirine uygulandı.
- POS komisyonu yalnız kartlı satış payına uygulandı.
- Ekipman yatırımı, amortisman ve nakit ayrımı kuruldu.
- Araç başı net kâr, günlük başabaş araç ve ekipman geri dönüşü eklendi.
- 12 aylık nakit akışı ve tedarikçi vadesi desteklendi.
- Oto hizmetlerine özel kural tabanlı uyarılar eklendi.

## Test durumu

- Oto Hizmetleri için 11 yeni kabul testi eklendi.
- Yerel sektör testlerinin 11/11'i geçti.
- Yedi sektörlü arayüz geçiş testi güncellendi.
- Tam paket GitHub Actions üzerinde 80 test olarak doğrulanacaktır.
- Tüm oto modülleri JavaScript sözdizimi kontrolünden geçti.

## Finansal kararlar

- Parça/ürün geliri opsiyoneldir ve hizmet gelirine karıştırılmadan gösterilir.
- Parça maliyeti yalnız parça gelirine uygulanır.
- Sarf ve araç başı su/elektrik değişken maliyettir.
- Sabit fatura/abonelikler ayrıca sabit giderdir.
- Ekipman yatırımı nakitten bir kez düşer; aylık amortisman nakit dışı P&L gideridir.
- Tahsilat ve tedarikçi vadeleri net kârı değil nakit zamanlamasını değiştirir.

## Sonraki backlog

İlk sektörler backlogu tamamlandı. MD yol haritasındaki sonraki aşama: **Rapor çıktıları** — PDF, Excel/CSV, paylaşılabilir link, mali müşavir özeti ve yatırımcı/ortak özeti.
