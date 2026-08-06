import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const quality = await readFile(new URL("../src/js/export-quality.js", import.meta.url), "utf8");
const labelFont = await readFile(new URL("../src/js/label-font.js", import.meta.url), "utf8");
const links = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");
const batch = await readFile(new URL("../src/js/batch-queue.js", import.meta.url), "utf8");

test("export quality module compiles", () => {
  assert.doesNotThrow(() => new Function(quality));
  assert.doesNotThrow(() => new Function(labelFont));
});

test("Unity export preserves exact SVG path commands", () => {
  assert.match(quality, /function parsePathData\s*\(/);
  assert.match(quality, /function transformPathData\s*\(/);
  assert.match(quality, /elementPathData\(element\)/);
  assert.match(quality, /d = raw && matrix \? transformPathData\(raw, matrix\) : ""/);
  assert.match(quality, /output\.push\(`C/);
  assert.match(quality, /output\.push\(`A/);
  assert.match(quality, /fillRule: style\.fillRule === "evenodd"/);
});

test("final labels use the same filled vector outlines in preview and SVG", () => {
  assert.match(labelFont, /Arimo Bold outlines/);
  assert.match(labelFont, /labelMarkup = function vectorLabelMarkup/);
  assert.match(labelFont, /buildUnitySvg = function matchingUnitySvg/);
  assert.match(labelFont, /class="label-path"/);
  assert.match(labelFont, /explicitPath\(label\.d, text\)/);
  assert.doesNotMatch(labelFont, /<text\b/i);
  assert.doesNotMatch(labelFont, /strokeFont/);
  assert.doesNotMatch(labelFont, /rowIndex.*columnIndex/s);
});

test("direct PNG export uses four-times supersampling", () => {
  assert.match(quality, /const sampleSize = targetSize \* 4/);
  assert.match(quality, /highContext\.drawImage\(image, 0, 0, sampleSize, sampleSize\)/);
  assert.match(quality, /context\.drawImage\(highResolution, 0, 0, targetSize, targetSize\)/);
  assert.match(quality, /exportPng = async function qualityExportPng/);
});

test("quality and label fixes load before the batch queue", () => {
  const qualityIndex = links.indexOf("./js/export-quality.js?v=1");
  const labelIndex = links.indexOf("./js/label-font.js?v=1");
  const batchIndex = links.indexOf("./js/batch-queue.js?v=2");
  const queueFixIndex = links.indexOf("./js/queue-export-fix.js?v=1");
  assert.ok(qualityIndex >= 0, "export-quality.js is not loaded");
  assert.ok(labelIndex > qualityIndex, "label font must load after geometry fixes");
  assert.ok(batchIndex > labelIndex, "batch queue must load after the final label renderer");
  assert.ok(queueFixIndex > batchIndex, "legacy queue refresh must load after the queue");
  assert.match(links, /function loadScript\s*\(/);
  assert.match(batch, /const svg = buildUnitySvg\(\)/);
});
