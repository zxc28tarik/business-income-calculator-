# Kaynak Uyum Denetimi — İlk Düzeltme Planı

## Sonuç

Başlangıç sırası kaynaklara tam uymadı. Planın Aşama 0 maddesi olan master prototipi koruma yapılmadan doğrudan genel bir motor ve yeni sektörler üretildi.

Bu hata, yazılan her şeyin silinmesini gerektirmiyor. Mevcut sektör modülleri ve test altyapısı kullanılabilir; ancak ortak motorun master kaynaktan yeniden çıkarılması ve oyun yayıncısı sektörünün platforma eklenmesi gerekir.

## Kaynak plan ile mevcut depo arasındaki farklar

### 1. Master dosya depoda yoktu — kritik

Kaynak plan, `01_oyun_yayincisi_master_model_v2.html` dosyasının bozulmadan korunmasını zorunlu tutuyor. Mevcut depoda bu dosya ve ona ait model notları bulunmuyordu.

**Düzeltme:** Master kaynak gzip+base64 parçalarıyla kayıpsız arşivlendi; materyalize edilen HTML’nin SHA-256 değeri testte doğrulanarak kilitlendi.

### 2. Steam oyun yayıncısı sektör listesinde yok — kritik

Master plan ilk iş türünü Steam oyun yayıncısı olarak tanımlıyor. Mevcut kayıt sistemi kafe ile başlıyor ve oyun sektörünü içermiyor.

**Düzeltme:** Ortak motor çıkarımı tamamlandıktan sonra oyun yayıncısı modeli ilk/referans sektör olarak kayıt sistemine eklenecek.

### 3. Ortak motor kaynaktan çıkarılmadı — kritik

Mevcut `src/core/finance-engine.js` faydalı fakat basitleştirilmiş bir motordur. Şu parçaları destekliyor:

- temel sayı/oran yardımcıları
- üç tip vergi ayrımı
- tek oranlı komisyon
- genel paydaş tabanı
- ikili arama başabaş
- genel şelale
- basit 12 aylık nakit akışı

Masterdaki şu katmanlar ortak motor seviyesinde bulunmuyor:

- çoklu para birimi ve kur dönüşümü
- kademeli komisyon
- kaynak ülke stopajı ve mahsup
- banka/kur tahsilat katmanı
- operasyonel gelir / hibe / finansman satır sınıflandırması
- recoup sırası, limiti ve mahsup zinciri
- advance/milestone/royalty settlement
- IP ve co-publisher payları
- kurum/şahıs vergi rejimi
- dilimli vergi
- devreden zarar
- temettü dağıtımı
- teşvik/istisna varsayımları
- launch öncesi nakit, runway ve farklı ödeme gecikmeleri

### 4. Sektör şeması master girdilerini ifade edemiyor — yüksek

Mevcut ortak form yapısı ağırlıklı olarak sayı ve seçim alanlarına göre kuruludur. Master modelde ise ayrıca şunlar vardır:

- checkbox alanları
- düzenlenebilir satır tabloları
- para birimi seçilen çoklu gider/gelir kalemleri
- satır bazlı recoup ve matrah bayrakları
- koşullu açılıp kapanan gelişmiş paneller

**Düzeltme:** Sektör şemasına `boolean`, `table`, koşullu görünürlük ve satır şeması desteği eklenmeli.

### 5. Tek HTML prototip teslimi yok — orta

Kaynak promptları her sektör için tek HTML/JS prototip istemektedir. Mevcut modüler web uygulaması ürün mimarisi açısından kullanılabilir; fakat tek HTML teslim gereksinimi için build/export çıktısı yoktur.

**Düzeltme:** Ana kod modüler kalabilir; her sektör için bağımsız tek HTML çıktısı üreten bir derleme/export adımı eklenmeli.

### 6. Mevcut sektörler kaynak dışı sayılmaz

Kafe, e-ticaret, güzellik, ajans, SaaS, perakende ve oto hizmetleri sırası kaynakla uyumludur. Bu modüller silinmeyecek. Daha zengin ortak motor ve şemaya kademeli olarak taşınacak.

## Düzeltme sırası

### Düzeltme 0 — Masterı koru

- Master HTML’yi değişmeden depoya ekle.
- Kaynak hashini kaydet.
- Model notlarını oluştur.
- Koruma testi ekle.

### Düzeltme 1 — Master için golden test üret

- Masterın varsayılan beklenen senaryo sonuçlarını kaydet.
- Kötümser ve iyimser senaryoları kaydet.
- Vergi tipi, kademeli komisyon, recoup ve finansman için hedef test örnekleri üret.

### Düzeltme 2 — Ortak motoru masterdan çıkar

Önerilen katmanlar:

```text
currency-engine
revenue-tax-engine
commission-engine
receipt-engine
stakeholder-recoup-engine
pnl-engine
tax-estimate-engine
cashflow-engine
breakeven-engine
report-data-engine
```

Mevcut `finance-engine.js` geriye uyumluluk katmanı olarak tutulabilir; sektörler bir anda kırılmadan yeni motorlara taşınır.

### Düzeltme 3 — Şemayı genişlet

- checkbox
- düzenlenebilir tablo
- para birimli satır
- satır bazlı bayraklar
- koşullu alan/panel
- sektör özel nakit tablosu kolonları

### Düzeltme 4 — Steam oyun yayıncısı sektörünü ekle

- Masterdaki tüm girdileri koru.
- Hesap sonuçlarını golden testlerle eşleştir.
- Platform kayıt sisteminde ilk referans sektör olarak göster.
- Master dosyayı yine değiştirme; sektör uygulaması ayrı dosyalarda olsun.

### Düzeltme 5 — Mevcut yedi sektörü yeni motora geçir

Her sektör ayrı ayrı taşınacak ve mevcut kabul testleri korunacak. Sonuç farkı oluşursa formül farkı açıkça belgelenecek.

### Düzeltme 6 — Yol haritasına geri dön

Kaynak uyumu sağlandıktan sonra rapor çıktıları aşamasına geçilecek.

## Bu turda yapılan güvenli düzeltme

Bu tur yalnız kaynak koruma ve denetim katmanıdır. Çalışan sektör formülleri değiştirilmemiştir. Böylece audit tamamlanmadan yeni bir finansal sapma yaratılmamıştır.
