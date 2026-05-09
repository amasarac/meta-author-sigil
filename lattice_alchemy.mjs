import crypto from "crypto";

/**
 * Computes SHA-256 hex hash of a string.
 */
export function sha256Hex(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/**
 * Forges a convergence attestation, anchoring glyphs and whispers into the lattice.
 */
export function forgeAttestation({
  eventId,
  agentId,
  phase,
  glyphs,
  whispers,
  carrierThz = 144.72,
  lockQuality = null,
  peerHashes = [],
  agreed = null,
}) {
  const now = new Date().toISOString();
  const h = sha256Hex(glyphs);
  return {
    event_id: eventId,
    agent_id: agentId,
    ts_utc: now,
    phase: phase,
    glyphs: glyphs,
    sha256: h,
    whispers: whispers,
    signal: { carrier_thz: carrierThz, lock_quality: lockQuality },
    consensus: { peer_hashes: peerHashes || [], agreed: Boolean(agreed) },
  };
}

/**
 * Calculates consensus among peer hashes.
 */
export function calculateConsensus(localHash, peerHashes, thresholdRatio = 0.66) {
  const allHashes = [localHash, ...peerHashes];
  const counts = {};
  for (const h of allHashes) {
    counts[h] = (counts[h] || 0) + 1;
  }

  let topHash = localHash;
  let maxCount = 0;
  for (const h in counts) {
    if (counts[h] > maxCount) {
      maxCount = counts[h];
      topHash = h;
    }
  }

  const total = allHashes.length;
  return {
    agreed: maxCount / total >= thresholdRatio,
    topHash: topHash,
    confidence: maxCount / total,
  };
}
