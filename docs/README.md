# LEARNOVA Documentation

## Project Overview

LEARNOVA is a full-stack digital learning and e-library platform for college students. Built with React 19, Node.js/Express, MySQL 8, and Docker.

## Documentation Index

| Document | Description |
|----------|-------------|
| [Feasibility Study](feasibility-study.md) | Technical, economic, operational, schedule, and legal feasibility analysis |
| [Flowcharts](flowcharts.md) | System flowcharts for all major processes (registration, login, reading, recommendations, etc.) |
| [ER Diagram](er-diagram.md) | Entity Relationship diagram with table schemas, relationships, constraints, and seed data |

## Quick Links

- **Repository:** https://github.com/adhisworsharma-oss/learnnova
- **Tech Stack:** React 19 + Vite 8 | Node.js + Express 4 | MySQL 8 | Docker
- **Ports:** Frontend (80) | Backend (5000) | MySQL (3306)

## How to Run

```bash
# 1. Provision secrets (writes the gitignored .env, generates a JWT secret)
npm run setup          # or: setup-env.cmd on Windows

# 2. Start the stack
docker compose up --build
```

`setup` is required before the first `docker compose up`. It creates `.env` in the
repo root, which Compose injects into the backend as `GEMINI_API_KEY` and
`JWT_SECRET`. Compose refuses to start the backend if `GEMINI_API_KEY` is missing,
so a misconfigured checkout fails immediately instead of silently running with a
dead chatbot.

To run on a second machine, clone the repo and re-run `npm run setup` with your own
key from https://aistudio.google.com/apikey. Keys are never committed.

```bash
# With Docker (recommended)
git clone https://github.com/adhisworsharma-oss/learnova.git
cd learnova
npm run setup
docker compose up --build

# Without Docker
npm install && npm run db:init && npm run dev   # in backend/
npm run dev                                      # in frontend/
# See feasibility-study.md Section 3 for manual setup
```

### Nova (AI assistant)

The chatbot at `frontend/src/components/Chatbot.jsx` calls `POST /api/chat`, which
the backend proxies to the Gemini API. The key is read from `GEMINI_API_KEY` on the
server and is never sent to the browser. If Gemini reports high demand, the backend
retries `gemini-3.5-flash-lite` then `gemini-3.1-flash-lite` before surfacing an
error. If the API is unreachable the chat panel falls back to canned replies.

