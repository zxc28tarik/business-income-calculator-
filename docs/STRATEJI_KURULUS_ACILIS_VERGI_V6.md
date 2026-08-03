# Business Income Calculator
## Kuruluş, Açılış, Vergi ve Gerçek Başlangıç Nakdi Stratejisi — V6

| Alan | Değer |
|---|---|
| Belge sürümü | `V6` |
| Tarih | `3 Ağustos 2026` |
| Durum | `Strateji ve uygulama taslağı` |
| Ana ürün sınırı | `Sektörel ön fizibilite ve işletme içi takip` |
| Resmî muhasebe durumu | `Kapsam dışı` |

> Bu belge Business Income Calculator ürününün kuruluş ve açılış maliyetlerini hangi mantıkla ele alacağını, hangi fikirlerin aktif kaldığını ve hangi sınırların korunacağını tanımlar.

> **Uygulama durumu:** İlk çekirdek dilim `src/setup/setup-model.js` altında başlatıldı. Kuruluş profili, maliyet sınıfları, KDV ayrımı, ödeme takvimi ve gerçek başlangıç nakdi köprüsü saf fonksiyonlar olarak uygulanmıştır. Ayrıntılı sektör kural motoru ve kullanıcı arayüzü henüz bu fazın parçası değildir.

---

# 1. Ana karar

Fizibilite yalnız aylık satış ve giderlerden başlamamalıdır.

Kullanıcının işini açabilmesi için gereken gerçek para şu zincirle hesaplanmalıdır:

```text
Sektör ve iş türü
+ Hukuki yapı
+ İl / ilçe
+ Fiziksel işyeri
+ Çalışan
+ Satış kanalı
+ Üretim / gıda / özel cihaz / ithalat / franchise gibi koşullar
↓
Kuruluş işlemleri
+ Ruhsat / kayıt / izin kontrolleri
+ Demirbaş / tadilat / stok / depozito / yazılım
+ Çalışan / SGK / muhasebe / uyum giderleri
+ KDV ve yaklaşık vergi rezervi
↓
Gerçek toplam başlangıç nakdi
```

Yeni ürün mantığı:

```text
Kullanıcı maliyet adını tahmin ederek yazmaz.
→ Kuracağı işletmenin koşullarını seçer.
→ Sistem bu koşullardan doğabilecek ihtiyaç ve zorunlulukları çıkarır.
→ Kullanıcı her kalemi dahil eder, uygulanmıyor veya doğrulama bekliyor olarak işaretler.
→ Kalem finansal sınıfına ve ödeme zamanına göre modele bağlanır.
```

---

# 2. Ürün sınırı

## 2.1 Ürünün yapacağı

- Muhtemel kuruluş ve açılış kalemlerini hatırlatmak.
- Kullanıcı seçimlerine göre uygulanabilir kalemleri açmak.
- Kalemleri gider, varlık, stok, depozito ve işletme sermayesi olarak ayırmak.
- Peşin, taksit, vade ve ödeme ayını 12 aylık nakde bağlamak.
- Satış KDV’si, alış KDV’si ve yaklaşık nakit etkisini ayırmak.
- Yaklaşık gelir veya kurumlar vergisi rezervi oluşturmak.
- Çalışanın brüt maaştan farklı olan toplam işveren maliyetini göstermek.
- Ruhsat, kayıt, izin ve mesleki yeterlilik kontrollerini görünür yapmak.
- Resmî kaynak, teklif ve doğrulama durumunu saklamak.
- Mali müşavir, belediye veya meslek uzmanı doğrulaması gereken noktaları işaretlemek.
- Gerçek toplam başlangıç nakdini hesaplamak.

## 2.2 Ürünün yapmayacağı

- Kullanıcı adına şirket kurmak.
- Resmî başvuru veya beyanname göndermek.
- Muhasebe defteri tutmak.
- Kesin vergi borcu hesapladığını iddia etmek.
- Ruhsat, teşvik veya kredi uygunluğu garantisi vermek.
- Hukuk, mali müşavirlik veya yatırım danışmanlığı hizmeti sunmak.
- AI vergi veya hukuk danışmanı çalıştırmak.

---

# 3. Kuruluş profili

Yeni çekirdek veri yapısı işletmenin koşullarını taşır:

```text
BusinessSetupProfile
├── projectId
├── sectorId
├── businessType
├── legalStructure
├── taxpayerType
├── province
├── district
├── premisesType
├── hasPhysicalPremises
├── hasEmployees
├── employeeCount
├── salesChannels
├── handlesFood
├── manufacturesProducts
├── importsOrExports
├── usesRegulatedEquipment
├── requiresProfessionalQualification
├── isFranchise
├── usesCompanyVehicle
├── storesPersonalData
├── acceptsCardPayments
├── usesMarketplace
└── openingTargetDate
```

Bu profil kesin hukuk sonucu üretmez. Yalnızca hangi kontrol, ihtiyaç ve maliyetlerin kullanıcıya gösterileceğini belirler.

---

# 4. Koşuldan zorunluluk üreten kural motoru

Her ihtiyaç veya yükümlülük bir kural kaydı olarak tanımlanmalıdır:

```text
RequirementRule
├── id
├── title
├── appliesWhen
├── sectorScope
├── businessTypeScope
├── legalStructureScope
├── locationScope
├── authority
├── phase
├── mandatoryLevel
├── costType
├── paymentTiming
├── recurrence
├── sourceId
├── effectiveFrom
├── effectiveTo
├── verificationOwner
├── confidence
└── userStatus
```

Örnek:

```text
Koşul:
Fiziksel işyeri + gıda servisi

Gösterilecek kontroller:
- İşyeri açma ve çalışma ruhsatı
- Gıda işletmesi kayıt/onay kontrolü
- Yangın ve güvenlik koşulları
- Havalandırma ve yerleşim uygunluğu
- Atık yağ / atık yönetimi ihtiyacı
- Ödeme kaydedici cihaz ve belge düzeni kontrolü
```

Her kontrol şu durumlardan birini alabilir:

- `zorunlu`
- `duruma_bagli`
- `kontrol_edilmeli`
- `uygulanmiyor`
- `teklif_bekleniyor`
- `uzman_dogrulamasi_bekliyor`

---

# 5. Kuruluş–açılış–faaliyet yaşam döngüsü

## Evre 1 — İş fikri

- Sektör ve iş türü.
- Yaklaşık kapasite.
- Şirket yapısı seçenekleri.
- İlk kuruluş ve açılış maliyet listesi.

## Evre 2 — Yer ve yapı seçimi

- İl ve ilçe.
- Fiziksel işyeri türü.
- Kira ve depozito.
- Ruhsat ve teknik uygunluk kontrolleri.
- Mekânın faaliyet için uygunluğu.

## Evre 3 — Kuruluş

- Sicil, oda ve vergi işlemleri.
- Mali müşavir kuruluş hizmeti.
- Elektronik imza, mali mühür ve belge düzeni.
- İşveren veya sigortalılık başlangıcı.
- Kuruluş harç ve hizmet giderleri.

## Evre 4 — Açılışa hazırlık

- Tadilat ve yer hazırlığı.
- Demirbaş ve cihazlar.
- Kurulum ve devreye alma.
- Açılış stoğu ve sarf.
- Personel işe alımı ve eğitimi.
- İlk pazarlama bütçesi.
- Ruhsat, kayıt ve izinlerin tamamlanması.
- Açılış öncesi kira ve personel yanması.

## Evre 5 — Açılış

- İlk gün kasası.
- Başlangıç stoğu.
- Satış ve ödeme altyapısı.
- İlk vergi ve prim rezervleri.
- İşletme sermayesi tamponu.

## Evre 6 — Faaliyet

- Aylık muhasebe ve uyum giderleri.
- Personel ve işveren yükleri.
- KDV ve vergi rezervi.
- Oda aidatı, izin yenileme ve tekrarlanan giderler.
- Plan–gerçekleşen takip.

---

# 6. Maliyet sınıfları

Bütün açılış kalemleri aynı şekilde ele alınmamalıdır.

| Kod | Sınıf | Örnek | Kâr etkisi | Nakit etkisi |
|---|---|---|---|---|
| `SETUP_EXPENSE` | Doğrudan kuruluş gideri | danışmanlık, sicil işlemi | Dönem gideri olabilir | Çıkış |
| `CAPEX` | Sabit kıymet | masa, cihaz, bilgisayar | Amortismanla yayılır | Peşin/taksit çıkış |
| `FIT_OUT` | Tadilat ve yer hazırlığı | elektrik, dekorasyon | Sınıfına göre gider/varlık | Açılış öncesi çıkış |
| `DEPOSIT` | Depozito ve teminat | kira depozitosu | Doğrudan gider değildir | Nakit bağlar |
| `OPENING_INVENTORY` | Açılış stoğu | gıda, ürün, parça | Satıldıkça maliyetleşir | Açılışta çıkış |
| `CONSUMABLES` | İlk sarf | ambalaj, temizlik | Kullanıldıkça gider | Çıkış |
| `PREPAID` | Peşin ödenmiş gider | yıllık sigorta/yazılım | Döneme yayılır | Peşin çıkış |
| `WORKING_CAPITAL` | İşletme sermayesi | ilk aylar nakit tamponu | Gider değildir | Kasada tutulur |
| `REFUNDABLE` | Geri alınabilir tutar | bazı teminatlar | Gider değildir | Geçici nakit bağlar |
| `TAX_CREDIT` | İndirilebilir vergi/KDV | uygun alış KDV’si | Vergi hesabını etkiler | Önce nakit çıkışı |
| `NON_RECOVERABLE_TAX` | İndirilemeyen vergi | koşula bağlı | Maliyete/gidere eklenir | Nakit çıkışı |
| `RECURRING_COMPLIANCE` | Tekrarlanan uyum | muhasebe, oda aidatı | Aylık/yıllık gider | Dönemsel çıkış |

Bu sınıflandırma, aynı kalemin hem giderden hem de nakitten yanlış biçimde düşülmesini önler.

---

# 7. Gerçek toplam başlangıç nakdi köprüsü

Ana sonuç şu şekilde kurulmalıdır:

```text
Kuruluş ve tescil giderleri
+ Tadilat ve yer hazırlığı
+ Demirbaş ve cihaz ödemeleri
+ Depozito ve teminatlar
+ Açılış stoğu ve sarf
+ Peşin ödenen yıllık hizmetler
+ Açılış öncesi kira/personel yanması
+ İlk vergi, prim ve uyum rezervi
+ İlk aylar işletme sermayesi
+ Beklenmeyen gider rezervi
- Kullanılabilir destek ve finansman
= Güvenli toplam başlangıç nakdi
```

Kullanıcıya üç ayrı sonuç gösterilmelidir:

1. Giderleşecek açılış maliyeti.
2. Varlık, stok veya depozito olarak kalacak tutar.
3. İşletmeyi açabilmek için gereken gerçek nakit.

---

# 8. Demirbaş–kapasite–amortisman bağlantısı

Önemli bir demirbaş yalnız maliyet değildir.

```text
Finans rolü:
- satın alma bedeli
- KDV
- ödeme planı
- amortisman
- bakım ve yenileme

Operasyon rolü:
- kapasite
- işlem süresi
- çalışan ihtiyacı
- maksimum satış/hizmet
- darboğaz
```

Kafe masası örneği:

```text
Masa adedi: 15
Sandalye: 60
Toplam yatırım: 180.000 TL
Müşteri kapasitesi: 60 kişi
Devir varsayımı: günde 2,4
Teorik masa kapasitesi: 144 müşteri/gün
```

Bu nedenle masa, cihaz, koltuk, lift, raf veya sunucu kapasitesi hem başlangıç nakdine hem de başabaşın uygulanabilirliğine bağlanmalıdır.

---

# 9. KDV mantığı

Tek bir KDV oranı alanı yeterli değildir.

```text
Satış kalemleri
→ Hesaplanan KDV

Alış ve yatırım kalemleri
→ İndirilebilir KDV
→ İndirilemeyen / maliyete eklenen KDV
→ Doğrulama bekleyen KDV

Dönem sonucu
→ Yaklaşık ödenecek KDV
veya
→ Devreden KDV
```

Her kalem için:

```text
vatRate
vatIncluded
vatRecoverability
vatSource
vatVerificationStatus
cashPaidMonth
creditUsableMonth
```

KDV modülü:

- Resmî beyan üretmez.
- Kalem bazında yaklaşık nakit ve vergi etkisini gösterir.
- Belirsiz durumları mali müşavir doğrulamasına gönderir.
- İndirilebilir KDV’yi açılışta gerekli nakitten otomatik olarak düşmez; önce nakit çıkışı olarak korur.

---

# 10. Gelir veya kurumlar vergisi rezervi

Vergi motoru tek sabit oran kullanmamalıdır.

Girdiler:

- Hukuki yapı.
- Mükellef türü.
- Tahmini vergi matrahı.
- Kanunen kabul edilmeyen gider tahmini.
- İndirim veya istisna bilgisi.
- Geçerlilik tarihi.
- Ödeme dönemi.

Çıktılar:

- Yaklaşık dönem vergi rezervi.
- Ödeme takvimi.
- Nakit açığına etkisi.
- Kullanılan oran ve kaynağın tarihi.
- Doğrulama gerektiren alanlar.

Kullanıcıya gösterilecek ifade:

> Bu tutar fizibilite rezervidir; resmî vergi hesaplaması veya beyanname değildir.

---

# 11. Stopaj, damga ve diğer yükler

Tek bir “diğer vergi” kutusu yerine koşul tabanlı matris kullanılmalıdır:

- Kira ilişkisine bağlı vergi veya stopaj kontrolü.
- Ücret ve bordro kaynaklı yükler.
- Sözleşme ve damga vergisi ihtimali.
- İthalat veya özel faaliyet yükleri.
- Belediye ve oda ödemeleri.
- Sektörel fon veya katkılar.
- Teşvik ve indirim koşulları.

Her madde için:

- `uygulaniyor`
- `uygulanmiyor`
- `kosula_bagli`
- `uzman_dogrulamasi_bekliyor`

---

# 12. Çalışanın gerçek maliyeti

Çalışan sayısı yalnız brüt maaş alanı olmamalıdır.

```text
Brüt ücret
+ İşveren primleri
+ İşsizlik sigortası işveren payı
+ Yemek / yol / yan hak
+ Fazla çalışma ve vardiya etkisi
+ İş sağlığı ve güvenliği
+ İşe alım ve eğitim
+ Üniforma / ekipman
+ İzin, devamsızlık ve yedek kapasite
- Uygun ve doğrulanmış teşvik / indirim
= Toplam işveren maliyeti
```

Teşvik:

- Otomatik hak edilmiş sayılmaz.
- Koşulları ve geçerlilik tarihi gösterilir.
- Kullanıcı veya uzman doğrulaması ister.

---

# 13. Yer seçimi için yatırım öncesi kapı

Kullanıcı kiralama veya satın alma kararından önce şu kontrolleri görmelidir:

```text
Faaliyet bu adreste yapılabilir mi?
Ruhsat türü belli mi?
Teknik altyapı yeterli mi?
Havalandırma / güç / su / atık / yangın koşulları uygun mu?
Gerekli kayıt ve izinler alınabilir mi?
Tadilat maliyeti hesaplandı mı?
Açılış gecikmesi riski var mı?
```

Sonuç seçenekleri:

- Yer finansal ve teknik olarak doğrulandı.
- Koşullu uygun.
- Doğrulama tamamlanmadı.

Bu sonuçlar yatırım tavsiyesi değil, plan tamlığı göstergesidir.

---

# 14. Açılış öncesi nakit yanması

İşletme satış yapmadan önce gider üretir:

- kira,
- depozito,
- personel,
- eğitim,
- deneme üretimi,
- elektrik, su ve internet,
- muhasebe,
- kredi faizi,
- yazılım,
- güvenlik,
- geciken tadilat.

Model:

```text
Planlanan açılış tarihi
+ Gerçekçi hazırlık süresi
+ Gecikme tamponu
× Satış öncesi aylık sabit gider
= Açılış öncesi nakit yanması
```

Bu tutar başlangıç sermayesine eklenmelidir.

---

# 15. Eksik maliyet tespit sistemi

Plan tamlığı yalnız doldurulan alan sayısı değildir.

Sistem şu kontrolleri yapmalıdır:

- Fiziksel işyeri var ama depozito yok mu?
- Çalışan var ama işveren maliyeti veya işe alım gideri yok mu?
- Kafe var ama mutfak veya servis ekipmanı yok mu?
- E-ticaret var ama başlangıç stoğu, paketleme veya iade rezervi yok mu?
- Oto servis var ama lift, cihaz, sarf veya atık yönetimi kontrolü yok mu?
- KDV’li satış var ama alış KDV’si tanımlanmamış mı?
- Tadilat var ama açılış gecikmesi yok mu?
- Cihaz var ama kurulum, bakım veya elektrik ihtiyacı yok mu?
- Şirket var ama muhasebe ve elektronik belge maliyeti yok mu?

Örnek çıktı:

```text
Plan tamlığı: %82

Eksik kritik:
- Depozito
- İlk üç ay işletme sermayesi

Doğrulama bekleyen:
- Gıda kayıt işlemi
- KDV indirimi
- Personel teşviki
```

---

# 16. Resmî kaynak ve yürürlük sicili

Değişken oran ve kurallar kod içine kalıcı biçimde gömülmemelidir.

Her kural:

```text
sourceAuthority
sourceTitle
sourceDate
lastCheckedAt
effectiveFrom
effectiveTo
jurisdiction
version
notes
```

taşımalıdır.

Kaynak önceliği:

1. Resmî kurum ve yürürlükteki mevzuat.
2. İl, ilçe veya yetkili yerel kurum.
3. Mali müşavir veya meslek uzmanı doğrulaması.
4. Yazılı teklif veya sözleşme.
5. Kullanıcı araştırması.
6. Sistem varsayılanı.

Güncellik durumu:

- Güncel ve resmî.
- Yerel doğrulama gerekiyor.
- Yakında sona erecek.
- Süresi geçmiş.
- Kaynak bulunamadı.

---

# 17. Sekiz sektör için açılış paketleri

Aşağıdaki listeler kesin zorunluluk listesi değil, kural motorunun gösterebileceği başlangıç paketleridir.

## 17.1 Kafe / Restoran

- Şirket ve mali müşavir kuruluş hizmeti.
- Kira, depozito ve emlak hizmeti.
- Tadilat, elektrik, su, gaz ve havalandırma.
- Masa, sandalye, servis alanı ve dış mekân mobilyası.
- Fırın, ocak, ızgara, davlumbaz ve hazırlık tezgâhı.
- Buzdolabı, derin dondurucu ve soğuk zincir ekipmanı.
- Kahve makinesi, değirmen ve içecek ekipmanı.
- Bulaşık makinesi ve yıkama alanı.
- Tabak, bardak, çatal, bıçak ve servis malzemesi.
- POS, ödeme kaydedici cihaz ve yazılım.
- Tabela, kamera, yangın ve güvenlik ekipmanı.
- Temizlik, hijyen, personel kıyafeti ve ilk sarf.
- İlk gıda ve içecek stoğu.
- Ruhsat, gıda kayıt/onay, atık ve diğer yerel kontroller.
- Açılış öncesi kira ve personel yanması.

## 17.2 E-Ticaret / Pazaryeri

- Şirket, mali müşavir ve elektronik belge altyapısı.
- Pazaryeri mağaza ve entegrasyon hizmetleri.
- Alan adı, web sitesi ve ödeme altyapısı.
- Açılış stoğu.
- Depo, raf ve ürün yerleşimi.
- Barkod, etiket ve stok takip ekipmanı.
- Paketleme masası, kutu, dolgu ve ambalaj.
- Ürün fotoğrafı ve içerik üretimi.
- Kargo sözleşmesi ve ilk kargo nakit rezervi.
- İade, hasar ve kayıp rezervi.
- İlk reklam ve kampanya bütçesi.
- Yazılım abonelikleri.

## 17.3 Güzellik / Kuaför / Bakım

- Şirket ve işyeri kuruluş işlemleri.
- Kira, depozito, tadilat ve dekorasyon.
- Koltuk, yatak, ayna ve bekleme alanı.
- Faaliyete özel cihazlar.
- Sterilizasyon, hijyen ve güvenlik ekipmanı.
- Havlu, sarf ve ilk ürün stoğu.
- Randevu, ödeme ve müşteri takip yazılımı.
- Personel ekipmanı ve kıyafetleri.
- Mesleki yeterlilik, ruhsat ve yerel uygunluk kontrolleri.

## 17.4 Ajans / Freelancer / Danışmanlık

- Şirket kuruluşu ve mali müşavir.
- Bilgisayar, monitör ve çevre birimleri.
- Yazılım ve bulut lisansları.
- İnternet ve iletişim altyapısı.
- Ofis, ev ofis veya ortak çalışma alanı maliyeti.
- Kamera, ışık ve ses ekipmanı.
- Web sitesi ve portföy üretimi.
- Sözleşme ve mesleki hizmet giderleri.
- İlk müşteri edinme ve reklam bütçesi.

## 17.5 SaaS / Abonelik

- Şirket kuruluşu ve mali müşavir.
- Bilgisayar ve geliştirme ekipmanı.
- Sunucu, veritabanı ve bulut hizmetleri.
- Alan adı, e-posta ve yazılım servisleri.
- Ödeme sağlayıcı ve abonelik altyapısı.
- Güvenlik, yedekleme ve izleme hizmetleri.
- Hukuki metinler ve veri koruma kontrolleri.
- Tasarım, geliştirme ve test maliyetleri.
- İlk satış ve pazarlama bütçesi.

## 17.6 Fiziksel Perakende

- Şirket ve işyeri kuruluş işlemleri.
- Kira, depozito ve mağaza tadilatı.
- Raf, askılık, tezgâh ve ürün sergileme.
- Kasa, POS ve ödeme kaydedici cihaz.
- Kamera, alarm ve güvenlik.
- Tabela ve mağaza görünürlüğü.
- Deneme kabini veya sektöre özel müşteri alanı.
- Açılış stoğu.
- Depo, paketleme ve stok ekipmanı.
- İlk kampanya ve reklam bütçesi.

## 17.7 Oto Hizmetleri

- Şirket ve işyeri kuruluş işlemleri.
- Kira, depozito ve sanayi alanı hazırlığı.
- Lift, kriko ve kaldırma ekipmanı.
- Kompresör ve hava altyapısı.
- Diagnostik cihazlar.
- El aletleri ve özel takım setleri.
- Elektrik, güç ve havalandırma altyapısı.
- İş güvenliği ve yangın ekipmanı.
- Atık, yağ ve çevre kontrolleri.
- İlk parça, yağ ve sarf stoğu.
- Müşteri kabul ve bekleme alanı.

## 17.8 Oyun / Dijital Yayıncılık

- Şirket kuruluşu ve mali müşavir.
- Geliştirme bilgisayarları ve test cihazları.
- Yazılım ve geliştirme lisansları.
- Fikrî hak ve sözleşme hizmetleri.
- Yerelleştirme.
- Kalite testi ve uyumluluk.
- Platform hazırlığı ve mağaza varlıkları.
- Sunucu ve çevrimiçi hizmetler.
- İlk pazarlama ve yayın bütçesi.
- Geliştirici, yayıncı ve diğer paydaş sözleşme giderleri.

---

# 18. Kullanıcı akışı

## Ekran 1 — İşletme koşulları

- Sektör ve iş türü.
- Hukuki yapı.
- İl ve ilçe.
- Fiziksel işyeri.
- Çalışan.
- Satış kanalı.
- Özel faaliyet koşulları.

Kullanıcının her soruda `henüz bilmiyorum` seçeneği bulunmalıdır.

## Ekran 2 — Zorunluluk ve ihtiyaç listesi

Her satır:

- Dahil et.
- Uygulanmıyor.
- Doğrulama bekliyor.
- Teklif alınacak.

## Ekran 3 — Ekipman ve açılış envanteri

- Adet.
- Birim fiyat.
- KDV.
- Peşin veya taksit.
- Yeni, ikinci el veya kiralık.
- Kapasite bağlantısı.
- Kaynak ve teklif.

## Ekran 4 — Vergi ve çalışan

- Vergi profili.
- Yaklaşık vergi rezervi.
- KDV akışı.
- Toplam işveren maliyeti.
- Doğrulama uyarıları.

## Ekran 5 — Açılış nakit köprüsü

- Kuruluş gideri.
- Varlık ve demirbaş.
- Depozito.
- Stok.
- Vergi ve prim.
- İşletme sermayesi.
- Kullanılabilir finansman.
- Minimum güvenli başlangıç nakdi.

## Ekran 6 — Kontrol ve rapor

- Eksik kritik kalemler.
- Doğrulama bekleyenler.
- Kaynak güncelliği.
- Mali müşavir veya kurum görüşme listesi.

---

# 19. Aktif girişimler

| ID | Girişim | Durum |
|---|---|---|
| `SET-001` | İşletme kuruluş profili ve koşul seçim sihirbazı | Aktif |
| `SET-002` | Koşuldan zorunluluk üreten kural motoru | Aktif |
| `SET-003` | Kuruluş–açılış–faaliyet yaşam döngüsü | Aktif |
| `SET-004` | Şirket ve işletme yapısı karşılaştırması | Aktif |
| `CST-001` | Kuruluş ve açılış maliyet sınıflandırması | Uygulama başladı |
| `CST-002` | Eksik maliyet ve plan tamlık kontrolü | Aktif |
| `CST-003` | Açılış öncesi yanma ve gecikme maliyeti | Aktif |
| `AST-001` | Sektörel demirbaş ve ekipman kataloğu | Aktif |
| `AST-002` | Demirbaş–kapasite–amortisman bağlantısı | Aktif |
| `AST-003` | Açılış stoğu, sarf ve güvenlik stoğu planı | Aktif |
| `AST-004` | Tadilat, kurulum ve devreye alma maliyetleri | Aktif |
| `AST-005` | Satın al / kirala / yeni / ikinci el karşılaştırması | Aktif |
| `TAX-001` | Hukuki yapı ve faaliyete bağlı vergi profili | Aktif |
| `TAX-002` | Hesaplanan KDV, indirilebilir KDV ve nakit etkisi | Uygulama başladı |
| `TAX-003` | Gelir veya kurumlar vergisi rezervi | Aktif |
| `TAX-004` | Stopaj, damga ve diğer olası vergi yükleri matrisi | Aktif |
| `PAY-001` | Çalışanın toplam işveren maliyeti ve SGK katmanı | Aktif |
| `CMP-001` | Ruhsat, kayıt, izin ve mesleki zorunluluk matrisi | Aktif |
| `CMP-002` | İl, ilçe ve yerel kurum bağımlılığı | Aktif |
| `CMP-003` | Yenileme ve tekrarlanan uyum maliyeti takvimi | Aktif |
| `DOC-001` | Belge ve doğrulama kontrol listesi | Aktif |
| `SRC-001` | Yürürlük tarihli resmî kaynak ve kural sicili | Aktif |
| `SRC-002` | Uzman doğrulama kapıları | Aktif |
| `CSH-001` | Gerçek toplam başlangıç nakdi köprüsü | Uygulama başladı |
| `CSH-002` | Peşin, taksit, vade, depozito ve iade zamanlaması | Uygulama başladı |
| `RES-001` | Beklenmeyen gider ve işletme sermayesi rezervi | Uygulama başladı |
| `RPT-004` | Kuruluş ve açılış maliyet raporu | Aktif |
| `SEC-001` | Sekiz sektör için kuruluş ve açılış paketleri | Aktif |

---

# 20. Elenen veya kapsam dışı fikirler

| ID | Fikir | Gerekçe |
|---|---|---|
| `AUT-001` | Resmî başvuruları uygulamadan otomatik gönderme | Kamu entegrasyonu ve hukuki sorumluluk gerektirir. |
| `ACC-001` | Tam muhasebe defteri ve beyanname üretimi | Ürünü resmî muhasebe yazılımına dönüştürür. |
| `SCR-001` | Bütün belediye ve kurum ücretlerini otomatik tarama | Kaynaklar standart değildir; doğruluk ve güncellik garantilenemez. |
| `AI-001` | AI vergi ve hukuk danışmanı | Hata ve sorumluluk riski yüksektir; ürün ilkeleriyle çelişir. |
| `BEN-001` | Kaynağı belirsiz ortalama kuruluş maliyeti | Yer, dönem, şirket yapısı ve sektör farkını gizler. |

---

# 21. Uygulama sırası

## Faz A — Veri ve sınıflandırma

1. `CST-001` maliyet sınıfları.
2. `SET-001` kuruluş profili.
3. `SRC-001` kaynak sicili.
4. `SEC-001` sektör paketleri.

## Faz B — Kural ve tamlık

1. `SET-002` kural motoru.
2. `CMP-001` zorunluluk matrisi.
3. `CST-002` eksik maliyet kontrolü.
4. `SRC-002` doğrulama kapıları.

## Faz C — Finans bağlantısı

1. `CSH-001` başlangıç nakdi köprüsü.
2. `CSH-002` ödeme zamanlaması.
3. `AST-002` varlık–kapasite–amortisman.
4. `RES-001` işletme sermayesi rezervi.
5. `CST-003` açılış öncesi yanma.

## Faz D — Vergi ve çalışan

1. `TAX-001` vergi profili.
2. `TAX-002` KDV akışı.
3. `TAX-003` vergi rezervi.
4. `TAX-004` diğer yükler matrisi.
5. `PAY-001` toplam işveren maliyeti.

## Faz E — Sektör içeriği ve rapor

1. Sektörel demirbaş, stok ve tadilat listeleri.
2. Yerel ve tekrarlanan uyum kontrolleri.
3. Kuruluş ve açılış raporu.
4. Üç sektör pilotu.
5. Kalan beş sektörün genişletilmesi.

---

# 22. İlk çekirdek uygulama dilimi

İlk dilim şu dosyalardan oluşur:

- `src/setup/setup-model.js`
- `tests/setup-model.test.mjs`

Uygulanan saf fonksiyonlar:

- `createDefaultSetupProfile`
- `normalizeSetupProfile`
- `normalizeSetupCostItem`
- `normalizeSetupCostItems`
- `summarizeSetupCosts`
- `normalizeSetupFunding`
- `buildSetupPaymentSchedule`
- `buildStartupCashBridge`

Bu dilim:

- henüz kullanıcı arayüzüne bağlı değildir,
- mevcut sekiz sektör motorunu değiştirmez,
- mevcut kayıtları ve raporları etkilemez,
- bir sonraki kural motoru ve sektör paketleri için güvenli temel sağlar.

---

# 23. Kabul kriterleri

Bu kuruluş katmanı tamamlanmış sayılmak için:

- Aynı proje içinde gider, varlık, stok, depozito ve işletme sermayesi ayrılabiliyor.
- Her maliyetin ödeme ayı 12 aylık nakde aktarılabiliyor.
- En az üç sektörde koşuldan ihtiyaç listesi üretilebiliyor.
- Aynı ekipman finans ve kapasite hesabına bağlanabiliyor.
- KDV’nin hesaplanan, indirilebilir ve doğrulama bekleyen bölümleri ayrılıyor.
- Vergi sonucu “rezerv” olarak etiketleniyor.
- Çalışanın toplam işveren maliyeti brüt ücretten ayrılıyor.
- Kaynak ve yürürlük tarihi olmayan dinamik kural güvenilir sayılmıyor.
- Kullanıcı uygulanmayan kalemi gerekçesiyle kapatabiliyor.
- Eksik kritik maliyetler raporda görünür.
- Sistem resmî muhasebe veya kesin vergi hesabı iddiasında bulunmuyor.

---

# 24. Son ürün zinciri

```text
Ne iş kuruyorsun?
→ Hangi hukuki ve operasyonel koşullarla?
→ Hangi kuruluş, izin ve mesleki giderler doğuyor?
→ Hangi sektörel ekipman, tadilat ve stok gerekiyor?
→ Bunların gider, varlık, KDV, amortisman ve nakit etkisi ne?
→ Açılış öncesinde ne kadar para yanıyor?
→ Güvenli toplam başlangıç nakdi ne kadar?
→ İş açıldıktan sonra aylık vergi, çalışan ve uyum yükü ne?
→ Kaç satışta başabaşa ulaşılıyor?
→ Plan ile gerçekleşen arasındaki fark ne?
```

Bu yapı ön muhasebe ürünü değildir. Sektörel fizibilitenin eksik kuruluş ve açılış katmanıdır.
