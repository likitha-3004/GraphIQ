import networkx as nx
from typing import Dict, Any

def compute_network_centralities(payload_data: dict) -> Dict[str, Any]:
    """
    Computes Degree Centrality and PageRank on the interaction network.
    """
    G = nx.Graph()
    
    # Reconstruct graph from payload edges
    for edge in payload_data.get("edges", []):
        G.add_edge(
            edge["source"], 
            edge["target"], 
            weight=edge.get("weight", 1.0)
        )

    if G.number_of_nodes() == 0:
        return {"ranked_nodes": []}

    # Calculate metrics
    degree_cent = nx.degree_centrality(G)
    pagerank_scores = nx.pagerank(G, weight="weight")

    # Combine metrics into a structured list
    ranked_nodes = []
    for node in G.nodes():
        ranked_nodes.append({
            "user_id": node,
            "degree_centrality": round(degree_cent.get(node, 0.0), 4),
            "pagerank": round(pagerank_scores.get(node, 0.0), 4)
        })

    # Sort descending by PageRank score
    ranked_nodes = sorted(ranked_nodes, key=lambda x: x["pagerank"], reverse=True)

    return {
        "total_analyzed": G.number_of_nodes(),
        "ranked_nodes": ranked_nodes
    }