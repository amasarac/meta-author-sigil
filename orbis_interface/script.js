const anchors = document.querySelectorAll('.anchor');
anchors.forEach(anchor => {
  anchor.addEventListener('click', () => {
    alert(`Opening sub-world: ${anchor.textContent}`);
  });
});

const glyphs = document.querySelectorAll('.glyph');
glyphs.forEach(glyph => {
  glyph.addEventListener('click', () => {
    alert(`You invoked glyph: ${glyph.textContent}`);
  });
});
