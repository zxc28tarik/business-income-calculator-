# 01 — Oyun Yayıncısı Master Modeli v2 Notları

## Kaynak kimliği

- Korunan kaynak: `reference/source-archive/` altındaki gzip+base64 parçaları
- Materyalize edilen dosya: `reference/01_oyun_yayincisi_master_model_v2.html`
- Kaynak adı: `yayinci-fizibilite-hesaplayici (1)(1).html`
- SHA-256: `2eaf4cfb1667494f37c59d2c701f6a9898806e7ab4fadecd5c94d4709cf46424`
- İki ayrı yüklenen HTML kopyası byte düzeyinde aynıdır.
- Arşiv, orijinal HTML’yi byte düzeyinde üretir ve testte SHA-256 ile doğrulanır. Düzeltme veya geliştirmeler master kaynağın üzerine yazılmaz; yeni sürüm veya çıkarılmış motor dosyalarında yapılır.

## Ana hesap zinciri

Master prototipte hesap akışı şu sıradadır:

```text
readInputs
→ calcPlatform
→ calcPublisherReceipt
→ calcRecoup
→ calcDeveloperSettlement
→ calcPublisherPnL
→ calcTax
→ calcCashFlow
→ render
```

Başabaş hesabı `breakevenUnits` fonksiyonunda modelin tamamı tekrar çalıştırılarak ikili arama ile bulunur.

## Ekran yapısı

Master dosyada korunan ana ekran düzeni:

1. Kötümser / beklenen / iyimser senaryo seçimi
2. On girdi paneli
3. Kural tabanlı uyarılar
4. KPI kartları
5. “Kim ne alıyor?” paneli
6. Brütten net kâra şelale
7. Senaryo karşılaştırması
8. 12 aylık nakit akışı
9. A–H ayrıntılı döküm
10. Mali müşavir / vergi / hukuk uyarısı

Dosyada 109 benzersiz HTML kimliği, 23 adlandırılmış fonksiyon ve 12 ana KPI kartı bulunur.

## Masterdaki finans katmanları

### Satış ve vergi

- Basit satış modeli
- Bölge bazlı yerel fiyat ve para birimi
- İndirim
- İade
- Ters ibraz
- Fiyata dahil vergi
- Fiyat üstü vergi
- Vergisiz satış

### Platform ve tahsilat

- Kademeli veya sabit Steam komisyonu
- ABD kaynaklı gelir payına bağlı stopaj
- Steam Direct ücret/iade mantığı
- SWIFT/havale masrafı
- Ödeme sağlayıcı kesintisi
- Kur makası ve kur farkı

### Anlaşma ve paydaş

- Yayıncı/geliştirici paylaşımı
- Paylaşım tabanı
- Recoup sırası
- Recoup üst limiti
- Minimum garanti / advance
- Milestone
- Advance mahsubu
- IP/lisans payı
- Co-publisher payı
- Geliştirici ödeme para birimi ve sıklığı

### P&L ve vergi

- Operasyonel gelir
- Hibe/destek
- Yatırım/finansman ayrımı
- Doğrudan oyun giderleri
- Yayıncı operasyon giderleri
- Genel gider dağıtımı
- Amortisman
- Kur farkı
- Kurumlar vergisi veya dilimli gelir vergisi
- Devreden zarar
- ABD stopaj mahsubu
- İhracat indirimi / Teknopark varsayımı
- Temettü dağıtımı ve stopajı

### Nakit

- Eldeki nakit
- Launch öncesi yakım
- Launch pazarlaması
- Steam tahsilat gecikmesi
- Geliştirici ödeme gecikmesi
- İlk ay satış yoğunluğu
- Runway
- Recoup kapanış ayı
- İlk geliştirici ödeme ayı
- Yaklaşık başabaş ayı

## Ortak motora çıkarılacak parçalar

Aşağıdaki parçalar sektör bağımsız veya yapılandırılabilir ortak motor katmanına dönüşmelidir:

- Sayı ve oran normalizasyonu
- Para birimi dönüşümü
- Vergi ayrıştırma
- Tek oranlı ve kademeli komisyon
- İade/fire/no-show/churn gibi kayıp motoru
- Tahsilat ve kur etkisi
- Operasyonel gelir / hibe / finansman sınıflandırması
- Paydaş tabanı ve pay hesaplama
- Recoup/mahsup zinciri
- P&L üretimi
- Vergi ön tahmini ve dağıtım vergisi
- Başabaş araması
- Senaryo yönetimi
- 12 aylık nakit akışı
- Uyarı, KPI, şelale ve ayrıntılı döküm verisi

## Oyun sektörüne özel kalacak parçalar

- Steam bölge listesi ve yerel fiyatları
- Steam komisyon kademe varsayımları
- Steam Direct ücreti
- ABD kaynaklı Steam stopaj modeli
- Oyun yayıncılığı recoup kalemleri
- Minimum garanti / milestone sözleşme alanları
- Geliştirici royalty settlement dili
- DLC, soundtrack, bundle, key, Game Pass ve port gelir satırları

## Koruma kuralı

Bu master dosya, çıkarılacak motorun doğrulama kaynağıdır. Motor refaktörü sırasında seçilmiş örnek girdiler için master sonuçları “golden test” olarak kaydedilecek; kasıtsız formül sapmaları testte yakalanacaktır.
