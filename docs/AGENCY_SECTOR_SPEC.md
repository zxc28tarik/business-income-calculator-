# Ajans / Freelancer / Danışmanlık Sektör Spesifikasyonu

## İş türleri

1. Yazılım ajansı
2. Sosyal medya ajansı
3. Reklam ajansı
4. Tasarım ajansı
5. Danışmanlık şirketi
6. Freelancer yazılımcı
7. Freelancer tasarımcı
8. Video / editing hizmeti
9. SEO ajansı
10. Performans reklam ajansı

## Gelir formülü

```text
gross_revenue = monthly_project_count × average_project_fee
```

KDV ayrımı ve platform/ödeme komisyonları ortak finans motoru tarafından uygulanır.

## Kapasite formülleri

```text
base_project_hours = monthly_project_count × average_project_hours
revision_hours = monthly_project_count × revision_hours_per_project
total_delivery_hours = base_project_hours + revision_hours

theoretical_capacity_hours = team_size × monthly_hours_per_person
target_billable_capacity_hours = theoretical_capacity_hours × target_utilization_rate
capacity_utilization = total_delivery_hours / theoretical_capacity_hours
```

## Değişken maliyet

```text
base_team_cost = base_project_hours × hourly_cost
revision_cost = revision_hours × hourly_cost
other_variable_cost = net_project_revenue × other_variable_cost_rate

total_variable_cost =
  base_team_cost
  + revision_cost
  + freelancer_payments
  + other_variable_cost
```

Saatlik maliyet, üretim ekibinin maaş/yan hak/işveren maliyetinin üretim saatine dağıtılmış karşılığı olarak yorumlanır. İdari ve satış personeli sabit giderlerde tutulur.

## KPI’lar

- Proje başı net kâr
- Saatlik net kâr
- Kişi başı ciro
- Kapasite kullanımı
- Aylık net kâr
- Tahsilat gecikmesi etkisi
- Başabaş proje sayısı
- Başabaş kapasite kullanımı
- Revizyon maliyeti

## Tahsilat

Tahsilat vadesi net kârı değiştirmez. Nakit akışında tahsil edilen tutarı geciktirir. Motor prototipte 30 gün ve üzerini bir aylık tam kaydırma olarak modeller.

## Uyarı eşikleri

- Tahsilat vadesi > 45 gün: sert uyarı
- Tahsilat vadesi > 20 gün: yumuşak uyarı
- Kapasite kullanımı > %100: sert uyarı
- Kapasite kullanımı < %35: düşük kullanım uyarısı
- Revizyon maliyeti / net proje geliri > %15: sert uyarı
- Revizyon maliyeti / net proje geliri > %8: yumuşak uyarı
- En büyük müşteri ciro payı > %50: sert yoğunlaşma uyarısı
- En büyük müşteri ciro payı > %30: yumuşak yoğunlaşma uyarısı
- Saatlik ekip maliyeti / gerçekleşen saatlik satış > %80: sert uyarı
- Saatlik ekip maliyeti / gerçekleşen saatlik satış > %60: yumuşak uyarı

## Kabul şartları

- Proje bedeli × proje sayısı geliri doğru verir.
- Baz proje ve revizyon saatleri ayrı maliyetlenir.
- Freelancer/taşeron ödemesi değişken maliyete eklenir.
- Kapasite kullanımı toplam teslimat saatinden hesaplanır.
- Tahsilat gecikmesi P&L’yi değiştirmez, ilk ay nakdini düşürür.
- Revizyon saati arttığında net kâr düşer.
- Başabaş proje sayısı bulunur.
- Müşteri yoğunlaşması ve tahsilat riski uyarı üretir.
