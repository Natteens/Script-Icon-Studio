import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const index = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
const sitemapXml = await readFile(new URL("../src/sitemap.xml", import.meta.url), "utf8");
const sitemapText = await readFile(new URL("../src/sitemap.txt", import.meta.url), "utf8");
const robots = await readFile(new URL("../src/robots.txt", import.meta.url), "utf8");
const headers = await readFile(new URL("../src/_headers", import.meta.url), "utf8");
const llms = await readFile(new URL("../src/llms.txt", import.meta.url), "utf8");
const labelFont = await readFile(new URL("../src/js/label-font.js", import.meta.url), "utf8");
const queueFix = await readFile(new URL("../src/js/queue-export-fix.js", import.meta.url), "utf8");
const projectLinks = await readFile(new URL("../src/js/project-links.js", import.meta.url), "utf8");

const productionUrl = "https://scripticonstudio.pages.dev/";

test("production metadata points to the canonical Pages domain", () => {
  assert.match(index, /<meta name="description" content="[^"]{40,}"/);
  assert.match(index, /<link rel="canonical" href="https:\/\/scripticonstudio\.pages\.dev\/"/);
  assert.doesNotMatch(index, /\d+\.scripticonstudio\.pages\.dev/);
});

test("XML and text sitemaps contain only the production URL", () => {
  assert.match(sitemapXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(sitemapXml, /<loc>https:\/\/scripticonstudio\.pages\.dev\/<\/loc>/);
  assert.equal(sitemapText, `${productionUrl}\n`);
  assert.doesNotMatch(sitemapXml, /\d+\.scripticonstudio\.pages\.dev/);
  assert.doesNotMatch(sitemapText, /\d+\.scripticonstudio\.pages\.dev/);
});

test("robots points crawlers to the plain text sitemap", () => {
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \/$/m);
  assert.match(robots, /Sitemap: https:\/\/scripticonstudio\.pages\.dev\/sitemap\.txt/);
});

test("crawler files avoid custom content type overrides", () => {
  assert.match(headers, /\/sitemap\.txt[\s\S]*?Cache-Control: public, max-age=0, must-revalidate/);
  assert.match(headers, /\/robots\.txt[\s\S]*?Cache-Control: public, max-age=0, must-revalidate/);
  assert.doesNotMatch(headers, /Content-Type:/);
});

test("llms file gives a concise machine-readable project summary", () => {
  assert.match(llms, /^# Script Icon Studio/m);
  assert.match(llms, /https:\/\/scripticonstudio\.pages\.dev\//);
  assert.match(llms, /Unity UI Toolkit SVG/);
  assert.match(llms, /browser/i);
});

test("label font module compiles and replaces text elements with filled vector outlines", () => {
  assert.doesNotThrow(() => new Function(labelFont));
  assert.match(labelFont, /Arimo Bold outlines/);
  assert.match(labelFont, /labelMarkup = function vectorLabelMarkup/);
  assert.match(labelFont, /buildUnitySvg = function matchingUnitySvg/);
  assert.match(labelFont, /class="label-path"/);
  assert.match(labelFont, /fill-rule="nonzero"/);
  assert.doesNotMatch(labelFont, /<text\b/i);
  assert.doesNotMatch(labelFont, /strokeFont/);
});

test("queue export refreshes legacy queue SVGs with the current renderer", () => {
  assert.doesNotThrow(() => new Function(queueFix));
  assert.match(queueFix, /buildUnitySvg\(\)/);
  assert.match(queueFix, /raster\.toPng\(svg, size\)/);
  assert.match(queueFix, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(queueFix, /stopImmediatePropagation\(\)/);
  assert.match(queueFix, /version: 2/);
});

test("quality modules load in dependency order", () => {
  const quality = projectLinks.indexOf("./js/export-quality.js?v=1");
  const font = projectLinks.indexOf("./js/label-font.js?v=1");
  const queue = projectLinks.indexOf("./js/batch-queue.js?v=2");
  const fix = projectLinks.indexOf("./js/queue-export-fix.js?v=1");
  assert.ok(quality >= 0 && font > quality && queue > font && fix > queue);
});
