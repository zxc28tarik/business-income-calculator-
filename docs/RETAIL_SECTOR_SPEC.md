# Fiziksel Perakende Sektör Spesifikasyonu

## 1. İş türleri

- Butik mağaza
- Pet shop
- Telefon aksesuar mağazası
- Kırtasiye
- Oyuncak mağazası
- Çiçekçi
- Küçük market

## 2. Satış modeli

```text
gross_revenue = daily_customers × average_basket × open_days
returned_gross_revenue = gross_revenue × return_rate
recognized_gross_revenue = gross_revenue − returned_gross_revenue
```

KDV, tanınan satış üzerinden ayrılır. Fiyat üstü KDV müşteri ödemesine eklenir ancak işletme gelirini artırmaz.

## 3. Ürün adedi ve ürün maliyeti

```text
gross_units = gross_revenue / average_unit_sale_price
returned_units = gross_units × return_rate
retained_units = gross_units − returned_units
product_cost = retained_units × average_unit_cost
```

İadeli ürünlerin satılan ürün maliyeti geri kazanılmış kabul edilir. Hasarlı, kayıp veya kullanılamaz stok ayrı fire/kayıp oranıyla hesaplanır.

## 4. Fire/kayıp ve değişken giderler

```text
inventory_loss_cost = gross_units × average_unit_cost × inventory_loss_rate
bag_cost = customer_transactions × bag_cost_per_customer
other_variable_cost = adjusted_revenue × other_variable_cost_rate
```

Satılan ürün maliyeti, fire/kayıp, poşet/ambalaj ve diğer değişken giderler ayrı gösterilir.

## 5. POS komisyonu

```text
pos_commission = adjusted_revenue × card_sales_share × pos_commission_rate
```

Komisyon yalnız kartlı satış payına uygulanır.

## 6. İlk stok ve P&L ayrımı

İlk stok yatırımı kurulum sırasında nakitten bir kez düşer. Aylık satılan ürün maliyeti P&L’de ayrıca hesaplanır. İlk stok yatırım tutarı aylık gider olarak ikinci kez düşülmez.

## 7. Stok KPI’ları

```text
annual_stock_turnover = monthly_product_cost × 12 / initial_stock_investment
stock_coverage_months = initial_stock_investment / monthly_product_cost
```

Bu simülasyonda ilk stok yatırımı yaklaşık ortalama stok seviyesi olarak kullanılır. Gerçek muhasebe ve takip modunda dönem başı/dönem sonu ortalama stok kullanılmalıdır.

## 8. Başabaş

Günlük başabaş müşteri sayısı ikili aramayla bulunur. Günlük müşteri değişirken ortalama sepet, iade, ürün maliyeti, POS ve mağaza gider varsayımları sabit tutulur.

## 9. KPI’lar

- Ürün başı net kâr
- Aylık net kâr
- Yıllık stok devir hızı
- Stok kapsamı
- Ürün brüt marjı
- Kira/ciro oranı
- Günlük başabaş müşteri
- İlk stok nakit ihtiyacı
- 12 ay sonu nakit

## 10. Uyarılar

- Negatif kâr
- İlk 3 ay nakit açığı
- Yüksek kira/ciro
- Yüksek iade
- Yüksek fire/kayıp
- Düşük ürün brüt marjı
- Yavaş stok devir hızı
- Aşırı veya yetersiz ilk stok
- Mevcut müşterinin çok üzerinde başabaş hedefi

## 11. Muhasebe uyarısı

Bu araç ön fizibilite içindir. Stok değerleme yöntemi, KDV, iadeler, zayi/fire belgelendirmesi ve vergi uygulamaları mali müşavirle teyit edilmelidir.
