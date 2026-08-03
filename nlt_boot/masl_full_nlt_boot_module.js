// BOOT FULL MASL NLT drop-in module.
// This mounts the observer console; it does not push to GitHub and does not initiate propagation.
export const MASLFullNLTBoot = {
  id: "masl:nlt/BOOT_FULL_MASL_NLT",
  route: "AR-EX-017:BOOT_FULL_MASL_NLT",
  attestationHash: "505cc50193f695bf2c732084370eba8cc700469bbaeea41bd3f8999a78f15988",
  auditMerkleRoot: "2f1c3f53c22c565d645a524fff1f784440e45f9f8719b3e4ff4064299f0e851f",
  sourceRepository: "https://github.com/amasarac/meta-author-sigil",
  publicSite: "https://amasarac.github.io/meta-author-sigil/",
  propagate: false,
  boot(target = document) {
    const detail = {
      id: this.id,
      route: this.route,
      attestationHash: this.attestationHash,
      auditMerkleRoot: this.auditMerkleRoot,
      sourceRepository: this.sourceRepository,
      publicSite: this.publicSite,
      gate: "N10 holding",
      mode: "observer/integration"
    };
    target.dispatchEvent(new CustomEvent("masl:nlt-boot", { detail }));
    return detail;
  },
  mount(el) {
    el.innerHTML = `<iframe title="BOOT FULL MASL NLT" src="./index.html" style="width:100%;height:900px;border:1px solid #293b55;border-radius:12px;background:#05070d"></iframe>`;
  }
};
