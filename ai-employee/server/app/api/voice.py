from fastapi import APIRouter
router = APIRouter(prefix="/voice", tags=["voice"])

@router.get("/ping")
def ping(): return {"module": "voice"}
