from pathlib import Path
from app.tasks.ingestion import ingest_sagraph_dataset

# Resolve paths relative to the repository root (one level up from backend)
REPO_ROOT = Path(__file__).resolve().parent.parent
nodes_path = REPO_ROOT / "data" / "raw" / "profiles_strict.json"
edges_path = REPO_ROOT / "data" / "raw" / "interactions.csv"

print(f"Targeting strict JSON nodes: {nodes_path} -> Exists: {nodes_path.exists()}")
print(f"Targeting edges: {edges_path} -> Exists: {edges_path.exists()}")

if nodes_path.exists() and edges_path.exists():
    task = ingest_sagraph_dataset.delay(str(nodes_path), str(edges_path))
    print("Task dispatched successfully with ID:", task.id)
else:
    print("Error: Could not find strict JSON or CSV files in data/raw/")