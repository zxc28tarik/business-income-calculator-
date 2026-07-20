# Mimari Notları

## Ana katmanlar

- `src/core/finance-engine.js`: sektör bağımsız vergi, komisyon, başabaş ve nakit yardımcıları
- `src/core/master-finance-engine-v2.js`: korunan Steam master motoru
- `src/core/sector-schema.js`: alan, tablo ve koşullu görünürlük sözleşmesi
- `src/ui/`: ortak form ve sonuç görünümü
- `src/sectors/registry.js`: aktif sektör listesi

## Profil katmanı ilkesi

Profil katmanı ortak UI veya finans yardımcılarını kopyalamaz. İş türünün gelir/talep sürücüsünü, kapasitesini, varsayımlarını, KPI ve uyarılarını sektör motoruna verir. Sektör motoru P&L, başabaş ve nakit akışını üretir.

## Tamamlanan v2 sektörleri

- Oyun / Dijital Yayıncılık
- Kafe / Restoran
- E-Ticaret / Pazaryeri
- Güzellik / Kuaför / Bakım
- Ajans / Freelancer / Danışmanlık
- SaaS / Abonelik

## SaaS / Abonelik v2

- `saas-business-profiles.js`: sekiz iş türünün varsayımları ve gelir sürücüsü
- `saas-profile-form-core.js`: abone, API ve kurumsal sözleşme alanları
- `saas-profile-form-growth.js`: plan tablosu, yıllık ödeme, deneme, freemium ve destek alanları
- `saas-v2-config.js`: eski veriyi koruyan profil geçişi, normalizasyon ve senaryolar
- `saas-profile-engine.js`: plan fiyatı, dönüşüm, kullanım, onboarding, expansion ve maliyet hesabı
- `saas-v2-core.js`: profile özgü başabaş, müşteri takvimi, NRR/GRR, nakit ve uyarılar
- `saas-v2-presentation.js`: profile özgü KPI ve denetim izi
- `saas-v2.js`: v2 sektör sözleşmesi ve nakit kolonları

Gelir sürücüleri:

- B2B/B2C/Mikro/Mobil/Üyelik: ücretli müşteri veya abone hareketi
- API: müşteri × kullanım birimi × birim fiyat
- Freemium: ücretsiz kullanıcı × dönüşüm + doğrudan yeni ücretli kullanıcı
- Kurumsal lisans: müşteri × yıllık sözleşme / 12 + onboarding

Plan tablosu müşteri payı, aylık fiyat, yıllık ödeme payı ve yıllık indirimi taşır. Churn, yeniden aktivasyon, expansion ve contraction ayrı girdilerdir. Destek kapasitesi, destek personeli × personel başı müşteri kapasitesiyle hesaplanır.

## Yıllık ödeme muhasebesi

- Aylık P&L, yıllık sözleşmenin aylık kazanılmış gelir karşılığını tanır.
- Yıllık peşin ödeme ilk ay nakdini öne çeker.
- Sonraki aylardaki aynı tahsilat payı nakitten çıkarılarak çift sayım engellenir.
- Bu katman 12 aylık fizibilite zamanlama yaklaşımıdır; tam ertelenmiş gelir muhasebe defteri değildir.

## P&L / nakit ayrımı

- Finansman ve yatırım P&L geliri değildir.
- P&L faaliyet hibesi ile tek seferlik hibe nakit girişi ayrıdır.
- Peşin tahsilat kârı değiştirmez; tahsilat zamanını değiştirir.
- Amortisman yalnız P&L gideridir ve nakitten ikinci kez düşülmez.

## Sektör sözleşmesi

Her sektör kimlik, iş türleri, varsayılan girdiler, senaryolar, form bölümleri, normalizasyon, hesaplama, karşılaştırma ve sunum fonksiyonlarını sağlar. Profil sektörleri ayrıca `businessProfiles` ve `applyBusinessType` sunabilir. UI sektör formüllerini bilmez.

## Test mimarisi

- ortak motor ve sektör kabul testleri
- Steam kaynak hash ve golden testleri
- gerçek HTML smoke testi
- eski sektör sonucu koruma testleri
- alt iş türü, tablo, senaryo, P&L/nakit ve kapasite testleri
- SaaS için sekiz profil, API, mobil, freemium, kurumsal sözleşme, plan karması, yıllık nakit ve NRR testleri
- `scripts/check-modules.mjs` ile bütün kaynak modüllerinin içe aktarım kontrolü

## Sonraki aşama

Sıradaki çalışma Fiziksel Perakende sektörünün ürün/kategori karması, mağaza trafiği, dönüşüm, stok, tedarik, iskonto, fire ve işletme sermayesiyle v2 derinliğine taşınmasıdır. Rapor katmanına henüz geçilmez.
