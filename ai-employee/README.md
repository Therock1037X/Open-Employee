# AI Employee for Small Indian Businesses
Always-on AI employee: simple multilingual dashboard (owner + employees) -> data -> agent that keeps working after the dashboard closes (posts, voice calls, finance, portal automation) with approval gate + audit log.

## Structure
- client/  Next.js + Tailwind (frontend)
- server/  FastAPI + Celery (backend)  -> app/{core,schemas,api,workers,modules}
- mock-portal/  fake GST portal (no API) for Playwright demo
- infra: docker-compose.yml (postgres+pgvector, redis, server, worker, beat, client)

## Ownership
| Owner | Folders |
|---|---|
| User1 | client/, server/app/modules/business, server/app/api/business.py (sales, stock, finance CRUD, UPI views) |
| User2 | server/app/{core,schemas,workers}, migrations, modules/{agent,forecasting,computer_use}, mock-portal/ |
| User3 | server/app/modules/integrations (whatsapp, instagram, indiamart, payments_upi, finance_tools, captions), api/integrations.py |
| User4 | server/app/modules/{voice,memory,audit}, api/{voice,memory,audit}.py |

## Run
cp .env.example .env && docker compose up --build
Client: localhost:3000 | API docs: localhost:8000/docs
