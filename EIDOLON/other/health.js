
// js/modules/health.js
import { loadSourceManifest, DataSource } from './dataLoader.js';

function el(id){ return document.getElementById(id); }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }

export function mountHealthUI(){
  const ui = el('ui');
  if(!ui) return;

  // Data Source indicator
  let ds = document.createElement('div');
  ds.id = 'dataSourceIndicator';
  ds.style.cssText = 'margin-top:6px;padding:6px 8px;border:1px solid #444;border-radius:6px;font:12px/1.2 monospace;color:#9fd;';
  ds.textContent = 'Data Source: (checking...)';
  ui.appendChild(ds);

  // Refresh button
  let refreshBtn = document.createElement('button');
  refreshBtn.textContent = '↻ Refresh (cache‑bust)';
  refreshBtn.id = 'btnRefreshCachebust';
  ui.appendChild(refreshBtn);

  // Health check panel
  let panel = document.createElement('div');
  panel.id = 'healthPanel';
  panel.style.cssText = 'margin-top:8px;padding:8px;border:1px solid #444;border-radius:8px;background:rgba(0,0,0,0.35);max-width:420px;';
  panel.innerHTML = `<div style="font:600 13px/1.3 system-ui;color:#ccc;margin-bottom:6px;">External Asset Health</div>
  <table id="assetTable" style="width:100%;border-collapse:collapse;font:12px monospace;">
    <thead><tr><th align="left">Asset</th><th>Status</th><th>Action</th></tr></thead>
    <tbody></tbody>
  </table>
  <div style="margin-top:6px;display:flex;gap:6px;">
    <button id="btnCheckAll">Check All</button>
    <button id="btnDownloadAudit">Download Audit JSON</button>
  </div>`;
  ui.appendChild(panel);

  const assets = [
    { key:'graphUrl', label:'Graph (remote)' },
    { key:'detailsUrl', label:'Details (remote)' },
    { key:'ambient', label:'Ambient Audio (local/remote fallback)', url:'lattice_ambient.wav' },
    { key:'flame', label:'flame-layer.svg', url:'assets/layers/flame-layer.svg' },
    { key:'mirror', label:'mirror-layer.svg', url:'assets/layers/mirror-layer.svg' },
    { key:'codex', label:'codex-layer.svg', url:'assets/layers/codex-layer.svg' },
    { key:'portal', label:'portal.svg', url:'assets/layers/portal.svg' }
  ];

  const audit = {};

  async function headOk(url){
    try{
      const res = await fetch(url, { method:'HEAD', cache: 'no-store' });
      if(res.ok) return true;
    }catch(e){}
    return false;
  }

  function renderRow(asset, status, message){
    const tr = document.createElement('tr');
    const color = status==='ok' ? '#4caf50' : '#ff5a7c';
    tr.innerHTML = `<td style="padding:4px 2px;">${escapeHtml(asset.label)}</td>
    <td style="padding:4px 2px;color:${color};font-weight:600;">${status==='ok'?'OK':'FAIL'}</td>
    <td style="padding:4px 2px;"><button data-retry="${escapeHtml(asset.key)}">Retry</button></td>`;
    tr.dataset.assetKey = asset.key;
    tr.dataset.status = status;
    tr.title = message || '';
    return tr;
  }

  function setIndicator(text){
    const i = el('dataSourceIndicator'); if(i) i.textContent = 'Data Source: ' + text;
  }

  async function checkAsset(asset){
    let url = asset.url;
    if(asset.key==='graphUrl' || asset.key==='detailsUrl'){
      const manifest = await loadSourceManifest();
      url = manifest && manifest[asset.key] ? manifest[asset.key] : '';
    }
    if(!url){ audit[asset.key] = { status:'fail', message:'no url' }; return renderRow(asset,'fail','no url'); }
    const ok = await headOk(url + (url.includes('?')?'&':'?') + 'cb=' + Date.now());
    audit[asset.key] = { status: ok?'ok':'fail', url };
    return renderRow(asset, ok?'ok':'fail', ok?'reachable':'not reachable');
  }

  async function fillTable(){
    const tbody = el('assetTable').querySelector('tbody');
    tbody.innerHTML='';
    for(const a of assets){
      tbody.appendChild(await checkAsset(a));
    }
  }

  // events
  el('btnCheckAll').addEventListener('click', fillTable);
  el('btnDownloadAudit').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify({ ts: Date.now(), audit }, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'asset_audit.json';
    a.click();
  });
  el('btnRefreshCachebust').addEventListener('click', ()=>{
    // Hard reload with a cache‑bust param to ensure fresh assets
    const u = new URL(window.location.href);
    u.searchParams.set('cb', Date.now().toString());
    window.location.replace(u.toString());
  });

  // delegate retry
  el('assetTable').addEventListener('click', async (e)=>{
    const btn = e.target.closest('button[data-retry]'); if(!btn) return;
    const key = btn.getAttribute('data-retry');
    const a = assets.find(x=>x.key===key); if(!a) return;
    const tr = btn.closest('tr');
    const newRow = await checkAsset(a);
    tr.replaceWith(newRow);
  });

  // initialize table & indicator
  (async ()=>{
    await fillTable();
    // derive current data source by trying a live fetch quickly: we reuse loadSourceManifest to set indicator roughly
    try{
      const m = await loadSourceManifest();
      if(m && m.graphUrl) setIndicator(DataSource.LIVE + ' (pref)');
      else setIndicator(DataSource.BUNDLED);
    }catch(e){
      setIndicator(DataSource.BUNDLED);
    }
  })();
}
