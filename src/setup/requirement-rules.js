import { SETUP_COST_TYPES, SETUP_ITEM_STATUSES } from "./setup-model.js";
import { REQUIREMENT_LEVELS, REQUIREMENT_USER_STATUSES } from "./requirement-engine.js";

export const COMMON_SETUP_REQUIREMENT_RULES = Object.freeze([
  {
    id: "legal-structure-decision",
    title: "Hukuki yapı seçimini netleştir",
    description: "Şirket veya işletme yapısı kuruluş, vergi ve uyum maliyetlerini etkileyebilir.",
    condition: { key: "legalStructure", equals: "undecided" },
    level: REQUIREMENT_LEVELS.VERIFY,
    defaultUserStatus: REQUIREMENT_USER_STATUSES.VERIFYING,
    verificationOwner: "mali_musavir",
    priority: 10,
  },
  {
    id: "physical-premises-package",
    title: "Fiziksel işyeri açılış paketini doğrula",
    description: "Depozito, yer hazırlığı ve yerel işyeri kontrolleri ayrı mali sınıflarda ele alınmalıdır.",
    condition: { key: "hasPhysicalPremises", truthy: true },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    defaultUserStatus: REQUIREMENT_USER_STATUSES.PENDING,
    verificationOwner: "belediye_ve_kullanici",
    priority: 20,
    suggestedItems: [
      { key: "deposit", label: "Kira depozitosu ve teminat", costType: SETUP_COST_TYPES.DEPOSIT, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "fit-out", label: "Tadilat ve yer hazırlığı", costType: SETUP_COST_TYPES.FIT_OUT, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "workplace-checks", label: "Ruhsat ve yerel uygunluk işlemleri", costType: SETUP_COST_TYPES.SETUP_EXPENSE, status: SETUP_ITEM_STATUSES.VERIFY },
    ],
  },
  {
    id: "employee-onboarding-package",
    title: "Çalışan ve işveren yüklerini dahil et",
    description: "Brüt ücret dışında işe alım, ekipman, eğitim ve işveren yükleri doğrulanmalıdır.",
    condition: { any: [{ key: "hasEmployees", truthy: true }, { key: "employeeCount", gte: 1 }] },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    defaultUserStatus: REQUIREMENT_USER_STATUSES.VERIFYING,
    verificationOwner: "mali_musavir",
    priority: 30,
    suggestedItems: [
      { key: "onboarding", label: "İşe alım, eğitim ve çalışan ekipmanı", costType: SETUP_COST_TYPES.SETUP_EXPENSE, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "employer-compliance", label: "İşveren uyum ve iş güvenliği giderleri", costType: SETUP_COST_TYPES.RECURRING_COMPLIANCE, status: SETUP_ITEM_STATUSES.VERIFY },
    ],
  },
  {
    id: "card-payment-package",
    title: "Kartlı ödeme altyapısını dahil et",
    condition: { key: "acceptsCardPayments", truthy: true },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    suggestedItems: [
      { key: "pos-device", label: "POS ve ödeme altyapısı kurulumu", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
  {
    id: "marketplace-package",
    title: "Pazaryeri açılış giderlerini dahil et",
    condition: { key: "usesMarketplace", truthy: true },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    suggestedItems: [
      { key: "marketplace-integration", label: "Pazaryeri entegrasyonu ve ilk kurulum", costType: SETUP_COST_TYPES.SETUP_EXPENSE, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
]);

export const CAFE_RESTAURANT_SETUP_RULES = Object.freeze([
  {
    id: "cafe-seating-package",
    title: "Müşteri oturma alanını maliyet ve kapasiteye bağla",
    sectorScope: ["cafe_restaurant"],
    condition: { key: "hasPhysicalPremises", truthy: true },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    priority: 40,
    suggestedItems: [
      { key: "tables", label: "Masa ve servis yüzeyleri", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "chairs", label: "Sandalye, bank ve oturma ekipmanı", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
  {
    id: "cafe-food-operation-checks",
    title: "Gıda faaliyeti ve teknik işyeri koşullarını doğrula",
    description: "Gıda, havalandırma, yangın, hijyen ve atık koşulları yer ve faaliyet türüne göre doğrulanmalıdır.",
    sectorScope: ["cafe_restaurant"],
    condition: { key: "handlesFood", truthy: true },
    level: REQUIREMENT_LEVELS.VERIFY,
    defaultUserStatus: REQUIREMENT_USER_STATUSES.VERIFYING,
    verificationOwner: "belediye_ve_yetkili_kurum",
    priority: 15,
    suggestedItems: [
      { key: "food-registration", label: "Gıda faaliyeti kayıt ve uygunluk işlemleri", costType: SETUP_COST_TYPES.SETUP_EXPENSE, status: SETUP_ITEM_STATUSES.VERIFY },
      { key: "ventilation", label: "Havalandırma ve teknik altyapı", costType: SETUP_COST_TYPES.FIT_OUT, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "safety-hygiene", label: "Yangın, güvenlik ve hijyen ekipmanı", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
  {
    id: "cafe-kitchen-package",
    title: "Mutfak ve üretim ekipmanlarını dahil et",
    sectorScope: ["cafe_restaurant"],
    condition: { all: [{ key: "hasPhysicalPremises", truthy: true }, { key: "handlesFood", truthy: true }] },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    priority: 50,
    suggestedItems: [
      { key: "cooking", label: "Pişirme ve hazırlık ekipmanları", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "refrigeration", label: "Soğutma ve saklama ekipmanları", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "washing", label: "Yıkama ve temizlik ekipmanları", costType: SETUP_COST_TYPES.CAPEX, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "serviceware", label: "Tabak, bardak ve servis ekipmanı", costType: SETUP_COST_TYPES.CONSUMABLES, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
  {
    id: "cafe-opening-inventory",
    title: "İlk gıda, içecek ve sarf stoğunu dahil et",
    sectorScope: ["cafe_restaurant"],
    condition: { key: "handlesFood", truthy: true },
    level: REQUIREMENT_LEVELS.CONDITIONAL,
    priority: 60,
    suggestedItems: [
      { key: "food-stock", label: "İlk gıda ve içecek stoğu", costType: SETUP_COST_TYPES.OPENING_INVENTORY, status: SETUP_ITEM_STATUSES.QUOTE },
      { key: "cleaning-stock", label: "İlk temizlik ve hijyen sarfı", costType: SETUP_COST_TYPES.CONSUMABLES, status: SETUP_ITEM_STATUSES.QUOTE },
    ],
  },
]);

export const SETUP_REQUIREMENT_RULES = Object.freeze([
  ...COMMON_SETUP_REQUIREMENT_RULES,
  ...CAFE_RESTAURANT_SETUP_RULES,
]);
