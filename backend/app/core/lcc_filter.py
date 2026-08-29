import networkx as nx

def prune_sagraph_network(payload_data: dict) -> dict:
    """
    Extracts the Largest Connected Component (LCC) from SAGraph interaction network.
    """
    G = nx.Graph()
    
    # Add weighted interaction edges
    for edge in payload_data.get("edges", []):
        G.add_edge(
            edge["source"], 
            edge["target"], 
            weight=edge.get("weight", 1.0),
            interaction=edge.get("interaction_type", "repost")
        )

    if G.number_of_nodes() == 0:
        return {"nodes": [], "edges": [], "pruned_count": 0, "active_lcc_size": 0}

    # Extract Largest Connected Component
    largest_cc_nodes = max(nx.connected_components(G), key=len)
    lcc_subgraph = G.subgraph(largest_cc_nodes).copy()

    pruned_count = G.number_of_nodes() - lcc_subgraph.number_of_nodes()

    nodes = [{"id": node} for node in lcc_subgraph.nodes()]
    edges = [
        {
            "source": u, 
            "target": v, 
            "weight": d.get("weight", 1.0),
            "interaction": d.get("interaction", "repost")
        }
        for u, v, d in lcc_subgraph.edges(data=True)
    ]

    return {
        "nodes": nodes,
        "edges": edges,
        "pruned_count": pruned_count,
        "active_lcc_size": lcc_subgraph.number_of_nodes()
    }