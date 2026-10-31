import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search and load .env across server and root directories
_current_dir = Path(__file__).resolve().parent
_env_candidates = [
    _current_dir.parent.parent / ".env",          # ai-employee/server/.env
    _current_dir.parent.parent.parent / ".env",   # ai-employee/.env
    Path.cwd() / ".env",
]

for env_path in _env_candidates:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=False)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Open Employee API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./openemployee.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://localhost:8000/v1")
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "llama-3-8b-instruct")

    # Firebase
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "openemployee-1037x")
    FIREBASE_CREDENTIALS_PATH: str | None = os.getenv("FIREBASE_CREDENTIALS_PATH", None)

    # Bhashini (Government of India AI Speech & Translation Platform)
    BHASHINI_USER_ID: str | None = os.getenv("BHASHINI_USER_ID")
    BHASHINI_API_KEY: str | None = os.getenv("BHASHINI_API_KEY")
    BHASHINI_INFERENCE_KEY: str | None = os.getenv("BHASHINI_INFERENCE_KEY")
    BHASHINI_PIPELINE_URL: str = os.getenv(
        "BHASHINI_PIPELINE_URL",
        "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    )
    BHASHINI_CONFIG_URL: str = os.getenv(
        "BHASHINI_CONFIG_URL",
        "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
    )

    # Exotel Telephony
    EXOTEL_SID: str | None = os.getenv("EXOTEL_SID")
    EXOTEL_API_KEY: str | None = os.getenv("EXOTEL_API_KEY")
    EXOTEL_API_TOKEN: str | None = os.getenv("EXOTEL_API_TOKEN")

    # Payments & Integrations
    RAZORPAY_KEY_ID: str | None = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET: str | None = os.getenv("RAZORPAY_KEY_SECRET")
    WHATSAPP_TOKEN: str | None = os.getenv("WHATSAPP_TOKEN")
    WHATSAPP_PHONE_ID: str | None = os.getenv("WHATSAPP_PHONE_ID")
    INSTAGRAM_TOKEN: str | None = os.getenv("INSTAGRAM_TOKEN")
    INDIAMART_API_KEY: str | None = os.getenv("INDIAMART_API_KEY")

    # Mock GST Portal for Playwright computer use
    MOCK_PORTAL_URL: str = os.getenv("MOCK_PORTAL_URL", "http://localhost:8080")

    class Config:
        extra = "allow"

settings = Settings()

# Backward compatibility exports
DATABASE_URL = settings.DATABASE_URL
REDIS_URL = settings.REDIS_URL
LLM_BASE_URL = settings.LLM_BASE_URL
