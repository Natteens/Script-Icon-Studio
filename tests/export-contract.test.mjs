import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/js/app.js", import.meta.url), "utf8");
const editorTools = await readFile(new URL("../src/js/editor-tools.js", import.meta.url), "utf8");
const editorSession = await readFile(new URL("../src/js/editor-session.js", import.meta.url), "utf8");
const projectLibrary = await readFile(new URL("../src/js/project-library.js", import.meta.url), "utf8");
const glyphLibrary = await readFile(new URL("../src/js/glyph-library.js", import.meta.url), "utf8");
const projectLinks = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");

test("browser scripts compile as JavaScript", () => {
  assert.doesNotThrow(() => new Function(app));
  assert.doesNotThrow(() => new Function(editorTools));
  assert.doesNotThrow(() => new Function(editorSession));
  assert.doesNotThrow(() => new Function(projectLibrary));
  assert.doesNotThrow(() => new Function(glyphLibrary));
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
  assert.ok(app.includes('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">'));
});

test("default file names use a stable icon_label_glyph convention", () => {
  assert.match(editorTools, /const parts = \["icon"\]/);
  assert.match(editorTools, /return parts\.join\("_"\)/);
  assert.match(editorTools, /download\(`\$\{fileName\(\)\}_\$\{size\}\.png`/);
});

test("editor session records changes without continuous polling", () => {
  assert.match(editorSession, /new MutationObserver\(scheduleSnapshot\)/);
  assert.match(editorSession, /window\.addEventListener\(tools\.eventName, scheduleSnapshot\)/);
  assert.doesNotMatch(editorSession, /setInterval\s*\(/);
});

test("editor session exposes reusable snapshots for saved projects", () => {
  assert.match(editorSession, /window\.ScriptIconStudioSession = Object\.freeze/);
  assert.match(editorSession, /capture\(\) \{/);
  assert.match(editorSession, /apply\(snapshot, message = "Project opened"\)/);
  assert.match(editorSession, /resetHistory\(reason = "history-reset"\)/);
  assert.match(editorSession, /replaceHistoryWithCurrent\("project-open"\)/);
});

test("saved projects stay local and sanitize restored SVG data", () => {
  assert.match(projectLibrary, /script-icon-studio:projects:v1/);
  assert.match(projectLibrary, /const PROJECT_LIMIT = 30/);
  assert.match(projectLibrary, /const SNAPSHOT_SIZE_LIMIT = 600000/);
  assert.match(projectLibrary, /sanitizeSvg\(`/);
  assert.match(projectLibrary, /sanitizeShapeSvg\(`/);
  assert.match(projectLibrary, /session\.capture\(\)/);
  assert.match(projectLibrary, /session\.apply\(snapshot/);
  assert.doesNotMatch(projectLibrary, /\bfetch\s*\(/);
  assert.doesNotMatch(projectLibrary, /XMLHttpRequest/);
  assert.doesNotMatch(projectLibrary, /setInterval\s*\(/);
});

test("saved projects provide explicit management actions", () => {
  for (const action of ["Save new", "Update current", "New editor", "Open", "Duplicate", "Rename", "Delete"]) {
    assert.ok(projectLibrary.includes(action), `Missing saved project action: ${action}`);
  }
  assert.match(projectLibrary, /Stored locally\. Nothing is uploaded\./);
});

test("component scripts keep styles in CSS files", () => {
  assert.doesNotMatch(editorTools, /document\.createElement\("style"\)/);
  assert.doesNotMatch(projectLibrary, /document\.createElement\("style"\)/);
  assert.doesNotMatch(glyphLibrary, /document\.createElement\("style"\)/);
  assert.doesNotMatch(projectLinks, /document\.createElement\("style"\)/);
});

test("project support is presented as a clear sponsor action", () => {
  assert.match(projectLinks, /className: "project-support-link"/);
  assert.match(projectLinks, /<span>Sponsor<\/span>/);
  assert.match(projectLinks, /Become a sponsor and support Script Icon Studio/);
  assert.match(projectLinks, /Become a sponsor<\/a>/);
});
