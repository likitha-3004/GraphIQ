from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.db.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tenant_id = Column(String, nullable=False, index=True)
    target_domain = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class GraphExecutionLog(Base):
    __tablename__ = "graph_execution_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(String, index=True)
    raw_node_count = Column(Integer)
    pruned_node_count = Column(Integer)
    active_lcc_size = Column(Integer)
    execution_time_ms = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)