'use client';

import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { AuthScreen } from './components/AuthScreen';
import { runCompareAlgorithms, runMonteCarlo } from './lib/api';

export default function Page() {
  const [view, setView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('graphiq_token');
    const storedUser = localStorage.getItem('graphiq_user');
    if (storedToken) {
      setToken(storedToken);
      setCurrentUser(storedUser ?? '');
    }
    setAuthReady(true);
  }, []);

  const handleLogin = (tok: string, uname: string) => {
    localStorage.setItem('graphiq_token', tok);
    localStorage.setItem('graphiq_user', uname);
    setToken(tok);
    setCurrentUser(uname);
  };

  const handleLogout = () => {
    localStorage.removeItem('graphiq_token');
    localStorage.removeItem('graphiq_user');
    setToken(null);
    setCurrentUser('');
  };

  if (view === 'landing') {
    return (
      <LandingPage
        onLaunchDashboard={() => {
          if (token) {
            setView('dashboard');
          } else {
            setView('auth');
          }
        }}
        onOpenAuth={() => setView('auth')}
        token={token}
        currentUser={currentUser}
      />
    );
  }

  if (view === 'auth' || !token) {
    return (
      <AuthScreen
        onLogin={(tok, usr) => {
          handleLogin(tok, usr);
          setView('dashboard');
        }}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  return (
    <DashboardView
      onBackToLanding={() => setView('landing')}
      onOpenAuth={() => setView('auth')}
      onLogout={() => {
        handleLogout();
        setView('landing');
      }}
      token={token}
      currentUser={currentUser || 'admin'}
      onRunParallel={async (b, n) => {
        if (!token) return;
        return await runCompareAlgorithms(token, b, n === 'all' ? null : n);
      }}
      onRunMonteCarlo={async (s) => {
        if (!token) return;
        return await runMonteCarlo(
          token,
          ['user_0', 'user_1', 'user_356', 'user_3', 'user_3524'],
          s
        );
      }}
    />
  );
}
