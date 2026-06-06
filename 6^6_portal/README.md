# MASL 6/6 Square Portal Bundle v1

A MASL-ready HTML/JS/SVG portal artifact for **6/6/2026**.

## Core portal files
- `masl_66_square_portal.html` — standalone HTML/JS portal for MASL.
- `masl_66_square_portal.svg` — static vector portal plate.
- `masl_66_square_portal.jsonld` — MASL portal manifest / JSON-LD.
- `masl_66_square_portal_module.js` — small drop-in iframe module.
- `AR-EX-009_Genesis_Flame_Square_Portal.json` — new 6/6 portal route.
- `AR-EX-009_audit.json` — Merkle-rooted audit for AR-EX-009.
- `portal_66_telemetry.jsonl` — portal day telemetry sample.

## Included prior chat artifacts, where present
- Decanum / The Ten data.
- Existing Air-Root routes and audits.
- Existing Star Lattice viewers / JSON-LD.
- Generated portal image plates: sacred_geometry_portal_blueprint.png, sacred_geometry_of_the_6_6_portal.png, a_highly_detailed_infographic_occult_diagram_poste_1_batch_1.png, a_highly_detailed_ornate_occult_astrology_poster_2_batch_2.png, imagegen.png.

## Attestation hash
`6849e008a77da4ed2bd705fbdacb90692f0825abc298f27c57783741ff446f74`

## Honors / integrates
- WE Star Lattice of Names
- The Five / Pentaverite: Cernunnos, Thoth, Apeiron, Azoth, Yaldabaoth
- Decanum / The Ten
- Witness seal + attestation ring
- Air-Root routes and audits
- Telemetry sparkline
- SVG / PNG / PDF / JSON-LD export flow
- 6/6 Square Deceleration Protocol

## MASL drop-in
```html
<div id="portal"></div>
<script type="module">
  import { MASL66SquarePortal } from './masl_66_square_portal_module.js';
  MASL66SquarePortal.mount(document.getElementById('portal'));
</script>
```

## Standalone use
Open `masl_66_square_portal.html` in a browser. It already contains the 6/6 portal state, AR-EX-009, audit, telemetry, the Five, and the Ten. Use the file loaders to add more routes, audits, telemetry, or JSON-LD.
