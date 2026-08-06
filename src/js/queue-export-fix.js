"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:icon-queue:v1";
  const STATE_KEYS = [
    "template", "palette", "glyph", "x", "y", "scale", "rotation", "source",
    "preview", "customShape", "showText", "text", "textMode", "textSize", "outlineEnabled"
  ];
  const session = window.ScriptIconStudioSession;
  const raster = window.ScriptIconStudioRaster;
  const button = document.querySelector("#queue-export-zip");
  const dialog = button?.closest("dialog");

  if (!session || !raster || !button || !dialog || button.dataset.qualityPatched === "true") return;
  button.dataset.qualityPatched = "true";

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const slug = (value) => String(value || "icon")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "icon";

  function applySnapshot(snapshot) {
    for (const key of STATE_KEYS) state[key] = clone(snapshot[key]);
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function push16(target, value) {
    target.push(value & 0xff, (value >>> 8) & 0xff);
  }

  function push32(target, value) {
    target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
    };
  }

  function createZip(entries) {
    const encoder = new TextEncoder();
    const local = [];
    const central = [];
    let offset = 0;
    const stamp = dosDateTime();

    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const data = entry.data instanceof Uint8Array ? entry.data : encoder.encode(String(entry.data));
      const crc = crc32(data);
      const header = [];
      push32(header, 0x04034b50);
      push16(header, 20);
      push16(header, 0x0800);
      push16(header, 0);
      push16(header, stamp.time);
      push16(header, stamp.date);
      push32(header, crc);
      push32(header, data.length);
      push32(header, data.length);
      push16(header, name.length);
      push16(header, 0);
      local.push(new Uint8Array(header), name, data);

      const directory = [];
      push32(directory, 0x02014b50);
      push16(directory, 20);
      push16(directory, 20);
      push16(directory, 0x0800);
      push16(directory, 0);
      push16(directory, stamp.time);
      push16(directory, stamp.date);
      push32(directory, crc);
      push32(directory, data.length);
      push32(directory, data.length);
      push16(directory, name.length);
      push16(directory, 0);
      push16(directory, 0);
      push16(directory, 0);
      push16(directory, 0);
      push32(directory, 0);
      push32(directory, offset);
      central.push(new Uint8Array(directory), name);
      offset += header.length + name.length + data.length;
    }

    const centralSize = central.reduce((total, part) => total + part.length, 0);
    const end = [];
    push32(end, 0x06054b50);
    push16(end, 0);
    push16(end, 0);
    push16(end, entries.length);
    push16(end, entries.length);
    push32(end, centralSize);
    push32(end, offset);
    push16(end, 0);
    return new Blob([...local, ...central, new Uint8Array(end)], { type: "application/zip" });
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportFreshQueue(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.disabled) return;

    let stored;
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      stored = null;
    }
    const items = Array.isArray(stored?.items) ? stored.items.filter((item) => item?.snapshot && item?.name) : [];
    if (!items.length) {
      notify("The queue is empty.");
      return;
    }

    const enabled = [...dialog.querySelectorAll("[data-queue-output]")]
      .filter((input) => input.checked)
      .map((input) => input.dataset.queueOutput);
    if (!enabled.length) {
      notify("Select at least one ZIP output format.");
      return;
    }

    button.disabled = true;
    button.textContent = "Preparing…";
    const previous = session.capture();

    try {
      const generated = [];
      for (const item of items) {
        applySnapshot(item.snapshot);
        generated.push({ item, svg: buildUnitySvg() });
      }
      applySnapshot(previous);
      render();

      const entries = [];
      for (let index = 0; index < generated.length; index += 1) {
        const { item, svg } = generated[index];
        const base = slug(item.name);
        button.textContent = `Preparing ${index + 1}/${generated.length}`;
        if (enabled.includes("svg")) entries.push({ name: `svg/${base}.svg`, data: svg });
        for (const size of [64, 128, 256]) {
          if (!enabled.includes(`png${size}`)) continue;
          const blob = await raster.toPng(svg, size);
          entries.push({ name: `png_${size}/${base}_${size}.png`, data: new Uint8Array(await blob.arrayBuffer()) });
        }
      }

      entries.push({
        name: "script_icon_studio_manifest.json",
        data: `${JSON.stringify({
          format: "script-icon-studio-icon-batch",
          version: 2,
          exportedAt: new Date().toISOString(),
          outputs: Object.fromEntries(["svg", "png64", "png128", "png256"].map((key) => [key, enabled.includes(key)])),
          icons: generated.map(({ item }) => ({ name: item.name, fileName: slug(item.name) }))
        }, null, 2)}\n`
      });

      try {
        const refreshed = new Map(generated.map(({ item, svg }) => [item.id, svg]));
        stored.items = stored.items.map((item) => refreshed.has(item.id) ? { ...item, svg: refreshed.get(item.id), updatedAt: Date.now() } : item);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {
        // Export remains valid even when refreshed previews cannot be persisted.
      }

      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(`script_icon_studio_icons_${date}.zip`, createZip(entries));
      notify(`Downloaded a refreshed ZIP with ${generated.length} icon${generated.length === 1 ? "" : "s"}.`);
    } catch {
      applySnapshot(previous);
      render();
      notify("The ZIP could not be generated.");
    } finally {
      button.disabled = false;
      button.textContent = "Download ZIP";
    }
  }

  button.addEventListener("click", exportFreshQueue, { capture: true });
})();
