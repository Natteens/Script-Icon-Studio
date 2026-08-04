"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:draft:v2";
  const HISTORY_LIMIT = 80;
  const originalImportSvg = importSvg;
  const originalImportShape = importShape;
  const originalNotify = notify;
  let restoring = false;
  let history = [];
  let historyIndex = -1;
  let lastFingerprint = "";
  let customFileName = "";
  let automaticFileName = "";

  const style = document.createElement("style");
  style.textContent = `
    .history-button { min-width: 58px; }
    .button:disabled { opacity: .42; cursor: not-allowed; }
    .button:disabled:hover { border-color: var(--line-strong); background: var(--surface); }
    .filename-field { display: grid; gap: 6px; margin-bottom: 10px; }
    .filename-field span { color: var(--muted); font-size: 10px; }
    .filename-field input { width: 100%; height: 36px; padding: 0 10px; border: 1px solid var(--line-strong); border-radius: 7px; background: #0f1216; font-size: 11px; }
    .filename-field input[data-auto="true"] { color: #aeb7c4; }
    .filename-field small { color: var(--subtle); font-size: 9px; line-height: 1.4; }
    .label-warning { color: #e9b45f; }
    .size-16 { width: 16px; height: 16px; }
    .export-grid .button { min-height: 38px; }
    .export-copy { grid-column: 1 / -1; }
    @media (max-width: 720px) { .history-button { display: none; } }
  `;
  document.head.append(style);

  document.querySelector("#export-svg-top")?.remove();

  const exportSvgButton = document.querySelector("#export-svg");
  exportSvgButton.classList.remove("primary");
  exportSvgButton.classList.add("secondary");
  exportSvgButton.textContent = "SVG";
  exportSvgButton.title = "Download a flattened SVG compatible with UI Toolkit Vector Image";
  document.querySelectorAll("[data-png]").forEach((button) => {
    button.classList.remove("primary");
    button.classList.add("secondary");
    button.textContent = `PNG ${button.dataset.png}`;
  });

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

  const exportGrid = document.querySelector(".export-grid");
  const filenameField = document.createElement("label");
  filenameField.className = "filename-field";
  filenameField.innerHTML = `
    <span>File name</span>
    <input id="file-name" type="text" maxlength="64" autocomplete="off" spellcheck="false" placeholder="icon_fsm_hierarchy" />
    <small>Generated from the label and glyph. Edit it at any time. Clear the field to restore the automatic name.</small>
  `;
  exportGrid.before(filenameField);

  const copyButton = document.createElement("button");
  copyButton.className = "button secondary export-copy";
  copyButton.type = "button";
  copyButton.textContent = "Copy SVG";
  exportGrid.append(copyButton);

  const size16 = document.createElement("div");
  size16.innerHTML = '<span class="size-icon size-16"></span><small>16</small>';
  document.querySelector(".actual-sizes").append(size16);

  const labelWarning = document.createElement("p");
  labelWarning.className = "control-note label-warning";
  labelWarning.hidden = true;
  labelWarning.textContent = "SVG labels support A-Z, 0-9, spaces, period, hyphen, and underscore. Other characters become question marks.";
  document.querySelector(".text-controls .control-note").after(labelWarning);

  const fileNameInput = document.querySelector("#file-name");

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function cleanPart(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function generatedFileName() {
    const label = state.showText ? cleanPart(state.text) : "";
    const glyph = cleanPart(state.glyph?.name) || "icon";
    const parts = ["icon"];
    if (label && label !== "icon") parts.push(label);
    if (glyph && glyph !== label && glyph !== "icon") parts.push(glyph);
    return parts.join("_").slice(0, 64).replace(/_+$/g, "") || "icon";
  }

  function refreshFileNameField() {
    automaticFileName = generatedFileName();
    fileNameInput.value = customFileName || automaticFileName;
    fileNameInput.dataset.auto = String(!customFileName);
  }

  fileName = function resolvedFileName() {
    return cleanPart(customFileName) || generatedFileName();
  };

  notify = function polishedNotify(message) {
    const replacements = new Map([
      ["Unity-compatible SVG 64 × 64 downloaded.", "SVG downloaded."],
      ["UI Toolkit SVG copied.", "SVG copied."],
      ["The Unity-compatible SVG could not be generated.", "The SVG could not be generated."]
    ]);
    originalNotify(replacements.get(message) || message);
  };

  exportPng = function polishedExportPng(size) {
    const image = new Image();
    const source = URL.createObjectURL(new Blob([buildSvg()], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (blob) download(`${fileName()}_${size}.png`, blob, "image/png");
      }, "image/png");
      URL.revokeObjectURL(source);
      notify(`PNG ${size} × ${size} downloaded.`);
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      notify("The PNG could not be generated.");
    };
    image.src = source;
  };

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

  function updateLabelWarning() {
    const unsupported = [...state.text].some((character) => !/[A-Za-z0-9 ._-]/.test(character));
    labelWarning.hidden = !state.showText || !unsupported;
  }

  function syncUi(message = "") {
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
    refreshFileNameField();

    const paletteIndex = palettes.findIndex((palette) => ["background", "glyph", "outline", "band", "text"].every((key) => palette[key] === state.palette[key]));
    document.querySelectorAll(".palette-swatch").forEach((button, index) => button.classList.toggle("active", index === paletteIndex));
    document.querySelectorAll(".glyph-button").forEach((button) => button.classList.toggle("active", button.dataset.glyph === state.glyph.id));
    document.querySelector("#selected-source").textContent = selectedSourceLabel();
    updateLabelWarning();
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
      customFileName = snapshot.fileName || "";
      syncUi(message);
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
    const snapshot = captureSnapshot();
    const nextFingerprint = fingerprint(snapshot);
    refreshFileNameField();
    if (nextFingerprint === lastFingerprint) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > HISTORY_LIMIT) history.shift();
    historyIndex = history.length - 1;
    lastFingerprint = nextFingerprint;
    saveDraft(snapshot);
    updateHistoryButtons();
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
      notify("SVG copied.");
    } catch (error) {
      notify(error.message || "The SVG could not be copied.");
    }
  }

  fileNameInput.addEventListener("focus", () => {
    if (!customFileName) fileNameInput.select();
  });
  fileNameInput.addEventListener("input", () => {
    const typed = fileNameInput.value;
    customFileName = typed === automaticFileName ? "" : typed;
    fileNameInput.dataset.auto = String(!customFileName);
  });
  fileNameInput.addEventListener("blur", () => {
    customFileName = cleanPart(customFileName);
    refreshFileNameField();
    pushCurrentSnapshot();
  });
  document.querySelector("#label-text").addEventListener("input", updateLabelWarning);
  resetButton.addEventListener("click", () => {
    customFileName = "";
    labelWarning.hidden = true;
    setTimeout(refreshFileNameField, 0);
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
