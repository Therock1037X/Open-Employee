from fastapi import APIRouter
router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/ping")
def ping(): return {"module": "audit"}
