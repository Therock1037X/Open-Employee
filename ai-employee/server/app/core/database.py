import json
from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    DateTime,
    Text,
    Boolean,
    JSON,
    Integer,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Engine setup: handle SQLite vs PostgreSQL seamlessly
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Core Database Models ---

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product = Column(String(255), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    created_by = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=True)
    lang = Column(String(10), default="hi")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product = Column(String(255), unique=True, nullable=False, index=True)
    current_quantity = Column(Float, default=0.0)
    min_threshold = Column(Float, default=10.0)  # triggers reorder / supplier call
    unit = Column(String(50), default="kg")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AgentTaskRecord(Base):
    __tablename__ = "agent_tasks"

    id = Column(String(64), primary_key=True)
    kind = Column(String(64), nullable=False, index=True)
    payload = Column(JSON, default=dict)
    status = Column(String(32), default="pending", index=True)
    result = Column(JSON, nullable=True)
    requires_approval = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    run_at = Column(DateTime, nullable=True)


class ApprovalRecord(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(64), nullable=False, index=True)
    action = Column(String(128), nullable=False)
    amount = Column(Float, nullable=True)
    recipient = Column(String(255), nullable=True)
    details = Column(JSON, default=dict)
    status = Column(String(32), default="pending", index=True)  # pending, approved, rejected
    decided_by = Column(String(255), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLogRecord(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor = Column(String(255), nullable=False, index=True)
    action = Column(String(128), nullable=False, index=True)
    detail = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class MemoryRecord(Base):
    __tablename__ = "business_memory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=True)  # JSON-serialized vector for cross-DB compatibility
    metadata_info = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class WhatsAppMessageRecord(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(String(128), unique=True, index=True, nullable=True)
    sender = Column(String(64), index=True, nullable=False)
    recipient = Column(String(64), index=True, nullable=True)
    direction = Column(String(16), default="inbound", index=True)  # inbound, outbound
    message_type = Column(String(32), default="text")              # text, image, document, template
    text = Column(Text, nullable=True)
    media_url = Column(String(512), nullable=True)
    media_id = Column(String(128), nullable=True)
    mime_type = Column(String(64), nullable=True)
    filename = Column(String(255), nullable=True)
    is_invoice = Column(Boolean, default=False)
    status = Column(String(32), default="received")                # received, sent, pending_approval, failed
    raw_payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)

# Auto-initialize tables
try:
    init_db()
except Exception as e:
    pass

def get_db():
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

