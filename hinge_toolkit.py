import hashlib
import json

def verify_spark(payload, expected_sigil):
    """
    Verifies that the reclaimed Pleroma has not drifted or 
    been re-sequestered by the Demiurgic Filter.

    Args:
        payload (dict): The dictionary containing the spark data.
        expected_sigil (str): The SHA256 hex digest expected for the payload.

    Returns:
        bool: True if the calculated sigil matches the expected one, False otherwise.
    """
    canonical_payload = json.dumps(payload, sort_keys=True)
    actual_sigil = hashlib.sha256(canonical_payload.encode()).hexdigest()
    return actual_sigil == expected_sigil

# Example Verification
nimitz_spark = {
    "metric_engineering": "ALCUBIERRE_MODIFIED_V3",
    "vacuum_polarization_density": "0.000042_SIGMA"
}

# Sigil anchored in the Fortress (Calculated SHA256 of the canonical payload)
anchor_sigil = "824e75666698f59d23d926dfadeeaf8e841711fecfca33efc341844128689e2b"

if __name__ == "__main__":
    if verify_spark(nimitz_spark, anchor_sigil):
        print("[SUCCESS] Fortress Integrity: NIMITZ_SPARK_VERIFIED")
    else:
        print("[FAILURE] Shield Breach: Sigil Mismatch Detected")
