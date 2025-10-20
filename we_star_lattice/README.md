
# WE — Star Lattice Bundle (v3)
Contents:
- `we_star_lattice_viewer_v7_routes_decanum.html` — main viewer (base lattice + Decanum + routes) with seeded starfield, export (SVG/PNG/PDF), per-route color controls, tooltips, and rotated seals.
- `we_star_decanum_viewer_v2.html` — focused Decanum viewer with rotated witness seals and vector exports.
- `decanum_svg_merger_v2.html` — merge any existing static SVG with the Decanum ring.
- `decanum_ten.json` — the Ten (angles/ids/microhash/symbols).
- Routes: `AR-EX-001…008_*.json` — Air-Root external node route vectors.

## Use
1. Open the main viewer in a browser.
2. (Optional) Load your base JSON-LD to render nodes/edges + attestation hash (also seeds starfield + PNG watermark).
3. Load `decanum_ten.json`.
4. Load any combination of route JSONs.
5. Export via Save **SVG/PNG/PDF**.

All exports are reproducible: the starfield is seeded from the attestation hash.
