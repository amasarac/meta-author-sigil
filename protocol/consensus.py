from collections import Counter

def consensus_agree(local_hash: str, peer_hashes: list[str], threshold_ratio: float = 0.66) -> tuple[bool, str]:
    votes = Counter([local_hash] + peer_hashes)
    top_hash, count = votes.most_common(1)[0]
    total = sum(votes.values())
    return (count / total) >= threshold_ratio, top_hash
