import json
import math
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.database import SessionLocal, MemoryRecord

class BusinessMemoryStore:
    """
    Long-term business memory backed by PostgreSQL + pgvector.
    Stores customer preferences, supplier credit terms, and transaction context.
    """

    def _generate_embedding(self, text: str) -> List[float]:
        """
        Generates deterministic normalized embedding for text
        (compatible with pgvector cosine distance).
        """
        vec = [0.0] * 32
        for i, char in enumerate(text.lower()):
            idx = (ord(char) * (i + 1)) % 32
            vec[idx] += 1.0

        # Normalize
        magnitude = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / magnitude, 4) for x in vec]

    def remember(self, key: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Stores key business fact into vector memory.
        """
        db = SessionLocal()
        try:
            embedding = self._generate_embedding(content)
            record = MemoryRecord(
                key=key,
                content=content,
                embedding_json=json.dumps(embedding),
                metadata_info=metadata or {},
                created_at=datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return {"id": record.id, "key": key, "status": "STORED"}
        finally:
            db.close()

    def recall(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Recalls the k most relevant memories using cosine similarity.
        """
        query_vec = self._generate_embedding(query)
        db = SessionLocal()
        try:
            records = db.query(MemoryRecord).all()
            scored = []
            for r in records:
                if not r.embedding_json:
                    continue
                try:
                    vec = json.loads(r.embedding_json)
                    # Cosine dot product of normalized vectors
                    score = sum(q * v for q, v in zip(query_vec, vec))
                    scored.append((score, r))
                except Exception:
                    continue

            scored.sort(key=lambda x: x[0], reverse=True)
            results = []
            for score, r in scored[:k]:
                results.append({
                    "id": r.id,
                    "key": r.key,
                    "content": r.content,
                    "similarity": round(score, 3),
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                })
            return results
        finally:
            db.close()

business_memory = BusinessMemoryStore()
