# Devir Notu — Kaynak Uyumlu Geçiş 01

## Tamamlanan çalışma

Steam Yayıncı Finansal Fizibilite v2 master prototipindeki hesap zinciri saf ve test edilebilir modüllere çıkarıldı.

Yeni dosyalar:

- `src/core/master-finance-engine-v2.js`
- `src/sectors/steam-publisher-config.js`
- `src/sectors/steam-publisher-core.js`
- `src/sectors/steam-publisher.js`
- `tests/master-finance-engine-v2.test.mjs`
- `docs/CORE_FINANCE_ENGINE_V2.md`

## Güvenlik kararı

Yeni motor mevcut `finance-engine.js` dosyasının üzerine yazılmadı. Kafe, e-ticaret, güzellik, ajans, SaaS, perakende ve oto hizmetleri aynı hesaplarla çalışmaya devam ediyor.

Steam yayıncısı henüz registry'ye eklenmedi. Bunun nedeni mevcut sektör şemasının masterdaki aşağıdaki alanları doğru ifade edememesidir:

- checkbox
- düzenlenebilir satır tablosu
- satır başına para birimi/select/checkbox
- koşullu panel
- birbiriyle çakışan seçeneklerin karşılıklı kapatılması
- bölge ve recoup tabloları

Eksik şema desteği tamamlanmadan sadeleştirilmiş bir Steam formu yayınlamak kaynak sadakatini bozacağı için tercih edilmedi.

## Golden test kapsamı

12 yeni test şunları kilitler:

- 6 oyun/dijital yayıncılık iş türü
- beklenen senaryo sonuçları
- kötümser senaryo zarar sonucu
- iyimser senaryo sonuçları
- dahil ve fiyat üstü vergi
- üç kademeli platform komisyonu
- yatırımın yalnız nakde girmesi
- hibenin ayrı P&L geliri olması
- recoup üst limiti
- Teknopark/yüzde 80 indirimi çakışması
- senaryo bağımsızlığı
- negatif değer normalizasyonu ve kaynak dizilerinin mutasyondan korunması

## Sıradaki doğru adım

`sector-schema.js` ve `app.js` aşağıdaki yeni alan türleriyle genişletilecek:

1. `checkbox`
2. `table`
3. `conditionalGroup`
4. satır alanlarında `number`, `rate`, `select`, `checkbox`
5. görünürlük koşulları
6. karşılıklı dışlayan alanlar

Ardından Steam yayıncısı referans sektör olarak registry'ye eklenecek. Bu tamamlandıktan sonra kafe/restoran sektörü, kendi iş yapısına özgü v2 derinlik modeline taşınacak.
