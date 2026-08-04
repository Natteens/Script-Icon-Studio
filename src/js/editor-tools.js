"use strict";

(() => {
  const TOOL_CHANGE_EVENT = "script-icon-studio:tool-change";
  const originalImportSvg = importSvg;
  const originalImportShape = importShape;
  const originalNotify = notify;
  let customFileName = "";
  let automaticFileName = "";

  const exportSvgButton = document.querySelector("#export-svg");
  const exportGrid = document.querySelector(".export-grid");
  const resetButton = document.querySelector("#reset-all");

  document.querySelector("#export-svg-top")?.remove();

  exportSvgButton.classList.remove("primary");
  exportSvgButton.classList.add("secondary");
  exportSvgButton.textContent = "SVG";
  exportSvgButton.title = "Download a flattened SVG compatible with UI Toolkit Vector Image";

  document.querySelectorAll("[data-png]").forEach((button) => {
    button.classList.remove("primary");
    button.classList.add("secondary");
    button.textContent = `PNG ${button.dataset.png}`;
  });

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

  function emitToolChange(reason) {
    window.dispatchEvent(new CustomEvent(TOOL_CHANGE_EVENT, { detail: { reason } }));
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

  function selectedSourceLabel() {
    if (String(state.glyph?.id || "").startsWith("custom:")) return "Imported SVG";
    if (state.glyph?.prefix && sources[state.glyph.prefix]) return sources[state.glyph.prefix].label;
    return "Built-in glyph";
  }

  function updateLabelWarning() {
    const unsupported = [...state.text].some((character) => !/[A-Za-z0-9 ._-]/.test(character));
    labelWarning.hidden = !state.showText || !unsupported;
  }

  function syncAuxiliaryUi() {
    refreshFileNameField();
    updateLabelWarning();
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

  fileNameInput.addEventListener("focus", () => {
    if (!customFileName) fileNameInput.select();
  });

  fileNameInput.addEventListener("input", () => {
    const typed = fileNameInput.value;
    customFileName = typed === automaticFileName ? "" : typed;
    fileNameInput.dataset.auto = String(!customFileName);
    emitToolChange("file-name-input");
  });

  fileNameInput.addEventListener("blur", () => {
    customFileName = cleanPart(customFileName);
    refreshFileNameField();
    emitToolChange("file-name-commit");
  });

  document.querySelector("#label-text").addEventListener("input", updateLabelWarning);

  resetButton.addEventListener("click", () => {
    customFileName = "";
    labelWarning.hidden = true;
    syncAuxiliaryUi();
    emitToolChange("reset");
  });

  copyButton.addEventListener("click", copySvg);

  window.ScriptIconStudioTools = Object.freeze({
    eventName: TOOL_CHANGE_EVENT,
    captureMetadata() {
      return { fileName: customFileName };
    },
    restoreMetadata(snapshot) {
      customFileName = snapshot?.fileName || "";
      syncAuxiliaryUi();
    },
    selectedSourceLabel,
    sync: syncAuxiliaryUi
  });

  syncAuxiliaryUi();
})();