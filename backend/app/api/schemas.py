from pydantic import BaseModel, Field
from typing import List, Optional

class SAGraphUserNode(BaseModel):
    user_id: str = Field(..., description="Unique Weibo/SAGraph user ID")
    followers_count: Optional[int] = 0
    friends_count: Optional[int] = 0
    domain_interests: Optional[List[str]] = []
    bio: Optional[str] = None

class SAGraphInteractionEdge(BaseModel):
    source: str = Field(..., description="User ID initiating interaction")
    target: str = Field(..., description="User ID receiving interaction or post author")
    interaction_type: str = Field(..., description="e.g., 'repost', 'comment', 'follow'")
    weight: Optional[float] = 1.0

class GraphPrunePayload(BaseModel):
    campaign_id: str
    nodes: List[SAGraphUserNode] = []
    edges: List[SAGraphInteractionEdge]

class PruneResponse(BaseModel):
    status: str
    campaign_id: str
    pruned_count: int
    active_lcc_size: int
    data: dict

class CentralityNodeResult(BaseModel):
    user_id: str
    degree_centrality: float
    pagerank: float

class CentralityResponse(BaseModel):
    status: str
    campaign_id: str
    total_analyzed: int
    ranked_nodes: List[CentralityNodeResult]