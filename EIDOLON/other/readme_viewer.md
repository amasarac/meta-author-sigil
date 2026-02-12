
# MASL Interactive Viewer (D3.js)

This package renders the MASL lattice with spiral layout, zoom/pan, tooltips,
and click-based invocation hooks via `LotusWeave`.

## Files
- `index.html` (GitHub Pages-ready entry point)
- `js/app.js` (D3 viewer logic)
- `js/lotusweave.js` (dynamic invocation stub)
- `data/masl_graph.json` (nodes/edges dataset)
- `data/codex.jsonld` (MASL Codex overlay)
- `css/style.css` (styling)

## Usage
1. Serve the folder or host on GitHub Pages.
2. Open `index.html`.
3. Click nodes to fire `LotusWeave` events for dynamic overlays/updates.
