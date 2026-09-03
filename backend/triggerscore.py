from app.tasks.scoring import run_influence_scoring

print("Initiating Graph Data Science (GDS) background calculations...")

# Dispatches the job to Redis without freezing your main terminal
task = run_influence_scoring.delay()

print(f"Scoring Task dispatched successfully with ID: {task.id}")
print("Monitor your Celery worker terminal to watch the PageRank and Centrality computations.")