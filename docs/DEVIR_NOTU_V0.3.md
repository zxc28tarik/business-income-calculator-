# v0.3 Devir Notu

## Bu sürümde tamamlananlar

### Güzellik / Kuaför / Bakım

- 8 iş türü eklendi.
- Koltuk/oda/cihaz, çalışma saati ve seans süresinden teorik kapasite hesaplanıyor.
- Doluluk ve no-show ayrı modelleniyor.
- Gerçekleşen seans geliri, boş randevu kaybı ve tamamlanan seans sayısı ayrıştırılıyor.
- Seans başı sarf malzemesi ve çalışan primi hesaplanıyor.
- Günlük başabaş randevu ile başabaş doluluk bulunuyor.
- Personel başı ciro ve personel maliyet yükü hesaplanıyor.
- Cihaz yatırım tutarı, faydalı ömür ve aylık amortisman eklendi.
- Yaklaşık cihaz ve toplam kurulum geri dönüş süreleri eklendi.
- Güzellik sektörü için KPI, kim-ne-alıyor, şelale, senaryo, nakit ve ayrıntılı döküm panelleri tamamlandı.

### Ortak finans motoru

- `cashFixedCosts` desteği eklendi.
- Nakit dışı amortismanın 12 aylık nakit akışından ikinci kez düşülmesi önlendi.
- Fiyat üstü KDV’nin şelalede işletme gelirinden tekrar kesilmemesi sağlandı.

## Kabul testleri

- Teknik ve sözdizimi kontrolleri: geçti
- Ortak finans ve şema testleri: geçti
- Kafe sektör testleri: geçti
- E-ticaret sektör testleri: geçti
- Güzellik/kuaför sektör testleri: geçti
- İlk render ve üç sektör arasında geçiş testi: geçti
- Toplam otomatik test: 36/36

## Açık kalanlar

- Steam master prototip kaynak dosyası ZIP içinde bulunmadığı için depoya eklenmedi.
- Gerçek gelir-gider / ön muhasebe modu planlıdır, aktif değildir.
- MD backlog sırasındaki sonraki sektör: ajans / freelancer / danışmanlık.
