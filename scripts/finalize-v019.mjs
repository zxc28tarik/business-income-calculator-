import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STANDALONE_SECTORS } from "./build-standalone.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(ROOT, relative), "utf8");
const write = (relative, content) => writeFile(path.join(ROOT, relative), content, "utf8");

async function ensureGeneratedFiles() {
  for (const sector of STANDALONE_SECTORS) {
    await access(path.join(ROOT, "standalone", sector.file));
  }
}

async function updateVersionMarkers() {
  const index = (await read("index.html")).replace("BUSINESS INCOME CALCULATOR · v0.18.0", "BUSINESS INCOME CALCULATOR · v0.19.0");
  await write("index.html", index);
  const smoke = (await read("tests/app-smoke.test.mjs")).replace(/v0\\\.18\\\.0/g, "v0\\.19\\.0");
  await write("tests/app-smoke.test.mjs", smoke);
}

async function updateReadme() {
  let readme = await read("README.md");
  if (!readme.includes("## v0.19.0 — Bağımsız tek HTML çıktıları")) {
    const block = `## v0.19.0 — Bağımsız tek HTML çıktıları\n\nAşama 6 tamamlandı. Sekiz sektörün her biri ana platformdan bağımsız açılabilen tek HTML dosyası olarak üretilebilir.\n\n- CSS, ortak UI ve sektör motoru dosyanın içine gömülür.\n- Harici CDN, JavaScript veya stil dosyası kullanılmaz.\n- Senaryo, tablo, CSV, yazdırma, KPI, uyarı ve 12 aylık nakit görünümü korunur.\n- Çıktılar aynı sektör motorlarını kullanır; ayrı formül kopyası içermez.\n- Üretim komutu: \`npm run build:standalone\`\n- Dosyalar \`standalone/\` altında oluşur ve CI tarafından \`standalone-html\` artefaktı olarak yayımlanır.\n\nAyrıntılar: \`docs/STANDALONE_HTML_OUTPUTS.md\`.\n\n`;
    readme = readme.replace("Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.\n\n", `Sektör bazlı finansal fizibilite ve 12 aylık nakit akışı platformu.\n\n${block}`);
  }
  readme = readme.replace("Güncel paket: **199/199 test**", "Güncel paket: **201/201 test**");
  readme = readme.replace(/## Sıradaki aşama[\s\S]*?## İlkeler/, "## Sıradaki aşama\n\nAşama 7 — Rapor katmanı: sektör sonuçlarını yönetici özeti, risk/varsayım tablosu ve paylaşılabilir çıktı yapısına dönüştürmek. Sonrasında gerçek takip modu ele alınacaktır.\n\n## İlkeler");
  await write("README.md", readme);
}

async function writeStandaloneDocs() {
  await mkdir(path.join(ROOT, "standalone"), { recursive: true });
  const list = STANDALONE_SECTORS.map((sector) => `- \`${sector.file}\` — ${sector.name}`).join("\n");
  await write("standalone/README.md", `# Bağımsız HTML Hesaplayıcılar\n\nBu klasördeki HTML dosyaları \`npm run build:standalone\` komutuyla üretilir. Her dosya çevrimdışı açılabilir; gerekli CSS, UI ve sektör modüllerini kendi içinde taşır.\n\n${list}\n\nKaynak motorlar değiştirilmez veya kopyalanmaz. Üretici her dosyaya yalnız ilgili sektörün eriştiği modülleri gömer.\n`);
  await write("docs/STANDALONE_HTML_OUTPUTS.md", `# Aşama 6 — Bağımsız Tek HTML Çıktıları\n\n## Amaç\n\nSekiz sektör hesaplayıcısını ana platformdan bağımsız, çevrimdışı açılabilen tek HTML dosyaları olarak üretmek.\n\n## Üretim\n\n\`npm run build:standalone\` komutu \`scripts/build-standalone.mjs\` üreticisini çalıştırır. Üretici seçilen sektörün modül grafiğini takip eder, ortak CSS ve UI katmanını gömer ve Blob tabanlı yerel ES modülleriyle dosyayı başlatır.\n\n## Çıktılar\n\n${list}\n\n## Garanti edilen özellikler\n\n- harici script veya stil bağlantısı yoktur\n- her modül dosyaya yalnız bir kez gömülür\n- aynı sektör normalizasyonu, hesap motoru ve sunum katmanı kullanılır\n- senaryo, koşullu form, tablo satırı ekleme/silme, CSV, yazdırma ve yerel kayıt çalışır\n- çıktı üretimi deterministiktir\n- her dosya 2 MB altında tutulur\n\n## CI\n\nGitHub Actions testlerden sonra sekiz dosyayı yeniden üretir ve \`standalone-html\` artefaktı olarak yükler. Kabul testleri dosya sayısını, çevrimdışı bağımsızlığı, boyut sınırını ve deterministik üretimi doğrular.\n`);
}

async function appendDocumentation() {
  const additions = [
    ["docs/SOURCE_ALIGNMENT_AUDIT.md", "## Aşama 6 — Bağımsız tek HTML çıktıları", `\n\n## Aşama 6 — Bağımsız tek HTML çıktıları\n\nSekiz v2 sektör motoru, formül kopyalanmadan tek HTML çıktısına paketlendi. Üretici modül grafiğini izler; ortak CSS, UI ve yalnız ilgili sektör bağımlılıklarını dosyaya gömer. CI sekiz dosyayı üretir, boyut ve bağımsızlık testlerini çalıştırır ve \`standalone-html\` artefaktını yayımlar.\n`],
    ["docs/ARCHITECTURE.md", "## Bağımsız HTML paketleme katmanı", `\n\n## Bağımsız HTML paketleme katmanı\n\n- \`src/standalone-runtime.js\`: tek sektör durumu, form olayları, sonuç renderı, CSV ve yerel kayıt\n- \`scripts/build-standalone.mjs\`: bağımlılık grafiği, CSS gömme ve çevrimdışı Blob modül paketi\n- \`tests/standalone-build.test.mjs\`: sekiz çıktı, harici kaynak yasağı, boyut ve deterministik üretim\n\nBu katman finans formülü içermez; doğrudan mevcut sektör sözleşmesini paketler.\n`],
    ["docs/FINANCE_ENGINE_V2.md", "## Tek HTML çıktılarında motor bütünlüğü", `\n\n## Tek HTML çıktılarında motor bütünlüğü\n\nBağımsız HTML dosyaları yeni finans formülü tanımlamaz. Seçilen sektörün normalizasyon, senaryo, hesaplama ve sunum modülleri kaynak haliyle dosyaya gömülür. Bu nedenle ana platform ve bağımsız çıktı aynı girdide aynı finans sonucunu üretir.\n`],
  ];
  for (const [file, marker, addition] of additions) {
    let content = await read(file);
    if (!content.includes(marker)) content += addition;
    await write(file, content);
  }
}

await ensureGeneratedFiles();
await updateVersionMarkers();
await updateReadme();
await writeStandaloneDocs();
await appendDocumentation();
console.log("v0.19 standalone çıktıları ve belgeleri hazırlandı.");
