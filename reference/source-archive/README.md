# Master Kaynak Arşivi

Bu klasörde Steam Yayıncı Finansal Fizibilite & Net Kâr Hesaplayıcı v2 kaynak dosyasının gzip + base64 parçaları bulunur. Büyük beşinci parça, aktarım bütünlüğü için dört küçük alt parçaya ayrılmıştır.

Kaynak HTML’yi byte düzeyinde yeniden üretmek için:

```bash
node scripts/materialize-master-reference.mjs
```

Oluşan dosya:

```text
reference/01_oyun_yayincisi_master_model_v2.html
```

Orijinal HTML SHA-256:

```text
2eaf4cfb1667494f37c59d2c701f6a9898806e7ab4fadecd5c94d4709cf46424
```

`tests/master-source.test.mjs`, arşivin aynı HTML’yi ürettiğini her test çalışmasında doğrular.
