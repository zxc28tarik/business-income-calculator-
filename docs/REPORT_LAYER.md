# Aşama 7 — Finansal Rapor Katmanı

## Amaç

Her sektörün mevcut hesap sonucunu, paylaşılabilir ve yazdırılabilir bir finansal fizibilite raporuna dönüştürmek. Rapor yeni formül üretmez; sektörün normalizasyon, hesaplama, sunum, uyarı ve senaryo sonuçlarını ortak bir belge sözleşmesinde toplar.

## Kullanım

Ana platformda veya bağımsız tek HTML hesaplayıcıda **Rapor / HTML** düğmesine basılır. Aktif sektör, iş türü, senaryo ve güncel girdiler kullanılarak tek bir `.html` rapor dosyası indirilir.

Rapor dosyası:

- internet bağlantısı gerektirmez
- harici CSS, JavaScript, font veya CDN kullanmaz
- tarayıcıda açılabilir
- **Yazdır / PDF** düğmesiyle PDF'ye çevrilebilir
- e-posta, bulut depolama veya mesajlaşma araçlarıyla paylaşılabilir

## Rapor bölümleri

1. sektör, iş türü, senaryo, motor sürümü ve oluşturma zamanı
2. yönetici özeti
3. model görünümü: dengeli, koşullu veya riskli
4. sektörün kendi KPI kartları
5. kritik, dikkat ve bilgi uyarıları
6. kötümser, beklenen ve iyimser senaryo karşılaştırması
7. finansal dağılım
8. minimum nakit, dönem sonu nakit ve ilk negatif ay
9. 12 aylık nakit akışı
10. yalnız görünür durumdaki bütün form varsayımları
11. görünür gelişmiş tablo girdileri
12. kullanım ve danışmanlık sınırı

## Karar görünümü

Rapor bir yatırım tavsiyesi vermez. Yalnız modelin kendi sonuçlarını üç görünümde sınıflandırır:

- **Riskli görünüm:** dönem sonu nakit negatif, birden fazla kritik uyarı var veya zarar ile kritik uyarı birlikte oluşuyor.
- **Koşullu görünüm:** zarar, tek kritik uyarı veya çok sayıda dikkat uyarısı bulunuyor.
- **Dengeli görünüm:** yukarıdaki risk koşulları oluşmuyor.

Bu etiketler kesin yatırım kararı değildir. Girdi kalitesi, vergi uygulaması, fiyat değişimi, finansman koşulları ve gerçek operasyon sonuçları ayrıca değerlendirilmelidir.

## Mimari

- `src/report/report-model.js`: görünür varsayımlar, KPI, risk, senaryo ve nakit verilerinden ortak rapor modeli üretir.
- `src/report/report-document.js`: rapor modelini çevrimdışı tek HTML belgeye dönüştürür ve indirir.
- `src/report/report-controller.js`: ana uygulama ve bağımsız hesaplayıcı için ortak dışa aktarma girişidir.
- `tests/report-layer.test.mjs`: sekiz sektör sözleşmesi, risk sınıflandırması, bağımsız HTML ve HTML kaçış güvenliğini doğrular.

## Veri bütünlüğü

- Rapor aktif senaryonun normalize edilmiş girdisini kullanır.
- KPI ve senaryo metrikleri sektörün `buildPresentation` çıktısından gelir.
- Riskler sektörün kendi `warnings` listesinden gelir.
- Varsayımlar sektör form şemasından otomatik çıkarılır.
- Koşullu olarak gizlenen alanlar rapora eklenmez.
- Finans motoru ve rapor katmanı birbirinden ayrıdır.

## Güvenlik ve sınırlar

Kullanıcı metinleri HTML olarak çalıştırılmaz; belgeye kaçışlanarak yazılır. Rapor mali müşavirlik, vergi danışmanlığı, hukuki görüş veya yatırım tavsiyesi değildir.
