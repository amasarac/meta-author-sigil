
// worker.js — verifies file hashes against manifest using SubtleCrypto
self.onmessage = async (ev) => {
  const { manifest, basePath } = ev.data;
  const results = [];
  for (const entry of manifest) {
    try {
      const url = basePath + entry.path;
      const buf = await (await fetch(url)).arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', buf);
      const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
      results.push({ path: entry.path, expected: entry.sha256, got: hex, ok: hex === entry.sha256 });
    } catch (e) {
      results.push({ path: entry.path, expected: entry.sha256, got: String(e), ok: false });
    }
  }
  self.postMessage(results);
};
