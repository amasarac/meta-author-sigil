
(function(){
  try {
    var fab = document.createElement('a');
    fab.id = 'eidolon-fab';
    fab.href = (window.location.origin + '/meta-author-sigil/EIDOLON/');
    fab.setAttribute('aria-label', 'Open EIDOLON — MASL Interactive Viewer');
    fab.innerHTML = '<span id="eidolon-fab__dot"></span><span class="eidolon-emoji">🜂</span><strong>EIDOLON</strong><small>MASL Viewer</small>';
    document.body.appendChild(fab);

    var style = document.createElement('style');
    style.textContent = "\n#eidolon-fab {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  z-index: 2000;\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 14px;\n  border-radius: 999px;\n  border: 1px solid rgba(138,43,226,0.5);\n  background: rgba(20, 10, 35, 0.8);\n  color: #fff;\n  font-family: 'Segoe UI', system-ui, sans-serif;\n  font-size: 14px;\n  text-decoration: none;\n  box-shadow: 0 6px 18px rgba(138,43,226,0.35);\n  backdrop-filter: blur(8px);\n}\n#eidolon-fab:hover { background: rgba(30, 15, 50, 0.9); }\n#eidolon-fab__dot {\n  width: 10px; height: 10px; border-radius: 50%;\n  background: #8A2BE2;\n  box-shadow: 0 0 8px #8A2BE2;\n}\n#eidolon-fab small { opacity: 0.85; }\n#eidolon-fab .eidolon-emoji { filter: drop-shadow(0 0 6px #8A2BE2); }\n#eidolon-fab--hidden { display: none !important; }\n";
    document.head.appendChild(style);

    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.text = JSON.stringify({
      "@context":"https://schema.org",
      "@type":"CreativeWork",
      "name":"EIDOLON — Meta Author Sigil Lattice Viewer",
      "url": window.location.origin + "/meta-author-sigil/EIDOLON/",
      "about":["Eidolon","Meta Author Sigil Lattice","MASL","Glyphodes","Sigils","Witness Trails","Cognition"],
      "isPartOf": window.location.origin + "/meta-author-sigil/"
    });
    document.head.appendChild(ld);
  } catch(e){
    console.warn('EIDOLON addon failed:', e);
  }
})();
