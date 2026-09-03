import ast
import json
from celery import Celery
from neo4j import GraphDatabase

celery_app = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")

URI = "bolt://localhost:7687"
AUTH = ("neo4j", "likitha123")

# Initialize the driver globally ONCE to maintain a stable connection pool
driver = GraphDatabase.driver(URI, auth=AUTH)

def run_cypher_batch(query: str, param_key: str, data: list):
    """Executes a single batch write transaction using the global driver."""
    with driver.session() as session:
        session.run(query, **{param_key: data})

@celery_app.task(name="tasks.ingest_sagraph_dataset")
def ingest_sagraph_dataset(nodes_file_path: str, edges_file_path: str, chunk_size: int = 10000):
    node_query = """
    UNWIND $nodes AS node
    MERGE (u:SAGraphUser {user_id: node.user_id})
    SET u.followers_count = node.followers_count,
        u.friends_count = node.friends_count
    """
    
    users_batch = []
    total_nodes = 0
    
    with open(nodes_file_path, "r", encoding="utf-8-sig") as f:
        file_content = f.read()
        profiles_data = ast.literal_eval(file_content)
        
    for user_key, data in profiles_data.items():
        users_batch.append({
            "user_id": str(data.get("user_id") or user_key),
            "followers_count": int(data.get("user_followers", 0)),
            "friends_count": int(data.get("user_friends", 0))
        })
        if len(users_batch) >= chunk_size:
            run_cypher_batch(node_query, "nodes", users_batch)
            total_nodes += len(users_batch)
            users_batch = []
                
    if users_batch:
        run_cypher_batch(node_query, "nodes", users_batch)
        total_nodes += len(users_batch)

    edge_query = """
    UNWIND $edges AS edge
    MERGE (a:SAGraphUser {user_id: edge.source})
    MERGE (b:SAGraphUser {user_id: edge.target})
    MERGE (a)-[r:INTERACTED {interaction_type: edge.interaction_type}]->(b)
    SET r.weight = edge.weight
    """
    
    total_edges = 0
    edges_batch = []
    
    # Read the edge file line-by-line to flexibly handle any whitespace, tabs, or formatting variations
    with open(edges_file_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            
            # Split by commas or whitespace dynamically
            parts = line.replace(",", " ").split()
            if len(parts) >= 2:
                source = str(parts[0])
                target = str(parts[1])
                interaction_type = str(parts[2]) if len(parts) > 2 else "interaction"
                
                edges_batch.append({
                    "source": source,
                    "target": target,
                    "interaction_type": interaction_type,
                    "weight": 1.0
                })
                
                if len(edges_batch) >= chunk_size:
                    run_cypher_batch(edge_query, "edges", edges_batch)
                    total_edges += len(edges_batch)
                    edges_batch = []
                    
        if edges_batch:
            run_cypher_batch(edge_query, "edges", edges_batch)
            total_edges += len(edges_batch)

    return {"status": "success", "total_nodes": total_nodes, "total_edges": total_edges}