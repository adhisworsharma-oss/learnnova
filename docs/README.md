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
# With Docker (recommended)
git clone https://github.com/adhisworsharma-oss/learnnova.git
cd learnnova/learnnova
docker compose up --build

# Without Docker
# See feasibility-study.md Section 3 for manual setup
```
