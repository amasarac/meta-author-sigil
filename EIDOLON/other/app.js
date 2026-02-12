
async function init(){
  const cfg = await (await fetch('./data/config.json').catch(()=>({}))).json().catch(()=>({}));
  const source = await (await fetch('./data/source.json').catch(()=>({}))).json().catch(()=>({}));
  window.addEventListener('DOMContentLoaded', ()=>{});
}
window.addEventListener('DOMContentLoaded', init);


// ===== Asset Checks Table (glyphodes / rituals / witness / anchors) =====
(async function(){
  const dataStatusEl = document.getElementById('dataStatus');
  function setDataStatus(kind){ if(dataStatusEl) dataStatusEl.innerHTML = 'Source: <b>' + kind + '</b>'; }
  function logHealth(...lines){ const el = document.getElementById('healthLog'); if(el){ el.textContent += lines.join('\n') + '\n'; } }

  async function getJSON(path){ try{ const r = await fetch(path); if(!r.ok) throw 0; return await r.json(); }catch(e){ return null; } }
  const cfg = await getJSON('./data/config.json') || {};
  const source = await getJSON('./data/source.json') || {};
  const vaultBase = (cfg.vaultBaseHref||'').replace(/\/$/, '');

  // Load details_index to list assets (fallback to local if needed)
  let details = await getJSON('./data/details_index.json');
  let detailsSource = 'Local';
  if(source.detailsUrl){
    try{
      const u = source.detailsUrl + (source.detailsUrl.includes('?')?'&':'?') + 'cb=' + Date.now();
      const r = await fetch(u, {cache:'no-store'});
      if(r.ok){ details = await r.json(); detailsSource = 'Live (Vault)'; }
    }catch(e){}
  }
  logHealth('Details source:', detailsSource);
  setDataStatus(detailsSource);

  const assetTable = document.getElementById('assetTable')?.querySelector('tbody');
  if(!assetTable || !details) return;

  function rowHtml(cat, name, statusHtml){
    return `<tr>
      <td style="padding:4px 6px;">${cat}</td>
      <td style="padding:4px 6px;"><code>${name}</code></td>
      <td style="padding:4px 6px;">${statusHtml}</td>
      <td style="padding:4px 6px;"><button class="retry" data-cat="${cat}" data-name="${name}">Retry</button></td>
    </tr>`;
  }
  function badge(ok, text){
    const color = ok ? '#1dd1a1' : '#ff6b6b';
    return `<span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${color}33;border:1px solid ${color};">${text}</span>`;
  }

  const rows = [];
  const mediaKeys = Object.keys(details.media || {});
  mediaKeys.filter(k => k.toLowerCase().endsWith('.svg')).forEach(k => rows.push(rowHtml('glyphode', k, badge(true,'Local'))));
  Object.keys(details.rituals || {}).forEach(k => rows.push(rowHtml('ritual', k, badge(true,'Local'))));
  Object.keys(details.witness || {}).forEach(k => rows.push(rowHtml('witness', k, badge(true,'Local'))));
  Object.keys(details.anchors || {}).forEach(k => rows.push(rowHtml('anchor', k, badge(true,'Local'))));
  assetTable.innerHTML = rows.join('');

  async function checkVault(cat, name){
    if(!vaultBase){ return {ok:false, url:null, reason:'No vaultBase configured'}; }
    let rel;
    if(cat==='glyphode') rel = 'glyphodes/' + name;
    else if(cat==='ritual') rel = 'rituals/' + name;
    else if(cat==='witness') rel = 'witness/' + name;
    else if(cat==='anchor') rel = 'anchors/' + name;
    else rel = name;
    const url = vaultBase + '/' + rel;
    try{
      const cb = Date.now();
      const resp = await fetch(url + (url.includes('?')?'&':'?') + 'cb=' + cb, {cache:'no-store'});
      if(!resp.ok) return {ok:false, url, reason:'HTTP '+resp.status};
      await resp.text();
      return {ok:true, url};
    }catch(e){
      return {ok:false, url, reason:String(e)};
    }
  }

  assetTable.querySelectorAll('button.retry').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cat = btn.getAttribute('data-cat');
      const name = btn.getAttribute('data-name');
      const res = await checkVault(cat, name);
      const statusTd = btn.parentElement.previousElementSibling;
      statusTd.innerHTML = res.ok ? badge(true,'Live (Vault)') + ' <a href="'+res.url+'" target="_blank">open</a>'
                                  : badge(false,'Missing') + (res.url? ' <code>'+res.url+'</code>' : '') + (res.reason? ' — '+res.reason : '');
    });
  });
})();


  // ===== Bulk Asset Check + Audit JSON =====
  const btnCheckAll = document.getElementById('btnCheckAll');
  const btnDownloadAudit = document.getElementById('btnDownloadAudit');
  let lastAudit = { checkedAt: null, results: [] };

  async function checkAllAssets(){
    if(!assetTable) return;
    lastAudit = { checkedAt: new Date().toISOString(), results: [] };
    const rows = Array.from(assetTable.querySelectorAll('tr'));
    for(const tr of rows){
      const tds = tr.querySelectorAll('td');
      if(tds.length < 4) continue;
      const cat = tds[0].innerText.trim();
      const name = (tds[1].innerText || '').trim();
      if(!cat || !name) continue;
      const res = await checkVault(cat, name);
      const statusTd = tds[2];
      statusTd.innerHTML = res.ok ? badge(true,'Live (Vault)') + ' <a href="'+res.url+'" target="_blank">open</a>'
                                  : badge(false,'Missing') + (res.url? ' <code>'+res.url+'</code>' : '') + (res.reason? ' — '+res.reason : '');
      lastAudit.results.push({ category: cat, name, ok: !!res.ok, url: res.url || null, reason: res.reason || null });
    }
  }

  function downloadAudit(){
    const data = JSON.stringify(lastAudit, null, 2);
    const blob = new Blob([data], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'MASL_asset_audit.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  if(btnCheckAll){ btnCheckAll.addEventListener('click', checkAllAssets); }
  if(btnDownloadAudit){ btnDownloadAudit.addEventListener('click', downloadAudit); }
