"use strict";

const palettes = [
  { name: "Blue", background: "#4D87ED", glyph: "#FFFFFF", outline: "#315DA4", band: "#3C70CE", text: "#FFFFFF" },
  { name: "Indigo", background: "#5965E8", glyph: "#FFFFFF", outline: "#39439E", band: "#4651C2", text: "#FFFFFF" },
  { name: "Cyan", background: "#27B7D6", glyph: "#FFFFFF", outline: "#14788E", band: "#1D91AA", text: "#FFFFFF" },
  { name: "Teal", background: "#27AE96", glyph: "#FFFFFF", outline: "#176F61", band: "#208B78", text: "#FFFFFF" },
  { name: "Green", background: "#52B86A", glyph: "#FFFFFF", outline: "#2E7840", band: "#3E9653", text: "#FFFFFF" },
  { name: "Lime", background: "#A8D64F", glyph: "#1D2812", outline: "#688C29", band: "#87B43B", text: "#1D2812" },
  { name: "Amber", background: "#F3C744", glyph: "#262719", outline: "#9A7720", band: "#D2A72D", text: "#262719" },
  { name: "Orange", background: "#F28A3C", glyph: "#FFFFFF", outline: "#A5521E", band: "#CE6C29", text: "#FFFFFF" },
  { name: "Red", background: "#ED3454", glyph: "#FFFFFF", outline: "#9F1D35", band: "#C52945", text: "#FFFFFF" },
  { name: "Rose", background: "#E94F71", glyph: "#FFFFFF", outline: "#983047", band: "#C33E5B", text: "#FFFFFF" },
  { name: "Pink", background: "#F34F8C", glyph: "#FFFFFF", outline: "#A92E60", band: "#C53870", text: "#FFFFFF" },
  { name: "Violet", background: "#9362DB", glyph: "#FFFFFF", outline: "#633AA2", band: "#7448B7", text: "#FFFFFF" },
  { name: "Slate", background: "#566173", glyph: "#FFFFFF", outline: "#303947", band: "#414B5B", text: "#FFFFFF" },
  { name: "Ghost", background: "#DDE8F080", glyph: "#FFFFFFFF", outline: "#AABBC8B8", band: "#26384CB8", text: "#FFFFFFFF" }
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

const vectorFont = {
  A: "01110/10001/10001/11111/10001/10001/10001", B: "11110/10001/10001/11110/10001/10001/11110",
  C: "01111/10000/10000/10000/10000/10000/01111", D: "11110/10001/10001/10001/10001/10001/11110",
  E: "11111/10000/10000/11110/10000/10000/11111", F: "11111/10000/10000/11110/10000/10000/10000",
  G: "01111/10000/10000/10111/10001/10001/01111", H: "10001/10001/10001/11111/10001/10001/10001",
  I: "11111/00100/00100/00100/00100/00100/11111", J: "00111/00010/00010/00010/10010/10010/01100",
  K: "10001/10010/10100/11000/10100/10010/10001", L: "10000/10000/10000/10000/10000/10000/11111",
  M: "10001/11011/10101/10101/10001/10001/10001", N: "10001/11001/10101/10011/10001/10001/10001",
  O: "01110/10001/10001/10001/10001/10001/01110", P: "11110/10001/10001/11110/10000/10000/10000",
  Q: "01110/10001/10001/10001/10101/10010/01101", R: "11110/10001/10001/11110/10100/10010/10001",
  S: "01111/10000/10000/01110/00001/00001/11110", T: "11111/00100/00100/00100/00100/00100/00100",
  U: "10001/10001/10001/10001/10001/10001/01110", V: "10001/10001/10001/10001/10001/01010/00100",
  W: "10001/10001/10001/10101/10101/10101/01010", X: "10001/10001/01010/00100/01010/10001/10001",
  Y: "10001/10001/01010/00100/00100/00100/00100", Z: "11111/00001/00010/00100/01000/10000/11111",
  0: "01110/10001/10011/10101/11001/10001/01110", 1: "00100/01100/00100/00100/00100/00100/01110",
  2: "01110/10001/00001/00010/00100/01000/11111", 3: "11110/00001/00001/01110/00001/00001/11110",
  4: "00010/00110/01010/10010/11111/00010/00010", 5: "11111/10000/10000/11110/00001/00001/11110",
  6: "01110/10000/10000/11110/10001/10001/01110", 7: "11111/00001/00010/00100/01000/01000/01000",
  8: "01110/10001/10001/01110/10001/10001/01110", 9: "01110/10001/10001/01111/00001/00001/01110",
  "-": "00000/00000/00000/11111/00000/00000/00000", ".": "00000/00000/00000/00000/00000/00110/00110",
  "_": "00000/00000/00000/00000/00000/00000/11111", "?": "01110/10001/00001/00010/00100/00000/00100",
  " ": "00000/00000/00000/00000/00000/00000/00000"
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
  textSize: 8.75,
  outlineEnabled: true
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

function normalizeHex(value) {
  const raw = String(value).trim().replace(/^#/, "");
  if (!/^(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) return null;
  return `#${raw.toUpperCase()}`;
}

function rgbPart(value) {
  return normalizeHex(value)?.slice(0, 7) || "#000000";
}

function alphaPart(value) {
  const normalized = normalizeHex(value);
  return normalized?.length === 9 ? normalized.slice(7) : "";
}

function precise(value) {
  return Number(Number(value).toFixed(2));
}

function pointString(value) {
  const number = Math.max(0, Math.min(64, Number(value)));
  return Number(number.toFixed(3));
}

function cssPaint(value) {
  const text = String(value || "none").trim().toLowerCase();
  if (text === "none") return { color: "none", opacity: 1 };
  const hex = normalizeHex(text);
  if (hex) {
    const alpha = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1;
    return { color: hex.slice(0, 7), opacity: alpha };
  }
  const match = text.match(/^rgba?\(([^)]+)\)$/);
  if (match) {
    const values = match[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    const color = `#${values.slice(0, 3).map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
    return { color, opacity: Number.isFinite(values[3]) ? values[3] : 1 };
  }
  return { color: "#000000", opacity: 1 };
}

function hexPaint(value) {
  const normalized = normalizeHex(value) || "#000000";
  return {
    color: normalized.slice(0, 7),
    opacity: normalized.length === 9 ? parseInt(normalized.slice(7), 16) / 255 : 1
  };
}

function cumulativeOpacity(element) {
  let opacity = 1;
  let node = element;
  while (node instanceof Element && node.tagName.toLowerCase() !== "body") {
    const own = node.getAttribute("opacity");
    if (own !== null && Number.isFinite(Number(own))) opacity *= Number(own);
    node = node.parentElement;
  }
  return opacity;
}

function transformPoint(point, matrix) {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f
  };
}

function closeEnough(a, b, tolerance = .35) {
  return Math.hypot(a.x - b.x, a.y - b.y) <= tolerance;
}

function pointsToPath(subpaths, closePath = true) {
  return subpaths.filter((points) => points.length > 1).map((points) => {
    const commands = points.map((point, index) => `${index ? "L" : "M"}${pointString(point.x)} ${pointString(point.y)}`);
    if (closePath && !closeEnough(points[0], points[points.length - 1])) commands.push("Z");
    else if (closePath) commands.push("Z");
    return commands.join("");
  }).join("");
}

function sampleGeometry(element) {
  if (typeof element.getTotalLength !== "function" || typeof element.getPointAtLength !== "function" || typeof element.getCTM !== "function") {
    throw new Error("This browser does not expose SVG geometry APIs required for Unity export.");
  }
  const matrix = element.getCTM();
  if (!matrix) return [];
  const scale = Math.max(.001, Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c)));
  const total = element.getTotalLength();
  const localStep = Math.max(.08, .22 / scale);
  const count = Math.max(2, Math.ceil(total / localStep));
  const subpaths = [];
  let current = [];
  let previous = null;
  for (let index = 0; index <= count; index += 1) {
    const point = transformPoint(element.getPointAtLength(total * index / count), matrix);
    if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) > 2.2) {
      if (current.length > 1) subpaths.push(current);
      current = [];
    }
    current.push(point);
    previous = point;
  }
  if (current.length > 1) subpaths.push(current);
  return subpaths;
}

function explicitPath(d, fill, stroke = { color: "none", opacity: 1 }, options = {}) {
  const hasFill = fill.color !== "none";
  const hasStroke = stroke.color !== "none";
  const fillOpacity = hasFill ? precise((fill.opacity ?? 1) * (options.opacity ?? 1) * (options.fillOpacity ?? 1)) : 0;
  const strokeOpacity = hasStroke ? precise((stroke.opacity ?? 1) * (options.opacity ?? 1) * (options.strokeOpacity ?? 1)) : 0;
  return `<path d="${d}" fill="${hasFill ? fill.color : "#000000"}" fill-opacity="${fillOpacity}" fill-rule="${options.fillRule || "nonzero"}" stroke="${hasStroke ? stroke.color : "#000000"}" stroke-opacity="${strokeOpacity}" stroke-width="${hasStroke ? options.strokeWidth || 0 : 0}" stroke-linecap="${options.linecap || "butt"}" stroke-linejoin="${options.linejoin || "miter"}" opacity="1"/>`;
}

function flattenSvg(source) {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-10000px;top:-10000px;width:64px;height:64px;visibility:hidden;pointer-events:none";
  host.innerHTML = source;
  document.body.append(host);
  try {
    return [...host.querySelectorAll("path,rect,circle,ellipse,line,polyline,polygon")]
      .filter((element) => !element.closest("defs,clipPath,mask,pattern,symbol"))
      .map((element) => {
        const style = getComputedStyle(element);
        const matrix = element.getCTM();
        const scale = matrix ? Math.max(.001, Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c))) : 1;
        const fill = cssPaint(style.fill);
        const stroke = cssPaint(style.stroke);
        const filled = fill.color !== "none";
        const tag = element.tagName.toLowerCase();
        const closed = filled || ["rect", "circle", "ellipse", "polygon"].includes(tag) || /z\s*$/i.test(element.getAttribute("d") || "");
        const subpaths = sampleGeometry(element);
        return {
          subpaths,
          d: pointsToPath(subpaths, closed),
          fill,
          stroke,
          options: {
            opacity: cumulativeOpacity(element),
            fillOpacity: Number.isFinite(Number(style.fillOpacity)) ? Number(style.fillOpacity) : 1,
            strokeOpacity: Number.isFinite(Number(style.strokeOpacity)) ? Number(style.strokeOpacity) : 1,
            fillRule: style.fillRule === "evenodd" ? "evenodd" : "nonzero",
            strokeWidth: stroke.color === "none" ? 0 : precise((parseFloat(style.strokeWidth) || 1) * scale),
            linecap: ["butt", "round", "square"].includes(style.strokeLinecap) ? style.strokeLinecap : "butt",
            linejoin: ["miter", "round", "bevel"].includes(style.strokeLinejoin) ? style.strokeLinejoin : "miter"
          }
        };
      }).filter((geometry) => geometry.d);
  } finally {
    host.remove();
  }
}

function clipPolygonBelow(points, minimumY) {
  if (points.length < 3) return [];
  const output = [];
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const previous = points[(index + points.length - 1) % points.length];
    const currentInside = current.y >= minimumY;
    const previousInside = previous.y >= minimumY;
    if (currentInside !== previousInside) {
      const amount = (minimumY - previous.y) / (current.y - previous.y);
      output.push({ x: previous.x + (current.x - previous.x) * amount, y: minimumY });
    }
    if (currentInside) output.push(current);
  }
  return output;
}

function offsetSubpaths(subpaths, x, y) {
  return subpaths.map((points) => points.map((point) => ({ x: point.x + x, y: point.y + y })));
}

function horizontalBounds(subpaths, startY = 48, endY = 57) {
  let left = 5.5;
  let right = 58.5;
  for (let y = startY; y <= endY; y += 1) {
    const intersections = [];
    subpaths.forEach((points) => {
      for (let index = 0; index < points.length; index += 1) {
        const a = points[index];
        const b = points[(index + 1) % points.length];
        if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) intersections.push(a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y));
      }
    });
    intersections.sort((a, b) => a - b);
    for (let index = 0; index + 1 < intersections.length; index += 2) {
      if (intersections[index] <= 32 && intersections[index + 1] >= 32) {
        left = Math.max(left, intersections[index]);
        right = Math.min(right, intersections[index + 1]);
        break;
      }
    }
  }
  return { left, right };
}

function vectorLabelPath(label, bounds) {
  const characters = label.toUpperCase().slice(0, 18).split("");
  if (!characters.length) return "";
  const available = Math.max(8, Math.min(45, bounds.right - bounds.left - 2));
  const nominalCell = state.textSize / 7;
  const nominalWidth = characters.length * 5 * nominalCell + Math.max(0, characters.length - 1) * nominalCell;
  const cell = nominalCell * Math.min(1, available / Math.max(1, nominalWidth));
  const totalWidth = characters.length * 5 * cell + Math.max(0, characters.length - 1) * cell;
  const startX = (bounds.left + bounds.right - totalWidth) / 2;
  const startY = 47.7 + (9 - state.textSize) * .45;
  const inset = Math.min(.12, cell * .12);
  const commands = [];
  characters.forEach((character, characterIndex) => {
    const rows = (vectorFont[character] || vectorFont["?"]).split("/");
    rows.forEach((row, rowIndex) => [...row].forEach((pixel, columnIndex) => {
      if (pixel !== "1") return;
      const x = startX + characterIndex * 6 * cell + columnIndex * cell + inset;
      const y = startY + rowIndex * cell + inset;
      const width = Math.max(.15, cell - inset * 2);
      commands.push(`M${pointString(x)} ${pointString(y)}h${pointString(width)}v${pointString(width)}h-${pointString(width)}Z`);
    }));
  });
  return commands.join("");
}

function unityShapeGeometry() {
  const markup = state.template === "custom" && state.customShape
    ? shapeContent("body")
    : `<path d="${shapes[state.template] || shapes.bevel}" fill="#FFFFFF" stroke="none"/>`;
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${markup}</svg>`;
  return flattenSvg(source);
}

function unityGlyphPaths() {
  const size = 30 * state.scale;
  const x = 32 - size / 2 + state.x;
  const centerY = state.showText ? 25 : 32;
  const y = centerY - size / 2 + state.y;
  const color = normalizeHex(state.palette.glyph) || "#FFFFFF";
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g color="${color}" fill="currentColor" transform="rotate(${state.rotation} 32 ${centerY})"><svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${escapeXml(state.glyph.viewBox)}" fill="currentColor">${state.glyph.markup}</svg></g></svg>`;
  return flattenSvg(source).map((geometry) => explicitPath(geometry.d, geometry.fill, geometry.stroke, geometry.options)).join("");
}

function validateUnitySvg(svg) {
  const forbidden = [/<text\b/i, /<svg\b[^>]*<svg\b/is, /<defs\b/i, /clip-path/i, /currentColor/i, /\btransform=/i, /\bclass=/i, /<style\b/i, /<use\b/i, /<symbol\b/i, /<image\b/i, /preserveAspectRatio/i, /\boverflow=/i];
  return (svg.match(/<svg\b/gi) || []).length === 1 && !forbidden.some((pattern) => pattern.test(svg));
}

function buildUnitySvg() {
  const geometries = unityShapeGeometry();
  if (!geometries.length) throw new Error("The selected shape has no exportable geometry.");
  const subpaths = geometries.flatMap((geometry) => geometry.subpaths);
  const shapePath = pointsToPath(subpaths, true);
  const shadowPath = pointsToPath(offsetSubpaths(subpaths, .8, .8), true);
  const background = hexPaint(state.palette.background);
  const outline = hexPaint(state.palette.outline);
  const band = hexPaint(state.palette.band);
  const text = hexPaint(state.palette.text);
  const bandPath = state.showText && state.textMode === "band"
    ? pointsToPath(subpaths.map((points) => clipPolygonBelow(points, 45)).filter((points) => points.length > 2), true)
    : "";
  const bounds = horizontalBounds(subpaths);
  const labelPath = state.showText ? vectorLabelPath(state.text.trim(), bounds) : "";
  const body = explicitPath(shapePath, background);
  const shadow = explicitPath(shadowPath, { color: "#000000", opacity: .26 });
  const bandLayer = bandPath ? explicitPath(bandPath, band) : "";
  const glyph = unityGlyphPaths();
  const label = labelPath ? explicitPath(labelPath, text) : "";
  const outlineLayer = state.outlineEnabled ? explicitPath(shapePath, { color: "none", opacity: 1 }, outline, { strokeWidth: 1.5, linejoin: "round" }) : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${shadow}${body}${glyph}${bandLayer}${label}${outlineLayer}</svg>`;
  if (!validateUnitySvg(svg)) throw new Error("Unity SVG validation rejected an unsupported construct.");
  return svg;
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
  return state.outlineEnabled ? shapeContent("outline") : "";
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
    $(`#color-${key}`).value = rgbPart(state.palette[key]);
    const hexInput = $(`#hex-${key}`);
    if (document.activeElement !== hexInput) hexInput.value = state.palette[key];
    hexInput.classList.remove("invalid");
  });
  $("#show-outline").checked = state.outlineEnabled;
  $("#outline-color-row").classList.toggle("disabled", !state.outlineEnabled);
  $("#color-outline").disabled = !state.outlineEnabled;
  $("#hex-outline").disabled = !state.outlineEnabled;
}

function updateRangeOutputs() {
  const values = {
    x: state.x,
    y: state.y,
    scale: precise(state.scale * 100),
    rotation: state.rotation,
    "text-size": state.textSize
  };
  Object.entries(values).forEach(([key, value]) => {
    const range = key === "text-size" ? $("#text-size") : $(`#glyph-${key}`);
    const exact = $(`#exact-${key}`);
    range.value = value;
    if (document.activeElement !== exact) exact.value = value;
  });
}

function renderPalettes() {
  $("#palette-list").innerHTML = palettes.map((palette, index) => `<button class="palette-swatch${index === 0 ? " active" : ""}" data-palette="${index}" type="button" title="${palette.name}" aria-label="${palette.name} palette" style="--swatch:${palette.background}"></button>`).join("");
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
  try {
    download(`${fileName()}.svg`, buildUnitySvg(), "image/svg+xml;charset=utf-8");
    notify("Unity-compatible SVG 64 × 64 downloaded.");
  } catch (error) {
    notify(error.message || "The Unity-compatible SVG could not be generated.");
  }
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
  state.outlineEnabled = true;
  resetTransform();
  $("#icon-search").value = "";
  $("#show-text").checked = false;
  $("#label-text").value = "ICON";
  $("#text-size").value = "8.75";
  $("#show-outline").checked = true;
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

[$("#color-background"), $("#color-glyph"), $("#color-outline"), $("#color-band"), $("#color-text")].forEach((picker) => {
  picker.addEventListener("input", () => {
    const key = picker.id.replace("color-", "");
    const value = `${picker.value.toUpperCase()}${alphaPart(state.palette[key])}`;
    state.palette = { ...state.palette, name: "Custom", [key]: value };
    $$(".palette-swatch").forEach((item) => item.classList.remove("active"));
    render();
  });
});

$$('.hex-input').forEach((input) => {
  const key = input.id.replace("hex-", "");
  input.addEventListener("input", () => {
    const value = normalizeHex(input.value);
    input.classList.toggle("invalid", !value);
    if (!value) return;
    state.palette = { ...state.palette, name: "Custom", [key]: value };
    $$(".palette-swatch").forEach((item) => item.classList.remove("active"));
    render();
  });
  input.addEventListener("blur", () => {
    input.value = state.palette[key];
    input.classList.remove("invalid");
  });
});

$("#show-outline").addEventListener("change", (event) => {
  state.outlineEnabled = event.target.checked;
  render();
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
  ["#glyph-x", "#exact-x", "x", (value) => precise(value)],
  ["#glyph-y", "#exact-y", "y", (value) => precise(value)],
  ["#glyph-scale", "#exact-scale", "scale", (value) => precise(value) / 100],
  ["#glyph-rotation", "#exact-rotation", "rotation", (value) => precise(value)],
  ["#text-size", "#exact-text-size", "textSize", (value) => precise(value)]
];
rangeBindings.forEach(([rangeSelector, exactSelector, key, parse]) => {
  const range = $(rangeSelector);
  const exact = $(exactSelector);
  const apply = (rawValue) => {
    if (rawValue === "" || !Number.isFinite(Number(rawValue))) return;
    const value = Math.min(Number(range.max), Math.max(Number(range.min), Number(rawValue)));
    state[key] = parse(value);
    render();
  };
  range.addEventListener("input", (event) => apply(event.target.value));
  exact.addEventListener("input", (event) => apply(event.target.value));
  exact.addEventListener("blur", () => updateRangeOutputs());
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
