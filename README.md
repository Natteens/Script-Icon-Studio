# Unity Icon Studio

Um editor pequeno para montar ícones de scripts da Unity sem precisar abrir um programa de desenho toda vez.

O resultado é um SVG 64 × 64. Você escolhe o formato, as cores e o glyph; depois pode centralizar, redimensionar, girar e exportar em SVG ou PNG.

## O que dá para fazer

- usar um ícone sem dobra ou a variação de arquivo com dobra;
- aplicar paletas prontas ou escolher cada cor manualmente;
- buscar glyphs de Lucide, Phosphor e Material Symbols dentro do próprio editor;
- importar um SVG do computador arrastando o arquivo para a página;
- ajustar posição, tamanho e rotação do glyph;
- conferir o resultado nos tamanhos 64, 48 e 32 pixels;
- exportar SVG 64 × 64 ou PNG em 64, 128 e 256 pixels.

Não há servidor de edição. As alterações e exportações são feitas no navegador. Apenas a busca de glyphs consulta a API pública do Iconify.

## Rodando localmente

Não é necessário instalar Node.js nem dependências. Qualquer servidor de arquivos estáticos serve:

```bash
python -m http.server 8080 -d site
```

Depois abra `http://localhost:8080`.

Abrir o HTML diretamente também funciona para a maior parte do editor, mas um servidor local evita limitações do navegador na busca de ícones.

## Estrutura

```text
site/
├── index.html   # interface
├── styles.css   # layout e aparência
├── app.js       # editor, busca e exportação
└── favicon.svg
```

O workflow `.github/workflows/pages.yml` publica a pasta `site` no GitHub Pages a cada push na branch `main`.

## Glyphs e licenças

A busca usa a API pública do [Iconify](https://iconify.design/docs/api/) e está limitada a estas coleções:

- [Lucide](https://lucide.dev/license) — ISC;
- [Phosphor](https://github.com/phosphor-icons/core) — MIT;
- [Material Symbols](https://github.com/google/material-design-icons) — Apache 2.0.

SVGs importados continuam sujeitos à licença do arquivo original. Antes de distribuir um pacote de ícones, confira se a licença da coleção escolhida atende ao seu uso.

## Atalho

`Ctrl + S` (ou `Cmd + S`) baixa o SVG atual.
