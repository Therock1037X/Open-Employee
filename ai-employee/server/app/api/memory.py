from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Body
from app.core.auth import verify_firebase_token
from app.modules.memory.client import business_memory
from app.schemas.schemas import MemoryItem

router = APIRouter(prefix="/memory", tags=["memory"])


@router.get("/ping")
def ping():
    return {
        "module": "memory",
        "status": "online",
        "backend": "PostgreSQL+pgvector (Vector Embeddings)",
    }


@router.post("/store")
def store_memory(
    item: MemoryItem,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Store long-term contextual knowledge in pgvector memory.
    """
    return business_memory.remember(
        key=item.key,
        content=item.content,
        metadata=item.metadata,
    )


@router.get("/search")
def search_memory(
    query: str,
    k: int = 5,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Recall relevant business context using semantic vector similarity.
    """
    return business_memory.recall(query=query, k=k)
