# AGENTS.md
- Edit only the folders owned by the current user (README ownership table).
- Never edit server/app/schemas or core without instruction; propose changes in the reply.
- One task = one branch = one small PR (docs/GIT_WORKFLOW.md).
- Any money/external-send action must go through approval_gate and write an AuditEvent.
- Code against server/app/schemas/interfaces.py; mock other modules until ready.
- Backend: Python 3.11, FastAPI, Pydantic, SQLAlchemy. Frontend: TypeScript, Next.js, Tailwind. Add tests.
