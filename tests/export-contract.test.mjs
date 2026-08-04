import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
const qol = await readFile(new URL("../src/js/qol.js", import.meta.url), "utf8");
const projectLinks = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");

test("browser scripts compile as JavaScript", () => {
  assert.doesNotThrow(() => new Function(app));
  assert.doesNotThrow(() => new Function(qol));
  assert.doesNotThrow(() => new Function(projectLinks));
});

test("UI Toolkit SVG validator rejects unsupported constructs", () => {
  const requiredChecks = [
    "/<text\\b/i",
    "/<svg\\b[^>]*<svg\\b/is",
    "/<defs\\b/i",
    "/clip-path/i",
    "/currentColor/i",
    "/\\btransform=/i",
    "/<style\\b/i",
    "/<use\\b/i",
    "/<symbol\\b/i",
    "/<image\\b/i",
    "/preserveAspectRatio/i"
  ];

  assert.match(app, /function validateUnitySvg\s*\(/);
  for (const check of requiredChecks) assert.ok(app.includes(check), `Missing SVG validation check: ${check}`);
  assert.match(app, /if \(!validateUnitySvg\(svg\)\) throw new Error/);
});

test("UI Toolkit SVG output is flattened to paths", () => {
  assert.match(app, /function buildUnitySvg\s*\(/);
  assert.match(app, /const glyph = unityGlyphPaths\(\)/);
  assert.match(app, /const label = labelPath \? explicitPath\(labelPath, text\) : ""/);
  assert.match(app, /<svg xmlns=\\"http:\/\/www\.w3\.org\/2000\/svg\\" width=\\"64\\" height=\\"64\\" viewBox=\\"0 0 64 64\\">/);
});

test("default file names use a stable icon_label_glyph convention", () => {
  assert.match(qol, /const parts = \["icon"\]/);
  assert.match(qol, /return parts\.join\("_"\)/);
  assert.match(qol, /download\(`\$\{fileName\(\)\}_\$\{size\}\.png`/);
});
