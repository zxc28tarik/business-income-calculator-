const clone = (value) => structuredClone(value);
const rate = (value) => Math.min(1, Math.max(0, Number(value) || 0));
const nonNegative = (value) => Math.max(0, Number(value) || 0);

const channel = (name, orderShareRate, ticketMultiplier, commissionRate, packagingCostPerOrder, isDelivery = false) => ({
  name, orderShareRate, ticketMultiplier, commissionRate, packagingCostPerOrder, isDelivery,
});
const product = (name, revenueShareRate, materialCostRate, wasteRate) => ({
  name, revenueShareRate, materialCostRate, wasteRate,
});

export const CAFE_PROFILE_INPUT_DEFAULTS = {
  seats: 60,
  tableTurnsPerDay: 2.2,
  occupancyRate: 0.70,
  ordersPerHour: 18,
  serviceHoursPerDay: 12,
  maxOrdersPerHour: 28,
  dailyDeliveryOrders: 150,
  dailyKitchenCapacity: 220,
  serviceEventsPerMonth: 22,
  customersPerEvent: 120,
  maxCustomersPerEvent: 180,
  advancedChannelMixEnabled: false,
  salesChannels: [
    channel("Salon", 0.60, 1, 0, 0, false),
    channel("Gel-al", 0.15, 0.95, 0, 4, false),
    channel("Paket servis", 0.25, 1.05, 0.30, 8, true),
  ],
  advancedProductMixEnabled: false,
  productMix: [
    product("İçecek", 0.45, 0.20, 0.03),
    product("Yemek", 0.40, 0.36, 0.05),
    product("Tatlı / atıştırmalık", 0.15, 0.30, 0.07),
  ],
  depreciationEnabled: false,
  depreciationYears: 5,
};

export const CAFE_BUSINESS_PROFILES = {
  cafe: { label: "Kafe", driver: "daily_customers", defaults: {} },
  restaurant: {
    label: "Restoran", driver: "seat_turnover",
    defaults: {
      averageTicket: 450, openDays: 30, seats: 60, tableTurnsPerDay: 2.2, occupancyRate: 0.70,
      materialCostRate: 0.34, wasteRate: 0.06, deliverySalesShare: 0.15, serviceCapacity: 132,
      rent: 180000, staffCost: 420000, utilities: 70000,
      equipment: 1200000, furniture: 450000, renovation: 800000,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Salon", 0.72, 1.05, 0, 0, false),
        channel("Gel-al", 0.10, 0.95, 0, 5, false),
        channel("Paket servis", 0.18, 1, 0.30, 10, true),
      ],
      advancedProductMixEnabled: true,
      productMix: [
        product("Ana yemek", 0.58, 0.38, 0.05),
        product("İçecek", 0.22, 0.18, 0.03),
        product("Başlangıç / tatlı", 0.20, 0.30, 0.08),
      ],
      depreciationEnabled: true,
    },
  },
  coffee_shop: {
    label: "Kahveci", driver: "daily_customers",
    defaults: {
      dailyCustomers: 190, averageTicket: 165, serviceCapacity: 280, deliverySalesShare: 0.08,
      materialCostRate: 0.22, wasteRate: 0.04, staffCost: 230000, rent: 110000,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Oturma", 0.52, 1.08, 0, 0, false),
        channel("Gel-al", 0.40, 0.92, 0, 3, false),
        channel("Paket servis", 0.08, 1, 0.28, 6, true),
      ],
      advancedProductMixEnabled: true,
      productMix: [
        product("Kahve", 0.62, 0.18, 0.03),
        product("Soğuk içecek", 0.18, 0.24, 0.04),
        product("Yiyecek / tatlı", 0.20, 0.34, 0.07),
      ],
      depreciationEnabled: true,
    },
  },
  coffee_kiosk: {
    label: "Kahve kiosk", driver: "hourly_orders",
    defaults: {
      averageTicket: 125, openDays: 30, ordersPerHour: 18, serviceHoursPerDay: 12, maxOrdersPerHour: 28,
      deliverySalesShare: 0, cardSalesShare: 0.95, rent: 50000, staffCost: 120000, utilities: 18000,
      equipment: 500000, furniture: 80000, renovation: 150000,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Kiosk / gel-al", 1, 1, 0, 3, false)],
      advancedProductMixEnabled: true,
      productMix: [
        product("Kahve", 0.72, 0.18, 0.03),
        product("Soğuk içecek", 0.18, 0.24, 0.04),
        product("Hazır yiyecek", 0.10, 0.38, 0.05),
      ],
      depreciationEnabled: true,
    },
  },
  pastry_shop: {
    label: "Tatlıcı / pastane", driver: "daily_customers",
    defaults: {
      dailyCustomers: 145, averageTicket: 230, serviceCapacity: 220, materialCostRate: 0.31, wasteRate: 0.09,
      deliverySalesShare: 0.22, packagingCostPerDeliveryOrder: 10, utilities: 60000,
      advancedProductMixEnabled: true,
      productMix: [
        product("Yaş pasta / tatlı", 0.48, 0.36, 0.10),
        product("Unlu mamul", 0.32, 0.28, 0.08),
        product("İçecek", 0.20, 0.18, 0.03),
      ],
      depreciationEnabled: true,
    },
  },
  burger_shop: {
    label: "Burgerci", driver: "daily_customers",
    defaults: {
      dailyCustomers: 165, averageTicket: 285, serviceCapacity: 240, materialCostRate: 0.36, wasteRate: 0.05,
      deliverySalesShare: 0.46, packagingCostPerDeliveryOrder: 12, staffCost: 300000,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Salon", 0.34, 1, 0, 0, false),
        channel("Gel-al", 0.20, 0.96, 0, 8, false),
        channel("Paket servis", 0.46, 1.04, 0.30, 12, true),
      ],
      advancedProductMixEnabled: true,
      productMix: [
        product("Burger", 0.58, 0.39, 0.04),
        product("Yan ürün", 0.22, 0.30, 0.06),
        product("İçecek", 0.20, 0.17, 0.03),
      ],
      depreciationEnabled: true,
    },
  },
  doner_shop: {
    label: "Dönerci", driver: "daily_customers",
    defaults: {
      dailyCustomers: 230, averageTicket: 205, serviceCapacity: 340, materialCostRate: 0.39, wasteRate: 0.04,
      deliverySalesShare: 0.30, packagingCostPerDeliveryOrder: 9, staffCost: 280000,
      advancedProductMixEnabled: true,
      productMix: [
        product("Döner", 0.66, 0.42, 0.03),
        product("Yan ürün", 0.18, 0.30, 0.05),
        product("İçecek", 0.16, 0.16, 0.02),
      ],
      depreciationEnabled: true,
    },
  },
  buffet: {
    label: "Tostçu / büfe", driver: "daily_customers",
    defaults: {
      dailyCustomers: 260, averageTicket: 130, serviceCapacity: 420, materialCostRate: 0.31, wasteRate: 0.04,
      deliverySalesShare: 0.12, rent: 70000, staffCost: 170000, equipment: 350000,
      advancedProductMixEnabled: true,
      productMix: [
        product("Tost / sandviç", 0.52, 0.34, 0.04),
        product("Atıştırmalık", 0.18, 0.30, 0.04),
        product("İçecek", 0.30, 0.18, 0.02),
      ],
      depreciationEnabled: true,
    },
  },
  dark_kitchen: {
    label: "Dark kitchen", driver: "delivery_orders",
    defaults: {
      averageTicket: 295, openDays: 30, dailyDeliveryOrders: 155, dailyKitchenCapacity: 230,
      deliverySalesShare: 1, cardSalesShare: 1, materialCostRate: 0.35, wasteRate: 0.04,
      rent: 65000, staffCost: 220000, utilities: 45000, furniture: 30000,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Paket servis", 1, 1, 0.30, 12, true)],
      advancedProductMixEnabled: true,
      productMix: [
        product("Ana ürün", 0.68, 0.38, 0.04),
        product("Yan ürün", 0.20, 0.29, 0.05),
        product("İçecek", 0.12, 0.18, 0.02),
      ],
      depreciationEnabled: true,
    },
  },
  food_truck: {
    label: "Food truck", driver: "event_customers",
    defaults: {
      averageTicket: 190, serviceEventsPerMonth: 22, customersPerEvent: 125, maxCustomersPerEvent: 190,
      openDays: 22, deliverySalesShare: 0, rent: 15000, staffCost: 130000, utilities: 18000,
      equipment: 1100000, furniture: 40000, renovation: 120000, licenseFees: 90000,
      advancedChannelMixEnabled: true,
      salesChannels: [channel("Araçtan satış", 1, 1, 0, 5, false)],
      advancedProductMixEnabled: true,
      productMix: [
        product("Ana ürün", 0.62, 0.37, 0.04),
        product("Yan ürün", 0.22, 0.30, 0.05),
        product("İçecek", 0.16, 0.18, 0.02),
      ],
      depreciationEnabled: true,
    },
  },
  franchise_restaurant: {
    label: "Franchise restoran", driver: "seat_turnover",
    defaults: {
      averageTicket: 420, openDays: 30, seats: 70, tableTurnsPerDay: 2.4, occupancyRate: 0.72,
      materialCostRate: 0.34, wasteRate: 0.05, deliverySalesShare: 0.25,
      franchiseRoyaltyRate: 0.06, franchiseRoyaltyBasis: "net_revenue_after_commission",
      rent: 220000, staffCost: 480000, utilities: 85000,
      renovation: 1400000, equipment: 1600000, furniture: 650000, licenseFees: 150000,
      advancedChannelMixEnabled: true,
      salesChannels: [
        channel("Salon", 0.62, 1.04, 0, 0, false),
        channel("Gel-al", 0.13, 0.96, 0, 6, false),
        channel("Paket servis", 0.25, 1, 0.30, 11, true),
      ],
      advancedProductMixEnabled: true,
      productMix: [
        product("Ana ürün", 0.60, 0.37, 0.04),
        product("Yan ürün", 0.22, 0.29, 0.05),
        product("İçecek / tatlı", 0.18, 0.20, 0.04),
      ],
      depreciationEnabled: true,
    },
  },
};

export function getCafeBusinessProfile(businessType) {
  return CAFE_BUSINESS_PROFILES[businessType] ?? CAFE_BUSINESS_PROFILES.cafe;
}

export function deriveCafeDemand(input) {
  const profile = getCafeBusinessProfile(input.businessType);
  let dailyCustomers = nonNegative(input.dailyCustomers);
  let openDays = Math.max(1, nonNegative(input.openDays));
  let serviceCapacity = nonNegative(input.serviceCapacity);
  let driverValue = dailyCustomers;
  let driverLabel = "Günlük müşteri";

  if (profile.driver === "seat_turnover") {
    serviceCapacity = nonNegative(input.seats) * nonNegative(input.tableTurnsPerDay);
    dailyCustomers = serviceCapacity * rate(input.occupancyRate);
    driverValue = rate(input.occupancyRate);
    driverLabel = "Doluluk";
  } else if (profile.driver === "hourly_orders") {
    dailyCustomers = nonNegative(input.ordersPerHour) * nonNegative(input.serviceHoursPerDay);
    serviceCapacity = nonNegative(input.maxOrdersPerHour) * nonNegative(input.serviceHoursPerDay);
    driverValue = nonNegative(input.ordersPerHour);
    driverLabel = "Saatlik sipariş";
  } else if (profile.driver === "delivery_orders") {
    dailyCustomers = nonNegative(input.dailyDeliveryOrders);
    serviceCapacity = nonNegative(input.dailyKitchenCapacity);
    driverValue = dailyCustomers;
    driverLabel = "Günlük paket siparişi";
  } else if (profile.driver === "event_customers") {
    openDays = Math.max(1, nonNegative(input.serviceEventsPerMonth));
    dailyCustomers = nonNegative(input.customersPerEvent);
    serviceCapacity = nonNegative(input.maxCustomersPerEvent);
    driverValue = dailyCustomers;
    driverLabel = "Etkinlik başı müşteri";
  }

  const monthlyCustomers = dailyCustomers * openDays;
  const capacityUtilization = serviceCapacity > 0 ? dailyCustomers / serviceCapacity : 0;
  return {
    profile,
    input: { ...input, dailyCustomers, openDays, serviceCapacity },
    metrics: { dailyCustomers, monthlyCustomers, serviceCapacity, capacityUtilization, driverValue, driverLabel },
  };
}

export function applyCafeProfileDemandScenario(input, scenarioId) {
  const factor = scenarioId === "pessimistic" ? 0.72 : scenarioId === "optimistic" ? 1.28 : 1;
  const next = clone(input);
  const profile = getCafeBusinessProfile(next.businessType);
  if (profile.driver === "seat_turnover") next.occupancyRate = rate(next.occupancyRate * factor);
  else if (profile.driver === "hourly_orders") next.ordersPerHour = nonNegative(next.ordersPerHour * factor);
  else if (profile.driver === "delivery_orders") next.dailyDeliveryOrders = nonNegative(next.dailyDeliveryOrders * factor);
  else if (profile.driver === "event_customers") next.customersPerEvent = nonNegative(next.customersPerEvent * factor);
  else next.dailyCustomers = nonNegative(next.dailyCustomers * factor);
  return next;
}

export function buildCafeProfileWarnings(result) {
  const { input, capacityUtilization } = result;
  const warnings = [];
  const add = (id, severity, message) => warnings.push({ id, severity, message });

  if (capacityUtilization > 1) add("profile_capacity_over", "hard", "Talep, iş türü için tanımlanan servis kapasitesini aşıyor.");
  else if (capacityUtilization > 0.90) add("profile_capacity_tight", "soft", "Kapasite kullanımı %90'ın üzerinde; yoğun saatlerde satış kaybı oluşabilir.");
  if (["restaurant", "franchise_restaurant"].includes(input.businessType) && input.occupancyRate < 0.35) {
    add("restaurant_low_occupancy", "soft", "Restoran doluluğu düşük; koltuk ve personel kapasitesi verimsiz kalabilir.");
  }
  if (input.businessType === "coffee_kiosk" && input.ordersPerHour > input.maxOrdersPerHour) {
    add("kiosk_hourly_capacity", "hard", "Saatlik sipariş, kiosk saatlik üretim kapasitesini aşıyor.");
  }
  if (input.businessType === "dark_kitchen" && result.commissionLoad > 0.25) {
    add("dark_kitchen_commission", "soft", "Dark kitchen modelinde platform komisyon yükü satışın dörtte birini aşıyor.");
  }
  if (input.businessType === "food_truck" && input.serviceEventsPerMonth < 12) {
    add("food_truck_events", "soft", "Aylık servis/etkinlik sayısı düşük; sabit giderlerin karşılanması zorlaşabilir.");
  }
  if (input.businessType === "franchise_restaurant" && input.franchiseRoyaltyRate <= 0) {
    add("franchise_royalty_missing", "hard", "Franchise restoran seçildi ancak franchise/lisans payı sıfır.");
  }
  return warnings;
}

export function buildCafeProfileKpis(result) {
  const profile = getCafeBusinessProfile(result.input.businessType);
  const kpis = [
    { id: "profile_driver", label: result.profileMetrics.driverLabel, value: result.profileMetrics.driverValue, format: profile.driver === "seat_turnover" ? "percent" : "number" },
    { id: "capacity_utilization", label: "Kapasite kullanımı", value: result.capacityUtilization, format: "percent", negative: result.capacityUtilization > 1 },
  ];
  if (result.input.businessType === "food_truck") {
    kpis.push({ id: "service_events", label: "Aylık servis / etkinlik", value: result.input.serviceEventsPerMonth, format: "number" });
  } else if (result.input.businessType === "dark_kitchen") {
    kpis.push({ id: "delivery_orders", label: "Aylık paket siparişi", value: result.deliveryOrders, format: "number" });
  } else if (result.input.businessType === "franchise_restaurant") {
    kpis.push({ id: "royalty_rate", label: "Franchise payı", value: result.input.franchiseRoyaltyRate, format: "percent" });
  }
  return kpis;
}
