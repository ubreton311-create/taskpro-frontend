import type { ServiceFormSchema } from './form-schema';
import { cleaningSchema } from './cleaning';
import { carpetCleaningSchema } from './carpet-cleaning';
import { officeCleaningSchema } from './office-cleaning';
import { windowCleaningSchema } from './window-cleaning';
import { gardeningSchema } from './gardening';
import { electricalSchema } from './electrical';
import { plumbingSchema } from './plumbing';
import { airConditioningSchema } from './air-conditioning';
import { applianceRepairSchema } from './appliance-repair';
import { electronicsSchema } from './electronics';
import { paintingSchema } from './painting';
import { masonrySchema } from './masonry';
import { carpentrySchema } from './carpentry';
import { metalworkSchema } from './metalwork';
import { glazingSchema } from './glazing';
import { locksmithSchema } from './locksmith';
import { nursingSchema } from './nursing';
import { movingSchema } from './moving';
import { pestControlSchema } from './pest-control';

// Este objeto contiene TODOS los esquemas.
export const allSchemas: Record<string, ServiceFormSchema> = {
  [cleaningSchema.serviceSlug]: cleaningSchema,
  [carpetCleaningSchema.serviceSlug]: carpetCleaningSchema,
  [officeCleaningSchema.serviceSlug]: officeCleaningSchema,
  [windowCleaningSchema.serviceSlug]: windowCleaningSchema,
  [gardeningSchema.serviceSlug]: gardeningSchema,
  [electricalSchema.serviceSlug]: electricalSchema,
  [plumbingSchema.serviceSlug]: plumbingSchema,
  [airConditioningSchema.serviceSlug]: airConditioningSchema,
  [applianceRepairSchema.serviceSlug]: applianceRepairSchema,
  [electronicsSchema.serviceSlug]: electronicsSchema,
  [paintingSchema.serviceSlug]: paintingSchema,
  [masonrySchema.serviceSlug]: masonrySchema,
  [carpentrySchema.serviceSlug]: carpentrySchema,
  [metalworkSchema.serviceSlug]: metalworkSchema,
  [glazingSchema.serviceSlug]: glazingSchema,
  [locksmithSchema.serviceSlug]: locksmithSchema,
  [nursingSchema.serviceSlug]: nursingSchema,
  [movingSchema.serviceSlug]: movingSchema,
  [pestControlSchema.serviceSlug]: pestControlSchema,
};

// Esta función busca el esquema correcto basado en el nombre del servicio (ej. "Limpieza de Oficinas")
export function getServiceSchema(serviceName: string): ServiceFormSchema | undefined {
  const name = serviceName.toLowerCase();
  
  if (name.includes("alfombra") || name.includes("pisos")) return carpetCleaningSchema;
  if (name.includes("oficina")) return officeCleaningSchema;
  if (name.includes("vidrio") || name.includes("ventana")) return windowCleaningSchema;
  if (name.includes("limpieza")) return cleaningSchema;
  if (name.includes("jardin")) return gardeningSchema;
  if (name.includes("electricidad")) return electricalSchema;
  if (name.includes("plomer")) return plumbingSchema;
  if (name.includes("a/c") || name.includes("aire")) return airConditioningSchema;
  if (name.includes("línea blanca")) return applianceRepairSchema;
  if (name.includes("electrónica")) return electronicsSchema;
  if (name.includes("pintura") || name.includes("impermeabilización")) return paintingSchema;
  if (name.includes("albañil")) return masonrySchema;
  if (name.includes("carpinter")) return carpentrySchema;
  if (name.includes("herrer")) return metalworkSchema;
  if (name.includes("vidrier")) return glazingSchema;
  if (name.includes("cerrajer")) return locksmithSchema;
  if (name.includes("enfermer") || name.includes("cuidado")) return nursingSchema;
  if (name.includes("mudanza")) return movingSchema;
  if (name.includes("plagas")) return pestControlSchema;

  return undefined;
}