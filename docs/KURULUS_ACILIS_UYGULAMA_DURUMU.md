# Kuruluş ve Açılış Çalışma Alanı — Uygulama Durumu

| Alan | Değer |
|---|---|
| Tarih | 4 Ağustos 2026 |
| Uygulama sürümü | `0.24.2` |
| Kuruluş çalışma alanı sözleşmesi | `V2` |
| Ortak rapor sözleşmesi | `1.3` |
| Dal | `agent/kurulus-acilis-vergi-stratejisi-v6` |
| PR | `#7` |
| Durum | Kuruluş, finansman, borç servisi, rapor, CSV ve birleşik nakit dilimi tamamlandı; taslak PR |
| Son doğrulanan kalite kapısı | `Release quality gate #901 — başarılı` |

> PR taslak durumundadır ve `main` dalına birleştirilmemiştir. Bu belge yalnız uygulanmış ve otomatik testlerle doğrulanmış kapsamı kaydeder.

## Tamamlanan kuruluş çekirdeği

- Kuruluş profili ve güvenli veri normalizasyonu.
- Kuruluş gideri, sabit kıymet, tadilat, stok, depozito, peşin gider ve işletme sermayesi sınıfları.
- KDV dahil/hariç ayrımı.
- İndirilebilir, indirilemeyen ve doğrulama bekleyen KDV ayrımı.
- Peşin ve taksitli kuruluş ödeme takvimi.
- Yalnız hazır finansmanı düşen başlangıç nakdi köprüsü.
- Beklenmeyen gider rezervi.
- Koşul tabanlı gereksinim motoru.
- Sektör, iş türü, hukuki yapı, il/ilçe ve yürürlük tarihi kapsamı.
- Ortak kuruluş kuralları.
- İlk kafe/restoran kuruluş paketi.

## Proje kaydı ve kullanıcı arayüzü

- Kuruluş çalışma alanı proje içindeki sektör durumuna bağlandı.
- Eski kayıtlar kuruluş alanı olmadan güvenli biçimde açılabiliyor.
- Eski `V1` kuruluş kayıtları `V2` sözleşmesine geriye uyumlu taşınıyor.
- Kuruluş verisi proje kopyalama ve tam yedek içinde taşınıyor.
- Ana uygulamada ayrı `Kuruluş` çalışma alanı bulunuyor.
- İşletme koşulları düzenlenebiliyor.
- Koşullardan doğan kontrol listesi gösteriliyor.
- Önerilen maliyet kalemleri kullanıcı tarafından düzenlenebiliyor.
- Özel maliyet kalemi eklenebiliyor.
- Silinen öneri kalemi otomatik senkronizasyonda yeniden oluşmuyor.
- Yalnız `Hesaba dahil` durumundaki kalemler finans hesabına giriyor.
- Ana sonuçlarda `Gerçek başlangıç nakdi` kartları sürekli gösteriliyor.
- Kuruluş ve finansman verisi sayfa yenilemesinden sonra korunuyor.
- Masaüstü, mobil ve yazdırma stilleri eklendi.

## Finansman kaynakları

- Kullanıcı finansman kaynağı ekleyebiliyor, düzenleyebiliyor ve kaldırabiliyor.
- Kaynak türleri: özkaynak, kredi, hibe, destek/teşvik, tedarikçi kredisi ve diğer.
- Kaynak durumları: `Planlandı`, `Kullanılabilir`, `Kullanıldı`, `Hariç`.
- `Planlandı` durumundaki kaynak bilgi amaçlı tutuluyor ve gerekli özkaynaktan düşülmüyor.
- `Kullanılabilir` kaynak yalnız açılış ayına kadar hazırsa gerekli özkaynaktan düşülüyor.
- `Kullanıldı` kaynak gerçekleşmiş finansman kabul edilerek gerekli özkaynaktan düşülüyor.
- `Hariç` kaynak hesaplamaya alınmıyor.
- Planlanan finansman hazır finansmandan ayrı gösteriliyor.
- Finansman kaynakları proje kaydında, kopyalamada, yedekte ve yenileme sonrasında korunuyor.

## Borç servis motoru

- Kredi ve tedarikçi kredisi ayrı borç türleri olarak modelleniyor.
- Kullanıcı yıllık faiz oranı, vade, ödemesiz dönem ve peşin finansman masrafı girebiliyor.
- Eşit taksit ve eşit anapara ödeme yöntemleri destekleniyor.
- Finansman girişi, anapara, faiz, masraf ve kalan borç birbirinden ayrılıyor.
- Planlanan kredi borç servisi veya nakit girişi üretmiyor.
- Kullanılabilir ve kullanılmış kredi, hazır olduğu ayda nakit girişi üretiyor.
- Ödemesiz dönem ilk taksiti ileri taşıyor.
- Son taksit kuruş seviyesinde kalan anaparayı tamamen kapatıyor.
- Birden fazla kredi için kalan borç, doğrulanmış kaynak bazlı bakiyelerden birleştiriliyor.
- 12 ayı aşan anapara `ufuk sonrası bakiye` olarak korunuyor.
- Kredi anaparası ve faiz gideri sektör motorunun faaliyet kârına eklenmiyor; yalnız nakit akışını etkiliyor.

## Kuruluş ve borç ödeme takvimi

- Kuruluş kalemleri `Ödeme ayı` ve `Taksit sayısı` alanlarına göre aylara dağıtılıyor.
- Görünüm `Açılış / Ay 0` ile `Ay 12` arasını gösteriyor.
- Finansman girişi, kuruluş ödemesi, anapara, faiz, masraf, net etki ve kalan borç ayrı sütunlarda gösteriliyor.
- İlk 12 ay toplamı ayrı hesaplanıyor.
- 12 ay sonrasına kalan kuruluş ödemesi ve anapara ayrıca gösteriliyor.
- Ödeme planı yalnız `Hesaba dahil` durumundaki maliyet kalemlerini kullanıyor.

## Ana nakit akışı entegrasyonu

- Kuruluş ödeme planı ana 12 aylık faaliyet nakit tablosuna bağlandı.
- Faaliyet sonu nakdi ile kuruluş/finansman etkisi ayrı sütunlarda korunuyor.
- Birleşik dönem sonu nakdi son sütunda hesaplanıyor.
- Açılış hareketi varsa `Ay 0` satırı gösteriliyor; yoksa mevcut 12 aylık görünüm korunuyor.
- Ana tabloda şu ek sütunlar bulunuyor:
  - eski kuruluş düzeltmesi,
  - kuruluş finansmanı,
  - kuruluş ödemesi,
  - borç anapara,
  - borç faizi,
  - finansman masrafı,
  - faaliyet sonu,
  - birleşik dönem sonu.
- Kuruluş hareketi bulunmadığında mevcut sektör nakit sonuçları değişmiyor.

## Çift sayım koruması

Mevcut sektör motorlarının bir bölümünde eski toplu `setupCosts` ve `financing` hareketleri bulunuyor. Ayrıntılı kuruluş çalışma alanı aktif olduğunda aynı tutarın iki kez nakde girmemesi için:

1. ayrıntılı kuruluş maliyeti varsa eski toplu kurulum etkisi nötrleniyor,
2. ayrıntılı aktif finansman varsa eski toplu finansman etkisi nötrleniyor,
3. ayrıntılı taksit, finansman ve borç hareketleri bunların yerine ekleniyor,
4. yapılan düzeltme `Eski kuruluş düzeltmesi` sütununda görünür tutuluyor,
5. nötrlenen toplamlar CSV ve rapor denetim izinde saklanıyor.

Bu işlem sektör motorlarının kâr hesabını değiştirmez; yalnız nakit katmanındaki tekrar riskini kapatır.

## Kuruluş CSV çıktısı

Ana kuruluş paneline `Kuruluş CSV` işlemi eklendi. Çıktı şunları içeriyor:

- güvenli başlangıç nakdi ve gerekli özkaynak,
- hazır ve planlanan finansman,
- gider, varlık, stok, bağlı nakit ve KDV özeti,
- tüm kuruluş maliyet kalemleri,
- tüm finansman kaynakları,
- faiz, vade, ödemesiz dönem ve masraf koşulları,
- Ay 0–12 kuruluş ve borç takvimi,
- kalan borç ve ufuk sonrası kuruluş ödemesi,
- tüm vade boyunca tahmini faiz,
- nötrlenen eski kurulum ve finansman etkileri.

CSV UTF-8 BOM ve noktalı virgül ayracıyla Excel uyumlu üretiliyor.

## Ortak HTML raporu

Ortak rapor sözleşmesi `1.3` sürümüne yükseltildi. Rapor artık:

- faaliyet karar özetini,
- dört ana göstergeyi,
- riskleri,
- güvenli başlangıç nakdini,
- gerekli özkaynağı,
- kuruluş maliyet kalemlerini,
- finansman kaynaklarını,
- kredi koşullarını,
- kuruluş ve borç ödeme takvimini,
- birleşik nakit görünümünü,
- varsayım denetim izini

tek çevrimdışı HTML dosyasında taşıyor.

Rapor harici stil veya betik kaynağına ihtiyaç duymuyor ve Yazdır/PDF görünümünü koruyor.

## Finansal korumalar

- Teklif veya doğrulama bekleyen kalemler sıfır tutarla tutuluyor.
- Sistem piyasa fiyatı uydurmuyor.
- İndirilebilir KDV başlangıç nakdinden erken düşülmüyor.
- Depozito gider olarak sınıflandırılmıyor.
- Stok doğrudan kuruluş gideri sayılmıyor.
- Sabit kıymet ile gider tabanı ayrılıyor.
- Planlanan fakat kullanılamayan finansman özkaynak ihtiyacından düşülmüyor.
- Kredi anaparası faaliyet gideri sayılmıyor.
- Faiz ve finansman masrafı nakit planında ayrı gösteriliyor.
- Aynı kural ve aynı öneri kalemi iki kez üretilmiyor.
- Eski toplu ve yeni ayrıntılı kuruluş hareketleri aynı anda iki kez sayılmıyor.

## Sürüm ve yayın güvenilirliği

- `package.json`, `package-lock.json`, görünür uygulama başlığı, standalone üretimi ve production build `0.24.2` sürümünde eşitlendi.
- Production paketine kuruluş, entegrasyon ve borç servis modülleri dahil edildi.
- Playwright bağımlılığı npm üzerinden indirilebilir sabit `1.60.0` sürümüne kilitlendi.
- Standalone sektör hesaplayıcılarının mevcut davranışı korundu; ayrıntılı kuruluş çalışma alanı ana platformda çalışıyor.
- Sekiz sektörün golden faaliyet sonuçları korunuyor.

## Doğrulama sonucu

- Node birim ve entegrasyon testleri: **290/290 geçti**.
- JavaScript modül kontrolü: **110 modül doğrulandı**.
- Production build: **geçti**.
- Chromium masaüstü E2E: **geçti**.
- Chromium mobil E2E: **geçti**.
- Kuruluş kalemi düzenleme ve nakit hesabı: **geçti**.
- Sayfa yenileme sonrası kuruluş ve finansman kalıcılığı: **geçti**.
- Koşul senkronizasyonu ve tekrar koruması: **geçti**.
- Planlanan finansmanın özkaynağı azaltmaması: **geçti**.
- Kullanılabilir ve kullanılmış finansmanın özkaynağı azaltması: **geçti**.
- Faiz, vade, ödemesiz dönem ve masraf kalıcılığı: **geçti**.
- Eşit taksit ve eşit anapara borç planları: **geçti**.
- Kuruluş taksitlerinin Ay 0–12 dağılımı ve ufuk sonrası bakiye: **geçti**.
- Ana nakit akışında çift sayım koruması: **geçti**.
- Kuruluş CSV indirme akışı: **geçti**.
- Ortak raporda kuruluş ve borç görünümü: **geçti**.
- 320 piksel dar görünüm: **geçti**.
- Ciddi/kritik erişilebilirlik ihlali denetimi: **geçti**.
- GitHub Release quality gate: **#901 başarılı**.

## Bilerek sonraya bırakılanlar

- Kafe dışındaki yedi sektör için ayrıntılı kuruluş ve açılış paketleri.
- Resmî kaynak sicilinin güncel ve doğrulanmış kurum verileriyle doldurulması.
- KDV, gelir/kurumlar vergisi ve SGK için dönemsel rezerv motorları.
- Değişken faiz, ara ödeme, erken kapama ve refinansman gibi ileri kredi olayları.
- Kuruluş çalışma alanının bağımsız/standalone sektör HTML dosyalarına bağlanması.
- Gerçek kullanıcı pilotundan gelecek alan ve açıklama sadeleştirmeleri.

## Sonraki teknik dilim

1. Fiziksel perakende için ayrıntılı kuruluş paketi oluşturmak.
2. Resmî kaynak sicili veri sözleşmesini ve güncellik kapılarını uygulamak.
3. Vergi ve çalışan yükleri için dönemsel rezerv takvimi kurmak.
4. Kuruluş/borç sonuçlarını portföy karşılaştırmasına normalleştirilmiş göstergeler olarak eklemek.
5. Kafe ve fiziksel perakende paketleriyle gerçek kullanıcı pilotunu hazırlamak.

Ana sektör motorlarının faaliyet kârı ve golden sonuçları korunacaktır.
