export type Palette = {
  name: string;
  background: string;
  foreground: string;
  band: string;
  fold: string;
  outline: string;
};

export type Glyph = {
  id: string;
  name: string;
  viewBox: string;
  markup: string;
};

export const palettes: Palette[] = [
  { name: "Branco", background: "#F8FAFC", foreground: "#2B3445", band: "#E7EAF0", fold: "#FFFFFF", outline: "#A9B0BC" },
  { name: "Azul", background: "#4D87ED", foreground: "#FFFFFF", band: "#3C6FC9", fold: "#76A3F4", outline: "#315DA4" },
  { name: "Rosa", background: "#F34F8C", foreground: "#FFFFFF", band: "#CD3F76", fold: "#F777A8", outline: "#A92E60" },
  { name: "Roxo", background: "#9B64E8", foreground: "#FFFFFF", band: "#7D4FC3", fold: "#B88AF1", outline: "#62399F" },
  { name: "Vermelho", background: "#ED3454", foreground: "#FFFFFF", band: "#C52945", fold: "#F1667E", outline: "#9F1D35" },
];

const fill = "currentColor";

export const glyphs: Glyph[] = [
  {
    id: "nodes", name: "State",
    viewBox: "0 0 24 24",
    markup: `<path d="M6.5 7.5 17.5 6M6.8 8.3l10.4 9.3M18 7.7v8.1" fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round"/><circle cx="5" cy="8" r="3" fill="${fill}"/><circle cx="19" cy="6" r="3" fill="${fill}"/><circle cx="18" cy="18" r="3" fill="${fill}"/>`,
  },
  {
    id: "gear", name: "Sistema",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" fill-rule="evenodd" d="M9.2 2h5.6l.5 2.2 1.7 1 2.2-.7 2.8 4.8-1.7 1.5v2.4l1.7 1.5-2.8 4.8-2.2-.7-1.7 1-.5 2.2H9.2l-.5-2.2-1.7-1-2.2.7L2 14.7l1.7-1.5v-2.4L2 9.3l2.8-4.8 2.2.7 1.7-1L9.2 2Zm2.8 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/>`,
  },
  {
    id: "spark", name: "Efeito",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" d="M12 1.8c.5 4.7 3.5 7.7 8.2 8.2-4.7.5-7.7 3.5-8.2 8.2-.5-4.7-3.5-7.7-8.2-8.2 4.7-.5 7.7-3.5 8.2-8.2Z"/><path fill="${fill}" d="M19 15.5c.2 2 1.5 3.3 3.5 3.5-2 .2-3.3 1.5-3.5 3.5-.2-2-1.5-3.3-3.5-3.5 2-.2 3.3-1.5 3.5-3.5Z"/>`,
  },
  {
    id: "sword", name: "Arma",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" d="m20.8 2-2.1 7.4-7.6 7.6-2.2-2.2 7.6-7.6L20.8 2ZM7.6 15.3l1.1 1.1-2.1 2.1 1.3 1.3-1.5 1.5-3.7-3.7 1.5-1.5 1.3 1.3 2.1-2.1Z"/>`,
  },
  {
    id: "target", name: "Alvo",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" fill-rule="evenodd" d="M10.5 2h3v2.2a8 8 0 0 1 6.3 6.3H22v3h-2.2a8 8 0 0 1-6.3 6.3V22h-3v-2.2a8 8 0 0 1-6.3-6.3H2v-3h2.2a8 8 0 0 1 6.3-6.3V2Zm1.5 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>`,
  },
  {
    id: "sound", name: "Som",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" d="M3 9h4l5-4v14l-5-4H3V9Zm12.2-.7a5 5 0 0 1 0 7.4l-1.4-1.5a3 3 0 0 0 0-4.4l1.4-1.5Zm2.7-2.8a9 9 0 0 1 0 13l-1.4-1.5a7 7 0 0 0 0-10l1.4-1.5Z"/>`,
  },
  {
    id: "filter", name: "Filtro",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" d="M2.5 4h19L14 12.6V20l-4 2v-9.4L2.5 4Z"/>`,
  },
  {
    id: "folder", name: "Pasta",
    viewBox: "0 0 24 24",
    markup: `<path fill="${fill}" d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10l2 2h7.5A2.5 2.5 0 0 1 22 7.5v10a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5v-12Z"/>`,
  },
];

export function safeFileName(label: string) {
  const clean = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return clean || "unity-script-icon";
}

export function sanitizeSvg(source: string): { markup: string; viewBox: string } | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "image/svg+xml");
  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return null;
  const allowedTags = new Set(["svg", "g", "path", "circle", "rect", "ellipse", "polygon", "polyline", "line"]);
  doc.querySelectorAll("*").forEach((node) => {
    if (!allowedTags.has(node.tagName.toLowerCase())) node.remove();
  });
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on") || value.includes("javascript:") || value.includes("url(") || name === "href" || name === "xlink:href") {
        node.removeAttribute(attr.name);
      } else if ((name === "fill" || name === "stroke") && value !== "none") {
        node.setAttribute(attr.name, "currentColor");
      }
    });
  });
  const viewBox = svg.getAttribute("viewBox") || `0 0 ${svg.getAttribute("width") || 24} ${svg.getAttribute("height") || 24}`;
  return { markup: svg.innerHTML, viewBox };
}
