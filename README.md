# Business Income Calculator

Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.

## v0.14.0 — Güzellik / Kuaför / Bakım v2 profilleri

Güzellik / Kuaför / Bakım sektörü artık sekiz ayrı iş türü profiliyle çalışır:

1. Kuaför
2. Berber
3. Güzellik salonu
4. Tırnak stüdyosu
5. Cilt bakım salonu
6. Lazer / epilasyon merkezi
7. Kaş / kirpik stüdyosu
8. Masaj / spa salonu

Profiller yalnız etiket değildir. Kuaför ve berber koltuk; tırnak stüdyosu masa; cilt bakım ve spa oda; lazer merkezi cihaz; kaş/kirpik stüdyosu uzman kapasitesiyle hesaplanır. Varsayılan güzellik salonu mevcut genel istasyon kapasitesini korur.

Güzellik v2 ayrıca şunları içerir:

- düzenlenebilir hizmet / seans karması
- hizmet bazlı fiyat, süre, sarf ve çalışan primi
- düzenlenebilir personel rol tablosu
- fiziksel kaynak kapasitesi ile personel üretken kapasitesinin karşılaştırılması
- aktif müşteri tabanı, yeni müşteri ve tekrar ziyaret talebi
- no-show, ön ödeme ve iptal bedeli geri kazanımı
- bakım / kozmetik ürün satışı ve ürün maliyeti
- profile özgü başabaş, kapasite, KPI ve uyarılar
- cihaz amortismanının P&L gideri; yatırımın nakit çıkışı olarak ayrılması
- finansmanın P&L dışında tutulması
- P&L hibe geliri ile hibe nakit girişinin ayrı izlenmesi

Eski güzellik salonu varsayılan finans sonucu testle korunur. Ayrıntılar: `docs/BEAUTY_BUSINESS_TYPE_PROFILES.md`.

## Önceki v2 geçişleri

- `v0.13.0`: E-Ticaret / Pazaryeri — on iş türü profili
- `v0.12.0`: Kafe / Restoran — on bir iş türü profili
- `v0.11.0`: Oyun / Dijital Yayıncılık — altı iş türü profili ve Steam master golden koruması
- `v0.10.1`: UTF-8, gerçek HTML kabuğu ve smoke test düzeltmeleri

## Aktif sektörler

1. Kafe / Restoran — v2 profil derinliği
2. E-Ticaret / Pazaryeri — v2 profil derinliği
3. Güzellik / Kuaför / Bakım — v2 profil derinliği
4. Ajans / Freelancer / Danışmanlık — temel model
5. SaaS / Abonelik — temel model
6. Fiziksel Perakende — temel model
7. Oto Hizmetleri — temel model
8. Oyun / Dijital Yayıncılık — v2 profil derinliği

## Geçiş durumu

Oyun / Dijital Yayıncılık, Kafe / Restoran, E-Ticaret / Pazaryeri ve Güzellik / Kuaför / Bakım kendi ekonomik yapılarına göre v2 derinliğine taşındı. Sıradaki sektör Ajans / Freelancer / Danışmanlık olacaktır.

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

Güncel paket: 150/150 test ve otomatik kaynak modülü kontrolü başarılı.

## İlkeler

- Her sektör ve alt iş türü kendi ekonomik yapısına göre uyarlanır.
- Steam'e özgü alanlar başka sektörlere kopyalanmaz.
- Yatırım ve finansman P&L geliri değildir.
- Net sonuç ve nakit hareketi ayrı tutulur.
- Amortisman P&L gideridir; nakitten ikinci kez düşülmez.
- Ürün içinde AI yorumlayıcı veya sohbet botu yoktur.

## Lisans

GNU Affero General Public License v3.0. Ayrıntılar için `LICENSE` dosyasına bakın.

## Kullanım sınırı

Bu araç ön fizibilite içindir. Vergi, muhasebe ve hukuki uygulamalar ilgili uzmanlarla teyit edilmelidir.
