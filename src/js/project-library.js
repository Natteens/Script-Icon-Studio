"use strict";

(() => {
  const STORAGE_KEY = "script-icon-studio:projects:v1";
  const PROJECT_LIMIT = 30;
  const SNAPSHOT_SIZE_LIMIT = 600000;
  const IMPORT_FILE_SIZE_LIMIT = 5000000;
  const PORTABLE_VERSION = 1;
  const PROJECT_EXPORT_FORMAT = "script-icon-studio-project";
  const LIBRARY_EXPORT_FORMAT = "script-icon-studio-library";
  const session = window.ScriptIconStudioSession;

  if (!session) throw new Error("ScriptIconStudioSession must load before project-library.js");

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const clamp = (value, minimum, maximum, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
  };
  const cleanName = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 48);
  const makeId = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  function sanitizeStoredGlyph(glyph) {
    if (!glyph || typeof glyph !== "object") return null;
    const id = String(glyph.id || "").slice(0, 220);
    const name = String(glyph.name || "").trim().slice(0, 160);
    if (!id || !name) return null;

    const builtIn = builtIns.find((entry) => entry.id === id);
    if (builtIn) return clone(builtIn);

    if (id.startsWith("custom:")) {
      const customId = id.slice("custom:".length).trim();
      if (!customId || /[\u0000-\u001f\u007f]/.test(customId)) return null;
    } else if (!/^[a-z0-9-]+:[a-z0-9][a-z0-9:_-]*$/i.test(id)) {
      return null;
    }

    const viewBox = String(glyph.viewBox || "").slice(0, 120);
    const markup = String(glyph.markup || "");
    if (!viewBox || !markup) return null;

    const parsed = sanitizeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`);
    if (!parsed) return null;

    if (id.startsWith("custom:")) return { id, name, ...parsed };
    const prefix = String(glyph.prefix || id.split(":")[0]).slice(0, 80);
    return { id, name, prefix, remote: true, ...parsed };
  }

  function sanitizeStoredShape(shape) {
    if (!shape || typeof shape !== "object") return null;
    const name = String(shape.name || "Custom shape").trim().slice(0, 160) || "Custom shape";
    const viewBox = String(shape.viewBox || "").slice(0, 120);
    const markup = String(shape.markup || "");
    if (!viewBox || !markup) return null;
    const parsed = sanitizeShapeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${markup}</svg>`);
    return parsed ? { name, ...parsed } : null;
  }

  function sanitizeSnapshot(value) {
    if (!value || value.version !== session.version) return null;
    let serialized = "";
    try { serialized = JSON.stringify(value); } catch { return null; }
    if (serialized.length > SNAPSHOT_SIZE_LIMIT) return null;

    const glyph = sanitizeStoredGlyph(value.glyph);
    if (!glyph) return null;

    const palette = {};
    for (const key of ["background", "glyph", "outline", "band", "text"]) {
      const color = normalizeHex(value.palette?.[key]);
      if (!color) return null;
      palette[key] = color;
    }
    palette.name = String(value.palette?.name || "Custom").slice(0, 48) || "Custom";

    const customShape = sanitizeStoredShape(value.customShape);
    const templates = new Set(["bevel", "rounded", "squircle", "cut", "shield", "custom"]);
    let template = templates.has(value.template) ? value.template : "bevel";
    if (template === "custom" && !customShape) template = "bevel";

    const validSources = new Set(["all", ...Object.keys(sources)]);
    const source = validSources.has(value.source) ? value.source : "all";
    const preview = ["grid", "light", "dark"].includes(value.preview) ? value.preview : "grid";
    const textMode = ["band", "plain"].includes(value.textMode) ? value.textMode : "band";

    return {
      version: session.version,
      template,
      palette,
      glyph,
      x: clamp(value.x, -16, 16, 0),
      y: clamp(value.y, -16, 16, 0),
      scale: clamp(value.scale, 0.5, 1.6, 1),
      rotation: clamp(value.rotation, -180, 180, 0),
      source,
      preview,
      customShape,
      showText: Boolean(value.showText),
      text: String(value.text || "ICON").slice(0, 18),
      textMode,
      textSize: clamp(value.textSize, 6, 12, 8.75),
      outlineEnabled: value.outlineEnabled !== false,
      fileName: String(value.fileName || "").slice(0, 64)
    };
  }

  function validTimestamp(value, fallback) {
    const timestamp = Number(value);
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback;
  }

  function normalizeProject(value) {
    if (!value || typeof value !== "object") return null;
    const id = String(value.id || "").slice(0, 100);
    const name = cleanName(value.name);
    const snapshot = sanitizeSnapshot(value.snapshot);
    if (!id || !name || !snapshot) return null;
    const createdAt = validTimestamp(value.createdAt, Date.now());
    const updatedAt = validTimestamp(value.updatedAt, createdAt);
    return { id, name, createdAt, updatedAt, snapshot };
  }

  function normalizePortableProject(value) {
    if (!value || typeof value !== "object") return null;
    const name = cleanName(value.name);
    const snapshot = sanitizeSnapshot(value.snapshot);
    if (!name || !snapshot) return null;
    const createdAt = validTimestamp(value.createdAt, Date.now());
    const updatedAt = validTimestamp(value.updatedAt, createdAt);
    return { name, createdAt, updatedAt, snapshot };
  }

  function loadLibrary() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const projects = Array.isArray(stored?.projects)
        ? stored.projects.map(normalizeProject).filter(Boolean).slice(0, PROJECT_LIMIT)
        : [];
      const activeId = projects.some((project) => project.id === stored?.activeId) ? stored.activeId : "";
      return { version: 1, activeId, projects };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return { version: 1, activeId: "", projects: [] };
    }
  }

  let library = loadLibrary();
  let dirty = false;
  let dirtyQueued = false;

  const folderIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 9h17"/></svg>';
  const trigger = document.createElement("button");
  trigger.className = "button secondary project-library-trigger";
  trigger.type = "button";
  trigger.innerHTML = `${folderIcon}<span class="project-trigger-label">Projects</span><b class="project-trigger-count">0</b><i class="project-dirty-dot" aria-hidden="true"></i>`;

  const firstHistoryButton = document.querySelector(".history-button");
  (firstHistoryButton || document.querySelector("#reset-all")).before(trigger);

  const dialog = document.createElement("dialog");
  dialog.className = "project-library-dialog";
  dialog.setAttribute("aria-labelledby", "project-library-title");
  dialog.innerHTML = `
    <div class="project-dialog-shell">
      <header class="project-dialog-header">
        <div>
          <h2 id="project-library-title">Saved projects</h2>
          <p>Keep complete icon setups in this browser.</p>
        </div>
        <button class="project-dialog-close" type="button" aria-label="Close saved projects">×</button>
      </header>
      <section class="project-save-panel">
        <label for="project-name">Project name</label>
        <div class="project-name-row">
          <input id="project-name" type="text" maxlength="48" autocomplete="off" spellcheck="false" placeholder="Fynite FSM" />
          <button class="button primary" id="save-project-new" type="button">Save new</button>
        </div>
        <div class="project-save-actions">
          <button class="button secondary" id="update-project" type="button" disabled>Update current</button>
          <button class="button secondary" id="new-project" type="button">New editor</button>
          <span id="active-project-status">No saved project is open.</span>
        </div>
        <div class="project-transfer-actions">
          <input id="import-project-file" type="file" accept="application/json,.json" hidden />
          <button class="button secondary" id="import-projects" type="button">Import JSON</button>
          <button class="button secondary" id="export-all-projects" type="button">Export all</button>
          <span>Move saved projects between browsers or keep a local backup.</span>
        </div>
      </section>
      <div class="project-list" id="project-list"></div>
      <footer class="project-dialog-footer">
        <span id="project-storage-note">Stored locally. Nothing is uploaded.</span>
        <span><b id="project-count">0</b> of ${PROJECT_LIMIT} projects</span>
      </footer>
    </div>
  `;
  document.body.append(dialog);

  const nameInput = dialog.querySelector("#project-name");
  const saveNewButton = dialog.querySelector("#save-project-new");
  const updateButton = dialog.querySelector("#update-project");
  const newButton = dialog.querySelector("#new-project");
  const importButton = dialog.querySelector("#import-projects");
  const importInput = dialog.querySelector("#import-project-file");
  const exportAllButton = dialog.querySelector("#export-all-projects");
  const closeButton = dialog.querySelector(".project-dialog-close");
  const list = dialog.querySelector("#project-list");
  const count = dialog.querySelector("#project-count");
  const activeStatus = dialog.querySelector("#active-project-status");

  function activeProject() {
    return library.projects.find((project) => project.id === library.activeId) || null;
  }

  function saveLibrary(nextLibrary, failureMessage = "Saved projects could not be stored in this browser.") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLibrary));
      library = nextLibrary;
      return true;
    } catch {
      notify(failureMessage);
      return false;
    }
  }

  function sortProjects(projects) {
    return [...projects].sort((a, b) => b.updatedAt - a.updatedAt || a.name.localeCompare(b.name));
  }

  function sameName(name, ignoredId = "") {
    const normalized = name.toLocaleLowerCase();
    return library.projects.some((project) => project.id !== ignoredId && project.name.toLocaleLowerCase() === normalized);
  }

  function captureSafeSnapshot() {
    const snapshot = sanitizeSnapshot(session.capture());
    if (!snapshot) notify("This project is too large or contains invalid SVG data.");
    return snapshot;
  }

  function formatDate(timestamp) {
    try {
      return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  }

  function updateHeader() {
    const active = activeProject();
    trigger.querySelector(".project-trigger-count").textContent = String(library.projects.length);
    trigger.classList.toggle("has-active-project", Boolean(active));
    trigger.classList.toggle("has-unsaved-changes", dirty);
    trigger.title = active
      ? `${active.name}${dirty ? " — unsaved changes" : ""}`
      : "Open saved projects";
  }

  function updateActiveStatus() {
    const active = activeProject();
    updateButton.disabled = !active;
    exportAllButton.disabled = library.projects.length === 0;
    activeStatus.textContent = active
      ? `${active.name}${dirty ? " has unsaved changes." : " is up to date."}`
      : "No saved project is open.";
    activeStatus.classList.toggle("dirty", dirty);
  }

  function createAction(label, className, handler) {
    const button = document.createElement("button");
    button.className = `project-item-action ${className}`;
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function renderProjects() {
    list.replaceChildren();
    const projects = sortProjects(library.projects);
    count.textContent = String(projects.length);

    if (!projects.length) {
      const empty = document.createElement("div");
      empty.className = "project-list-empty";
      empty.innerHTML = "<strong>No saved projects yet</strong><span>Name the current icon and save it above, or import a JSON backup.</span>";
      list.append(empty);
      updateHeader();
      updateActiveStatus();
      return;
    }

    for (const project of projects) {
      const item = document.createElement("article");
      item.className = "project-item";
      if (project.id === library.activeId) item.classList.add("active");

      const information = document.createElement("div");
      information.className = "project-item-info";
      const heading = document.createElement("div");
      heading.className = "project-item-heading";
      const name = document.createElement("strong");
      name.textContent = project.name;
      heading.append(name);
      if (project.id === library.activeId) {
        const badge = document.createElement("span");
        badge.textContent = dirty ? "Unsaved" : "Open";
        badge.className = dirty ? "project-badge dirty" : "project-badge";
        heading.append(badge);
      }
      const date = document.createElement("small");
      date.textContent = `Updated ${formatDate(project.updatedAt)}`;
      information.append(heading, date);

      const actions = document.createElement("div");
      actions.className = "project-item-actions";
      actions.append(
        createAction("Open", "primary", () => openProject(project.id)),
        createAction("Export", "", () => exportProject(project.id)),
        createAction("Duplicate", "", () => duplicateProject(project.id)),
        createAction("Rename", "", () => renameProject(project.id)),
        createAction("Delete", "danger", () => deleteProject(project.id))
      );

      item.append(information, actions);
      list.append(item);
    }

    updateHeader();
    updateActiveStatus();
  }

  function openProject(id) {
    const project = library.projects.find((entry) => entry.id === id);
    if (!project) return;
    const snapshot = sanitizeSnapshot(project.snapshot);
    if (!snapshot) {
      notify("This saved project could not be opened.");
      return;
    }

    const nextLibrary = { ...library, activeId: project.id };
    if (!saveLibrary(nextLibrary)) return;
    nameInput.value = project.name;
    dirty = false;
    if (!session.apply(snapshot, `Opened: ${project.name}`)) {
      saveLibrary({ ...library, activeId: "" });
      notify("This saved project could not be opened.");
      return;
    }
    dialog.close();
    renderProjects();
  }

  function saveNewProject() {
    const name = cleanName(nameInput.value);
    if (!name) {
      notify("Enter a project name first.");
      nameInput.focus();
      return;
    }
    if (sameName(name)) {
      notify("A saved project already uses this name.");
      nameInput.focus();
      return;
    }
    if (library.projects.length >= PROJECT_LIMIT) {
      notify(`You can keep up to ${PROJECT_LIMIT} saved projects.`);
      return;
    }

    const snapshot = captureSafeSnapshot();
    if (!snapshot) return;
    const now = Date.now();
    const project = { id: makeId(), name, createdAt: now, updatedAt: now, snapshot };
    const nextLibrary = { version: 1, activeId: project.id, projects: [project, ...library.projects] };
    if (!saveLibrary(nextLibrary)) return;
    dirty = false;
    session.resetHistory("project-saved");
    notify(`Saved: ${name}`);
    renderProjects();
  }

  function updateCurrentProject() {
    const project = activeProject();
    if (!project) return;
    const name = cleanName(nameInput.value) || project.name;
    if (sameName(name, project.id)) {
      notify("A saved project already uses this name.");
      nameInput.focus();
      return;
    }
    const snapshot = captureSafeSnapshot();
    if (!snapshot) return;

    const updated = { ...project, name, updatedAt: Date.now(), snapshot };
    const projects = library.projects.map((entry) => entry.id === project.id ? updated : entry);
    if (!saveLibrary({ ...library, projects })) return;
    nameInput.value = name;
    dirty = false;
    session.resetHistory("project-updated");
    notify(`Updated: ${name}`);
    renderProjects();
  }

  function uniqueCopyName(sourceName) {
    let candidate = `${sourceName} copy`.slice(0, 48);
    let index = 2;
    while (sameName(candidate)) {
      const suffix = ` copy ${index++}`;
      candidate = `${sourceName.slice(0, Math.max(1, 48 - suffix.length))}${suffix}`;
    }
    return candidate;
  }

  function duplicateProject(id) {
    const source = library.projects.find((project) => project.id === id);
    if (!source) return;
    if (library.projects.length >= PROJECT_LIMIT) {
      notify(`You can keep up to ${PROJECT_LIMIT} saved projects.`);
      return;
    }
    const now = Date.now();
    const copy = {
      id: makeId(),
      name: uniqueCopyName(source.name),
      createdAt: now,
      updatedAt: now,
      snapshot: clone(source.snapshot)
    };
    if (!saveLibrary({ ...library, projects: [copy, ...library.projects] })) return;
    notify(`Duplicated: ${copy.name}`);
    renderProjects();
  }

  function renameProject(id) {
    const project = library.projects.find((entry) => entry.id === id);
    if (!project) return;
    const requested = window.prompt("Rename saved project", project.name);
    if (requested == null) return;
    const name = cleanName(requested);
    if (!name || name === project.name) return;
    if (sameName(name, project.id)) {
      notify("A saved project already uses this name.");
      return;
    }
    const renamed = { ...project, name, updatedAt: Date.now() };
    const projects = library.projects.map((entry) => entry.id === project.id ? renamed : entry);
    if (!saveLibrary({ ...library, projects })) return;
    if (library.activeId === project.id) nameInput.value = name;
    notify(`Renamed to: ${name}`);
    renderProjects();
  }

  function deleteProject(id) {
    const project = library.projects.find((entry) => entry.id === id);
    if (!project || !window.confirm(`Delete “${project.name}”?`)) return;
    const projects = library.projects.filter((entry) => entry.id !== id);
    const activeId = library.activeId === id ? "" : library.activeId;
    if (!saveLibrary({ ...library, activeId, projects })) return;
    if (!activeId) {
      nameInput.value = "";
      dirty = false;
    }
    notify(`Deleted: ${project.name}`);
    renderProjects();
  }

  function startNewEditor() {
    if ((dirty || activeProject()) && !window.confirm("Start a new editor? Save current changes first if you need them.")) return;
    if (!saveLibrary({ ...library, activeId: "" })) return;
    nameInput.value = "";
    dirty = false;
    document.querySelector("#reset-all").click();
    queueMicrotask(() => session.resetHistory("new-project"));
    dialog.close();
    renderProjects();
    notify("New editor started.");
  }

  function portableProject(project) {
    return {
      name: project.name,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      snapshot: clone(project.snapshot)
    };
  }

  function slug(value) {
    return String(value || "project")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64) || "project";
  }

  function downloadJson(fileName, payload) {
    const content = `${JSON.stringify(payload, null, 2)}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function projectPayload(project) {
    return {
      format: PROJECT_EXPORT_FORMAT,
      version: PORTABLE_VERSION,
      exportedAt: new Date().toISOString(),
      project: portableProject(project)
    };
  }

  function libraryPayload() {
    return {
      format: LIBRARY_EXPORT_FORMAT,
      version: PORTABLE_VERSION,
      exportedAt: new Date().toISOString(),
      projects: sortProjects(library.projects).map(portableProject)
    };
  }

  function exportProject(id) {
    const project = library.projects.find((entry) => entry.id === id);
    if (!project) return;
    downloadJson(`script_icon_studio_${slug(project.name)}.json`, projectPayload(project));
    notify(`Exported: ${project.name}`);
  }

  function exportAllProjects() {
    if (!library.projects.length) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`script_icon_studio_projects_${date}.json`, libraryPayload());
    notify(`Exported ${library.projects.length} saved project${library.projects.length === 1 ? "" : "s"}.`);
  }

  function importedCandidates(payload) {
    if (!payload || typeof payload !== "object" || payload.version !== PORTABLE_VERSION) return null;
    if (payload.format === PROJECT_EXPORT_FORMAT) return payload.project ? [payload.project] : null;
    if (payload.format === LIBRARY_EXPORT_FORMAT) return Array.isArray(payload.projects) ? payload.projects : null;
    return null;
  }

  function uniqueImportedName(sourceName, takenNames) {
    const normalized = sourceName.toLocaleLowerCase();
    if (!takenNames.has(normalized)) {
      takenNames.add(normalized);
      return sourceName;
    }

    const baseSuffix = " imported";
    let candidate = `${sourceName.slice(0, Math.max(1, 48 - baseSuffix.length))}${baseSuffix}`;
    let index = 2;
    while (takenNames.has(candidate.toLocaleLowerCase())) {
      const suffix = ` imported ${index++}`;
      candidate = `${sourceName.slice(0, Math.max(1, 48 - suffix.length))}${suffix}`;
    }
    takenNames.add(candidate.toLocaleLowerCase());
    return candidate;
  }

  async function importProjects(file) {
    if (!file) return;
    if (file.size > IMPORT_FILE_SIZE_LIMIT) {
      notify("This JSON file is too large to import.");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(await file.text());
    } catch {
      notify("This file is not valid JSON.");
      return;
    }

    const candidates = importedCandidates(payload);
    if (!candidates || !candidates.length) {
      notify("This is not a supported Script Icon Studio project file.");
      return;
    }

    const normalized = candidates.map(normalizePortableProject);
    if (normalized.some((project) => !project)) {
      notify("The project file contains invalid or unsupported data.");
      return;
    }

    const available = PROJECT_LIMIT - library.projects.length;
    if (normalized.length > available) {
      notify(`Not enough space. You can import ${available} more project${available === 1 ? "" : "s"}.`);
      return;
    }

    const takenNames = new Set(library.projects.map((project) => project.name.toLocaleLowerCase()));
    let renamed = 0;
    const now = Date.now();
    const imported = normalized.map((project, index) => {
      const name = uniqueImportedName(project.name, takenNames);
      if (name !== project.name) renamed += 1;
      return {
        id: makeId(),
        name,
        createdAt: validTimestamp(project.createdAt, now + index),
        updatedAt: now + index,
        snapshot: clone(project.snapshot)
      };
    });

    const nextLibrary = { ...library, projects: [...imported, ...library.projects] };
    if (!saveLibrary(nextLibrary, "Imported projects could not be stored in this browser.")) return;
    renderProjects();
    const renameNote = renamed ? ` ${renamed} duplicate name${renamed === 1 ? " was" : "s were"} renamed.` : "";
    notify(`Imported ${imported.length} project${imported.length === 1 ? "" : "s"}.${renameNote}`);
  }

  function refreshDirtyState() {
    dirtyQueued = false;
    const project = activeProject();
    if (!project) {
      dirty = false;
    } else {
      const current = sanitizeSnapshot(session.capture());
      dirty = Boolean(current) && session.fingerprint(current) !== session.fingerprint(project.snapshot);
    }
    updateHeader();
    updateActiveStatus();
    if (dialog.open) renderProjects();
  }

  function scheduleDirtyRefresh() {
    if (dirtyQueued) return;
    dirtyQueued = true;
    queueMicrotask(refreshDirtyState);
  }

  function openDialog() {
    const project = activeProject();
    nameInput.value = project?.name || "";
    refreshDirtyState();
    renderProjects();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    requestAnimationFrame(() => nameInput.focus());
  }

  trigger.addEventListener("click", openDialog);
  closeButton.addEventListener("click", () => dialog.close());
  saveNewButton.addEventListener("click", saveNewProject);
  updateButton.addEventListener("click", updateCurrentProject);
  newButton.addEventListener("click", startNewEditor);
  importButton.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const [file] = importInput.files || [];
    importInput.value = "";
    await importProjects(file);
  });
  exportAllButton.addEventListener("click", exportAllProjects);
  nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      activeProject() ? updateCurrentProject() : saveNewProject();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  window.addEventListener(session.eventName, scheduleDirtyRefresh);

  renderProjects();
  scheduleDirtyRefresh();
})();