"use strict";

const palettes = [
  { name: "Branco", background: "#F6F6F2", glyph: "#242722", outline: "#9B9E96", fold: "#FFFFFF" },
  { name: "Azul", background: "#4D87ED", glyph: "#FFFFFF", outline: "#315DA4", fold: "#7AA6F2" },
  { name: "Rosa", background: "#F34F8C", glyph: "#FFFFFF", outline: "#A92E60", fold: "#F77AAA" },
  { name: "Roxo", background: "#9362DB", glyph: "#FFFFFF", outline: "#633AA2", fold: "#B48AEB" },
  { name: "Vermelho", background: "#ED3454", glyph: "#FFFFFF", outline: "#9F1D35", fold: "#F16B82" },
  { name: "Amarelo", background: "#F3C744", glyph: "#262719", outline: "#9A7720", fold: "#FFE17D" }
];

const builtIns = [
  { id: "local:nodes", name: "state", viewBox: "0 0 24 24", markup: '<path d="M6.5 7.5 17.5 6M6.8 8.3l10.4 9.3M18 7.7v8.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="5" cy="8" r="3"/><circle cx="19" cy="6" r="3"/><circle cx="18" cy="18" r="3"/>' },
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
  arma: "sword", weapon: "sword", espada: "sword", som: "sound", audio: "speaker", pasta: "folder",
  estado: "state", alvo: "target", jogador: "player", efeito: "sparkles", correr: "run",
  controle: "controller", máquina: "machine", maquina: "machine", câmera: "camera", camera: "camera"
};

const state = {
  template: "clean",
  palette: { ...palettes[0] },
  glyph: builtIns[0],
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
  source: "all",
  preview: "grid"
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

function templateMarkup() {
  const p = state.palette;
  if (state.template === "folded") {
    return `<path d="M12.5 4H43.3L60 20.7v30.8A9.5 9.5 0 0 1 50.5 61H12.5A9.5 9.5 0 0 1 3 51.5v-38A9.5 9.5 0 0 1 12.5 4Z" fill="#111710" opacity=".16"/><path d="M12.5 2.5h31L61.5 20.5v30A10.5 10.5 0 0 1 51 61H13A10.5 10.5 0 0 1 2.5 50.5V13A10.5 10.5 0 0 1 13 2.5Z" fill="${p.background}" stroke="${p.outline}" stroke-width="1.5" stroke-linejoin="round"/><path d="M43.5 2.5v10.8a7.2 7.2 0 0 0 7.2 7.2h10.8l-18-18Z" fill="${p.fold}" stroke="${p.outline}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  return `<rect x="3.8" y="4.2" width="57.2" height="57.2" rx="11" fill="#111710" opacity=".16"/><rect x="2.5" y="2.5" width="58.5" height="58.5" rx="11" fill="${p.background}" stroke="${p.outline}" stroke-width="1.5"/>`;
}

function buildSvg() {
  const size = 30 * state.scale;
  const x = 32 - size / 2 + state.x;
  const y = 32 - size / 2 + state.y;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><title>${escapeXml(state.glyph.name)} Unity script icon</title>${templateMarkup()}<g color="${state.palette.glyph}" transform="rotate(${state.rotation} 32 32)"><svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(state.glyph.viewBox)}" overflow="visible" fill="currentColor" color="${state.palette.glyph}" preserveAspectRatio="xMidYMid meet">${state.glyph.markup}</svg></g></svg>`;
}

function render() {
  const svg = buildSvg();
  $("#main-icon").innerHTML = svg;
  $$(".size-icon").forEach((node) => { node.innerHTML = svg; });
  $("#palette-name").textContent = state.palette.name;
  $("#fold-color-row").hidden = state.template !== "folded";
  updateColorControls();
  updateRangeOutputs();
}

function updateColorControls() {
  ["background", "glyph", "outline", "fold"].forEach((key) => {
    $(`#color-${key}`).value = state.palette[key];
    $(`#value-${key}`).textContent = state.palette[key];
  });
}

function updateRangeOutputs() {
  $("#value-x").textContent = state.x;
  $("#value-y").textContent = state.y;
  $("#value-scale").textContent = `${Math.round(state.scale * 100)}%`;
  $("#value-rotation").textContent = `${state.rotation}°`;
}

function renderPalettes() {
  $("#palette-list").innerHTML = palettes.map((palette, index) => `<button class="palette-swatch${index === 0 ? " active" : ""}" data-palette="${index}" type="button" title="${palette.name}" aria-label="Paleta ${palette.name}" style="background:${palette.background}"></button>`).join("");
}

function glyphPreview(glyph) {
  if (glyph.remote) {
    return `<img src="${iconifyUrl(glyph.id)}?color=%23343731" alt="" loading="lazy" />`;
  }
  return `<svg viewBox="${glyph.viewBox}" fill="currentColor" color="currentColor" aria-hidden="true">${glyph.markup}</svg>`;
}

function renderGlyphs(glyphs, label = "Atalhos locais") {
  const results = $("#glyph-results");
  if (!glyphs.length) {
    results.innerHTML = '<div class="glyph-empty">Nenhum glyph encontrado. Tente outro termo em inglês ou português.</div>';
  } else {
    results.innerHTML = glyphs.map((glyph) => `<button class="glyph-button${state.glyph.id === glyph.id ? " active" : ""}" data-glyph="${escapeXml(glyph.id)}" type="button" title="${escapeXml(glyph.name)}" aria-label="Usar ${escapeXml(glyph.name)}">${glyphPreview(glyph)}</button>`).join("");
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
    renderGlyphs(searchCache.get(cacheKey), `Resultados para “${rawQuery.trim()}”`);
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
    renderGlyphs(glyphs, `${glyphs.length} resultados para “${rawQuery.trim()}”`);
  } catch (error) {
    if (error.name !== "AbortError") {
      renderGlyphs([], "Busca indisponível");
      notify("Não foi possível consultar os glyphs agora.");
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
    notify("Não foi possível carregar esse glyph.");
  }
}

function glyphSelected(glyph) {
  $$(".glyph-button").forEach((button) => button.classList.toggle("active", button.dataset.glyph === glyph.id));
  const source = glyph.prefix && sources[glyph.prefix] ? sources[glyph.prefix].label : "Glyph próprio";
  $("#selected-source").textContent = source;
  setStatus(`Glyph: ${glyph.name}`);
  render();
}

async function importSvg(file) {
  if (!file || !file.name.toLowerCase().endsWith(".svg")) {
    notify("Escolha um arquivo SVG.");
    return;
  }
  const parsed = sanitizeSvg(await file.text());
  if (!parsed) {
    notify("Esse SVG não pôde ser lido.");
    return;
  }
  const name = file.name.replace(/\.svg$/i, "");
  state.glyph = { id: `custom:${name}`, name, ...parsed };
  $("#selected-source").textContent = "SVG importado";
  setStatus(`Importado: ${file.name}`);
  render();
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
  notify("SVG 64 × 64 baixado.");
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
    notify(`PNG ${size} × ${size} baixado.`);
  };
  image.onerror = () => {
    URL.revokeObjectURL(source);
    notify("Não foi possível gerar o PNG.");
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
  setStatus("Glyph centralizado");
}

function resetAll() {
  state.template = "clean";
  state.palette = { ...palettes[0] };
  state.glyph = builtIns[0];
  state.source = "all";
  state.preview = "grid";
  resetTransform();
  $("#icon-search").value = "";
  $$("[data-template]").forEach((button) => {
    const active = button.dataset.template === "clean";
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  $$("[data-source]").forEach((button) => button.classList.toggle("active", button.dataset.source === "all"));
  $$("[data-preview]").forEach((button) => button.classList.toggle("active", button.dataset.preview === "grid"));
  $(".preview-area").classList.remove("light", "dark");
  renderPalettes();
  renderGlyphs(builtIns);
  glyphSelected(state.glyph);
  notify("Editor restaurado.");
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

[$("#color-background"), $("#color-glyph"), $("#color-outline"), $("#color-fold")].forEach((input) => {
  input.addEventListener("input", () => {
    const key = input.id.replace("color-", "");
    state.palette = { ...state.palette, name: "Personalizada", [key]: input.value.toUpperCase() };
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
