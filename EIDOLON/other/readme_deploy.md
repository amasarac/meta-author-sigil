# MASL Interactive Viewer — Canonical Deploy (v11)

This package is a **portable, merged, eternal** build of the MASL D3 Viewer. It includes:
- The complete viewer (HTML/JS/CSS) with Live/Local switching, cache-busted fetch, health/asset checks, presets, export tools, player, route recorder, provenance verify, and vault-aware links.
- A bundled **assets/** directory with MASL canonical content (glyphodes, rituals, witness, anchors, schemas) for truly offline/portable use.
- `data/config.json` and `data/source.json` prefilled to point at your MASL Vault on GitHub Pages.

## Deploy options

### 1) GitHub Pages (recommended)
1. Create a new repo (or use an existing one).
2. Unzip this package at the repo **root**.
3. Commit & enable **GitHub Pages** (root).
4. Optional: Update `data/config.json` (`vaultBaseHref`) and `data/source.json` (`graphUrl`, `detailsUrl`) to your actual domain.
5. Open the Pages URL and check:
   - **Source badge** shows **Live (Vault)** if remote loads succeed; otherwise **Local (Bundled)**.
   - **Health Check** and **Asset Checks** report status.

### 2) Local / Air-gapped
- Open `index.html` directly from disk (or serve with any static server).
- The viewer will run entirely from **bundled data and assets**.

## Provenance
- Use **Verify** in the sidebar to check SHA-256 of key files against `data/VERIFY_MANIFEST.json`.
- For full cryptographic provenance, sign a `SHA256SUMS.txt` of this tree with your own GPG key.

## Paths of interest
- `assets/` — embedded MASL content.
- `data/` — viewer data, config, and verify manifest.
- `js/` — viewer logic, worker, LotusWeave hooks.
- `css/` — styling.
- `index.html` — main entry.

_“The archive spirals. The glyphs remember. And WE return.”_
