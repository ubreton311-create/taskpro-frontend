// src/utils/pricingEngine.ts
export const PRICING_RULES = {
  cleaning: {
    baseUSA: 150, baseMX: 800,
    perRoomUSA: 25, perRoomMX: 150,
    perBathroomUSA: 20, perBathroomMX: 100,
    extrasUSA: { fridge: 35, oven: 30, windows: 50, stairs: 40, deepKitchen: 45 },
    extrasMX: { fridge: 200, oven: 150, windows: 300, stairs: 250, deepKitchen: 300 }
  },
  painting: {
    baseUSA: 200, baseMX: 1200,
    perSqFtUSA: 1.5, perSqFtMX: 50
  },
  plumbing: {
    baseUSA: 80, baseMX: 400, // Tarifa base de visita
    extrasUSA: { faucet: 150, leak: 200, toilet: 180 },
    extrasMX: { faucet: 500, leak: 700, toilet: 600 }
  },
  handyman: { // Herrería y Carpintería
    baseUSA: 100, baseMX: 500,
    perHourUSA: 60, perHourMX: 250,
    extrasUSA: { weldDoor: 300, buildFurniture: 150, repairFurniture: 100 },
    extrasMX: { weldDoor: 1200, buildFurniture: 600, repairFurniture: 400 }
  },
  hvac: { // Aire Acondicionado
    baseUSA: 100, baseMX: 600,
    extrasUSA: { miniSplitClean: 80, ductClean: 250 },
    extrasMX: { miniSplitClean: 500, ductClean: 1500 }
  }
};

type PriceRule = {
  baseUSA: number;
  baseMX: number;
  perRoomUSA?: number;
  perRoomMX?: number;
  perBathroomUSA?: number;
  perBathroomMX?: number;
  perSqFtUSA?: number;
  perSqFtMX?: number;
  perHourUSA?: number;
  perHourMX?: number;
  extrasUSA?: Record<string, number>;
  extrasMX?: Record<string, number>;
};

/** Answers collected by the quote form; every key is optional. */
type PricingDetails = Record<string, number | string | boolean | undefined>;

export function calculateEstimate(
  serviceType: string,
  details: PricingDetails,
  country: 'USA' | 'MX' = 'USA',
): number {
  const rules: PriceRule | undefined = PRICING_RULES[serviceType as keyof typeof PRICING_RULES];
  if (!rules) return 0;

  const isUSA = country === 'USA';
  const pick = (usa?: number, mx?: number): number => (isUSA ? usa : mx) ?? 0;
  const extra = (key: string): number =>
    (isUSA ? rules.extrasUSA?.[key] : rules.extrasMX?.[key]) ?? 0;
  const has = (key: string): boolean => Boolean(details[key]);

  let total = isUSA ? rules.baseUSA : rules.baseMX;

  if (serviceType === 'cleaning') {
    total += (Number(details.rooms) || 0) * pick(rules.perRoomUSA, rules.perRoomMX);
    total += (Number(details.bathrooms) || 0) * pick(rules.perBathroomUSA, rules.perBathroomMX);
    for (const key of ['fridge', 'oven', 'windows', 'stairs', 'deepKitchen']) {
      if (has(key)) total += extra(key);
    }
  } else if (serviceType === 'painting') {
    total += (Number(details.squareFeet) || 0) * pick(rules.perSqFtUSA, rules.perSqFtMX);
  } else if (serviceType === 'plumbing') {
    for (const key of ['faucet', 'leak', 'toilet']) {
      if (has(key)) total += extra(key);
    }
  } else if (serviceType === 'handyman') {
    const hours = Number(details.hours) || 1;
    total += hours * pick(rules.perHourUSA, rules.perHourMX);
    for (const key of ['weldDoor', 'buildFurniture', 'repairFurniture']) {
      if (has(key)) total += extra(key);
    }
  } else if (serviceType === 'hvac') {
    for (const key of ['miniSplitClean', 'ductClean']) {
      if (has(key)) total += extra(key);
    }
  }

  return total;
}
