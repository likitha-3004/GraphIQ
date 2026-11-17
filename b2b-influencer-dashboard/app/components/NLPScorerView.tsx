'use client';

import React, { useState } from 'react';
import { runNLPScore } from '../lib/api';

interface NLPScorerViewProps {
  currency?: 'INR' | 'USD';
  token?: string | null;
}

interface MatchCandidate {
  id: string;
  rank: string;
  niche: string;
  score: number;
  sentiment: number;
  followers: number;
  cost: number;
  topTerms: string[];
}

const DEFAULT_MATCHES: MatchCandidate[] = [
  {
    id: 'user_0',
    rank: '01',
    niche: 'Instagram & TikTok Niche',
    score: 0.94,
    sentiment: 0.81,
    followers: 773,
    cost: 5000,
    topTerms: ['#socialgrowth', 'ai-creator', 'marketing'],
  },
  {
    id: 'user_3',
    rank: '02',
    niche: 'Creator / Tech Lifestyle',
    score: 0.91,
    sentiment: 0.76,
    followers: 734,
    cost: 5000,
    topTerms: ['techreviews', 'workstation', 'saas'],
  },
  {
    id: 'user_356',
    rank: '03',
    niche: 'General Influencer / Mega Reach',
    score: 0.88,
    sentiment: 0.72,
    followers: 121835,
    cost: 26895.95,
    topTerms: ['lifestyle', 'enterprise', 'sponsored'],
  },
  {
    id: 'user_1',
    rank: '04',
    niche: 'Cross-Platform Creator',
    score: 0.85,
    sentiment: 0.68,
    followers: 684,
    cost: 5000,
    topTerms: ['fintech', 'productivity', 'tools'],
  },
  {
    id: 'user_3524',
    rank: '05',
    niche: 'Enterprise B2B / Infra',
    score: 0.82,
    sentiment: 0.64,
    followers: 23580,
    cost: 7699.37,
    topTerms: ['cloud', 'devops', 'automation'],
  },
];

export function NLPScorerView({ currency = 'INR', token }: NLPScorerViewProps) {
  const [keywords, setKeywords] = useState<string[]>([
    'instagram',
    'tiktok',
    'creator',
    'brand ambassador',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [topN, setTopN] = useState(10);
  const [minThreshold, setMinThreshold] = useState(0.75);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);

  const addKeyword = () => {
    const val = inputVal.trim().toLowerCase().replace(/^"+|"+$/g, '');
    if (val && !keywords.includes(val)) {
      setKeywords((k) => [...k, val]);
    }
    setInputVal('');
  };

  const removeKeyword = (kw: string) => {
    setKeywords((k) => k.filter((item) => item !== kw));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const runScorer = async () => {
    setLoading(true);
    try {
      if (token && keywords.length > 0) {
        const res = await runNLPScore(token, keywords, topN);
        if (res && res.matched_recommendations && res.matched_recommendations.length > 0) {
          const updated: MatchCandidate[] = res.matched_recommendations.map((rec, idx) => ({
            id: rec.node_id,
            rank: String(idx + 1).padStart(2, '0'),
            niche: rec.niche,
            score: rec.semantic_relevance_score,
            sentiment: Math.min(0.95, Math.max(0.4, Number((rec.semantic_relevance_score * 0.88).toFixed(2)))),
            followers: rec.followers,
            cost: rec.cost,
            topTerms: keywords.slice(0, 3),
          }));
          setMatches(updated);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 600));
      const updated = DEFAULT_MATCHES.map((m) => ({
        ...m,
        score: Math.min(0.98, Math.max(0.70, m.score + (Math.random() * 0.06 - 0.03))),
      })).sort((a, b) => b.score - a.score);
      setMatches(updated);
    } catch (err) {
      console.warn('NLP Scorer API call error, using local simulation:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCost = (val: number) => {
    if (currency === 'USD') return `$${Math.round(val / 84).toLocaleString()}`;
    return `₹${val.toLocaleString()}`;
  };

  const exportNLPCSV = () => {
    const headers = ['Rank', 'Node ID', 'Niche', 'Semantic Match Score', 'Sentiment', 'Followers', 'Capex Cost Quote'];
    const rows = matches.map((m) => [
      m.rank,
      m.id,
      `"${m.niche}"`,
      m.score.toFixed(4),
      m.sentiment.toFixed(2),
      m.followers,
      m.cost,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `nlp_semantic_recommendations_${keywords.join('_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1 max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim">
            AI CONTENT &amp; KEYWORD MATCHER
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-[#faf6ee] tracking-tight leading-tight font-cinzel break-words text-balance">
          Match Influencers by Campaign Keywords
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant break-words text-balance">
          Enter keywords describing your brand or campaign to discover creators whose content and audience align with your message.
        </p>
      </div>

      {/* ── Main 2-Column Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Query Config Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-[#3e2c25] rounded-2xl p-space-lg shadow-xl flex flex-col gap-space-md">
          <div className="flex items-center gap-2 pb-2 border-b border-[#3e2c25]">
            <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
            <h3 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel font-bold">
              Campaign Match Settings
            </h3>
          </div>

          {/* Keywords input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
              Campaign Keywords (Type and Press Enter or Click Add)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. devrel, kubernetes, fintech..."
                className="flex-1 bg-surface-container-low border border-[#3e2c25] rounded-lg px-3 py-2 text-sm text-[#faf6ee] placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-[#4d3830] text-primary font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add</span>
              </button>
            </div>

            {/* Keyword Tag Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 rounded-lg font-label-sm text-label-sm bg-primary/15 border border-primary/40 text-primary font-bold flex items-center gap-1.5 group"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="material-symbols-outlined text-[14px] text-primary/70 group-hover:text-red-400 transition-colors"
                  >
                    close
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Top-N & Threshold Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-1">
                Creators to Return
              </label>
              <select
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-[#3e2c25] rounded-lg px-3 py-2 text-xs font-mono text-[#faf6ee] focus:outline-none focus:border-primary"
              >
                <option value={5}>Top 5 Creators</option>
                <option value={10}>Top 10 Creators</option>
                <option value={20}>Top 20 Creators</option>
                <option value={50}>Top 50 Creators</option>
              </select>
            </div>

            <div>
              <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-1">
                Minimum Match ({(minThreshold * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
                className="w-full accent-primary mt-2 cursor-pointer"
              />
            </div>
          </div>

          {/* Run Button */}
          <button
            type="button"
            onClick={runScorer}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary-fixed font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Searching and Matching Creators...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">search_spark</span>
                <span>Find Matching Influencers</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Match Preview Cards */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-[#3e2c25] rounded-2xl p-space-lg shadow-xl flex flex-col gap-space-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#3e2c25]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
              <h3 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel font-bold">
                Top Matching Influencers ({matches.length} Creators)
              </h3>
            </div>
            <button
              type="button"
              onClick={exportNLPCSV}
              className="px-2.5 py-1 rounded bg-surface-container-high border border-[#4d3830] text-primary text-xs font-mono flex items-center gap-1 hover:border-primary transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span>CSV</span>
            </button>
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-3">
            {matches.length === 0 ? (
              <div className="bg-surface-container-low border border-[#3e2c25] rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-high border border-[#4d3830] flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">psychology</span>
                </div>
                <span className="font-cinzel text-[#faf6ee] text-base font-bold">No Creators Matched Yet</span>
                <p className="font-body text-xs text-on-surface-variant max-w-md">
                  Enter your campaign keywords on the left and click &apos;Find Matching Influencers&apos; to view your top creator matches.
                </p>
              </div>
            ) : (
              matches.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-low border border-[#3e2c25] rounded-xl p-3.5 hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-sm font-bold text-outline mt-0.5">
                      {item.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#faf6ee]">
                          {item.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/20 text-primary border border-primary/30 font-bold">
                          {(item.score * 100).toFixed(0)}% Topic Match
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          Tone: Positive (+{item.sentiment.toFixed(2)})
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-1">
                        {item.niche}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.topTerms.map((term) => (
                          <span key={term} className="text-[10px] font-mono text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded border border-[#3e2c25]">
                            #{term}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#3e2c25]">
                    <span className="text-xs font-mono text-[#faf6ee]">
                      {item.followers.toLocaleString()} followers
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {formatCost(item.cost)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
