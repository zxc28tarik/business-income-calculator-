import { escapeHtml, formatValue } from "../ui/formatters.js";
import {
  addProject,
  buildPortfolioBackup,
  duplicateProject,
  getActiveProject,
  normalizePortfolioState,
  parsePortfolioBackup,
  removeProject,
  renameProject,
  selectProject,
  updateProjectWorkspace,
} from "./portfolio-model.js";

const STATUS_LABELS = { dengeli: "Dengeli", dikkat: "Dikkat", riskli: "Riskli" };

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}

function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* yerel depolama kapalı olabilir */ }
}

function allStorageKeys() {
  const keys = [];
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key) keys.push(key);
    }
  } catch { /* file:// ve gizli mod */ }
  return keys;
}

function downloadJson(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function dateText(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("tr-TR") : "—";
}

function money(value) {
  return formatValue(Number(value) || 0, "money");
}

function renderPortfolioTable(portfolio, summarizeWorkspace) {
  const rows = portfolio.projects.map((project) => {
    let summary;
    try { summary = summarizeWorkspace(project.workspace); } catch { summary = null; }
    const status = summary?.status ?? "riskli";
    return `<tr data-portfolio-project="${escapeHtml(project.id)}">
      <td><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(dateText(project.updatedAt))}</small></td>
      <td>${escapeHtml(summary?.sectorName ?? "Hesaplanamadı")}</td>
      <td>${escapeHtml(summary?.scenarioLabel ?? "—")}</td>
      <td>${money(summary?.grossRevenue)}</td>
      <td>${money(summary?.netProfit)}</td>
      <td>${money(summary?.endingCash)}</td>
      <td><span class="portfolio-status ${escapeHtml(status)}">${escapeHtml(STATUS_LABELS[status] ?? status)}</span></td>
      <td><button type="button" class="secondary-button" data-portfolio-open="${escapeHtml(project.id)}">Aç</button></td>
    </tr>`;
  }).join("");
  return `<thead><tr><th>Kayıt</th><th>Sektör</th><th>Senaryo</th><th>Brüt gelir</th><th>Net sonuç</th><th>12 ay sonu nakit</th><th>Durum</th><th></th></tr></thead><tbody>${rows}</tbody>`;
}

export function createPortfolioController({
  elements,
  storageKey,
  trackingPrefix,
  backupScope = "platform",
  appVersion,
  initialWorkspace,
  createWorkspace,
  normalizeWorkspace,
  getWorkspace,
  setWorkspace,
  summarizeWorkspace,
  initialName = "İlk işletmem",
}) {
  const normalizeOptions = {
    createWorkspace,
    normalizeWorkspace,
    initialWorkspace,
    initialName,
    trackingPrefix,
    backupScope,
  };
  let visible = false;
  let portfolio = loadPortfolio();

  function loadPortfolio() {
    try {
      const saved = JSON.parse(safeGet(storageKey) || "null");
      return normalizePortfolioState(saved, normalizeOptions);
    } catch {
      return normalizePortfolioState(null, normalizeOptions);
    }
  }

  function savePortfolio() {
    safeSet(storageKey, JSON.stringify(portfolio));
  }

  function activeProject() {
    return getActiveProject(portfolio);
  }

  function projectIds() {
    return new Set(portfolio.projects.map((project) => project.id));
  }

  function syncActiveWorkspace() {
    const active = activeProject();
    if (!active) return;
    portfolio = updateProjectWorkspace(portfolio, active.id, normalizeWorkspace(getWorkspace()));
    savePortfolio();
  }

  function migrateLegacyTracking() {
    const prefix = `${trackingPrefix}:`;
    const knownIds = projectIds();
    const activeId = portfolio.activeProjectId;
    for (const key of allStorageKeys()) {
      if (!key.startsWith(prefix)) continue;
      const remainder = key.slice(prefix.length);
      const firstSegment = remainder.split(":")[0];
      if (knownIds.has(firstSegment) || firstSegment.startsWith("project-")) continue;
      const value = safeGet(key);
      const targetKey = `${prefix}${activeId}:${remainder}`;
      if (value != null && safeGet(targetKey) == null) safeSet(targetKey, value);
    }
  }

  function trackingEntries() {
    const entries = {};
    const prefixes = portfolio.projects.map((project) => `${trackingPrefix}:${project.id}:`);
    for (const key of allStorageKeys()) {
      if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
      const value = safeGet(key);
      if (typeof value === "string") entries[key] = value;
    }
    return entries;
  }

  function clearTrackingEntriesForIds(ids) {
    const prefixes = [...ids].map((id) => `${trackingPrefix}:${id}:`);
    for (const key of allStorageKeys()) {
      if (prefixes.some((prefix) => key.startsWith(prefix))) safeRemove(key);
    }
  }

  function copyTrackingEntries(sourceId, targetId) {
    const prefix = `${trackingPrefix}:${sourceId}:`;
    for (const key of allStorageKeys()) {
      if (!key.startsWith(prefix)) continue;
      const value = safeGet(key);
      if (value != null) safeSet(`${trackingPrefix}:${targetId}:${key.slice(prefix.length)}`, value);
    }
  }

  function renderSelect() {
    elements.projectSelect.innerHTML = portfolio.projects
      .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`)
      .join("");
    elements.projectSelect.value = portfolio.activeProjectId;
  }

  function render() {
    renderSelect();
    elements.panel.hidden = !visible;
    elements.toggleButton.setAttribute("aria-expanded", String(visible));
    if (visible) elements.table.innerHTML = renderPortfolioTable(portfolio, summarizeWorkspace);
  }

  function activate(projectId) {
    syncActiveWorkspace();
    portfolio = selectProject(portfolio, projectId);
    savePortfolio();
    const active = activeProject();
    if (active) setWorkspace(clone(active.workspace));
    render();
  }

  function createNew() {
    syncActiveWorkspace();
    const name = prompt("Yeni işletme/proje adı:", `İşletme ${portfolio.projects.length + 1}`);
    if (name == null) return;
    try {
      portfolio = addProject(portfolio, normalizeWorkspace(createWorkspace()), { name });
      savePortfolio();
      setWorkspace(clone(activeProject().workspace));
      render();
    } catch (error) { alert(error.message); }
  }

  function renameActive() {
    const active = activeProject();
    if (!active) return;
    const name = prompt("Kayıt adı:", active.name);
    if (name == null) return;
    portfolio = renameProject(portfolio, active.id, name);
    savePortfolio();
    render();
  }

  function duplicateActive() {
    syncActiveWorkspace();
    const sourceId = portfolio.activeProjectId;
    try {
      portfolio = duplicateProject(portfolio, sourceId);
      const targetId = portfolio.activeProjectId;
      copyTrackingEntries(sourceId, targetId);
      savePortfolio();
      setWorkspace(clone(activeProject().workspace));
      render();
    } catch (error) { alert(error.message); }
  }

  function deleteActive() {
    const active = activeProject();
    if (!active || !confirm(`“${active.name}” kaydı ve bu kayda ait takip verileri silinsin mi?`)) return;
    try {
      const removedId = active.id;
      portfolio = removeProject(portfolio, removedId);
      clearTrackingEntriesForIds([removedId]);
      savePortfolio();
      setWorkspace(clone(activeProject().workspace));
      render();
    } catch (error) { alert(error.message); }
  }

  function exportBackup() {
    syncActiveWorkspace();
    const backup = buildPortfolioBackup({
      portfolio,
      trackingEntries: trackingEntries(),
      appVersion,
      scope: backupScope,
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(backup, `business-income-calculator-yedek-${date}.json`);
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) { alert("Yedek dosyası 5 MB sınırını aşıyor."); return; }
    try {
      const parsed = parsePortfolioBackup(await file.text(), normalizeOptions);
      if (!confirm(`${parsed.portfolio.projects.length} kayıt içe aktarılacak. Mevcut portföy ve takip verileri değiştirilsin mi?`)) return;
      const previousIds = projectIds();
      clearTrackingEntriesForIds(previousIds);
      for (const [key, value] of Object.entries(parsed.trackingEntries)) safeSet(key, value);
      portfolio = parsed.portfolio;
      savePortfolio();
      setWorkspace(clone(activeProject().workspace));
      render();
      alert("Yedek doğrulandı ve içe aktarıldı.");
    } catch (error) { alert(`İçe aktarma başarısız: ${error.message}`); }
  }

  function attach() {
    elements.projectSelect.addEventListener("change", (event) => activate(event.target.value));
    elements.newButton.addEventListener("click", createNew);
    elements.renameButton.addEventListener("click", renameActive);
    elements.duplicateButton.addEventListener("click", duplicateActive);
    elements.deleteButton.addEventListener("click", deleteActive);
    elements.toggleButton.addEventListener("click", () => {
      visible = !visible;
      if (visible) syncActiveWorkspace();
      render();
    });
    elements.closeButton.addEventListener("click", () => { visible = false; render(); });
    elements.exportButton.addEventListener("click", exportBackup);
    elements.importButton.addEventListener("click", () => elements.importInput.click());
    elements.importInput.addEventListener("change", importBackup);
    elements.table.addEventListener("click", (event) => {
      const projectId = event.target.dataset.portfolioOpen;
      if (projectId) activate(projectId);
    });
  }

  migrateLegacyTracking();
  savePortfolio();
  attach();
  render();
  return {
    render,
    syncActiveWorkspace,
    getActiveProjectId: () => portfolio.activeProjectId,
    getActiveWorkspace: () => clone(activeProject()?.workspace ?? createWorkspace()),
    getPortfolio: () => clone(portfolio),
  };
}
