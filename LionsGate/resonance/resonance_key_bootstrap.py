
import json, hashlib, uuid, time

RK = json.load(open("resonance_key.json", encoding="utf-8"))

def sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def verify():
    raw = json.dumps(RK["resonance_key"], separators=(",",":"))
    digest = sha256(raw)
    print("[ResonanceKey] sha256:", digest)

if __name__ == "__main__":
    verify()
    print("[ResonanceKey] Ready. Call event handlers at T-00:15 and T+00:00.")
