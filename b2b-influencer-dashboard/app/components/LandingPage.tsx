'use client';

import React, { useState } from 'react';
import { WarpFieldBackground } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

interface LandingPageProps {
  onLaunchDashboard: () => void;
  onOpenAuth: () => void;
  token: string | null;
  currentUser?: string;
}

export function LandingPage({
  onLaunchDashboard,
  onOpenAuth,
  token,
  currentUser,
}: LandingPageProps) {
  const [fullscreenWarp, setFullscreenWarp] = useState(false);

  return (
    <div className="relative min-h-screen bg-canvas text-cream-primary selection:bg-butter selection:text-canvas overflow-x-hidden">
      {/* ── Spatial Background ThreeUI WarpField + Gradients + Grid Lines ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <WarpFieldBackground
          variant="letters"
          speed={fullscreenWarp ? 24.0 : 15.0}
          streakOpacity={fullscreenWarp ? 0.95 : 0.55}
          tileOpacity={fullscreenWarp ? 1.00 : 0.85}
          fov={75}
          hue={35}
          saturation={1.25}
          brightness={fullscreenWarp ? 1.25 : 1.00}
        />
        {/* Layered cinematic radial & mocha overlays */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            fullscreenWarp
              ? 'opacity-15 bg-canvas-deep'
              : 'radial-mocha-bg opacity-90'
          }`}
        />
        <div className="absolute inset-0 hairline-grid pointer-events-none opacity-40" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-mocha-dark/40 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[500px] bg-butter/5 blur-[170px] rounded-full pointer-events-none" />
      </div>

      {/* ── View Animation Canvas Toggle Button ── */}
      <div className="fixed top-20 right-4 md:right-8 z-50">
        <button
          type="button"
          onClick={() => setFullscreenWarp(!fullscreenWarp)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-cream-secondary bg-surface-card/90 border border-mocha-border hover:border-butter hover:text-butter backdrop-blur-md transition-all shadow-xl shadow-black/50"
        >
          <span className="material-symbols-outlined text-[16px] text-butter">
            {fullscreenWarp ? 'close' : 'visibility'}
          </span>
          <span>{fullscreenWarp ? 'Exit Full Canvas' : 'View 3D Corridor'}</span>
        </button>
      </div>

      {fullscreenWarp ? (
        <div
          onClick={() => setFullscreenWarp(false)}
          className="relative z-10 min-h-screen flex flex-col items-center justify-end p-8 cursor-pointer"
        >
          <div className="obsidian-card rounded-2xl px-6 py-4 text-center max-w-md shadow-2xl">
            <div className="inline-flex items-center gap-2 text-butter text-sm font-mono font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-butter animate-ping" />
              <span>ThreeUI WarpField · Letter Storm Variant</span>
            </div>
            <p className="text-cream-muted text-xs leading-relaxed">
              160 tumbling glyphs traveling along the 3D streak corridor. Click anywhere to return to the landing page.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── FLOATING AVANT-GARDE TOP NAVIGATION ── */}
          <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
            <div className="max-w-7xl mx-auto h-14 obsidian-card rounded-full px-4 md:px-6 flex items-center justify-between shadow-2xl backdrop-blur-xl border border-mocha-border">
              <div className="flex items-center gap-4">
                <a className="flex items-center gap-2.5 group" href="#">
                  <div className="w-8 h-8 rounded-full bg-surface-high border border-mocha-accent/50 flex items-center justify-center relative overflow-hidden group-hover:border-butter transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-butter shadow-[0_0_10px_#f3db7a]"></div>
                    <div className="absolute inset-0 bg-butter/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="font-display font-black text-xl tracking-tight text-cream-primary">
                    Graph<span className="text-butter">IQ</span>
                  </span>
                </a>

                {/* Telemetry Micro-Pill */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-canvas/90 border border-mocha-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-butter animate-ping"></span>
                  <span className="font-mono text-[11px] text-cream-muted uppercase tracking-wider">
                    GNN CLUSTER <span className="text-butter font-medium">ONLINE</span> • LATENCY{' '}
                    <span className="text-cream-secondary font-medium">1.2ms</span>
                  </span>
                </div>
              </div>

              {/* Center Nav Links */}
              <nav className="hidden md:flex items-center gap-8">
                <a className="font-mono text-xs uppercase tracking-widest text-butter transition-colors flex items-center gap-1.5" href="#matrix">
                  <span className="w-1 h-1 rounded-full bg-butter"></span> 01 Matrix
                </a>
                <a className="font-mono text-xs uppercase tracking-widest text-cream-secondary hover:text-cream-primary transition-colors" href="#algorithms">
                  02 Algorithms
                </a>
                <a className="font-mono text-xs uppercase tracking-widest text-cream-secondary hover:text-cream-primary transition-colors" href="#dossier">
                  03 Dossier
                </a>
                <a className="font-mono text-xs uppercase tracking-widest text-cream-secondary hover:text-cream-primary transition-colors" href="#benchmarks">
                  04 Benchmarks
                </a>
                <a className="font-mono text-xs uppercase tracking-widest text-cream-secondary hover:text-cream-primary transition-colors" href="#sandbox">
                  05 API
                </a>
              </nav>

              {/* Right Action Pill Group */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-cream-secondary hover:text-cream-primary hover:bg-surface transition-all"
                >
                  {token ? (currentUser ? `Account (${currentUser})` : 'Account') : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={onLaunchDashboard}
                  className="px-4 py-1.5 rounded-full bg-butter text-canvas font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(243,219,122,0.45)] hover:shadow-[0_0_30px_rgba(247,227,150,0.7)] hover:bg-butter-bright transition-all flex items-center gap-1.5"
                >
                  <span>Launch Studio</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </header>

          <main className="relative z-10 pt-28 md:pt-36 flex flex-col gap-24 md:gap-36 pb-32">
            {/* ========================================================
               HERO: ASYMMETRIC SPATIAL COMPOSITION & SPATIAL GRAPH HUD
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
              <div
                className="absolute inset-x-0 -top-16 h-[550px] pointer-events-none -z-10"
                style={{
                  background:
                    'radial-gradient(65% 45% at 50% 0%, rgba(243, 219, 122, 0.08) 0%, rgba(37, 25, 21, 0.4) 50%, transparent 100%)',
                }}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                {/* Left Editorial Column with Balanced Word-Wrapping */}
                <div className="lg:col-span-6 flex flex-col space-y-6">
                  <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full obsidian-card w-fit border-mocha-border">
                    <span className="w-2 h-2 rounded-full bg-butter shadow-[0_0_10px_#f3db7a]"></span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-cream-muted">
                      AI Creator Optimization v4.2
                    </span>
                    <span className="text-cream-muted text-xs">/</span>
                    <span className="font-mono text-[11px] text-butter">Live AI Engine</span>
                  </div>

                  <h1 className="display-title font-black text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-cream-primary tracking-tighter break-words text-balance">
                    Stop Guessing Influence. <br />
                    <span
                      className="italic text-transparent bg-clip-text text-glow-butter"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(255, 246, 214) 0%, rgb(245, 222, 126) 40%, rgb(226, 185, 74) 80%, rgb(200, 146, 44) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(rgba(243, 219, 122, 0.25) 0px 0px 35px)',
                      }}
                    >
                      Compute it.
                    </span>
                  </h1>

                  <p className="text-cream-secondary text-base md:text-lg max-w-xl font-normal leading-relaxed break-words text-balance">
                    Enterprise AI influencer optimization. Automatically find the highest-performing creators for your budget with mathematically proven audience reach guarantees.
                  </p>

                  {/* CTA Action Matrix */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="px-6 py-3.5 rounded-full bg-butter text-canvas font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_26px_rgba(243,219,122,0.5)] hover:shadow-[0_0_38px_rgba(247,227,150,0.75)] hover:bg-butter-bright transition-all flex items-center gap-2 cursor-pointer"
                      style={{
                        background:
                          'linear-gradient(135deg, rgb(251, 240, 185) 0%, rgb(243, 219, 122) 50%, rgb(216, 169, 51) 100%)',
                        boxShadow:
                          'rgba(243, 219, 122, 0.45) 0px 0px 28px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">terminal</span>
                      <span>Launch Optimizer Studio</span>
                    </button>
                    <a
                      className="px-6 py-3.5 rounded-full obsidian-card border border-mocha-accent/50 text-cream-primary font-mono text-xs uppercase tracking-wider hover:border-butter hover:text-butter transition-all flex items-center gap-2 group"
                      href="#matrix"
                    >
                      <span>Explore Influencer Graph</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        hub
                      </span>
                    </a>
                  </div>

                  {/* Dynamic Live Stats Bar with Word-Wrapping */}
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-mocha-border">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-cream-muted break-words">
                        Reach Multiplier
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display font-extrabold text-2xl md:text-3xl text-cream-primary">
                          5.84x
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-butter flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">insights</span> vs random selection
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-cream-muted break-words">
                        Effective CPM
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display font-extrabold text-2xl md:text-3xl text-cream-primary">
                          ₹1.42
                        </span>
                        <span className="text-xs text-cream-muted">/reach</span>
                      </div>
                      <span className="font-mono text-[10px] text-cream-muted">($0.017 USD eq.)</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-cream-muted break-words">
                        Budget Efficiency
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-display font-extrabold text-2xl md:text-3xl text-butter text-glow-butter">
                          99.4%
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-cream-secondary">Guaranteed Optimal Yield</span>
                    </div>
                  </div>
                </div>

                {/* Right Interactive Spatial Graph HUD */}
                <div className="lg:col-span-6 relative" id="matrix">
                  <div className="obsidian-card rounded-2xl p-5 md:p-6 border border-mocha-border relative overflow-hidden shadow-2xl group">
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-butter/10 blur-3xl pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-mocha-border pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-butter animate-pulse shadow-[0_0_8px_#f3db7a]"></div>
                        <span className="font-mono text-xs uppercase tracking-wider text-cream-primary">
                          INTERACTIVE INFLUENCER NETWORK
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-canvas-deep border border-mocha-border text-cream-muted">
                          VIRAL SPREAD TEST
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-butter/15 text-butter border border-butter/40">
                          5 SELECTED CREATORS
                        </span>
                      </div>
                    </div>

                    {/* Spatial Canvas Visualization */}
                    <div
                      className="relative w-full h-[320px] my-3 rounded-xl bg-canvas-deep/90 border border-mocha-border overflow-hidden flex items-center justify-center"
                      style={{
                        background:
                          'radial-gradient(circle at 75% 25%, rgba(243, 219, 122, 0.12) 0%, rgba(69, 54, 49, 0.25) 45%, rgba(22, 12, 8, 0.95) 100%)',
                      }}
                    >
                      <svg className="w-full h-full" fill="none" viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
                        {/* Topological Mocha Density Fields */}
                        <path d="M60 80 Q 140 30 220 90 T 180 220 T 70 190 Z" fill="#342723" fillOpacity="0.35"></path>
                        <path d="M280 60 Q 400 20 480 110 T 430 250 T 260 210 Z" fill="#f3db7a" fillOpacity="0.08"></path>
                        <path d="M180 190 Q 280 240 380 200 T 320 290 T 150 270 Z" fill="#4d3830" fillOpacity="0.25"></path>

                        {/* Connecting Graph Arcs */}
                        <g strokeLinecap="round">
                          <line opacity="0.4" stroke="#4d3830" strokeDasharray="3 3" strokeWidth="1.5" x1="100" x2="180" y1="120" y2="150"></line>
                          <line opacity="0.8" stroke="#f3db7a" strokeWidth="2" x1="180" x2="270" y1="150" y2="90"></line>
                          <line opacity="0.6" stroke="#b88a44" strokeWidth="1.5" x1="180" x2="230" y1="150" y2="240"></line>
                          <line opacity="0.9" stroke="#f7e396" strokeWidth="2.5" x1="270" x2="390" y1="90" y2="120"></line>
                          <line opacity="0.4" stroke="#d9c67c" strokeWidth="1.5" x1="270" x2="340" y1="90" y2="210"></line>
                          <line opacity="0.85" stroke="#f3db7a" strokeWidth="2" x1="390" x2="470" y1="120" y2="180"></line>
                          <line opacity="0.6" stroke="#f3db7a" strokeDasharray="4 3" strokeWidth="1.5" x1="390" x2="480" y1="120" y2="70"></line>
                          <line opacity="0.5" stroke="#3e2c25" strokeWidth="1.5" x1="230" x2="340" y1="240" y2="210"></line>
                          <line opacity="0.6" stroke="#4d3830" strokeWidth="1.5" x1="340" x2="420" y1="210" y2="260"></line>
                        </g>

                        {/* Ambient Satellite Nodes */}
                        <circle cx="80" cy="110" fill="#342723" r="4"></circle>
                        <circle cx="110" cy="190" fill="#342723" r="3.5"></circle>
                        <circle cx="140" cy="60" fill="#4d3830" r="5"></circle>
                        <circle cx="490" cy="65" fill="#342723" r="4.5"></circle>
                        <circle cx="505" cy="175" fill="#342723" r="4"></circle>
                        <circle cx="430" cy="270" fill="#4d3830" r="5.5"></circle>
                        <circle cx="310" cy="285" fill="#342723" r="4"></circle>

                        {/* High-Centrality Seed Nodes */}
                        <g className="cursor-pointer">
                          <circle cx="180" cy="150" fill="#1c110d" r="14" stroke="#f3db7a" strokeWidth="2.5"></circle>
                          <circle cx="180" cy="150" fill="#f3db7a" r="6"></circle>
                          <text fill="#cec6b2" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="180" y="177">
                            CREATOR-α (92% Match)
                          </text>
                        </g>

                        {/* APEX SEED 2 */}
                        <g className="cursor-pointer">
                          <circle cx="270" cy="90" fill="#1c110d" r="18" stroke="#f7e396" strokeWidth="3"></circle>
                          <circle cx="270" cy="90" fill="#f3db7a" r="9"></circle>
                          <circle
                            className="animate-spin"
                            cx="270"
                            cy="90"
                            fill="none"
                            opacity="0.75"
                            r="26"
                            stroke="#f7e396"
                            strokeDasharray="3 4"
                            strokeWidth="1.5"
                            style={{ transformOrigin: '270px 90px' }}
                          ></circle>
                          <text fill="#f7e396" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="270" y="62">
                            TOP CREATOR: @elena_arch
                          </text>
                        </g>

                        {/* Node 3 */}
                        <g className="cursor-pointer">
                          <circle cx="390" cy="120" fill="#1c110d" r="14" stroke="#f3db7a" strokeWidth="2.5"></circle>
                          <circle cx="390" cy="120" fill="#f3db7a" r="6"></circle>
                          <text fill="#cec6b2" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="390" y="146">
                            CREATOR-β (+42k)
                          </text>
                        </g>

                        {/* Bridge Community Node */}
                        <circle cx="340" cy="210" fill="#342723" r="9" stroke="#d9c67c" strokeWidth="2"></circle>
                        <text fill="#d9c67c" fontFamily="JetBrains Mono" fontSize="8" textAnchor="middle" x="340" y="231">
                          Node 4821
                        </text>
                      </svg>

                      {/* Spatial HUD Data Overlays */}
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg obsidian-card border border-mocha-border flex items-center gap-3 backdrop-blur-md">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-butter"></span>
                          <span className="font-mono text-[10px] text-cream-primary">
                            AI Accuracy: <strong className="text-butter font-normal">99.8% Guaranteed</strong>
                          </span>
                        </div>
                        <span className="text-mocha-border text-xs">|</span>
                        <span className="font-mono text-[10px] text-cream-muted">Viral Multiplier: 5.84x</span>
                      </div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded obsidian-card border border-mocha-border font-mono text-[10px] text-cream-secondary">
                        2-Hop Community Graph
                      </div>
                    </div>

                    {/* Live Optimizer Quick Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-canvas-deep/80 border border-mocha-border">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-cream-muted">Campaign Budget</div>
                        <div className="text-base font-mono font-bold text-cream-primary mt-0.5">
                          ₹50,000 <span className="text-xs text-cream-muted">Limit</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-canvas-deep/80 border border-mocha-border">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-cream-muted">Total Audience Reach</div>
                        <div className="text-base font-mono font-bold text-butter mt-0.5">+285,400 Viewers</div>
                      </div>
                      <div className="p-3 rounded-lg bg-canvas-deep/80 border border-mocha-border flex items-center justify-between">
                        <div className="flex flex-col">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-cream-muted">Strategy</div>
                          <div className="text-xs font-mono font-bold text-cream-primary mt-0.5">CELF++ STAR HUB</div>
                        </div>
                        <button
                          type="button"
                          onClick={onLaunchDashboard}
                          className="w-8 h-8 rounded-full bg-butter/20 border border-butter/60 flex items-center justify-center text-butter hover:bg-butter hover:text-canvas transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
               SECTION 01 / SPATIAL INTERACTIVE BENTO & ARCHITECTURE
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="algorithms">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-mocha-border pb-6 gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-butter tracking-widest uppercase">01 / ARCHITECTURE</span>
                  <h2 className="display-title font-black text-3xl sm:text-4xl md:text-5xl text-cream-primary mt-2 break-words text-balance">
                    AI Creator Selection Engine
                  </h2>
                </div>
                <p className="text-cream-secondary text-sm md:text-base max-w-md break-words text-balance leading-relaxed">
                  Eliminates guesswork and manual spreadsheets with AI algorithms designed to find the best creators for any budget.
                </p>
              </div>

              {/* Asymmetrical Bento Matrix with Proper Word Wrapping */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-8">
                {/* Card 1: Bipartite Graph Diffusion (Span 7) */}
                <div className="md:col-span-7 obsidian-card obsidian-card-interactive rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider bg-surface-high border border-mocha-border text-cream-muted">
                      AUDIENCE INTELLIGENCE
                    </span>
                    <span className="font-mono text-xs text-butter">100% Unique Reach</span>
                  </div>

                  <div className="my-6">
                    <h3 className="display-title font-extrabold text-2xl md:text-3xl text-cream-primary mb-3 break-words">
                      Audience Overlap Protection
                    </h3>
                    <p className="text-cream-secondary text-sm leading-relaxed max-w-xl break-words">
                      Constructs bi-directional maps between creators and their organic audience clusters. Prevents you from paying twice for overlapping audiences, ensuring 100% unique viewer reach.
                    </p>
                  </div>

                  {/* Marginal Gain Curve Visualizer */}
                  <div className="p-4 rounded-xl bg-canvas-deep/90 border border-mocha-border">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-cream-muted break-words">Audience Coverage Yield Curve</span>
                      <span className="text-butter">Diminishing Returns Protected</span>
                    </div>
                    <div className="h-20 w-full flex items-end gap-1.5 pt-2">
                      <div className="flex-1 bg-butter/90 rounded-t h-[94%] relative group/bar">
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-surface text-cream-primary font-mono text-[9px] px-1 rounded border border-butter whitespace-nowrap">
                          Creator 1: +120k
                        </div>
                      </div>
                      <div className="flex-1 bg-butter/75 rounded-t h-[78%]"></div>
                      <div className="flex-1 bg-butter/60 rounded-t h-[56%]"></div>
                      <div className="flex-1 bg-mocha-accent/70 rounded-t h-[38%]"></div>
                      <div className="flex-1 bg-mocha-accent/50 rounded-t h-[24%]"></div>
                      <div className="flex-1 bg-mocha-border/80 rounded-t h-[14%]"></div>
                      <div className="flex-1 bg-mocha-dark/50 rounded-t h-[8%]"></div>
                      <div className="flex-1 bg-mocha-dark/30 rounded-t h-[4%]"></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-cream-muted mt-2">
                      <span>Creator 1 (Top Anchor)</span>
                      <span>Creator 4 (Targeted Bridge)</span>
                      <span>Creator 8 (Budget Cap)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 text-xs font-mono text-cream-muted">
                    <span className="material-symbols-outlined text-[16px] text-butter">verified</span>
                    <span>Zero Audience Overlap Guarantee Active</span>
                  </div>
                </div>

                {/* Card 2: CELF++ Lazy Greedy Engine (Span 5) */}
                <div className="md:col-span-5 obsidian-card obsidian-card-interactive rounded-2xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider bg-canvas border border-mocha-border text-cream-muted">
                      FAST ALLOCATOR
                    </span>
                    <span className="w-2 h-2 rounded-full bg-butter animate-ping"></span>
                  </div>

                  <div className="my-6">
                    <h3 className="display-title font-extrabold text-2xl md:text-3xl text-cream-primary mb-3 break-words">
                      Fast Real-Time Optimization (CELF++)
                    </h3>
                    <p className="text-cream-secondary text-sm leading-relaxed break-words">
                      Evaluates thousands of creators in milliseconds by intelligently caching calculations. Finds the optimal creator combination without slowing down your workflow.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-canvas-deep/90 border border-mocha-border space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-cream-secondary">Standard Search Latency</span>
                      <span className="text-cream-muted font-bold">14,200ms</span>
                    </div>
                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                      <div className="bg-mocha-border h-full w-[90%]"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono pt-1">
                      <span className="text-cream-secondary">GraphIQ Fast Engine</span>
                      <span className="text-butter font-bold">18.4ms</span>
                    </div>
                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                      <div className="bg-butter h-full w-[12%] shadow-[0_0_8px_#f3db7a]"></div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between font-mono text-xs">
                    <span className="text-cream-muted">Yield Guarantee:</span>
                    <span className="text-butter font-bold">99.4% Proven Optimal</span>
                  </div>
                </div>

                {/* Card 3: Temporal GNN-LSTM Cascade Predictor (Span 6) */}
                <div className="md:col-span-6 obsidian-card obsidian-card-interactive rounded-2xl p-6 md:p-8 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider bg-canvas border border-mocha-border text-cream-muted">
                      MOMENTUM AI
                    </span>
                    <span className="font-mono text-xs text-mocha-accent">TREND FORECASTING</span>
                  </div>

                  <div className="my-6">
                    <h3 className="display-title font-extrabold text-2xl text-cream-primary mb-2 break-words">
                      Trend &amp; Growth Prediction (GNN)
                    </h3>
                    <p className="text-cream-secondary text-sm leading-relaxed break-words">
                      Analyzes rolling 90-day engagement trends to predict which creators have surging audience momentum before you launch your campaign.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-canvas-deep border border-mocha-border font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cream-muted uppercase">Growth Memory</span>
                      <span className="text-sm font-bold text-cream-primary mt-0.5">90-Day Trajectory</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cream-muted uppercase">Community Reach</span>
                      <span className="text-sm font-bold text-butter mt-0.5">2-Hop Social Circles</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Monte Carlo IC Simulator (Span 6) */}
                <div className="md:col-span-6 obsidian-card obsidian-card-interactive rounded-2xl p-6 md:p-8 flex flex-col justify-between group">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider bg-canvas border border-mocha-border text-cream-muted">
                      VIRAL SPREAD
                    </span>
                    <span className="font-mono text-xs text-butter">500 SIMULATIONS</span>
                  </div>

                  <div className="my-6">
                    <h3 className="display-title font-extrabold text-2xl text-cream-primary mb-2 break-words">
                      Viral Word-of-Mouth Simulation
                    </h3>
                    <p className="text-cream-secondary text-sm leading-relaxed break-words">
                      Simulates how campaign content will spread through peer-to-peer shares. Filters out vanity influencers who have large follower counts but low real engagement.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-canvas-deep border border-mocha-border font-mono">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cream-muted uppercase">Viral Pass Rate</span>
                      <span className="text-sm font-bold text-cream-muted mt-0.5">Peer-to-Peer Probability</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cream-muted uppercase">Confidence Level</span>
                      <span className="text-sm font-bold text-butter mt-0.5">99.9% Statistical Accuracy</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
               SECTION 02 / MATHEMATICAL PROOF & CONVERGENCE
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="dossier">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-mocha-border pb-6 gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-butter tracking-widest uppercase">
                    02 / PROVEN PERFORMANCE
                  </span>
                  <h2 className="display-title font-black text-3xl sm:text-4xl md:text-5xl text-cream-primary mt-2 break-words text-balance">
                    Audience Reach Dynamics
                  </h2>
                </div>
                <p className="text-cream-secondary text-sm md:text-base max-w-md leading-relaxed break-words text-balance">
                  Mathematical proof showing how GraphIQ delivers up to 5.84x higher reach compared to random or follower-based selection.
                </p>
              </div>

              {/* Dual-Panel System Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                {/* Panel A: Submodular Curvature & Sub-Gaussian Concentration Bounds (Span 7) */}
                <div className="lg:col-span-7 obsidian-card obsidian-card-interactive rounded-3xl p-6 md:p-8 border border-mocha-border-strong relative overflow-hidden flex flex-col justify-between shadow-2xl">
                  <div className="absolute -top-16 -right-16 w-56 h-56 bg-butter/5 blur-3xl pointer-events-none"></div>
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-mocha-border">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-butter shadow-[0_0_8px_#f3db7a]"></span>
                        <span className="font-mono text-xs uppercase tracking-wider text-cream-primary">
                          AUDIENCE REACH EFFICIENCY
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-butter bg-butter/10 px-2 py-0.5 rounded border border-butter/40">
                        Proven Optimal Curve
                      </span>
                    </div>

                    <div className="my-5">
                      <h3 className="display-title font-extrabold text-2xl text-cream-primary mb-2 break-words">
                        New Audience Reached per Creator Added
                      </h3>
                      <p className="text-cream-secondary text-xs md:text-sm leading-relaxed break-words">
                        Demonstrates how GraphIQ maximizes unique new audience members with each creator added, while avoiding duplicate followers.
                      </p>
                    </div>

                    {/* SVG Chart */}
                    <div className="relative w-full h-[260px] rounded-xl bg-canvas-deep border border-mocha-border p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-cream-muted uppercase">New Audience Reached (Per Creator)</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-cream-muted">
                            <span className="w-2 h-0.5 bg-mocha-border"></span> Random
                          </span>
                          <span className="flex items-center gap-1 text-mocha-accent">
                            <span className="w-2 h-0.5 bg-mocha-accent"></span> Follower Count Only
                          </span>
                          <span className="flex items-center gap-1 text-butter font-bold">
                            <span className="w-2 h-1 bg-butter shadow-[0_0_8px_#f3db7a]"></span> GraphIQ AI Engine
                          </span>
                        </div>
                      </div>

                      <div className="relative w-full h-[180px] my-1">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 160">
                          <defs>
                            <linearGradient id="butterGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                              <stop offset="0%" stopColor="#fae280" stopOpacity="0.45"></stop>
                              <stop offset="40%" stopColor="#f3db7a" stopOpacity="0.2"></stop>
                              <stop offset="80%" stopColor="#b88a44" stopOpacity="0.06"></stop>
                              <stop offset="100%" stopColor="#f3db7a" stopOpacity="0.0"></stop>
                            </linearGradient>
                          </defs>

                          {/* Background Grid Lines */}
                          <line opacity="0.25" stroke="#3e2c25" strokeDasharray="2 4" strokeWidth="1" x1="0" x2="500" y1="40" y2="40"></line>
                          <line opacity="0.25" stroke="#3e2c25" strokeDasharray="2 4" strokeWidth="1" x1="0" x2="500" y1="80" y2="80"></line>
                          <line opacity="0.25" stroke="#3e2c25" strokeDasharray="2 4" strokeWidth="1" x1="0" x2="500" y1="120" y2="120"></line>

                          {/* Area Fill for GraphIQ Curve */}
                          <polygon fill="url(#butterGrad)" points="0,18 70,32 140,56 220,86 310,118 400,136 500,146 500,160 0,160"></polygon>

                          {/* Random Selection Line */}
                          <polyline fill="none" opacity="0.6" points="0,135 70,138 140,141 220,145 310,149 400,152 500,154" stroke="#4d3830" strokeDasharray="4 3" strokeWidth="1.5"></polyline>

                          {/* Degree Centrality Curve */}
                          <polyline fill="none" opacity="0.8" points="0,45 70,75 140,115 220,138 310,148 400,153 500,156" stroke="#b88a44" strokeDasharray="3 3" strokeWidth="2"></polyline>

                          {/* GraphIQ CELF++ Optimal Trajectory */}
                          <polyline fill="none" points="0,18 70,32 140,56 220,86 310,118 400,136 500,146" stroke="#f3db7a" strokeWidth="2.5"></polyline>

                          {/* Data Highlight Node */}
                          <circle cx="140" cy="56" fill="#1c110d" r="5" stroke="#f3db7a" strokeWidth="2"></circle>
                          <circle cx="140" cy="56" fill="#f3db7a" r="2.5"></circle>
                          <text fill="#f3db7a" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" x="152" y="54">
                            k=3: Optimal Reach
                          </text>
                        </svg>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-cream-muted border-t border-mocha-border pt-1">
                        <span>Creator 1 (Top Anchor)</span>
                        <span>Creator 4 (Targeted Bridge)</span>
                        <span>Creator 8 (Budget Limit)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs font-mono border-t border-mocha-border mt-4">
                    <div className="flex items-center gap-2 text-cream-muted">
                      <span className="material-symbols-outlined text-[16px] text-butter">verified</span>
                      <span>Guaranteed Optimal Allocation Protocol</span>
                    </div>
                    <span className="text-butter font-bold">99.4% Proven Optimal Yield</span>
                  </div>
                </div>

                {/* Panel B: Multi-Hop Influence Propagation Matrix (Span 5) */}
                <div className="lg:col-span-5 obsidian-card obsidian-card-interactive rounded-3xl p-6 md:p-8 border border-mocha-border flex flex-col justify-between shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-mocha-border">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-butter animate-ping"></span>
                      <span className="font-mono text-xs uppercase tracking-wider text-cream-primary">
                        NETWORK TELEMETRY
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-cream-muted bg-canvas-deep px-2 py-0.5 rounded border border-mocha-border">
                      LIVE ENGINE
                    </span>
                  </div>

                  <div className="my-4">
                    <h3 className="display-title font-extrabold text-2xl text-cream-primary mb-2 break-words">
                      Audience Quality Metrics
                    </h3>
                    <p className="text-cream-secondary text-xs md:text-sm leading-relaxed break-words">
                      Continuous analysis ensuring maximum audience reach and viral engagement across your target market.
                    </p>
                  </div>

                  {/* Metric 2x2 Grid with Mocha & Butter highlights */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-canvas-deep border border-mocha-border flex flex-col justify-between">
                      <span className="font-mono text-[10px] uppercase text-cream-muted tracking-wider">Viral Multiplier</span>
                      <div className="text-xl md:text-2xl font-mono font-bold text-cream-primary mt-1">5.84x</div>
                      <span className="font-mono text-[10px] text-cream-secondary mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-butter">insights</span> Peer-to-Peer
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-canvas-deep border border-mocha-border flex flex-col justify-between">
                      <span className="font-mono text-[10px] uppercase text-cream-muted tracking-wider">Audience Overlap</span>
                      <div className="text-xl md:text-2xl font-mono font-bold text-butter mt-1">0% Wasted</div>
                      <span className="font-mono text-[10px] text-cream-muted mt-1">Unique Viewers Only</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-canvas-deep border border-mocha-border flex flex-col justify-between">
                      <span className="font-mono text-[10px] uppercase text-cream-muted tracking-wider">Authenticity Check</span>
                      <div className="text-xl md:text-2xl font-mono font-bold text-cream-muted mt-1">100% Verified</div>
                      <span className="font-mono text-[10px] text-butter mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check</span> Real Engagement
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-canvas-deep border border-mocha-border flex flex-col justify-between">
                      <span className="font-mono text-[10px] uppercase text-cream-muted tracking-wider">Budget Guarantee</span>
                      <div className="text-xl md:text-2xl font-mono font-bold text-butter mt-1 text-glow-butter">99.8%</div>
                      <span className="font-mono text-[10px] text-cream-muted mt-1">Capital Efficiency</span>
                    </div>
                  </div>

                  {/* Bottom Status / Execution Footer */}
                  <div className="pt-4 border-t border-mocha-border flex items-center justify-between font-mono text-xs">
                    <span className="text-cream-muted">
                      Latency: <strong className="text-cream-primary font-normal">1.2ms / query</strong>
                    </span>
                    <button
                      type="button"
                      onClick={onLaunchDashboard}
                      className="text-butter hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Studio</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
               SECTION 03 / HIGH-DENSITY PROVABLE BENCHMARK MATRIX
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="benchmarks">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-mocha-border pb-6 gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-butter tracking-widest uppercase">
                    03 / COMPARISON
                  </span>
                  <h2 className="display-title font-black text-3xl sm:text-4xl md:text-5xl text-cream-primary mt-2 break-words text-balance">
                    GraphIQ vs Traditional Agency
                  </h2>
                </div>
                <p className="text-cream-secondary text-sm md:text-base max-w-md break-words text-balance leading-relaxed">
                  Head-to-head comparison between GraphIQ&apos;s intelligent AI platform and traditional manual creator selection.
                </p>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left rounded-2xl overflow-hidden obsidian-card border border-mocha-border shadow-2xl">
                  <thead>
                    <tr className="bg-surface-card border-b border-mocha-border">
                      <th className="p-5 font-mono text-xs uppercase tracking-wider text-cream-muted font-bold">
                        Feature / Capability
                      </th>
                      <th className="p-5 font-mono text-xs uppercase tracking-wider text-butter font-bold bg-butter/5 border-x border-mocha-border">
                        GraphIQ AI Platform
                      </th>
                      <th className="p-5 font-mono text-xs uppercase tracking-wider text-cream-muted font-bold">
                        Traditional Influencer Agency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mocha-border/70 text-sm font-sans">
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Creator Selection Method
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        Mathematically Guaranteed Optimal Yield (CELF++)
                      </td>
                      <td className="p-5 text-cream-muted">
                        Subjective guessing based on raw follower counts
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Audience Overlap Protection
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        Automatic deduplication (100% unique viewer reach)
                      </td>
                      <td className="p-5 text-cream-secondary">
                        Unaccounted (Typically 38% – 62% wasted budget)
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Growth &amp; Trend Forecasting
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        AI momentum prediction (90-day trajectory)
                      </td>
                      <td className="p-5 text-cream-muted">
                        Outdated static media kit screenshots
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Keyword &amp; Content Matching
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        Deep AI semantic content &amp; hashtag matching
                      </td>
                      <td className="p-5 text-cream-muted">
                        Manual keyword search in bios
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Turnaround Time
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        Instant (under 20 milliseconds)
                      </td>
                      <td className="p-5 text-cream-muted">
                        3 to 5 business days of manual emails
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-card/70 transition-colors">
                      <td className="p-5 font-semibold text-cream-primary flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-butter"></span> Guaranteed Yield
                      </td>
                      <td className="p-5 font-mono text-butter bg-butter/5 border-x border-mocha-border font-medium">
                        99.4% mathematically proven optimal reach
                      </td>
                      <td className="p-5 text-cream-secondary">
                        Zero guarantees / high variance
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ========================================================
               SECTION 04 / LIVE ENTERPRISE CLUSTER SANDBOX / TERMINAL
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full" id="sandbox">
              <div className="obsidian-card rounded-3xl p-6 md:p-10 border border-mocha-border relative overflow-hidden shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    <span className="font-mono text-xs font-bold text-butter uppercase tracking-widest">
                      DEVELOPER CLUSTER ACCESS
                    </span>
                    <h3 className="display-title font-black text-3xl md:text-4xl text-cream-primary break-words">
                      Instant Seed Graph API Sandbox
                    </h3>
                    <p className="text-cream-secondary text-sm leading-relaxed break-words">
                      Execute submodular creator optimization via high-throughput REST and gRPC endpoints. Integrates seamlessly into enterprise CDPs and marketing automation pipelines.
                    </p>
                    <div className="pt-2 flex flex-col gap-2 font-mono text-xs text-cream-secondary">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-butter"></span>
                        <span>PyTorch Geometric v2.4 + Redis 7.2 Sharded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-mocha-accent"></span>
                        <span>SOC2 Type II • Zero-Trust JWT Security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cream-muted"></span>
                        <span>Support for multi-currency: USD ($) &amp; INR (₹)</span>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Mockup Window */}
                  <div className="lg:col-span-7">
                    <div className="rounded-xl bg-canvas-deep border border-mocha-border overflow-hidden shadow-2xl font-mono text-xs">
                      <div className="bg-surface-card px-4 py-2.5 border-b border-mocha-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-900/60 border border-red-700/50"></span>
                          <span className="w-3 h-3 rounded-full bg-yellow-900/60 border border-yellow-700/50"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-900/60 border border-emerald-700/50"></span>
                          <span className="ml-2 text-cream-muted text-[11px]">curl — bash — api.graphiq.ai</span>
                        </div>
                        <span className="text-butter text-[10px]">TLS 1.3 256-BIT</span>
                      </div>
                      <div className="p-5 space-y-3 overflow-x-auto text-cream-secondary leading-relaxed">
                        <div>
                          <span className="text-butter font-bold">$</span> curl -X POST https://api.graphiq.ai/v4/optimize \
                        </div>
                        <div className="pl-4 text-cream-muted">
                          -H <span className="text-butter">"Authorization: Bearer gq_live_token_77a2"</span> \
                        </div>
                        <div className="pl-4 text-cream-muted">
                          -H <span className="text-butter">"Content-Type: application/json"</span> \
                        </div>
                        <div className="pl-4 text-cream-muted">-d {'{'}</div>
                        <div className="pl-8 text-cream-secondary">"budget": 50000,</div>
                        <div className="pl-8 text-cream-secondary">"currency": "USD",</div>
                        <div className="pl-8 text-cream-secondary">"niche": "b2b_cloud_infrastructure",</div>
                        <div className="pl-8 text-cream-secondary">"algorithm": "temporal_gnn_celf_plus",</div>
                        <div className="pl-8 text-cream-secondary">"mc_simulations": 500</div>
                        <div className="pl-4 text-cream-muted">{'}'}</div>
                        <div className="pt-2 text-cream-muted">// HTTP 200 OK — Execution Time: 21.4ms</div>
                        <div className="text-butter">
                          {`{
  "status": "CONVERGED",
  "optimal_seeds": ["NODE_8829", "NODE_4102", "NODE_0911"],
  "guaranteed_reach": 285400,
  "submodular_utility": 0.994,
  "cannibalization_index": 0.021
}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================
               BOTTOM CTA HERO STRIP
               ======================================================== */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
              <div className="obsidian-card rounded-3xl p-10 md:p-16 border border-mocha-border text-center flex flex-col items-center relative overflow-hidden">
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-butter/15 blur-3xl pointer-events-none"></div>
                <span className="font-mono text-xs uppercase tracking-widest text-butter">DEPLOY SPATIAL INTELLIGENCE</span>
                <h2 className="display-title font-black text-4xl sm:text-5xl md:text-6xl text-cream-primary mt-3 max-w-3xl break-words text-balance">
                  Engineered for Enterprise Stride. Backed by Graph Mathematics.
                </h2>
                <p className="text-cream-secondary text-base max-w-xl mt-4 leading-relaxed break-words text-balance">
                  Eliminate agency guesswork. Accelerate creator influence with algorithmic precision, zero cannibalization, and provable submodular reach.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <button
                    type="button"
                    onClick={onLaunchDashboard}
                    className="px-8 py-4 rounded-full bg-butter text-canvas font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(243,219,122,0.6)] hover:shadow-[0_0_40px_rgba(247,227,150,0.85)] hover:bg-butter-bright transition-all flex items-center gap-2"
                    style={{
                      background:
                        'linear-gradient(135deg, rgb(251, 240, 185) 0%, rgb(243, 219, 122) 50%, rgb(216, 169, 51) 100%)',
                      boxShadow:
                        'rgba(243, 219, 122, 0.55) 0px 0px 32px, rgba(255, 255, 255, 0.6) 0px 1px 1px inset',
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Launch Optimizer Studio</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="px-8 py-4 rounded-full obsidian-card border border-mocha-accent/50 text-cream-primary font-mono text-xs uppercase tracking-wider hover:border-butter hover:text-butter transition-all flex items-center gap-2"
                  >
                    <span>Sign In / Authentication</span>
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </button>
                </div>
              </div>
            </section>
          </main>

          {/* ========================================================
             AVANT-GARDE DARK EDITORIAL FOOTER
             ======================================================== */}
          <footer className="w-full border-t border-mocha-border bg-canvas-deep pt-16 pb-12 relative z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-mocha-border/80">
                {/* Brand Column */}
                <div className="md:col-span-5 flex flex-col space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-high border border-mocha-accent/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-butter"></div>
                    </div>
                    <span className="font-display font-black text-xl text-cream-primary">
                      Graph<span className="text-butter">IQ</span>
                    </span>
                  </div>
                  <p className="text-cream-muted text-xs font-sans max-w-sm leading-relaxed break-words">
                    Avant-Garde Predictive Influencer Intelligence. Powered by Submodular Combinatorial Optimization, Temporal GNN-LSTM Networks, and Stochastic Monte Carlo percolation models.
                  </p>
                  <div className="flex items-center gap-3 pt-2 font-mono text-[11px] text-cream-secondary">
                    <span className="px-2 py-0.5 rounded bg-surface border border-mocha-border">SOC2 TYPE II</span>
                    <span className="px-2 py-0.5 rounded bg-surface border border-mocha-border">256-BIT AES</span>
                    <span className="px-2 py-0.5 rounded bg-surface border border-mocha-border">ZERO-TRUST</span>
                  </div>
                </div>

                {/* Nav Columns */}
                <div className="md:col-span-7 grid grid-cols-3 gap-6 font-mono text-xs">
                  <div className="flex flex-col space-y-3">
                    <span className="font-bold text-butter uppercase tracking-wider">Engines</span>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#algorithms">CELF++ Greedy</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#algorithms">Temporal GNN</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#algorithms">Independent Cascade</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#algorithms">Cosine Semantic Scorer</a>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <span className="font-bold text-butter uppercase tracking-wider">Architecture</span>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#sandbox">Redis In-Memory</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#sandbox">REST / gRPC v4</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#matrix">Latency SLA</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#algorithms">PyTorch Geometric</a>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <span className="font-bold text-butter uppercase tracking-wider">Enterprise</span>
                    <button type="button" onClick={onOpenAuth} className="text-left text-cream-muted hover:text-butter transition-colors">Client Portal</button>
                    <button type="button" onClick={onLaunchDashboard} className="text-left text-cream-muted hover:text-butter transition-colors">Studio Access</button>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#dossier">Mathematical Dossier</a>
                    <a className="text-cream-muted hover:text-butter transition-colors" href="#matrix">Status Page</a>
                  </div>
                </div>
              </div>

              {/* Copyright and Micro Data */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-cream-muted gap-4">
                <div>© 2025 GraphIQ Enterprise Systems. Mocha &amp; Butter Editorial Canvas.</div>
                <div className="flex items-center gap-4">
                  <span className="text-butter">All Graph Clusters Operational</span>
                  <span>•</span>
                  <span>Node Cluster #AP-SOUTH-1</span>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default LandingPage;
