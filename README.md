# Open Employee

> Always-on AI employee for small Indian businesses: simple multilingual dashboard (owner + employees) -> data -> agent that keeps working after the dashboard closes (posts, voice calls, finance, portal automation) with approval gate + audit log.

## Repository Overview

The core application architecture and source code reside within the [`ai-employee`](./ai-employee) folder:

- **[`ai-employee/client/`](./ai-employee/client)**: Next.js + Tailwind CSS frontend dashboard
- **[`ai-employee/server/`](./ai-employee/server)**: FastAPI + Celery backend (`app/{core,schemas,api,workers,modules}`)
- **[`ai-employee/mock-portal/`](./ai-employee/mock-portal)**: Mock GST portal for Playwright computer-use automation
- **[`ai-employee/docs/`](./ai-employee/docs)**: System architecture and Git workflow documentation
- **[`ai-employee/docker-compose.yml`](./ai-employee/docker-compose.yml)**: Multi-container orchestration (Postgres+pgvector, Redis, FastAPI, Celery workers/beat, Next.js client)

For detailed module ownership, workflows, and local setup instructions, see [`ai-employee/README.md`](./ai-employee/README.md) and [`ai-employee/docs/ARCHITECTURE.md`](./ai-employee/docs/ARCHITECTURE.md).
