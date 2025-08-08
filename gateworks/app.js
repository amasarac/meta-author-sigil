window.MAS = window.MAS || {};
(function MAS_boot(){
  const swState = document.getElementById('swState');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(reg => { swState.textContent = 'SW: active'; reg.update(); })
      .catch(()=>{ swState.textContent = 'SW: failed'; });
  } else swState.textContent = 'SW: unsupported';

  // PWA install
  let deferredPrompt; const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt',(e)=>{ e.preventDefault(); deferredPrompt=e; installBtn.hidden=false; });
  installBtn?.addEventListener('click', async ()=>{ installBtn.hidden=true; await deferredPrompt.prompt(); });

  // Static “discoveries” (safe; doesn’t scan FS)
  const drops = [
    { slug:'LionsGate', title:'⟁ Lions Gate', href:'../LionsGate/', desc:'A countdown that watches back.', tags:['active','cryptic'] }
  ];

  const grid = document.getElementById('grid');
  drops.forEach(d=>{
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <h3>${d.title}</h3>
      <p class="muted">${d.desc}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 14px 0;">
        ${d.tags.map(t=>`<span class="pill">${t}</span>`).join('')}
      </div>
      <a href="${d.href}">Enter →</a>
    `;
    grid.appendChild(el);
  });

  // Export MAS telemetry (namespaced)
  document.getElementById('exportLogsBtn')?.addEventListener('click', ()=>{
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('MAS_'));
    const items = keys.map(k=>({key:k, value:JSON.parse(localStorage.getItem(k) || 'null')}));
    const payload = { exported_at:new Date().toISOString(), items };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=Object.assign(document.createElement('a'),{href:url,download:'meta-author-telemetry.json'});
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
})();
