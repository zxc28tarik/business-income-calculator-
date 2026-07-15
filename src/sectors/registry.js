import { CAFE_SECTOR } from "./cafe-restaurant.js";
import { ECOMMERCE_SECTOR } from "./ecommerce.js";
import { BEAUTY_SECTOR } from "./beauty.js";
import { AGENCY_SECTOR } from "./agency.js";
import { SAAS_SECTOR } from "./saas.js";
import { RETAIL_SECTOR } from "./retail.js";

export const SECTORS = [CAFE_SECTOR, ECOMMERCE_SECTOR, BEAUTY_SECTOR, AGENCY_SECTOR, SAAS_SECTOR, RETAIL_SECTOR];
export const SECTOR_MAP = new Map(SECTORS.map((sector) => [sector.id, sector]));

export function getSector(sectorId) {
  return SECTOR_MAP.get(sectorId) ?? SECTORS[0];
}
