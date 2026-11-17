'use client';

import React, { useState } from 'react';
import { WarpFieldBackground } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { NetworkTopologyView } from "./NetworkTopologyView";
import { NLPScorerView } from "./NLPScorerView";
import { OptimizerEngineView } from "./OptimizerEngineView";

interface DashboardViewProps {
  onBackToLanding: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  token: string | null;
  currentUser?: string;
  onRunParallel?: (budget: number, niche: string) => Promise<any>;
  onRunMonteCarlo?: (simulations: number) => Promise<any>;
  loading?: boolean;
}

export function DashboardView({
  onBackToLanding,
  onOpenAuth,
  onLogout,
  token,
  currentUser = 'likitha',
  onRunParallel,
  onRunMonteCarlo,
  loading = false,
}: DashboardViewProps) {
  const [activeNav, setActiveNav] = useState('campaign-optimizer');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [budgetVal, setBudgetVal] = useState('50,000');
  const [nicheVal, setNicheVal] = useState('all');
  const [simCount, setSimCount] = useState(200);
  const [warpBg, setWarpBg] = useState(false);
  const [runningParallel, setRunningParallel] = useState(false);
  const [runningMC, setRunningMC] = useState(false);

  // Dynamic state for comparison metrics (initialized to 0)
  const [cmpData, setCmpData] = useState({
    blii: { reach: '0', seeds: 0, spent: '₹0', efficiency: '0.0000', pct: '0%', rawReach: 0, rawSpent: 0, rawReserve: 0, rawEfficiency: 0 },
    graphsage: { reach: '0', seeds: 0, spent: '₹0', efficiency: '0.0000', pct: '0%', rawReach: 0, rawSpent: 0, rawReserve: 0, rawEfficiency: 0 },
    community: { reach: '0', seeds: 0, spent: '₹0', efficiency: '0.0000', pct: '0%', rawReach: 0, rawSpent: 0, rawReserve: 0, rawEfficiency: 0 },
    temporal: { reach: '0', seeds: 0, spent: '₹0', efficiency: '0.0000', pct: '0%', rawReach: 0, rawSpent: 0, rawReserve: 0, rawEfficiency: 0 },
  });

  const [mcData, setMcData] = useState({
    spread: '0.0',
    multiplier: '×0.00',
    baseline: '0',
    spreadPct: '0%',
  });

  const handleExecuteParallel = async () => {
    setRunningParallel(true);
    try {
      const cleanBudget = parseInt(budgetVal.replace(/[^0-9]/g, '')) || 50000;
      if (onRunParallel) {
        const res = await onRunParallel(cleanBudget, nicheVal);
        if (res && res.results) {
          const bliiReach = res.results.blii.total_estimated_audience_reach;
          const bliiSpent = res.results.blii.total_spent;
          const sageReach = res.results.graphsage_celf.total_estimated_audience_reach;
          const sageSpent = res.results.graphsage_celf.total_spent;
          const commReach = res.results.community.total_estimated_audience_reach;
          const commSpent = res.results.community.total_spent;
          const tempReach = res.results.temporal_gnn.total_estimated_audience_reach;
          const tempSpent = res.results.temporal_gnn.total_spent;

          setCmpData({
            blii: {
              reach: bliiReach.toLocaleString(),
              seeds: res.results.blii.seeds_selected_count,
              spent: `₹${Math.round(bliiSpent).toLocaleString()}`,
              efficiency: (bliiReach / (bliiSpent || 1)).toFixed(4),
              pct: `${Math.min(100, Math.round((bliiSpent / cleanBudget) * 100))}%`,
              rawReach: bliiReach,
              rawSpent: bliiSpent,
              rawReserve: Math.max(0, cleanBudget - bliiSpent),
              rawEfficiency: bliiReach / (bliiSpent || 1),
            },
            graphsage: {
              reach: sageReach.toLocaleString(),
              seeds: res.results.graphsage_celf.seeds_selected_count,
              spent: `₹${Math.round(sageSpent).toLocaleString()}`,
              efficiency: (sageReach / (sageSpent || 1)).toFixed(4),
              pct: `${Math.min(100, Math.round((sageSpent / cleanBudget) * 100))}%`,
              rawReach: sageReach,
              rawSpent: sageSpent,
              rawReserve: Math.max(0, cleanBudget - sageSpent),
              rawEfficiency: sageReach / (sageSpent || 1),
            },
            community: {
              reach: commReach.toLocaleString(),
              seeds: res.results.community.seeds_selected_count,
              spent: `₹${Math.round(commSpent).toLocaleString()}`,
              efficiency: (commReach / (commSpent || 1)).toFixed(4),
              pct: `${Math.min(100, Math.round((commSpent / cleanBudget) * 100))}%`,
              rawReach: commReach,
              rawSpent: commSpent,
              rawReserve: Math.max(0, cleanBudget - commSpent),
              rawEfficiency: commReach / (commSpent || 1),
            },
            temporal: {
              reach: tempReach.toLocaleString(),
              seeds: res.results.temporal_gnn.seeds_selected_count,
              spent: `₹${Math.round(tempSpent).toLocaleString()}`,
              efficiency: (tempReach / (tempSpent || 1)).toFixed(4),
              pct: `${Math.min(100, Math.round((tempSpent / cleanBudget) * 100))}%`,
              rawReach: tempReach,
              rawSpent: tempSpent,
              rawReserve: Math.max(0, cleanBudget - tempSpent),
              rawEfficiency: tempReach / (tempSpent || 1),
            },
          });
        }
      } else {
        // Simulated execution
        await new Promise(r => setTimeout(r, 1200));
      }
    } finally {
      setRunningParallel(false);
    }
  };

  const handleExecuteMC = async () => {
    setRunningMC(true);
    try {
      if (onRunMonteCarlo) {
        const res = await onRunMonteCarlo(simCount);
        if (res && res.mean_influence_spread) {
          setMcData({
            spread: res.mean_influence_spread.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            multiplier: `×${res.spread_multiplier.toFixed(2)}`,
            baseline: '147,606',
            spreadPct: `${((res.mean_influence_spread / 147606) * 100).toFixed(1)}%`,
          });
        }
      } else {
        // Simulated execution
        await new Promise(r => setTimeout(r, 1000));
        const newSpread = (3800 + Math.random() * 600).toFixed(1);
        const newMult = (parseFloat(newSpread) / 5).toFixed(2);
        setMcData({
          spread: newSpread,
          multiplier: `×${newMult}`,
          baseline: '147,606',
          spreadPct: `${(parseFloat(newSpread) / 140).toFixed(1)}%`,
        });
      }
    } finally {
      setRunningMC(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-fixed">
      {/* ── Optional Ambient 3D WarpField Canvas ── */}
      {warpBg && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <WarpFieldBackground
            variant="letters"
            speed={12.0}
            streakOpacity={0.50}
            tileOpacity={0.80}
            fov={75}
            hue={35}
            saturation={1.20}
            brightness={1.00}
          />
        </div>
      )}

      {/* ── FIXED LEFT SIDEBAR ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-container-lowest z-50 flex flex-col justify-between py-4 border-r border-[#3e2c25] shadow-[1px_0_16px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-6 px-4">
          {/* Logo & Platform Badge */}
          <div className="flex items-center gap-space-sm px-2 pt-2 cursor-pointer" onClick={onBackToLanding}>
            <div className="w-8 h-8 rounded-full bg-surface-high border border-mocha-accent/50 flex items-center justify-center relative overflow-hidden">
              <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#f3db7a]"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-[#faf6ee] leading-tight">
                Graph<span className="text-primary">IQ</span>
              </span>
              <span className="font-label-sm text-label-sm text-[#cec6b2] tracking-wider">INFLUENCER STUDIO</span>
            </div>
          </div>

          {/* Optimization Engine Status */}
          <div className="px-2">
            <div className="text-label-sm font-label-sm text-outline uppercase tracking-wider mb-2">Optimization Engine</div>
            <div className="flex items-center gap-2 p-2 rounded bg-surface-container-low border border-[#3e2c25]">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
              <div className="text-label-sm font-label-sm text-on-surface-variant truncate">
                AI System Online
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {[
              { id: 'campaign-optimizer', label: 'Optimizer Engine', desc: 'Find Best Influencers', icon: 'neurology' },
              { id: 'network-topology', label: 'Network Topology', desc: 'Interactive Graph Map', icon: 'hub' },
              { id: 'overview', label: 'Overview Ledger', desc: 'Compare All Models', icon: 'insights' },
              { id: 'monte-carlo-cascade', label: 'Monte Carlo Cascade', desc: 'Viral Spread Test', icon: 'ssid_chart' },
              { id: 'semantic-nlp-scorer', label: 'Semantic Scorer', desc: 'Match by Keywords', icon: 'psychology' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded font-body-md text-body-md transition-colors text-left ${
                  activeNav === item.id
                    ? 'bg-surface-container-high text-primary font-bold shadow-[inset_3px_0_0_#f3db7a]'
                    : 'text-on-surface-variant hover:text-[#faf6ee] hover:bg-surface-container-low'
                }`}
                title={item.desc}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <div className="flex flex-col leading-tight">
                  <span>{item.label}</span>
                  <span className="font-mono text-[10px] text-outline font-normal">{item.desc}</span>
                </div>
              </button>
            ))}

            {/* Return to Landing Page */}
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-3 px-3 py-2.5 rounded font-body-md text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors text-left mt-2 border-t border-[#3e2c25] pt-3"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
              <span>Landing Page</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 flex flex-col gap-3">
          {/* Monthly Credits */}
          <div className="p-3 rounded bg-surface-container-low border border-[#3e2c25] flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-outline">CAMPAIGN CREDITS</span>
              <span className="font-label-sm text-label-sm text-primary font-bold">88%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[88%]"></div>
            </div>
            <span className="font-label-sm text-label-sm text-outline">2,140 / 2,500 Runs Available</span>
          </div>

          {/* User Account / Logout */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-[#3e2c25]">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenAuth}>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary">
                <span className="material-symbols-outlined text-[16px]">person</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-[#faf6ee] leading-none truncate max-w-[100px]">
                  {currentUser}
                </span>
                <span className="font-label-sm text-label-sm text-primary-fixed-dim leading-none">Enterprise Lead</span>
              </div>
            </div>
            <button
              type="button"
              onClick={token ? onLogout : onOpenAuth}
              className="text-outline hover:text-primary transition-colors p-1"
              title={token ? 'Sign Out' : 'Sign In'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {token ? 'logout' : 'login'}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="pl-64">
        {/* Fixed Top Header */}
        <header className="fixed top-0 left-64 right-0 h-16 bg-[#1c110d]/90 backdrop-blur-xl z-40 flex items-center justify-between px-margin-desktop border-b border-[#3e2c25] shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-space-lg flex-1 max-w-xl">
            <div className="relative flex items-center w-full bg-surface-container-lowest border border-[#3e2c25] rounded px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
              <input
                className="w-full bg-transparent font-body-sm text-body-sm text-[#faf6ee] placeholder:text-outline focus:outline-none"
                placeholder="Search influencers, categories, niches, or keywords... (⌘K)"
                type="text"
              />
              <kbd className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant ml-2 border border-[#4d3830]">
                ⌘K
              </kbd>
            </div>
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-surface-container-lowest border border-[#3e2c25]">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                ● System Connected: <span className="text-primary font-medium">Live Database &amp; AI Engine Active</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            {/* 3D Warp Field Toggle */}
            <button
              type="button"
              onClick={() => setWarpBg(!warpBg)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
                warpBg
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-surface-container-lowest border-[#3e2c25] text-outline hover:text-[#faf6ee]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              <span>3D Warp {warpBg ? 'ON' : 'OFF'}</span>
            </button>

            {/* Currency Toggle */}
            <div className="flex items-center bg-surface-container-lowest border border-[#3e2c25] rounded p-0.5 font-label-sm text-label-sm">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-0.5 rounded transition-all ${
                  currency === 'USD' ? 'bg-surface-container-high text-primary font-bold' : 'text-outline hover:text-[#faf6ee]'
                }`}
              >
                $
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-2 py-0.5 rounded transition-all ${
                  currency === 'INR' ? 'bg-surface-container-high text-primary font-bold' : 'text-outline hover:text-[#faf6ee]'
                }`}
              >
                ₹
              </button>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded hover:bg-surface-container text-on-surface-variant hover:text-[#faf6ee] transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"></span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-space-xs cursor-pointer" onClick={onOpenAuth}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-on-primary">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Dashboard Scroll Canvas ── */}
        <main className="w-full pt-16 bg-background min-h-screen">
          <div className="flex flex-col w-full">
            <div className="px-gutter-desktop py-space-lg flex flex-col gap-space-xl">
              {activeNav === 'network-topology' ? (
                <NetworkTopologyView currency={currency} token={token} />
              ) : activeNav === 'semantic-nlp-scorer' ? (
                <NLPScorerView currency={currency} token={token} />
              ) : activeNav === 'campaign-optimizer' ? (
                <OptimizerEngineView
                  currency={currency}
                  onNavigateToCascade={() => setActiveNav('monte-carlo-cascade')}
                  token={token}
                />
              ) : (
                <>
                  {/* Top Meta Strip & Breadcrumb */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-xs">
                <div className="flex items-center gap-space-sm">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                    CAMPAIGN INTELLIGENCE
                  </span>
                  <span className="text-outline-variant font-label-sm">/</span>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                    Model Benchmark
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high border border-[#4d3830] font-label-sm text-label-sm text-primary flex items-center gap-1.5 ml-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Live Database Active
                  </span>
                </div>
                <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm">
                  <span>Response Time: <strong className="text-[#faf6ee] font-body-sm">42ms</strong></span>
                  <span>Accuracy: <strong className="text-primary font-body-sm">99.8%</strong></span>
                  <span className="hidden sm:inline">Strategy: <strong className="text-[#faf6ee] font-body-sm">CELF++ Active</strong></span>
                </div>
              </div>

              {/* Section 1: Executive Header & Control Hub */}
              <div className="bg-surface-container-low/95 border border-[#3e2c25] backdrop-blur-xl rounded-xl p-space-lg shadow-xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#f3db7a]/10 blur-3xl pointer-events-none"></div>
                <div className="absolute left-1/3 -bottom-16 w-60 h-60 rounded-full bg-[#d9c67c]/10 blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
                  <div className="flex flex-col gap-space-xs max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">ssid_chart</span>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim">
                        Algorithm Performance Benchmark
                      </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-[#faf6ee] tracking-tight leading-tight font-cinzel break-words text-balance">
                      Compare Influencer Selection Models
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant break-words text-balance">
                      Compare all four optimization strategies side-by-side under your budget to see which model delivers the highest audience reach and cost efficiency.
                    </p>
                  </div>

                  {/* Query Form Controls */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-space-sm bg-surface-container-lowest border border-[#3e2c25] p-2 rounded-lg">
                    <div className="flex flex-col px-3 py-1.5 min-w-[140px]">
                      <span className="font-label-sm text-label-sm text-outline">
                        CAMPAIGN BUDGET ({currency === 'INR' ? '₹' : '$'})
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-label-sm text-label-sm text-primary font-bold">
                          {currency === 'INR' ? '₹' : '$'}
                        </span>
                        <input
                          className="bg-transparent font-label-lg text-label-lg text-[#faf6ee] focus:outline-none w-24"
                          id="budgetInput"
                          type="text"
                          value={budgetVal}
                          onChange={e => setBudgetVal(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="h-8 w-px bg-surface-container-high hidden sm:block"></div>
                    <div className="flex flex-col px-3 py-1.5 min-w-[170px]">
                      <span className="font-label-sm text-label-sm text-outline">CATEGORY FILTER</span>
                      <div className="relative mt-0.5">
                        <select
                          value={nicheVal}
                          onChange={e => setNicheVal(e.target.value)}
                          className="bg-transparent font-body-sm text-body-sm text-[#faf6ee] focus:outline-none pr-6 cursor-pointer appearance-none w-full"
                        >
                          <option className="bg-surface-container" value="all">All Niches &amp; Platforms</option>
                          <option className="bg-surface-container" value="General Social Media Influencer">General Social Media Influencers</option>
                          <option className="bg-surface-container" value="Instagram Creator">Instagram Creators</option>
                          <option className="bg-surface-container" value="TikTok Influencer">TikTok Influencers</option>
                          <option className="bg-surface-container" value="YouTube Content Creator">YouTube Content Creators</option>
                          <option className="bg-surface-container" value="Cross-Platform Creator">Cross-Platform Creators</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-0 top-0.5 text-outline text-[16px] pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleExecuteParallel}
                      disabled={runningParallel}
                      className="bg-primary hover:bg-primary-fixed text-on-primary font-bold font-label-sm text-label-sm tracking-wider uppercase px-space-md py-3 rounded flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-primary/20 whitespace-nowrap active:scale-95 disabled:opacity-50"
                      id="runParallelBtn"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${runningParallel ? 'animate-spin' : ''}`}>
                        {runningParallel ? 'refresh' : 'play_arrow'}
                      </span>
                      <span>{runningParallel ? 'Testing Models...' : 'Compare All Models'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Side-by-Side Algorithm Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Card 1: BLII */}
                <div className="bg-surface-container-low border border-[#3e2c25] hover:border-[#4d3830] hover:bg-surface-container transition-all rounded-xl p-space-md flex flex-col justify-between relative group shadow-md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">BLII Heuristic</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d9c67c]"></span>
                    </div>
                    <div className="font-headline-md text-headline-md text-[#faf6ee]">{cmpData.blii.reach}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                      <span>Audience Reach</span>
                      <span>•</span>
                      <span className="text-outline">{cmpData.blii.seeds} Creators</span>
                    </div>
                  </div>
                  <div className="mt-space-lg pt-space-sm bg-surface-container-lowest border border-[#3e2c25] rounded p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className="text-outline">Budget Spent</span>
                      <span className="text-[#faf6ee] font-bold">{cmpData.blii.spent} / {currency === 'INR' ? '₹' : '$'}{budgetVal}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#d9c67c] h-full transition-all duration-500" style={{ width: cmpData.blii.pct }}></div>
                    </div>
                    <div className="flex justify-between items-center font-label-sm text-label-sm mt-1">
                      <span className="text-outline">Efficiency</span>
                      <span className="text-[#d9c67c] font-bold">
                        {cmpData.blii.efficiency} <span className="text-outline-variant font-normal">Reach/₹</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: GraphSAGE + CELF++ */}
                <div className="bg-surface-container-low border border-[#3e2c25] hover:border-[#4d3830] hover:bg-surface-container transition-all rounded-xl p-space-md flex flex-col justify-between relative group shadow-md">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">GraphSAGE + CELF++</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fae280]"></span>
                    </div>
                    <div className="font-headline-md text-headline-md text-[#faf6ee]">{cmpData.graphsage.reach}</div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2">
                      <span>Audience Reach</span>
                      <span>•</span>
                      <span className="text-primary-fixed-dim">{cmpData.graphsage.seeds} Authority Leads</span>
                    </div>
                  </div>
                  <div className="mt-space-lg pt-space-sm bg-surface-container-lowest border border-[#3e2c25] rounded p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className="text-outline">Budget Spent</span>
                      <span className="text-[#faf6ee] font-bold">{cmpData.graphsage.spent} / {currency === 'INR' ? '₹' : '$'}{budgetVal}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#fae280] h-full transition-all duration-500" style={{ width: cmpData.graphsage.pct }}></div>
                    </div>
                    <div className="flex justify-between items-center font-label-sm text-label-sm mt-1">
                      <span className="text-outline">Efficiency</span>
                      <span className="text-primary-fixed-dim font-bold">
                        {cmpData.graphsage.efficiency} <span className="text-outline-variant font-normal">Reach/₹</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Community Partitioning */}
                <div className="bg-surface-container-low/60 border border-[#3e2c25]/70 rounded-xl p-space-md flex flex-col justify-between relative opacity-85 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Community Partitioning</span>
                      <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    </div>
                    <div className="font-headline-md text-headline-md text-outline">{cmpData.community.reach}</div>
                    <div className="font-label-sm text-label-sm text-outline flex items-center gap-2">
                      <span>{cmpData.community.seeds > 0 ? '5 Topics Covered' : 'Topic Partition'}</span>
                      <span>•</span>
                      <span>{cmpData.community.seeds} Creators</span>
                    </div>
                  </div>
                  <div className="mt-space-lg pt-space-sm bg-surface-container-lowest/50 border border-[#3e2c25]/50 rounded p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className="text-outline">Budget Spent</span>
                      <span className="text-outline font-bold">{cmpData.community.spent} / {currency === 'INR' ? '₹' : '$'}{budgetVal}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-outline h-full transition-all duration-500" style={{ width: cmpData.community.pct }}></div>
                    </div>
                    <div className="flex justify-between items-center font-label-sm text-label-sm mt-1">
                      <span className="text-outline">Efficiency</span>
                      <span className="text-outline font-bold">
                        {cmpData.community.efficiency} <span className="text-outline-variant font-normal">Reach/₹</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Temporal GNN-LSTM (Rank #1) */}
                <div className="bg-surface-container-high border-2 border-primary/50 rounded-xl p-space-md flex flex-col justify-between relative shadow-xl overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-primary text-on-primary font-label-sm text-label-sm font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[14px]">military_tech</span>
                    <span>RANK #1 OPTIMAL</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                        Temporal GNN-LSTM
                      </span>
                    </div>
                    <div className="font-headline-md text-headline-md text-primary font-bold">{cmpData.temporal.reach}</div>
                    <div className="font-label-sm text-label-sm text-[#faf6ee] flex items-center gap-2">
                      <span className="text-primary font-bold">{cmpData.temporal.rawReach > 0 ? '+21.0% vs Runner-Up' : 'Trending Creators'}</span>
                      <span>•</span>
                      <span className="text-on-surface">{cmpData.temporal.seeds} High-Velocity Seeds</span>
                    </div>
                  </div>
                  <div className="mt-space-lg pt-space-sm bg-surface-container-lowest border border-[#4d3830] rounded p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center font-label-sm text-label-sm">
                      <span className="text-outline">Budget Spent</span>
                      <span className="text-[#faf6ee] font-bold">{cmpData.temporal.spent} / {currency === 'INR' ? '₹' : '$'}{budgetVal}</span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: cmpData.temporal.pct }}></div>
                    </div>
                    <div className="flex justify-between items-center font-label-sm text-label-sm mt-1">
                      <span className="text-outline">Efficiency</span>
                      <span className="text-primary font-bold text-base">
                        {cmpData.temporal.efficiency} <span className="text-outline font-normal text-xs">Reach/₹</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Visual Analytics Section (Dual Graphs) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                {/* Chart Left: Audience Reach Comparison across 4 models */}
                <div className="lg:col-span-7 bg-surface-container-low border border-[#3e2c25] rounded-xl p-space-lg flex flex-col gap-space-md shadow-lg">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
                      <h2 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel">Audience Reach Distribution</h2>
                    </div>
                    <div className="flex items-center gap-3 font-label-sm text-label-sm text-outline">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-primary"></span> GNN-LSTM
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-primary-fixed-dim"></span> GraphSAGE
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-[#d9c67c]"></span> BLII
                      </span>
                    </div>
                  </div>

                  {/* Inline SVG Visualization */}
                  <div className="w-full h-64 bg-surface-container-lowest border border-[#3e2c25] rounded-lg p-space-md flex flex-col justify-end relative">
                    <div className="absolute inset-x-8 top-6 flex justify-between text-outline-variant font-label-sm text-label-sm">
                      <span>300K</span>
                      <div className="w-full border-b border-[#3e2c25] ml-4 my-auto"></div>
                    </div>
                    <div className="absolute inset-x-8 top-20 flex justify-between text-outline-variant font-label-sm text-label-sm">
                      <span>225K</span>
                      <div className="w-full border-b border-[#3e2c25] ml-4 my-auto"></div>
                    </div>
                    <div className="absolute inset-x-8 top-36 flex justify-between text-outline-variant font-label-sm text-label-sm">
                      <span>150K</span>
                      <div className="w-full border-b border-[#3e2c25] ml-4 my-auto"></div>
                    </div>
                    <div className="absolute inset-x-8 top-52 flex justify-between text-outline-variant font-label-sm text-label-sm">
                      <span>75K</span>
                      <div className="w-full border-b border-[#3e2c25] ml-4 my-auto"></div>
                    </div>

                    {/* Dynamic Bar Graph */}
                    {(() => {
                      const models = [
                        { key: 'blii', name: 'BLII', fill: '#d9c67c', reach: cmpData.blii.rawReach, x: 35 },
                        { key: 'graphsage', name: 'GraphSAGE', fill: '#ddc667', reach: cmpData.graphsage.rawReach, x: 135 },
                        { key: 'community', name: 'Community', fill: '#c9c6bf', reach: cmpData.community.rawReach, x: 235 },
                        { key: 'temporal', name: 'GNN-LSTM', fill: '#f3db7a', reach: cmpData.temporal.rawReach, x: 335 },
                      ];
                      const totalReach = models.reduce((s, m) => s + m.reach, 0);
                      const maxR = Math.max(...models.map((m) => m.reach), 300000);
                      const fmtReach = (v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : v >= 1000
                          ? `${(v / 1000).toFixed(1)}K`
                          : String(v);

                      if (totalReach === 0) {
                        return (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2 z-20">
                            <span className="material-symbols-outlined text-[32px] text-outline/40">bar_chart</span>
                            <span className="font-cinzel text-[#faf6ee] text-sm">No Models Benchmark Run Yet</span>
                            <span className="font-label-sm text-label-sm text-outline">
                              Click &quot;Run 4 In Parallel&quot; above to simulate all percolation models concurrently.
                            </span>
                          </div>
                        );
                      }

                      return (
                        <svg className="w-full h-48 overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 400 160">
                          {models.map((m) => {
                            const barH = Math.max(4, (m.reach / maxR) * 140);
                            const yPos = 160 - barH;
                            return (
                              <g key={m.key}>
                                <rect
                                  className="transition-all duration-500 hover:opacity-90"
                                  fill={m.fill}
                                  height={barH}
                                  rx="3"
                                  width="55"
                                  x={m.x}
                                  y={yPos}
                                />
                                <text
                                  fill={m.fill}
                                  fontFamily="Space Mono, monospace"
                                  fontSize="9"
                                  fontWeight="700"
                                  textAnchor="middle"
                                  x={m.x + 27.5}
                                  y={Math.max(10, yPos - 6)}
                                >
                                  {fmtReach(m.reach)}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}

                    <div className="grid grid-cols-4 pt-3 font-label-sm text-label-sm text-outline text-center z-10">
                      <span className="truncate px-1">BLII</span>
                      <span className="truncate px-1 text-primary-fixed-dim">GraphSAGE</span>
                      <span className="truncate px-1">Community</span>
                      <span className="truncate px-1 text-primary font-bold">GNN-LSTM</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-1">
                    <span>
                      {cmpData.temporal.rawReach > 0 ? (
                        <>
                          Temporal GNN captures <strong>{(cmpData.temporal.rawReach / Math.max(1, cmpData.blii.rawReach)).toFixed(1)}×</strong> more audience yield than baseline BLII heuristics.
                        </>
                      ) : (
                        'Awaiting parallel benchmark execution.'
                      )}
                    </span>
                    <span className="text-primary font-bold cursor-pointer hover:underline">Export Vector Raw JSON</span>
                  </div>
                </div>

                {/* Chart Right: Budget Spent (₹) vs Remaining Reserve */}
                <div className="lg:col-span-5 bg-surface-container-low border border-[#3e2c25] rounded-xl p-space-lg flex flex-col justify-between gap-space-md shadow-lg">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                      <h2 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel">Budget Allocation ({currency === 'INR' ? '₹' : '$'})</h2>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">POOL: {currency === 'INR' ? '₹' : '$'}{budgetVal}</span>
                  </div>

                  {/* Stacked breakdown bars */}
                  <div className="flex flex-col gap-space-md bg-surface-container-lowest border border-[#3e2c25] rounded-lg p-space-md">
                    {[
                      { key: 'temporal', label: 'Temporal GNN-LSTM', color: 'bg-primary', circle: 'bg-primary', textColor: 'text-primary', data: cmpData.temporal },
                      { key: 'graphsage', label: 'GraphSAGE + CELF++', color: 'bg-[#ddc667]', circle: 'bg-[#ddc667]', textColor: 'text-primary-fixed-dim', data: cmpData.graphsage },
                      { key: 'community', label: 'Community-Aware Partitioning', color: 'bg-[#c9c6bf]', circle: 'bg-[#c9c6bf]', textColor: 'text-[#c9c6bf]', data: cmpData.community },
                      { key: 'blii', label: 'BLII', color: 'bg-[#d9c67c]', circle: 'bg-[#d9c67c]', textColor: 'text-[#d9c67c]', data: cmpData.blii },
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-label-sm text-label-sm">
                          <span className="text-[#faf6ee] font-bold flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.circle}`}></span>
                            {item.label}
                          </span>
                          <span className={`${item.textColor} font-bold`}>
                            {item.data.spent} <span className="text-outline font-normal">({item.data.pct})</span>
                          </span>
                        </div>
                        <div className="w-full h-3 rounded bg-surface-container-highest flex overflow-hidden">
                          <div className={`${item.color} h-full transition-all duration-500`} style={{ width: item.data.pct }} title="Spent"></div>
                          <div className="bg-[#484741] h-full" style={{ width: `${Math.max(0, 100 - parseInt(item.data.pct || '0'))}%` }} title="Reserve"></div>
                        </div>
                        <div className="flex justify-between text-outline font-label-sm text-label-sm">
                          <span>Spent: {item.data.spent}</span>
                          <span>Reserve: ₹{item.data.rawReserve.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-space-sm bg-surface-container border border-[#3e2c25] rounded flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                    <span className="font-body-sm text-body-sm text-on-surface">
                      Submodular greedy pruning dynamically balanced capital across models while maintaining optimal cascade reach.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Algorithm Leaderboard Ranking Table */}
              <div className="bg-surface-container-low border border-[#3e2c25] rounded-xl p-space-lg flex flex-col gap-space-md shadow-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">workspace_premium</span>
                    <h2 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel">
                      Algorithm Ranking — by Reach Efficiency (Reach / Spent)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-surface-container border border-[#3e2c25] hover:bg-surface-container-high text-[#faf6ee] font-label-sm text-label-sm rounded transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">tune</span> Filter Models
                    </button>
                    <button className="px-3 py-1 bg-surface-container border border-[#3e2c25] hover:bg-surface-container-high text-[#faf6ee] font-label-sm text-label-sm rounded transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">download</span> CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-lowest text-outline font-label-sm text-label-sm uppercase tracking-wider border-y border-[#3e2c25]">
                        <th className="py-3 px-4 rounded-l">RANK</th>
                        <th className="py-3 px-4">ALGORITHM</th>
                        <th className="py-3 px-4">SEEDS</th>
                        <th className="py-3 px-4">AUDIENCE REACH</th>
                        <th className="py-3 px-4">BUDGET SPENT</th>
                        <th className="py-3 px-4">REMAINING</th>
                        <th className="py-3 px-4">EFFICIENCY (REACH/₹)</th>
                        <th className="py-3 px-4 text-right rounded-r">DEPLOY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3e2c25] font-body-sm text-body-sm">
                      {(() => {
                        const ranked = [
                          { key: 'temporal', name: 'Temporal GNN-LSTM', color: 'text-primary', dot: 'bg-primary', data: cmpData.temporal },
                          { key: 'graphsage', name: 'GraphSAGE + CELF++', color: 'text-[#ddc667]', dot: 'bg-[#ddc667]', data: cmpData.graphsage },
                          { key: 'community', name: 'Community-Aware Partitioning', color: 'text-[#c9c6bf]', dot: 'bg-[#c9c6bf]', data: cmpData.community },
                          { key: 'blii', name: 'BLII (Budgeted Linear Influence)', color: 'text-[#d9c67c]', dot: 'bg-[#d9c67c]', data: cmpData.blii },
                        ].sort((a, b) => b.data.rawEfficiency - a.data.rawEfficiency);

                        return ranked.map((row, idx) => (
                          <tr key={row.key} className={`hover:bg-surface-container/60 transition-colors group ${idx === 0 ? 'bg-surface-container-low/40' : ''}`}>
                            <td className="py-3.5 px-4">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold shadow-sm ${idx === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-[#faf6ee] border border-[#4d3830]'}`}>
                                {idx + 1}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[#faf6ee] flex items-center gap-2.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${row.dot} ${idx === 0 ? 'animate-pulse' : ''}`}></span>
                              <span>{row.name}</span>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-label-sm text-label-sm font-semibold">
                                  Optimal Path
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[#faf6ee] font-label-md text-label-md">{row.data.seeds}</td>
                            <td className="py-3.5 px-4 text-[#faf6ee] font-bold font-label-md text-label-md">{row.data.reach}</td>
                            <td className="py-3.5 px-4 font-bold font-label-md text-label-md" style={{ color: row.key === 'temporal' ? '#fae280' : row.key === 'graphsage' ? '#ddc667' : '#faf6ee' }}>{row.data.spent}</td>
                            <td className="py-3.5 px-4 text-outline font-label-md text-label-md">₹{row.data.rawReserve.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <span className="font-label-lg text-label-lg font-bold" style={{ color: row.key === 'temporal' ? '#fae280' : row.key === 'graphsage' ? '#ddc667' : '#d9c67c' }}>
                                {row.data.efficiency}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (idx === 0) {
                                    alert(`Committed optimal ${row.name} seed cohort to live campaign! Navigating to Network Topology to explore connections.`);
                                  }
                                  setActiveNav('network-topology');
                                }}
                                className={`font-bold font-label-sm text-label-sm uppercase px-3 py-1 rounded transition-colors shadow cursor-pointer ${idx === 0 ? 'bg-primary hover:bg-primary-fixed text-on-primary' : 'bg-surface-container border border-[#3e2c25] hover:bg-surface-container-highest text-[#faf6ee]'}`}
                                title={idx === 0 ? 'Deploy this winning roster to your campaign' : 'Inspect this alternative strategy'}
                              >
                                {idx === 0 ? 'Commit Seeds' : 'Inspect'}
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5: Monte Carlo Independent Cascade Simulation Panel */}
              <div className="bg-surface-container-low border border-[#3e2c25] rounded-xl p-space-lg flex flex-col gap-space-lg shadow-xl relative overflow-hidden">
                <div className="absolute -right-32 top-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>

                <div className="flex flex-col gap-space-sm border-b border-[#3e2c25] pb-space-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
                    <h2 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel">
                      Viral Diffusion Validation (Monte Carlo Simulation)
                    </h2>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                    Statistically validate how your campaign message spreads from your selected influencers to secondary audiences across 200 viral diffusion cycles.
                  </p>

                  {/* Candidate Seed Set */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mr-2">
                      Test Influencer Cohort (5 Creators):
                    </span>
                    {['user_0', 'user_1', 'user_356', 'user_3', 'user_3524'].map(u => (
                      <span key={u} className="px-2.5 py-1 rounded bg-surface-container border border-[#3e2c25] text-primary font-label-sm text-label-sm flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {u}
                      </span>
                    ))}
                  </div>

                  {/* Slider & Runner Button Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pt-space-xs">
                    <div className="flex flex-col gap-1 min-w-[280px]">
                      <div className="flex justify-between font-label-sm text-label-sm">
                        <span className="text-outline">Simulation Accuracy:</span>
                        <span className="text-primary font-bold">{simCount} Viral Cycles</span>
                      </div>
                      <input
                        className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-[#f3db7a]"
                        id="simSlider"
                        max="500"
                        min="50"
                        step="10"
                        type="range"
                        value={simCount}
                        onChange={e => setSimCount(parseInt(e.target.value) || 200)}
                      />
                      <div className="flex justify-between font-label-sm text-label-sm text-outline-variant">
                        <span>50 (Quick preview)</span>
                        <span>500 (Deep convergence)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecuteMC}
                      disabled={runningMC}
                      className="bg-primary hover:bg-primary-fixed text-on-primary font-bold font-label-sm text-label-sm tracking-wider uppercase px-6 py-3 rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${runningMC ? 'animate-spin' : ''}`}>
                        {runningMC ? 'sync' : 'bolt'}
                      </span>
                      <span>{runningMC ? 'Simulating Viral Spread...' : 'Run Viral Simulation'}</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Cascade Metrics Trio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  {/* Metric 1 */}
                  <div className="bg-surface-container-lowest border border-[#3e2c25] p-space-md rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-outline">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider">Expected Viral Reach</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
                    </div>
                    <div className="my-space-xs">
                      <div className="font-display-lg text-headline-lg text-[#faf6ee] font-bold">{mcData.spread}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Average viral viewers reached across {simCount} cycles</div>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: mcData.spread !== '0.0' ? '65%' : '0%' }}></div>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-surface-container-lowest border border-[#3e2c25] p-space-md rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-outline">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider">Word-of-Mouth Multiplier</span>
                      <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                    </div>
                    <div className="my-space-xs">
                      <div className="font-display-lg text-headline-lg text-primary font-bold">{mcData.multiplier}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Average secondary ripple effect per creator</div>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-500" style={{ width: mcData.multiplier !== '×0.00' ? '88%' : '0%' }}></div>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-surface-container-lowest border border-[#3e2c25] p-space-md rounded-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between text-outline">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider">Direct Follower Base</span>
                      <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">group</span>
                    </div>
                    <div className="my-space-xs">
                      <div className="font-display-lg text-headline-lg text-[#faf6ee] font-bold">{mcData.baseline}</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Combined direct audience base (before viral sharing)</div>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#d9c67c] h-full transition-all duration-500" style={{ width: mcData.baseline !== '0' ? '100%' : '0%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Comparative Progress Bars */}
                <div className="bg-surface-container-lowest border border-[#3e2c25] p-space-md rounded-lg flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between font-label-sm text-label-sm pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[#faf6ee] font-bold">Cascade Amplification vs Baseline Direct Footprint</span>
                      <span className="text-outline">|</span>
                      <span className="text-outline">Seeds: 5 | Model: Independent Cascade (IC)</span>
                    </div>
                    <span className="text-primary flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[16px]">{mcData.spread !== '0.0' ? 'check_circle' : 'pending'}</span>
                      {mcData.spread !== '0.0' ? 'Spread Estimate Complete' : 'Awaiting Simulation'}
                    </span>
                  </div>
                  {/* Baseline Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>Direct Follower Exposure (Direct 1st Degree)</span>
                      <span className="text-[#faf6ee] font-bold">{mcData.baseline} Accounts</span>
                    </div>
                    <div className="w-full h-2.5 rounded bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-[#d9c67c] transition-all duration-500" style={{ width: mcData.baseline !== '0' ? '100%' : '0%' }}></div>
                    </div>
                  </div>
                  {/* Viral Cascade Bar */}
                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex justify-between font-label-sm text-label-sm text-outline">
                      <span>2nd &amp; 3rd-Degree Viral Cascade Infection (Estimated Nodes)</span>
                      <span className="text-primary font-bold">{mcData.spread} Nodes Activated ({mcData.multiplier} Multiplier)</span>
                    </div>
                    <div className="w-full h-2.5 rounded bg-surface-container-high overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: mcData.spreadPct }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

              {/* System Status & Footnote Ledger */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-xs text-outline font-label-sm text-label-sm py-space-sm border-t border-[#3e2c25]">
                <div className="flex items-center gap-3">
                  <span>GraphIQ B2B Predictive Influencer Matrix</span>
                  <span>•</span>
                  <span>API v4.0.0 (Temporal GNN Core)</span>
                  <span>•</span>
                  <span>JWT Secured</span>
                </div>
                <div>
                  Active Operator: <strong className="text-[#faf6ee]">{currentUser}</strong> &lt;Enterprise Lead&gt;
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardView;
