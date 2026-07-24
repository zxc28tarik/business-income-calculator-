# Business Income Calculator v0.24.0 — Sürüm Notları

**Durum:** Yayın adayı  
**Dal:** `plan/v0.24-ui-ux-redesign`  
**Birleştirme:** Kullanıcı açıkça onay vermeden `main` dalına birleştirilmez ve canlı yayın yapılmaz.

## Sürümün amacı

v0.24.0 yeni bir finans motoru eklemez. Mevcut sekiz sektörün hesaplama gücünü daha anlaşılır, daha güvenli ve daha erişilebilir bir çalışma düzenine taşır.

Ana kullanıcı akışı artık şu sıradadır:

1. Kayıt ve sektörü seç.
2. Kötümser, beklenen veya iyimser senaryoyu belirle.
3. Basit görünümde temel varsayımları gir; gerektiğinde Gelişmiş görünümü aç.
4. Karar özetini ve dört ana göstergeyi kontrol et.
5. Uyarı, nakit, senaryo ve ayrıntılı döküme gerektiğinde in.
6. Rapor, CSV, yedek veya yazdırma çıktısı al.

## Öne çıkan değişiklikler

### Daha sade çalışma alanı

- Üst alanda en fazla dört ana eylem bulunur.
- Kayıt, dışa aktar, veri ve diğer işlemler erişilebilir menülerde gruplanır.
- Otomatik kayıt durumu görünürdür.
- Sektör sıfırlama işlemi açıklamalı onay gerektirir.

### Basit ve Gelişmiş form görünümü

- Basit görünüm sektör başına yaklaşık 10–16 temel alan gösterir.
- Gelişmiş görünüm mevcut bütün sektör alanlarını ve tablolarını korur.
- Görünüm değişikliği hiçbir girdiyi silmez ve finans sonucunu değiştirmez.
- Form bölümleri güncel değerlerden üretilen kısa özetler gösterir.

### Karar özeti ve gösterge hiyerarşisi

- Sonuçlar `Dengeli`, `Dikkat` veya `Riskli` olarak sınıflanır.
- İlk ekranda dört ana gösterge bulunur.
- Sektöre özgü ana gelir göstergesi korunur.
- İkincil göstergeler gerektiğinde açılır.

### Uyarı ve nakit görünümü

- Uyarılar Kritik, Dikkat, Bilgi ve Olumlu seviyelerine ayrılır.
- Bütün kritik uyarılar her zaman görünür kalır.
- Nakit bölümünde minimum nakit, ilk negatif ay, 12 ay sonu nakit ve ek finansman ihtiyacı özetlenir.
- Negatif nakit hücreleri hem görsel hem ekran okuyucu açıklaması taşır.

### Portföy ve gerçek takip

- Portföy masaüstünde odaklı çekmece, mobilde tam ekran çalışma panelidir.
- Aktif kayıt, sektör, senaryo, net sonuç, 12 ay nakit ve durum karşılaştırılır.
- Gerçek takip ayrı çalışma modudur.
- İlk altı ay veya on iki ay görünümü seçilebilir.
- Escape, dışarı tıklama, odak tuzağı ve tetikleyiciye odak dönüşü uygulanır.

### Rapor ve yazdırma

- İndirilen rapor ana ekranla aynı karar özeti ve dört ana gösterge sırasını kullanır.
- Uyarı, senaryo, nakit özeti ve varsayım denetim izi rapora taşınmıştır.
- A4 yazdırma/PDF görünümü sadeleştirilmiştir.
- Rapor çevrimdışı tek HTML olarak kalır.

### Bağımsız hesaplayıcılar

Sekiz sektörün tamamı aynı v0.24.0 arayüz ve sonuç sözleşmesiyle çevrimdışı tek HTML olarak üretilir:

- Kafe / Restoran
- E-Ticaret / Pazaryeri
- Güzellik / Kuaför / Bakım
- Ajans / Freelancer / Danışmanlık
- SaaS / Abonelik
- Fiziksel Perakende
- Oto Hizmetleri
- Oyun / Dijital Yayıncılık

## Değişmeyen sözleşmeler

- Sektör hesap formülleri değiştirilmedi.
- Sekiz golden finans sonucu birebir korundu.
- P&L ve nakit ayrımı değiştirilmedi.
- Vergi, amortisman, hibe, yatırım ve finansman sınıflandırması değiştirilmedi.
- Kayıt, portföy, gerçek takip ve yedek verileri geriye uyumlu kaldı.
- Rapor ve CSV sayısal kaynakları değiştirilmedi.
- Tek HTML çevrimdışı çalışma özelliği korundu.

## Yayın kapısı

Aşağıdaki kontroller yeşil olmadan sürüm hazır sayılmaz:

- bütün birim ve entegrasyon testleri,
- sekiz finans regresyon hash'i,
- JavaScript modül denetimi,
- production build,
- masaüstü ve mobil Chromium akışları,
- ciddi/kritik axe ihlali olmaması,
- %200 yakınlaştırma eşdeğeri ve 320 px dar ekran,
- reduced-motion davranışı,
- sekiz bağımsız HTML üretimi ve deterministik çıktı.

Bu kontroller tamamlandıktan sonra bile `main`e birleştirme ve canlı yayın için kullanıcıdan açık onay alınacaktır.
