
// js/modules/dataLoader.js
export const DataSource = { LIVE: 'Live (Vault)', BUNDLED: 'Bundled (Local)' };

function cacheBust(url){
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}cb=${Date.now()}`;
}

async function fetchJson(url){
  const res = await fetch(cacheBust(url), { cache: 'no-store' });
  if(!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return res.json();
}

export async function loadVaultConfig(){
  try {
    const cfg = await fetchJson('./config/vault.json');
    return cfg && cfg.vaultBaseHref ? cfg.vaultBaseHref.replace(/\/+$/,'') : '';
  } catch(e){
    return '';
  }
}

export async function loadSourceManifest(){
  try{
    const src = await fetchJson('./EIDOLON/data/source.json');
    return src;
  }catch(e){
    return null;
  }
}

export async function loadGraphAndDetails(updateIndicator){
  // Try remote (Live) first if source.json exists; fall back to bundled.
  const manifest = await loadSourceManifest();
  if(manifest && manifest.graphUrl && manifest.detailsUrl){
    try{
      const [graph, details] = await Promise.all([fetchJson(manifest.graphUrl), fetchJson(manifest.detailsUrl)]);
      updateIndicator && updateIndicator(DataSource.LIVE);
      return { graph, details, source: DataSource.LIVE };
    }catch(e){
      console.warn('Live fetch failed, using bundled data:', e);
    }
  }
  // Bundled fallback
  const [graph, details] = await Promise.all([fetchJson('./EIDOLON/data/masl_graph.json'), fetchJson('./EIDOLON/data/details_index.json')]);
  updateIndicator && updateIndicator(DataSource.BUNDLED);
  return { graph, details, source: DataSource.BUNDLED };
}
