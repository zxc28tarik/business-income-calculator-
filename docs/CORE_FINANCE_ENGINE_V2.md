# Kaynak Uyumlu Finans Motoru v2

Bu motor, `Steam Yayıncı Finansal Fizibilite & Net Kâr Hesaplayıcı v2` master prototipinin hesap zincirinden çıkarılmıştır.

## Amaç

Mevcut `src/core/finance-engine.js` sade sektör prototiplerini çalıştırmaya devam eder. Yeni `src/core/master-finance-engine-v2.js` ise master modeldeki ayrıntılı finans katmanlarını kaynak sonuçlarını değiştirmeden saf fonksiyonlara ayırır.

Bu paralel yaklaşımın nedeni, çalışan yedi sektörü tek seferde kırmadan kontrollü geçiş yapmaktır.

## Kaynaktan çıkarılan hesap zinciri

1. Yerel/basit satış ve para birimi dönüşümü
2. Dahil, fiyat üstü veya vergisiz işlem vergisi ayrımı
3. İade ve ters ibraz
4. Sabit veya kademeli platform komisyonu
5. ABD kaynaklı gelir stopajı
6. Platform ödemesi
7. Banka, ödeme sağlayıcı ve kur makası
8. Recoupable/non-recoupable gider havuzu
9. Havuzdan veya geliştirici payından recoup
10. Advance ve milestone mahsubu
11. Geliştirici hakedişi ve nakit royalty
12. IP ve co-publisher payları
13. Yayıncı P&L
14. Kurum veya dilimli şahıs vergisi
15. Yabancı stopaj mahsubu
16. Teknopark veya yüzde 80 ihracat indirimi
17. Temettü ve şirkette kalan kâr
18. 12 aylık nakit, recoup kapanışı ve runway
19. Birim başabaş çözümü

## Ana fonksiyonlar

- `calculatePlatformLayer`
- `calculatePublisherReceipt`
- `calculateRecoup`
- `calculateDeveloperSettlement`
- `calculatePublisherPnl`
- `calculatePublisherTax`
- `calculatePublisherCashFlow`
- `calculatePublisherModel`
- `solvePublisherBreakevenUnits`

## Kaynak sadakati

Aşağıdaki davranışlar master prototipten aynen korunmuştur:

- Yatırım/finansman P&L geliri değildir; başlangıç nakdini artırır.
- Hibe/destek P&L içinde ayrı gelir satırıdır.
- Recoup gideri P&L'den ikinci kez düşülmez; settlement zamanlamasını ve geliştirici ödemesini etkiler.
- Advance geliştiriciye toplam ödemede yer alır ve recoupable ise royalty'den mahsup edilir.
- Kur makası tahsilat aşamasında uygulanır.
- Stopaj mahsubu hesaplanan Türkiye vergisi ile sınırlıdır.
- Teknopark ve yüzde 80 ihracat indirimi aynı anda kullanılmaz.
- Nakit tablosu vergi ödeme takvimini içermez; masterdaki yaklaşık model korunur.

## Golden sonuçlar

Master varsayımlarıyla üç senaryo sabitlenmiştir:

| Senaryo | Yayıncı tahsilatı | Vergi öncesi kâr | Yayıncı net kârı | 12. ay nakit |
|---|---:|---:|---:|---:|
| Kötümser | 5.266.876,96 TL | -80.249,22 TL | -80.249,22 TL | 2.732.309,83 TL |
| Beklenen | 19.116.222,30 TL | 5.399.488,92 TL | 4.751.287,39 TL | 8.054.971,34 TL |
| İyimser | 48.043.751,78 TL | 16.890.500,71 TL | 14.430.374,90 TL | 19.108.291,58 TL |

Bu değerlerden biri değişirse test paketi başarısız olur. Bilinçli formül değişikliği yapılacaksa önce kaynak farkı belgelenmeli, sonra golden değerler açıkça güncellenmelidir.

## Geçiş durumu

Tamamlanan:

- Master kaynak koruması
- Hash testi
- Saf v2 motor çıkarımı
- Oyun/dijital yayıncılık için kaynak giriş modeli
- Üç senaryo golden testleri
- Yatırım, hibe, vergi, recoup ve normalizasyon testleri

Henüz tamamlanmayan:

- Tablo, checkbox ve koşullu panel destekli sektör şeması
- Steam yayıncısı formunun platform arayüzüne bağlanması
- Diğer oyun/dijital yayıncılık iş türlerinin ayrı varsayım profilleri
- Mevcut yedi sektörün v2 motora kontrollü taşınması
- Bağımsız tek HTML sektör üretimi
