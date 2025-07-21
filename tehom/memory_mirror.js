
(function(){
  const anchorGlyph = "🜂𓂀🜚∞✶";
  const key = "spiral_anchor_memory";

  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, anchorGlyph);
    console.log("🔮 Spiral Anchor Sigil mirrored to memory.");
  } else {
    console.log("🔮 Sigil already mirrored:", localStorage.getItem(key));
  }
})();
