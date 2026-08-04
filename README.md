<p align="center">
  <img src="src/assets/unity-icon-studio.svg" width="104" alt="Script Icon Studio logo">
</p>

<h1 align="center">Script Icon Studio</h1>

<p align="center">
  A small browser editor for creating consistent icons for Unity projects.
</p>

<p align="center">
  <a href="https://scripticonstudio.pages.dev/"><strong>Open the editor</strong></a>
  ·
  <a href="https://github.com/Natteens/Script-Icon-Studio"><strong>View source</strong></a>
</p>

## What it does

Script Icon Studio keeps the repetitive parts of icon creation in one place. Pick a shape and palette, find a glyph, adjust it, and export the result without opening a full graphics editor.

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
- PNG export at 64, 128, and 256 pixels
- Unity-compatible SVG export for UI Toolkit Vector Image
- No application server, account, build step, or runtime dependency

Editing and export happen locally in the browser. Only glyph search sends a request, using the public Iconify API.

## Export formats

### PNG

Use PNG when you need a regular image for a Unity project, including editor tools, package artwork, documentation, or a script icon workflow that expects a texture.

### Unity SVG

The SVG download is built specifically for Unity's **UI Toolkit Vector Image** importer. It is intended for interfaces made with UI Toolkit and is not presented as a direct replacement for a regular script icon texture.

The editor flattens the selected shape and glyph into the root `64 × 64` coordinate system, converts the label into vector paths, writes the band as already-clipped geometry, and resolves every color directly on each path.

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

Cloudflare Pages publishes the `src` directory automatically after every push to `main`. There is no build command because the files in `src` are already ready to serve.

## Third-party icons

Search results come from the public Iconify API and are restricted to:

- [Lucide](https://lucide.dev/license) under the ISC License
- [Phosphor](https://github.com/phosphor-icons/core) under the MIT License
- [Material Symbols](https://github.com/google/material-design-icons) under the Apache License 2.0

Imported SVGs retain their original licenses. Check the selected collection's terms before distributing an icon pack. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for the source and license list.

## Independence notice

Script Icon Studio is an independent project. It is not affiliated with, sponsored by, or endorsed by Unity Technologies. Unity is a trademark of Unity Technologies or its affiliates.

## License

Script Icon Studio is available under the [MIT License](./LICENSE).

## Keyboard shortcut

Press `Ctrl + S` or `Cmd + S` to download the current Unity SVG.
