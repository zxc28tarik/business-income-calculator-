# Kuruluş ve Açılış Çalışma Alanı — Uygulama Durumu

| Alan | Değer |
|---|---|
| Tarih | 3 Ağustos 2026 |
| Uygulama sürümü | `0.24.2` |
| Dal | `agent/kurulus-acilis-vergi-stratejisi-v6` |
| PR | `#7` |
| Durum | Çalışan kuruluş, finansman ve ödeme planı dilimi; taslak PR |
| Son doğrulanan kalite kapısı | `Release quality gate #858 — başarılı` |

> PR taslak durumundadır ve `main` dalına birleştirilmemiştir. Bu belge yalnız uygulanan kapsamı, doğrulamaları ve sıradaki teknik sınırı kayıt altına alır.

## Tamamlanan çekirdek

- Kuruluş profili ve güvenli veri normalizasyonu.
- Kuruluş gideri, sabit kıymet, tadilat, stok, depozito, peşin gider ve işletme sermayesi sınıfları.
- KDV dahil/hariç ayrımı.
- İndirilebilir, indirilemeyen ve doğrulama bekleyen KDV ayrımı.
- Peşin ve taksitli ödeme takvimi.
- Yalnız hazır finansmanı düşen başlangıç nakdi köprüsü.
- Beklenmeyen gider rezervi.
- Koşul tabanlı gereksinim motoru.
- Sektör, iş türü, hukuki yapı, il/ilçe ve yürürlük tarihi kapsamı.
- Ortak kuruluş kuralları.
- İlk kafe/restoran kuruluş paketi.

## Tamamlanan proje ve arayüz bağlantısı

- Kuruluş çalışma alanı proje içindeki sektör durumuna bağlandı.
- Eski kayıtlar kuruluş alanı olmadan güvenli biçimde açılabiliyor.
- Kuruluş verisi proje kopyalama ve tam yedek içinde taşınıyor.
- Ana uygulamaya `Kuruluş` çalışma alanı eklendi.
- İşletme koşulları düzenlenebiliyor.
- Koşullardan doğan kontrol listesi gösteriliyor.
- Önerilen maliyet kalemleri kullanıcı tarafından düzenlenebiliyor.
- Özel maliyet kalemi eklenebiliyor.
- Silinen öneri kalemi otomatik senkronizasyonda yeniden oluşmuyor.
- Yalnız `Hesaba dahil` durumundaki tutarlar finans hesabına giriyor.
- Ana sonuçlarda `Gerçek başlangıç nakdi` kartları sürekli gösteriliyor.
- Kuruluş verisi sayfa yenilemesinden sonra korunuyor.
- Masaüstü ve mobil stiller eklendi.

## Finansman kaynakları

- Kullanıcı finansman kaynağı ekleyebiliyor, düzenleyebiliyor ve kaldırabiliyor.
- Kaynak türleri: özkaynak, kredi, hibe, destek/teşvik, tedarikçi kredisi ve diğer.
- Kaynak durumları: `Planlandı`, `Kullanılabilir`, `Kullanıldı`, `Hariç`.
- `Planlandı` durumundaki kaynak bilgi amaçlı tutuluyor ve gerekli özkaynaktan düşülmüyor.
- `Kullanılabilir` durumundaki kaynak yalnız açılış ayına kadar hazırsa gerekli özkaynaktan düşülüyor.
- `Kullanıldı` durumundaki kaynak gerçekleşmiş finansman kabul edilerek gerekli özkaynaktan düşülüyor.
- `Hariç` durumundaki kaynak hesaplamaya alınmıyor.
- Planlanan finansman ana sonuç kartında hazır finansmandan ayrı gösteriliyor.
- Finansman kaynakları proje kaydında ve sayfa yenilemesinden sonra korunuyor.

## Kuruluş ödeme takvimi

- Kuruluş kalemleri `Ödeme ayı` ve `Taksit sayısı` alanlarına göre aylara dağıtılıyor.
- Görünüm `Açılış / Ay 0` ile `Ay 12` arasını gösteriyor.
- İlk 12 ay toplamı ayrı hesaplanıyor.
- 12 ay sonrasına kalan ödeme ayrıca gösteriliyor.
- Ödeme planı yalnız `Hesaba dahil` durumundaki kalemleri kullanıyor.
- Kuruluş ödeme takvimi bu aşamada ana faaliyet nakit akışından ayrı tutuluyor.

## Finansal korumalar

- Teklif veya doğrulama bekleyen kalemler sıfır tutarla tutuluyor.
- Sistem piyasa fiyatı uydurmuyor.
- İndirilebilir KDV başlangıç nakdinden erken düşülmüyor.
- Depozito gider olarak sınıflandırılmıyor.
- Stok doğrudan kuruluş gideri olarak gösterilmiyor.
- Sabit kıymet ile gider tabanı ayrılıyor.
- Planlanan fakat kullanılamayan finansman özkaynak ihtiyacından düşülmüyor.
- Aynı kural ve aynı öneri kalemi iki kez üretilmiyor.

## Sürüm ve yayın düzeltmeleri

- `package.json`, `package-lock.json`, görünür uygulama başlığı, standalone üretimi ve production build `0.24.2` sürümünde eşitlendi.
- Production paketine `styles-setup.css` ve setup modülleri dahil edildi.
- Playwright bağımlılığı npm üzerinden gerçekten indirilebilir sabit `1.60.0` sürümüne kilitlendi.
- Standalone sektör hesaplayıcılarının mevcut davranışı korundu; kuruluş çalışma alanı bu aşamada yalnız ana platforma bağlandı.

## Doğrulama sonucu

- Node birim ve entegrasyon testleri: **275/275 geçti**.
- JavaScript modül kontrolü: **108 modül doğrulandı**.
- Production build: **geçti**.
- Chromium masaüstü E2E: **geçti**.
- Chromium mobil E2E: **geçti**.
- Kuruluş kalemi düzenleme ve nakit hesabı: **geçti**.
- Sayfa yenileme sonrası kuruluş verisi kalıcılığı: **geçti**.
- Koşul senkronizasyonu ve tekrar koruması: **geçti**.
- Planlanan finansmanın özkaynağı azaltmaması: **geçti**.
- Kullanılabilir ve kullanılmış finansmanın özkaynağı azaltması: **geçti**.
- Finansman kaynağı ekleme, düzenleme, kaldırma ve kalıcılık: **geçti**.
- Kuruluş taksitlerinin ay 0–12 dağılımı ve ufuk sonrası bakiye: **geçti**.
- 320 piksel dar görünüm: **geçti**.
- Ciddi/kritik erişilebilirlik ihlali denetimi: **geçti**.
- GitHub Release quality gate: **#858 başarılı**.

## Bilerek sonraya bırakılanlar

- Kuruluş ödeme planının ana 12 aylık faaliyet nakit tablosuyla birleştirilmesi.
- Kuruluş planına özel rapor ve CSV çıktısı.
- Finansman geri ödeme, faiz ve masraf planının ayrı borç servis modeli olarak eklenmesi.
- Kafe dışındaki yedi sektör için ayrıntılı kuruluş paketleri.
- Resmî kaynak kayıtlarının güncel ve doğrulanmış verilerle doldurulması.

## Sonraki teknik dilim

1. Kuruluş sonuçlarını ortak rapor modeline eklemek.
2. Kuruluş maliyetleri, finansman kaynakları ve ödeme takvimi için CSV bölümleri üretmek.
3. Kuruluş ödeme planını ana 12 aylık nakit akışına çift sayım yapmadan bağlamak.
4. Kredi geri ödeme, faiz ve finansman masraflarını kuruluş finansmanından ayrı modellemek.
5. Kafe paketi gerçek kullanıcı doğrulamasından sonra fiziksel perakende paketine geçmek.

Ana sektör motorlarının golden finans sonuçları bu çalışmalar sırasında korunacaktır.
