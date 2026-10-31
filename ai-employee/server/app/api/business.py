from fastapi import APIRouter
router = APIRouter(prefix="/business", tags=["business"])

@router.get("/ping")
def ping(): return {"module": "business"}
