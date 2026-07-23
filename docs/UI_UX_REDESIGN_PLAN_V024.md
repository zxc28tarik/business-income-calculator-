# Business Income Calculator — v0.24 Profesyonel UI/UX Yenileme Planı

**Belge durumu:** Uygulama öncesi ana plan  
**Hedef sürüm:** `v0.24.0`  
**Kapsam:** Ana platform + 8 bağımsız tek HTML hesaplayıcı + rapor/yazdırma görünümü  
**Temel ilke:** Finans motorları, golden sonuçlar, veri şemaları ve hesaplama sırası değiştirilmeyecek.  
**Başarı tanımı:** Kullanıcı ilk 10 saniyede ne yapacağını, ilk 20 saniyede hangi girdilerin önemli olduğunu ve ilk sonuç ekranında işletmenin kârlılık/nakit durumunu anlayabilmeli.

---

## 1. Yönetici özeti

Mevcut ürün işlevsel olarak güçlüdür; sekiz sektör, üç senaryo, gerçek takip, portföy, yedekleme, rapor, CSV, yazdırma ve ayrıntılı finans dökümü aynı uygulamada çalışmaktadır. Ancak bu güç, üst alanda çok sayıda eşdeğer düğme, uzun form akışı ve sonuçların aynı görsel ağırlıkta sunulması nedeniyle ilk kullanımda karmaşıklık yaratmaktadır.

v0.24 yenilemesinin amacı yeni özellik eklemek değil, mevcut özellikleri doğru öncelik sırasına yerleştirmektir.

Yeni arayüz şu üç soruya sırasıyla cevap verecektir:

1. **Neyi hesaplıyorum?** — Kayıt, sektör, iş türü ve senaryo.
2. **Hangi varsayımları girmeliyim?** — Basit görünümde yalnız temel sürücüler; gelişmiş görünümde bütün sektör ayrıntıları.
3. **Sonuç ne söylüyor?** — Önce karar özeti, sonra ana KPI’lar, sonra riskler ve ayrıntılar.

Ana kullanıcı akışı:

```text
Kayıt seç / oluştur
        ↓
Sektör ve iş türünü seç
        ↓
Beklenen senaryonun temel varsayımlarını düzenle
        ↓
Karar özetini ve 4 ana KPI’yı gör
        ↓
Gerekirse riskleri, nakit akışını ve ayrıntılı tabloları aç
        ↓
Rapor / CSV / yedek çıktısı al
```

---

## 2. Değişmeyecek sözleşmeler

Aşağıdakiler bu yenilemede kesinlikle değiştirilmeyecektir:

- Sektörlerin hesap formülleri.
- P&L ve nakit ayrımı.
- Steam master golden sonuçları.
- Vergi, amortisman, hibe, yatırım ve finansman sınıflandırması.
- Üç senaryonun hesaplanma mantığı.
- Mevcut kayıt, portföy ve gerçek takip veri yapısı.
- JSON yedek şeması ve içe aktarma doğrulaması.
- Rapor ve CSV içerikleri.
- Mevcut sekiz sektör ve iş türleri.
- Tek HTML dosyalarının çevrimdışı çalışma özelliği.
- Kullanıcının kayıtlı yerel verileri.

UI değişikliği veri kaybı, değer sıfırlama veya finans sonucu farkı oluşturmamalıdır.

---

## 3. Mevcut arayüz sorunları

### 3.1 Üst alan

Mevcut üst alanda kayıt, yeni kayıt, adlandırma, kopyalama, portföy, yedek, içe aktarma, sektör, CSV, rapor, gerçek takip, yazdırma ve sıfırlama aynı görsel seviyede yer almaktadır.

Sorunlar:

- Birincil ve ikincil eylemler ayrışmıyor.
- Kullanıcı ilk bakışta hangi düğmenin hesaplamaya, hangisinin dosya yönetimine ait olduğunu anlayamıyor.
- Küçük ekranlarda üst alan hızla çok satırlı ve düzensiz hale geliyor.
- Tehlikeli işlem olan “Bu sektörü sıfırla”, sıradan dışa aktarma düğmeleriyle aynı görünümde.

### 3.2 Sol form alanı

- Sektör özeti, senaryo seçimi ve bütün form bölümleri aynı kaydırma akışında.
- Uzun sektörlerde kullanıcı bölüm sayısını ve ilerlemesini algılamakta zorlanıyor.
- Temel kullanıcı ile uzman kullanıcı aynı yoğunlukta alan görüyor.
- Akordeon başlıkları bölüm içeriğinin özetini göstermiyor.
- Gelişmiş tablolar ilk kullanımda gereğinden fazla bilişsel yük oluşturabiliyor.

### 3.3 Sağ sonuç alanı

- Uyarılar sonuçlardan önce geldiği için kullanıcı ilk anda negatif mesajlarla karşılaşıyor.
- Çok sayıdaki KPI aynı ağırlıkta sunuluyor; kritik 4 KPI ile ikincil ölçüler ayrışmıyor.
- Şelale, senaryo, nakit ve döküm blokları uzun bir sayfada peş peşe geliyor.
- Kullanıcı “Bu iş yapılabilir mi?” sorusunun cevabını tek bir karar kartında göremiyor.

### 3.4 Görsel sistem

- Koyu yeşil üst alan güçlü bir kimlik veriyor; fakat tüm beyaz düğmeler aynı ağırlıkta.
- Kart yarıçapları ve gölgeler bazı alanlarda gereğinden büyük görünerek finansal araçtan çok pazarlama paneli hissi yaratabiliyor.
- Sayısal değerler için sistem fontu kullanılıyor; tablo ve KPI hizalaması daha profesyonel tabular sayı sistemiyle güçlendirilebilir.
- Uyarı renkleri işlevsel olsa da başlık, önem seviyesi ve çözüm önerisi katmanları eksik.

---

## 4. Tasarım ilkeleri

### 4.1 Önce karar, sonra ayrıntı

Kullanıcı ilk ekran yüksekliğinde şunları görecektir:

- hangi kayıt/sektör üzerinde çalıştığı,
- hangi senaryonun aktif olduğu,
- modelin kârlı/riskli durumu,
- aylık net sonuç,
- başabaş,
- 12 ay sonu nakit,
- en önemli 1–3 risk.

Ayrıntılı dökümler ikinci seviyede kalacaktır.

### 4.2 Görünür karmaşıklığı azalt, işlevi kaldırma

Özellikler silinmeyecek; gruplanacak ve gerektiğinde açılacaktır.

- Sık kullanılan eylemler görünür.
- Nadir eylemler menü içinde.
- Temel girdiler Basit görünümde.
- İleri tablolar Gelişmiş görünümde.
- Uzun sonuçlar sekme/çapa navigasyonuyla erişilebilir.

### 4.3 Finansal araç ciddiyeti

- Rakamlar tabular hizalı.
- Renk yalnız anlam taşıdığında kullanılır.
- Gereksiz gradient, parlak efekt ve animasyon kullanılmaz.
- Metinler kısa, doğrudan ve Türkçe olur.
- “Akıllı” yorum görünümü yaratılmaz; sistem hesap sonucu ve kural tabanlı uyarı gösterir.

### 4.4 Her sektör aynı iskelet, farklı içerik

Sekiz sektör aynı bilgi mimarisini kullanacaktır:

```text
İş modeli → Talep/Gelir → Kapasite → Maliyet → Vergi/Finansman → Nakit → Gelişmiş
```

Sektörün kendi alanları ve terminolojisi korunur.

### 4.5 Güvenli etkileşim

- Otomatik kayıt görünür biçimde belirtilir.
- Sıfırlama ve silme işlemleri onay ister.
- İçe aktarma mevcut veriyi değiştirmeden önce özet gösterir.
- Başarılı dışa aktarma/indirme işlemleri kısa durum mesajı verir.

---

## 5. Hedef bilgi mimarisi

### 5.1 Sayfa bölgeleri

```text
┌──────────────────────────────────────────────────────────────┐
│ ÜRÜN BAŞLIĞI / AKTİF KAYIT / SEKTÖR / ANA EYLEMLER          │
├──────────────────────────────────────────────────────────────┤
│ SENARYO ŞERİDİ + BASİT/GELİŞMİŞ + OTOMATİK KAYIT DURUMU     │
├───────────────────────┬──────────────────────────────────────┤
│ VARSAYIMLAR           │ KARAR ÖZETİ                          │
│ akordeon bölümleri    │ 4 ana KPI                            │
│                       │ kritik riskler                       │
│                       │ sonuç navigasyonu                    │
├───────────────────────┼──────────────────────────────────────┤
│                       │ Kim ne alıyor?                       │
│                       │ Şelale                               │
│                       │ Senaryolar                           │
│                       │ Nakit                                │
│                       │ Ayrıntılı döküm                      │
└───────────────────────┴──────────────────────────────────────┘
```

### 5.2 Sonuç navigasyonu

Sağ sütunun başında yapışkan olmayan, sade bir çapa şeridi bulunur:

- Özet
- Dağılım
- Senaryolar
- Nakit
- Ayrıntılar

Bu şerit yeni ekran veya karmaşık tab sistemi oluşturmaz; aynı sayfadaki bölümlere kaydırır.

### 5.3 Ana görünüm seviyeleri

#### Basit görünüm

Hedef kullanıcı: İlk fizibilitesini hazırlayan işletme sahibi.

Gösterilecekler:

- iş türü,
- ana talep veya satış sürücüsü,
- ortalama fiyat,
- temel değişken maliyet,
- temel sabit gider,
- personel toplamı,
- vergi özeti,
- başlangıç nakdi,
- temel finansman.

Gizlenecekler:

- ayrıntılı hizmet/ürün karması tabloları,
- personel rol tabloları,
- kanal/tedarikçi tabloları,
- ileri stok, recoup veya cohort ayrıntıları,
- düşük sıklıkta kullanılan vergi/muhasebe ayrıntıları.

#### Gelişmiş görünüm

Mevcut bütün form alanları görünür. Hesaplama sonucu Basit görünümle birebir aynı motoru kullanır.

Görünüm tercihi tarayıcıda kullanıcı tercihi olarak saklanır; proje finans verisinin parçası yapılmaz.

---

## 6. Üst alanın ayrıntılı tasarımı

### 6.1 Ürün kimliği bölümü

Sol taraf:

- Küçük üst etiket: `BUSINESS INCOME CALCULATOR · v0.24.0`
- Ana başlık: sektör adı + “Finansal Fizibilite”
- Tek satırlık sektör açıklaması

Başlık masaüstünde en fazla iki satır olmalı. Açıklama en fazla 90 karakter görünmeli; daha uzun açıklamalar tam metin olarak erişilebilir kalmalı.

### 6.2 Çalışma bağlamı bölümü

Masaüstünde iki belirgin seçici:

1. **İşletme kaydı**
2. **Sektör**

Her seçici:

- üstünde küçük etiket,
- altında tek satırlık seçim alanı,
- minimum 44 px yükseklik,
- klavye ile tam kullanılabilirlik,
- aktif değeri kesmeden gösterecek genişlik.

### 6.3 Görünür ana eylemler

Üst alanda en fazla dört ana eylem görünür:

- `Yeni kayıt`
- `Gerçek takip`
- `Portföy`
- `Rapor al`

### 6.4 Menülere taşınacak eylemler

#### Kayıt menüsü

- Adlandır
- Kopyala
- Aktif kaydı sil

#### Dışa aktar menüsü

- Rapor / HTML
- CSV / Excel
- Yazdır / PDF

#### Veri menüsü

- Tam yedek indir
- Yedek içe aktar

#### Diğer menüsü

- Bu sektörü sıfırla
- Yardım / kullanım sınırı

### 6.5 Tehlikeli işlem görünümü

- “Bu sektörü sıfırla” kırmızı metinli menü öğesi olur.
- İlk tıklamada doğrudan sıfırlama yapılmaz.
- Onay penceresinde sektör adı ve etkilenecek aktif senaryo açıkça yazılır.
- Onay düğmesi: `Evet, sektör verisini sıfırla`
- İptal düğmesi varsayılan odak olur.

### 6.6 Otomatik kayıt göstergesi

Senaryo şeridinin sağında:

- değişiklik sırasında: `Kaydediliyor…`
- tamamlandığında: `Kaydedildi`
- hata durumunda: `Kaydedilemedi`

Bu gösterge 12 px boyutunda, sakin renkte olmalı; kullanıcıyı rahatsız eden toast kullanılmamalı.

---

## 7. Senaryo ve görünüm kontrolü

### 7.1 Senaryo şeridi

- Kötümser
- Beklenen
- İyimser

Kurallar:

- Aktif senaryo dolu yüzeyle gösterilir.
- Beklenen senaryo varsayılan olur.
- Senaryo değiştirmek mevcut değerleri korur.
- Her düğmede kısa yardımcı metin yalnız tooltip/erişilebilir açıklama olarak bulunur.
- Mobilde üç düğme aynı satırda kalır; metin taşarsa font küçültülmez, iç boşluk azaltılır.

### 7.2 Basit/Gelişmiş kontrolü

Senaryo şeridinin yanında iki durumlu seçim:

```text
[ Basit ] [ Gelişmiş ]
```

- Varsayılan: Basit.
- Gelişmiş görünümde küçük uyarı: `Bütün sektör ayrıntıları gösteriliyor.`
- Basit görünümde gizlenen alanların değerleri silinmez ve hesaplamaya dahil olmaya devam eder.
- Kullanıcı Basit görünümdeyken gizli bir alan kritik sonuç üretiyorsa ilgili uyarı “Gelişmiş ayarlarda kontrol edin” bağlantısı içerebilir.

---

## 8. Sol form paneli

### 8.1 Panel genişliği

- 1440 px ve üzeri: 420–440 px.
- 1120–1439 px: 380–420 px.
- 900 px altı: tam genişlik.
- Masaüstünde sticky kalır; ancak sayfa içi tekerlek hapsi yaratmamak için iç panelin bağımsız kaydırması yeniden değerlendirilecektir.

Önerilen davranış:

- 1200 px üzeri: sticky panel, `max-height: calc(100vh - 24px)`, görünür özel kaydırma çubuğu.
- 900–1199 px: sticky kapalı, normal belge akışı.

### 8.2 Sektör özet kartı

Mevcut koyu yeşil sektör kartı korunur fakat sadeleşir:

- sektör ailesi,
- sektör adı,
- aktif iş türü,
- simülasyon sürümü.

Kartta tekrar eden sayfa başlığı bulunmaz.

### 8.3 Akordeon bölüm yapısı

Her form bölümü şu sözleşmeyi kullanır:

```text
[Bölüm numarası] Bölüm adı                  [durum özeti] [+/−]
Kısa açıklama veya 1–2 önemli değer özeti
```

Örnek:

```text
1  İş türü ve gelir sürücüsü       B2B SaaS · 850 müşteri
2  Büyüme ve müşteri kaybı         +75 / ay · %4,5 kayıp
3  Fiyatlandırma                    1.250 TL / ay
4  Ekip ve kapasite                 6 kişi · %118 yük
```

### 8.4 Açık bölüm kuralları

Basit görünümde:

- ilk bölüm varsayılan açık,
- son düzenlenen bölüm açık kalır,
- aynı anda en fazla iki bölüm açık önerilir ancak zorunlu tek-akordeon uygulanmaz.

Gelişmiş görünümde:

- kullanıcı bütün bölümleri bağımsız açabilir,
- “Tümünü aç / Tümünü kapat” küçük metin eylemi bulunabilir.

### 8.5 Alan düzeni

Masaüstü sol panel:

- kısa alanlar iki sütun,
- açıklama gerektiren ve uzun seçimler tek sütun,
- oran alanlarında `%` son eki,
- para alanlarında `TL`, `USD`, `EUR` son eki,
- adet alanlarında birim açıklaması.

Mobil:

- bütün alanlar tek sütun,
- yan yana iki sayı alanı kullanılmaz,
- label ve input arasında en az 6 px,
- alanlar arasında en az 14 px.

### 8.6 Alan etiketi ve yardım metni

Her alan için üç katman:

1. kısa ana etiket,
2. gerekiyorsa birim,
3. kısa yardım metni.

Kötü örnek:

`Aylık yeni ücretli müşteri / abone`

İyi örnek:

`Aylık yeni müşteri`  
`Her ay ücretli plana başlayan ortalama müşteri sayısı.`

### 8.7 Hatalı ve sıra dışı değerler

- Geçersiz değer alan altında gösterilir.
- Sıfır veya aşırı yüksek ama teknik olarak geçerli değerler sarı “kontrol edin” mesajı alır.
- Hata metni yalnız renkle anlatılmaz; simge + metin kullanılır.
- Finans sonucu hesaplanabiliyorsa bütün form bloke edilmez.

### 8.8 Tablolar

Gelişmiş tablolar için:

- tablo başlığı ve kısa açıklama,
- sağda `Satır ekle`,
- sabit başlık,
- ilk sütun sticky olabilir,
- silme işlemi yalnız çöp simgesi değil `Kaldır` erişilebilir etiketi taşır,
- mobilde tablo kart satır görünümüne dönüştürülmezse yatay kaydırma açıkça belirtilir,
- tablonun altında `Yatay kaydırarak diğer sütunları görebilirsiniz.` metni yalnız dar ekranda görünür.

---

## 9. Sağ sonuç alanı

### 9.1 Yeni sonuç sırası

1. Karar özeti
2. Dört ana KPI
3. Kritik uyarılar
4. İkincil KPI’lar
5. Kim ne alıyor?
6. Şelale
7. Üç senaryo
8. 12 aylık nakit
9. Ayrıntılı döküm
10. Kullanım sınırı

### 9.2 Karar özeti kartı

Tek büyük kart, şu alanları içerir:

- Durum etiketi: `Dengeli`, `Dikkat`, `Riskli`
- Tek cümlelik sonuç
- Aylık net sonuç
- 12 ay sonu nakit
- Başabaş durumu
- Ana risk sayısı

Örnek:

```text
RİSKLİ MODEL
Mevcut varsayımlarda işletme aylık zarar ediyor ve destek kapasitesi talebi karşılamıyor.
Aylık net: -104.172 TL | 12 ay nakit: -680.000 TL | 3 kritik risk
```

Kurallar:

- “Dengeli” yatırım tavsiyesi anlamına gelmez.
- Metin yalnız mevcut hesap sonucu ve uyarı kurallarından türetilir.
- Sektöre özgü ana sürücü kısa olarak eklenebilir.

### 9.3 Dört ana KPI

Her sektör için sunum katmanında öncelik sırası tanımlanır.

Ortak hedefler:

1. Aylık net sonuç
2. Brüt/ana gelir
3. Başabaş
4. 12 ay sonu nakit veya minimum nakit

Sektör özelinde ana gelir metriği değişebilir:

- SaaS: MRR
- Oyun: yayıncı net kârı / tahsilat
- Kafe: aylık ciro
- E-ticaret: net satış geliri
- Güzellik: aylık hizmet geliri
- Ajans: aylık tahsilat / kullanılabilir kapasite
- Perakende: aylık net satış
- Oto: aylık tamamlanan iş / gelir

### 9.4 İkincil KPI bölümü

- Başlangıçta ilk 4–8 ikincil KPI görünür.
- `Tüm KPI’ları göster` bağlantısıyla genişler.
- Negatif kartlar açık kırmızı yüzey, pozitif kartlar gerektiğinde açık yeşil işaret kullanır.
- Nötr KPI’lar beyaz yüzeyde kalır.

### 9.5 KPI görsel sözleşmesi

```text
ETİKET
1.108.438 TL
Kısa açıklama                    [−11,3%]
```

- Etiket: 11–12 px, büyük harf değil; okunabilir normal yazım.
- Değer: 26–32 px.
- Para ve oranlarda tabular sayı.
- En fazla iki satır açıklama.
- Kart yüksekliği aynı sıra içinde eşit.

---

## 10. Uyarı sistemi

### 10.1 Önem seviyeleri

#### Kritik

- aylık zarar,
- negatif minimum nakit,
- kapasite üstü talep,
- sürdürülemez borç/finansman,
- matematiksel olarak ulaşılamayan başabaş.

Görünüm: açık kırmızı zemin, kırmızı sol şerit, `Kritik` etiketi.

#### Dikkat

- düşük marj,
- yüksek churn/iade,
- stok veya kapasite riski,
- yüksek sabit gider oranı,
- uzun tedarik/ödeme gecikmesi.

Görünüm: açık sarı zemin, amber sol şerit, `Dikkat` etiketi.

#### Bilgi

- varsayılan oran teyidi,
- görünür olmayan gelişmiş alan etkisi,
- raporlama/muhasebe sınırlaması.

Görünüm: açık mavi-gri zemin, nötr sol şerit, `Bilgi` etiketi.

#### Olumlu

Yalnız gerçekten karar değeri taşıyan durumda gösterilir:

- pozitif nakit tamponu,
- kapasite içinde çalışma,
- recoup kapanışı.

Olumlu mesaj sayısı sınırlandırılır; ekran “her şey yeşil” gürültüsüne dönüştürülmez.

### 10.2 Uyarı içeriği

Her uyarı:

- kısa başlık,
- bir cümle açıklama,
- gerekiyorsa ilgili ayara bağlantı,
- asla uzun paragraf olmamalı.

Örnek:

```text
Kritik · Aylık zarar
Beklenen senaryoda aylık net sonuç -104.172 TL. Fiyat, müşteri sayısı veya sabit gider varsayımlarını kontrol edin.
[Gelir varsayımlarına git]
```

### 10.3 Uyarı yoğunluğu

- İlk ekranda en fazla 3 uyarı tam gösterilir.
- Diğerleri `5 uyarının tümünü göster` altında açılır.
- Kritik uyarılar hiçbir zaman tamamen gizlenmez.

---

## 11. Sonuç bölümleri

### 11.1 Kim ne alıyor?

- İki sütunlu sade liste.
- Son toplam satırı belirgin.
- Paydaş/geliştirici gibi özel satırlar ayrı vurgu rengi alabilir.
- Negatif işaret ve kesinti dili tutarlı olmalı.

### 11.2 Şelale

- Grafik korunur.
- Satır yüksekliği azaltılır.
- Kesintiler amber, paydaş ödemeleri mor, kalan net tutar yeşil.
- Küçük tutarlar minimum çubukla görünür fakat ölçek açıklaması bulunur.
- Mobilde etiket ve tutar ilk satır; çubuk ikinci satır.

### 11.3 Senaryo karşılaştırması

- Beklenen sütun açık vurgu yüzeyi alır.
- Ana sonuç satırları üstte sabitlenir veya daha belirgin yapılır.
- Kötümser/beklenen/iyimser renkleri aşırı kullanılmaz.
- Mobilde yatay kaydırma ve ilk sütun sticky.

### 11.4 Nakit akışı

Önce özet satırı:

- minimum nakit,
- ilk negatif ay,
- 12 ay sonu nakit,
- ek finansman ihtiyacı.

Ardından tablo.

Negatif nakit hücreleri:

- kırmızı metin,
- hafif kırmızı arka plan,
- ekran okuyucu için `Negatif nakit` açıklaması.

### 11.5 Ayrıntılı döküm

- Varsayılan kapalı gelir.
- Grup başlıkları açılır/kapanır.
- Gelir, gider, vergi ve nakit grupları ayrılır.
- `Tümünü aç` eylemi bulunur.
- Finans denetim izi kaybolmaz.

---

## 12. Portföy ve gerçek takip deneyimi

### 12.1 Portföy

Portföy tam sayfa benzeri panel olarak sonuç alanının üstünü kaplamamalıdır.

Öneri:

- masaüstünde sağdan açılan geniş çekmece veya ana içerikte odaklı panel,
- mobilde tam ekran panel,
- üstte kayıt sayısı ve toplam durum özeti,
- tabloda ilk sütun sticky,
- aktif kayıt satırı vurgulu,
- satıra tıklayınca ilgili kayda geçiş.

Portföy ana tabloda:

- kayıt adı,
- sektör,
- senaryo,
- aylık net sonuç,
- 12 ay nakit,
- durum.

Daha fazla KPI isteğe bağlı ayrıntıda kalır.

### 12.2 Gerçek takip

- Ayrı çalışma modu hissi vermeli.
- Başlık altında `Plan` ve `Gerçekleşen` farkı açıkça anlatılmalı.
- İlk ekranda aylık özet kartları.
- Geniş tablo varsayılan olarak son 6 ayı görünür kılabilir; diğer aylar yatay kaydırılır.
- Sapma nedenleri metin alanı okunabilir genişlikte olmalı.
- Plan ve gerçekleşen renkleri tutarlı kalmalı.

---

## 13. Tasarım sistemi

### 13.1 Renk paleti

```css
--page:          #F3F5F4;
--surface:       #FFFFFF;
--surface-soft:  #F7F9F8;
--ink:           #17221D;
--ink-soft:      #5E6B64;
--line:          #D8DFDB;
--brand:         #174A35;
--brand-hover:   #123C2B;
--brand-soft:    #E5F0EA;
--positive:      #17603B;
--positive-soft: #E4F3EA;
--warning:       #8A5B08;
--warning-soft:  #FFF2CF;
--danger:        #A2342D;
--danger-soft:   #FBE8E5;
--info:          #355F7A;
--info-soft:     #E8F0F5;
--stakeholder:   #6D5682;
--stakeholder-soft:#EFEAF3;
--focus:         #E3A62F;
```

Kurallar:

- Marka yeşili yalnız navigasyon, aktif seçim ve ana sonuçlarda.
- Kırmızı yalnız hata/risk/negatif sonuçlarda.
- Sarı yalnız dikkat/varsayım teyidinde.
- Mor yalnız paydaş/geliştirici ayrımında.
- Nötr kartlar beyaz kalır.

### 13.2 Tipografi

Harici font zorunlu olmayacaktır; çevrimdışı tek HTML desteği korunacaktır.

Metin ailesi:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

Sayısal aile:

```css
font-family: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
font-variant-numeric: tabular-nums;
```

Harici font dosyası eklenmeyecek. Sistemlerde IBM Plex Mono yoksa güvenli monospace yedek kullanılacaktır.

Boyut ölçeği:

- 11 px: üst etiket, durum etiketi
- 12 px: yardım ve tablo başlığı
- 13–14 px: gövde/alan etiketi
- 16 px: kart alt başlığı
- 20–22 px: bölüm başlığı
- 28–34 px: KPI değeri
- 36–48 px: sayfa başlığı

### 13.3 Boşluk ölçeği

```text
4, 8, 12, 16, 20, 24, 32, 40, 48
```

Bileşenler yalnız bu ölçeği kullanmalıdır.

### 13.4 Köşe ve gölge

- küçük kontrol: 8 px
- input/button: 10 px
- kart: 12 px
- büyük panel: 14 px
- aşırı 18–20 px yuvarlaklık kaldırılır

Gölge:

- normal kartlarda mümkünse yok,
- yalnız yapışkan üst/menü/çekmece katmanında hafif gölge,
- finansal tablo ve form bölümlerinde sınır çizgisi ana ayrım aracı.

### 13.5 Simge kullanımı

- Simge tek başına kullanılmaz; erişilebilir metin bulunur.
- Yeni kayıt: `+`
- Dışa aktar: aşağı ok/dosya
- Menü: üç nokta
- Uyarı: ünlem
- Başarı: onay
- Sıfırla/sil: çöp veya geri al simgesi + metin

İlk sürümde yeni ikon kütüphanesi eklemek yerine küçük inline SVG veya metin kullanılmalıdır.

---

## 14. Mikro metin standardı

### 14.1 Düğmeler

- `Yeni` → `Yeni kayıt`
- `Adlandır` → `Adını değiştir`
- `Kopyala` → `Kaydı kopyala`
- `Yedek` → `Tam yedek indir`
- `İçe Aktar` → `Yedek içe aktar`
- `CSV / Excel` → `CSV indir`
- `Rapor / HTML` → `Rapor indir`
- `Gerçek Takip` → `Gerçek takip`
- `Bu sektörü sıfırla` → menü içinde `Sektör verisini sıfırla`

### 14.2 Başlıklar

- `KPI özeti` → `Ana sonuçlar`
- `Risk kontrolü` → `Dikkat edilmesi gerekenler`
- `Kim ne alıyor?` korunabilir.
- `Üç senaryo` → `Senaryo karşılaştırması`
- `Denetim izi` → `Ayrıntılı finans dökümü`

### 14.3 Durum ifadeleri

- `Dengeli`: Model temel varsayımlarda pozitif ve nakit açığı göstermiyor.
- `Dikkat`: Sonuç pozitif olabilir fakat bir veya daha fazla belirgin risk var.
- `Riskli`: Zarar, nakit açığı veya kritik kapasite sorunu var.

“İyi yatırım”, “garantili”, “önerilir” gibi ifadeler kullanılmaz.

---

## 15. Erişilebilirlik standardı

Hedef: WCAG 2.2 AA.

Zorunlu maddeler:

- Klavye ile bütün ana işlevler.
- Görünür `focus-visible`.
- 44 × 44 px minimum dokunma hedefi.
- Renk kontrastı en az 4.5:1; büyük metinde 3:1.
- Uyarılar yalnız renkle ayrılmaz.
- Menü açılma durumu `aria-expanded` ile belirtilir.
- Açılır menüler Escape ile kapanır.
- Modal/çekmece odağı içeride tutar ve kapanınca tetikleyiciye döner.
- Akordeon başlıkları gerçek `button` veya erişilebilir `summary` kullanır.
- Dinamik kayıt mesajları `aria-live="polite"`.
- Kritik hata mesajları gerektiğinde `role="alert"`.
- Tablo bölgeleri adlandırılır ve klavye ile odaklanabilir.
- Sayısal işaretlerin ekran okuyucuda anlaşılması için görünmez açıklamalar eklenebilir.
- `prefers-reduced-motion` korunur.
- `prefers-contrast: more` için sınırlar güçlendirilebilir.
- Yakınlaştırma %200’de yatay sayfa taşması olmamalıdır; yalnız geniş tablolar kendi bölgesinde kayabilir.

---

## 16. Responsive davranış

### 16.1 1440 px ve üzeri

- Sol panel: 420–440 px.
- Sağ panel: kalan alan.
- Üst bar tek ana satır + kontrol satırı.
- KPI: 4 sütun.

### 16.2 1120–1439 px

- Sol panel: 380–410 px.
- KPI: 2 veya 4 sütun, minimum kart genişliğine göre.
- Üst eylemler menülerde daha fazla gruplanır.

### 16.3 900–1119 px

- Tek sütun ana düzen.
- Form sonuçların üstüne gelir.
- Sticky form kapatılır.
- Karar özeti formdan hemen sonra.
- KPI 2 sütun.

### 16.4 680–899 px

- Üst alan dikey.
- Kayıt ve sektör seçicileri tam genişlik.
- Ana eylemler 2 × 2 grid.
- KPI 2 sütun.
- Sonuç navigasyonu yatay kaydırılabilir.

### 16.5 320–679 px

- Bütün alanlar tek sütun.
- KPI tek sütun.
- Ana eylemler tam genişlik veya iki sütun.
- Tablo konteynerleri sayfa taşması yaratmaz.
- Menü/çekmece tam ekran.
- Sayfa başlığı 30–34 px.
- Form ve sonuç kartlarında 14–16 px iç boşluk.

---

## 17. Etkileşim durumları

Her bileşen şu durumlara sahip olmalıdır:

- normal,
- hover,
- focus,
- active,
- disabled,
- loading,
- success,
- error.

### 17.1 Dışa aktarma

Düğme akışı:

```text
Rapor indir → Hazırlanıyor… → Rapor indirildi
```

Hata:

```text
Rapor oluşturulamadı. Verileriniz değişmedi.
```

### 17.2 İçe aktarma

İçe aktarma öncesi özet:

- yedek sürümü,
- kayıt sayısı,
- kapsam,
- oluşturulma tarihi,
- değiştirilecek mevcut kayıt sayısı.

Onay olmadan veri değiştirilmez.

### 17.3 Boş/ilk kullanım durumu

İlk kayıtta kısa yönlendirme:

```text
1. Sektörü seçin
2. Beklenen senaryonun temel değerlerini girin
3. Sağdaki ana sonuçları kontrol edin
```

Bu yönlendirme kalıcı onboarding turu değil; ilk kullanımda kapatılabilir kısa bir bilgi kartıdır.

---

## 18. Rapor, yazdırma ve bağımsız HTML uyumu

### 18.1 Ana platform

- Yeni bilgi hiyerarşisi ekranda uygulanır.
- Rapor hesap değerlerini aynı kaynaklardan almaya devam eder.
- UI için eklenen özet sınıflandırması raporda yeniden hesaplanmaz; ortak sunum yardımcılarından okunur.

### 18.2 Yazdırma/PDF

Yazdırmada gizlenecekler:

- form paneli,
- üst eylemler,
- menüler,
- görünüm seçici,
- gereksiz navigasyon.

Yazdırmada gösterilecekler:

- sektör/kayıt/senaryo,
- karar özeti,
- ana KPI,
- uyarılar,
- senaryo,
- nakit,
- ayrıntılı döküm,
- kullanım sınırı.

### 18.3 Bağımsız tek HTML

Ana platformla görsel sözleşme aynı olacaktır:

- aynı tokenlar,
- aynı form bileşenleri,
- aynı sonuç hiyerarşisi,
- aynı basit/gelişmiş görünüm,
- aynı erişilebilirlik davranışı.

Bağımsız dosyada sektör seçici bulunmaz; sektör kimliği başlıkta sabittir. Kayıt, rapor, takip ve yedek işlevleri korunur.

---

## 19. Teknik uygulama haritası

### 19.1 `index.html`

Yapılacaklar:

- üst alanı ürün başlığı + çalışma bağlamı + ana eylemler şeklinde bölmek,
- açılır eylem menülerinin HTML kabuğunu eklemek,
- Basit/Gelişmiş görünüm seçicisini eklemek,
- otomatik kayıt durum alanı eklemek,
- karar özeti alanı eklemek,
- sonuç çapa navigasyonu eklemek,
- uyarıları KPI’dan sonra konumlandırmak,
- ayrıntılı KPI bölümü için aç/kapat alanı eklemek.

### 19.2 `styles.css`

Yapılacaklar:

- token sistemini v0.24 paletine taşımak,
- kart yarıçaplarını ve gölgeleri sadeleştirmek,
- yeni üst alan grid yapısı,
- menü/çekmece/modal temel stilleri,
- karar özeti,
- ana/ikincil KPI ayrımı,
- responsive breakpointler,
- print düzeni.

### 19.3 `styles-advanced.css`

Yapılacaklar:

- tablo ve checkbox bileşenlerini yeni tokenlara uyarlamak,
- portföy ve tracking çekmece/panel yapısı,
- geniş tablo mobil yardım etiketi,
- erişilebilir focus ve yüksek kontrast geliştirmeleri,
- basit görünümde gizlenen alan sınıfları.

### 19.4 `src/app.js`

Yapılacaklar:

- görünüm tercihini yönetmek,
- menü aç/kapat olayları,
- otomatik kayıt durum göstergesi,
- karar özeti render çağrısı,
- KPI önceliklendirme,
- uyarı sayısını sınırlama/genişletme,
- sıfırlama onayı,
- çapa navigasyon.

Finans hesap fonksiyonlarına dokunulmayacaktır.

### 19.5 `src/ui/form-view.js`

Yapılacaklar:

- alanlara `importance: basic|advanced` görünürlük desteği,
- bölüm özet metni üretimi,
- bölüm numarası ve kısa açıklama,
- alan birim son ekleri,
- tablo mobil yardım metni,
- erişilebilir hata/hint bağları.

Mevcut sektör şeması topluca değiştirilmeden, geriye uyumlu varsayılanlarla genişletilecektir.

### 19.6 `src/ui/results-view.js`

Yapılacaklar:

- karar özeti render fonksiyonu,
- ana ve ikincil KPI ayrımı,
- uyarı başlığı/seviyesi/aksiyon yapısı,
- nakit özet satırı,
- ayrıntılı döküm akordeonları,
- tablo hücre durum sınıfları.

### 19.7 Yeni önerilen yardımcı modüller

```text
src/ui/action-menu.js
src/ui/view-mode.js
src/ui/decision-summary.js
src/ui/disclosure-state.js
src/ui/confirm-dialog.js
```

Amaç: `app.js` dosyasını daha fazla büyütmeden UI durumlarını ayırmak.

### 19.8 `src/standalone-runtime.js`

- aynı görünüm tercihi,
- aynı menü grupları,
- aynı karar özeti,
- sektör seçici hariç aynı bileşen sözleşmesi.

### 19.9 `scripts/build-standalone.mjs`

- yeni CSS ve UI modüllerinin otomatik gömüldüğünü doğrulamak,
- tek dosya boyut sınırını korumak,
- dış bağımlılık eklenmediğini test etmek.

---

## 20. Test planı

### 20.1 Birim testleri

Yeni test alanları:

- Basit görünüm yalnız temel alanları gösterir.
- Gelişmiş görünüm bütün alanları gösterir.
- Görünüm değiştirmek girdi değerini değiştirmez.
- Karar özeti mevcut sonuç ve uyarılardan doğru durum üretir.
- Ana KPI seçimi sektöre göre belirlenen önceliği kullanır.
- Uyarı seviyeleri doğru sınıflanır.
- Sıfırlama onaysız gerçekleşmez.
- Menü öğeleri doğru eylemi çağırır.

### 20.2 Finans regresyon testleri

- 227 mevcut testin tamamı geçmeli.
- Bütün golden sonuçlar değişmeden kalmalı.
- Aynı girdi için v0.23 ve v0.24 finans çıktısı birebir aynı olmalı.
- Rapor ve CSV sayısal değerleri aynı kalmalı.

### 20.3 E2E masaüstü

Test akışları:

1. Site açılır, karar özeti görünür.
2. Sektör değiştirilir, başlık/form/KPI güncellenir.
3. Basit/Gelişmiş görünüm değiştirilir.
4. Form değeri değiştirilir, otomatik kayıt durumu görünür.
5. Menü açılır, rapor/CSV eylemleri erişilebilir.
6. Sıfırlama onayı iptal edilir; veri korunur.
7. Portföy açılır/kapanır.
8. Gerçek takip açılır/kapanır.

### 20.4 E2E mobil

Pixel 7 ve 360 × 800 görünüm:

- sayfa seviyesinde yatay taşma yok,
- üst eylemler anlaşılır,
- menü tam kullanılabilir,
- KPI tek sütun,
- form alanları tek sütun,
- tablolar yalnız kendi bölgesinde kayar,
- karar özeti formdan sonra görünür,
- focus sırası mantıklı.

### 20.5 Erişilebilirlik

- axe ciddi/kritik ihlal: 0.
- WCAG A/AA denetimi.
- Klavye menü ve modal testi.
- %200 zoom testi.
- reduced motion testi.
- ekran okuyucu için başlık hiyerarşisi ve canlı bölge kontrolü.

### 20.6 Görsel regresyon

En az şu ekranlar ekran görüntüsü karşılaştırmasına alınır:

- SaaS beklenen masaüstü,
- Kafe gelişmiş masaüstü,
- Oyun yayıncı mobil,
- Portföy açık,
- Gerçek takip açık,
- Kritik uyarılı sonuç,
- pozitif/dengeli sonuç,
- yazdırma önizlemesi.

Piksel birebir katı test yerine ana yerleşim ve taşma testleri tercih edilir.

---

## 21. Performans hedefleri

- Harici UI kütüphanesi eklenmeyecek.
- Harici ikon kütüphanesi eklenmeyecek.
- İlk yükte mevcut ESM yapısı korunacak.
- Ana CSS toplam artışı tercihen 35 KB altında.
- Yeni JavaScript toplam artışı tercihen 30 KB altında sıkıştırılmamış.
- Menü ve akordeonlarda ağır animasyon kullanılmayacak.
- Form girdisinde hesap renderı kullanıcıyı kilitlememeli.
- Büyük tracking tablolarında gereksiz tüm DOM yeniden üretimi izlenecek.
- Tek HTML dosyaları 2 MB sınırının altında kalmalı.

---

## 22. Uygulama aşamaları

### Aşama 0 — Ölçüm ve güvenlik tabanı

Görevler:

- v0.23 canlı ekran görüntülerini arşivle.
- Sekiz sektör için varsayılan finans JSON çıktısını kaydet.
- Mevcut E2E ve axe sonuçlarını taban kabul et.
- UI değişikliği dalı aç.

Çıkış ölçütü:

- mevcut 227 test yeşil,
- sekiz varsayılan sonuç hash’i kayıtlı.

### Aşama 1 — Tasarım tokenları ve kabuk

Görevler:

- renk, tipografi, boşluk ve radius tokenları,
- yeni sayfa arka planı,
- üst alan grid’i,
- kart ve input standardı,
- sayısal font sınıfı.

Çıkış ölçütü:

- işlev değişmeden yeni temel görünüm,
- masaüstü/mobil taşma yok.

### Aşama 2 — Üst eylem sadeleştirmesi

Görevler:

- ana eylemler,
- kayıt/dışa aktar/veri/diğer menüleri,
- Escape ve dışarı tıklama davranışı,
- sıfırlama onayı,
- otomatik kayıt göstergesi.

Çıkış ölçütü:

- üstte en fazla 4 ana eylem,
- bütün eski işlevler menülerden erişilebilir.

### Aşama 3 — Basit/Gelişmiş form görünümü

Görevler:

- alan önem seviyeleri,
- görünüm seçici,
- bölüm özetleri,
- alan mikro metinleri,
- tablo görünürlükleri.

Çıkış ölçütü:

- Basit görünümde sektör başına temel alan sayısı yaklaşık 8–16,
- Gelişmiş görünümde hiçbir mevcut alan kaybolmuyor,
- finans sonucu değişmiyor.

### Aşama 4 — Karar özeti ve KPI hiyerarşisi

Görevler:

- karar kartı,
- sektör ana KPI önceliği,
- ikincil KPI genişletme,
- uyarı sırasının değiştirilmesi.

Çıkış ölçütü:

- ilk ekran yüksekliğinde karar durumu ve 4 ana KPI görülüyor.

### Aşama 5 — Uyarı ve ayrıntı panelleri

Görevler:

- uyarı başlığı/seviye/aksiyon,
- ilk 3 uyarı + genişletme,
- nakit özet satırı,
- döküm akordeonları,
- tablo sticky sütunları.

Çıkış ölçütü:

- kritik riskler gizlenmiyor,
- ayrıntılar isteğe bağlı açılıyor.

### Aşama 6 — Portföy ve gerçek takip düzeni

Görevler:

- portföy odak paneli/çekmece,
- aktif kayıt vurgusu,
- tracking özet hiyerarşisi,
- mobil tam ekran davranışı.

Çıkış ölçütü:

- geniş tablolar sayfa taşması oluşturmuyor,
- kayıt geçişi ve takip izolasyonu korunuyor.

### Aşama 7 — Standalone, rapor ve yazdırma eşliği

Görevler:

- sekiz tek HTML yeniden üretim,
- aynı token ve bileşenler,
- print görünümü,
- rapor/CSV regresyon kontrolü.

Çıkış ölçütü:

- ana platform ve bağımsız dosyalar aynı UI sözleşmesini taşıyor.

### Aşama 8 — Son kalite ve yayın

Görevler:

- bütün birim/entegrasyon testleri,
- Chromium desktop/mobile,
- axe,
- %200 zoom,
- production build,
- Pages önizleme veya dal artefaktı,
- kullanıcı kabul kontrolü.

Çıkış ölçütü:

- bütün testler yeşil,
- finans farkı 0,
- ciddi/kritik axe ihlali 0,
- canlı yayın yalnız açık onayla.

---

## 23. Kabul ölçütleri

### Kullanılabilirlik

- İlk kez gelen kullanıcı sektör, senaryo ve temel giriş alanını açıklama almadan bulabilmeli.
- Üst alanda eşdeğer ağırlıkta 10+ düğme bulunmamalı.
- Ana sonuçlar ayrıntılı tablolardan önce görünmeli.
- Basit görünümde gelişmiş tablo görünmemeli.
- Bütün mevcut özelliklere en fazla iki etkileşimle ulaşılmalı.

### Görsel kalite

- Kart radius ve boşlukları tutarlı.
- Ana renk rolleri belgeyle uyumlu.
- Sayılar tabular hizalı.
- Uyarı seviyeleri görsel ve metinsel ayrışıyor.
- Mobilde hiçbir ana kontrol kesilmiyor.

### Teknik kalite

- Mevcut finans sonuçlarında değişiklik yok.
- Yerel kayıt ve yedek migrasyonu gerekmiyor veya geriye uyumlu.
- 8 standalone dosya üretiliyor.
- Production build geçiyor.
- E2E ve erişilebilirlik testleri geçiyor.

### Güvenlik

- Sıfırlama ve silme onaylı.
- İçe aktarma özetli ve onaylı.
- Kullanıcı girdisi HTML olarak çalıştırılmıyor.
- Dışa aktarma işlevleri mevcut kaçış güvenliğini koruyor.

---

## 24. Yapılmayacaklar

- Finans formülü değiştirmek.
- Yeni sektör eklemek.
- AI sohbet/yorumlayıcı eklemek.
- Kullanıcı hesabı veya bulut veritabanı eklemek.
- Dashboard’a gereksiz grafik eklemek.
- Her KPI’ya ayrı renk vermek.
- Mobilde masaüstü tablosunu okunamaz ölçüde küçültmek.
- Harici büyük UI framework eklemek.
- Tek HTML çevrimdışı özelliğini bozmak.
- Kullanıcı verisini otomatik silmek veya yeniden adlandırmak.

---

## 25. Önceliklendirilmiş görev listesi

### P0 — Yayın engelleyici

- [ ] Finans sonuçlarının birebir korunması
- [ ] Üst eylemlerin sadeleştirilmesi
- [ ] Karar özeti + 4 ana KPI
- [ ] Basit/Gelişmiş görünüm
- [ ] Mobil yatay taşma olmaması
- [ ] Sıfırlama/silme onayı
- [ ] WCAG ciddi/kritik ihlal olmaması

### P1 — Ana kalite

- [ ] Bölüm özetleri
- [ ] Uyarı önem sistemi
- [ ] İkincil KPI genişletme
- [ ] Nakit özet satırı
- [ ] Ayrıntılı döküm akordeonu
- [ ] Portföy ve tracking düzeni
- [ ] Standalone eşliği

### P2 — İnce iyileştirmeler

- [ ] Otomatik kayıt durumu
- [ ] İlk kullanım kısa yönlendirmesi
- [ ] %200 zoom güçlendirmeleri
- [ ] Yüksek kontrast tercihi
- [ ] Görsel regresyon ekran görüntüleri
- [ ] Mikro metinlerin sektör bazında gözden geçirilmesi

---

## 26. Nihai hedef ekran davranışı

Kullanıcı canlı siteyi açtığında:

1. Koyu fakat daha kompakt üst alanda kayıt ve sektörü görür.
2. En fazla dört ana eylem görür; dosya ve yönetim seçenekleri menüdedir.
3. Beklenen senaryo ve Basit görünüm aktiftir.
4. Sol panelde yalnız temel varsayımlar görünür.
5. Sağda karar özeti ve dört ana KPI görünür.
6. Kritik riskler kısa ve anlaşılır biçimde yer alır.
7. Kullanıcı ayrıntıya ihtiyaç duyarsa senaryo, nakit ve döküm bölümlerine iner.
8. Uzman kullanıcı Gelişmiş görünümü açarak mevcut bütün alanlara ulaşır.
9. Hiçbir görünüm değişikliği finans sonucunu veya kayıtlı veriyi değiştirmez.

Bu planın başarısı “daha güzel görünmesi” ile değil; **aynı güçlü finans modelini daha az zihinsel yükle kullanabilmek** ile ölçülecektir.
