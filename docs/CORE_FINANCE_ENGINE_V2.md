# Kaynak Uyumlu Finans Motoru v2

## Kaynak

Bu modül, korunan Steam Yayıncısı master prototipinin hesap sırasından çıkarılmıştır. Orijinal kaynak değiştirilmez; kaynak hash testiyle korunur.

## Yapı

- `src/core/master-finance-engine-v2.js`: ayrıntılı master hesap zinciri
- `src/core/finance-engine.js`: ilk yedi sektör için geriye uyumlu yardımcılar
- `src/sectors/steam-publisher-*.js`: Steam sektör girdileri, hesapları ve sunumu
- `tests/master-finance-engine-v2.test.mjs`: master davranış testleri
- `tests/steam-publisher-sector.test.mjs`: sektör bağlantı testleri

## v0.10.1 itibarıyla tamamlananlar

- master kaynak arşivi ve hash koruması
- üç senaryolu golden testler
- ayrıntılı v2 motor çıkarımı
- checkbox, metin, tablo ve koşullu alan şeması
- Steam Yayıncısı master profilinin sektör listesine bağlanması
- Steam form, KPI, şelale, senaryo ve nakit görünümü
- gerçek `index.html` kabuğunu okuyan uygulama testi
- Steam sektörünü seçip sonuçları render eden smoke testi

## Bekleyenler

- oyun/dijital yayıncılık alt iş türleri için ayrı profiller
- Kafe/Restoranın v2 derinliğine taşınması
- diğer sektörlerin kendi iş yapısına göre v2 geçişi
- bağımsız tek HTML çıktıları
- rapor ve gerçek takip aşamaları

## Geçiş kuralı

İlk yedi sektör, sonuç farkları belgelenip test edilmeden eski uyumluluk katmanından kaldırılmaz. Her sektör kendi gelir, gider, kapasite, gösterge ve uyarılarıyla ayrı uyarlanır.
