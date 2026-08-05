"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:draft:v2";
  const SESSION_CHANGE_EVENT = "script-icon-studio:session-change";
  const HISTORY_LIMIT = 80;
  const SNAPSHOT_DELAY = 240;
  const tools = window.ScriptIconStudioTools;

  if (!tools) throw new Error("ScriptIconStudioTools must load before editor-session.js");

  let restoring = false;
  let history = [];
  let historyIndex = -1;
  let lastFingerprint = "";
  let snapshotTimer = 0;

  const resetButton = document.querySelector("#reset-all");
  const undoButton = document.createElement("button");
  undoButton.className = "button secondary history-button";
  undoButton.type = "button";
  undoButton.textContent = "Undo";
  undoButton.title = "Undo Ctrl+Z";

  const redoButton = document.createElement("button");
  redoButton.className = "button secondary history-button";
  redoButton.type = "button";
  redoButton.textContent = "Redo";
  redoButton.title = "Redo Ctrl+Y";

  resetButton.before(undoButton, redoButton);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function captureSnapshot() {
    return {
      version: 2,
      template: state.template,
      palette: clone(state.palette),
      glyph: clone(state.glyph),
      x: state.x,
      y: state.y,
      scale: state.scale,
      rotation: state.rotation,
      source: state.source,
      preview: state.preview,
      customShape: clone(state.customShape),
      showText: state.showText,
      text: state.text,
      textMode: state.textMode,
      textSize: state.textSize,
      outlineEnabled: state.outlineEnabled,
      ...tools.captureMetadata()
    };
  }

  function fingerprint(snapshot = captureSnapshot()) {
    return JSON.stringify(snapshot);
  }

  function emitSessionChange(reason) {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail: { reason } }));
  }

  function saveDraft(snapshot = captureSnapshot()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      setStatus("Draft could not be saved");
    }
  }

  function syncCoreUi(message = "") {
    document.querySelector("#show-outline").checked = state.outlineEnabled;
    document.querySelector("#show-text").checked = state.showText;
    document.querySelector("#label-text").value = state.text;
    document.querySelector("#text-controls").hidden = !state.showText;
    document.querySelector("#band-color-row").hidden = state.textMode !== "band";

    const customOption = document.querySelector("#custom-shape-option");
    customOption.hidden = !state.customShape;
    if (state.customShape) customOption.querySelector("strong").textContent = state.customShape.name;

    document.querySelectorAll("[data-template]").forEach((button) => {
      const active = button.dataset.template === state.template;
      button.classList.toggle("active", active);
      button.setAttribute("aria-checked", String(active));
    });

    document.querySelectorAll("[data-source]").forEach((button) => {
      button.classList.toggle("active", button.dataset.source === state.source);
    });

    document.querySelectorAll("[data-text-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.textMode === state.textMode);
    });

    document.querySelectorAll("[data-preview]").forEach((button) => {
      button.classList.toggle("active", button.dataset.preview === state.preview);
    });

    document.querySelector(".preview-area").classList.toggle("light", state.preview === "light");
    document.querySelector(".preview-area").classList.toggle("dark", state.preview === "dark");

    render();
    tools.sync();

    const paletteIndex = palettes.findIndex((palette) => ["background", "glyph", "outline", "band", "text"].every((key) => palette[key] === state.palette[key]));
    document.querySelectorAll(".palette-swatch").forEach((button, index) => {
      button.classList.toggle("active", index === paletteIndex);
    });

    document.querySelectorAll(".glyph-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.glyph === state.glyph.id);
    });

    document.querySelector("#selected-source").textContent = tools.selectedSourceLabel();
    if (message) setStatus(message);
  }

  function applySnapshot(snapshot, message) {
    if (!snapshot || snapshot.version !== 2) return false;

    restoring = true;
    try {
      state.template = snapshot.template;
      state.palette = clone(snapshot.palette);
      state.glyph = clone(snapshot.glyph);
      state.x = snapshot.x;
      state.y = snapshot.y;
      state.scale = snapshot.scale;
      state.rotation = snapshot.rotation;
      state.source = snapshot.source;
      state.preview = snapshot.preview;
      state.customShape = clone(snapshot.customShape);
      state.showText = snapshot.showText;
      state.text = snapshot.text;
      state.textMode = snapshot.textMode;
      state.textSize = snapshot.textSize;
      state.outlineEnabled = snapshot.outlineEnabled;
      tools.restoreMetadata(snapshot);
      syncCoreUi(message);
      lastFingerprint = fingerprint();
      saveDraft();
      return true;
    } finally {
      restoring = false;
    }
  }

  function updateHistoryButtons() {
    undoButton.disabled = historyIndex <= 0;
    redoButton.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
  }

  function pushCurrentSnapshot() {
    if (restoring) return;

    tools.sync();
    const snapshot = captureSnapshot();
    const nextFingerprint = fingerprint(snapshot);
    if (nextFingerprint === lastFingerprint) return;

    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > HISTORY_LIMIT) history.shift();
    historyIndex = history.length - 1;
    lastFingerprint = nextFingerprint;
    saveDraft(snapshot);
    updateHistoryButtons();
    emitSessionChange("editor-change");
  }

  function scheduleSnapshot() {
    if (restoring) return;
    tools.sync();
    clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(() => {
      snapshotTimer = 0;
      pushCurrentSnapshot();
    }, SNAPSHOT_DELAY);
  }

  function flushScheduledSnapshot() {
    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = 0;
    }
    pushCurrentSnapshot();
  }

  function replaceHistoryWithCurrent(reason = "history-reset") {
    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = 0;
    }
    const current = captureSnapshot();
    history = [current];
    historyIndex = 0;
    lastFingerprint = fingerprint(current);
    saveDraft(current);
    updateHistoryButtons();
    emitSessionChange(reason);
    return clone(current);
  }

  function undo() {
    flushScheduledSnapshot();
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    applySnapshot(history[historyIndex], "Undone");
    updateHistoryButtons();
    emitSessionChange("undo");
  }

  function redo() {
    flushScheduledSnapshot();
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    applySnapshot(history[historyIndex], "Redone");
    updateHistoryButtons();
    emitSessionChange("redo");
  }

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (stored) applySnapshot(stored, "Draft restored");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const initial = captureSnapshot();
  history = [initial];
  historyIndex = 0;
  lastFingerprint = fingerprint(initial);
  saveDraft(initial);
  syncCoreUi();
  updateHistoryButtons();

  window.ScriptIconStudioSession = Object.freeze({
    version: 2,
    eventName: SESSION_CHANGE_EVENT,
    capture() {
      flushScheduledSnapshot();
      return clone(captureSnapshot());
    },
    apply(snapshot, message = "Project opened") {
      if (!applySnapshot(clone(snapshot), message)) return false;
      replaceHistoryWithCurrent("project-open");
      return true;
    },
    resetHistory(reason = "history-reset") {
      return replaceHistoryWithCurrent(reason);
    },
    fingerprint(snapshot) {
      return fingerprint(snapshot);
    }
  });

  const previewObserver = new MutationObserver(scheduleSnapshot);
  previewObserver.observe(document.querySelector("#main-icon"), { childList: true });

  document.querySelector("#background-switch").addEventListener("click", scheduleSnapshot);
  document.querySelector("#source-filter").addEventListener("click", scheduleSnapshot);
  window.addEventListener(tools.eventName, scheduleSnapshot);

  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);

  window.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      undo();
    } else if (key === "y" || (key === "z" && event.shiftKey)) {
      event.preventDefault();
      redo();
    }
  });

  window.addEventListener("beforeunload", flushScheduledSnapshot);
})();