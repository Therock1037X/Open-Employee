from typing import Dict, Any, Callable
from app.core.database import SessionLocal, AuditLogRecord
from datetime import datetime

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self._tools[name] = func

    async def execute(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        if tool_name not in self._tools:
            return {"error": f"Tool '{tool_name}' not found", "success": False}

        tool = self._tools[tool_name]
        try:
            if callable(tool):
                import inspect
                if inspect.iscoroutinefunction(tool):
                    result = await tool(**kwargs)
                else:
                    result = tool(**kwargs)
            else:
                result = {"error": "Tool not callable"}

            # Log audit record
            db = SessionLocal()
            try:
                audit = AuditLogRecord(
                    actor="agent_tool_executor",
                    action=f"executed_{tool_name}",
                    detail={"kwargs": kwargs, "success": True},
                    timestamp=datetime.utcnow(),
                )
                db.add(audit)
                db.commit()
            finally:
                db.close()

            return {"success": True, "result": result}
        except Exception as e:
            return {"success": False, "error": str(e)}

tool_registry = ToolRegistry()
