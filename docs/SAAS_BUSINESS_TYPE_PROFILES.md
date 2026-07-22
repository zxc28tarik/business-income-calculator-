# SaaS / Abonelik İş Türü Profilleri

## Profiller

1. **B2B SaaS:** ücretli müşteri, koltuk/lisans ve onboarding geliri
2. **B2C abonelik:** yüksek abone hacmi, deneme dönüşümü ve bireysel churn
3. **Mikro SaaS:** küçük ekip, düşük sabit maliyet ve niş müşteri tabanı
4. **API / kullanım bazlı servis:** müşteri × kullanım birimi × birim fiyat; kullanım başına altyapı maliyeti
5. **Mobil uygulama aboneliği:** deneme dönüşümü, App Store/platform payı ve mağaza komisyonu
6. **Üyelik / içerik platformu:** üyelik geliri, içerik üretimi ve topluluk yönetimi
7. **Freemium SaaS:** ücretsiz kullanıcı, ücretliye dönüşüm ve ücretsiz kullanıcı maliyeti
8. **Kurumsal lisans:** yıllık sözleşme, az sayıda yüksek değerli müşteri ve onboarding

## Ortak hareketler

- ay başı müşteri
- yeni müşteri ve yeniden aktivasyon
- churn ile kaybedilen müşteri
- ay sonu müşteri
- expansion ve contraction MRR
- GRR ve NRR
- CAC, LTV ve CAC geri dönüşü
- destek/müşteri başarı kapasitesi

## Plan karması

Plan tablosunda müşteri payı, aylık fiyat, yıllık ödeme payı ve yıllık indirim bulunur. Tablo kapalıysa tek ortalama fiyat ve tek yıllık ödeme varsayımı kullanılır.

## Yıllık ödeme kuralı

- P&L, sözleşmenin aylık kazanılmış gelirini tanır.
- Yıllık peşin ödeme ilk ay nakdi artırır.
- Sonraki aylarda aynı gelir payı yeniden tahsil edilmiş sayılmaz.
- İndirim varsa toplam 12 aylık tahsilat indirim kadar azalır.

Bu yaklaşım fizibilite için 12 aylık nakit zamanlamasıdır; tam ertelenmiş gelir muhasebe defteri değildir.

## P&L ve nakit sınırları

- Finansman P&L geliri değildir.
- Tek seferlik hibe nakit girişi ile aylık faaliyet hibesi ayrıdır.
- API kullanım ve ücretsiz kullanıcı maliyetleri dönemsel değişken giderdir.
- İçerik ve topluluk maliyetleri dönemsel sabit giderdir.
- Vergi ve muhasebe varsayımları uzman teyidi gerektirir.

## Koruma ve testler

Eski B2B SaaS varsayılan sonucu golden testle korunur. Kabul paketi sekiz profili, API kullanımını, mobil mağaza kesintisini, freemium maliyetini, kurumsal yıllık sözleşmeyi, plan karmasını, yıllık peşin nakit zamanlamasını, NRR/GRR ve finansman/P&L ayrımını doğrular.
