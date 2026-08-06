"use strict";

window.ScriptIconStudioLabelFontReady = (async () => {
  const response = await fetch("./assets/arimo-bold-labels.json?v=1", { cache: "force-cache" });
  if (!response.ok) throw new Error("Label outline data could not be loaded.");
  const font = await response.json();
  if (!font || font.unitsPerEm !== 2048 || !font.glyphs) throw new Error("Label outline data is invalid.");

  const PATH_PARAMETERS = Object.freeze({ M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 });
  const TOKEN_PATTERN = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
  const TRACKING = -0.18;
  const BASELINE_Y = 56.4;

  function numberText(value) {
    const number = Number(value);
    return Number.isFinite(number) ? String(Number(number.toFixed(3))) : "0";
  }

  function parsePathData(source) {
    const tokens = String(source || "").match(TOKEN_PATTERN) || [];
    const commands = [];
    let index = 0;
    let active = "";
    while (index < tokens.length) {
      if (/^[a-zA-Z]$/.test(tokens[index])) active = tokens[index++];
      if (!active) throw new Error("Invalid label path data.");
      const upper = active.toUpperCase();
      const count = PATH_PARAMETERS[upper];
      if (count == null) throw new Error(`Unsupported label path command: ${active}`);
      if (upper === "Z") {
        commands.push({ command: "Z", values: [] });
        active = "";
        continue;
      }
      if (index + count > tokens.length) throw new Error("Incomplete label path data.");
      const values = tokens.slice(index, index + count).map(Number);
      if (!values.every(Number.isFinite)) throw new Error("Invalid label path number.");
      commands.push({ command: active, values });
      index += count;
      if (upper === "M") active = active === "M" ? "L" : "l";
    }
    return commands;
  }

  function transformPathData(source, matrix) {
    const output = [];
    let current = { x: 0, y: 0 };
    let subpathStart = { x: 0, y: 0 };
    const absolutePoint = (x, y, relative) => relative ? { x: current.x + x, y: current.y + y } : { x, y };
    const transformed = (point) => ({
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f
    });
    const appendPoint = (command, point) => {
      const next = transformed(point);
      output.push(`${command}${numberText(next.x)} ${numberText(next.y)}`);
    };

    for (const segment of parsePathData(source)) {
      const command = segment.command;
      const upper = command.toUpperCase();
      const relative = command !== upper;
      const values = segment.values;
      if (upper === "Z") {
        output.push("Z");
        current = { ...subpathStart };
        continue;
      }
      if (upper === "M" || upper === "L" || upper === "T") {
        const point = absolutePoint(values[0], values[1], relative);
        appendPoint(upper, point);
        current = point;
        if (upper === "M") subpathStart = { ...point };
        continue;
      }
      if (upper === "H") {
        const point = { x: relative ? current.x + values[0] : values[0], y: current.y };
        appendPoint("L", point);
        current = point;
        continue;
      }
      if (upper === "V") {
        const point = { x: current.x, y: relative ? current.y + values[0] : values[0] };
        appendPoint("L", point);
        current = point;
        continue;
      }
      if (upper === "C") {
        const first = transformed(absolutePoint(values[0], values[1], relative));
        const second = transformed(absolutePoint(values[2], values[3], relative));
        const endPoint = absolutePoint(values[4], values[5], relative);
        const end = transformed(endPoint);
        output.push(`C${numberText(first.x)} ${numberText(first.y)} ${numberText(second.x)} ${numberText(second.y)} ${numberText(end.x)} ${numberText(end.y)}`);
        current = endPoint;
        continue;
      }
      if (upper === "S" || upper === "Q") {
        const control = transformed(absolutePoint(values[0], values[1], relative));
        const endPoint = absolutePoint(values[2], values[3], relative);
        const end = transformed(endPoint);
        output.push(`${upper}${numberText(control.x)} ${numberText(control.y)} ${numberText(end.x)} ${numberText(end.y)}`);
        current = endPoint;
      }
    }
    return output.join("");
  }

  function glyphFor(character) {
    const normalized = String(character)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
    return font.glyphs[normalized[0]] || font.glyphs["?"];
  }

  function labelGeometry(label, bounds) {
    const characters = String(label || "").slice(0, 18).split("");
    if (!characters.length) return { d: "", width: 0 };
    const glyphs = characters.map(glyphFor);
    const fontSize = Math.max(6, Math.min(12, Number(state.textSize) || 8.75));
    const naturalScale = fontSize / font.unitsPerEm;
    const available = Math.max(8, Math.min(45, bounds.right - bounds.left - 2));
    const advanceUnits = glyphs.reduce((total, glyph) => total + glyph[0], 0);
    const naturalWidth = advanceUnits * naturalScale + Math.max(0, glyphs.length - 1) * TRACKING;
    const fit = Math.min(1, available / Math.max(1, naturalWidth));
    const scaleX = naturalScale * fit;
    const scaleY = naturalScale;
    const tracking = TRACKING * fit;
    const totalWidth = advanceUnits * scaleX + Math.max(0, glyphs.length - 1) * tracking;
    let cursor = (bounds.left + bounds.right - totalWidth) / 2;
    const paths = [];

    for (const glyph of glyphs) {
      if (glyph[1]) paths.push(transformPathData(glyph[1], { a: scaleX, b: 0, c: 0, d: -scaleY, e: cursor, f: BASELINE_Y }));
      cursor += glyph[0] * scaleX + tracking;
    }
    return { d: paths.join(""), width: totalWidth };
  }

  function currentLabelGeometry(bounds) {
    return state.showText && state.text.trim() ? labelGeometry(state.text.trim(), bounds) : { d: "", width: 0 };
  }

  labelMarkup = function vectorLabelMarkup() {
    if (!state.showText || !state.text.trim()) return "";
    const geometry = currentLabelGeometry({ left: 5.5, right: 58.5 });
    const band = state.textMode === "band"
      ? `<rect class="label-band" x="5.5" y="45" width="53" height="17" fill="${state.palette.band}" clip-path="url(#shape-clip)"/>`
      : "";
    const path = geometry.d
      ? `<path class="label-path" d="${geometry.d}" fill="${state.palette.text}" fill-rule="nonzero"/>`
      : "";
    return `${band}<g class="label-text" clip-path="url(#shape-clip)">${path}</g>`;
  };

  buildUnitySvg = function matchingUnitySvg() {
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
    const label = currentLabelGeometry(horizontalBounds(subpaths));
    const body = explicitPath(shapePath, background);
    const shadow = explicitPath(shadowPath, { color: "#000000", opacity: .26 });
    const bandLayer = bandPath ? explicitPath(bandPath, band) : "";
    const glyph = unityGlyphPaths();
    const labelLayer = label.d ? explicitPath(label.d, text) : "";
    const outlineLayer = state.outlineEnabled
      ? explicitPath(shapePath, { color: "none", opacity: 1 }, outline, { strokeWidth: 1.5, linejoin: "round" })
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${shadow}${body}${glyph}${bandLayer}${labelLayer}${outlineLayer}</svg>`;
    if (!validateUnitySvg(svg)) throw new Error("Unity SVG validation rejected an unsupported construct.");
    return svg;
  };

  window.ScriptIconStudioLabelFont = Object.freeze({
    family: "Arimo Bold outlines",
    unitsPerEm: font.unitsPerEm,
    build: labelGeometry
  });

  render();
})();
