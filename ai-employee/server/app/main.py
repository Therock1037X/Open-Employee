from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import business, agent, integrations, voice, memory, audit

app = FastAPI(title="AI Employee API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"ok": True}

# one router file per owner-module -> no merge clashes
for r in (business, agent, integrations, voice, memory, audit):
    app.include_router(r.router)
