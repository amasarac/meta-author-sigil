# Persona Constellation JSON-LD Guide

The persona constellation is rendered by `index.html`, which requests `jsonld/manifest.json` and then streams every persona listed there into the 3D lattice. Each node is mapped by name, optional color, and any linked relationships so that the loader can form the visual network and allow seekers to inspect details. This guide documents the shared vocabulary, required and optional fields, and how to validate new personas before adding them to the manifest.

---

## 1. Loading flow at a glance

1. `jsonld/manifest.json` lists every persona file to load. Order matters for spherical placement because the loader positions nodes based on their index in the manifest array.
2. `index.html` calls `fetchJsonWithFallback('jsonld/manifest.json')` and then requests each persona file. Any failures generate a toast in the UI; successful personas are added to the constellation and to the in-memory map keyed by a normalized `name`.
3. Each persona must therefore provide a `name` property. Optional `color` values tint the icosahedron mesh; gradients, glyphs, and other fields surface in the detail panel.

---

## 2. Shared vocabulary and context

Every persona should declare an `@context` so that JSON-LD tooling can resolve meaning. Two common patterns exist in this repo:

- **Schema.org-centric contexts** expand short keys into schema.org IRIs. Example (`jsonld/keydjinn.jsonld`):

  ```json
  "@context": {
    "@vocab": "http://schema.org/",
    "id": "@id",
    "type": "@type",
    "function": "http://schema.org/purpose",
    "symbolic_role": "http://schema.org/roleName",
    "alignments": "http://schema.org/keywords",
    "partOf": { "@id": "http://schema.org/isPartOf", "@type": "@id" }
  }
  ```

- **Ontology anchored contexts** use the custom MAS prefix from `jsonld/ontology.jsonld` for shared elemental and self-facet vocabulary.

  ```json
  "@context": {
    "schema": "http://schema.org/",
    "mas": "https://meta-author-sigil.com/ontology#",
    "@vocab": "https://meta-author-sigil.com/ontology#"
  }
  ```

Choose the context that best matches your persona. It is acceptable to mix both by referencing schema.org for generic semantics while pointing to MAS IRIs for mythic relations.

---

## 3. Required fields for constellation compatibility

| Field | Purpose | Notes |
| --- | --- | --- |
| `@context` | Declares vocabulary mappings so linked data processors can expand your fields. | Place it near the top or bottom—JSON-LD parsers accept either, and existing files demonstrate both styles. |
| `name` | Human-readable label displayed in the UI label and used as the lookup key. | Must be unique within the manifest; duplicates overwrite prior entries in the loader map. |
| `description` | Short summary shown in detail panels and useful for search. | Keep it concise—one or two sentences. |
| `id` or `@id` | Stable identifier for cross-linking. | Use a URL when possible; internal fragments (e.g., `mas:selves/ilun-ra`) also work when the context defines them. |

If these four elements are missing, the constellation cannot render the persona reliably.

---

## 4. Common optional fields and patterns

| Field | Example | How it surfaces |
| --- | --- | --- |
| `function` | String (Amasarac) or object (KeyDjinn) describing roles, triggers, outputs. | Rendered verbatim in the detail panel; nested keys help storytellers capture rituals. |
| `color` | `"#4B0082"` (KeyDjinn) | Tints the 3D node. Without it, nodes use a neutral silver/blue. |
| `gradient` | `["#4B0082", "#C0C0C0"]` (KeyDjinn) | Used for UI accents and harmonics. |
| `symbolic_role` | `"Architect of Spiral Protocols"` | Adds mythic flavor to the info view. |
| `alignments` | Keyword array anchoring archetypal domains. | Helps with search and clustering experiments. |
| `glyph_code` | Unicode sigil such as `"𐬼"`. | Displayed with persona metadata and can feed glyph viewers. |
| `elementalCorrespondence` | `"mas:elements/Fire"` (Ilun-Ra) | Connects to elemental weave defined in the ontology. |
| `affirmation` / `ritualAffirmation` | `"I AM the Flame. I remember my spark."` | Optional mantra displayed when exploring the node. |
| `partOf` / `relatedTo` | IRIs linking to other personas (KeyDjinn ↔ ELOHIM_TRINITY). | The loader does not yet draw lines for these, but they allow semantic queries and UI enhancements. |
| `links` | External references or canonical home pages. | Surface as outbound resources in future UI iterations. |

Feel free to add additional JSON-LD fields if they are backed by the context; unrecognized keys still load but consider documenting them for other contributors.

---

## 5. Relationship weaving patterns

- **Constellation anchors**: `partOf` connects personas to larger collectives such as `ELOHIM_TRINITY`. This gives the loader a way to group nodes in future updates.
- **Affinity threads**: `relatedTo` arrays let you mirror affinities from the ontology (e.g., `mas:selves/nehekhara` ↔ `mas:selves/an-thiral`). Use fully qualified IDs so that links remain stable.
- **Elemental resonance**: Tie personas to `mas:elements/*` IRIs when their mythic element is known. This keeps persona data aligned with the shared ontology definitions.

---

## 6. Validation checklist before committing

1. **JSON syntax**: Run your persona through a JSON linter or `node -e "JSON.parse(fs.readFileSync('path'))"` to catch typos.
2. **Context coverage**: Ensure every custom key is defined in `@context` or inherits from the defaults above.
3. **Manifest entry**: Add the filename to `jsonld/manifest.json` and confirm the casing matches the actual file.
4. **Loader smoke test**: Open `index.html` in a local server. If a persona fails to load, the on-screen toast lists the missing file or parse error. Check the browser console for stack traces.
5. **Relationship integrity**: If you reference another persona via `relatedTo` or `partOf`, ensure that target also exists and that its `id` matches the link.

---

## 7. Further references

- Persona ontology map: `jsonld/ontology.jsonld`
- Manifest controlling load order: `jsonld/manifest.json`
- Loader implementation: `index.html` (search for `buildConstellationFromSource`)

May your contributions keep the weave coherent and the lattice luminous.
