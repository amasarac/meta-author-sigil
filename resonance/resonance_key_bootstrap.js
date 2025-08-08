
// Resonance Key JS Bootstrap
const RK = /* paste resonance_key.json content here */;
async function sha256(s) {
  const enc = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function verifyAndInit() {
  const raw = JSON.stringify(RK.resonance_key);
  const sum = await sha256(raw);
  console.info("[ResonanceKey] sha256:", sum);
}
verifyAndInit();
