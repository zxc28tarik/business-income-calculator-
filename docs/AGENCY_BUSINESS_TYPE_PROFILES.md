# Ajans / Freelancer / Danışmanlık Profilleri

Sürüm: `v0.15.0`

## Gelir sürücüleri

| İş türü | Hesap sürücüsü |
|---|---|
| Yazılım ajansı | proje × proje bedeli |
| Sosyal medya ajansı | retainer müşteri × aylık retainer |
| Reklam ajansı | kampanya × kampanya bedeli |
| Tasarım ajansı | proje × proje bedeli |
| Danışmanlık şirketi | danışmanlık günü × günlük bedel |
| Freelancer yazılımcı | faturalandırılan saat × saatlik fiyat |
| Freelancer tasarımcı | faturalandırılan saat × saatlik fiyat |
| Video / editing | proje × proje bedeli |
| SEO ajansı | retainer müşteri × aylık retainer |
| Performans reklam ajansı | yönetilen bütçe × yönetim ücreti + performans primi |

## Kapasite

Temel kapasite, ekip kişi sayısı × kişi başı aylık saat × hedef faturalandırılabilir oranla hesaplanır.

Rol tablosu açıldığında her rol için kişi, aylık saat, faturalandırılabilir oran ve saatlik maliyet ayrı kullanılır. Taşeron saati iç ekip yükünü azaltabilir; taşeron maliyeti değişken gider olarak kalır.

## Revizyon ve kapsam

Toplam revizyon saati, sözleşmeli revizyon ile baz üretim saatinin kapsam taşması oranından oluşur. Müşteriye yansıtılan bölüm ayrıca gelir üretir; yansıtılmayan bölüm yalnız kapasite ve maliyet oluşturur.

## Tahsilat

Peşinat net kârı değiştirmez. Etkin tahsilat gecikmesini azaltarak erken dönem nakit akışını etkiler.

## Uyarılar

- iç ekip kapasitesinin aşılması
- ekip ve taşeron saatlerinin işi karşılamaması
- yüksek kapsam taşması ve düşük revizyon tahsilatı
- düşük peşinat ile uzun vade
- retainer müşteri yoğunlaşması
- düşük performans yönetim ücreti
- tek müşteriye yüksek ciro bağımlılığı

## P&L ve nakit

- Finansman P&L geliri değildir.
- Tek seferlik destek nakit girişi ayrı tutulur.
- Aylık faaliyet hibesi P&L geliri olarak ayrı gösterilir.
- Kurulum giderleri nakitte tek sefer düşülür.
- Ekip ve taşeron üretim maliyetleri dönemsel P&L gideridir.

## Geriye uyumluluk

`software_agency` varsayılanı gelişmiş profil sürücüsü kapalı başlar. Eski brüt gelir, teslimat saati, üretim maliyeti, net kâr, başabaş proje ve 12 ay sonu nakit sonuçları testle korunur.

## Test kapsamı

On profil, tüm gelir sürücüleri, rol kapasitesi, taşeron, revizyon tahsilatı, peşinat, finansman/hibe ayrımı, senaryolar ve gerçek arayüz smoke testi doğrulanır.
