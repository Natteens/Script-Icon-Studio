"use strict";

(() => {
  const PATH_PARAMETERS = Object.freeze({ M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 });
  const TOKEN_PATTERN = /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

  const strokeFont = Object.freeze({
    A: { width: 5, path: "M0 7L2.5 0L5 7M1 4.2H4" },
    B: { width: 5, path: "M0 0V7M0 0H2.6Q5 0 5 1.75Q5 3.5 2.6 3.5H0M2.6 3.5Q5 3.5 5 5.25Q5 7 2.6 7H0" },
    C: { width: 5, path: "M5 1Q4 0 2.5 0Q0 0 0 3.5Q0 7 2.5 7Q4 7 5 6" },
    D: { width: 5, path: "M0 0V7M0 0H2.2Q5 0 5 3.5Q5 7 2.2 7H0" },
    E: { width: 5, path: "M5 0H0V7H5M0 3.5H4" },
    F: { width: 5, path: "M0 7V0H5M0 3.5H4" },
    G: { width: 5, path: "M5 1Q4 0 2.5 0Q0 0 0 3.5Q0 7 2.5 7Q4.2 7 5 5.8V4H3.1" },
    H: { width: 5, path: "M0 0V7M5 0V7M0 3.5H5" },
    I: { width: 2.4, path: "M0 0H2.4M1.2 0V7M0 7H2.4" },
    J: { width: 4.5, path: "M4.5 0V5Q4.5 7 2.2 7Q0 7 0 5.5" },
    K: { width: 5, path: "M0 0V7M5 0L0 4M2.1 2.4L5 7" },
    L: { width: 5, path: "M0 0V7H5" },
    M: { width: 6, path: "M0 7V0L3 4L6 0V7" },
    N: { width: 5, path: "M0 7V0L5 7V0" },
    O: { width: 5, path: "M2.5 0Q0 0 0 3.5Q0 7 2.5 7Q5 7 5 3.5Q5 0 2.5 0Z" },
    P: { width: 5, path: "M0 7V0H2.7Q5 0 5 2Q5 4 2.7 4H0" },
    Q: { width: 5.4, path: "M2.5 0Q0 0 0 3.5Q0 7 2.5 7Q5 7 5 3.5Q5 0 2.5 0ZM3.3 5.3L5.4 7.4" },
    R: { width: 5, path: "M0 7V0H2.7Q5 0 5 2Q5 4 2.7 4H0M2.8 4L5 7" },
    S: { width: 5, path: "M5 1Q4 0 2.5 0Q0 0 0 1.8Q0 3.5 2.5 3.5Q5 3.5 5 5.2Q5 7 2.5 7Q1 7 0 6" },
    T: { width: 5, path: "M0 0H5M2.5 0V7" },
    U: { width: 5, path: "M0 0V4.8Q0 7 2.5 7Q5 7 5 4.8V0" },
    V: { width: 5, path: "M0 0L2.5 7L5 0" },
    W: { width: 7, path: "M0 0L1.5 7L3.5 3.2L5.5 7L7 0" },
    X: { width: 5, path: "M0 0L5 7M5 0L0 7" },
    Y: { width: 5, path: "M0 0L2.5 3.5L5 0M2.5 3.5V7" },
    Z: { width: 5, path: "M0 0H5L0 7H5" },
    0: { width: 5, path: "M2.5 0Q0 0 0 3.5Q0 7 2.5 7Q5 7 5 3.5Q5 0 2.5 0ZM1 6L4 1" },
    1: { width: 3, path: "M.4 1L1.5 0V7M0 7H3" },
    2: { width: 5, path: "M0 1Q1 0 2.5 0Q5 0 5 2Q5 3 4 4L0 7H5" },
    3: { width: 5, path: "M0 1Q1 0 2.5 0Q5 0 5 1.8Q5 3.5 2.7 3.5Q5 3.5 5 5.2Q5 7 2.5 7Q1 7 0 6" },
    4: { width: 5, path: "M4 7V0L0 4.5H5" },
    5: { width: 5, path: "M5 0H0V3.3H2.5Q5 3.3 5 5.2Q5 7 2.5 7Q1 7 0 6" },
    6: { width: 5, path: "M5 1Q4 0 2.5 0Q0 0 0 3.5V5Q0 7 2.5 7Q5 7 5 5Q5 3.3 2.5 3.3H0" },
    7: { width: 5, path: "M0 0H5L1.5 7" },
    8: { width: 5, path: "M2.5 0Q0 0 0 1.8Q0 3.5 2.5 3.5Q5 3.5 5 1.8Q5 0 2.5 0ZM2.5 3.5Q0 3.5 0 5.2Q0 7 2.5 7Q5 7 5 5.2Q5 3.5 2.5 3.5Z" },
    9: { width: 5, path: "M5 3.7H2.5Q0 3.7 0 1.8Q0 0 2.5 0Q5 0 5 2V4.7Q5 7 2.5 7Q1 7 0 6" },
    "-": { width: 4, path: "M0 3.5H4" },
    "_": { width: 5, path: "M0 7H5" },
    ".": { width: 1.4, path: "M.7 6.8V7" },
    "?": { width: 4.5, path: "M0 1Q.8 0 2.2 0Q4.5 0 4.5 1.9Q4.5 3 3.2 3.8L2.2 4.4V5.1M2.2 6.8V7" },
    " ": { width: 2.4, path: "" }
  });

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
      if (!active) throw new Error("Invalid SVG path data.");
      const upper = active.toUpperCase();
      const count = PATH_PARAMETERS[upper];
      if (count == null) throw new Error(`Unsupported SVG path command: ${active}`);
      if (upper === "Z") {
        commands.push({ command: "Z", values: [] });
        active = "";
        continue;
      }
      if (index + count > tokens.length) throw new Error("Incomplete SVG path data.");
      const values = tokens.slice(index, index + count).map(Number);
      if (!values.every(Number.isFinite)) throw new Error("Invalid SVG path number.");
      commands.push({ command: active, values });
      index += count;
      if (upper === "M") active = active === "M" ? "L" : "l";
    }
    return commands;
  }

  function matrixSimilarity(matrix) {
    const scaleX = Math.hypot(matrix.a, matrix.b);
    const scaleY = Math.hypot(matrix.c, matrix.d);
    const dot = matrix.a * matrix.c + matrix.b * matrix.d;
    const tolerance = Math.max(1, scaleX, scaleY) * 1e-4;
    if (Math.abs(scaleX - scaleY) > tolerance || Math.abs(dot) > tolerance) return null;
    return {
      scale: (scaleX + scaleY) / 2,
      rotation: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI,
      reflected: matrix.a * matrix.d - matrix.b * matrix.c < 0
    };
  }

  function transformed(point, matrix) {
    return {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f
    };
  }

  function transformPathData(source, matrix) {
    const similarity = matrixSimilarity(matrix);
    const output = [];
    let current = { x: 0, y: 0 };
    let subpathStart = { x: 0, y: 0 };
    const absolutePoint = (x, y, relative) => relative ? { x: current.x + x, y: current.y + y } : { x, y };
    const appendPoint = (command, point) => {
      const next = transformed(point, matrix);
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
        const first = absolutePoint(values[0], values[1], relative);
        const second = absolutePoint(values[2], values[3], relative);
        const end = absolutePoint(values[4], values[5], relative);
        const a = transformed(first, matrix);
        const b = transformed(second, matrix);
        const c = transformed(end, matrix);
        output.push(`C${numberText(a.x)} ${numberText(a.y)} ${numberText(b.x)} ${numberText(b.y)} ${numberText(c.x)} ${numberText(c.y)}`);
        current = end;
        continue;
      }
      if (upper === "S" || upper === "Q") {
        const control = absolutePoint(values[0], values[1], relative);
        const end = absolutePoint(values[2], values[3], relative);
        const a = transformed(control, matrix);
        const b = transformed(end, matrix);
        output.push(`${upper}${numberText(a.x)} ${numberText(a.y)} ${numberText(b.x)} ${numberText(b.y)}`);
        current = end;
        continue;
      }
      if (upper === "A") {
        if (!similarity) return "";
        const end = absolutePoint(values[5], values[6], relative);
        const target = transformed(end, matrix);
        const sweep = similarity.reflected ? (values[4] ? 0 : 1) : values[4];
        output.push(`A${numberText(Math.abs(values[0] * similarity.scale))} ${numberText(Math.abs(values[1] * similarity.scale))} ${numberText(values[2] + similarity.rotation)} ${values[3] ? 1 : 0} ${sweep ? 1 : 0} ${numberText(target.x)} ${numberText(target.y)}`);
        current = end;
      }
    }
    return output.join("");
  }

  function pointsAttribute(element) {
    const values = String(element.getAttribute("points") || "").trim().split(/[\s,]+/).map(Number);
    if (values.length < 4 || values.length % 2 || !values.every(Number.isFinite)) return "";
    return values.reduce((path, value, index) => index % 2 ? `${path} ${numberText(value)}` : `${path}${index ? "L" : "M"}${numberText(value)}`, "");
  }

  function elementPathData(element) {
    const tag = element.tagName.toLowerCase();
    if (tag === "path") return element.getAttribute("d") || "";
    if (tag === "line") return `M${element.getAttribute("x1") || 0} ${element.getAttribute("y1") || 0}L${element.getAttribute("x2") || 0} ${element.getAttribute("y2") || 0}`;
    if (tag === "polyline" || tag === "polygon") return `${pointsAttribute(element)}${tag === "polygon" ? "Z" : ""}`;
    if (tag === "circle" || tag === "ellipse") {
      const cx = Number(element.getAttribute("cx") || 0);
      const cy = Number(element.getAttribute("cy") || 0);
      const rx = Number(tag === "circle" ? element.getAttribute("r") || 0 : element.getAttribute("rx") || 0);
      const ry = Number(tag === "circle" ? element.getAttribute("r") || 0 : element.getAttribute("ry") || 0);
      if (!(rx > 0 && ry > 0)) return "";
      return `M${numberText(cx + rx)} ${numberText(cy)}A${numberText(rx)} ${numberText(ry)} 0 1 0 ${numberText(cx - rx)} ${numberText(cy)}A${numberText(rx)} ${numberText(ry)} 0 1 0 ${numberText(cx + rx)} ${numberText(cy)}Z`;
    }
    if (tag === "rect") {
      const x = Number(element.getAttribute("x") || 0);
      const y = Number(element.getAttribute("y") || 0);
      const width = Number(element.getAttribute("width") || 0);
      const height = Number(element.getAttribute("height") || 0);
      if (!(width > 0 && height > 0)) return "";
      let rx = Number(element.getAttribute("rx") || 0);
      let ry = Number(element.getAttribute("ry") || 0);
      if (!rx && ry) rx = ry;
      if (!ry && rx) ry = rx;
      rx = Math.min(Math.max(0, rx), width / 2);
      ry = Math.min(Math.max(0, ry), height / 2);
      if (!rx && !ry) return `M${numberText(x)} ${numberText(y)}H${numberText(x + width)}V${numberText(y + height)}H${numberText(x)}Z`;
      return `M${numberText(x + rx)} ${numberText(y)}H${numberText(x + width - rx)}A${numberText(rx)} ${numberText(ry)} 0 0 1 ${numberText(x + width)} ${numberText(y + ry)}V${numberText(y + height - ry)}A${numberText(rx)} ${numberText(ry)} 0 0 1 ${numberText(x + width - rx)} ${numberText(y + height)}H${numberText(x + rx)}A${numberText(rx)} ${numberText(ry)} 0 0 1 ${numberText(x)} ${numberText(y + height - ry)}V${numberText(y + ry)}A${numberText(rx)} ${numberText(ry)} 0 0 1 ${numberText(x + rx)} ${numberText(y)}Z`;
    }
    return "";
  }

  flattenSvg = function exactFlattenSvg(source) {
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
          let d = "";
          try {
            const raw = elementPathData(element);
            d = raw && matrix ? transformPathData(raw, matrix) : "";
          } catch {
            d = "";
          }
          if (!d) d = pointsToPath(subpaths, closed);
          return {
            subpaths,
            d,
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
  };

  function smoothLabelGeometry(label, bounds) {
    const characters = String(label || "").toUpperCase().slice(0, 18).split("");
    if (!characters.length) return { d: "", strokeWidth: 0 };
    const spacing = 1.05;
    const glyphs = characters.map((character) => strokeFont[character] || strokeFont["?"]);
    const unitWidth = glyphs.reduce((total, glyph) => total + glyph.width, 0) + Math.max(0, glyphs.length - 1) * spacing;
    const available = Math.max(8, Math.min(45, bounds.right - bounds.left - 2));
    const scale = Math.min(state.textSize / 7, available / Math.max(1, unitWidth));
    const totalWidth = unitWidth * scale;
    const startX = (bounds.left + bounds.right - totalWidth) / 2;
    const startY = 52.2 - 3.5 * scale;
    let cursor = startX;
    const paths = [];
    for (const glyph of glyphs) {
      if (glyph.path) paths.push(transformPathData(glyph.path, { a: scale, b: 0, c: 0, d: scale, e: cursor, f: startY }));
      cursor += (glyph.width + spacing) * scale;
    }
    return { d: paths.join(""), strokeWidth: Math.max(.38, scale * 1.12) };
  }

  buildUnitySvg = function qualityUnitySvg() {
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
    const labelGeometry = state.showText ? smoothLabelGeometry(state.text.trim(), horizontalBounds(subpaths)) : { d: "", strokeWidth: 0 };
    const body = explicitPath(shapePath, background);
    const shadow = explicitPath(shadowPath, { color: "#000000", opacity: .26 });
    const bandLayer = bandPath ? explicitPath(bandPath, band) : "";
    const glyph = unityGlyphPaths();
    const label = labelGeometry.d
      ? explicitPath(labelGeometry.d, { color: "none", opacity: 1 }, text, { strokeWidth: labelGeometry.strokeWidth, linecap: "round", linejoin: "round" })
      : "";
    const outlineLayer = state.outlineEnabled ? explicitPath(shapePath, { color: "none", opacity: 1 }, outline, { strokeWidth: 1.5, linejoin: "round" }) : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${shadow}${body}${glyph}${bandLayer}${label}${outlineLayer}</svg>`;
    if (!validateUnitySvg(svg)) throw new Error("Unity SVG validation rejected an unsupported construct.");
    return svg;
  };

  function sizedSvg(svg, pixelSize) {
    return String(svg).replace(/<svg\b([^>]*)>/i, (_, attributes) => {
      const cleaned = attributes.replace(/\swidth=("[^"]*"|'[^']*')/i, "").replace(/\sheight=("[^"]*"|'[^']*')/i, "");
      return `<svg${cleaned} width="${pixelSize}" height="${pixelSize}">`;
    });
  }

  async function rasterizeSvg(svg, size) {
    const targetSize = Math.max(1, Math.round(Number(size) || 64));
    const sampleSize = targetSize * 4;
    const source = URL.createObjectURL(new Blob([sizedSvg(svg, sampleSize)], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const image = new Image();
      image.decoding = "async";
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = source;
      });
      const highResolution = document.createElement("canvas");
      highResolution.width = sampleSize;
      highResolution.height = sampleSize;
      const highContext = highResolution.getContext("2d");
      if (!highContext) throw new Error("Canvas is unavailable.");
      highContext.imageSmoothingEnabled = true;
      highContext.imageSmoothingQuality = "high";
      highContext.drawImage(image, 0, 0, sampleSize, sampleSize);
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(highResolution, 0, 0, targetSize, targetSize);
      return await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG encoding failed.")), "image/png"));
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  window.ScriptIconStudioRaster = Object.freeze({ toPng: rasterizeSvg });
  exportPng = async function qualityExportPng(size) {
    try {
      const blob = await rasterizeSvg(buildSvg(), size);
      download(`${fileName()}_${size}.png`, await blob.arrayBuffer(), "image/png");
      notify(`PNG ${size} × ${size} downloaded.`);
    } catch {
      notify("The PNG could not be generated.");
    }
  };
})();