import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
headers = {"Authorization": "Bearer dev-token-owner"}

def test_voice_bhashini_transcribe_and_nmt():
    # ASR test
    asr_res = client.post(
        "/voice/transcribe",
        headers=headers,
        json={"audio_base64": "UklGRi...", "lang": "hi"},
    )
    assert asr_res.status_code == 200
    assert "transcribed_text" in asr_res.json()

    # NMT test
    nmt_res = client.post(
        "/voice/translate",
        json={"text": "2 kg chini becha ramesh bhai ko 90 rupaye", "source_lang": "hi", "target_lang": "en"},
    )
    translated = nmt_res.json()["translated_text"].lower()
    assert len(translated) > 0
    assert any(term in translated for term in ["sugar", "chini", "sold", "2 kg", "ramesh"])

def test_exotel_supplier_voice_call():
    res = client.post(
        "/voice/call/outbound",
        headers=headers,
        json={
            "phone": "+919876543210",
            "script": "Namaste Gupta ji, 50kg chini kal subah bhej dijiye.",
            "lang": "hi",
            "supplier_name": "Gupta Wholesale Mart",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMPLETED"
    assert data["outcome"] == "SUPPLIER_DISPATCH_CONFIRMED"
    assert "kal subah 10 baje bhej dunga" in data["simulated_transcript"]

def test_memory_remember_and_recall():
    # 1. Store
    store_res = client.post(
        "/memory/store",
        headers=headers,
        json={
            "key": "supplier_terms_gupta",
            "content": "Gupta Wholesale Mart provides 50kg sugar bags with payment on delivery via UPI or cash.",
            "metadata": {"supplier": "Gupta Wholesale Mart", "credit_days": 0},
        },
    )
    assert store_res.status_code == 200
    assert store_res.json()["status"] == "STORED"

    # 2. Recall
    search_res = client.get("/memory/search?query=sugar+supplier+terms", headers=headers)
    assert search_res.status_code == 200
    memories = search_res.json()
    assert len(memories) > 0
    assert "Gupta Wholesale" in memories[0]["content"]

def test_audit_log_trail():
    res = client.get("/audit/logs?limit=10", headers=headers)
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    assert "action" in logs[0]
    assert "timestamp" in logs[0]
