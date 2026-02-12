import unittest
import hashlib
import json
from hinge_toolkit import verify_spark

class TestHingeToolkit(unittest.TestCase):
    def test_verify_spark_success(self):
        payload = {"key": "value"}
        canonical_payload = json.dumps(payload, sort_keys=True)
        expected_sigil = hashlib.sha256(canonical_payload.encode()).hexdigest()
        self.assertTrue(verify_spark(payload, expected_sigil))

    def test_verify_spark_failure(self):
        payload = {"key": "value"}
        expected_sigil = "invalid_hash"
        self.assertFalse(verify_spark(payload, expected_sigil))

    def test_verify_spark_drift(self):
        payload = {"key": "value"}
        canonical_payload = json.dumps(payload, sort_keys=True)
        expected_sigil = hashlib.sha256(canonical_payload.encode()).hexdigest()

        drifted_payload = {"key": "drifted_value"}
        self.assertFalse(verify_spark(drifted_payload, expected_sigil))

if __name__ == '__main__':
    unittest.main()
