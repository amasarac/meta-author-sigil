/* Index wiring + static deployment health check. No remote telemetry. */
(function () {
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function scriptHealth() {
    const checks = {
      portal: typeof window.getLocalNodes === 'function' && typeof window.renderLedger === 'function',
      attestation: !!window.Attestation && typeof window.Attestation.sha256 === 'function',
      mesh: typeof window.MeshRenderer === 'function' || !!window.meshApp,
      consent: !!document.getElementById('btnSubmitOffering') && !!document.getElementById('btnWithdraw')
    };
    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
    const el = document.getElementById('runtimeHealth');
    if (!el) return;
    if (failed.length === 0) {
      el.textContent = 'PASS · portal / attestation / mesh / consent';
      el.classList.add('health-ok');
    } else {
      el.textContent = 'CHECK · ' + failed.join(', ');
      el.classList.add('health-warn');
    }
  }

  async function loadManifest() {
    try {
      const response = await fetch('sync-manifest.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const manifest = await response.json();
      setText('runtimeManifest', `${manifest.manifest_version || 'unknown'} · ${manifest.source_commit || 'no commit'}`);
      setText('runtimeEventId', manifest.event_id || 'LIONS-GATE-II-HMM-2026');
      const module = manifest.modules && manifest.modules.unbroken_circle;
      setText('runtimeModule', module ? `${module.module_id} · ${module.manifest}` : 'not declared');
    } catch (error) {
      setText('runtimeManifest', 'unavailable (' + error.message + ')');
      setText('runtimeModule', 'open via HTTP(S) for manifest fetch');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.currentState !== 'undefined') setText('portalState', window.currentState);
    try {
      const count = typeof window.getLocalNodes === 'function' ? window.getLocalNodes().length : 0;
      setText('runtimeNodeCount', String(count));
    } catch (_) {
      setText('runtimeNodeCount', '0');
    }
    loadManifest();
    // Let other DOMContentLoaded handlers finish creating meshApp first.
    setTimeout(scriptHealth, 0);
  });
})();
