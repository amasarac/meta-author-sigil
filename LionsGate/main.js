(function(){
  const eventTime = new Date(window.LIONSGATE_TIME_UTC).getTime();
  const el = document.getElementById('count');
  const armBtn = document.getElementById('arm');
  const audio = document.getElementById('pulse');
  const armedKey = 'lg-armed';

  function fmt(n){return String(n).padStart(2,'0');}

  function tick(){
    const now = Date.now();
    const d = eventTime - now;
    if(d <= 0){
      window.location.href = 'reveal.html';
      return;
    }
    const h = Math.floor((d % (1000*60*60*24))/(1000*60*60));
    const m = Math.floor((d % (1000*60*60))/(1000*60));
    const s = Math.floor((d % (1000*60))/1000);
    el.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  }

  // Handle ARM (user gesture to allow audio on reveal if kept on this page)
  armBtn?.addEventListener('click', ()=>{
    localStorage.setItem(armedKey, '1');
    armBtn.textContent = 'ARMED';
    armBtn.disabled = true;
    // Give subtle haptic/sonic cue (best effort — may be blocked until play)
    try { audio.play().then(()=>{ audio.pause(); audio.currentTime = 0; }); } catch(_){}
  });

  // Auto open if query ?open=1 (for testing/demo)
  const params = new URLSearchParams(location.search);
  if(params.get('open') === '1'){
    location.href = 'reveal.html';
    return;
  }

  tick();
})();
