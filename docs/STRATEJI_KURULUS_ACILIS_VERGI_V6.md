# Business Income Calculator
## Kuruluş, Açılış, Vergi ve Gerçek Başlangıç Nakdi Stratejisi — V6

| Alan | Değer |
|---|---|
| Belge sürümü | `V6` |
| Tarih | `3 Ağustos 2026` |
| Durum | `Strateji ve uygulama taslağı` |
| Ana ürün sınırı | `Sektörel ön fizibilite ve işletme içi takip` |
| Resmî muhasebe durumu | `Kapsam dışı` |

> Bu belge uygulama kodunu değiştirmez. Business Income Calculator ürününün kuruluş ve açılış maliyetlerini hangi mantıkla ele alacağını, hangi fikirlerin aktif kaldığını ve hangi sınırların korunacağını tanımlar.

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

Her kalem için önerilen alanlar:

```text
vatRate
vatIncluded
vatRecoverability
vatSource
vatVerificationStatus
cashPaidMonth
creditUsableMonth
```

Bu modül resmî beyan üretmez; yalnız fizibilite içindeki yaklaşık kâr ve nakit etkisini gösterir.

---

# 10. Gelir veya kurumlar vergisi rezervi

Tek sabit oran kullanılmamalıdır.

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
- Kullanılan kaynağın tarihi.
- Doğrulama gerektiren alanlar.

Kullanıcıya gösterilecek sınır:

> Bu tutar fizibilite rezervidir; resmî vergi hesaplaması veya beyanname değildir.

---

# 11. Stopaj, damga ve diğer olası yükler

Tek bir “diğer vergi” kutusu yerine koşul tabanlı kontrol matrisi kullanılmalıdır:

- Kira ilişkisine bağlı vergi veya stopaj kontrolü.
- Ücret ve bordro kaynaklı yükler.
- Sözleşme ve damga vergisi ihtimali.
- İthalat veya özel faaliyet yükleri.
- Belediye ve oda ödemeleri.
- Sektörel fon veya katkılar.
- Teşvik ve indirim koşulları.

Her madde:

```text
uygulaniyor
uygulanmiyor
kosula_bagli
uzman_dogrulamasi_bekliyor
```

olarak işaretlenmelidir.

---

# 12. Çalışanın gerçek işveren maliyeti

Personel yalnız brüt ücret olarak hesaplanmamalıdır.

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
- Uygun ve doğrulanmış teşvik/indirim
= Toplam işveren maliyeti
```

Teşvik otomatik kazanılmış sayılmamalı; kaynak ve uzman doğrulaması istemelidir.

---

# 13. Yer seçimi için yatırım öncesi kapı

Kullanıcı kira sözleşmesi veya yatırım kararı öncesinde şu kontrolleri görmelidir:

```text
Faaliyet bu adreste yapılabilir mi?
Ruhsat türü belli mi?
Teknik altyapı yeterli mi?
Havalandırma / güç / su / atık / yangın koşulları uygun mu?
Gerekli kayıt ve izinler alınabilir mi?
Tadilat maliyeti hesaplandı mı?
Açılış gecikmesi riski var mı?
```

Sonuç durumları:

- `dogrulandi`
- `kosullu_uygun`
- `dogrulama_tamamlanmadi`

Bu kapı yatırım tavsiyesi vermez; eksik kontrolü görünür yapar.

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

# 15. Eksik maliyet ve plan tamlık kontrolü

Sistem şu tür tutarsızlıkları yakalamalıdır:

- Fiziksel işyeri var ama depozito yok.
- Çalışan var ama toplam işveren maliyeti yok.
- Kafe var ama mutfak veya servis ekipmanı yok.
- E-ticaret var ama stok, paketleme veya iade rezervi yok.
- Oto servis var ama lift, takım veya atık kontrolü yok.
- KDV’li satış var ama alış KDV’si tanımlanmamış.
- Tadilat var ama açılış gecikmesi yok.
- Cihaz var ama kurulum, bakım veya elektrik ihtiyacı yok.
- Şirket var ama muhasebe ve elektronik belge maliyeti yok.

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

Değişken kurallar kalıcı sabitler olarak kod içine gömülmemelidir.

Her kaynak kaydı:

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

Kaynak önceliği:

1. Resmî kurum ve yürürlükteki mevzuat.
2. İl, ilçe veya yetkili yerel kurum.
3. Mali müşavir veya meslek uzmanı doğrulaması.
4. Yazılı teklif veya sözleşme.
5. Kullanıcı araştırması.
6. Sistem varsayılanı.

Güncellik durumları:

- `guncel_resmi`
- `yerel_dogrulama_gerekli`
- `yakinda_sona_erecek`
- `suresi_gecmis`
- `kaynak_bulunamadi`

---

# 17. Sekiz sektör için kuruluş ve açılış paketleri

| Sektör | Başlıca kuruluş ve açılış kümeleri |
|---|---|
| Kafe / restoran | mutfak, masa/sandalye, havalandırma, soğutma, servis, POS/ÖKC, gıda kayıt/onay kontrolü, yangın, atık, ilk stok |
| E-ticaret | şirket ve e-belge, mağaza/pazaryeri, başlangıç stoğu, depo/raf, paketleme, kargo, iade rezervi, fotoğraf, yazılım |
| Güzellik / bakım | koltuk/yatak, cihaz, sterilizasyon, sarf, yeterlilik/ruhsat kontrolleri, randevu yazılımı, hijyen, bekleme alanı |
| Ajans / freelancer | bilgisayar, lisans, ofis/coworking, internet, web sitesi, satış bütçesi, sözleşme ve mesleki hizmetler |
| SaaS | geliştirme araçları, sunucu, alan adı, ödeme altyapısı, güvenlik, hukuki metinler, KVKK kontrolleri, ilk pazarlama |
| Fiziksel perakende | raf, kasa, POS/ÖKC, tabela, güvenlik, mağaza dekorasyonu, başlangıç stoğu, depo, paketleme |
| Oto hizmetleri | lift, kompresör, teşhis cihazı, el aletleri, elektrik altyapısı, atık/çevre kontrolleri, sarf/parça stoğu |
| Oyun / dijital yayın | bilgisayar/test cihazı, yazılım, fikrî hak ve sözleşmeler, yerelleştirme, QA, platform hazırlığı, pazarlama |

Bu paketler nihai zorunluluk listesi değildir. Kural motorunun kullanıcıya göstereceği başlangıç kataloglarıdır.

---

# 18. Kullanıcı ekranları

## Ekran 1 — İşletme koşulları

Kısa seçimler ve her önemli soruda `henüz bilmiyorum` seçeneği.

## Ekran 2 — Zorunluluk ve ihtiyaç listesi

Her satır:

```text
dahil_et
uygulanmiyor
dogrulama_bekliyor
teklif_alinacak
```

## Ekran 3 — Ekipman ve açılış envanteri

- Adet.
- Birim fiyat.
- KDV.
- Ödeme biçimi.
- Yeni veya ikinci el.
- Kapasite bağlantısı.
- Kaynak ve teklif tarihi.

## Ekran 4 — Vergi ve çalışan

- Vergi profili.
- Yaklaşık rezerv.
- KDV akışı.
- Toplam personel maliyeti.
- Doğrulama uyarıları.

## Ekran 5 — Açılış nakit köprüsü

- Toplam gider.
- Varlık.
- Depozito.
- Stok.
- Vergi.
- İşletme sermayesi.
- Finansman.
- Minimum güvenli nakit.

## Ekran 6 — Kontrol ve rapor

- Eksik kalemler.
- Doğrulama bekleyenler.
- Kaynak güncelliği.
- Mali müşavir veya kurum görüşme listesi.

---

# 19. Puanlanan yeni girişimler

Dört ölçüt kullanılmıştır: uygunluk, işe yararlık, kapsayıcılık ve mantıklılık. Her biri 10 puandır. Toplamı 30 veya altında kalan fikir elenir.

## 19.1 Aktif kalan 28 fikir

| ID | Fikir | Toplam /40 |
|---|---|---:|
| `AST-001` | Sektörel demirbaş ve ekipman kataloğu | **40** |
| `CSH-001` | Gerçek toplam başlangıç nakdi köprüsü | **40** |
| `CST-001` | Kuruluş ve açılış maliyet sınıflandırması | **40** |
| `SEC-001` | Sekiz sektör için kuruluş ve açılış paketleri | **40** |
| `SET-001` | İşletme kuruluş profili ve koşul seçim sihirbazı | **40** |
| `SET-002` | Koşuldan zorunluluk üreten kural motoru | **40** |
| `SRC-001` | Yürürlük tarihli resmî kaynak ve kural sicili | **40** |
| `SRC-002` | Uzman doğrulama kapıları | **40** |
| `AST-002` | Demirbaş–kapasite–amortisman bağlantısı | **39** |
| `CMP-001` | Ruhsat, kayıt, izin ve mesleki zorunluluk matrisi | **39** |
| `CSH-002` | Peşin, taksit, vade, depozito ve iade zamanlaması | **39** |
| `CST-002` | Eksik maliyet ve plan tamlık kontrolü | **39** |
| `PAY-001` | Çalışanın toplam işveren maliyeti ve SGK katmanı | **39** |
| `RPT-004` | Kuruluş ve açılış maliyet raporu | **39** |
| `TAX-001` | Hukuki yapı ve faaliyete bağlı vergi profili | **39** |
| `AST-003` | Açılış stoğu, sarf ve güvenlik stoğu planı | **38** |
| `CST-003` | Açılış öncesi yanma ve gecikme maliyeti | **38** |
| `RES-001` | Beklenmeyen gider ve işletme sermayesi rezervi | **38** |
| `SET-003` | Kuruluş–açılış–faaliyet yaşam döngüsü | **38** |
| `TAX-002` | Hesaplanan KDV, indirilebilir KDV ve nakit etkisi | **38** |
| `AST-004` | Tadilat, kurulum ve devreye alma maliyetleri | **37** |
| `CMP-002` | İl, ilçe ve yerel kurum bağımlılığı | **36** |
| `DOC-001` | Belge ve doğrulama kontrol listesi | **35** |
| `TAX-003` | Gelir veya kurumlar vergisi rezervi | **36** |
| `CMP-003` | Yenileme ve tekrarlanan uyum maliyeti takvimi | **35** |
| `SET-004` | Şirket ve işletme yapısı karşılaştırması | **34** |
| `TAX-004` | Stopaj, damga ve diğer olası vergi yükleri matrisi | **33** |
| `AST-005` | Satın al / kirala / yeni / ikinci el karşılaştırması | **33** |

## 19.2 Elenen 5 fikir

| ID | Fikir | Toplam /40 | Neden |
|---|---|---:|---|
| `BEN-001` | Kaynağı belirsiz ortalama kuruluş maliyeti benchmarkı | **26** | Yer, dönem ve işletme yapısı farklarını gizler. |
| `SCR-001` | Bütün belediye ve kurum ücretlerini otomatik tarama | **22** | Kaynaklar standart değildir ve güncellik garanti edilemez. |
| `AUT-001` | Resmî başvuruları otomatik gönderme | **16** | Kamu entegrasyonu ve hukuki sorumluluk gerektirir. |
| `ACC-001` | Tam muhasebe defteri ve beyanname üretimi | **12** | Ürünü resmî muhasebe yazılımına dönüştürür. |
| `AI-001` | AI vergi ve hukuk danışmanı | **12** | Hata ve sorumluluk riski yüksektir. |

---

# 20. Uygulama sırası

## Faz A — Veri ve sınıflandırma

1. `CST-001` maliyet sınıfları.
2. `SET-001` kuruluş profili.
3. `SRC-001` kaynak sicili.
4. `SEC-001` sektör paketleri.

## Faz B — Kural ve tamlık

1. `SET-002` kural motoru.
2. `CMP-001` zorunluluk matrisi.
3. `CST-002` eksik maliyet kontrolü.
4. `SRC-002` uzman doğrulama kapıları.

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
4. `TAX-004` diğer vergi ve yükler matrisi.
5. `PAY-001` toplam işveren maliyeti.

## Faz E — Sektör içeriği ve rapor

1. `AST-001`, `AST-003`, `AST-004`.
2. `CMP-002`, `CMP-003`, `DOC-001`.
3. `RPT-004` kuruluş ve açılış raporu.
4. Üç sektör gerçek kullanıcı pilotu.
5. Kalan beş sektörün genişletilmesi.

---

# 21. Kabul kriterleri

Bu katman aşağıdaki koşullar karşılanmadan tamamlanmış sayılmaz:

- Aynı proje içinde gider, varlık, stok, depozito ve işletme sermayesi ayrılabiliyor.
- Her maliyetin ödeme ayı 12 aylık nakde aktarılabiliyor.
- En az üç sektörde koşuldan ihtiyaç listesi üretilebiliyor.
- Aynı ekipman finans ve kapasite hesabına bağlanabiliyor.
- KDV’nin hesaplanan, indirilebilir ve doğrulama bekleyen bölümleri ayrılıyor.
- Vergi sonucu açıkça `rezerv` olarak etiketleniyor.
- Çalışanın toplam işveren maliyeti brüt ücretten ayrılıyor.
- Kaynak ve yürürlük tarihi olmayan dinamik kural güvenilir sayılmıyor.
- Kullanıcı uygulanmayan kalemi gerekçesiyle kapatabiliyor.
- Eksik kritik maliyetler raporda görünür.
- Sistem resmî muhasebe veya kesin vergi hesabı iddiasında bulunmuyor.

---

# 22. Nihai ürün tanımına etkisi

Önceki ürün sorusu:

> İşletme aylık ne kadar kazanır ve başabaşa ne zaman gelir?

Yeni ürün sorusu:

> Bu işletmeyi gerçekten açabilmek için hangi kuruluş, izin, ekipman, stok, çalışan ve vergi yükleriyle karşılaşacağım; bunlar ne zaman nakit çıkışı yaratacak; güvenli başlangıç sermayem ne kadar olmalı ve faaliyet başladıktan sonra işletme hangi ekonomik koşullarda yaşayabilir?

Bu yön, ürünü ön muhasebeye dönüştürmeden fizibilite çekirdeğini tamamlar.
