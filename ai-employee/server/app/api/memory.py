from fastapi import APIRouter
router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("/ping")
def ping(): return {"module": "memory"}
