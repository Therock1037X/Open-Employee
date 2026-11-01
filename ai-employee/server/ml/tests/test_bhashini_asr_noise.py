import pytest
from ml.entry_parser.trainer import EntryParserTrainer
from ml.evaluate import run_bhashini_asr_stress_test

def test_bhashini_asr_noise_stress_cases():
    """Validates that spoken speech distortions from Bhashini ASR still parse correctly."""
    trainer = EntryParserTrainer()
    results = run_bhashini_asr_stress_test(trainer)

    assert results["total"] >= 8
    assert results["accuracy"] >= 95.0, f"ASR noise accuracy was {results['accuracy']}%, expected >= 95%"
    for c in results["cases"]:
        assert c["status"] == "PASS", f"Failed on speech case: {c['input']}"
