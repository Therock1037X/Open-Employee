from fastapi import APIRouter
router = APIRouter(prefix="/integrations", tags=["integrations"])

@router.get("/ping")
def ping(): return {"module": "integrations"}
