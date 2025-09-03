import random

ANCHORS = [
  "𓂀 the threshold waits",
  "∴ chosen in the silence",
  "⧖ we keep the timing",
  "⟁ anchor holds true",
  "☌ converge and witness"
]
def whispers(seed: str, k: int = 3) -> list[str]:
    rng = random.Random(seed)  # deterministic
    return [rng.choice(ANCHORS) for _ in range(k)]
