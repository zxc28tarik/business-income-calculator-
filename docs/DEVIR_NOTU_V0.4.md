# Devir Notu — v0.4

## Tamamlananlar

- Dördüncü sektör olarak Ajans / Freelancer / Danışmanlık eklendi.
- 10 iş türü tanımlandı.
- Proje sayısı × ortalama proje bedeli gelir modeli kuruldu.
- Baz üretim saati ile revizyon saati ayrı tutuldu.
- Ekip saatlik maliyeti, freelancer/taşeron ödemesi ve diğer değişken maliyetler hesaplandı.
- Teorik kapasite, hedef faturalandırılabilir kapasite ve gerçek kullanım oranı eklendi.
- Proje başı net kâr, saatlik net kâr, kişi başı ciro ve başabaş proje sayısı eklendi.
- Tahsilat vadesinin yalnız nakit akışını etkilemesi doğrulandı.
- En büyük müşteri payı, tahsilat, kapasite, revizyon ve saatlik fiyat/maliyet uyarıları eklendi.
- Registry dört sektörü kapsayacak şekilde güncellendi.
- Tarayıcı smoke testi ajans sektörüne geçişi kapsayacak şekilde genişletildi.
- GitHub Actions test iş akışı eklendi.

## Test durumu

- Ajans modülü için 11 yeni yerel kabul testi geçti.
- Push/PR sonrası GitHub Actions tüm test paketini ve sözdizimi kontrolünü çalıştırır.

## Finansal kararlar

- Tahsilat vadesi P&L gelirini azaltmaz; tahsilatı kaydırır.
- Saatlik maliyet üretim ekibi için kullanılır; idari/satış personeli sabit giderdir.
- Revizyon maliyeti, revizyon saati × saatlik maliyet olarak ayrıca görünür.
- Freelancer/taşeron ödemesi aylık değişken maliyettir.
- Başabaş proje sayısı ikili arama ile çözülür.

## Sonraki backlog

MD sırasındaki sonraki sektör: **SaaS / Abonelik**.
