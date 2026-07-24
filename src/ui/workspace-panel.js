const OPEN_EVENT = "business-income-calculator:workspace-panel-open";
const STYLE_ID = "business-income-calculator-workspace-panel-styles";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const WORKSPACE_PANEL_STYLES = `
body.workspace-dialog-open { overflow: hidden; }
body.workspace-dialog-open::before {
  content: ""; position: fixed; inset: 0; z-index: 110;
  background: rgb(16 31 23 / 48%); backdrop-filter: blur(2px);
}
.workspace-dialog {
  position: fixed !important; inset: 24px 24px 24px auto; z-index: 120;
  width: min(1180px, calc(100vw - 48px)); max-width: none !important; max-height: none !important;
  margin: 0 !important; padding: 20px; overflow: auto; overscroll-behavior: contain;
  background: var(--surface); border: 1px solid var(--line-strong); border-radius: 14px;
  box-shadow: 0 22px 70px rgb(12 29 20 / 28%);
}
.workspace-dialog[hidden] { display: none !important; }
.workspace-dialog > .section-heading {
  position: sticky; top: -20px; z-index: 10; margin: -20px -20px 14px; padding: 18px 20px 14px;
  background: rgb(255 255 255 / 96%); border-bottom: 1px solid var(--line); backdrop-filter: blur(8px);
}
.portfolio-summary, .tracking-context {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 16px 0;
}
.portfolio-summary-card, .tracking-context-item {
  min-width: 0; padding: 14px; border: 1px solid var(--line); border-radius: var(--radius-control); background: var(--surface-soft);
}
.portfolio-summary-card span, .portfolio-summary-card small, .tracking-context-item span {
  display: block; color: var(--ink-soft); font-size: 11px;
}
.portfolio-summary-card strong, .tracking-context-item strong {
  display: block; margin: 6px 0; color: var(--ink); font-size: 17px; line-height: 1.3; font-variant-numeric: tabular-nums;
}
.portfolio-summary-primary { background: var(--brand-soft); border-color: #b9cdc1; }
.portfolio-summary-card.negative { background: var(--danger-soft); border-color: #e8b3af; }
.portfolio-summary-card.negative strong { color: var(--danger); }
.portfolio-summary-card.positive strong { color: var(--positive); }
.portfolio-table { min-width: 900px; }
.portfolio-table tr[data-portfolio-project] { cursor: pointer; }
.portfolio-table tr[data-portfolio-project]:hover td { background: #f7faf8; }
.portfolio-table tr.active-project td { background: var(--brand-soft); }
.portfolio-table tr.active-project td:first-child { background: var(--brand-soft); }
.portfolio-table tr.active-project strong { color: var(--brand); }
.portfolio-table button:disabled { opacity: 1; color: var(--positive); border-color: #b9cdc1; background: white; }
.tracking-context { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tracking-summary-primary { grid-column: span 2; background: var(--brand-soft); border-color: #b9cdc1; }
.tracking-summary-primary .tracking-status { font-size: 20px !important; }
.tracking-table-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 14px 0 10px;
}
.tracking-table-toolbar p { margin: 0; color: var(--ink-soft); font-size: 12px; }
.tracking-table-toolbar button { flex: 0 0 auto; }
.tracking-table tbody tr:nth-child(even) td { background: #fbfcfb; }
@media (max-width: 900px) {
  .workspace-dialog { inset: 16px; width: calc(100vw - 32px); }
  .portfolio-summary { grid-template-columns: 1fr 1fr; }
  .tracking-context { grid-template-columns: 1fr 1fr 1fr; }
}
@media (max-width: 680px) {
  .workspace-dialog {
    inset: 0; width: 100vw; height: 100dvh; padding: 16px; border: 0; border-radius: 0;
  }
  .workspace-dialog > .section-heading { top: -16px; margin: -16px -16px 12px; padding: 14px 16px 12px; }
  .workspace-dialog .section-heading { align-items: flex-start; }
  .workspace-dialog .portfolio-actions, .workspace-dialog .tracking-actions { width: 100%; }
  .workspace-dialog .tracking-actions button, .workspace-dialog .portfolio-actions button { flex: 1 1 auto; }
  .portfolio-summary, .tracking-context, .tracking-summary, .tracking-trends { grid-template-columns: 1fr; }
  .tracking-summary-primary { grid-column: auto; }
  .tracking-table-toolbar { align-items: stretch; flex-direction: column; }
  .tracking-table-toolbar button { width: 100%; }
}
@media print {
  .workspace-dialog { display: none !important; }
}
`;

function nextFrame(callback) {
  if (typeof globalThis.requestAnimationFrame === "function") globalThis.requestAnimationFrame(callback);
  else callback();
}

function createPanelEvent(id) {
  if (typeof globalThis.CustomEvent === "function") {
    return new globalThis.CustomEvent(OPEN_EVENT, { detail: { id } });
  }
  return { type: OPEN_EVENT, detail: { id } };
}

function dispatchPanelEvent(id) {
  const event = createPanelEvent(id);
  if (typeof document?.dispatchEvent === "function") document.dispatchEvent(event);
  else if (typeof document?.dispatch === "function") document.dispatch(OPEN_EVENT, event);
}

function ensureWorkspacePanelStyles() {
  if (typeof document === "undefined") return;
  if (typeof document.getElementById === "function" && document.getElementById(STYLE_ID)) return;
  if (typeof document.createElement !== "function") return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = WORKSPACE_PANEL_STYLES;
  if (typeof document.head?.append === "function") document.head.append(style);
  else if (typeof document.head?.appendChild === "function") document.head.appendChild(style);
}

function visibleFocusableElements(panel) {
  if (typeof panel?.querySelectorAll !== "function") return [];
  return [...panel.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    if (element.hidden || element.getAttribute?.("aria-hidden") === "true") return false;
    const style = globalThis.getComputedStyle?.(element);
    return style?.display !== "none" && style?.visibility !== "hidden";
  });
}

function syncBodyLock() {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return;
  const hasOpenPanel = Boolean(document.querySelector(".workspace-dialog:not([hidden])"));
  document.body?.classList?.toggle?.("workspace-dialog-open", hasOpenPanel);
}

export function createWorkspacePanel({
  id,
  panel,
  toggleButton,
  closeButton,
  onOpen = () => {},
  onClose = () => {},
}) {
  let visible = false;
  let restoreTarget = toggleButton;
  let restoreFocusOnClose = true;

  ensureWorkspacePanelStyles();
  panel?.classList?.add?.("workspace-dialog");
  panel?.setAttribute?.("role", "dialog");
  panel?.setAttribute?.("aria-modal", "true");
  const heading = panel?.querySelector?.("h2");
  if (heading) {
    if (!heading.id) heading.id = `${id}WorkspacePanelTitle`;
    panel.setAttribute?.("aria-labelledby", heading.id);
  }
  if (panel) panel.hidden = true;
  toggleButton?.setAttribute?.("aria-expanded", "false");

  function syncState() {
    if (panel) panel.hidden = !visible;
    panel?.setAttribute?.("aria-hidden", String(!visible));
    toggleButton?.setAttribute?.("aria-expanded", String(visible));
    syncBodyLock();
  }

  function open() {
    if (visible) return;
    restoreTarget = document?.activeElement?.focus ? document.activeElement : toggleButton;
    dispatchPanelEvent(id);
    visible = true;
    restoreFocusOnClose = true;
    syncState();
    onOpen();
    nextFrame(() => closeButton?.focus?.());
  }

  function close({ restoreFocus = true } = {}) {
    if (!visible) return;
    visible = false;
    restoreFocusOnClose = restoreFocus;
    syncState();
    onClose();
    if (restoreFocusOnClose) nextFrame(() => restoreTarget?.focus?.());
  }

  function toggle() {
    if (visible) close();
    else open();
  }

  toggleButton?.addEventListener?.("click", toggle);
  closeButton?.addEventListener?.("click", () => close());
  panel?.addEventListener?.("keydown", (event) => {
    if (!visible) return;
    if (event.key === "Escape") {
      event.preventDefault?.();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = visibleFocusableElements(panel);
    if (!focusable.length) {
      event.preventDefault?.();
      closeButton?.focus?.();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault?.();
      last.focus?.();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault?.();
      first.focus?.();
    }
  });

  document?.addEventListener?.(OPEN_EVENT, (event) => {
    if (event.detail?.id !== id && visible) close({ restoreFocus: false });
  });
  document?.addEventListener?.("pointerdown", (event) => {
    const insidePanel = panel?.contains?.(event.target) ?? false;
    const insideToggle = toggleButton?.contains?.(event.target) ?? false;
    if (!visible || insidePanel || insideToggle) return;
    close();
  });

  syncState();
  return {
    open,
    close,
    toggle,
    isOpen: () => visible,
  };
}
