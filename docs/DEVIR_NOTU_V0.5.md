# Devir Notu — v0.5

## Tamamlananlar

- Beşinci sektör olarak SaaS / Abonelik eklendi.
- 6 iş türü tanımlandı.
- Ay başı abone, yeni kazanım, churn ve ay sonu abone zinciri kuruldu.
- MRR, ARR, yeni MRR, churned MRR ve net yeni MRR hesaplandı.
- Platform satış payı, platform komisyonu ve doğrudan ödeme komisyonu ayrıştırıldı.
- Sunucu ve destek maliyetleri aktif aboneye bağlı hâle getirildi.
- CAC kazanım harcaması ile sabit pazarlama bütçesi ayrıldı.
- LTV, LTV/CAC ve CAC geri ödeme süresi eklendi.
- Başabaş abone sayısı ve başabaş MRR hesaplandı.
- 12 aylık abone planı nakit akışı satırlarına eklendi.
- CSV ve ekrandaki nakit tablosu SaaS için aktif abone kolonunu gösteriyor.
- Churn, küçülen abone tabanı, LTV/CAC, CAC geri dönüşü ve sunucu maliyeti uyarıları eklendi.
- Ortak nakit motoru geriye uyumlu biçimde ay numarasını sektör hesaplayıcısına iletiyor.

## Test durumu

- SaaS modülü için 11 yeni kabul testi eklendi.
- Toplam test sayısı 58; tamamı yerelde geçti.
- Beş sektörlü arayüz geçiş testi geçti.
- Tüm JavaScript sözdizimi kontrolleri geçti.
- GitHub Actions sonucu push sonrasında ayrıca doğrulanmalıdır.

## Finansal kararlar

- MRR ay sonu aktif abone × aylık fiyat olarak tanımlandı.
- Net MRR, KDV ve ödeme/platform komisyonlarından sonraki gelir anlamında kullanıldı.
- LTV, abone başı tekrarlayan katkı / aylık churn formülüyle hesaplandı.
- CAC kazanım gideri yeni abone × CAC olarak P&L’ye girer.
- Churn sıfır olduğunda sonsuz LTV gösterilmez.
- Tahsilat vadesi P&L’yi değiştirmez; nakit zamanlamasını değiştirir.

## Sonraki backlog

MD sırasındaki sonraki sektör: **Fiziksel Perakende**.
