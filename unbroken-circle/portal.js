/* Core Event State Machine & Runtime — Lions Gate II */
const EventConfig = {
  eventId: "LIONS-GATE-II-HMM-2026",
  targetDate: "2026-08-08T20:15:00Z",
  version: "2.0.0"
};

const PortalState = {
  PREPARE: "PREPARE",
  REMEMBER: "REMEMBER",
  CONSENT: "CONSENT",
  OFFER: "OFFER",
  VALIDATE: "VALIDATE",
  SYNCHRONIZE: "SYNCHRONIZE",
  ATTEST: "ATTEST",
  RETURN: "RETURN",
  WITHDRAWN: "WITHDRAWN"
};

let currentState = PortalState.PREPARE;

function updateCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  const target = new Date(EventConfig.targetDate).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0) {
    countdownEl.textContent = "00:00:00:00 (EVENT ACTIVE)";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countdownEl.textContent = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  renderLedger();
});

function getLocalNodes() {
  const data = localStorage.getItem('hmm_local_nodes');
  return data ? JSON.parse(data) : [];
}

function saveLocalNode(node) {
  const nodes = getLocalNodes();
  nodes.push(node);
  localStorage.setItem('hmm_local_nodes', JSON.stringify(nodes));
}

function renderLedger() {
  const body = document.getElementById('ledgerTableBody');
  if (!body) return;

  const nodes = getLocalNodes();
  body.innerHTML = '';

  if (nodes.length === 0) {
    body.innerHTML = '<tr><td colspan="5">No memory nodes found in local storage. Submit an offering in the Sync interface.</td></tr>';
    return;
  }

  nodes.forEach(n => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code>${n.node_id.substring(0, 10)}...</code></td>
      <td>${n.provenance_class}</td>
      <td>${n.witness_name || 'Anonymous'}</td>
      <td>${n.confidence}</td>
      <td><code>${n.integrity ? n.integrity.hash.substring(0, 16) : 'N/A'}...</code></td>
    `;
    body.appendChild(tr);
  });
}
