import { CAFE_SECTOR } from "./cafe-restaurant.js";
import { ECOMMERCE_SECTOR } from "./ecommerce.js";

export const SECTORS = [CAFE_SECTOR, ECOMMERCE_SECTOR];
export const SECTOR_MAP = new Map(SECTORS.map((sector) => [sector.id, sector]));

export function getSector(sectorId) {
  return SECTOR_MAP.get(sectorId) ?? SECTORS[0];
}
