"use strict";

(() => {
  const links = {
    repository: "https://github.com/Natteens/Script-Icon-Studio",
    license: "https://github.com/Natteens/Script-Icon-Studio/blob/main/LICENSE",
    notices: "https://github.com/Natteens/Script-Icon-Studio/blob/main/THIRD_PARTY_NOTICES.md",
    support: "https://github.com/sponsors/Natteens"
  };

  const icon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  const githubIcon = icon('<path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>');
  const licenseIcon = icon('<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M6 3.5h9l3 3V20.5H6zM15 3.5v3h3M9 11h6M9 14h6M9 17h4"/>');
  const heartIcon = icon('<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.8 5.7a5.4 5.4 0 0 0-7.7 0L12 6.8l-1.1-1.1a5.4 5.4 0 0 0-7.7 7.7L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.7Z"/>');

  const headerActions = document.querySelector(".header-actions");
  const status = document.querySelector("#status");

  function createHeaderLink({ href, title, content, className = "" }) {
    const link = document.createElement("a");
    link.className = ["project-icon-link", className].filter(Boolean).join(" ");
    link.href = href;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.title = title;
    link.setAttribute("aria-label", title);
    link.innerHTML = content;
    return link;
  }

  headerActions.insertBefore(createHeaderLink({
    href: links.repository,
    title: "Open GitHub repository",
    content: githubIcon
  }), status);

  if (links.support) {
    headerActions.insertBefore(createHeaderLink({
      href: links.support,
      title: "Become a sponsor and support Script Icon Studio",
      className: "project-support-link",
      content: `${heartIcon}<span>Sponsor</span>`
    }), status);
  }

  const privacy = document.querySelector(".privacy-note");
  privacy.innerHTML = `
    <span>Editing and export stay in your browser. Only glyph search uses the network. Script Icon Studio is independent and is not affiliated with Unity Technologies.</span>
    <span class="project-meta-links">
      <a href="${links.repository}" target="_blank" rel="noreferrer">${githubIcon}GitHub</a>
      <a href="${links.license}" target="_blank" rel="noreferrer">${licenseIcon}MIT License</a>
      <a href="${links.notices}" target="_blank" rel="noreferrer">Third-party licenses</a>
      ${links.support ? `<a class="project-support-meta" href="${links.support}" target="_blank" rel="noreferrer">${heartIcon}Become a sponsor</a>` : ""}
    </span>
  `;
})();