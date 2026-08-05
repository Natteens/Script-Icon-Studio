import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const headers = await readFile(new URL("../src/_headers", import.meta.url), "utf8");

test("production metadata uses the official Pages domain", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/scripticonstudio\.pages\.dev\/"/);
  assert.match(html, /<title>Script Icon Studio<\/title>/);
});

test("scripts load locally and in dependency order", () => {
  const appIndex = html.indexOf("./js/app.js");
  const toolsIndex = html.indexOf("./js/editor-tools.js");
  const sessionIndex = html.indexOf("./js/editor-session.js");
  const glyphLibraryIndex = html.indexOf("./js/glyph-library.js");
  const linksIndex = html.indexOf("./js/project-links.js");

  assert.ok(appIndex >= 0, "app.js is missing");
  assert.ok(toolsIndex > appIndex, "editor-tools.js must load after app.js");
  assert.ok(sessionIndex > toolsIndex, "editor-session.js must load after editor-tools.js");
  assert.ok(glyphLibraryIndex > sessionIndex, "glyph-library.js must load after editor-session.js");
  assert.ok(linksIndex > glyphLibraryIndex, "project-links.js must load after glyph-library.js");
  assert.doesNotMatch(html, /qol\.js/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//i);
});

test("component styles load from local CSS files", () => {
  assert.match(html, /\.\/css\/editor-tools\.css/);
  assert.match(html, /\.\/css\/glyph-library\.css/);
  assert.match(html, /\.\/css\/project-links\.css/);
  assert.doesNotMatch(html, /<link\s+rel="stylesheet"[^>]+href="https?:\/\//i);
});

test("Cloudflare security headers preserve icon search", () => {
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
  assert.match(headers, /connect-src 'self' https:\/\/api\.iconify\.design/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
});
