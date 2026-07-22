const PORTFOLIO_SCHEMA = "business-income-calculator-portfolio-v1";
const BACKUP_SCHEMA = "business-income-calculator-backup-v1";
const MAX_PROJECTS = 50;
const MAX_NAME_LENGTH = 80;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function safeTimestamp(value, fallback) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

export function normalizeProjectName(value, fallback = "Yeni işletme") {
  const clean = String(value ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
  return clean || fallback;
}

export function createProjectId(now = Date.now(), random = Math.random()) {
  return `project-${Math.max(0, Math.floor(Number(now) || 0)).toString(36)}-${Math.floor(Math.max(0, Number(random) || 0) * 1e9).toString(36)}`;
}

function uniqueProjectId(projects, requestedId) {
  const used = new Set(projects.map((project) => project.id));
  let candidate = String(requestedId || createProjectId()).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
  if (!candidate) candidate = createProjectId();
  let index = 2;
  const base = candidate;
  while (used.has(candidate)) candidate = `${base}-${index++}`;
  return candidate;
}

function normalizeProject(raw, options) {
  const now = options.now;
  const workspace = options.normalizeWorkspace(raw?.workspace ?? options.createWorkspace());
  return {
    id: String(raw?.id || createProjectId()).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) || createProjectId(),
    name: normalizeProjectName(raw?.name),
    createdAt: safeTimestamp(raw?.createdAt, now),
    updatedAt: safeTimestamp(raw?.updatedAt, now),
    workspace: clone(workspace),
  };
}

export function createPortfolioState(workspace, options = {}) {
  const now = options.now ?? new Date().toISOString();
  const id = options.id ?? createProjectId();
  return {
    schema: PORTFOLIO_SCHEMA,
    activeProjectId: id,
    projects: [{
      id,
      name: normalizeProjectName(options.name, "İlk işletmem"),
      createdAt: now,
      updatedAt: now,
      workspace: clone(workspace),
    }],
  };
}

export function normalizePortfolioState(raw, options) {
  const now = options.now ?? new Date().toISOString();
  const baseWorkspace = options.normalizeWorkspace(options.initialWorkspace ?? options.createWorkspace());
  if (!raw || !Array.isArray(raw.projects) || !raw.projects.length) {
    return createPortfolioState(baseWorkspace, { now, name: options.initialName });
  }

  const projects = [];
  for (const source of raw.projects.slice(0, MAX_PROJECTS)) {
    const project = normalizeProject(source, { ...options, now });
    project.id = uniqueProjectId(projects, project.id);
    projects.push(project);
  }
  if (!projects.length) return createPortfolioState(baseWorkspace, { now, name: options.initialName });
  const activeProjectId = projects.some((project) => project.id === raw.activeProjectId)
    ? raw.activeProjectId
    : projects[0].id;
  return { schema: PORTFOLIO_SCHEMA, activeProjectId, projects };
}

export function getActiveProject(portfolio) {
  return portfolio.projects.find((project) => project.id === portfolio.activeProjectId) ?? portfolio.projects[0] ?? null;
}

export function updateProjectWorkspace(portfolio, projectId, workspace, now = new Date().toISOString()) {
  return {
    ...portfolio,
    projects: portfolio.projects.map((project) => project.id === projectId
      ? { ...project, workspace: clone(workspace), updatedAt: now }
      : project),
  };
}

export function selectProject(portfolio, projectId) {
  if (!portfolio.projects.some((project) => project.id === projectId)) return portfolio;
  return { ...portfolio, activeProjectId: projectId };
}

export function addProject(portfolio, workspace, options = {}) {
  if (portfolio.projects.length >= MAX_PROJECTS) throw new Error(`En fazla ${MAX_PROJECTS} kayıt oluşturulabilir.`);
  const now = options.now ?? new Date().toISOString();
  const id = uniqueProjectId(portfolio.projects, options.id ?? createProjectId());
  const project = {
    id,
    name: normalizeProjectName(options.name, `İşletme ${portfolio.projects.length + 1}`),
    createdAt: now,
    updatedAt: now,
    workspace: clone(workspace),
  };
  return { ...portfolio, activeProjectId: id, projects: [...portfolio.projects, project] };
}

export function renameProject(portfolio, projectId, name, now = new Date().toISOString()) {
  return {
    ...portfolio,
    projects: portfolio.projects.map((project) => project.id === projectId
      ? { ...project, name: normalizeProjectName(name, project.name), updatedAt: now }
      : project),
  };
}

export function duplicateProject(portfolio, projectId, options = {}) {
  const source = portfolio.projects.find((project) => project.id === projectId);
  if (!source) return portfolio;
  return addProject(portfolio, source.workspace, {
    ...options,
    name: options.name ?? `${source.name} kopyası`,
  });
}

export function removeProject(portfolio, projectId) {
  if (portfolio.projects.length <= 1) throw new Error("En az bir işletme/proje kaydı kalmalıdır.");
  const projects = portfolio.projects.filter((project) => project.id !== projectId);
  if (projects.length === portfolio.projects.length) return portfolio;
  const activeProjectId = portfolio.activeProjectId === projectId ? projects[0].id : portfolio.activeProjectId;
  return { ...portfolio, activeProjectId, projects };
}

export function buildPortfolioBackup({
  portfolio,
  trackingEntries = {},
  appVersion = "",
  scope = "platform",
  generatedAt = new Date().toISOString(),
}) {
  return {
    schema: BACKUP_SCHEMA,
    version: 1,
    scope: String(scope),
    appVersion: String(appVersion),
    generatedAt,
    portfolio: clone(portfolio),
    trackingEntries: Object.fromEntries(Object.entries(trackingEntries)
      .filter(([key, value]) => typeof key === "string" && typeof value === "string")
      .slice(0, 5000)),
  };
}

export function parsePortfolioBackup(text, options) {
  if (typeof text !== "string" || text.length > 5_000_000) throw new Error("Yedek dosyası boş veya izin verilen boyuttan büyük.");
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error("Yedek dosyası geçerli JSON değil."); }
  if (raw?.schema !== BACKUP_SCHEMA || raw?.version !== 1) throw new Error("Yedek dosyası bu uygulamanın desteklenen biçiminde değil.");
  const expectedScope = String(options.backupScope ?? "platform");
  if (String(raw.scope ?? "") !== expectedScope) throw new Error("Yedek dosyası farklı bir hesaplayıcı kapsamına ait.");
  const portfolio = normalizePortfolioState(raw.portfolio, options);
  const validProjectIds = new Set(portfolio.projects.map((project) => project.id));
  const trackingEntries = {};
  const prefix = `${options.trackingPrefix}:`;
  for (const [key, value] of Object.entries(raw.trackingEntries ?? {})) {
    const normalizedKey = String(key).slice(0, 300);
    if (!normalizedKey.startsWith(prefix) || typeof value !== "string") continue;
    const projectId = normalizedKey.slice(prefix.length).split(":")[0];
    if (!validProjectIds.has(projectId) || value.length > 1_000_000) continue;
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) continue;
    } catch { continue; }
    trackingEntries[normalizedKey] = value;
  }
  return {
    portfolio,
    trackingEntries,
    scope: expectedScope,
    appVersion: String(raw.appVersion ?? ""),
    generatedAt: String(raw.generatedAt ?? ""),
  };
}

export const PORTFOLIO_LIMITS = { maxProjects: MAX_PROJECTS, maxNameLength: MAX_NAME_LENGTH };
export const PORTFOLIO_SCHEMAS = { portfolio: PORTFOLIO_SCHEMA, backup: BACKUP_SCHEMA };
