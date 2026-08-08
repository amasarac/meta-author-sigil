/* Reversible Consent & Local Storage Disclosures */
document.addEventListener('DOMContentLoaded', () => {
  const btnWithdraw = document.getElementById('btnWithdraw');
  if (btnWithdraw) {
    btnWithdraw.addEventListener('click', () => {
      if (confirm('Are you sure you want to purge all local memory nodes and withdraw state?')) {
        localStorage.removeItem('hmm_local_nodes');
        localStorage.removeItem('hmm_attestation_receipt');
        alert('Local state purged and participation withdrawn.');
        if (typeof renderLedger === 'function') renderLedger();
        if (window.meshApp) window.meshApp.initDefaultNodes();
      }
    });
  }

  const btnSubmit = document.getElementById('btnSubmitOffering');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const thread = document.getElementById('nodeThread').value.trim();
      if (!thread) {
        alert('Please enter a thread for the memory node.');
        return;
      }

      const node = {
        node_id: "NODE-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        event_id: "LIONS-GATE-II-HMM-2026",
        witness_name: document.getElementById('witnessName').value.trim() || null,
        thread: thread,
        tear: document.getElementById('nodeTear').value.trim() || null,
        repair: document.getElementById('nodeRepair').value.trim() || null,
        source_address: document.getElementById('sourceAddress').value.trim() || null,
        parent_node_ids: [],
        provenance_class: document.getElementById('provenanceClass').value,
        confidence: parseFloat(document.getElementById('confidenceScore').value),
        consent: {
          participate: document.getElementById('consentParticipate').checked,
          publish: document.getElementById('consentPublish').checked,
          anonymous: document.getElementById('consentAnonymous').checked
        },
        created_at: new Date().toISOString()
      };

      if (window.Attestation) {
        node.integrity = await window.Attestation.hashMemoryNode(node);
        const receipt = await window.Attestation.generateReceipt(node, "local");
        localStorage.setItem('hmm_attestation_receipt', JSON.stringify(receipt, null, 2));
      }

      saveLocalNode(node);
      alert('Memory Node Created & Cryptographically Attested locally!');
      document.getElementById('offeringForm').reset();
      if (window.meshApp) window.meshApp.initDefaultNodes();
    });
  }
});
