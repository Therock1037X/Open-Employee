# Prompt for Antigravity (paste as first message)

You are the lead engineer on a 4-person team building an always-on AI employee for small Indian businesses (not a chatbot). First read README.md, AGENTS.md, docs/ARCHITECTURE.md and docs/GIT_WORKFLOW.md and follow them strictly.

PRODUCT: A very simple dashboard for owner + employees where users type or speak in their own language ("2 kg sugar becha Ramesh ko 90 rs"). The system parses it into sales/stock/finance records, has an embedded Razorpay UPI flow and finance records. The data feeds our agent, which keeps working after the dashboard closes: auto-posting to WhatsApp chats/status, IndiaMART and Instagram (auto captions after image publish), placing/receiving Indian-language voice calls (Bhashini ASR/NMT/TTS + Exotel) based on products customers use, demand/stock forecasting, and operating a no-API mock GST portal via Playwright computer use. Long-term business memory lives in Postgres+pgvector. Money-moving or external-send actions MUST pass an approval gate and every action is written to an audit log the owner can view.

STRUCTURE: client/ (Next.js + Tailwind), server/ (FastAPI + Celery; app/core, schemas, api, workers, modules/*), mock-portal/. Stack: PostgreSQL+pgvector, Redis+Celery, Playwright, fine-tuned Llama/Qwen via vLLM (OpenAI-compatible) + Prophet/XGBoost, Bhashini, Exotel, Razorpay, WhatsApp Cloud API, Instagram Graph API, Docker Compose.

OWNERSHIP: User1 = client/ + modules/business; User2 = core, schemas, workers, migrations, modules/agent, forecasting, computer_use, mock-portal; User3 = modules/integrations; User4 = modules/voice, memory, audit. Edit only the folder of the user I name. Never change schemas/core without telling me.

RULES: branch per task (feature/<user>-<task>), git pull --rebase before push, commits "<module>: <what>". Use mocks when API keys are missing; secrets only in .env.

24-HOUR DEMO: typed sale -> stock update -> low stock -> agent drafts WhatsApp post + Hindi voice call to supplier -> approval gate -> everything logged; Playwright on mock portal; one Indian-language outbound call that changes the workflow outcome; approval + audit screen.

FIRST TASK: ask me once which user I am, then scaffold that user's module (working vertical slice, tests, health/ping endpoint) inside owned folders only, and list what you need from other modules via server/app/schemas/interfaces.py.
