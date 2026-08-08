/* Web Crypto SHA-256 Local Attestation Generator */
const Attestation = {
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async hashMemoryNode(node) {
    const canon = JSON.stringify({
      node_id: node.node_id,
      event_id: node.event_id,
      thread: node.thread,
      provenance_class: node.provenance_class,
      created_at: node.created_at
    });
    const hash = await this.sha256(canon);
    return {
      algorithm: "SHA-256",
      hash: hash,
      source_commit: "HEAD-MAIN-2026"
    };
  },

  async generateReceipt(node, participantMode = "local") {
    const manifestHash = await this.sha256("LIONS-GATE-II-MANIFEST-2.0.0");
    return {
      receipt_version: "1.0.0",
      event_id: "LIONS-GATE-II-HMM-2026",
      portal_version: "2.0.0",
      source_commit: "8a0270e-main",
      participant_mode: participantMode,
      consent: node.consent.participate,
      memory_node_hash: node.integrity ? node.integrity.hash : null,
      manifest_hash: manifestHash,
      generated_at: new Date().toISOString(),
      remote_control_claim: false,
      third_party_telemetry: false
    };
  }
};

window.Attestation = Attestation;

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('receiptDisplay');
  if (display) {
    const receipt = localStorage.getItem('hmm_attestation_receipt');
    if (receipt) {
      display.textContent = receipt;
    }
  }

  const btnDl = document.getElementById('btnDownloadReceipt');
  if (btnDl) {
    btnDl.addEventListener('click', () => {
      const receipt = localStorage.getItem('hmm_attestation_receipt');
      if (!receipt) {
        alert('No local receipt found.');
        return;
      }
      const blob = new Blob([receipt], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attestation-receipt-2026.json';
      a.click();
    });
  }

  const btnNodes = document.getElementById('btnDownloadNodes');
  if (btnNodes) {
    btnNodes.addEventListener('click', () => {
      const nodes = localStorage.getItem('hmm_local_nodes') || '[]';
      const blob = new Blob([nodes], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'local-memory-nodes-2026.json';
      a.click();
    });
  }
});
