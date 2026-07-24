import { asSingleInputSector } from "../core/single-input-sector.js";
import { STEAM_PUBLISHER_SECTOR } from "./steam-publisher.js";
import { CAFE_SECTOR } from "./cafe-restaurant.js";
import { ECOMMERCE_SECTOR } from "./ecommerce.js";
import { BEAUTY_SECTOR } from "./beauty-v2.js";
import { AGENCY_SECTOR } from "./agency-v2.js";
import { SAAS_SECTOR } from "./saas-v2.js";
import { RETAIL_SECTOR } from "./retail-v2.js";
import { AUTO_SERVICE_SECTOR } from "./auto-v2.js";

export const SECTORS = [
  CAFE_SECTOR,
  ECOMMERCE_SECTOR,
  BEAUTY_SECTOR,
  AGENCY_SECTOR,
  SAAS_SECTOR,
  RETAIL_SECTOR,
  AUTO_SERVICE_SECTOR,
  STEAM_PUBLISHER_SECTOR,
].map(asSingleInputSector);
export const SECTOR_MAP = new Map(SECTORS.map((sector) => [sector.id, sector]));

export function getSector(sectorId) {
  return SECTOR_MAP.get(sectorId) ?? SECTORS[0];
}
