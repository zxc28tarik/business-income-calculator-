# v0.24.0 Yayın ve Kullanıcı Kabul Kontrolü

**PR:** `v0.24 Profesyonel UI/UX yenilemesi`  
**Hedef:** `main` öncesi son kontrol  
**Kural:** Aşağıdaki teknik kontroller tamamlansa bile kullanıcı açık onay vermeden birleştirme veya canlı yayın yapılmaz.

## 1. Finans güvenliği

- [x] Sekiz sektörün varsayılan finans sonuçları SHA-256 regresyon kilidinde.
- [x] Net sonuç, 12 ay sonu nakit ve minimum nakit ayrı kontrol ediliyor.
- [x] Basit/Gelişmiş görünüm değiştirmek finans sonucunu değiştirmiyor.
- [x] Karar özeti ve rapor sunum katmanında; finans motorunu değiştirmiyor.
- [x] Rapor ve CSV mevcut sayısal kaynakları kullanıyor.
- [x] Yatırım, hibe, vergi, amortisman ve finansman sınıflandırması korunuyor.

## 2. Veri güvenliği

- [x] Mevcut kayıt ve proje şeması geriye uyumlu.
- [x] Gerçek takip verileri proje bazında ayrışıyor.
- [x] Basit görünüm gizli alanların değerlerini silmiyor.
- [x] Sektör sıfırlama açıklamalı onay istiyor.
- [x] Kayıt silme açıklamalı onay istiyor.
- [x] Yedek içe aktarma özet ve onay gösteriyor.
- [x] İçe aktarma hatasında mevcut veri korunuyor.

## 3. Ana kullanıcı akışı

- [x] Kayıt ve sektör seçimi ilk alanda görünür.
- [x] Üst alanda en fazla dört ana eylem var.
- [x] Senaryo ve Basit/Gelişmiş kontrolleri anlaşılır.
- [x] Karar özeti dört ana göstergeden önce geliyor.
- [x] Kritik uyarılar gizlenmiyor.
- [x] Nakit özeti tablodan önce geliyor.
- [x] Ayrıntılı finans dökümü gerektiğinde açılıyor.

## 4. Portföy ve gerçek takip

- [x] Portföy masaüstünde çekmece, mobilde tam ekran.
- [x] Aktif kayıt açıkça işaretli.
- [x] Satırdan kayıt değiştirme klavye ile kullanılabilir.
- [x] Gerçek takip plan kapsamını ve veri tamamlama durumunu gösteriyor.
- [x] İlk 6 ay / 12 ay görünümü çalışıyor.
- [x] Escape ile kapanma ve tetikleyiciye odak dönüşü çalışıyor.
- [x] Aynı anda yalnız bir odaklı çalışma paneli açık kalıyor.

## 5. Rapor, yazdırma ve bağımsız HTML

- [x] Rapor karar özeti + dört ana gösterge hiyerarşisini kullanıyor.
- [x] Uyarılar ve nakit özeti raporda aynı anlamı taşıyor.
- [x] A4 Yazdır/PDF görünümü kontrolleri gizliyor.
- [x] Rapor harici CSS veya JavaScript bağımlılığı taşımıyor.
- [x] Sekiz bağımsız HTML çevrimdışı çalışıyor.
- [x] Bağımsız HTML üretimi deterministik.
- [x] Her bağımsız dosya 2 MB sınırının altında.

## 6. Erişilebilirlik ve responsive

- [x] Ana eylemler en az 44 × 44 px.
- [x] Klavye odağı görünür.
- [x] Menü ve çalışma panelleri `aria-expanded` durumunu güncelliyor.
- [x] Çalışma panelleri `role="dialog"` ve `aria-modal="true"` kullanıyor.
- [x] Negatif nakit yalnız renkle anlatılmıyor.
- [x] Kritik/ciddi axe ihlali yok.
- [x] 1440 px ekranın %200 yakınlaştırma eşdeğeri olan 720 px görünüm doğrulandı.
- [x] 320 px dar ekran doğrulandı.
- [x] `prefers-reduced-motion` doğrulandı.

## 7. Son teknik kapı

- [x] Paket ve arayüz sürümü `0.24.0`.
- [x] Bütün birim ve entegrasyon testleri geçti: 242/242.
- [x] JavaScript modül denetimi geçti.
- [x] Production build geçti.
- [x] Masaüstü/mobil Chromium akışları geçti: 35 geçti, 5 kasıtlı atlandı.
- [x] Production site artefaktı oluştu.
- [x] PR açıklamasındaki test sayıları son koşuyla güncellendi.
- [x] PR açık ve taslak durumda kaldı.
- [x] `main` dalına birleştirme yapılmadı.

## 8. Kullanıcı kabulü

Kullanıcı onayından önce kontrol edilecek ekranlar:

- [ ] Ana Kafe/Restoran beklenen senaryosu
- [ ] Oyun/Dijital Yayıncılık hesaplayıcısı
- [ ] Basit ve Gelişmiş görünüm
- [ ] Riskli karar özeti ve uyarılar
- [ ] Portföy paneli
- [ ] Gerçek takip paneli
- [ ] İndirilen finansal rapor
- [ ] Yazdır/PDF önizlemesi
- [ ] Mobil tam ekran çalışma paneli

## Onay kaydı

- Teknik kalite kapısı: **Geçti — GitHub Actions Release quality gate #690**
- Kullanıcı kabulü: **Bekliyor**
- `main` birleştirme izni: **Verilmedi**
- Canlı yayın izni: **Verilmedi**
