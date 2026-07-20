# Kaynak Uyum Denetimi

## Güncel durum — v0.16.0

Proje, Steam Yayıncısı master kaynağı korunarak kaynak sırasına alınmıştır. Çalışan sektörler silinmez; her sektör kendi ekonomik yapısına göre kontrollü biçimde v2 derinliğine taşınır.

## Tamamlanan aşamalar

### Aşama 0–4 — Kaynak, golden motor, gelişmiş şema ve Steam entegrasyonu

- Orijinal Steam HTML kayıpsız arşivlendi ve SHA-256 testiyle kilitlendi.
- Kötümser, beklenen ve iyimser master sonuçları golden testlerle korundu.
- Master hesap sırası saf fonksiyonlara ayrıldı.
- Checkbox, metin, tablo, koşullu görünürlük ve sektöre özel nakit kolonları eklendi.
- Steam formu, KPI, şelale, senaryo, ayrıntı ve nakit görünümü platforma bağlandı.
- Bozuk `index.html` temiz UTF-8 olarak yeniden kuruldu ve gerçek HTML smoke testi eklendi.

### Aşama 5A–5E — Tamamlanan sektör profilleri

- Oyun / Dijital Yayıncılık: 6 profil
- Kafe / Restoran: 11 profil
- E-Ticaret / Pazaryeri: 10 profil
- Güzellik / Kuaför / Bakım: 8 profil
- Ajans / Freelancer / Danışmanlık: 10 profil

Her geçişte eski varsayılan sonuç testle korundu; iş türüne özel gelir, kapasite, gider, KPI, uyarı ve senaryo sürücüleri kuruldu.

### Aşama 5F — SaaS / Abonelik v2 profilleri

Sekiz iş türü ayrı ekonomik yapıya bağlandı:

1. B2B SaaS
2. B2C abonelik
3. Mikro SaaS
4. API / kullanım bazlı servis
5. Mobil uygulama aboneliği
6. Üyelik / içerik platformu
7. Freemium SaaS
8. Kurumsal lisans

SaaS v2 kapsamında:

- düzenlenebilir plan ve fiyat karması
- aylık/yıllık ödeme payı ve yıllık indirim
- yıllık peşin tahsilatın P&L'yi değiştirmeden nakit zamanlamasını öne çekmesi
- deneme dönüşümü, freemium dönüşümü ve yeniden aktivasyon
- churn, expansion ve contraction MRR
- GRR ve NRR
- API kullanım geliri ve birim altyapı maliyeti
- mobil mağaza/platform kesintileri
- kurumsal sözleşme ve onboarding geliri
- içerik, topluluk ve müşteri başarı kapasitesi
- profile özgü başabaş, KPI, uyarı ve nakit kolonları
- finansman ile faaliyet hibesi ayrımı

uygulandı. Eski B2B SaaS varsayılan sonucu testle korunur.

## Kaynak ve finans ilkeleri

- Steam formu diğer sektörlere kopyalanmaz.
- Finansman ve yatırım P&L geliri değildir.
- Hibe nakit girişi ile P&L faaliyet hibesi ayrı tutulur.
- Yıllık peşin tahsilat aylık geliri yapay biçimde şişirmez ve nakitte çift sayılmaz.
- Vergi ve muhasebe oranları düzenlenebilir varsayımdır; uzman teyidi gerekir.

## Sıradaki aşama

Aşama 5G — Fiziksel Perakende v2 geçişi:

1. mağaza, market, butik ve uzman perakende profillerini ayırmak
2. ürün/kategori karması, stok, tedarik ve iskonto ekonomisini derinleştirmek
3. mağaza trafiği, dönüşüm, sepet ve metrekare kapasitesini kurmak
4. fire, iade, stok devir ve işletme sermayesi uyarılarını eklemek
5. mevcut perakende varsayılan sonucunu korumak

## Daha sonraki işler

- Oto Hizmetleri v2 geçişi
- bağımsız tek HTML çıktıları
- rapor katmanı
- gerçek takip modu
