<p align="center">
  <img src="src/assets/script-icon-studio.svg" width="112" alt="Script Icon Studio logo">
</p>

<h1 align="center">Script Icon Studio</h1>

<p align="center">
  Create consistent icons for scripts, packages, editor tools, and interfaces directly in your browser.
</p>

<p align="center">
  <a href="https://scripticonstudio.pages.dev/"><strong>Open the editor</strong></a>
  ·
  <a href="https://github.com/sponsors/Natteens">Support the project</a>
  ·
  <a href="./THIRD_PARTY_NOTICES.md">Icon licenses</a>
  ·
  <a href="./LICENSE">MIT License</a>
</p>

## Overview

Script Icon Studio handles the repetitive parts of icon creation. Choose a shape, select colors, search for a glyph, adjust the result, and export it without opening a full graphics editor.

Everything is edited and exported locally in the browser. Only glyph search uses the network through the public Iconify API.

## Features

- Five built-in shapes and support for custom SVG silhouettes
- Fourteen palettes with editable HEX and alpha values
- Glyph search across Lucide, Phosphor, and Material Symbols
- Custom glyph import by file picker or drag and drop
- Optional labels with a band or text-only style
- Exact controls for position, size, rotation, and text size
- Preview at 64, 48, 32, and 16 pixels
- PNG export at 64, 128, and 256 pixels
- Flattened SVG export for UI Toolkit Vector Image
- Automatic draft saving in the browser
- Undo and redo with buttons and keyboard shortcuts
- Automatic and editable output file names
- Copy SVG directly to the clipboard
- Warnings when imported SVG parts are removed
- Warnings when label characters cannot be represented in the exported SVG
- No account, server, build step, or runtime dependency

## Export formats

| Format | Intended use |
| --- | --- |
| PNG | Regular images for scripts, packages, editor tools, documentation, and other texture-based uses |
| SVG | Flattened vector images compatible with Unity UI Toolkit Vector Image |

The SVG export converts labels and imported geometry into explicit paths. The downloaded file uses one root SVG and avoids SVG text, nested SVG elements, CSS, `currentColor`, masks, filters, linked assets, and font references.

## File names

The editor creates a readable name from the label and selected glyph. A label named `FSM` with a hierarchy glyph becomes:

```text
icon_fsm_hierarchy.svg
icon_fsm_hierarchy_64.png
```

Without a label, the selected glyph is used:

```text
icon_emoticon.svg
```

Names use lowercase letters and underscores. The field remains editable, and clearing it restores the automatic name. Colors are not included because changing a palette should not change the identity of the asset.

## Drafts and history

The current icon is stored in the browser automatically. Reloading or reopening the site restores the latest draft from that browser.

Undo and redo history is kept for the current browser session. Imported SVG geometry, colors, transforms, labels, and the custom file name are included in saved drafts.

## Support

Script Icon Studio is free and open source. Optional sponsorships support maintenance, bug fixes, and future improvements through [GitHub Sponsors](https://github.com/sponsors/Natteens).

Sponsorship does not provide private support, custom development, or access to private repositories.

## Run locally

The project uses plain HTML, CSS, and JavaScript.

```bash
python -m http.server 8080 -d src
```

Open `http://localhost:8080` after starting the server.

## Project structure

```text
src/
├── assets/
│   └── script-icon-studio.svg
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── project-links.js
│   └── qol.js
├── .nojekyll
└── index.html
```

Cloudflare Pages publishes the `src` directory automatically after every push to `main`. No build command is required because the files are already ready to serve.

## Icon sources

Search results are limited to these collections:

- [Lucide](https://lucide.dev/license) under the ISC License
- [Phosphor](https://github.com/phosphor-icons/core) under the MIT License
- [Material Symbols](https://github.com/google/material-design-icons) under the Apache License 2.0

Imported SVG files keep their original licenses. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the complete source and license list.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + S` or `Cmd + S` | Download the current SVG |
| `Ctrl + Z` or `Cmd + Z` | Undo the latest change |
| `Ctrl + Y`, `Cmd + Y`, or `Cmd + Shift + Z` | Redo the latest undone change |

## Trademark notice

Script Icon Studio is an independent project. It is not affiliated with, sponsored by, or endorsed by Unity Technologies. Unity is a trademark of Unity Technologies or its affiliates.
