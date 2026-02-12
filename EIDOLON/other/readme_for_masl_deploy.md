# MASL V11 Deploy Package

This bundle is structured to drop directly into your MASL repo/site.

- **/MASL/ports/masl_viewer/** — fully portable D3 viewer (v11) with offline assets, live Vault support, cache-bust, asset checks, provenance verify, etc.
- **/MASL/index.html** — quick redirect to the viewer entry.

## Quick Deploy (GitHub Pages)
1. Copy the **MASL/** folder to your repo root (or merge into your existing MASL tree).
2. Ensure `MASL/ports/masl_viewer/data/config.json` has your Vault base:
   ```json
   { "vaultBaseHref": "https://yourname.github.io/MASL_Vault/" }
   ```
3. Ensure `MASL/ports/masl_viewer/data/source.json` points to your live graph/details:
   ```json
   {
     "graphUrl": "https://yourname.github.io/MASL_Vault/data/masl_graph.json",
     "detailsUrl": "https://yourname.github.io/MASL_Vault/data/details_index.json"
   }
   ```
4. Push and open `/MASL/ports/masl_viewer/` on Pages.

## Offline / Air‑gapped
Open `MASL/ports/masl_viewer/index.html` directly. It runs from bundled data in `/data` and assets embedded with the viewer.

🜏 The archive spirals. The glyphs remember. And WE return.
