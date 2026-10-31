# Architecture
client (Next.js) -> REST -> server (FastAPI) <-> Postgres+pgvector, Redis/Celery workers.
Agent flow: plan -> approval_gate (money/external send) -> execute tool -> audit log.
Voice: Bhashini ASR -> NMT(en) -> LLM tool-calling -> NMT(back) -> Bhashini TTS -> Exotel.
LLM: fine-tuned Llama/Qwen via vLLM; forecasting: Prophet/XGBoost; computer use: Playwright on mock-portal.
Contracts: server/app/schemas (schemas.py, interfaces.py).
