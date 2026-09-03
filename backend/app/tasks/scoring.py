from celery import Celery
from neo4j import GraphDatabase

celery_app = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")

URI = "bolt://localhost:7687"
AUTH = ("neo4j", "likitha123")

def execute_gds_pipeline(tx):
    # 1. Clear existing projection if it exists
    tx.run("CALL gds.graph.drop('sagraphProject', false) YIELD graphName;")
    
    # 2. Project Graph into Memory
    tx.run("""
    CALL gds.graph.project(
      'sagraphProject',
      'SAGraphUser',
      'INTERACTED'
    )
    """)
    
    # 3. Calculate and Write PageRank
    tx.run("""
    CALL gds.pageRank.write('sagraphProject', {
      writeProperty: 'pagerank'
    })
    """)

    # 4. Calculate and Write Degree Centrality
    tx.run("""
    CALL gds.degree.write('sagraphProject', {
      writeProperty: 'degree_centrality'
    })
    """)

@celery_app.task(name="tasks.run_influence_scoring")
def run_influence_scoring():
    driver = GraphDatabase.driver(URI, auth=AUTH)
    with driver.session() as session:
        session.execute_write(execute_gds_pipeline)
    driver.close()
    return {"status": "success", "message": "Centrality algorithms calculated and written to graph."}