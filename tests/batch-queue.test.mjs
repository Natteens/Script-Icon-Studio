import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const queue = await readFile(new URL("../src/js/batch-queue.js", import.meta.url), "utf8");
const queueCss = await readFile(new URL("../src/css/batch-queue.css", import.meta.url), "utf8");
const projectLinks = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");

test("batch queue script compiles, remains local, and has no arbitrary count cap", () => {
  assert.doesNotThrow(() => new Function(queue));
  assert.match(queue, /script-icon-studio:icon-queue:v1/);
  assert.match(queue, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(queue, /limited by browser storage/);
  assert.doesNotMatch(queue, /QUEUE_LIMIT/);
  assert.doesNotMatch(queue, /\.slice\(0,\s*QUEUE_LIMIT\)/);
  assert.doesNotMatch(queue, /\bfetch\s*\(/);
  assert.doesNotMatch(queue, /XMLHttpRequest/);
  assert.doesNotMatch(queue, /setInterval\s*\(/);
  assert.doesNotMatch(queue, /document\.createElement\("style"\)/);
});

test("queued editor states and SVG files are sanitized before use", () => {
  assert.match(queue, /function sanitizeSnapshot\s*\(/);
  assert.match(queue, /function sanitizeGlyph\s*\(/);
  assert.match(queue, /function sanitizeShape\s*\(/);
  assert.match(queue, /sanitizeSvg\(`/);
  assert.match(queue, /sanitizeShapeSvg\(`/);
  assert.match(queue, /validateUnitySvg\(svg\)/);
  assert.match(queue, /const SNAPSHOT_SIZE_LIMIT = 600000/);
  assert.match(queue, /const SVG_SIZE_LIMIT = 750000/);
  assert.match(queue, /session\.apply\(snapshot/);
});

test("batch queue supports explicit management actions", () => {
  for (const action of ["Add current icon", "Clear queue", "Open", "Update", "Duplicate", "Rename", "Remove", "Download ZIP"]) {
    assert.ok(queue.includes(action), `Missing batch queue action: ${action}`);
  }
  assert.match(queue, /session\.capture\(\)/);
  assert.match(queue, /buildUnitySvg\(\)/);
  assert.match(queue, /fileName\(\)\.replace/);
});

test("ZIP writer is self-contained and includes SVG, PNG, and a manifest", () => {
  assert.match(queue, /function crc32\s*\(/);
  assert.match(queue, /0x04034b50/);
  assert.match(queue, /0x02014b50/);
  assert.match(queue, /0x06054b50/);
  assert.match(queue, /type: "application\/zip"/);
  assert.match(queue, /script_icon_studio_manifest\.json/);
  assert.match(queue, /script-icon-studio-icon-batch/);
  assert.match(queue, /svgToPng\(item\.svg, size\)/);
  assert.match(queue, /script_icon_studio_icons_\$\{date\}\.zip/);
});

test("queue output choices include Unity SVG and standard PNG sizes", () => {
  for (const output of ["UI Toolkit SVG", "PNG 64", "PNG 128", "PNG 256"]) {
    assert.ok(queue.includes(output), `Missing queue output: ${output}`);
  }
  assert.match(queue, /png64/);
  assert.match(queue, /png128/);
  assert.match(queue, /png256/);
  assert.match(queue, /Keep at least one ZIP output format selected/);
});

test("queue assets are loaded locally and public examples are neutral", () => {
  assert.match(projectLinks, /\.\/css\/batch-queue\.css\?v=1/);
  assert.match(projectLinks, /\.\/js\/export-quality\.js\?v=1/);
  assert.match(projectLinks, /\.\/js\/label-font\.js\?v=1/);
  assert.match(projectLinks, /\.\/js\/batch-queue\.js\?v=2/);
  assert.match(projectLinks, /\.\/js\/queue-export-fix\.js\?v=1/);
  assert.match(projectLinks, /function loadScript\s*\(/);
  assert.match(projectLinks, /await window\.ScriptIconStudioLabelFontReady/);
  assert.match(projectLinks, /projectName\.placeholder = "Player Controller"/);
  assert.match(projectLinks, /paletteName\.placeholder = "Ocean Blue"/);
  assert.doesNotMatch(projectLinks, /Fynite/i);
  assert.match(queueCss, /\.batch-queue-dialog/);
  assert.match(queueCss, /\.batch-queue-item/);
  assert.match(queueCss, /@media \(max-width: 760px\)/);
});
