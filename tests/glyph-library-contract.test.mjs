import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../src/js/glyph-library.js", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/css/glyph-library.css", import.meta.url), "utf8");

test("glyph library script compiles", () => {
  assert.doesNotThrow(() => new Function(script));
});

test("recent and favorite collections have bounded local storage", () => {
  assert.match(script, /script-icon-studio:glyph-library:v1/);
  assert.match(script, /const RECENT_LIMIT = 12/);
  assert.match(script, /const FAVORITE_LIMIT = 48/);
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /sanitizeSvg\(source\)/);
});

test("glyph changes are observed without timers or network persistence", () => {
  assert.match(script, /new MutationObserver\(scheduleRecordCurrent\)/);
  assert.doesNotMatch(script, /setInterval\s*\(/);
  assert.doesNotMatch(script, /fetch\s*\(/);
});

test("collection controls are present and accessible", () => {
  assert.match(html, /id="glyph-collection-tabs"[^>]+role="tablist"/);
  assert.match(html, /data-glyph-view="recent"[^>]+role="tab"/);
  assert.match(html, /data-glyph-view="favorites"[^>]+role="tab"/);
  assert.match(html, /id="favorite-current"[^>]+aria-pressed="false"/);
  assert.match(styles, /\.glyph-favorite\.active/);
  assert.match(styles, /\.favorite-current\.active/);
});
