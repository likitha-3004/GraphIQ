/**
 * GraphIQ API Client
 * Connects frontend components to the FastAPI backend (http://127.0.0.1:8000).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export interface SeedNode {
  node_id: string;
  niche: string;
  followers: number;
  cost: number;
  expected_influence: number;
  marginal_efficiency: number;
  remaining_budget?: number;
  gnn_score?: number;
}

export interface OptimizationResponse {
  status: string;
  algorithm?: string;
  budget_allocated: number;
  total_spent: number;
  remaining_budget?: number;
  seeds_selected_count: number;
  total_estimated_audience_reach: number;
  optimized_seed_roster: SeedNode[];
}

export interface NLPRecommendation {
  node_id: string;
  niche: string;
  followers: number;
  cost: number;
  semantic_relevance_score: number;
}

export interface NLPResponse {
  status: string;
  algorithm: string;
  query_keywords: string[];
  matched_recommendations: NLPRecommendation[];
}

export interface MCResponse {
  status: string;
  algorithm: string;
  num_simulations: number;
  seeds_evaluated: string[];
  mean_influence_spread: number;
  standard_deviation: number;
  min_spread: number;
  max_spread: number;
  spread_multiplier: number;
  confidence_interval_95: [number, number];
  cascade_distribution: number[];
}

export interface CompareAlgorithmResult {
  algorithm: string;
  total_spent: number;
  remaining_budget: number;
  seeds_selected_count: number;
  total_estimated_audience_reach: number;
  optimized_seed_roster: SeedNode[];
}

export interface CompareResponse {
  status: string;
  budget_allocated: number;
  niche_filter?: string | null;
  results: {
    blii: CompareAlgorithmResult;
    graphsage_celf: CompareAlgorithmResult;
    community: CompareAlgorithmResult;
    temporal_gnn: CompareAlgorithmResult;
  };
}

export interface GraphSampleNode {
  id: string;
  niche: string;
  followers: number;
  pagerank: number;
  engagement: number;
  community: number;
}

export interface GraphSampleEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphSampleResponse {
  nodes: GraphSampleNode[];
  edges: GraphSampleEdge[];
  total_graph_nodes: number;
  total_graph_edges: number;
}

export interface EgoGraphNode {
  id: string;
  niche: string;
  followers: number;
  pagerank: number;
  engagement: number;
  community: number;
  is_center: boolean;
  cost: number;
  influence: number;
}

export interface EgoGraphResponse {
  center_node: string;
  nodes: EgoGraphNode[];
  edges: GraphSampleEdge[];
  total_neighbors: number;
}

/**
 * Fetch 1-hop or 2-hop ego network for a specific node
 */
export async function fetchEgoGraph(
  token: string,
  nodeId: string,
  radius: number = 1
): Promise<EgoGraphResponse> {
  const res = await fetch(`${API_BASE}/api/v1/graph/ego/${encodeURIComponent(nodeId)}?radius=${radius}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch ego graph.');
  }
  return res.json();
}

/**
 * Authenticate user with OAuth2 password flow
 */
export async function loginUser(
  username: string,
  password: string
): Promise<{ access_token: string; token_type: string; username: string }> {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Incorrect username or password.');
  }

  return res.json();
}

/**
 * Register a new user account
 */
export async function registerUser(
  username: string,
  password: string
): Promise<{ access_token: string; token_type: string; username: string }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Registration failed.');
  }

  return res.json();
}

/**
 * Validate current JWT token
 */
export async function checkAuth(token: string): Promise<{ username: string }> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{ status: string; graph_loaded: boolean }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

/**
 * Fetch available niches
 */
export async function fetchNiches(token: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/niches`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.niches || [];
  } catch {
    return [];
  }
}

/**
 * Fetch sample of the influencer graph
 */
export async function fetchGraphSample(
  token: string,
  limit: number = 120
): Promise<GraphSampleResponse> {
  const res = await fetch(`${API_BASE}/api/v1/graph/sample?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch graph sample.');
  }
  return res.json();
}

/**
 * Run single algorithm optimization
 */
export async function runOptimization(
  token: string,
  algorithm: string,
  budget: number,
  nicheFilter?: string | null
): Promise<OptimizationResponse> {
  const algoEndpoints: Record<string, string> = {
    blii: '/api/v1/optimize',
    celf: '/api/v1/optimize/celf',
    graphsage: '/api/v1/optimize/graphsage-celf',
    sage: '/api/v1/optimize/graphsage-celf',       // dropdown alias
    community: '/api/v1/optimize/community',
    temporal: '/api/v1/optimize/temporal-gnn',
    gnn: '/api/v1/optimize/temporal-gnn',          // dropdown alias
  };

  const endpoint = algoEndpoints[algorithm.toLowerCase()] || '/api/v1/optimize/celf';

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      budget,
      niche_filter: nicheFilter && nicheFilter !== 'all' ? nicheFilter : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Optimization failed.');
  }

  return res.json();
}

/**
 * Run side-by-side benchmark comparison of all 4 algorithms
 */
export async function runCompareAlgorithms(
  token: string,
  budget: number,
  nicheFilter?: string | null
): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/api/v1/optimize/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      budget,
      niche_filter: nicheFilter && nicheFilter !== 'all' ? nicheFilter : null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Algorithm comparison failed.');
  }

  return res.json();
}

/**
 * Score semantic relevance using BERT / NLP
 */
export async function runNLPScore(
  token: string,
  keywords: string[],
  sampleSize: number = 10
): Promise<NLPResponse> {
  const res = await fetch(`${API_BASE}/api/v1/nlp/score-relevance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query_keywords: keywords,
      sample_size: sampleSize,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'NLP relevance scoring failed.');
  }

  return res.json();
}

/**
 * Run Monte Carlo independent cascade simulations
 */
export async function runMonteCarlo(
  token: string,
  seedIds: string[],
  numSimulations: number = 200
): Promise<MCResponse> {
  const res = await fetch(`${API_BASE}/api/v1/evaluate/monte-carlo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      seed_ids: seedIds,
      num_simulations: numSimulations,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Monte Carlo evaluation failed.');
  }

  return res.json();
}
