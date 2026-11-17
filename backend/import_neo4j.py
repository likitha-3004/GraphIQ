import os
import pandas as pd
from neo4j import GraphDatabase

# Neo4j Connection Credentials (Update with your AuraDB URI and password)
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "likitha123")

def import_data():
    print("Loading CSV files into memory...")
    nodes_df = pd.read_csv("b2b_nodes.csv")
    edges_df = pd.read_csv("b2b_edges.csv")

    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    with driver.session() as session:
        # 1. Clear existing database and create constraints/indexes for O(1) lookups
        print("Initializing Neo4j schema and constraints...")
        session.run("MATCH (n) DETACH DELETE n")
        session.run("CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.node_id IS UNIQUE")

        # 2. Bulk Import Nodes
        print(f"Importing {len(nodes_df)} B2B influencer nodes...")
        nodes_query = """
        UNWIND $batch AS row
        CREATE (u:User {
            node_id: row.node_id,
            niche: row.niche,
            followers: toInteger(row.followers),
            cost_quote: toFloat(row.cost_quote),
            engagement_rate: toFloat(row.engagement_rate),
            post_count: toInteger(row.post_count),
            account_active: toBoolean(row.account_active),
            activity_reach: toInteger(row.activity_reach),
            growth_percentage: toFloat(row.growth_percentage)
        })
        """
        # Batch upload to avoid memory limits
        batch_size = 1000
        nodes_data = nodes_df.to_dict(orient="records")
        for i in range(0, len(nodes_data), batch_size):
            session.run(nodes_query, batch=nodes_data[i:i+batch_size])
        print("Nodes imported successfully.")

        # 3. Bulk Import Edges
        print(f"Importing {len(edges_df)} professional interaction edges...")
        edges_query = """
        UNWIND $batch AS row
        MATCH (source:User {node_id: row.source})
        MATCH (target:User {node_id: row.target})
        CREATE (source)-[:INTERACTS_WITH {
            weight: toFloat(row.weight),
            sentiment: toFloat(row.sentiment),
            interaction_count: toInteger(row.interaction_count),
            interaction_frequency: toFloat(row.interaction_frequency),
            collaboration_count: toInteger(row.collaboration_count),
            response_rate: toFloat(row.response_rate),
            audience_overlap: toFloat(row.audience_overlap),
            relationship_duration: toInteger(row.relationship_duration),
            relationship_type: row.relationship_type,
            last_interaction: toInteger(row.last_interaction)
        }]->(target)
        """
        edges_data = edges_df.to_dict(orient="records")
        for i in range(0, len(edges_data), batch_size):
            session.run(edges_query, batch=edges_data[i:i+batch_size])
        print("Edges imported successfully.")

    driver.close()
    print("Graph migration to Neo4j completed successfully!")

if __name__ == "__main__":
    import_data()