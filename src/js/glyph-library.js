"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:glyph-library:v1";
  const RECENT_LIMIT = 12;
  const FAVORITE_LIMIT = 48;
  const CUSTOM_MARKUP_LIMIT = 100000;

  const results = document.querySelector("#glyph-results");
  const tabs = document.querySelector("#glyph-collection-tabs");
  const recentCount = document.querySelector("#recent-count");
  const favoriteCount = document.querySelector("#favorite-count");
  const favoriteCurrent = document.querySelector("#favorite-current");
  const mainIcon = document.querySelector("#main-icon");

  if (!results || !tabs || !recentCount || !favoriteCount || !favoriteCurrent || !mainIcon) return;

  let library = loadLibrary();
  let currentView = "browse";
  let lastGlyphId = "";
  let recordQueued = false;

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function cleanText(value, limit = 160) {
    return String(value || "").trim().slice(0, limit);
  }

  function normalizeViewBox(value) {
    const numbers = String(value || "").trim().split(/[ ,]+/).map(Number);
    if (numbers.length !== 4 || !numbers.every(Number.isFinite) || numbers[2] <= 0 || numbers[3] <= 0) return null;
    return numbers.join(" ");
  }

  function serializeGlyph(glyph) {
    if (!glyph || !glyph.id || !glyph.name) return null;
    const id = cleanText(glyph.id, 220);
    const name = cleanText(glyph.name, 160);
    if (!id || !name) return null;

    if (id.startsWith("custom:")) {
      const viewBox = normalizeViewBox(glyph.viewBox);
      const markup = String(glyph.markup || "");
      if (!viewBox || !markup || markup.length > CUSTOM_MARKUP_LIMIT) return null;
      return { id, name, viewBox, markup };
    }

    if (id.startsWith("local:")) return { id, name };

    const prefix = cleanText(glyph.prefix || id.split(":")[0], 80);
    if (!prefix || !/^[a-z0-9-]+:[a-z0-9][a-z0-9:_-]*$/i.test(id)) return null;
    return { id, name, prefix, remote: true };
  }

  function normalizeStoredGlyph(value) {
    const serialized = serializeGlyph(value);
    if (!serialized) return null;

    if (serialized.id.startsWith("custom:")) {
      const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${serialized.viewBox}">${serialized.markup}</svg>`;
      const sanitized = sanitizeSvg(source);
      if (!sanitized) return null;
      return { ...serialized, viewBox: sanitized.viewBox, markup: sanitized.markup };
    }

    return serialized;
  }

  function normalizeList(value, limit) {
    if (!Array.isArray(value)) return [];
    const seen = new Set();
    const normalized = [];
    for (const entry of value) {
      const glyph = normalizeStoredGlyph(entry);
      if (!glyph || seen.has(glyph.id)) continue;
      seen.add(glyph.id);
      normalized.push(glyph);
      if (normalized.length >= limit) break;
    }
    return normalized;
  }

  function loadLibrary() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return {
        recent: normalizeList(stored?.recent, RECENT_LIMIT),
        favorites: normalizeList(stored?.favorites, FAVORITE_LIMIT)
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { recent: [], favorites: [] };
    }
  }

  function saveLibrary(nextLibrary, failureMessage = "Glyph library could not be saved in this browser.") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLibrary));
      library = nextLibrary;
      return true;
    } catch {
      notify(failureMessage);
      return false;
    }
  }

  function resolveGlyph(entry) {
    if (!entry) return null;
    const builtIn = builtIns.find((glyph) => glyph.id === entry.id);
    return builtIn || clone(entry);
  }

  function findGlyph(id) {
    if (state.glyph?.id === id) return state.glyph;
    const builtIn = builtIns.find((glyph) => glyph.id === id);
    if (builtIn) return builtIn;
    const stored = [...library.favorites, ...library.recent].find((glyph) => glyph.id === id);
    if (stored) return resolveGlyph(stored);

    if (/^[a-z0-9-]+:[a-z0-9][a-z0-9:_-]*$/i.test(id)) {
      const [prefix, ...nameParts] = id.split(":");
      return { id, name: nameParts.join(":"), prefix, remote: true };
    }

    return null;
  }

  function isFavorite(id) {
    return library.favorites.some((glyph) => glyph.id === id);
  }

  function updateCounts() {
    recentCount.textContent = String(library.recent.length);
    favoriteCount.textContent = String(library.favorites.length);
  }

  function updateTabs() {
    tabs.querySelectorAll("[data-glyph-view]").forEach((button) => {
      const active = button.dataset.glyphView === currentView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  function updateCurrentFavorite() {
    const active = isFavorite(state.glyph?.id);
    favoriteCurrent.classList.toggle("active", active);
    favoriteCurrent.setAttribute("aria-pressed", String(active));
    favoriteCurrent.textContent = active ? "★ Favorited" : "☆ Favorite";
    favoriteCurrent.title = active ? "Remove current glyph from favorites" : "Add current glyph to favorites";
  }

  function updateFavoriteButtons() {
    results.querySelectorAll("[data-favorite-glyph]").forEach((button) => {
      const active = isFavorite(button.dataset.favoriteGlyph);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      button.textContent = active ? "★" : "☆";
      button.title = active ? "Remove from favorites" : "Add to favorites";
    });
    updateCurrentFavorite();
  }

  function decorateResults() {
    [...results.children].forEach((child) => {
      if (!child.classList.contains("glyph-button")) return;
      const id = child.dataset.glyph;
      if (!id) return;

      const item = document.createElement("div");
      item.className = "glyph-item";
      item.dataset.glyphItem = id;
      child.before(item);
      item.append(child);

      const favorite = document.createElement("button");
      favorite.className = "glyph-favorite";
      favorite.type = "button";
      favorite.dataset.favoriteGlyph = id;
      favorite.setAttribute("aria-label", `Favorite ${child.getAttribute("title") || "glyph"}`);
      item.append(favorite);
    });
    updateFavoriteButtons();
  }

  function recordRecent(glyph) {
    const entry = serializeGlyph(glyph);
    if (!entry) return;
    const recent = [entry, ...library.recent.filter((item) => item.id !== entry.id)].slice(0, RECENT_LIMIT);
    if (saveLibrary({ ...library, recent })) {
      updateCounts();
      if (currentView === "recent") showCollection("recent");
    }
  }

  function toggleFavorite(glyph) {
    const entry = serializeGlyph(glyph);
    if (!entry) {
      notify("This imported SVG is too large to save as a favorite.");
      return;
    }

    const removing = isFavorite(entry.id);
    const favorites = removing
      ? library.favorites.filter((item) => item.id !== entry.id)
      : [entry, ...library.favorites.filter((item) => item.id !== entry.id)].slice(0, FAVORITE_LIMIT);

    if (!saveLibrary({ ...library, favorites })) return;
    updateCounts();

    if (currentView === "favorites") showCollection("favorites");
    else updateFavoriteButtons();

    notify(removing ? "Removed from favorites." : "Added to favorites.");
  }

  function setEmptyMessage(message) {
    const empty = results.querySelector(".glyph-empty");
    if (empty) empty.textContent = message;
  }

  function showCollection(view) {
    currentView = view;
    updateTabs();
    const entries = view === "favorites" ? library.favorites : library.recent;
    const glyphs = entries.map(resolveGlyph).filter(Boolean);
    const label = view === "favorites"
      ? `${glyphs.length} favorite${glyphs.length === 1 ? "" : "s"}`
      : `${glyphs.length} recent glyph${glyphs.length === 1 ? "" : "s"}`;

    renderGlyphs(glyphs, label);
    if (!glyphs.length) {
      setEmptyMessage(view === "favorites"
        ? "No favorites yet. Use the star on a glyph to keep it here."
        : "Recently used glyphs will appear here.");
    }
    decorateResults();
  }

  function showBrowse() {
    currentView = "browse";
    updateTabs();
    searchIcons(document.querySelector("#icon-search").value);
  }

  function scheduleRecordCurrent() {
    if (recordQueued) return;
    recordQueued = true;
    queueMicrotask(() => {
      recordQueued = false;
      const id = state.glyph?.id || "";
      updateCurrentFavorite();
      if (!id || id === lastGlyphId) return;
      lastGlyphId = id;
      recordRecent(state.glyph);
    });
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-glyph-view]");
    if (!button) return;
    if (button.dataset.glyphView === "browse") showBrowse();
    else showCollection(button.dataset.glyphView);
  });

  favoriteCurrent.addEventListener("click", () => toggleFavorite(state.glyph));

  results.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-favorite-glyph]");
    if (favorite) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const glyph = findGlyph(favorite.dataset.favoriteGlyph);
      if (glyph) toggleFavorite(glyph);
      return;
    }

    const glyphButton = event.target.closest(".glyph-button[data-glyph]");
    if (!glyphButton || currentView === "browse") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const glyph = findGlyph(glyphButton.dataset.glyph);
    if (glyph) selectGlyph(glyph);
  }, true);

  document.querySelector("#icon-search").addEventListener("input", () => {
    currentView = "browse";
    updateTabs();
  });
  document.querySelector("#search-form").addEventListener("submit", () => {
    currentView = "browse";
    updateTabs();
  });
  document.querySelector("#source-filter").addEventListener("click", () => {
    currentView = "browse";
    updateTabs();
  });

  new MutationObserver(decorateResults).observe(results, { childList: true });
  new MutationObserver(scheduleRecordCurrent).observe(mainIcon, { childList: true });

  updateCounts();
  updateTabs();
  decorateResults();
  lastGlyphId = state.glyph?.id || "";
  recordRecent(state.glyph);
  updateCurrentFavorite();
})();
