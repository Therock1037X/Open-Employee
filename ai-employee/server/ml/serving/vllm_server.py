import time
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ml.entry_parser.trainer import EntryParserTrainer
from ml.entry_parser.schema import BusinessEntrySchema

app = FastAPI(
    title="Open Employee vLLM Inference Server",
    description="OpenAI-compatible inference server for fine-tuned Qwen2.5-1.5B / Llama 3.2 entry parser",
    version="1.0.0",
)

trainer = EntryParserTrainer()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = "qwen2.5-1.5b-entry-parser"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.1
    max_tokens: Optional[int] = 256

class ModelCard(BaseModel):
    id: str
    object: str = "model"
    created: int = Field(default_factory=lambda: int(time.time()))
    owned_by: str = "open-employee-ml"

class ModelListResponse(BaseModel):
    object: str = "list"
    data: List[ModelCard]

@app.get("/v1/models", response_model=ModelListResponse)
def list_models():
    """Returns available fine-tuned models matching OpenAI/vLLM specification."""
    return ModelListResponse(
        data=[
            ModelCard(id="qwen2.5-1.5b-entry-parser"),
            ModelCard(id="llama-3.2-3b-entry-parser"),
            ModelCard(id="default"),
        ]
    )

@app.post("/v1/chat/completions")
def chat_completions(req: ChatCompletionRequest):
    """
    OpenAI-compatible endpoint. Parses input text and returns JSON output
    strictly conforming to the BusinessEntrySchema.
    """
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")

    user_msg = req.messages[-1].content
    parsed_entry = trainer.parse_entry(user_msg)
    json_output = json.dumps(parsed_entry.model_dump(), ensure_ascii=False)

    return {
        "id": f"chatcmpl-{int(time.time() * 1000)}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model,
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": json_output,
                },
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": len(user_msg.split()) * 2,
            "completion_tokens": len(json_output.split()) * 2,
            "total_tokens": (len(user_msg.split()) + len(json_output.split())) * 2,
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
