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
  const qolIndex = html.indexOf("./js/qol.js");
  const linksIndex = html.indexOf("./js/project-links.js");

  assert.ok(appIndex >= 0, "app.js is missing");
  assert.ok(qolIndex > appIndex, "qol.js must load after app.js");
  assert.ok(linksIndex > qolIndex, "project-links.js must load after qol.js");
  assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//i);
});

test("Cloudflare security headers preserve icon search", () => {
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
  assert.match(headers, /connect-src 'self' https:\/\/api\.iconify\.design/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
});
