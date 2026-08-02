<p align="center">
  <img src="src/assets/unity-icon-studio.svg" width="104" alt="Unity Icon Studio logo">
</p>

<h1 align="center">Unity Icon Studio</h1>

<p align="center">
  A small browser editor for building consistent 64 × 64 Unity script icons.
</p>

<p align="center">
  <a href="https://natteens.github.io/unity-icon-studio/"><strong>Open the editor</strong></a>
  ·
  <a href="https://github.com/Natteens/unity-icon-studio/actions/workflows/pages.yml">Deployment status</a>
</p>

## What it does

Unity Icon Studio keeps the repetitive parts of script icon creation in one place. Pick a shape and palette, find a glyph, adjust it, and export the result without opening a full graphics editor.

- Five built-in vector shapes: Bevel, Rounded, Squircle, Cut corners, and Shield
- Custom shape import from a filled SVG silhouette
- Fourteen built-in palettes, including a translucent RGBA preset
- Editable `#RRGGBB` and `#RRGGBBAA` values for every color
- Optional outline with independent color and alpha
- Integrated search across Lucide, Phosphor, and Material Symbols
- Optional labels with a colored band or text-only style
- Automatic label fitting and clipping so text stays inside the icon
- Separate band, text, background, glyph, and outline colors
- Glyph SVG import by file picker or drag and drop
- Position, scale, rotation, and text-size controls with sliders and exact numeric fields
- Actual-size previews at 64, 48, and 32 pixels
- Unity-compatible SVG export and PNG export at 64, 128, and 256 pixels
- No application server, account, build step, or runtime dependency

Editing and export happen locally in the browser. Only glyph search sends a request, using the public Iconify API.

## Unity SVG export

The SVG download is built specifically for Unity's **UI Toolkit Vector Image** importer. The editor flattens the selected shape and glyph into the root `64 × 64` coordinate system, converts the label into vector paths, writes the band as already-clipped geometry, and resolves every color directly on each path.

Exported files contain a single root `<svg>` and path geometry only. They do not contain SVG text, nested SVGs, CSS, `currentColor`, transforms, clipping definitions, masks, filters, linked assets, or font references. Existing Unity `.meta` files are not involved or modified by the editor.

The on-screen preview uses the browser renderer, while the downloaded SVG uses flattened geometry. Curves are sampled at sub-pixel precision so the result remains visually consistent and importable at 16, 32, and 64 pixels.

## Run locally

The project is plain HTML, CSS, and JavaScript. Start any static file server from the repository root:

```bash
python -m http.server 8080 -d src
```

Then open `http://localhost:8080`.

## Project structure

```text
src/
├── assets/
│   └── unity-icon-studio.svg
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── .nojekyll
└── index.html
```

GitHub Pages publishes the `src` directory after every push to `main`. The workflow contains no install or build phase because the source is already deployable.

## Glyph sources

Search results come from the public [Iconify API](https://iconify.design/docs/api/) and are restricted to:

- [Lucide](https://lucide.dev/license) — ISC
- [Phosphor](https://github.com/phosphor-icons/core) — MIT
- [Material Symbols](https://github.com/google/material-design-icons) — Apache 2.0

Imported SVGs retain their original licenses. Check the selected collection's terms before distributing an icon pack.

## Keyboard shortcut

Press `Ctrl + S` or `Cmd + S` to download the current SVG.
