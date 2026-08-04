"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:draft:v1";
  const HISTORY_LIMIT = 80;
  const originalFileName = fileName;
  const originalImportSvg = importSvg;
  const originalImportShape = importShape;
  let restoring = false;
  let history = [];
  let historyIndex = -1;
  let lastFingerprint = "";
  let customFileName = "";

  const style = document.createElement("style");
  style.textContent = `
    .history-button { min-width: 58px; }
    .button:disabled { opacity: .42; cursor: not-allowed; }
    .button:disabled:hover { border-color: var(--line-strong); background: var(--surface); }
    .filename-field { display: grid; gap: 6px; margin-bottom: 10px; }
    .filename-field span { color: var(--muted); font-size: 10px; }
    .filename-field input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid var(--line-strong); border-radius: 7px; background: #0f1216; font-size: 11px; }
    .filename-field small { color: var(--subtle); font-size: 9px; line-height: 1.4; }
    .label-warning { color: #e9b45f; }
    .size-16 { width: 16px; height: 16px; }
    @media (max-width: 720px) {
      .history-button { display: none; }
    }
  `;
  document.head.append(style);

  const resetButton = document.querySelector("#reset-all");
  const undoButton = document.createElement("button");
  undoButton.className = "button secondary history-button";
  undoButton.id = "undo-change";
  undoButton.type = "button";
  undoButton.textContent = "Undo";
  undoButton.title = "Undo Ctrl+Z";

  const redoButton = document.createElement("button");
  redoButton.className = "button secondary history-button";
  redoButton.id = "redo-change";
  redoButton.type = "button";
  redoButton.textContent = "Redo";
  redoButton.title = "Redo Ctrl+Y";

  resetButton.before(undoButton, redoButton);

  const exportGrid = document.querySelector(".export-grid");
  const filenameField = document.createElement("label");
  filenameField.className = "filename-field";
  filenameField.innerHTML = `
    <span>File name</span>
    <input id="file-name" type="text" maxlength="64" autocomplete="off" spellcheck="false" placeholder="emoticon" />
    <small>Leave empty to use the selected glyph name. Your draft is saved automatically in this browser.</small>
  `;
  exportGrid.before(filenameField);

  const copyButton = document.createElement("button");
  copyButton.className = "button secondary";
  copyButton.id = "copy-svg";
  copyButton.type = "button";
  copyButton.textContent = "Copy SVG";
  exportGrid.append(copyButton);

  const actualSizes = document.querySelector(".actual-sizes");
  const size16 = document.createElement("div");
  size16.innerHTML = '<span class="size-icon size-16"></span><small>16</small>';
  actualSizes.append(size16);

  const labelNote = document.querySelector(".text-controls .control-note");
  const labelWarning = document.createElement("p");
  labelWarning.className = "control-note label-warning";
  labelWarning.id = "label-warning";
  labelWarning.hidden = true;
  labelWarning.textContent = "UI Toolkit SVG labels support A-Z, 0-9, spaces, period, hyphen, and underscore. Other characters become question marks.";
  labelNote.after(labelWarning);

  const fileNameInput = document.querySelector("#file-name");

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function cleanFileName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-._]+|[-._]+$/g, "")
      .slice(0, 64);
  }

  fileName = function resolvedFileName() {
    return cleanFileName(customFileName) || originalFileName() || "script-icon";
  };

  function captureSnapshot() {
    return {
      version: 1,
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
      fileName: customFileName
    };
  }

  function fingerprint(snapshot = captureSnapshot()) {
    return JSON.stringify(snapshot);
  }

  function saveDraft(snapshot = captureSnapshot()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      setStatus("Draft could not be saved");
    }
  }

  function selectedSourceLabel() {
    if (String(state.glyph?.id || "").startsWith("custom:")) return "Imported SVG";
    if (state.glyph?.prefix && sources[state.glyph.prefix]) return sources[state.glyph.prefix].label;
    return "Built-in glyph";
  }

  function syncUi(message = "") {
    fileNameInput.value = customFileName;
    fileNameInput.placeholder = originalFileName();
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
    document.querySelectorAll("[data-source]").forEach((button) => button.classList.toggle("active", button.dataset.source === state.source));
    document.querySelectorAll("[data-text-mode]").forEach((button) => button.classList.toggle("active", button.dataset.textMode === state.textMode));
    document.querySelectorAll("[data-preview]").forEach((button) => button.classList.toggle("active", button.dataset.preview === state.preview));
    document.querySelector(".preview-area").classList.toggle("light", state.preview === "light");
    document.querySelector(".preview-area").classList.toggle("dark", state.preview === "dark");

    render();

    const paletteIndex = palettes.findIndex((palette) => ["background", "glyph", "outline", "band", "text"].every((key) => palette[key] === state.palette[key]));
    document.querySelectorAll(".palette-swatch").forEach((button, index) => button.classList.toggle("active", index === paletteIndex));
    document.querySelectorAll(".glyph-button").forEach((button) => button.classList.toggle("active", button.dataset.glyph === state.glyph.id));
    document.querySelector("#selected-source").textContent = selectedSourceLabel();
    updateLabelWarning();
    if (message) setStatus(message);
  }

  function applySnapshot(snapshot, message) {
    if (!snapshot || snapshot.version !== 1) return false;
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
      customFileName = snapshot.fileName || "";
      syncUi(message);
      lastFingerprint = fingerprint();
      saveDraft();
      return true;
    } finally {
      restoring = false;
    }
  }

  function pushCurrentSnapshot() {
    if (restoring) return;
    const snapshot = captureSnapshot();
    const nextFingerprint = fingerprint(snapshot);
    if (nextFingerprint === lastFingerprint) {
      fileNameInput.placeholder = originalFileName();
      return;
    }
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > HISTORY_LIMIT) history.shift();
    historyIndex = history.length - 1;
    lastFingerprint = nextFingerprint;
    saveDraft(snapshot);
    updateHistoryButtons();
    fileNameInput.placeholder = originalFileName();
  }

  function updateHistoryButtons() {
    undoButton.disabled = historyIndex <= 0;
    redoButton.disabled = historyIndex < 0 || historyIndex >= history.length - 1;
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    applySnapshot(history[historyIndex], "Undone");
    updateHistoryButtons();
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    applySnapshot(history[historyIndex], "Redone");
    updateHistoryButtons();
  }

  function inspectSvg(source, shapeMode = false) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(source, "image/svg+xml");
    if (documentNode.querySelector("parsererror")) return [];
    const allowedTags = new Set(shapeMode
      ? ["svg", "g", "path", "circle", "rect", "ellipse", "polygon"]
      : ["svg", "g", "path", "circle", "rect", "ellipse", "polygon", "polyline", "line"]);
    const removed = new Set();
    documentNode.querySelectorAll("*").forEach((node) => {
      const tag = node.tagName.toLowerCase();
      if (!allowedTags.has(tag)) removed.add(tag);
      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.toLowerCase();
        if (name.startsWith("on") || ["style", "href", "xlink:href", "filter", "mask", "clip-path"].includes(name) || value.includes("url(") || value.includes("javascript:")) removed.add(name);
      });
    });
    return [...removed];
  }

  importSvg = async function importSvgWithNotice(file) {
    if (!file) return originalImportSvg(file);
    let removed = [];
    try { removed = inspectSvg(await file.text()); } catch { removed = []; }
    await originalImportSvg(file);
    if (removed.length && document.querySelector("#selected-source").textContent === "Imported SVG") {
      notify(`Imported with changes. Removed unsupported parts: ${removed.slice(0, 4).join(", ")}${removed.length > 4 ? "…" : ""}`);
    }
  };

  importShape = async function importShapeWithNotice(file) {
    if (!file) return originalImportShape(file);
    let removed = [];
    try { removed = inspectSvg(await file.text(), true); } catch { removed = []; }
    await originalImportShape(file);
    if (removed.length && state.customShape) {
      notify(`Shape imported with changes. Removed unsupported parts: ${removed.slice(0, 4).join(", ")}${removed.length > 4 ? "…" : ""}`);
    }
  };

  function updateLabelWarning() {
    const unsupported = [...state.text].some((character) => !/[A-Za-z0-9 ._-]/.test(character));
    labelWarning.hidden = !state.showText || !unsupported;
  }

  async function copySvg() {
    try {
      const svg = buildUnitySvg();
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(svg);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = svg;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      notify("UI Toolkit SVG copied.");
    } catch (error) {
      notify(error.message || "The SVG could not be copied.");
    }
  }

  fileNameInput.addEventListener("input", (event) => {
    customFileName = event.target.value;
  });
  fileNameInput.addEventListener("blur", () => {
    customFileName = cleanFileName(customFileName);
    fileNameInput.value = customFileName;
    pushCurrentSnapshot();
  });
  document.querySelector("#label-text").addEventListener("input", updateLabelWarning);
  resetButton.addEventListener("click", () => {
    customFileName = "";
    fileNameInput.value = "";
    labelWarning.hidden = true;
  });
  undoButton.addEventListener("click", undo);
  redoButton.addEventListener("click", redo);
  copyButton.addEventListener("click", copySvg);

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
  syncUi();
  updateHistoryButtons();
  setInterval(pushCurrentSnapshot, 300);
})();
