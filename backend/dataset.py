import random
import pandas as pd
import networkx as nx

# Set random seed for reproducibility
random.seed(42)

# Configuration for Free-Tier Friendly Scale
NUM_NODES = 4500
NICHE_CATEGORIES = ["SaaS & Cloud", "FinTech", "AI & Data", "Cybersecurity", "Digital Marketing"]

print("Generating synthetic B2B influencer network...")

# 1. Generate Nodes with B2B Commercial Attributes
nodes_data = []
for i in range(NUM_NODES):
    node_id = f"user_{i}"
    niche = random.choice(NICHE_CATEGORIES)
    followers = int(random.lognormvariate(8.0, 1.2)) # Realistic long-tail follower distribution
    
    # Cost model: Cost proportional to followers with a sub-linear power factor (BALI framework)
    cost_quote = round(max(5000.0, (followers ** 0.6) * random.uniform(15, 25)), 2)
    engagement_rate = round(random.uniform(0.01, 0.08), 4)
    
    nodes_data.append({
        "node_id": node_id,
        "niche": niche,
        "followers": followers,
        "cost_quote": cost_quote,
        "engagement_rate": engagement_rate
    })

nodes_df = pd.DataFrame(nodes_data)

# 2. Generate Edges using a Barabási-Albert preferential attachment model (Scale-Free)
# This simulates real-world social networks where well-connected hubs get more connections
G = nx.barabasi_albert_graph(n = NUM_NODES, m = 4)

edges_data = []
for u, v in G.edges():
    source_id = f"user_{u}"
    target_id = f"user_{v}"
    
    # Dynamic edge weight (influence probability)
    weight = round(random.uniform(0.1, 0.9), 3)
    sentiment = round(random.uniform(0.5, 1.0), 2) # Positive B2B professional sentiment
    
    edges_data.append({
        "source": source_id,
        "target": target_id,
        "weight": weight,
        "sentiment": sentiment
    })

edges_df = pd.DataFrame(edges_data)

# Save to CSV files for database ingestion
nodes_df.to_csv("b2b_nodes.csv", index=False)
edges_df.to_csv("b2b_edges.csv", index=False)

print(f"Dataset generated successfully!")
print(f"Total Nodes: {len(nodes_df)}")
print(f"Total Edges: {len(edges_df)}")
print("Files saved: 'b2b_nodes.csv' and 'b2b_edges.csv'")

import pandas as pd
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

# Load existing b2b_nodes.csv
nodes_df = pd.read_csv('b2b_nodes.csv')

# 1. Change niche to reflect general influencers in today's social media
modern_niches = [
    "General Social Media Influencer", 
    "Instagram Creator", 
    "TikTok Influencer", 
    "YouTube Content Creator", 
    "Cross-Platform Creator"
]
nodes_df['niche'] = np.random.choice(modern_niches, size=len(nodes_df), p=[0.4, 0.2, 0.2, 0.1, 0.1])

# 2. Include new attributes:
# - post_count: total posts published
nodes_df['post_count'] = np.random.randint(50, 5000, size=len(nodes_df))

# - account_active: boolean/status of account activity (e.g., Active vs Inactive, 95% active)
nodes_df['account_active'] = np.random.choice([True, False], size=len(nodes_df), p=[0.95, 0.05])

# - activity_reach: cumulative or average activity reach from the time of creation, correlated with followers and post count
base_reach = nodes_df['followers'] * np.random.uniform(0.5, 3.5, size=len(nodes_df))
nodes_df['activity_reach'] = base_reach.astype(int)

# - growth_percentage: historical or recent follower/reach growth percentage
nodes_df['growth_percentage'] = np.round(np.random.normal(12.5, 8.0, size=len(nodes_df)), 2) # e.g. mean 12.5% growth

# Save updated dataset
nodes_df.to_csv('b2b_nodes.csv', index=False)

print("Updated nodes dataset shape:", nodes_df.shape)
print(nodes_df.head(10))

import pandas as pd
import numpy as np

np.random.seed(42)

edges_df = pd.read_csv('b2b_edges.csv')

# Add requested attributes
edges_df['interaction_count'] = np.random.randint(10, 500, size=len(edges_df))
edges_df['interaction_frequency'] = np.round(np.random.uniform(0.1, 1.0, size=len(edges_df)), 2)
edges_df['collaboration_count'] = np.random.randint(0, 30, size=len(edges_df))
edges_df['response_rate'] = np.round(np.random.uniform(0.25, 0.98, size=len(edges_df)), 2)
edges_df['audience_overlap'] = np.round(np.random.uniform(0.05, 0.85, size=len(edges_df)), 2)
edges_df['relationship_duration'] = np.random.randint(30, 1095, size=len(edges_df)) # in days

rel_types = ["Strategic Partnership", "Content Collaboration", "Peer Referral", "Sponsorship / Paid Mention"]
edges_df['relationship_type'] = np.random.choice(rel_types, size=len(edges_df), p=[0.3, 0.4, 0.2, 0.1])

edges_df['last_interaction'] = np.random.randint(1, 90, size=len(edges_df)) # days ago

# Save back to b2b_edges.csv
edges_df.to_csv('b2b_edges.csv', index=False)

print("Updated edges shape:", edges_df.shape)
print(edges_df.head(3))