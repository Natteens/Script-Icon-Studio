import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const quality = await readFile(new URL("../src/js/export-quality.js", import.meta.url), "utf8");
const links = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");
const batch = await readFile(new URL("../src/js/batch-queue.js", import.meta.url), "utf8");

test("export quality module compiles", () => {
  assert.doesNotThrow(() => new Function(quality));
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

test("exported labels use continuous vector strokes instead of pixel cells", () => {
  assert.match(quality, /const strokeFont = Object\.freeze/);
  assert.match(quality, /function smoothLabelGeometry\s*\(/);
  assert.match(quality, /linecap: "round", linejoin: "round"/);
  assert.match(quality, /buildUnitySvg = function qualityUnitySvg/);
  assert.doesNotMatch(quality, /vectorFont\[/);
  assert.doesNotMatch(quality, /rowIndex.*columnIndex/s);
});

test("direct PNG export uses four-times supersampling", () => {
  assert.match(quality, /const sampleSize = targetSize \* 4/);
  assert.match(quality, /highContext\.drawImage\(image, 0, 0, sampleSize, sampleSize\)/);
  assert.match(quality, /context\.drawImage\(highResolution, 0, 0, targetSize, targetSize\)/);
  assert.match(quality, /exportPng = async function qualityExportPng/);
});

test("quality fixes load before the batch queue", () => {
  const qualityIndex = links.indexOf("./js/export-quality.js?v=1");
  const batchIndex = links.indexOf("./js/batch-queue.js?v=2");
  assert.ok(qualityIndex >= 0, "export-quality.js is not loaded");
  assert.ok(batchIndex > qualityIndex, "batch queue must load after export quality fixes");
  assert.match(links, /qualityScript\.addEventListener\("load"/);
  assert.match(batch, /const svg = buildUnitySvg\(\)/);
});