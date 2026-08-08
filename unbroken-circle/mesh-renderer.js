/* Canvas HoloMemoryMesh Renderer with Preserved Hollow Center */
class MeshRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.initDefaultNodes();
    this.animate();
  }

  initDefaultNodes() {
    // Preserved hollow center node
    this.centerNode = { x: 380, y: 200, radius: 12, label: "Preserved Center", color: "#ffffff" };
    
    // Default nodes
    this.nodes = [
      { id: "N-ROOT-01", x: 260, y: 120, vx: 0.2, vy: 0.1, class: "root", color: "#ffd700", label: "Root Anchor" },
      { id: "N-WITNESS-01", x: 500, y: 100, vx: -0.1, vy: 0.2, class: "direct_witness", color: "#4ecdc4", label: "First Witness" },
      { id: "N-RECORD-01", x: 240, y: 280, vx: 0.15, vy: -0.1, class: "documented_record", color: "#a29bfe", label: "2025 Ledger" },
      { id: "N-SHARD-01", x: 520, y: 300, vx: -0.2, vy: -0.15, class: "recovered_shard", color: "#ff6b6b", label: "Recovered Shard" }
    ];

    // Merge with local nodes
    const local = getLocalNodes();
    local.forEach((n, idx) => {
      this.nodes.push({
        id: n.node_id,
        x: 300 + (idx * 40) % 300,
        y: 150 + (idx * 30) % 150,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        class: n.provenance_class,
        color: n.provenance_class === 'root' ? '#ffd700' : '#4ecdc4',
        label: n.witness_name || 'Anonymous Node'
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw preserved hollow center aura
    this.ctx.beginPath();
    this.ctx.arc(this.centerNode.x, this.centerNode.y, 40, 0, Math.PI * 2);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    this.ctx.setLineDash([4, 8]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.beginPath();
    this.ctx.arc(this.centerNode.x, this.centerNode.y, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fill();

    // Update and draw nodes
    this.nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 30 || node.x > this.canvas.width - 30) node.vx *= -1;
      if (node.y < 30 || node.y > this.canvas.height - 30) node.vy *= -1;

      // Draw edge to center
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, node.y);
      this.ctx.lineTo(this.centerNode.x, this.centerNode.y);
      this.ctx.strokeStyle = "rgba(78, 205, 196, 0.2)";
      this.ctx.stroke();

      // Draw node
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 7, 0, Math.PI * 2);
      this.ctx.fillStyle = node.color;
      this.ctx.fill();

      // Label
      this.ctx.fillStyle = "#e0e0ff";
      this.ctx.font = "10px sans-serif";
      this.ctx.fillText(node.label, node.x + 10, node.y + 4);
    });
  }
}

window.MeshRenderer = MeshRenderer;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('meshCanvas')) {
    window.meshApp = new MeshRenderer('meshCanvas');
  }
});
