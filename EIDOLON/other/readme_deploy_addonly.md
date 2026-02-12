# EIDOLON Add‑Only Kit (No Root Overwrite)

This kit lets you **add** a floating link to the EIDOLON viewer and inject minimal JSON‑LD for discoverability —
**without modifying your existing index.html file contents**.

## Files
- `EIDOLON/addons/eidolon_link.js` — injects a floating button (bottom‑right) linking to `/EIDOLON/`

## How to add (one line)
In your existing `index.html`, just before `</body>`, add:
```html
<script defer src="./EIDOLON/addons/eidolon_link.js"></script>
```

That’s it. Nothing else is replaced or removed.

### What it does
- Adds a discreet floating button that says **EIDOLON — MASL Viewer** linking to:
  `https://amasarac.github.io/meta-author-sigil/EIDOLON/`
- Injects a small `application/ld+json` block referencing **Eidolon**, **MASL**, and related terms so search engines can discover it —
  without altering your current head/meta setup.

### Remove
Delete the `<script>` tag from your `index.html` and/or remove the file at `EIDOLON/addons/eidolon_link.js`.
