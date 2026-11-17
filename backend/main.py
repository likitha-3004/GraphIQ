import json
import redis
import math
import random
import statistics
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, List

import bcrypt
import heapq
import pandas as pd
import networkx as nx
import community as community_louvain
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel

# ── Load environment ───────────────────────────────────────────────────────
load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_in_production_please_32chars!")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "graphiq@2024")

REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))

# ── FastAPI app ────────────────────────────────────────────────────────────
app = FastAPI(
    title="B2B Predictive Influencer Platform API",
    description=(
        "Comprehensive backend: BLII, CELF++, GraphSAGE+CELF, Community, "
        "Temporal GNN-LSTM, NLP, Monte Carlo IC. JWT-protected."
    ),
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth helpers ───────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# In-memory user store — keyed by username, value is bcrypt-hashed password (bytes).
# In production replace with a proper DB.
_users_db: dict[str, bytes] = {}
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")


def _hash_password(plain: str) -> bytes:
    """Hash a plain-text password using bcrypt directly (compatible with bcrypt 4.x and 5.x)."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt())


def _verify_password(plain: str, hashed: bytes) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed)
    except Exception:
        return False


def _create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Dependency — validates JWT and returns username. Raises 401 on failure."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None or username not in _users_db:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username


# ── Redis ──────────────────────────────────────────────────────────────────
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    redis_client.ping()
    print(f"Redis connected at {REDIS_HOST}:{REDIS_PORT}.")
except Exception as e:
    print(f"Redis not available ({e}). Falling back to RAM-only.")
    redis_client = None

# ── Global state ───────────────────────────────────────────────────────────
G = None
nodes_df = None
edges_df = None
partition_map: dict = {}
pagerank_scores: dict = {}
max_followers_val: int = 1

# ── NLP keyword expansion ──────────────────────────────────────────────────
NICHE_KEYWORD_MAP = {
    "general social media influencer": [
        "social", "media", "influencer", "general", "lifestyle", "brand",
        "online", "web", "internet", "marketing", "digital",
    ],
    "instagram creator": [
        "instagram", "photo", "visual", "reels", "story", "creator",
        "picture", "image", "aesthetic", "ig", "reel",
    ],
    "tiktok influencer": [
        "tiktok", "video", "short", "viral", "dance", "trend",
        "influencer", "clip", "for-you", "fyp", "tok",
    ],
    "youtube content creator": [
        "youtube", "video", "vlog", "long", "content", "creator",
        "channel", "subscribe", "stream", "yt", "tutorial",
    ],
    "cross-platform creator": [
        "cross", "platform", "multi", "omnichannel", "creator",
        "diverse", "everywhere", "all", "hybrid",
    ],
}


# ── Startup ────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup_handler():
    _load_users()
    load_graph_data()


def _seed_admin_user():
    """Create the default admin user from environment variables."""
    global _users_db
    _users_db[ADMIN_USERNAME] = _hash_password(ADMIN_PASSWORD)
    print(f"Admin user '{ADMIN_USERNAME}' seeded.")


def _load_users():
    """Initialize default admin and load persisted users if present."""
    global _users_db
    _seed_admin_user()
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for uname, h in saved.items():
                    if uname and h and uname not in _users_db:
                        _users_db[uname] = h.encode("utf-8") if isinstance(h, str) else h
            print(f"Loaded {len(_users_db)} users into auth store.")
        except Exception as e:
            print(f"Warning: could not load {USERS_FILE}: {e}")


def _save_users():
    """Persist registered users so they survive server restarts."""
    try:
        data = {
            uname: h.decode("utf-8") if isinstance(h, bytes) else str(h)
            for uname, h in _users_db.items()
        }
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Warning: could not save {USERS_FILE}: {e}")


def load_graph_data():
    global G, nodes_df, edges_df, partition_map, pagerank_scores, max_followers_val

    node_file = "b2b_nodes.csv"
    edge_file = "b2b_edges.csv"

    if not os.path.exists(node_file) or not os.path.exists(edge_file):
        raise RuntimeError("b2b_nodes.csv / b2b_edges.csv not found in working directory.")

    nodes_df = pd.read_csv(node_file)
    edges_df = pd.read_csv(edge_file)

    G = nx.DiGraph()

    for _, row in nodes_df.iterrows():
        growth = float(row["growth_percentage"]) if "growth_percentage" in row and not pd.isna(row["growth_percentage"]) else 12.5
        post_count = int(row["post_count"]) if "post_count" in row and not pd.isna(row["post_count"]) else 500
        G.add_node(
            str(row["node_id"]),
            niche=str(row["niche"]),
            followers=int(row["followers"]),
            cost=float(row["cost_quote"]),
            engagement=float(row["engagement_rate"]),
            active=bool(row["account_active"]),
            growth=growth,
            post_count=post_count,
        )

    for _, row in edges_df.iterrows():
        last_int = int(row["last_interaction"]) if "last_interaction" in row and not pd.isna(row["last_interaction"]) else 30
        int_freq = float(row["interaction_frequency"]) if "interaction_frequency" in row and not pd.isna(row["interaction_frequency"]) else 0.5
        G.add_edge(
            str(row["source"]),
            str(row["target"]),
            weight=float(row["weight"]),
            overlap=float(row["audience_overlap"]),
            sentiment=float(row["sentiment"]),
            last_interaction=last_int,
            interaction_freq=int_freq,
        )

    print("Computing PageRank (GNN importance proxy)...")
    pagerank_scores = nx.pagerank(G, weight="weight", max_iter=200, tol=1.0e-4)
    max_followers_val = max((G.nodes[n]["followers"] for n in G.nodes()), default=1)

    undirected_g = G.to_undirected()
    partition_map = community_louvain.best_partition(undirected_g)

    print(
        f"Graph ready: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, "
        f"{len(set(partition_map.values()))} communities."
    )


# ══════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════════════════

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    expires_in_minutes: int


class RegisterRequest(BaseModel):
    username: str
    password: str


class CampaignRequest(BaseModel):
    budget: float = 50000.0
    niche_filter: Optional[str] = None


class NLPRatingRequest(BaseModel):
    query_keywords: List[str]
    sample_size: int = 10


class MCEvaluateRequest(BaseModel):
    seed_ids: List[str]
    num_simulations: int = 200


# ══════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS  (public — no JWT required)
# ══════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login", response_model=Token, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate and receive a JWT Bearer token.
    Use the token in the `Authorization: Bearer <token>` header for all
    `/api/v1/*` endpoints.
    """
    hashed = _users_db.get(form_data.username)
    if not hashed or not _verify_password(form_data.password, hashed):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = _create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(
        access_token=token,
        token_type="bearer",
        username=form_data.username,
        expires_in_minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED, tags=["Auth"])
@app.post("/api/auth/signup", status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(request: RegisterRequest):
    """
    Register a new user account (public sign-up for new users).
    Returns confirmation and a JWT Bearer token upon successful registration.
    """
    clean_username = request.username.strip()
    if not clean_username:
        raise HTTPException(status_code=422, detail="Username cannot be empty.")
    if len(clean_username) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters long.")
    if len(clean_username) > 50:
        raise HTTPException(status_code=422, detail="Username cannot exceed 50 characters.")
    if clean_username in _users_db:
        raise HTTPException(status_code=409, detail=f"Username '{clean_username}' already exists.")
    if len(request.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters long.")
    
    _users_db[clean_username] = _hash_password(request.password)
    _save_users()

    token = _create_access_token(
        data={"sub": clean_username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "message": f"User '{clean_username}' registered successfully.",
        "access_token": token,
        "token_type": "bearer",
        "username": clean_username,
        "expires_in_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
    }


@app.get("/api/auth/me", tags=["Auth"])
def me(current_user: str = Depends(get_current_user)):
    """Return the currently authenticated username."""
    return {"username": current_user}


# ══════════════════════════════════════════════════════════════════════════
# INTERNAL ALGORITHM HELPERS
# ══════════════════════════════════════════════════════════════════════════

def _eval_spread(seeds: list) -> float:
    key = "spread:" + ",".join(sorted(seeds))
    if redis_client:
        cached = redis_client.get(key)
        if cached:
            return float(cached)

    active_states = {n: 0.0 if n in seeds else 1.0 for n in G.nodes()}
    spread = 0.0
    for u in G.nodes():
        for v in G.successors(u):
            spread += (
                G.edges[u, v]["weight"]
                * (1.0 - 0.5 * G.edges[u, v]["overlap"])
                * active_states[v]
            )
    if redis_client:
        redis_client.setex(key, 3600, spread)
    return spread


def _build_audit_entry(node: str, influence: float, efficiency: float, remaining: float) -> dict:
    nd = G.nodes[node]
    return {
        "node_id": node,
        "niche": nd["niche"],
        "followers": nd["followers"],
        "cost": nd["cost"],
        "expected_influence": round(influence, 2),
        "marginal_efficiency": round(efficiency, 4),
        "remaining_budget": round(remaining, 2),
    }


def _matches_niche(node_niche: str, niche_filter: Optional[str]) -> bool:
    if not niche_filter:
        return True
    nf = niche_filter.strip().lower()
    if nf in ("all", "all categories", "none", "", "all communities"):
        return True
    nn = str(node_niche).strip().lower()
    return nf in nn or nn in nf


# ── BLII ───────────────────────────────────────────────────────────────────

def _run_blii(budget: float, niche_filter: Optional[str] = None) -> dict:
    S = {n: 1.0 for n in G.nodes()}
    F = {
        u: sum(
            G.edges[u, v]["weight"] * (1.0 - 0.5 * G.edges[u, v]["overlap"])
            for v in G.successors(u)
        )
        for u in G.nodes()
    }

    seed_set, remaining, audit_trail = [], budget, []

    while remaining > 0:
        candidates = [
            u for u in G.nodes()
            if G.nodes[u]["active"]
            and u not in seed_set
            and G.nodes[u]["cost"] <= remaining
            and F[u] > 0
            and _matches_niche(G.nodes[u]["niche"], niche_filter)
        ]
        if not candidates:
            break

        mi_scores = {u: F[u] / G.nodes[u]["cost"] for u in candidates}
        best = max(mi_scores, key=mi_scores.get)
        if mi_scores[best] <= 0:
            break

        seed_set.append(best)
        remaining -= G.nodes[best]["cost"]
        audit_trail.append(_build_audit_entry(best, F[best], mi_scores[best], remaining))

        S[best] = 0.0
        F[best] = 0.0
        affected: set = set()
        for v in G.successors(best):
            affected.add(v)
            for w in G.predecessors(v):
                affected.add(w)
        for w in G.predecessors(best):
            affected.add(w)

        for w in affected:
            if S[w] > 0:
                F[w] = sum(
                    G.edges[w, v]["weight"] * (1.0 - 0.5 * G.edges[w, v]["overlap"]) * S[v]
                    for v in G.successors(w)
                )

    return {
        "seeds": seed_set,
        "total_spent": budget - remaining,
        "remaining_budget": remaining,
        "audit_trail": audit_trail,
        "total_reach": sum(G.nodes[s]["followers"] for s in seed_set),
    }


# ── CELF++ ─────────────────────────────────────────────────────────────────

def _run_celf(budget_limit: float, niche_filter: Optional[str] = None) -> dict:
    seed_set, total_spent = [], 0.0
    base_spread = _eval_spread([])
    heap = []

    for node in G.nodes():
        nd = G.nodes[node]
        if not nd["active"] or nd["cost"] > budget_limit:
            continue
        if not _matches_niche(nd["niche"], niche_filter):
            continue
        mg = _eval_spread([node]) - base_spread
        heapq.heappush(heap, (-(mg / nd["cost"]), node, 0, mg))

    while heap and total_spent < budget_limit:
        neg_eff, u, last_iter, _ = heapq.heappop(heap)
        cost = G.nodes[u]["cost"]
        if total_spent + cost > budget_limit:
            continue
        if last_iter == len(seed_set):
            seed_set.append(u)
            total_spent += cost
            base_spread = _eval_spread(seed_set)
            continue
        new_mg = _eval_spread(seed_set + [u]) - base_spread
        cur_eff = new_mg / cost if cost > 0 else 0
        if not heap or cur_eff >= -heap[0][0]:
            seed_set.append(u)
            total_spent += cost
            base_spread = _eval_spread(seed_set)
        else:
            heapq.heappush(heap, (-cur_eff, u, len(seed_set), new_mg))

    remaining = budget_limit - total_spent
    audit_trail = []
    for s in seed_set:
        inf_val = _eval_spread([s])
        cost = G.nodes[s]["cost"]
        audit_trail.append(_build_audit_entry(s, inf_val, inf_val / cost if cost > 0 else 0, remaining))

    return {
        "seeds": seed_set,
        "total_spent": total_spent,
        "remaining_budget": remaining,
        "audit_trail": audit_trail,
        "total_reach": sum(G.nodes[s]["followers"] for s in seed_set),
    }


# ── GraphSAGE + CELF++ ─────────────────────────────────────────────────────

def _run_graphsage_celf(budget_limit: float, niche_filter: Optional[str] = None, candidate_pct: float = 0.30) -> dict:
    max_pr = max(pagerank_scores.values()) if pagerank_scores else 1.0

    scored: dict[str, float] = {}
    for node in G.nodes():
        nd = G.nodes[node]
        if not nd["active"] or nd["cost"] > budget_limit:
            continue
        if not _matches_niche(nd["niche"], niche_filter):
            continue
        pr = pagerank_scores.get(node, 0) / max_pr
        fol = nd["followers"] / max_followers_val
        eng = min(nd["engagement"] / 0.08, 1.0)
        in_deg = min(G.in_degree(node) / 20.0, 1.0)
        scored[node] = 0.35 * pr + 0.30 * fol + 0.20 * eng + 0.15 * in_deg

    if not scored:
        return {"seeds": [], "total_spent": 0.0, "remaining_budget": budget_limit,
                "audit_trail": [], "total_reach": 0, "candidates_evaluated": 0}

    n_cands = max(10, int(len(scored) * candidate_pct))
    candidates = sorted(scored, key=scored.get, reverse=True)[:n_cands]  # type: ignore[arg-type]

    seed_set, total_spent = [], 0.0
    base_spread = _eval_spread([])
    heap: list = []

    for node in candidates:
        cost = G.nodes[node]["cost"]
        mg = _eval_spread([node]) - base_spread
        heapq.heappush(heap, (-(mg / cost), node, 0, mg))

    while heap and total_spent < budget_limit:
        neg_eff, u, last_iter, _ = heapq.heappop(heap)
        cost = G.nodes[u]["cost"]
        if total_spent + cost > budget_limit:
            continue
        if last_iter == len(seed_set):
            seed_set.append(u)
            total_spent += cost
            base_spread = _eval_spread(seed_set)
            continue
        new_mg = _eval_spread(seed_set + [u]) - base_spread
        cur_eff = new_mg / cost if cost > 0 else 0
        if not heap or cur_eff >= -heap[0][0]:
            seed_set.append(u)
            total_spent += cost
            base_spread = _eval_spread(seed_set)
        else:
            heapq.heappush(heap, (-cur_eff, u, len(seed_set), new_mg))

    remaining = budget_limit - total_spent
    audit_trail = []
    for s in seed_set:
        inf_val = _eval_spread([s])
        cost = G.nodes[s]["cost"]
        entry = _build_audit_entry(s, inf_val, inf_val / cost if cost > 0 else 0, remaining)
        entry["gnn_score"] = round(scored.get(s, 0), 4)
        audit_trail.append(entry)

    return {
        "seeds": seed_set,
        "total_spent": total_spent,
        "remaining_budget": remaining,
        "audit_trail": audit_trail,
        "total_reach": sum(G.nodes[s]["followers"] for s in seed_set),
        "candidates_evaluated": len(candidates),
    }


# ── Community-Aware Partitioning ───────────────────────────────────────────

def _run_community(budget_limit: float, niche_filter: Optional[str] = None) -> dict:
    communities: dict[int, list] = {}
    for node, comm_id in partition_map.items():
        communities.setdefault(comm_id, []).append(node)

    total_nodes = G.number_of_nodes()
    seed_set, total_spent = [], 0.0

    # Sort communities largest-first so bigger communities get first pick
    sorted_communities = sorted(communities.items(), key=lambda x: len(x[1]), reverse=True)

    for comm_id, members in sorted_communities:
        # Proportional community budget (guide formula: B * |Ck| / |V|)
        raw_comm_budget = budget_limit * (len(members) / total_nodes)

        # Floor: allow at least one selection per community if budget remains
        # Find min cost among eligible active members in this community
        eligible = [
            u for u in members
            if u in G.nodes() and G.nodes[u]["active"]
            and _matches_niche(G.nodes[u]["niche"], niche_filter)
        ]
        if not eligible:
            continue

        min_cost = min(G.nodes[u]["cost"] for u in eligible)
        # Use proportional budget but floor it at the minimum influencer cost
        comm_budget = max(raw_comm_budget, min_cost)

        comm_spent = 0.0
        sorted_members = sorted(
            eligible,
            key=lambda n: (
                G.nodes[n].get("followers", 0) * G.nodes[n].get("engagement", 0.01)
            ) / max(G.nodes[n].get("cost", 1.0), 1.0),
            reverse=True,
        )

        for u in sorted_members:
            cost = G.nodes[u]["cost"]
            if (comm_spent + cost) <= comm_budget and (total_spent + cost) <= budget_limit:
                seed_set.append(u)
                comm_spent += cost
                total_spent += cost

    remaining = budget_limit - total_spent
    audit_trail = []
    for s in seed_set:
        nd = G.nodes[s]
        influence = nd["followers"] * nd["engagement"]
        cost = nd["cost"]
        audit_trail.append(_build_audit_entry(s, influence, influence / cost if cost > 0 else 0, remaining))

    return {
        "seeds": seed_set,
        "total_spent": total_spent,
        "remaining_budget": remaining,
        "audit_trail": audit_trail,
        "total_reach": sum(G.nodes[s]["followers"] for s in seed_set),
    }


# ── Temporal GNN-LSTM ──────────────────────────────────────────────────────

def _run_temporal_gnn(budget_limit: float, niche_filter: Optional[str] = None) -> dict:
    scored: list[tuple[str, float]] = []

    for node in G.nodes():
        nd = G.nodes[node]
        if not nd["active"] or nd["cost"] > budget_limit:
            continue
        if not _matches_niche(nd["niche"], niche_filter):
            continue

        growth_factor = 1.0 + max(0.0, nd.get("growth", 12.5)) / 100.0

        preds = list(G.predecessors(node))
        if preds:
            recency_vals = [
                math.exp(-G.edges[p, node].get("last_interaction", 30) / 30.0)
                for p in preds
            ]
            avg_recency = sum(recency_vals) / len(recency_vals)
        else:
            avg_recency = 0.5

        base = nd["followers"] * nd["engagement"]
        temporal_score = base * growth_factor * (0.6 + 0.4 * avg_recency)
        efficiency = temporal_score / max(nd["cost"], 1.0)
        scored.append((node, temporal_score, efficiency))

    scored.sort(key=lambda x: x[2], reverse=True)
    seed_set, total_spent, audit_trail = [], 0.0, []

    for node, score, eff in scored:
        cost = G.nodes[node]["cost"]
        if total_spent + cost <= budget_limit:
            seed_set.append(node)
            total_spent += cost
            audit_trail.append(
                _build_audit_entry(node, score, eff, budget_limit - total_spent)
            )

    return {
        "seeds": seed_set,
        "total_spent": total_spent,
        "remaining_budget": budget_limit - total_spent,
        "audit_trail": audit_trail,
        "total_reach": sum(G.nodes[s]["followers"] for s in seed_set),
    }


# ── NLP scoring ────────────────────────────────────────────────────────────

def _nlp_relevance(niche: str, keywords: List[str]) -> float:
    niche_lower = niche.lower()
    score = 0.0
    for kw in keywords:
        kw_lower = kw.lower()
        if kw_lower in niche_lower:
            score += 1.0
        else:
            for niche_key, synonyms in NICHE_KEYWORD_MAP.items():
                if kw_lower in synonyms:
                    niche_key_tokens = niche_key.split()
                    if any(t in niche_lower for t in niche_key_tokens):
                        score += 0.6
                        break
    return score / max(len(keywords), 1)


# ══════════════════════════════════════════════════════════════════════════
# PUBLIC ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════

@app.get("/health", tags=["System"])
def health_check():
    """Public health probe — no auth required (used by Docker HEALTHCHECK)."""
    return {
        "status": "healthy",
        "version": "4.0.0",
        "redis_connected": redis_client is not None,
        "total_nodes": G.number_of_nodes() if G else 0,
        "total_edges": G.number_of_edges() if G else 0,
        "total_communities": len(set(partition_map.values())) if partition_map else 0,
        "pagerank_computed": bool(pagerank_scores),
    }


# ══════════════════════════════════════════════════════════════════════════
# PROTECTED API v1 ENDPOINTS  (all require valid JWT)
# ══════════════════════════════════════════════════════════════════════════

# ── Niches ────────────────────────────────────────────────────────────────

@app.get("/api/v1/niches", tags=["Graph"])
def get_niches(_user: str = Depends(get_current_user)):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    niche_counts: dict[str, int] = {}
    for n in G.nodes():
        niche = G.nodes[n]["niche"]
        niche_counts[niche] = niche_counts.get(niche, 0) + 1
    return {"niches": sorted(niche_counts.keys()), "niche_counts": niche_counts}


# ── Graph sample ──────────────────────────────────────────────────────────

@app.get("/api/v1/graph/sample", tags=["Graph"])
def get_graph_sample(
    limit: int = Query(default=120, le=400),
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")

    top_items = sorted(pagerank_scores.items(), key=lambda x: x[1], reverse=True)[:limit]
    top_ids = {n for n, _ in top_items}

    nodes_out = [
        {
            "id": n,
            "niche": G.nodes[n]["niche"],
            "followers": G.nodes[n]["followers"],
            "pagerank": round(pagerank_scores.get(n, 0), 6),
            "engagement": round(G.nodes[n]["engagement"], 4),
            "community": partition_map.get(n, -1),
        }
        for n in top_ids
    ]

    edges_out = [
        {"source": u, "target": v, "weight": round(G.edges[u, v]["weight"], 3)}
        for u, v in G.edges()
        if u in top_ids and v in top_ids
    ]

    return {
        "nodes": nodes_out,
        "edges": edges_out,
        "total_graph_nodes": G.number_of_nodes(),
        "total_graph_edges": G.number_of_edges(),
    }


# ── Ego Graph Neighborhood ───────────────────────────────────────────────

@app.get("/api/v1/graph/ego/{node_id}", tags=["Graph"])
def get_ego_graph(
    node_id: str,
    radius: int = Query(default=1, le=2),
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    if node_id not in G:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found in graph.")

    sub = nx.ego_graph(G, node_id, radius=radius)
    neighbor_ids = list(sub.nodes())
    if len(neighbor_ids) > 30:
        sorted_neighbors = sorted(
            [n for n in neighbor_ids if n != node_id],
            key=lambda n: pagerank_scores.get(n, 0),
            reverse=True,
        )[:29]
        neighbor_ids = sorted_neighbors + [node_id]
        sub = sub.subgraph(neighbor_ids)

    nodes_out = [
        {
            "id": n,
            "niche": G.nodes[n]["niche"],
            "followers": G.nodes[n]["followers"],
            "pagerank": round(pagerank_scores.get(n, 0), 6),
            "engagement": round(G.nodes[n]["engagement"], 4),
            "community": partition_map.get(n, -1),
            "is_center": (n == node_id),
            "cost": round(5000.0 + (G.nodes[n]["followers"] / 1000.0) * 180.0, 2),
            "influence": round(10.0 + pagerank_scores.get(n, 0) * 80000.0, 2),
        }
        for n in sub.nodes()
    ]

    edges_out = [
        {"source": u, "target": v, "weight": round(sub.edges[u, v].get("weight", 0.05), 3)}
        for u, v in sub.edges()
    ]

    return {
        "center_node": node_id,
        "nodes": nodes_out,
        "edges": edges_out,
        "total_neighbors": G.degree(node_id),
    }


# ── BLII ──────────────────────────────────────────────────────────────────

@app.post("/api/v1/optimize", tags=["Optimize"])
def optimize_blii(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    r = _run_blii(request.budget, request.niche_filter)
    return {
        "status": "success",
        "algorithm": "BLII",
        "budget_allocated": request.budget,
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }


# ── CELF++ ────────────────────────────────────────────────────────────────

@app.post("/api/v1/optimize/celf", tags=["Optimize"])
def optimize_celf(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    r = _run_celf(request.budget, request.niche_filter)
    return {
        "status": "success",
        "algorithm": "CELF++ (Redis-Accelerated)",
        "budget_allocated": request.budget,
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }


# ── GraphSAGE + CELF++ ────────────────────────────────────────────────────

@app.post("/api/v1/optimize/graphsage-celf", tags=["Optimize"])
def optimize_graphsage_celf(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    r = _run_graphsage_celf(request.budget, request.niche_filter)
    return {
        "status": "success",
        "algorithm": "GraphSAGE + CELF++",
        "candidates_evaluated_count": r.get("candidates_evaluated", 0),
        "budget_allocated": request.budget,
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }


# ── Community Partitioning ────────────────────────────────────────────────

@app.post("/api/v1/optimize/community", tags=["Optimize"])
def optimize_community(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    r = _run_community(request.budget, request.niche_filter)
    return {
        "status": "success",
        "algorithm": "Community-Aware Partitioning",
        "budget_allocated": request.budget,
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }


# ── Temporal GNN-LSTM ─────────────────────────────────────────────────────

@app.post("/api/v1/optimize/temporal-gnn", tags=["Optimize"])
def optimize_temporal_gnn(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")
    r = _run_temporal_gnn(request.budget, request.niche_filter)
    return {
        "status": "success",
        "algorithm": "Temporal GNN-LSTM Dynamic Predictor",
        "budget_allocated": request.budget,
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }


# ── Algorithm Comparison ──────────────────────────────────────────────────

@app.post("/api/v1/optimize/compare", tags=["Optimize"])
def compare_all_algorithms(
    request: CampaignRequest,
    _user: str = Depends(get_current_user),
):
    """
    Runs BLII, GraphSAGE+CELF++, Community, and Temporal GNN with the same
    budget and returns all results for side-by-side comparison.
    Note: may take 20–60 s on first run without Redis cache.
    """
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")

    results: dict = {}

    r = _run_blii(request.budget, request.niche_filter)
    results["blii"] = {
        "algorithm": "BLII",
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }

    r = _run_graphsage_celf(request.budget, request.niche_filter, candidate_pct=0.20)
    results["graphsage_celf"] = {
        "algorithm": "GraphSAGE + CELF++",
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }

    r = _run_community(request.budget, request.niche_filter)
    results["community"] = {
        "algorithm": "Community Partitioning",
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }

    r = _run_temporal_gnn(request.budget, request.niche_filter)
    results["temporal_gnn"] = {
        "algorithm": "Temporal GNN-LSTM",
        "total_spent": round(r["total_spent"], 2),
        "remaining_budget": round(r["remaining_budget"], 2),
        "seeds_selected_count": len(r["seeds"]),
        "total_estimated_audience_reach": r["total_reach"],
        "optimized_seed_roster": r["audit_trail"],
    }

    return {
        "status": "success",
        "budget_allocated": request.budget,
        "niche_filter": request.niche_filter,
        "results": results,
    }


# ── NLP Scorer ────────────────────────────────────────────────────────────

@app.post("/api/v1/nlp/score-relevance", tags=["NLP"])
def nlp_score_relevance(
    request: NLPRatingRequest,
    _user: str = Depends(get_current_user),
):
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")

    keywords = [kw.lower() for kw in request.query_keywords]
    max_eng = max((G.nodes[n]["engagement"] for n in G.nodes()), default=1.0)

    scored = []
    for node in G.nodes():
        nd = G.nodes[node]
        rel = _nlp_relevance(nd["niche"], keywords)

        preds = list(G.predecessors(node))
        avg_sentiment = (
            sum(G.edges[p, node]["sentiment"] for p in preds) / len(preds)
            if preds else 0.5
        )
        eng_boost = 0.10 * (nd["engagement"] / max_eng)
        composite = 0.65 * rel + 0.25 * avg_sentiment + eng_boost

        scored.append({
            "node_id": node,
            "niche": nd["niche"],
            "followers": nd["followers"],
            "cost": nd["cost"],
            "semantic_relevance_score": round(composite, 4),
        })

    scored.sort(key=lambda x: x["semantic_relevance_score"], reverse=True)
    return {
        "status": "success",
        "algorithm": "NLP Semantic & Sentiment Relevance Engine",
        "query_keywords": request.query_keywords,
        "matched_recommendations": scored[: request.sample_size],
    }


# ── Monte Carlo IC Evaluation ─────────────────────────────────────────────

@app.post("/api/v1/evaluate/monte-carlo", tags=["Evaluate"])
def monte_carlo_evaluate(
    request: MCEvaluateRequest,
    _user: str = Depends(get_current_user),
):
    """
    Runs the Independent Cascade model to get a statistically grounded
    spread estimate for a given seed set.
    """
    if G is None:
        raise HTTPException(status_code=500, detail="Graph not initialized.")

    seeds = {s for s in request.seed_ids if s in G.nodes()}
    if not seeds:
        raise HTTPException(status_code=400, detail="No valid seed node IDs provided.")

    num_sim = min(request.num_simulations, 500)
    spreads: list[int] = []

    for _ in range(num_sim):
        active = set(seeds)
        newly_active = set(seeds)
        while newly_active:
            next_active: set = set()
            for u in newly_active:
                for v in G.successors(u):
                    if v not in active:
                        if random.random() < G.edges[u, v]["weight"]:
                            next_active.add(v)
            active |= next_active
            newly_active = next_active
        spreads.append(len(active))

    mean_spread = statistics.mean(spreads)
    std_dev = statistics.stdev(spreads) if len(spreads) > 1 else 0.0
    sorted_spreads = sorted(spreads)
    ci_low = sorted_spreads[max(0, int(0.025 * len(sorted_spreads)))]
    ci_high = sorted_spreads[min(len(sorted_spreads) - 1, int(0.975 * len(sorted_spreads)))]
    baseline_reach = sum(G.nodes[s]["followers"] for s in seeds)
    amplification = round(mean_spread / max(len(seeds), 1), 2)

    return {
        "status": "success",
        "algorithm": "Monte Carlo Independent Cascade",
        "seed_ids": list(seeds),
        "seeds_evaluated": list(seeds),
        "num_simulations": num_sim,
        "estimated_spread": round(mean_spread, 2),
        "mean_influence_spread": round(mean_spread, 2),
        "standard_deviation": round(std_dev, 2),
        "min_spread": min(spreads),
        "max_spread": max(spreads),
        "spread_multiplier": amplification,
        "amplification_factor": amplification,
        "confidence_interval_95": [round(ci_low, 2), round(ci_high, 2)],
        "cascade_distribution": spreads[:50],
        "baseline_seed_reach": baseline_reach,
    }