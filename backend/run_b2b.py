import pandas as pd
import networkx as nx

def initialize_b2b_platform():
    print("1. Loading custom B2B social media influencer datasets...")
    nodes_df = pd.read_csv('b2b_nodes.csv')
    edges_df = pd.read_csv('b2b_edges.csv')
    
    print(f"Loaded {len(nodes_df)} creators and {len(edges_df)} professional interactions.")

    # 2. Constructing the NetworkX Graph (Memory Inversion Layer)
    G = nx.DiGraph()
    for _, row in nodes_df.iterrows():
        G.add_node(
            row['node_id'], 
            niche=row['niche'],
            followers=int(row['followers']), 
            cost=float(row['cost_quote']), 
            engagement=float(row['engagement_rate']),
            active=bool(row['account_active'])
        )

    for _, row in edges_df.iterrows():
        G.add_edge(
            row['source'], 
            row['target'], 
            weight=float(row['weight']), 
            overlap=float(row['audience_overlap']),
            sentiment=float(row['sentiment'])
        )
        
    print(f"Graph successfully built in RAM: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges.")
    return G

def run_blii_optimization(G, total_budget=50000.0):
    print(f"\n2. Executing BLII Optimization Engine with Budget: ₹{total_budget:,.2f}...")
    
    # Initialize variables
    S = {node: 1.0 for node in G.nodes()}
    costs = {node: G.nodes[node]['cost'] for node in G.nodes()}
    active = {node: G.nodes[node]['active'] for node in G.nodes()}
    niches = {node: G.nodes[node]['niche'] for node in G.nodes()}
    followers_map = {node: G.nodes[node]['followers'] for node in G.nodes()}
    
    # Compute initial F values with audience overlap penalty (eliminating echo chambers)
    F = {}
    for u in G.nodes():
        f_u = 0.0
        for v in G.successors(u):
            p_uv = G.edges[u, v]['weight']
            overlap = G.edges[u, v]['overlap']
            effective_p = p_uv * (1.0 - 0.5 * overlap)
            f_u += effective_p * S[v]
        F[u] = f_u

    seed_set = []
    remaining_budget = total_budget
    audit_trail = []

    while remaining_budget > 0:
        # Filter active candidates within budget with positive influence
        candidates = [
            u for u in G.nodes() 
            if active[u] and u not in seed_set and costs[u] <= remaining_budget and F[u] > 0
        ]
        
        if not candidates:
            break
            
        # Calculate Marginal Influence per Unit Cost (MI) -> MI = F_u / C_u
        mi_scores = {u: F[u] / costs[u] for u in candidates}
        best_node = max(mi_scores, key=mi_scores.get)
        best_mi = mi_scores[best_node]
        
        if best_mi <= 0:
            break
            
        # Select optimal seed node
        seed_set.append(best_node)
        remaining_budget -= costs[best_node]
        
        audit_trail.append({
            "node_id": best_node,
            "niche": niches[best_node],
            "followers": followers_map[best_node],
            "cost": costs[best_node],
            "expected_influence": round(F[best_node], 2),
            "marginal_efficiency": round(best_mi, 4),
            "remaining_budget": round(remaining_budget, 2)
        })
        
        # Iterative update step for S and F values
        S[best_node] = 0.0
        F[best_node] = 0.0
        
        affected_nodes = set()
        for v in G.successors(best_node):
            affected_nodes.add(v)
            for w in G.predecessors(v):
                affected_nodes.add(w)
        for w in G.predecessors(best_node):
            affected_nodes.add(w)
            
        for w in affected_nodes:
            if S[w] > 0:
                f_w = 0.0
                for v in G.successors(w):
                    if v != best_node:
                        p_wv = G.edges[w, v]['weight']
                        overlap = G.edges[w, v]['overlap']
                        effective_p = p_wv * (1.0 - 0.5 * overlap)
                        f_w += effective_p * S[v]
                F[w] = f_w

    total_spent = total_budget - remaining_budget
    total_reach = sum(followers_map[s] for s in seed_set)

    print(f"\nOptimization Complete!")
    print(f"Total Budget Spent: ₹{total_spent:,.2f} | Remaining: ₹{remaining_budget:,.2f}")
    print(f"Selected Influencers Count: {len(seed_set)}")
    print(f"Total Estimated Unique Audience Reach: {total_reach:,} users")
    
    return audit_trail

if __name__ == "__main__":
    graph = initialize_b2b_platform()
    roster = run_blii_optimization(graph, total_budget=50000.0)
    
    print("\nTop Approved Influencer Roster:")
    for idx, item in enumerate(roster[:5], 1):
        print(f"{idx}. {item['node_id']} ({item['niche']}) | Cost: ₹{item['cost']} | Reach: {item['followers']} | Efficiency: {item['marginal_efficiency']}")