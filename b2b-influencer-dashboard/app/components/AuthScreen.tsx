'use client';

import React, { useState } from 'react';
import { WarpFieldBackground } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import { loginUser, registerUser } from '../lib/api';

interface AuthScreenProps {
  onLogin: (token: string, username: string) => void;
  onBackToLanding: () => void;
}

export function AuthScreen({
  onLogin,
  onBackToLanding,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    if (newMode === 'signup' && username === 'admin') {
      setUsername('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Username cannot be empty.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      if (cleanUsername.length < 3) {
        setError('Username must be at least 3 characters long.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        setLoading(false);
        return;
      }

      try {
        const data = await registerUser(cleanUsername, password);
        if (data.access_token) {
          setSuccess(`Account created! Signing you in…`);
          setTimeout(() => onLogin(data.access_token, data.username || cleanUsername), 600);
        } else {
          setSuccess('Account created! You can now sign in.');
          switchMode('signin');
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const data = await loginUser(cleanUsername, password);
        onLogin(data.access_token, data.username);
      } catch (err: any) {
        setError(err.message || 'Login failed. Check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-mesh-bg min-h-screen flex flex-col justify-between relative overflow-x-hidden text-[#f4eedb] font-sans antialiased selection:bg-[#f3db7a] selection:text-[#0c0706]">
      {/* Architectural Grid Overlay */}
      <div className="fixed inset-0 auth-grid-lines pointer-events-none z-0" />

      {/* Ambient Top Lighting */}
      <div className="auth-ambient-glow" />

      {/* ThreeUI WarpField — subtle ambient depth layer */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <WarpFieldBackground
          variant="letters"
          speed={8.0}
          streakOpacity={0.30}
          tileOpacity={0.60}
          fov={75}
          hue={35}
          saturation={1.1}
          brightness={0.85}
        />
      </div>

      {/* ── TOP HEADER ── */}
      <header className="relative z-10 w-full border-b border-[#f4eedb]/10 backdrop-blur-md bg-[#0c0706]/60 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center space-x-3 group cursor-pointer"
            title="Return to Landing Page"
          >
            <div className="w-9 h-9 rounded-lg bg-[#221512] border border-[#f3db7a]/40 flex items-center justify-center shadow-inner group-hover:border-[#f7e396] transition-colors">
              <svg className="w-5 h-5 text-[#f7e396] transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M2 12h4l2.5-7 5 14 3-7h5.5" />
                <circle cx="8.5" cy="5" fill="#f3db7a" r="1.5" stroke="none" />
                <circle cx="13.5" cy="19" fill="#f3db7a" r="1.5" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display tracking-[0.25em] text-[#faf6ee] font-bold text-lg leading-none" style={{ fontFamily: '"Cinzel", serif' }}>
                GRAPHIQ
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#d0c2a5] uppercase mt-0.5">
                Predictive Intelligence
              </span>
            </div>
          </button>

          {/* Back link */}
          <button
            type="button"
            onClick={onBackToLanding}
            className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#d0c2a5] hover:text-[#f7e396] tracking-wider uppercase transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            <span>Return to Landing</span>
          </button>
        </div>
      </header>

      {/* ── MAIN AUTH CARD ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[420px]">
          {/* Luxury Card */}
          <div className="auth-card-luxury rounded-2xl auth-hairline-butter shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85),0_0_1px_1px_rgba(243,219,122,0.15)] p-6 sm:p-7 relative overflow-hidden">
            {/* Corner accent accoutrements */}
            <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
              <div className="absolute top-2.5 left-2.5 w-2 h-[1px] bg-[#f3db7a]/50" />
              <div className="absolute top-2.5 left-2.5 w-[1px] h-2 bg-[#f3db7a]/50" />
            </div>
            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
              <div className="absolute top-2.5 right-2.5 w-2 h-[1px] bg-[#f3db7a]/50" />
              <div className="absolute top-2.5 right-2.5 w-[1px] h-2 bg-[#f3db7a]/50" />
            </div>
            <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none">
              <div className="absolute bottom-2.5 left-2.5 w-2 h-[1px] bg-[#f3db7a]/30" />
              <div className="absolute bottom-2.5 left-2.5 w-[1px] h-2 bg-[#f3db7a]/30" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
              <div className="absolute bottom-2.5 right-2.5 w-2 h-[1px] bg-[#f3db7a]/30" />
              <div className="absolute bottom-2.5 right-2.5 w-[1px] h-2 bg-[#f3db7a]/30" />
            </div>

            {/* Card Header */}
            <div className="flex flex-col items-center text-center mb-5">
              {/* Glowing Crest Icon */}
              <div className="relative mb-3 group">
                <div className="absolute -inset-2 bg-[#f3db7a]/20 rounded-2xl blur-lg transition duration-500 group-hover:bg-[#f3db7a]/35" />
                <div className="relative w-11 h-11 rounded-xl bg-[#221512] border border-[#f3db7a]/60 shadow-inner flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#f7e396]" style={{ filter: 'drop-shadow(0 2px 8px rgba(243,219,122,0.4))' }} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M2.5 12.5L6 12.5L9 4.5L15 20.5L18 12.5L21.5 12.5" />
                    <circle cx="9" cy="4.5" fill="#f7e396" r="1.5" stroke="none" />
                    <circle cx="15" cy="20.5" fill="#f7e396" r="1.5" stroke="none" />
                  </svg>
                </div>
              </div>

              <span className="text-[10px] font-mono tracking-[0.28em] text-[#f3db7a] uppercase font-semibold">
                B2B Predictive Influencer Platform
              </span>
              <h1 className="text-2xl sm:text-[26px] text-[#faf6ee] font-semibold tracking-tight mt-1 mb-1 leading-tight" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-[11px] text-[#d0c2a5]/90 leading-relaxed max-w-xs">
                {mode === 'signin'
                  ? 'Enter your credentials to access the platform.'
                  : 'Register a new operator identity to access GraphIQ.'}
              </p>
            </div>

            {/* Mode Switcher: Segmented Control */}
            <div className="mb-5 p-1 bg-[#0c0706]/90 rounded-xl auth-hairline flex items-center shadow-inner" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => switchMode('signin')}
                className={`flex-1 py-1.5 text-[11px] font-mono tracking-wider font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  mode === 'signin'
                    ? 'bg-gradient-to-r from-[#f3db7a] to-[#f7e396] text-[#0c0706] shadow-md'
                    : 'text-[#d0c2a5] hover:text-[#faf6ee] font-medium'
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${mode === 'signin' ? 'text-[#0c0706]' : 'text-[#d0c2a5]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                </svg>
                <span>SIGN IN</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signup'}
                onClick={() => switchMode('signup')}
                className={`flex-1 py-1.5 text-[11px] font-mono tracking-wider font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#f3db7a] to-[#f7e396] text-[#0c0706] shadow-md'
                    : 'text-[#d0c2a5] hover:text-[#faf6ee] font-medium'
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${mode === 'signup' ? 'text-[#0c0706]' : 'text-[#d0c2a5]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>SIGN UP</span>
              </button>
            </div>

            {/* ── Auth Form ── */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-[#e7ddc4] uppercase tracking-widest font-medium flex items-center space-x-1.5" htmlFor="auth-username">
                  <span>Username</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d0c2a5] group-focus-within:text-[#f7e396] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="auth-luxury-input w-full pl-10 pr-3 py-2.5 text-xs font-mono text-[#faf6ee] rounded-xl auth-hairline placeholder-[#918063] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-[#e7ddc4] uppercase tracking-widest font-medium" htmlFor="auth-password">
                    Password {mode === 'signup' && <span className="text-[#f3db7a] normal-case tracking-normal">(min. 8 chars)</span>}
                  </label>
                  {mode === 'signin' && (
                    <span className="text-[11px] text-[#f3db7a] font-sans">Forgot password?</span>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d0c2a5] group-focus-within:text-[#f7e396] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signin' ? 'Enter your password' : 'Create a secure password'}
                    required
                    className="auth-luxury-input w-full pl-10 pr-11 py-2.5 text-xs font-mono text-[#faf6ee] rounded-xl auth-hairline placeholder-[#918063] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#918063] hover:text-[#e7ddc4] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 text-[#f7e396]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="font-mono text-[11px] text-[#e7ddc4] uppercase tracking-widest font-medium" htmlFor="auth-confirm">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d0c2a5] group-focus-within:text-[#f7e396] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                      </svg>
                    </div>
                    <input
                      id="auth-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      required
                      className="auth-luxury-input w-full pl-10 pr-11 py-2.5 text-xs font-mono text-[#faf6ee] rounded-xl auth-hairline placeholder-[#918063] focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Toggle confirm visibility"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#918063] hover:text-[#e7ddc4] transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {showConfirm ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        ) : (
                          <>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Error / Success messages */}
              {error && (
                <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/50 rounded-xl px-3.5 py-2.5 text-red-300 text-[11px] font-mono break-words">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-3.5 py-2.5 text-emerald-300 text-[11px] font-mono break-words">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* Primary Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#f3db7a] via-[#f7e396] to-[#f3db7a] text-[#140c0b] font-semibold font-sans tracking-wide text-xs uppercase shadow-[0_4px_24px_-2px_rgba(243,219,122,0.42),0_0_12px_rgba(243,219,122,0.25)] hover:brightness-105 hover:-translate-y-[1px] active:translate-y-0 active:brightness-95 transition-all flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="font-bold tracking-wider">
                        {mode === 'signin' ? 'Signing in…' : 'Registering…'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-[#140c0b] transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                      </svg>
                      <span className="font-bold tracking-wider">
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Below-card helper */}
          <div className="text-center mt-5">
            {mode === 'signin' ? (
              <p className="text-xs text-[#d0c2a5]">
                New user?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#f3db7a] hover:text-[#f7e396] font-medium underline underline-offset-4 transition-colors cursor-pointer">
                  Create an account →
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#d0c2a5]">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-[#f3db7a] hover:text-[#f7e396] font-medium underline underline-offset-4 transition-colors cursor-pointer">
                  Sign in →
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── BOTTOM TELEMETRY FOOTER ── */}
      <footer className="relative z-10 w-full border-t border-[#f4eedb]/10 bg-[#0c0706]/80 backdrop-blur-md px-6 lg:px-12 py-3 text-[11px] font-mono text-[#d0c2a5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-[#e7ddc4]">
              <svg className="w-3.5 h-3.5 text-[#f7e396]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="font-medium">TLS 1.3 / 256-BIT ENCRYPTED</span>
            </span>
            <span className="text-[#918063]">•</span>
            <span className="hidden md:inline text-[#918063]">ZERO-TRUST ENCLAVE</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f7e396] animate-pulse" />
              <span>CLUSTER: <strong className="text-[#e7ddc4] font-semibold">ONLINE (99.98%)</strong></span>
            </div>
            <span className="text-[#918063]">•</span>
            <span className="text-[#918063]">© 2026 GraphIQ Intelligence Ltd.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
