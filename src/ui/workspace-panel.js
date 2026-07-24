const OPEN_EVENT = "business-income-calculator:workspace-panel-open";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function visibleFocusableElements(panel) {
  return [...panel.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") return false;
    const style = globalThis.getComputedStyle?.(element);
    return style?.display !== "none" && style?.visibility !== "hidden";
  });
}

function syncBodyLock() {
  const hasOpenPanel = Boolean(document.querySelector(".workspace-dialog:not([hidden])"));
  document.body.classList.toggle("workspace-dialog-open", hasOpenPanel);
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

  panel.classList.add("workspace-dialog");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.hidden = true;
  toggleButton.setAttribute("aria-expanded", "false");

  function syncState() {
    panel.hidden = !visible;
    panel.setAttribute("aria-hidden", String(!visible));
    toggleButton.setAttribute("aria-expanded", String(visible));
    syncBodyLock();
  }

  function open() {
    if (visible) return;
    restoreTarget = document.activeElement instanceof HTMLElement ? document.activeElement : toggleButton;
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { id } }));
    visible = true;
    restoreFocusOnClose = true;
    syncState();
    onOpen();
    requestAnimationFrame(() => closeButton?.focus());
  }

  function close({ restoreFocus = true } = {}) {
    if (!visible) return;
    visible = false;
    restoreFocusOnClose = restoreFocus;
    syncState();
    onClose();
    if (restoreFocusOnClose) requestAnimationFrame(() => restoreTarget?.focus?.());
  }

  function toggle() {
    if (visible) close();
    else open();
  }

  toggleButton.addEventListener("click", toggle);
  closeButton.addEventListener("click", () => close());
  panel.addEventListener("keydown", (event) => {
    if (!visible) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = visibleFocusableElements(panel);
    if (!focusable.length) {
      event.preventDefault();
      closeButton?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener(OPEN_EVENT, (event) => {
    if (event.detail?.id !== id && visible) close({ restoreFocus: false });
  });
  document.addEventListener("pointerdown", (event) => {
    if (!visible || panel.contains(event.target) || toggleButton.contains(event.target)) return;
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
