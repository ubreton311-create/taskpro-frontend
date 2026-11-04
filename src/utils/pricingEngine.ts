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

export function calculateEstimate(serviceType: string, details: any, country: 'USA' | 'MX' = 'USA') {
  let total = 0;
  const isUSA = country === 'USA';
  const rules: any = PRICING_RULES[serviceType as keyof typeof PRICING_RULES];

  if (!rules) return 0;

  // Sumar base
  total += isUSA ? rules.baseUSA : rules.baseMX;

  // Lógica específica por servicio
  if (serviceType === 'cleaning') {
    total += (Number(details.rooms) || 0) * (isUSA ? rules.perRoomUSA : rules.perRoomMX);
    total += (Number(details.bathrooms) || 0) * (isUSA ? rules.perBathroomUSA : rules.perBathroomMX);
    if (details.fridge) total += isUSA ? rules.extrasUSA.fridge : rules.extrasMX.fridge;
    if (details.oven) total += isUSA ? rules.extrasUSA.oven : rules.extrasMX.oven;
    if (details.windows) total += isUSA ? rules.extrasUSA.windows : rules.extrasMX.windows;
    if (details.stairs) total += isUSA ? rules.extrasUSA.stairs : rules.extrasMX.stairs;
    if (details.deepKitchen) total += isUSA ? rules.extrasUSA.deepKitchen : rules.extrasMX.deepKitchen;
  } 
  else if (serviceType === 'painting') {
    total += (Number(details.squareFeet) || 0) * (isUSA ? rules.perSqFtUSA : rules.perSqFtMX);
  }
  else if (serviceType === 'plumbing') {
    if (details.faucet) total += isUSA ? rules.extrasUSA.faucet : rules.extrasMX.faucet;
    if (details.leak) total += isUSA ? rules.extrasUSA.leak : rules.extrasMX.leak;
    if (details.toilet) total += isUSA ? rules.extrasUSA.toilet : rules.extrasMX.toilet;
  }
  else if (serviceType === 'handyman') {
    const hours = Number(details.hours) || 1;
    total += hours * (isUSA ? rules.perHourUSA : rules.perHourMX);
    if (details.weldDoor) total += isUSA ? rules.extrasUSA.weldDoor : rules.extrasMX.weldDoor;
    if (details.buildFurniture) total += isUSA ? rules.extrasUSA.buildFurniture : rules.extrasMX.buildFurniture;
    if (details.repairFurniture) total += isUSA ? rules.extrasUSA.repairFurniture : rules.extrasMX.repairFurniture;
  }
  else if (serviceType === 'hvac') {
    if (details.miniSplitClean) total += isUSA ? rules.extrasUSA.miniSplitClean : rules.extrasMX.miniSplitClean;
    if (details.ductClean) total += isUSA ? rules.extrasUSA.ductClean : rules.extrasMX.ductClean;
  }

  return total;
}