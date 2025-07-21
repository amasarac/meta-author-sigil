
(function(){
  document.addEventListener("click", function(e) {
    if (e.target.matches("[data-sigil]")) {
      const sigil = e.target.getAttribute("data-sigil");
      const echo = {
        sigil: sigil,
        time: new Date().toISOString(),
        x: e.clientX,
        y: e.clientY
      };
      let log = JSON.parse(localStorage.getItem("sigil_echo_log") || "[]");
      log.push(echo);
      localStorage.setItem("sigil_echo_log", JSON.stringify(log));
      console.log("Sigil echo recorded:", echo);
    }
  });
})();
