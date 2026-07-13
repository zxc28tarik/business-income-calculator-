# Güzellik / Kuaför / Bakım Sektör Modeli

## Sektör kimliği

```text
sector_id: beauty_personal_care
sector_name: Güzellik / Kuaför / Bakım
sector_family: Kişisel Bakım ve Hizmet
version: v0.1
status: simulation
```

## İş türleri

1. Kuaför
2. Berber
3. Güzellik salonu
4. Tırnak stüdyosu
5. Cilt bakım salonu
6. Lazer / epilasyon merkezi
7. Kaş / kirpik stüdyosu
8. Masaj / spa salonu

## Randevu kapasitesi

```text
günlük_teorik_kapasite
= istasyon_sayısı × günlük_çalışma_saati × 60 / seans_süresi

aylık_planlanan_randevu
= günlük_teorik_kapasite × açık_gün × doluluk_oranı

tamamlanan_seans
= aylık_planlanan_randevu × (1 - no_show_oranı)
```

Doluluk, kapasitenin takvime alınan kısmını; no-show ise takvime alındığı hâlde gelire dönüşmeyen kısmı temsil eder.

## Gelir zinciri

```text
planlanan_randevu_değeri = planlanan_randevu × hizmet_fiyatı
no_show_kaybı = no_show_randevu × hizmet_fiyatı
gerçekleşen_brüt_hizmet_geliri = tamamlanan_seans × hizmet_fiyatı
```

Fiyata dahil KDV yalnız gerçekleşen hizmet gelirinden ayrılır. Fiyat üstü KDV işletme gelirini azaltmaz; müşteri ödemesine eklenir.

## Değişken maliyetler

- Sarf malzeme: tamamlanan seans × seans başı sarf
- Çalışan primi: gerçekleşen KDV hariç hizmet geliri × prim oranı
- Diğer değişken maliyet: gerçekleşen KDV hariç hizmet geliri × oran
- POS komisyonu: gerçekleşen net hizmet gelirinin kartlı ödeme payı üzerinden

## Sabit gider ve amortisman

Cihaz yatırımı iki ayrı görünümde ele alınır:

1. **Kurulum/nakit:** Cihaz yatırım tutarı seçilen kurulum ayında nakitten bir kez düşer.
2. **P&L:** Aylık amortisman = cihaz yatırım tutarı / faydalı ömür ayı.

Aylık amortisman nakit dışı giderdir. Nakit akışında tekrar düşülmez.

## Başabaş

Model 0–100% doluluk aralığında ikili aramayla net kârın sıfıra ulaştığı doluluk oranını bulur.

```text
günlük_başabaş_randevu
= günlük_teorik_kapasite × başabaş_doluluk
```

Tam kapasitede dahi net kâr negatifse başabaş bulunamaz ve sert uyarı üretilir.

## Ana KPI’lar

- Aylık net kâr
- Seans başı net kâr
- Günlük başabaş randevu
- Başabaş doluluk
- Mevcut doluluk oranı
- Personel başı ciro
- Personel maliyet yükü
- Cihaz geri dönüş süresi
- Boş randevu kaybı
- 12 ay sonu nakit

## Cihaz geri dönüş yaklaşımı

```text
operasyonel_nakit_kâr_yaklaşımı = net_kâr + aylık_amortisman
cihaz_geri_dönüş_ayı = cihaz_yatırımı / operasyonel_nakit_kâr_yaklaşımı
```

Bu değer yaklaşık fizibilite göstergesidir; cihazın tek başına oluşturduğu ek gelir ayrıştırılmadığı için yatırım kararı yerine geçmez.

## Uyarı eşikleri

- Negatif net kâr: sert
- İlk 3 ay nakit açığı: sert
- Doluluk <%30: sert
- Doluluk <%50: yumuşak
- No-show >%15: sert
- No-show >%8: yumuşak
- Personel maliyet yükü >%60: sert
- Personel maliyet yükü >%45: yumuşak
- Amortisman/net hizmet geliri >%15: yumuşak
- Başabaş doluluk >%85: yumuşak
- Tam kapasitede başabaş yok: sert
