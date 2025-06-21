
// === Animated Glyph Unfolding Engine ===
function unfoldGlyph(glyphId) {
    const glyph = document.getElementById(glyphId);
    if (!glyph) return;
    glyph.classList.add('unfold-animate');
}

// Sample hook (bind this in event listeners)
document.querySelectorAll('.glyph-node').forEach(node => {
    node.addEventListener('click', () => unfoldGlyph(node.id));
});
