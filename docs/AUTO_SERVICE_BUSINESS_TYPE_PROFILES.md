# Oto Hizmetleri İş Türü Profilleri

## Sürüm

`v0.18.0`

## Profiller

| İş türü | Ana talep sürücüsü | Ana kapasite |
|---|---|---|
| Oto yıkama | Günlük talep × dönüşüm | Yıkama alanı |
| Oto kuaför | Günlük randevu × gerçekleşme | Uygulama alanı |
| Detaylı temizlik | Günlük randevu × gerçekleşme | Detay istasyonu |
| Lastikçi | Günlük randevu × gerçekleşme | Lastik istasyonu |
| Cam filmi / kaplama | Günlük randevu × gerçekleşme | Kaplama alanı |
| Küçük bakım / servis | Günlük randevu × gerçekleşme | Lift / servis istasyonu |
| Kaporta / boya | Aylık planlanan iş | Kaporta / boya alanı |
| Mobil oto servis | Mobil ekip × günlük rota | Mobil ekip |

İsteğe bağlı müşteri tabanı modu açıldığında talep, aktif müşteri × aylık tekrar ziyaret oranı + yeni müşteri işi olarak hesaplanır.

## Kapasite

1. Hizmet karmasından ağırlıklı iş süresi hesaplanır.
2. Tekrar işçilik oranı etkin iş süresini artırır.
3. İstasyon/lift günlük kapasitesi hesaplanır.
4. Personel tablosu açıksa üretken personel saati günlük iş kapasitesine çevrilir.
5. Etkin kapasite, fiziksel kapasite ile personel kapasitesinin düşük olanıdır.
6. Tamamlanan iş, gerçekleşen talep ile etkin kapasitenin düşük olanıdır.

## Randevu ve iptal

Randevulu profillerde:

- no-show/iptal oranı tamamlanan işi azaltır,
- tahsil edilebilir iptal payı × iptal bedeli ayrı gelir üretir,
- iptal tahsilatı hizmet kapasitesi veya araç başı sarf tüketmez.

## Hizmet karması

Her satır şunları taşıyabilir:

- hizmet adı
- iş payı
- hizmet fiyatı
- süre
- sarf maliyeti
- enerji/su maliyeti
- parça/ürün geliri
- parça maliyet oranı
- tekrar işçilik oranı

Gelişmiş tablo kapalıysa eski ortalama hizmet alanları kullanılır.

## Personel

Personel satırları rol, kişi sayısı, aylık kişi maliyeti ve kişi başı üretken saat içerir. Tablo açıkken personel toplam maliyeti ve üretken kapasite bu satırlardan hesaplanır. Tablo kapalıyken eski toplam personel maliyeti kullanılır.

## Parça, sarf ve tedarikçi

Stok planı:

- mevcut parça/sarf stok maliyeti
- hedef kapsam günü
- güvenlik stoğu
- tedarik süresi
- yeniden sipariş noktası
- hedef stok maliyeti
- işletme sermayesi açığı veya fazla stok

üretir.

Tedarikçi tablosu alım payı, ödeme vadesi, teslim süresi ve indirimi taşır. İndirim parça maliyetini düşürür; vade P&L maliyetini silmez, nakit ödeme zamanını değiştirir.

## Taşeron

Taşeron satırları aylık iş, müşteriye satış ve iş başı maliyet içerir. Taşeron gelir ve maliyeti ayrı izlenir; iç istasyon veya personel kapasitesini tüketmez.

## P&L ve nakit

- Finansman P&L geliri değildir.
- Aylık faaliyet hibesi P&L geliridir.
- Tek seferlik hibe/destek nakit girişidir.
- Ekipman yatırımı kurulum nakdinde bir kez çıkar.
- Aylık amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Sarf, enerji, parça, mobil yol, tekrar işçilik ve taşeron dönemsel değişken giderdir.

## Koruma sonucu

Eski Oto Yıkama varsayılanı korunur:

- günlük tamamlanan araç: `34`
- aylık araç: `918`
- brüt gelir: `780.300 TL`
- KDV sonrası gelir: `650.250 TL`
- aylık net sonuç: yaklaşık `-12.975,96 TL`

## Kabul testleri

- sekiz profil sonlu sonuç üretir
- randevu, aylık iş ve mobil rota sürücüleri ayrı çalışır
- eski Oto Yıkama sonucu korunur
- hizmet karması tekrar işçilik maliyetini üretir
- personel kapasitesi işi sınırlayabilir
- stok açığı ve tedarik süresi uyarı üretir
- taşeron gelir ve maliyeti ayrı izlenir
- finansman P&L sonucunu değiştirmez
- gerçek uygulama form, KPI, nakit ve döküm alanlarını render eder
