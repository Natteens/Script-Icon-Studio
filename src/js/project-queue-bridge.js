"use strict";

(() => {
  const PROJECT_STORAGE_KEY = "script-icon-studio:projects:v1";
  const QUEUE_STORAGE_KEY = "script-icon-studio:icon-queue:v1";
  const FLASH_STORAGE_KEY = "script-icon-studio:project-queue-flash:v1";
  const QUEUE_LIMIT = 24;
  const session = window.ScriptIconStudioSession;

  if (!session) throw new Error("ScriptIconStudioSession must load before project-queue-bridge.js");

  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const cleanName = (value) => String(value || "").replace(/\s+/g, " ").trim().slice(0, 64);
  const makeId = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  function loadProjects() {
    try {
      const stored = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "null");
      return Array.isArray(stored?.projects)
        ? stored.projects.filter((project) => project && cleanName(project.name) && project.snapshot?.version === session.version)
        : [];
    } catch {
      return [];
    }
  }

  function loadQueue() {
    try {
      const stored = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || "null");
      const items = Array.isArray(stored?.items)
        ? stored.items.filter((item) =>
          item &&
          cleanName(item.name) &&
          item.snapshot?.version === session.version &&
          typeof item.svg === "string" &&
          validateUnitySvg(item.svg)
        ).slice(0, QUEUE_LIMIT)
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
      return { version: 1, items: [], outputs: { svg: true, png64: false, png128: false, png256: false } };
    }
  }

  function captureRenderState() {
    return {
      template: state.template,
      palette: clone(state.palette),
      glyph: clone(state.glyph),
      x: state.x,
      y: state.y,
      scale: state.scale,
      rotation: state.rotation,
      source: state.source,
      preview: state.preview,
      customShape: clone(state.customShape),
      showText: state.showText,
      text: state.text,
      textMode: state.textMode,
      textSize: state.textSize,
      outlineEnabled: state.outlineEnabled
    };
  }

  function applyRenderState(snapshot) {
    state.template = snapshot.template;
    state.palette = clone(snapshot.palette);
    state.glyph = clone(snapshot.glyph);
    state.x = snapshot.x;
    state.y = snapshot.y;
    state.scale = snapshot.scale;
    state.rotation = snapshot.rotation;
    state.source = snapshot.source;
    state.preview = snapshot.preview;
    state.customShape = clone(snapshot.customShape);
    state.showText = snapshot.showText;
    state.text = snapshot.text;
    state.textMode = snapshot.textMode;
    state.textSize = snapshot.textSize;
    state.outlineEnabled = snapshot.outlineEnabled;
  }

  function uniqueName(sourceName, names) {
    const base = cleanName(sourceName) || "Icon";
    let candidate = base;
    let index = 2;
    while (names.has(candidate.toLocaleLowerCase())) candidate = `${base} ${index++}`.slice(0, 64);
    names.add(candidate.toLocaleLowerCase());
    return candidate;
  }

  function queueItemFromProject(project, names, timestamp) {
    const snapshot = clone(project.snapshot);
    if (!snapshot || snapshot.version !== session.version) return null;

    const previous = captureRenderState();
    try {
      applyRenderState(snapshot);
      const svg = buildUnitySvg();
      if (!svg || !validateUnitySvg(svg)) return null;
      return {
        id: makeId(),
        name: uniqueName(project.name, names),
        snapshot,
        svg,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch {
      return null;
    } finally {
      applyRenderState(previous);
    }
  }

  function saveFlash(message, reopen) {
    try {
      sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify({ message, reopen }));
    } catch {
      return;
    }
  }

  function addProjectsToQueue(projects, reopen) {
    if (!projects.length) return;

    const queue = loadQueue();
    const available = QUEUE_LIMIT - queue.items.length;
    if (projects.length > available) {
      notify(`The queue has room for ${available} more icon${available === 1 ? "" : "s"}.`);
      return;
    }

    const names = new Set(queue.items.map((item) => cleanName(item.name).toLocaleLowerCase()));
    const now = Date.now();
    const added = projects.map((project, index) => queueItemFromProject(project, names, now + index));
    if (added.some((item) => !item)) {
      notify("One or more saved projects could not be added to the queue.");
      return;
    }

    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify({ ...queue, items: [...queue.items, ...added] }));
    } catch {
      notify("The saved projects could not be added to the queue.");
      return;
    }

    const message = added.length === 1
      ? `Added to queue: ${added[0].name}`
      : `Added ${added.length} saved projects to the queue.`;
    saveFlash(message, reopen);
    window.location.reload();
  }

  function findProjectByName(name) {
    return loadProjects().find((project) => cleanName(project.name) === cleanName(name)) || null;
  }

  function decorateProjectRows() {
    const rows = document.querySelectorAll(".project-list .project-item");
    rows.forEach((row) => {
      const actions = row.querySelector(".project-item-actions");
      if (!actions || actions.querySelector("[data-project-queue-action]")) return;

      const projectName = row.querySelector(".project-item-heading strong")?.textContent || "";
      const button = document.createElement("button");
      button.className = "project-item-action";
      button.type = "button";
      button.dataset.projectQueueAction = "single";
      button.textContent = "Add to Queue";
      button.addEventListener("click", () => {
        const project = findProjectByName(projectName);
        if (!project) {
          notify("This saved project could not be found.");
          return;
        }
        addProjectsToQueue([project], "projects");
      });

      actions.insertBefore(button, actions.children[1] || null);
    });
  }

  function installAddAllButton() {
    const transferActions = document.querySelector(".project-transfer-actions");
    if (!transferActions || transferActions.querySelector("#queue-all-projects")) return;

    const button = document.createElement("button");
    button.className = "button secondary";
    button.id = "queue-all-projects";
    button.type = "button";
    button.textContent = "Add all to queue";
    button.addEventListener("click", () => addProjectsToQueue(loadProjects(), "queue"));

    const note = transferActions.querySelector("span");
    transferActions.insertBefore(button, note || null);
  }

  function refreshProjectActions() {
    installAddAllButton();
    decorateProjectRows();
    const allButton = document.querySelector("#queue-all-projects");
    if (allButton) allButton.disabled = loadProjects().length === 0;
  }

  function restoreFlash() {
    let flash = null;
    try {
      flash = JSON.parse(sessionStorage.getItem(FLASH_STORAGE_KEY) || "null");
      sessionStorage.removeItem(FLASH_STORAGE_KEY);
    } catch {
      return;
    }
    if (!flash) return;

    requestAnimationFrame(() => {
      const trigger = flash.reopen === "queue"
        ? document.querySelector(".batch-queue-trigger")
        : document.querySelector(".project-library-trigger");
      trigger?.click();
      if (flash.message) notify(flash.message);
    });
  }

  const projectList = document.querySelector("#project-list");
  if (projectList) new MutationObserver(refreshProjectActions).observe(projectList, { childList: true });

  refreshProjectActions();
  restoreFlash();
})();