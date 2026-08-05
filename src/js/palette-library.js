"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:palettes:v1";
  const PALETTE_LIMIT = 24;
  const COLOR_KEYS = ["background", "glyph", "outline", "band", "text"];
  const session = window.ScriptIconStudioSession;

  if (!session) throw new Error("ScriptIconStudioSession must load before palette-library.js");

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const cleanName = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 40);
  const makeId = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const builtInNames = new Set(palettes.map((palette) => palette.name.toLocaleLowerCase()));

  function sanitizeColors(value) {
    if (!value || typeof value !== "object") return null;
    const colors = {};
    for (const key of COLOR_KEYS) {
      const color = normalizeHex(value[key]);
      if (!color) return null;
      colors[key] = color;
    }
    return colors;
  }

  function normalizePalette(value) {
    if (!value || typeof value !== "object") return null;
    const id = String(value.id || "").slice(0, 100);
    const name = cleanName(value.name);
    const colors = sanitizeColors(value.colors);
    if (!id || !name || !colors) return null;
    const createdAt = Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : Date.now();
    const updatedAt = Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : createdAt;
    return { id, name, colors, createdAt, updatedAt };
  }

  function loadLibrary() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const items = Array.isArray(stored?.items)
        ? stored.items.map(normalizePalette).filter(Boolean).slice(0, PALETTE_LIMIT)
        : [];
      return { version: 1, items };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { version: 1, items: [] };
    }
  }

  let library = loadLibrary();

  const paletteList = document.querySelector("#palette-list");
  const summary = document.createElement("div");
  summary.className = "custom-palette-summary";
  summary.innerHTML = `
    <span>Saved palettes</span>
    <button class="text-action custom-palette-trigger" type="button">Manage <b>0</b></button>
  `;
  paletteList.after(summary);

  const dialog = document.createElement("dialog");
  dialog.className = "custom-palette-dialog";
  dialog.setAttribute("aria-labelledby", "custom-palette-title");
  dialog.innerHTML = `
    <div class="custom-palette-shell">
      <header class="custom-palette-header">
        <div>
          <h2 id="custom-palette-title">Custom palettes</h2>
          <p>Save and reuse complete color combinations in this browser.</p>
        </div>
        <button class="custom-palette-close" type="button" aria-label="Close custom palettes">×</button>
      </header>
      <section class="custom-palette-save">
        <label for="custom-palette-name">Palette name</label>
        <div>
          <input id="custom-palette-name" type="text" maxlength="40" autocomplete="off" spellcheck="false" placeholder="Fynite Blue" />
          <button class="button primary" id="save-custom-palette" type="button">Save current</button>
        </div>
        <p>The current background, glyph, outline, band, and text colors will be stored.</p>
      </section>
      <div class="custom-palette-list" id="custom-palette-list"></div>
      <footer class="custom-palette-footer">
        <span>Stored locally. Projects already preserve their own colors.</span>
        <span><b id="custom-palette-count">0</b> of ${PALETTE_LIMIT} palettes</span>
      </footer>
    </div>
  `;
  document.body.append(dialog);

  const trigger = summary.querySelector(".custom-palette-trigger");
  const triggerCount = trigger.querySelector("b");
  const closeButton = dialog.querySelector(".custom-palette-close");
  const nameInput = dialog.querySelector("#custom-palette-name");
  const saveButton = dialog.querySelector("#save-custom-palette");
  const list = dialog.querySelector("#custom-palette-list");
  const count = dialog.querySelector("#custom-palette-count");

  function saveLibrary(nextLibrary) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLibrary));
      library = nextLibrary;
      return true;
    } catch {
      notify("Custom palettes could not be stored in this browser.");
      return false;
    }
  }

  function currentColors() {
    return sanitizeColors(state.palette);
  }

  function sameColors(left, right) {
    return COLOR_KEYS.every((key) => normalizeHex(left?.[key]) === normalizeHex(right?.[key]));
  }

  function findNameConflict(name, ignoredId = "") {
    const normalized = name.toLocaleLowerCase();
    if (builtInNames.has(normalized)) return "built-in";
    return library.items.some((item) => item.id !== ignoredId && item.name.toLocaleLowerCase() === normalized)
      ? "custom"
      : "";
  }

  function sortedItems() {
    return [...library.items].sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
  }

  function colorStrip(colors) {
    return COLOR_KEYS.map((key) => `<i style="--palette-color:${colors[key]}" title="${key}"></i>`).join("");
  }

  function createAction(label, className, handler) {
    const button = document.createElement("button");
    button.className = `custom-palette-action ${className}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function activePaletteId() {
    const match = library.items.find((item) => sameColors(item.colors, state.palette));
    return match?.id || "";
  }

  function syncSelections() {
    const activeId = activePaletteId();
    document.querySelectorAll("[data-custom-palette]").forEach((item) => {
      item.classList.toggle("active", item.dataset.customPalette === activeId);
    });
    trigger.classList.toggle("active", Boolean(activeId));
    trigger.title = activeId
      ? `Current colors match ${library.items.find((item) => item.id === activeId)?.name || "a saved palette"}`
      : "Manage custom palettes";
  }

  function renderLibrary() {
    const items = sortedItems();
    list.replaceChildren();
    triggerCount.textContent = String(items.length);
    count.textContent = String(items.length);

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "custom-palette-empty";
      empty.innerHTML = "<strong>No custom palettes yet</strong><span>Adjust the editor colors, give them a name, and save the current combination.</span>";
      list.append(empty);
      syncSelections();
      return;
    }

    const activeId = activePaletteId();
    for (const palette of items) {
      const item = document.createElement("article");
      item.className = "custom-palette-item";
      item.dataset.customPalette = palette.id;
      if (palette.id === activeId) item.classList.add("active");

      const information = document.createElement("button");
      information.className = "custom-palette-info";
      information.type = "button";
      information.title = `Apply ${palette.name}`;
      information.innerHTML = `
        <span class="custom-palette-colors">${colorStrip(palette.colors)}</span>
        <span><strong></strong><small>Apply palette</small></span>
      `;
      information.querySelector("strong").textContent = palette.name;
      information.addEventListener("click", () => applyPalette(palette.id));

      const actions = document.createElement("div");
      actions.className = "custom-palette-actions";
      actions.append(
        createAction("Update", "", () => updatePalette(palette.id)),
        createAction("Rename", "", () => renamePalette(palette.id)),
        createAction("Delete", "danger", () => deletePalette(palette.id))
      );

      item.append(information, actions);
      list.append(item);
    }

    syncSelections();
  }

  function saveCurrentPalette() {
    const name = cleanName(nameInput.value);
    if (!name) {
      notify("Enter a palette name first.");
      nameInput.focus();
      return;
    }
    const conflict = findNameConflict(name);
    if (conflict === "built-in") {
      notify("A built-in palette already uses this name.");
      nameInput.focus();
      return;
    }
    if (conflict) {
      notify("A custom palette already uses this name.");
      nameInput.focus();
      return;
    }
    if (library.items.length >= PALETTE_LIMIT) {
      notify(`You can keep up to ${PALETTE_LIMIT} custom palettes.`);
      return;
    }

    const colors = currentColors();
    if (!colors) {
      notify("The current colors are not valid.");
      return;
    }

    const now = Date.now();
    const palette = { id: makeId(), name, colors, createdAt: now, updatedAt: now };
    if (!saveLibrary({ version: 1, items: [palette, ...library.items] })) return;
    state.palette = { name, ...clone(colors) };
    render();
    nameInput.value = "";
    notify(`Saved palette: ${name}`);
    renderLibrary();
  }

  function applyPalette(id) {
    const palette = library.items.find((item) => item.id === id);
    if (!palette) return;
    const colors = sanitizeColors(palette.colors);
    if (!colors) {
      notify("This custom palette is no longer valid.");
      return;
    }
    state.palette = { name: palette.name, ...clone(colors) };
    render();
    notify(`Applied palette: ${palette.name}`);
    renderLibrary();
  }

  function updatePalette(id) {
    const palette = library.items.find((item) => item.id === id);
    if (!palette) return;
    const colors = currentColors();
    if (!colors) {
      notify("The current colors are not valid.");
      return;
    }
    if (!window.confirm(`Replace the colors in “${palette.name}” with the current editor colors?`)) return;

    const updated = { ...palette, colors, updatedAt: Date.now() };
    const items = library.items.map((item) => item.id === id ? updated : item);
    if (!saveLibrary({ ...library, items })) return;
    state.palette = { name: palette.name, ...clone(colors) };
    render();
    notify(`Updated palette: ${palette.name}`);
    renderLibrary();
  }

  function renamePalette(id) {
    const palette = library.items.find((item) => item.id === id);
    if (!palette) return;
    const requested = window.prompt("Rename custom palette", palette.name);
    if (requested == null) return;
    const name = cleanName(requested);
    if (!name || name === palette.name) return;
    const conflict = findNameConflict(name, palette.id);
    if (conflict === "built-in") {
      notify("A built-in palette already uses this name.");
      return;
    }
    if (conflict) {
      notify("A custom palette already uses this name.");
      return;
    }

    const renamed = { ...palette, name, updatedAt: Date.now() };
    const items = library.items.map((item) => item.id === id ? renamed : item);
    if (!saveLibrary({ ...library, items })) return;
    if (sameColors(palette.colors, state.palette)) {
      state.palette = { ...state.palette, name };
      render();
    }
    notify(`Renamed palette to: ${name}`);
    renderLibrary();
  }

  function deletePalette(id) {
    const palette = library.items.find((item) => item.id === id);
    if (!palette || !window.confirm(`Delete “${palette.name}”?`)) return;
    const items = library.items.filter((item) => item.id !== id);
    if (!saveLibrary({ ...library, items })) return;
    notify(`Deleted palette: ${palette.name}`);
    renderLibrary();
  }

  function openDialog() {
    renderLibrary();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestAnimationFrame(() => nameInput.focus());
  }

  trigger.addEventListener("click", openDialog);
  closeButton.addEventListener("click", () => dialog.close());
  saveButton.addEventListener("click", saveCurrentPalette);
  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveCurrentPalette();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  window.addEventListener(session.eventName, () => {
    syncSelections();
    if (dialog.open) renderLibrary();
  });

  renderLibrary();
})();