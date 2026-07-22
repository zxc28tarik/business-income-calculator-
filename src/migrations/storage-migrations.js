export const STORAGE_MIGRATION_VERSION = 1;

function safeKeys(storage) {
  const keys = [];
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key) keys.push(key);
    }
  } catch {
    return [];
  }
  return keys;
}

function read(storage, key) {
  try { return storage.getItem(key); } catch { return null; }
}

function write(storage, key, value) {
  try { storage.setItem(key, value); return true; } catch { return false; }
}

function validTrackingPayload(value) {
  if (typeof value !== "string" || value.length > 1_000_000) return false;
  try { return Array.isArray(JSON.parse(value)); } catch { return false; }
}

function cleanId(value, fallback = "legacy") {
  return String(value || fallback).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) || fallback;
}

export function migrateLegacyTrackingEntries({
  storage,
  trackingPrefix,
  activeProjectId,
  knownProjectIds = [],
  allowedSectorIds = null,
  scope = "platform",
}) {
  const projectId = cleanId(activeProjectId);
  const knownIds = new Set(knownProjectIds.map((value) => cleanId(value)));
  const allowed = Array.isArray(allowedSectorIds) ? new Set(allowedSectorIds.map(String)) : null;
  const markerKey = `business-income-calculator:migration:v0.23:${cleanId(scope, "scope")}`;
  const existingMarker = read(storage, markerKey);
  if (existingMarker) {
    try { return { ...JSON.parse(existingMarker), alreadyApplied: true }; } catch { /* bozuk işaret yeniden yazılır */ }
  }

  const prefix = `${trackingPrefix}:`;
  const report = {
    version: STORAGE_MIGRATION_VERSION,
    scope: String(scope),
    activeProjectId: projectId,
    migrated: 0,
    skippedExisting: 0,
    skippedInvalid: 0,
    skippedForeign: 0,
    appliedAt: new Date().toISOString(),
  };

  for (const key of safeKeys(storage)) {
    if (!key.startsWith(prefix)) continue;
    const suffix = key.slice(prefix.length);
    const firstSegment = suffix.split(":", 1)[0];
    if (knownIds.has(firstSegment)) continue;
    const sectorId = firstSegment;
    if (allowed && !allowed.has(sectorId)) {
      report.skippedForeign += 1;
      continue;
    }
    const value = read(storage, key);
    if (!validTrackingPayload(value)) {
      report.skippedInvalid += 1;
      continue;
    }
    const targetKey = `${prefix}${projectId}:${suffix}`;
    if (read(storage, targetKey) != null) {
      report.skippedExisting += 1;
      continue;
    }
    if (write(storage, targetKey, value)) report.migrated += 1;
  }

  write(storage, markerKey, JSON.stringify(report));
  return { ...report, alreadyApplied: false };
}
