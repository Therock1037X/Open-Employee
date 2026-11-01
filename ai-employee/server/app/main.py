from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api import business, agent, integrations, voice, memory, audit

app = FastAPI(title="AI Employee API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/", include_in_schema=False)
def root(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return RedirectResponse(url="/docs")
    return {
        "status": "online",
        "app": "Open Employee AI Backend",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health",
        "modules": ["business", "agent", "integrations", "voice", "memory", "audit"],
    }

@app.get("/health")
def health(): return {"ok": True}

# one router file per owner-module -> no merge clashes
for r in (business, agent, integrations, voice, memory, audit):
    app.include_router(r.router)
