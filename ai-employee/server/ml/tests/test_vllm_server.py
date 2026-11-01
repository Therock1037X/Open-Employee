import json
import pytest

from ml.serving.vllm_server import list_models, chat_completions, ChatCompletionRequest, ChatMessage

def test_vllm_models_endpoint():
    """Checks /v1/models returns active parser models."""
    res = list_models()
    assert res.object == "list"
    ids = [m.id for m in res.data]
    assert "qwen2.5-1.5b-entry-parser" in ids
    assert "llama-3.2-3b-entry-parser" in ids

def test_vllm_chat_completions_json_constraint():
    """Checks /v1/chat/completions returns valid JSON according to schema."""
    req = ChatCompletionRequest(
        model="qwen2.5-1.5b-entry-parser",
        messages=[ChatMessage(role="user", content="2 kg sugar becha Ramesh ko 90 rs")],
    )
    res = chat_completions(req)
    assert "choices" in res
    content_str = res["choices"][0]["message"]["content"]
    
    # Must be valid parseable JSON matching schema
    parsed_json = json.loads(content_str)
    assert parsed_json["intent"] == "sale"
    assert parsed_json["product"] == "Sugar"
    assert parsed_json["quantity"] == 2.0
    assert parsed_json["amount"] == 90.0
    assert parsed_json["customer"] == "Ramesh"
