# SaaS / Abonelik Sektör Spesifikasyonu

## 1. İş türleri

- B2B SaaS
- B2C abonelik
- Mikro SaaS
- API servis
- Mobil uygulama aboneliği
- Üyelik sitesi

## 2. Abone hareketi

```text
churned_subscribers = opening_subscribers × monthly_churn_rate
ending_subscribers = max(0, opening_subscribers − churned_subscribers + new_subscribers)
net_subscriber_change = ending_subscribers − opening_subscribers
```

Ay sonu abone sayısı sonraki ayın ay başı abone sayısıdır.

## 3. Tekrarlayan gelir

```text
opening_MRR = opening_subscribers × monthly_price
new_MRR = new_subscribers × monthly_price
churned_MRR = churned_subscribers × monthly_price
net_new_MRR = new_MRR − churned_MRR
MRR = ending_subscribers × monthly_price
ARR = MRR × 12
```

`Net MRR`, uygulama ekranında KDV ve platform/ödeme komisyonlarından sonraki aylık abonelik geliri anlamına gelir.

## 4. Komisyonlar

```text
platform_revenue = adjusted_revenue × platform_sales_share
platform_commission = platform_revenue × platform_commission_rate
direct_revenue = adjusted_revenue − platform_revenue
payment_commission = direct_revenue × payment_commission_rate
```

Platform komisyonu yalnız platform satış payına; ödeme sağlayıcı komisyonu yalnız doğrudan satış payına uygulanır.

## 5. Değişken ve sabit maliyetler

```text
server_variable = ending_subscribers × server_cost_per_subscriber
support_variable = ending_subscribers × support_cost_per_subscriber
acquisition_spend = new_subscribers × CAC
```

Sabit sunucu, destek ekibi, geliştirme ekibi, sabit pazarlama, yazılım araçları ve idari giderler sabit maliyettir.

## 6. Birim ekonomi

```text
recurring_contribution = net_MRR − server_variable − support_variable
contribution_per_subscriber = recurring_contribution / ending_subscribers
LTV = contribution_per_subscriber / monthly_churn_rate
LTV_CAC = LTV / CAC
CAC_payback_months = CAC / contribution_per_subscriber
```

- Churn sıfırsa LTV hesaplanamaz olarak gösterilir.
- CAC sıfırsa LTV/CAC hesaplanamaz olarak gösterilir.
- CAC kazanım harcaması aylık P&L’de ayrıca düşülür; LTV hesabında tekrar düşülmez.

## 7. Başabaş

Başabaş ay başı abone sayısı ikili aramayla bulunur. Tam sayı abone gereği nedeniyle ilk negatif olmayan tam sayı yukarı yuvarlanır. Arayüz ay sonu başabaş abone sayısını ve karşılık gelen MRR’ı gösterir.

## 8. Nakit akışı

- İlk geliştirme yatırımı ve kurulum giderleri seçilen ayda bir kez nakitten düşer.
- Finansman ve hibe P&L geliri değildir.
- Tahsilat gecikmesi geliri silmez; tahsilatı en fazla bir ay kaydırır.
- 12 aylık tabloda her ayın aktif abone sayısı nakit sonuçlarıyla birlikte gösterilir.

## 9. Prototip uyarı eşikleri

- Aylık churn `%5` üzeri yumuşak, `%10` üzeri sert uyarı.
- LTV/CAC `3` altı yumuşak, `1` altı sert uyarı.
- CAC geri dönüşü `12` ay üzeri yumuşak, `18` ay üzeri sert uyarı.
- Abone başı sunucu maliyetinin aylık fiyata oranı `%15` üzeri yumuşak, `%30` üzeri sert uyarı.
- Yeni kazanım churn kaybını karşılamıyorsa sert küçülme uyarısı.

Bu eşikler sektör gerçeği iddiası değil, prototip risk sinyalleridir; kullanıcı tarafından düzenlenecek gelişmiş eşik sistemi sonraki sürümlere bırakılmıştır.
