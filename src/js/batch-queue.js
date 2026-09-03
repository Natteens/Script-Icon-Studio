"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:icon-queue:v1";
  const SNAPSHOT_SIZE_LIMIT = 600000;
  const SVG_SIZE_LIMIT = 750000;
  const COLOR_KEYS = ["background", "glyph", "outline", "band", "text"];
  const session = window.ScriptIconStudioSession;

  if (!session) throw new Error("ScriptIconStudioSession must load before batch-queue.js");

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const cleanName = (value) => String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
  const slug = (value) => String(value || "icon")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "icon";
  const makeId = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const clamp = (value, minimum, maximum, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
  };

  function sanitizeGlyph(value) {
    if (!value || typeof value !== "object") return null;
    const id = String(value.id || "").slice(0, 220);
    const name = String(value.name || "").trim().slice(0, 160);
    if (!id || !name) return null;

    const builtIn = builtIns.find((glyph) => glyph.id === id);
    if (builtIn) return clone(builtIn);

    if (id.startsWith("custom:")) {
      const customId = id.slice("custom:".length).trim();
      if (!customId || /[\u0000-\u001f\u007f]/.test(customId)) return null;
    } else if (!/^[a-z0-9-]+:[a-z0-9][a-z0-9:_-]*$/i.test(id)) {
      return null;
    }

    const viewBox = String(value.viewBox || "").slice(0, 120);
    const markup = String(value.markup || "");
    if (!viewBox || !markup) return null;
    const parsed = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`);
    if (!parsed) return null;

    if (id.startsWith("custom:")) return { id, name, ...parsed };
    return {
      id,
      name,
      prefix: String(value.prefix || id.split(":")[0]).slice(0, 80),
      remote: true,
      ...parsed
    };
  }

  function sanitizeShape(value) {
    if (!value || typeof value !== "object") return null;
    const name = String(value.name || "Custom shape").trim().slice(0, 160) || "Custom shape";
    const viewBox = String(value.viewBox || "").slice(0, 120);
    const markup = String(value.markup || "");
    if (!viewBox || !markup) return null;
    const parsed = sanitizeShapeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`);
    return parsed ? { name, ...parsed } : null;
  }

  function sanitizeSnapshot(value) {
    if (!value || value.version !== session.version) return null;
    let serialized = "";
    try { serialized = JSON.stringify(value); } catch { return null; }
    if (serialized.length > SNAPSHOT_SIZE_LIMIT) return null;

    const glyph = sanitizeGlyph(value.glyph);
    if (!glyph) return null;

    const palette = {};
    for (const key of COLOR_KEYS) {
      const color = normalizeHex(value.palette?.[key]);
      if (!color) return null;
      palette[key] = color;
    }
    palette.name = String(value.palette?.name || "Custom").slice(0, 48) || "Custom";

    const customShape = sanitizeShape(value.customShape);
    const templateOptions = new Set(["bevel", "rounded", "squircle", "cut", "shield", "custom"]);
    let template = templateOptions.has(value.template) ? value.template : "bevel";
    if (template === "custom" && !customShape) template = "bevel";

    return {
      version: session.version,
      template,
      palette,
      glyph,
      x: clamp(value.x, -16, 16, 0),
      y: clamp(value.y, -16, 16, 0),
      scale: clamp(value.scale, 0.5, 1.6, 1),
      rotation: clamp(value.rotation, -180, 180, 0),
      source: new Set(["all", ...Object.keys(sources)]).has(value.source) ? value.source : "all",
      preview: ["grid", "light", "dark"].includes(value.preview) ? value.preview : "grid",
      customShape,
      showText: Boolean(value.showText),
      text: String(value.text || "ICON").slice(0, 18),
      textMode: ["band", "plain"].includes(value.textMode) ? value.textMode : "band",
      textSize: clamp(value.textSize, 6, 12, 8.75),
      outlineEnabled: value.outlineEnabled !== false,
      fileName: String(value.fileName || "").slice(0, 64)
    };
  }

  function normalizeItem(value) {
    if (!value || typeof value !== "object") return null;
    const id = String(value.id || "").slice(0, 100);
    const name = cleanName(value.name);
    const snapshot = sanitizeSnapshot(value.snapshot);
    const svg = String(value.svg || "");
    if (!id || !name || !snapshot || !svg || svg.length > SVG_SIZE_LIMIT || !validateUnitySvg(svg)) return null;
    const createdAt = Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : Date.now();
    const updatedAt = Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : createdAt;
    return { id, name, snapshot, svg, createdAt, updatedAt };
  }

  function loadQueue() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const items = Array.isArray(stored?.items)
        ? stored.items.map(normalizeItem).filter(Boolean)
        : [];
      const outputs = {
        svg: stored?.outputs?.svg !== false,
        png64: Boolean(stored?.outputs?.png64),
        png128: Boolean(stored?.outputs?.png128),
        png256: Boolean(stored?.outputs?.png256)
      };
      if (!Object.values(outputs).some(Boolean)) outputs.svg = true;
      return { version: 1, items, outputs };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { version: 1, items: [], outputs: { svg: true, png64: false, png128: false, png256: false } };
    }
  }

  let queue = loadQueue();
  let exporting = false;

  const queueIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v4H5zM5 11h14v4H5zM5 17h9v2H5z"/></svg>';
  const trigger = document.createElement("button");
  trigger.className = "button secondary batch-queue-trigger";
  trigger.type = "button";
  trigger.innerHTML = `${queueIcon}<span>Queue</span><b>0</b>`;

  const projectTrigger = document.querySelector(".project-library-trigger");
  (projectTrigger || document.querySelector(".history-button") || document.querySelector("#reset-all")).before(trigger);

  const dialog = document.createElement("dialog");
  dialog.className = "batch-queue-dialog";
  dialog.setAttribute("aria-labelledby", "batch-queue-title");
  dialog.innerHTML = `
    <div class="batch-queue-shell">
      <header class="batch-queue-header">
        <div>
          <h2 id="batch-queue-title">Icon queue</h2>
          <p>Collect finished icons and export them together.</p>
        </div>
        <button class="batch-queue-close" type="button" aria-label="Close icon queue">×</button>
      </header>
      <section class="batch-queue-toolbar">
        <button class="button primary" id="queue-add-current" type="button">Add current icon</button>
        <button class="button secondary" id="queue-clear" type="button">Clear queue</button>
        <span>Items are stored only in this browser.</span>
      </section>
      <section class="batch-queue-outputs" aria-label="ZIP contents">
        <strong>ZIP contents</strong>
        <label><input type="checkbox" data-queue-output="svg" /> UI Toolkit SVG</label>
        <label><input type="checkbox" data-queue-output="png64" /> PNG 64</label>
        <label><input type="checkbox" data-queue-output="png128" /> PNG 128</label>
        <label><input type="checkbox" data-queue-output="png256" /> PNG 256</label>
      </section>
      <div class="batch-queue-list" id="batch-queue-list"></div>
      <footer class="batch-queue-footer">
        <span><b id="batch-queue-count">0</b> icons · limited by browser storage</span>
        <button class="button primary" id="queue-export-zip" type="button">Download ZIP</button>
      </footer>
    </div>
  `;
  document.body.append(dialog);

  const closeButton = dialog.querySelector(".batch-queue-close");
  const addButton = dialog.querySelector("#queue-add-current");
  const clearButton = dialog.querySelector("#queue-clear");
  const exportButton = dialog.querySelector("#queue-export-zip");
  const list = dialog.querySelector("#batch-queue-list");
  const count = dialog.querySelector("#batch-queue-count");
  const outputInputs = [...dialog.querySelectorAll("[data-queue-output]")];

  function saveQueue(nextQueue) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextQueue));
      queue = nextQueue;
      return true;
    } catch {
      notify("The icon queue could not be stored. Browser storage is full; remove some large queued icons and try again.");
      return false;
    }
  }

  function uniqueName(sourceName, ignoredId = "") {
    const base = cleanName(sourceName) || "Icon";
    const names = new Set(queue.items.filter((item) => item.id !== ignoredId).map((item) => item.name.toLocaleLowerCase()));
    if (!names.has(base.toLocaleLowerCase())) return base;
    let index = 2;
    let candidate = `${base} ${index}`;
    while (names.has(candidate.toLocaleLowerCase())) candidate = `${base} ${++index}`;
    return candidate.slice(0, 64);
  }

  function captureCurrent() {
    try {
      const snapshot = sanitizeSnapshot(session.capture());
      const svg = buildUnitySvg();
      if (!snapshot || !svg || svg.length > SVG_SIZE_LIMIT || !validateUnitySvg(svg)) throw new Error();
      const resolvedName = cleanName(fileName().replace(/_/g, " ")) || "Icon";
      return { snapshot, svg, name: resolvedName };
    } catch {
      notify("The current icon could not be added to the queue.");
      return null;
    }
  }

  function updateControls() {
    trigger.querySelector("b").textContent = String(queue.items.length);
    trigger.classList.toggle("has-items", queue.items.length > 0);
    count.textContent = String(queue.items.length);
    clearButton.disabled = queue.items.length === 0 || exporting;
    addButton.disabled = exporting;
    exportButton.disabled = queue.items.length === 0 || exporting;
    outputInputs.forEach((input) => {
      input.checked = Boolean(queue.outputs[input.dataset.queueOutput]);
      input.disabled = exporting;
    });
  }

  function createAction(label, className, handler) {
    const button = document.createElement("button");
    button.className = `batch-queue-action ${className}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function renderQueue() {
    list.replaceChildren();
    if (!queue.items.length) {
      const empty = document.createElement("div");
      empty.className = "batch-queue-empty";
      empty.innerHTML = "<strong>The queue is empty</strong><span>Finish an icon in the editor, then add the current version here.</span>";
      list.append(empty);
      updateControls();
      return;
    }

    for (const item of queue.items) {
      const row = document.createElement("article");
      row.className = "batch-queue-item";

      const preview = document.createElement("img");
      preview.className = "batch-queue-preview";
      preview.alt = "";
      preview.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg)}`;

      const information = document.createElement("div");
      information.className = "batch-queue-info";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const detail = document.createElement("small");
      detail.textContent = item.snapshot.showText && item.snapshot.text.trim()
        ? `${item.snapshot.text.trim()} · ${item.snapshot.glyph.name}`
        : item.snapshot.glyph.name;
      information.append(name, detail);

      const actions = document.createElement("div");
      actions.className = "batch-queue-actions";
      actions.append(
        createAction("Open", "primary", () => openItem(item.id)),
        createAction("Update", "", () => updateItem(item.id)),
        createAction("Duplicate", "", () => duplicateItem(item.id)),
        createAction("Rename", "", () => renameItem(item.id)),
        createAction("Remove", "danger", () => removeItem(item.id))
      );

      row.append(preview, information, actions);
      list.append(row);
    }
    updateControls();
  }

  function addCurrent() {
    const captured = captureCurrent();
    if (!captured) return;
    const now = Date.now();
    const item = {
      id: makeId(),
      name: uniqueName(captured.name),
      snapshot: captured.snapshot,
      svg: captured.svg,
      createdAt: now,
      updatedAt: now
    };
    if (!saveQueue({ ...queue, items: [...queue.items, item] })) return;
    notify(`Added to queue: ${item.name}`);
    renderQueue();
  }

  function openItem(id) {
    const item = queue.items.find((entry) => entry.id === id);
    if (!item) return;
    const snapshot = sanitizeSnapshot(item.snapshot);
    if (!snapshot || !session.apply(snapshot, `Opened queue item: ${item.name}`)) {
      notify("This queued icon could not be opened.");
      return;
    }
    dialog.close();
  }

  function updateItem(id) {
    const current = queue.items.find((entry) => entry.id === id);
    if (!current) return;
    const captured = captureCurrent();
    if (!captured) return;
    const updated = {
      ...current,
      snapshot: captured.snapshot,
      svg: captured.svg,
      updatedAt: Date.now()
    };
    const items = queue.items.map((item) => item.id === id ? updated : item);
    if (!saveQueue({ ...queue, items })) return;
    notify(`Updated queue item: ${current.name}`);
    renderQueue();
  }

  function duplicateItem(id) {
    const source = queue.items.find((entry) => entry.id === id);
    if (!source) return;
    const now = Date.now();
    const copy = {
      ...clone(source),
      id: makeId(),
      name: uniqueName(`${source.name} copy`),
      createdAt: now,
      updatedAt: now
    };
    const sourceIndex = queue.items.findIndex((item) => item.id === id);
    const items = [...queue.items];
    items.splice(sourceIndex + 1, 0, copy);
    if (!saveQueue({ ...queue, items })) return;
    notify(`Duplicated queue item: ${copy.name}`);
    renderQueue();
  }

  function renameItem(id) {
    const item = queue.items.find((entry) => entry.id === id);
    if (!item) return;
    const requested = window.prompt("Rename queued icon", item.name);
    if (requested == null) return;
    const name = uniqueName(requested, item.id);
    if (!name || name === item.name) return;
    const items = queue.items.map((entry) => entry.id === id ? { ...entry, name, updatedAt: Date.now() } : entry);
    if (!saveQueue({ ...queue, items })) return;
    notify(`Renamed queue item to: ${name}`);
    renderQueue();
  }

  function removeItem(id) {
    const item = queue.items.find((entry) => entry.id === id);
    if (!item) return;
    const items = queue.items.filter((entry) => entry.id !== id);
    if (!saveQueue({ ...queue, items })) return;
    notify(`Removed from queue: ${item.name}`);
    renderQueue();
  }

  function clearQueue() {
    if (!queue.items.length || !window.confirm("Remove every icon from the queue?")) return;
    if (!saveQueue({ ...queue, items: [] })) return;
    notify("Icon queue cleared.");
    renderQueue();
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

  async function svgToPng(svg, size) {
    const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = source;
      });
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, size, size);
      const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error()), "image/png"));
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(source);
    }
  }

  function downloadBlob(name, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function exportZip() {
    if (!queue.items.length || exporting) return;
    const enabled = Object.entries(queue.outputs).filter(([, value]) => value).map(([key]) => key);
    if (!enabled.length) {
      notify("Select at least one ZIP output format.");
      return;
    }

    exporting = true;
    exportButton.textContent = "Preparing…";
    updateControls();
    try {
      const entries = [];
      for (let index = 0; index < queue.items.length; index += 1) {
        const item = queue.items[index];
        const base = slug(item.name);
        exportButton.textContent = `Preparing ${index + 1}/${queue.items.length}`;
        if (queue.outputs.svg) entries.push({ name: `svg/${base}.svg`, data: item.svg });
        for (const size of [64, 128, 256]) {
          if (!queue.outputs[`png${size}`]) continue;
          entries.push({ name: `png_${size}/${base}_${size}.png`, data: await svgToPng(item.svg, size) });
        }
      }

      entries.push({
        name: "script_icon_studio_manifest.json",
        data: `${JSON.stringify({
          format: "script-icon-studio-icon-batch",
          version: 1,
          exportedAt: new Date().toISOString(),
          outputs: clone(queue.outputs),
          icons: queue.items.map((item) => ({ name: item.name, fileName: slug(item.name) }))
        }, null, 2)}\n`
      });

      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(`script_icon_studio_icons_${date}.zip`, createZip(entries));
      notify(`Downloaded ZIP with ${queue.items.length} icon${queue.items.length === 1 ? "" : "s"}.`);
    } catch {
      notify("The ZIP could not be generated.");
    } finally {
      exporting = false;
      exportButton.textContent = "Download ZIP";
      updateControls();
    }
  }

  function openDialog() {
    renderQueue();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  trigger.addEventListener("click", openDialog);
  closeButton.addEventListener("click", () => dialog.close());
  addButton.addEventListener("click", addCurrent);
  clearButton.addEventListener("click", clearQueue);
  exportButton.addEventListener("click", exportZip);
  outputInputs.forEach((input) => input.addEventListener("change", () => {
    const outputs = { ...queue.outputs, [input.dataset.queueOutput]: input.checked };
    if (!Object.values(outputs).some(Boolean)) {
      input.checked = true;
      notify("Keep at least one ZIP output format selected.");
      return;
    }
    saveQueue({ ...queue, outputs });
    updateControls();
  }));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && !exporting) dialog.close();
  });

  renderQueue();
})();
