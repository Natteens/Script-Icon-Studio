"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { glyphs, palettes, safeFileName, sanitizeSvg, type Glyph, type Palette } from "../lib/iconModel";

type StudioState = {
  palette: Palette;
  label: string;
  showLabel: boolean;
  glyphX: number;
  glyphY: number;
  glyphScale: number;
  glyphRotation: number;
  labelY: number;
  labelSize: number;
};

const initial: StudioState = {
  palette: palettes[0], label: "ICON", showLabel: true,
  glyphX: 0, glyphY: -2, glyphScale: 1, glyphRotation: 0,
  labelY: 58.4, labelSize: 9.5,
};

function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Range({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void }) {
  return <label className="range-control"><span><b>{label}</b><output>{value}{suffix}</output></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-control"><span>{label}</span><span className="color-input"><input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} /><code>{value}</code></span></label>;
}

export default function IconStudio() {
  const [state, setState] = useState<StudioState>(initial);
  const [glyph, setGlyph] = useState<Glyph>(glyphs[0]);
  const [preview, setPreview] = useState<"grid" | "light" | "dark">("grid");
  const [message, setMessage] = useState("Pronto para editar");
  const [panel, setPanel] = useState<"design" | "transform" | "export">("design");
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = <K extends keyof StudioState>(key: K, value: StudioState[K]) => setState((old) => ({ ...old, [key]: value }));
  const patchColor = (key: keyof Palette, value: string) => setState((old) => ({ ...old, palette: { ...old.palette, name: "Personalizada", [key]: value } }));

  const svg = useMemo(() => {
    const { palette: p } = state;
    const band = state.showLabel ? `<path id="label-band" d="M1 47h62v11a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V47Z" fill="${p.band}"/>` : "";
    const label = state.showLabel ? `<text id="replace-label" x="32" y="${state.labelY}" fill="${p.foreground}" font-family="Inter,Arial,sans-serif" font-size="${state.labelSize}" font-weight="800" letter-spacing="-.35" text-anchor="middle">${state.label.replace(/[<>&]/g, "")}</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><title>Unity script icon ${state.label}</title><path id="shadow" d="M6 2H46L63 19v39a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" fill="#0B1220" opacity=".18" transform="translate(0 .8)"/><path id="document-background" d="M6 1H46L63 18v40a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5Z" fill="${p.background}" stroke="${p.outline}"/><path id="folded-corner" d="M46 1v11a6 6 0 0 0 6 6h11L46 1Z" fill="${p.fold}" stroke="${p.outline}" stroke-linejoin="round"/>${band}<g id="replace-glyph" color="${p.foreground}" transform="translate(${state.glyphX} ${state.glyphY}) rotate(${state.glyphRotation} 32 27) translate(${32 - 14 * state.glyphScale} ${27 - 14 * state.glyphScale}) scale(${state.glyphScale})"><svg width="28" height="28" viewBox="${glyph.viewBox}" overflow="visible" fill="currentColor">${glyph.markup}</svg></g>${label}</svg>`;
  }, [glyph, state]);

  const importSvg = async (file: File) => {
    const parsed = sanitizeSvg(await file.text());
    if (!parsed) { setMessage("Esse arquivo não contém um SVG válido"); return; }
    setGlyph({ id: "custom", name: file.name.replace(/\.svg$/i, ""), ...parsed });
    setMessage(`Glyph importado: ${file.name}`);
  };

  const exportSvg = () => { download(`${safeFileName(state.label)}.svg`, svg, "image/svg+xml"); setMessage("SVG exportado em 64 × 64"); };
  const exportPng = (size: number) => {
    const image = new Image();
    const source = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
      canvas.getContext("2d")?.drawImage(image, 0, 0, size, size);
      canvas.toBlob((blob) => { if (blob) download(`${safeFileName(state.label)}-${size}.png`, blob, "image/png"); }, "image/png");
      URL.revokeObjectURL(source); setMessage(`PNG exportado em ${size} × ${size}`);
    };
    image.src = source;
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void importSvg(file); event.target.value = ""; };

  return <main className="app-shell" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.name.endsWith(".svg")) void importSvg(file); }}>
    <header className="topbar">
      <div className="brand"><span className="brand-mark">◆</span><div><h1>Unity Icon Studio</h1><p>Ícones consistentes para scripts da Unity</p></div></div>
      <div className="top-actions"><span className="status"><i />{message}</span><button className="button ghost" onClick={() => { setState(initial); setGlyph(glyphs[0]); setMessage("Template restaurado"); }}>Restaurar</button><button className="button primary" onClick={exportSvg}>Exportar SVG</button></div>
    </header>

    <section className="workspace">
      <aside className="sidebar left-panel">
        <nav className="tabs" aria-label="Painéis">
          {(["design", "transform", "export"] as const).map((item) => <button key={item} className={panel === item ? "active" : ""} onClick={() => setPanel(item)}>{item === "design" ? "Design" : item === "transform" ? "Ajustar" : "Exportar"}</button>)}
        </nav>

        {panel === "design" && <div className="panel-content">
          <section className="control-section"><div className="section-title"><h2>Template</h2><span>64 × 64</span></div><select aria-label="Template"><option>Unity Script — Fold</option></select></section>
          <section className="control-section"><div className="section-title"><h2>Paleta</h2><span>{state.palette.name}</span></div><div className="palette-row">{palettes.map((p) => <button key={p.name} className={state.palette.name === p.name ? "palette active" : "palette"} style={{ background: p.background }} title={p.name} onClick={() => patch("palette", p)} />)}</div>
            <div className="color-grid"><ColorControl label="Fundo" value={state.palette.background} onChange={(v) => patchColor("background", v)} /><ColorControl label="Conteúdo" value={state.palette.foreground} onChange={(v) => patchColor("foreground", v)} /><ColorControl label="Faixa" value={state.palette.band} onChange={(v) => patchColor("band", v)} /><ColorControl label="Dobra" value={state.palette.fold} onChange={(v) => patchColor("fold", v)} /><ColorControl label="Contorno" value={state.palette.outline} onChange={(v) => patchColor("outline", v)} /></div>
          </section>
          <section className="control-section"><div className="section-title"><h2>Glyph</h2><button className="text-button" onClick={() => fileRef.current?.click()}>Importar SVG</button></div><input ref={fileRef} hidden type="file" accept="image/svg+xml,.svg" onChange={onFile} /><div className="glyph-grid">{glyphs.map((item) => <button key={item.id} className={glyph.id === item.id ? "glyph-button active" : "glyph-button"} title={item.name} onClick={() => { setGlyph(item); setMessage(`Glyph: ${item.name}`); }}><svg viewBox={item.viewBox} dangerouslySetInnerHTML={{ __html: item.markup }} /></button>)}<button className={glyph.id === "custom" ? "glyph-button active custom" : "glyph-button custom"} onClick={() => fileRef.current?.click()}>+</button></div><p className="hint">Arraste qualquer SVG para a janela. Cores externas são normalizadas para a cor de conteúdo.</p></section>
          <section className="control-section"><div className="section-title"><h2>Rótulo</h2><label className="switch"><input type="checkbox" checked={state.showLabel} onChange={(e) => patch("showLabel", e.target.checked)} /><span /></label></div><input maxLength={8} value={state.label} disabled={!state.showLabel} onChange={(e) => patch("label", e.target.value.toUpperCase())} placeholder="ICON" /><p className="hint">Use de 3 a 7 caracteres para manter a leitura na Unity.</p></section>
        </div>}

        {panel === "transform" && <div className="panel-content"><section className="control-section"><div className="section-title"><h2>Transformar glyph</h2><span>{glyph.name}</span></div><Range label="Posição X" value={state.glyphX} min={-14} max={14} onChange={(v) => patch("glyphX", v)} /><Range label="Posição Y" value={state.glyphY} min={-14} max={14} onChange={(v) => patch("glyphY", v)} /><Range label="Escala" value={state.glyphScale} min={0.4} max={1.5} step={0.05} suffix="×" onChange={(v) => patch("glyphScale", v)} /><Range label="Rotação" value={state.glyphRotation} min={-180} max={180} suffix="°" onChange={(v) => patch("glyphRotation", v)} /></section><section className="control-section"><div className="section-title"><h2>Ajustar rótulo</h2></div><Range label="Posição Y" value={state.labelY} min={51} max={62} step={0.2} onChange={(v) => patch("labelY", v)} /><Range label="Tamanho" value={state.labelSize} min={6} max={12} step={0.25} suffix=" px" onChange={(v) => patch("labelSize", v)} /></section></div>}

        {panel === "export" && <div className="panel-content"><section className="control-section"><div className="section-title"><h2>Arquivos finais</h2></div><button className="export-card" onClick={exportSvg}><span><b>SVG vetorial</b><small>Ideal para editar e arquivar</small></span><em>.svg</em></button>{[64, 128, 256].map((size) => <button className="export-card" key={size} onClick={() => exportPng(size)}><span><b>PNG {size} × {size}</b><small>{size === 64 ? "Tamanho recomendado para Unity" : "Versão em alta resolução"}</small></span><em>.png</em></button>)}</section><section className="control-section"><h2>Uso na Unity</h2><ol className="steps"><li>Exporte em PNG 64 × 64.</li><li>Selecione o script no Project.</li><li>Clique no ícone no Inspector.</li><li>Escolha o PNG exportado.</li></ol></section></div>}
      </aside>

      <section className={`canvas preview-${preview}`}>
        <div className="canvas-toolbar"><div className="segmented"><button className={preview === "grid" ? "active" : ""} onClick={() => setPreview("grid")}>Grade</button><button className={preview === "light" ? "active" : ""} onClick={() => setPreview("light")}>Claro</button><button className={preview === "dark" ? "active" : ""} onClick={() => setPreview("dark")}>Escuro</button></div><span>Preview 8×</span></div>
        <div className="artboard"><div className="icon-preview" dangerouslySetInnerHTML={{ __html: svg }} /><div className="size-previews"><span dangerouslySetInnerHTML={{ __html: svg }} /><span dangerouslySetInnerHTML={{ __html: svg }} /><span dangerouslySetInnerHTML={{ __html: svg }} /></div></div>
      </section>

      <aside className="sidebar right-panel"><div className="panel-content"><section className="control-section"><div className="section-title"><h2>Camadas</h2><span>SVG</span></div><ul className="layers"><li><i className="layer-color" style={{ background: state.palette.background }} />Documento</li><li><i className="layer-color" style={{ background: state.palette.fold }} />Dobra</li><li><i className="layer-color" style={{ background: state.palette.foreground }} />Glyph <small>{glyph.name}</small></li>{state.showLabel && <><li><i className="layer-color" style={{ background: state.palette.band }} />Faixa</li><li><i className="text-layer">T</i>Rótulo <small>{state.label}</small></li></>}</ul></section><section className="control-section sources"><div className="section-title"><h2>Glyphs open source</h2></div><a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer"><span>Material Symbols<small>Apache 2.0 · sólidos</small></span>↗</a><a href="https://phosphoricons.com/" target="_blank" rel="noreferrer"><span>Phosphor Icons<small>MIT · Fill e Bold</small></span>↗</a><a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer"><span>Lucide<small>ISC · outline</small></span>↗</a><a href="https://game-icons.net/" target="_blank" rel="noreferrer"><span>Game Icons<small>CC BY 3.0 · requer crédito</small></span>↗</a></section><section className="license-note"><b>Privacidade local</b><p>Nenhum SVG é enviado para servidor. A edição e a exportação acontecem no seu navegador.</p></section></div></aside>
    </section>
  </main>;
}
