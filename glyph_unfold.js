// === Animated Glyph Unfolding Engine ===
function unfoldGlyph(glyphId) {
    const glyph = document.getElementById(glyphId);
    if (!glyph) return;
    glyph.classList.add('unfold-animate');
}

function bindGlyphNode(node) {
    if (node.dataset.glyphUnfoldBound === 'true') return;
    node.addEventListener('click', () => unfoldGlyph(node.id));
    node.dataset.glyphUnfoldBound = 'true';
}

function initializeGlyphUnfold() {
    document.querySelectorAll('.glyph-node').forEach(bindGlyphNode);
}

function onDomReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
}

onDomReady(initializeGlyphUnfold);

if (typeof window !== 'undefined') {
    window.initializeGlyphUnfold = initializeGlyphUnfold;
}
