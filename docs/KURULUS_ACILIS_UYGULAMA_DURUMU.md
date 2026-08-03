# Kuruluş ve Açılış Çalışma Alanı — Uygulama Durumu

| Alan | Değer |
|---|---|
| Tarih | 3 Ağustos 2026 |
| Uygulama sürümü | `0.24.2` |
| Dal | `agent/kurulus-acilis-vergi-stratejisi-v6` |
| PR | `#7` |
| Durum | Çalışan ilk ürün dilimi, taslak PR |
| Son kalite kapısı | `Release quality gate #824 — başarılı` |

> PR taslak durumundadır ve `main` dalına birleştirilmemiştir. Bu belge yalnız uygulanan kapsamı, doğrulamaları ve sıradaki teknik sınırı kayıt altına alır.

## Tamamlanan çekirdek

- Kuruluş profili ve güvenli veri normalizasyonu.
- Kuruluş gideri, sabit kıymet, tadilat, stok, depozito, peşin gider ve işletme sermayesi sınıfları.
- KDV dahil/hariç ayrımı.
- İndirilebilir, indirilemeyen ve doğrulama bekleyen KDV ayrımı.
- Peşin ve taksitli ödeme takvimi.
- Yalnız kullanılabilir finansmanı düşen başlangıç nakdi köprüsü.
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

- Node birim ve entegrasyon testleri: **272/272 geçti**.
- JavaScript modül kontrolü: **108 modül doğrulandı**.
- Production build: **geçti**.
- Chromium masaüstü E2E: **geçti**.
- Chromium mobil E2E: **geçti**.
- Kuruluş kalemi düzenleme ve nakit hesabı: **geçti**.
- Sayfa yenileme sonrası kuruluş verisi kalıcılığı: **geçti**.
- Koşul senkronizasyonu ve tekrar koruması: **geçti**.
- 320 piksel dar görünüm: **geçti**.
- Ciddi/kritik erişilebilirlik ihlali denetimi: **geçti**.
- GitHub Release quality gate: **#824 başarılı**.

## Bilerek sonraya bırakılanlar

- Finansman kaynaklarının kullanıcı arayüzünden eklenmesi.
- Kuruluş ödeme takviminin ayrı aylık görünümü.
- Kuruluş ödeme planının ana 12 aylık nakit tablosuyla birleştirilmesi.
- Kuruluş planına özel rapor ve CSV çıktısı.
- Kafe dışındaki yedi sektör için ayrıntılı kuruluş paketleri.
- Resmî kaynak kayıtlarının güncel ve doğrulanmış verilerle doldurulması.

## Sonraki teknik dilim

1. Finansman kaynağı ekleme ve durum yönetimi.
2. Yalnız `kullanılabilir` veya `kullanıldı` kaynağın gerekli özkaynaktan düşülmesi.
3. Kuruluş taksitlerinin aylık ödeme takvimi olarak gösterilmesi.
4. Kuruluş sonuçlarının rapor ve CSV’ye eklenmesi.
5. Kafe paketi gerçek kullanıcı doğrulamasından sonra fiziksel perakende paketine geçilmesi.

Ana sektör motorlarının golden finans sonuçları bu çalışmalar sırasında korunacaktır.
