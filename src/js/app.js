"use strict";

const palettes = [
  { name: "Blue", background: "#4D87ED", glyph: "#FFFFFF", outline: "#315DA4", band: "#3C70CE", text: "#FFFFFF" },
  { name: "Pink", background: "#F34F8C", glyph: "#FFFFFF", outline: "#A92E60", band: "#C53870", text: "#FFFFFF" },
  { name: "Violet", background: "#9362DB", glyph: "#FFFFFF", outline: "#633AA2", band: "#7448B7", text: "#FFFFFF" },
  { name: "Red", background: "#ED3454", glyph: "#FFFFFF", outline: "#9F1D35", band: "#C52945", text: "#FFFFFF" },
  { name: "Amber", background: "#F3C744", glyph: "#262719", outline: "#9A7720", band: "#D2A72D", text: "#262719" },
  { name: "Slate", background: "#566173", glyph: "#FFFFFF", outline: "#303947", band: "#414B5B", text: "#FFFFFF" }
];

const builtIns = [
  { id: "local:emoticon", name: "emoticon", viewBox: "0 0 24 24", markup: '<g transform="rotate(90 12 12)"><path fill="currentColor" d="M6.5 17q-.65 0-1.075-.425T5 15.5q0-.625.425-1.062T6.5 14q.625 0 1.063.438T8 15.5q0 .65-.437 1.075T6.5 17m0-7q-.65 0-1.075-.425T5 8.5q0-.625.425-1.062T6.5 7q.625 0 1.063.438T8 8.5q0 .65-.437 1.075T6.5 10m3.5 3v-2h4v2zm7.2 5l-1.65-1.1q.7-1.075 1.075-2.312T17 12q0-1.65-.537-3.1T14.95 6.275L16.475 5q1.2 1.425 1.863 3.213T19 12q0 1.675-.475 3.188T17.2 18"/></g>' },
  { id: "local:gear", name: "system", viewBox: "0 0 24 24", markup: '<path fill-rule="evenodd" d="M9.2 2h5.6l.5 2.2 1.7 1 2.2-.7 2.8 4.8-1.7 1.5v2.4l1.7 1.5-2.8 4.8-2.2-.7-1.7 1-.5 2.2H9.2l-.5-2.2-1.7-1-2.2.7L2 14.7l1.7-1.5v-2.4L2 9.3l2.8-4.8 2.2.7 1.7-1L9.2 2Zm2.8 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>' },
  { id: "local:spark", name: "effect", viewBox: "0 0 24 24", markup: '<path d="M12 1.8c.5 4.7 3.5 7.7 8.2 8.2-4.7.5-7.7 3.5-8.2 8.2-.5-4.7-3.5-7.7-8.2-8.2 4.7-.5 7.7-3.5 8.2-8.2ZM19 15.5c.2 2 1.5 3.3 3.5 3.5-2 .2-3.3 1.5-3.5 3.5-.2-2-1.5-3.3-3.5-3.5 2-.2 3.3-1.5 3.5-3.5Z"/>' },
  { id: "local:sword", name: "weapon", viewBox: "0 0 24 24", markup: '<path d="m20.85 2-2.12 7.4-7.35 7.35-2.12-2.12 7.35-7.35L20.85 2ZM8.2 14.57l1.24 1.24-2.13 2.13 1.42 1.42-1.77 1.77-4.09-4.09 1.77-1.77 1.42 1.42 2.14-2.12Z"/>' },
  { id: "local:target", name: "target", viewBox: "0 0 24 24", markup: '<path fill-rule="evenodd" d="M10.5 2h3v2.2a8 8 0 0 1 6.3 6.3H22v3h-2.2a8 8 0 0 1-6.3 6.3V22h-3v-2.2a8 8 0 0 1-6.3-6.3H2v-3h2.2a8 8 0 0 1 6.3-6.3V2Zm1.5 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>' },
  { id: "local:sound", name: "sound", viewBox: "0 0 24 24", markup: '<path d="M3 9h4l5-4v14l-5-4H3V9Zm12.2-.7a5 5 0 0 1 0 7.4l-1.4-1.5a3 3 0 0 0 0-4.4l1.4-1.5Zm2.7-2.8a9 9 0 0 1 0 13l-1.4-1.5a7 7 0 0 0 0-10l1.4-1.5Z"/>' },
  { id: "local:filter", name: "filter", viewBox: "0 0 24 24", markup: '<path d="M2.5 4h19L14 12.6V20l-4 2v-9.4L2.5 4Z"/>' },
  { id: "local:folder", name: "folder", viewBox: "0 0 24 24", markup: '<path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10l2 2h7.5A2.5 2.5 0 0 1 22 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-12Z"/>' }
];

const sources = {
  lucide: { label: "Lucide · ISC", prefix: "lucide" },
  ph: { label: "Phosphor · MIT", prefix: "ph" },
  "material-symbols": { label: "Material Symbols · Apache 2.0", prefix: "material-symbols" }
};

const aliases = {
  weapon: "sword", audio: "speaker", system: "settings", effect: "sparkles",
  state: "workflow", player: "user", run: "running", machine: "cpu"
};

const shapes = {
  bevel: "M12 2.5h32.5l14 14V53a8.5 8.5 0 0 1-8.5 8.5H12A6.5 6.5 0 0 1 5.5 55V9A6.5 6.5 0 0 1 12 2.5Z",
  rounded: "M13 2.5h38A7.5 7.5 0 0 1 58.5 10v44A7.5 7.5 0 0 1 51 61.5H13A7.5 7.5 0 0 1 5.5 54V10A7.5 7.5 0 0 1 13 2.5Z",
  squircle: "M19 2.5h26c9 0 13.5 4.5 13.5 13.5v32c0 9-4.5 13.5-13.5 13.5H19C10 61.5 5.5 57 5.5 48V16C5.5 7 10 2.5 19 2.5Z",
  cut: "M13 2.5h38l7.5 7.5v44L51 61.5H13L5.5 54V10L13 2.5Z",
  shield: "M6 3h52v31.5C58 48.5 47.5 58 32 62 16.5 58 6 48.5 6 34.5V3Z"
};

const state = {
  template: "bevel",
  palette: { ...palettes[0] },
  glyph: builtIns[0],
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  source: "all",
  preview: "grid",
  customShape: null,
  showText: false,
  text: "ICON",
  textMode: "band",
  textSize: 8.75
};

const searchCache = new Map();
const glyphCache = new Map();
let searchTimer = 0;
let searchController = null;
let toastTimer = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[character]));
}

function fileName() {
  return (state.glyph.name || "unity-script-icon").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unity-script-icon";
}

function iconifyUrl(id) {
  const [prefix, ...nameParts] = id.split(":");
  return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(nameParts.join(":"))}.svg`;
}

function customShapeMarkup(color, extraTransform = "", withOutline = false, outlineOnly = false) {
  if (!state.customShape) return "";
  const [minX, minY, width, height] = state.customShape.viewBox.split(/[ ,]+/).map(Number);
  if (![minX, minY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return "";
  const scale = Math.min(53 / width, 59 / height);
  const x = 5.5 + (53 - width * scale) / 2 - minX * scale;
  const y = 2.5 + (59 - height * scale) / 2 - minY * scale;
  const outline = withOutline ? `stroke="${state.palette.outline}" stroke-width="${1.5 / scale}" stroke-linejoin="round"` : 'stroke="none"';
  const fill = outlineOnly ? "none" : "currentColor";
  return `<g color="${color}" fill="${fill}" ${outline} transform="${extraTransform} translate(${x} ${y}) scale(${scale})">${state.customShape.markup}</g>`;
}

function shapeContent(mode = "body") {
  if (state.template === "custom" && state.customShape) {
    if (mode === "clip") return customShapeMarkup("#000000");
    if (mode === "shadow") return customShapeMarkup("#000000");
    if (mode === "outline") return customShapeMarkup(state.palette.background, "", true, true);
    return customShapeMarkup(state.palette.background);
  }
  const shape = shapes[state.template] || shapes.bevel;
  if (mode === "clip") return `<path d="${shape}"/>`;
  if (mode === "shadow") return `<path d="${shape}" fill="#000000"/>`;
  if (mode === "outline") return `<path d="${shape}" fill="none" stroke="${state.palette.outline}" stroke-width="1.5" stroke-linejoin="round"/>`;
  return `<path d="${shape}" fill="${state.palette.background}"/>`;
}

function templateMarkup() {
  return `<g opacity=".26" transform="translate(.8 .8)">${shapeContent("shadow")}</g>${shapeContent("body")}`;
}

function outlineMarkup() {
  return shapeContent("outline");
}

function labelMarkup() {
  if (!state.showText || !state.text.trim()) return "";
  const label = state.text.trim().slice(0, 18);
  const estimatedWidth = Math.max(1, label.length * state.textSize * .62);
  const scaleX = Math.min(1, 45 / estimatedWidth);
  const band = state.textMode === "band" ? `<rect class="label-band" x="5.5" y="45" width="53" height="17" fill="${state.palette.band}" clip-path="url(#shape-clip)"/>` : "";
  const text = `<text x="32" y="56.4" fill="${state.palette.text}" font-family="Arial,Helvetica,sans-serif" font-size="${state.textSize}" font-weight="800" letter-spacing="-.18" text-anchor="middle">${escapeXml(label)}</text>`;
  return `${band}<g class="label-text" clip-path="url(#shape-clip)" transform="translate(32 0) scale(${scaleX} 1) translate(-32 0)">${text}</g>`;
}

function buildSvg() {
  const size = 30 * state.scale;
  const x = 32 - size / 2 + state.x;
  const y = 32 - size / 2 + state.y;
  const glyphCenter = state.showText ? 25 : 32;
  const glyphY = glyphCenter - size / 2 + state.y;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><title>${escapeXml(state.glyph.name)} Unity script icon</title><defs><clipPath id="shape-clip">${shapeContent("clip")}</clipPath></defs>${templateMarkup()}<g color="${state.palette.glyph}" transform="rotate(${state.rotation} 32 ${glyphCenter})"><svg x="${x}" y="${glyphY}" width="${size}" height="${size}" viewBox="${escapeXml(state.glyph.viewBox)}" overflow="visible" fill="currentColor" color="${state.palette.glyph}" preserveAspectRatio="xMidYMid meet">${state.glyph.markup}</svg></g>${labelMarkup()}${outlineMarkup()}</svg>`;
}

function render() {
  const svg = buildSvg();
  $("#main-icon").innerHTML = svg;
  $$(".size-icon").forEach((node) => { node.innerHTML = svg; });
  $("#palette-name").textContent = state.palette.name;
  updateColorControls();
  updateRangeOutputs();
}

function updateColorControls() {
  ["background", "glyph", "outline", "band", "text"].forEach((key) => {
    $(`#color-${key}`).value = state.palette[key];
    $(`#value-${key}`).textContent = state.palette[key];
  });
}

function updateRangeOutputs() {
  $("#value-x").textContent = state.x;
  $("#value-y").textContent = state.y;
  $("#value-scale").textContent = `${Math.round(state.scale * 100)}%`;
  $("#value-rotation").textContent = `${state.rotation}°`;
  $("#value-text-size").textContent = `${state.textSize}px`;
}

function renderPalettes() {
  $("#palette-list").innerHTML = palettes.map((palette, index) => `<button class="palette-swatch${index === 0 ? " active" : ""}" data-palette="${index}" type="button" title="${palette.name}" aria-label="${palette.name} palette" style="background:${palette.background}"></button>`).join("");
}

function glyphPreview(glyph) {
  if (glyph.remote) {
    return `<img src="${iconifyUrl(glyph.id)}?color=%23D9DEE8" alt="" loading="lazy" />`;
  }
  return `<svg viewBox="${glyph.viewBox}" fill="currentColor" color="currentColor" aria-hidden="true">${glyph.markup}</svg>`;
}

function renderGlyphs(glyphs, label = "Quick picks") {
  const results = $("#glyph-results");
  if (!glyphs.length) {
    results.innerHTML = '<div class="glyph-empty">No glyphs found. Try another search term.</div>';
  } else {
    results.innerHTML = glyphs.map((glyph) => `<button class="glyph-button${state.glyph.id === glyph.id ? " active" : ""}" data-glyph="${escapeXml(glyph.id)}" type="button" title="${escapeXml(glyph.name)}" aria-label="Use ${escapeXml(glyph.name)}">${glyphPreview(glyph)}</button>`).join("");
  }
  $("#results-info").textContent = label;
}

function normalizeQuery(query) {
  const clean = query.trim().toLowerCase();
  return aliases[clean] || clean;
}

async function searchIcons(rawQuery) {
  const query = normalizeQuery(rawQuery);
  if (query.length < 2) {
    renderGlyphs(builtIns);
    return;
  }
  const prefixes = state.source === "all" ? Object.keys(sources).join(",") : state.source;
  const cacheKey = `${prefixes}:${query}`;
  if (searchCache.has(cacheKey)) {
    renderGlyphs(searchCache.get(cacheKey), `Results for “${rawQuery.trim()}”`);
    return;
  }
  searchController?.abort();
  searchController = new AbortController();
  $("#search-spinner").hidden = false;
  try {
    const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefixes=${encodeURIComponent(prefixes)}&limit=64`;
    const response = await fetch(url, { signal: searchController.signal });
    if (!response.ok) throw new Error("search failed");
    const data = await response.json();
    const glyphs = (data.icons || []).map((id) => {
      const [prefix, ...nameParts] = id.split(":");
      return { id, name: nameParts.join(":"), prefix, remote: true };
    });
    searchCache.set(cacheKey, glyphs);
    renderGlyphs(glyphs, `${glyphs.length} results for “${rawQuery.trim()}”`);
  } catch (error) {
    if (error.name !== "AbortError") {
      renderGlyphs([], "Search unavailable");
      notify("The glyph catalog is unavailable right now.");
    }
  } finally {
    $("#search-spinner").hidden = true;
  }
}

function sanitizeSvg(source) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(source, "image/svg+xml");
  const root = documentNode.documentElement;
  if (root.tagName.toLowerCase() !== "svg" || documentNode.querySelector("parsererror")) return null;
  const allowed = new Set(["svg", "g", "path", "circle", "rect", "ellipse", "polygon", "polyline", "line"]);
  [...documentNode.querySelectorAll("*")].forEach((node) => {
    if (!allowed.has(node.tagName.toLowerCase())) {
      node.remove();
      return;
    }
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "href" || name === "xlink:href" || value.includes("url(") || value.includes("javascript:")) {
        node.removeAttribute(attribute.name);
      } else if ((name === "fill" || name === "stroke") && value !== "none") {
        node.setAttribute(attribute.name, "currentColor");
      }
    });
  });
  const viewBox = root.getAttribute("viewBox") || `0 0 ${parseFloat(root.getAttribute("width")) || 24} ${parseFloat(root.getAttribute("height")) || 24}`;
  return { viewBox, markup: root.innerHTML };
}

function sanitizeShapeSvg(source) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(source, "image/svg+xml");
  const root = documentNode.documentElement;
  if (root.tagName.toLowerCase() !== "svg" || documentNode.querySelector("parsererror")) return null;
  const allowed = new Set(["svg", "g", "path", "circle", "rect", "ellipse", "polygon"]);
  [...documentNode.querySelectorAll("*")].forEach((node) => {
    if (!allowed.has(node.tagName.toLowerCase())) {
      node.remove();
      return;
    }
    [...node.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase();
      if (name.startsWith("on") || ["style", "href", "xlink:href", "filter", "mask", "clip-path"].includes(name) || value.includes("url(") || value.includes("javascript:")) {
        node.removeAttribute(attribute.name);
      } else if (["fill", "stroke", "color", "opacity"].includes(name)) {
        node.removeAttribute(attribute.name);
      }
    });
  });
  const viewBox = root.getAttribute("viewBox") || `0 0 ${parseFloat(root.getAttribute("width")) || 64} ${parseFloat(root.getAttribute("height")) || 64}`;
  const values = viewBox.split(/[ ,]+/).map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite) || values[2] <= 0 || values[3] <= 0 || !root.innerHTML.trim()) return null;
  return { viewBox: values.join(" "), markup: root.innerHTML };
}

async function selectGlyph(glyph) {
  if (!glyph.remote) {
    state.glyph = glyph;
    glyphSelected(glyph);
    return;
  }
  try {
    let parsed = glyphCache.get(glyph.id);
    if (!parsed) {
      const response = await fetch(iconifyUrl(glyph.id));
      if (!response.ok) throw new Error("icon failed");
      parsed = sanitizeSvg(await response.text());
      if (!parsed) throw new Error("invalid icon");
      glyphCache.set(glyph.id, parsed);
    }
    state.glyph = { ...glyph, ...parsed };
    glyphSelected(state.glyph);
  } catch {
    notify("This glyph could not be loaded.");
  }
}

function glyphSelected(glyph) {
  $$(".glyph-button").forEach((button) => button.classList.toggle("active", button.dataset.glyph === glyph.id));
  const source = glyph.prefix && sources[glyph.prefix] ? sources[glyph.prefix].label : "Built-in glyph";
  $("#selected-source").textContent = source;
  setStatus(`Glyph: ${glyph.name}`);
  render();
}

async function importSvg(file) {
  if (!file || !file.name.toLowerCase().endsWith(".svg")) {
    notify("Choose an SVG file.");
    return;
  }
  const parsed = sanitizeSvg(await file.text());
  if (!parsed) {
    notify("This SVG could not be read.");
    return;
  }
  const name = file.name.replace(/\.svg$/i, "");
  state.glyph = { id: `custom:${name}`, name, ...parsed };
  $("#selected-source").textContent = "Imported SVG";
  setStatus(`Imported: ${file.name}`);
  render();
}

async function importShape(file) {
  if (!file || !file.name.toLowerCase().endsWith(".svg")) {
    notify("Choose an SVG silhouette.");
    return;
  }
  const parsed = sanitizeShapeSvg(await file.text());
  if (!parsed) {
    notify("This shape could not be read. Use a filled SVG silhouette.");
    return;
  }
  state.customShape = { name: file.name.replace(/\.svg$/i, ""), ...parsed };
  state.template = "custom";
  const option = $("#custom-shape-option");
  option.hidden = false;
  option.querySelector("strong").textContent = state.customShape.name;
  $$('[data-template]').forEach((button) => {
    const active = button.dataset.template === "custom";
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  render();
  notify(`Shape imported: ${file.name}`);
}

function setStatus(message) {
  $("#status").textContent = message;
}

function notify(message) {
  setStatus(message);
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}

function download(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportSvg() {
  download(`${fileName()}.svg`, buildSvg(), "image/svg+xml;charset=utf-8");
  notify("SVG 64 × 64 downloaded.");
}

function exportPng(size) {
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
      if (blob) download(`${fileName()}-${size}.png`, blob, "image/png");
    }, "image/png");
    URL.revokeObjectURL(source);
    notify(`PNG ${size} × ${size} downloaded.`);
  };
  image.onerror = () => {
    URL.revokeObjectURL(source);
    notify("The PNG could not be generated.");
  };
  image.src = source;
}

function resetTransform() {
  state.x = 0;
  state.y = 0;
  state.scale = 1;
  state.rotation = 0;
  $("#glyph-x").value = 0;
  $("#glyph-y").value = 0;
  $("#glyph-scale").value = 100;
  $("#glyph-rotation").value = 0;
  render();
  setStatus("Glyph centered");
}

function resetAll() {
  state.template = "bevel";
  state.palette = { ...palettes[0] };
  state.glyph = builtIns[0];
  state.source = "all";
  state.preview = "grid";
  state.customShape = null;
  state.showText = false;
  state.text = "ICON";
  state.textMode = "band";
  state.textSize = 8.75;
  resetTransform();
  $("#icon-search").value = "";
  $("#show-text").checked = false;
  $("#label-text").value = "ICON";
  $("#text-size").value = "8.75";
  $("#text-controls").hidden = true;
  $("#band-color-row").hidden = false;
  $("#custom-shape-option").hidden = true;
  $$("[data-template]").forEach((button) => {
    const active = button.dataset.template === "bevel";
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  $$("[data-source]").forEach((button) => button.classList.toggle("active", button.dataset.source === "all"));
  $$("[data-preview]").forEach((button) => button.classList.toggle("active", button.dataset.preview === "grid"));
  $$("[data-text-mode]").forEach((button) => button.classList.toggle("active", button.dataset.textMode === "band"));
  $(".preview-area").classList.remove("light", "dark");
  renderPalettes();
  renderGlyphs(builtIns);
  glyphSelected(state.glyph);
  notify("Editor reset.");
}

renderPalettes();
renderGlyphs(builtIns);
render();

$("#palette-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-palette]");
  if (!button) return;
  const index = Number(button.dataset.palette);
  state.palette = { ...palettes[index] };
  $$(".palette-swatch").forEach((item) => item.classList.toggle("active", item === button));
  render();
});

[$("#color-background"), $("#color-glyph"), $("#color-outline"), $("#color-band"), $("#color-text")].forEach((input) => {
  input.addEventListener("input", () => {
    const key = input.id.replace("color-", "");
    state.palette = { ...state.palette, name: "Custom", [key]: input.value.toUpperCase() };
    $$(".palette-swatch").forEach((item) => item.classList.remove("active"));
    render();
  });
});

$(".template-picker").addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button) return;
  state.template = button.dataset.template;
  $$("[data-template]").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-checked", String(active));
  });
  render();
});

$("#source-filter").addEventListener("click", (event) => {
  const button = event.target.closest("[data-source]");
  if (!button) return;
  state.source = button.dataset.source;
  $$("[data-source]").forEach((item) => item.classList.toggle("active", item === button));
  searchIcons($("#icon-search").value);
});

$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(searchTimer);
  searchIcons($("#icon-search").value);
});

$("#icon-search").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchIcons(event.target.value), 280);
});

$("#glyph-results").addEventListener("click", (event) => {
  const button = event.target.closest("[data-glyph]");
  if (!button) return;
  const local = builtIns.find((glyph) => glyph.id === button.dataset.glyph);
  const remote = !local ? { id: button.dataset.glyph, name: button.dataset.glyph.split(":").slice(1).join(":"), prefix: button.dataset.glyph.split(":")[0], remote: true } : null;
  selectGlyph(local || remote);
});

const rangeBindings = [
  ["#glyph-x", "x", (value) => Number(value)],
  ["#glyph-y", "y", (value) => Number(value)],
  ["#glyph-scale", "scale", (value) => Number(value) / 100],
  ["#glyph-rotation", "rotation", (value) => Number(value)]
];
rangeBindings.forEach(([selector, key, parse]) => {
  $(selector).addEventListener("input", (event) => {
    state[key] = parse(event.target.value);
    render();
  });
});

$("#background-switch").addEventListener("click", (event) => {
  const button = event.target.closest("[data-preview]");
  if (!button) return;
  state.preview = button.dataset.preview;
  $$("[data-preview]").forEach((item) => item.classList.toggle("active", item === button));
  $(".preview-area").classList.toggle("light", state.preview === "light");
  $(".preview-area").classList.toggle("dark", state.preview === "dark");
});

$("#import-button").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", (event) => {
  importSvg(event.target.files?.[0]);
  event.target.value = "";
});
$("#import-shape-button").addEventListener("click", () => $("#shape-file-input").click());
$("#shape-file-input").addEventListener("change", (event) => {
  importShape(event.target.files?.[0]);
  event.target.value = "";
});
$("#show-text").addEventListener("change", (event) => {
  state.showText = event.target.checked;
  $("#text-controls").hidden = !state.showText;
  render();
});
$("#label-text").addEventListener("input", (event) => {
  state.text = event.target.value;
  render();
});
$("#text-mode").addEventListener("click", (event) => {
  const button = event.target.closest("[data-text-mode]");
  if (!button) return;
  state.textMode = button.dataset.textMode;
  $$("[data-text-mode]").forEach((item) => item.classList.toggle("active", item === button));
  $("#band-color-row").hidden = state.textMode !== "band";
  render();
});
$("#text-size").addEventListener("input", (event) => {
  state.textSize = Number(event.target.value);
  render();
});
$("#reset-transform").addEventListener("click", resetTransform);
$("#reset-all").addEventListener("click", resetAll);
$("#export-svg").addEventListener("click", exportSvg);
$("#export-svg-top").addEventListener("click", exportSvg);
$$('[data-png]').forEach((button) => button.addEventListener("click", () => exportPng(Number(button.dataset.png))));

let dragDepth = 0;
window.addEventListener("dragenter", (event) => {
  event.preventDefault();
  dragDepth += 1;
  $(".preview-area").classList.add("dragging");
});
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("dragleave", (event) => {
  event.preventDefault();
  dragDepth -= 1;
  if (dragDepth <= 0) $(".preview-area").classList.remove("dragging");
});
window.addEventListener("drop", (event) => {
  event.preventDefault();
  dragDepth = 0;
  $(".preview-area").classList.remove("dragging");
  importSvg(event.dataTransfer?.files?.[0]);
});

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    exportSvg();
  }
});
