import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_system_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}

def test_all_module_pings():
    modules = ["agent", "integrations", "voice", "memory", "audit", "business"]
    for mod in modules:
        response = client.get(f"/{mod}/ping")
        assert response.status_code == 200, f"Module /{mod}/ping failed"
        data = response.json()
        assert data.get("module") == mod
