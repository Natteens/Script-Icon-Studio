import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const bridge = await readFile(new URL("../src/js/project-queue-bridge.js", import.meta.url), "utf8");
const projectLinks = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");

test("saved projects can be transferred into the icon queue", () => {
  assert.doesNotThrow(() => new Function(bridge));
  assert.match(bridge, /script-icon-studio:projects:v1/);
  assert.match(bridge, /script-icon-studio:icon-queue:v1/);
  assert.match(bridge, /const QUEUE_LIMIT = 24/);
  assert.match(bridge, /Add to Queue/);
  assert.match(bridge, /Add all to queue/);
  assert.match(bridge, /buildUnitySvg\(\)/);
  assert.match(bridge, /validateUnitySvg\(svg\)/);
  assert.match(bridge, /localStorage\.setItem\(QUEUE_STORAGE_KEY/);
});

test("project queue transfer stays local and preserves the current renderer state", () => {
  assert.match(bridge, /function captureRenderState\s*\(/);
  assert.match(bridge, /function applyRenderState\s*\(/);
  assert.match(bridge, /finally\s*{\s*applyRenderState\(previous\)/);
  assert.doesNotMatch(bridge, /\bfetch\s*\(/);
  assert.doesNotMatch(bridge, /XMLHttpRequest/);
});

test("project queue bridge loads after the existing queue exporters", () => {
  const queueIndex = projectLinks.indexOf("./js/batch-queue.js?v=2");
  const fixIndex = projectLinks.indexOf("./js/queue-export-fix.js?v=1");
  const bridgeIndex = projectLinks.indexOf("./js/project-queue-bridge.js?v=1");

  assert.ok(queueIndex >= 0, "batch queue loader is missing");
  assert.ok(fixIndex > queueIndex, "queue export fix must load after the batch queue");
  assert.ok(bridgeIndex > fixIndex, "project queue bridge must load after the queue exporters");
});