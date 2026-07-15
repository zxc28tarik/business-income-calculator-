# Oto Hizmetleri Sektör Spesifikasyonu

## 1. İş türleri

- Oto yıkama
- Oto kuaför
- Detaylı temizlik
- Lastikçi
- Cam filmi / kaplama
- Küçük servis

## 2. Araç ve kapasite modeli

```text
monthly_vehicles = daily_vehicles × open_days
daily_capacity = service_stations × working_hours × 60 / average_service_duration_minutes
capacity_utilization = monthly_vehicles / monthly_capacity
```

İstasyon; iş türüne göre yıkama alanı, lift, uygulama alanı veya eş zamanlı hizmet noktasıdır.

## 3. Gelir modeli

```text
service_revenue = monthly_vehicles × average_service_price
parts_revenue = monthly_vehicles × average_parts_revenue_per_vehicle
gross_revenue = service_revenue + parts_revenue
```

Parça/ürün geliri lastik, bakım parçası, cam filmi, kaplama veya yan ürün satışı olmayan işletmelerde sıfır bırakılabilir.

## 4. Vergi ve ödeme

- KDV; fiyata dahil, fiyat üstü veya yok biçiminde seçilir.
- POS komisyonu yalnız kartlı satış payına uygulanır.
- Tahsilat gecikmesi P&L sonucunu değiştirmez, nakit zamanlamasını değiştirir.

## 5. Değişken maliyetler

```text
consumables = monthly_vehicles × consumable_cost_per_vehicle
water_energy = monthly_vehicles × water_electricity_cost_per_vehicle
parts_cost = parts_revenue × parts_cost_rate
other_variable = adjusted_revenue × other_variable_cost_rate
```

Sarf ve araç başı su/elektrik maliyeti ayrı tutulur. Parça maliyet oranı yalnız parça/ürün gelirine uygulanır.

## 6. Sabit giderler

- Personel
- Kira
- Sabit faturalar
- Muhasebe
- Randevu/servis yazılımı
- Reklam
- Ekipman bakımı
- Sigorta
- Atık/çevre gideri
- Diğer sabit gider

## 7. Ekipman ve amortisman

```text
monthly_depreciation = equipment_investment / useful_life_months
```

- Ekipman yatırımı kurulum sırasında nakitten bir kez düşer.
- Amortisman P&L gideridir.
- Amortisman nakit akışından ikinci kez düşülmez.
- Ekipman geri dönüşü prototipte ekipman yatırımı / operasyonel nakit kâr yaklaşımıyla hesaplanır.

## 8. Başabaş

Günlük araç sayısı ikili aramayla artırılır ve net kârın negatif olmadığı ilk tam araç sayısı bulunur.

```text
breakeven_capacity = breakeven_daily_vehicles / daily_capacity
```

Başabaş kapasitesi %100'ü aşıyorsa mevcut fiyat ve maliyetlerle teorik kapasite içinde başabaş mümkün değildir.

## 9. KPI'lar

- Aylık net kâr
- Araç başı net kâr
- Günlük başabaş araç
- Kapasite kullanımı
- Ekipman geri dönüş süresi
- Araç başı katkı
- 12 ay sonu nakit
- Personel maliyet yükü
- Kira/gelir oranı

## 10. Uyarılar

- Negatif net kâr
- İlk üç ay nakit açığı
- Kapasite aşımı veya aşırı sıkışıklık
- Çok düşük kapasite kullanımı
- Yüksek personel maliyeti
- Yüksek kira/gelir oranı
- Yüksek sarf ve enerji maliyeti
- Düşük parça marjı
- Yüksek amortisman yükü
- Teorik kapasite içinde oluşmayan başabaş
- Düşük net kâr marjı

## 11. Muhasebe notu

Bu hesaplayıcı ön fizibilite içindir. Vergi, amortisman süresi, ekipman giderleştirmesi, çevre/atık yükümlülükleri ve ruhsat gereklilikleri mali müşavir ve ilgili uzmanlarla teyit edilmelidir.
