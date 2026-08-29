from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import time

from app.api.schemas import GraphPrunePayload, PruneResponse, CentralityResponse
from app.core.lcc_filter import prune_sagraph_network
from app.core.centrality import compute_network_centralities
from app.db.database import engine, Base, get_db
import app.db.models as models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SAGraph B2B Influence Platform - Core API",
    description="Backend Centrality Routing & Campaign Management Engine",
    version="1.0.0"
)

# Enable CORS for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CampaignCreate(BaseModel):
    id: str
    name: str
    tenant_id: str
    target_domain: str

@app.get("/")
def status_check():
    return {"status": "online", "service": "Backend Core API"}

@app.post("/api/v1/graph/prune-lcc", response_model=PruneResponse)
def prune_graph_endpoint(payload: GraphPrunePayload, db: Session = Depends(get_db)):
    start_time = time.time()
    result = prune_sagraph_network(payload.model_dump())
    execution_time = (time.time() - start_time) * 1000

    log_entry = models.GraphExecutionLog(
        campaign_id=payload.campaign_id,
        raw_node_count=result["active_lcc_size"] + result["pruned_count"],
        pruned_node_count=result["pruned_count"],
        active_lcc_size=result["active_lcc_size"],
        execution_time_ms=round(execution_time, 2)
    )
    db.add(log_entry)
    db.commit()

    return {
        "status": "success",
        "campaign_id": payload.campaign_id,
        "pruned_count": result["pruned_count"],
        "active_lcc_size": result["active_lcc_size"],
        "data": result
    }

@app.post("/api/v1/graph/centrality", response_model=CentralityResponse)
def compute_centrality_endpoint(payload: GraphPrunePayload):
    result = compute_network_centralities(payload.model_dump())
    return {
        "status": "success",
        "campaign_id": payload.campaign_id,
        "total_analyzed": result["total_analyzed"],
        "ranked_nodes": result["ranked_nodes"]
    }

@app.get("/api/v1/graph/logs")
def get_execution_logs(db: Session = Depends(get_db)):
    logs = db.query(models.GraphExecutionLog).all()
    return {"status": "success", "logs": logs}

@app.post("/api/v1/campaigns")
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    db_campaign = models.Campaign(
        id=campaign.id,
        name=campaign.name,
        tenant_id=campaign.tenant_id,
        target_domain=campaign.target_domain
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return {"status": "created", "campaign": db_campaign}

@app.get("/api/v1/campaigns")
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(models.Campaign).all()
    return {"status": "success", "campaigns": campaigns}