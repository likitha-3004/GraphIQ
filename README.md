# GraphIQ — B2B Predictive Influencer Platform

> 📖 **Comprehensive Documentation**: For the complete A-to-Z technical architecture, mathematical formulations, algorithms, and implementation details, see [PROJECT_A_TO_Z_GUIDE.md](file:///c:/Users/HP/Downloads/final/PROJECT_A_TO_Z_GUIDE.md).

## Quick Start

### Local Development (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Edit .env — set SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd b2b-influencer-dashboard
npm install
# .env.local is already set to http://127.0.0.1:8000
npm run dev
```

---

### Production Deployment (Docker Compose)

```bash
# 1. Configure the backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — change SECRET_KEY and ADMIN_PASSWORD

# 2. Build and start all services (backend + Redis + Neo4j)
docker-compose up --build -d

# 3. Check everything is healthy
docker-compose ps
curl http://localhost:8000/health

# 4. Import graph data into Neo4j (optional, once)
docker-compose exec backend python import_neo4j.py
```

**Service URLs:**
| Service | URL |
|---------|-----|
| FastAPI backend | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Neo4j Browser | http://localhost:7474 |
| Frontend (dev) | http://localhost:3000 |

---

## Authentication

All `/api/v1/*` endpoints require a JWT Bearer token.

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=admin&password=graphiq@2024" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Use the token:**
```bash
curl http://localhost:8000/api/v1/niches \
  -H "Authorization: Bearer <token>"
```

**Sign up / Register a new user:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst1","password":"password123"}'
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | ❌ | Health check |
| `/api/auth/login` | POST | ❌ | Get JWT token |
| `/api/auth/register` | POST | ❌ | Sign up / Register new user |
| `/api/auth/signup` | POST | ❌ | Sign up alias endpoint |
| `/api/auth/me` | GET | ✅ | Current user info |
| `/api/v1/niches` | GET | ✅ | List niche categories |
| `/api/v1/graph/sample` | GET | ✅ | Top-N PageRank graph |
| `/api/v1/optimize` | POST | ✅ | BLII optimization |
| `/api/v1/optimize/celf` | POST | ✅ | CELF++ optimization |
| `/api/v1/optimize/graphsage-celf` | POST | ✅ | GraphSAGE+CELF++ |
| `/api/v1/optimize/community` | POST | ✅ | Community partitioning |
| `/api/v1/optimize/temporal-gnn` | POST | ✅ | Temporal GNN-LSTM |
| `/api/v1/optimize/compare` | POST | ✅ | All 4 algorithms compared |
| `/api/v1/nlp/score-relevance` | POST | ✅ | NLP keyword scorer |
| `/api/v1/evaluate/monte-carlo` | POST | ✅ | Monte Carlo IC spread |

---

## Environment Variables (backend/.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing secret — **change in production** | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token TTL | `480` |
| `ADMIN_USERNAME` | Default admin username | `admin` |
| `ADMIN_PASSWORD` | Default admin password | `graphiq@2024` |
| `REDIS_HOST` | Redis hostname | `redis` (compose) / `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `NEO4J_URI` | Neo4j Bolt URI | `neo4j://neo4j:7687` |
| `NEO4J_USER` | Neo4j username | `neo4j` |
| `NEO4J_PASSWORD` | Neo4j password | `graphiq_neo4j_2024` |

---

## Project Structure

```
final/
├── docker-compose.yml          # Orchestrates backend + Redis + Neo4j
├── backend/
│   ├── main.py                 # FastAPI app — all algorithms + JWT auth
│   ├── requirements.txt        # Python dependencies (pinned)
│   ├── Dockerfile              # Multi-stage build, non-root user
│   ├── .env                    # Environment config (not committed)
│   ├── .env.example            # Template for deployers
│   ├── .dockerignore
│   ├── dataset.py              # Synthetic dataset generator
│   ├── import_neo4j.py         # Neo4j bulk import
│   ├── b2b_nodes.csv           # 4,500 influencer nodes
│   └── b2b_edges.csv           # Interaction edges
└── b2b-influencer-dashboard/
    ├── app/
    │   ├── page.tsx            # Full dashboard (login + 4 sections)
    │   ├── layout.tsx          # App shell + SEO metadata
    │   └── globals.css
    ├── .env.local              # NEXT_PUBLIC_API_URL
    └── package.json
```
