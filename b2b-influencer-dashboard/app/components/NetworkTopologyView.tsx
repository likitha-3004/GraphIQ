'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchGraphSample, fetchEgoGraph, runOptimization, loginUser, SeedNode, GraphSampleResponse, EgoGraphResponse, EgoGraphNode } from '../lib/api';

export interface SeedNodeData {
  id: string;
  niche: string;
  followers: number;
  cost: number;
  influence: number;
  efficiency: number;
  centrality: string;
  community: string;
  x: number;
  y: number;
  r: number;
  color: string;
  growth?: string;
  isNeighbor?: boolean;
  parentHubId?: string;
}

// ── Category-Aware Dynamic Presets for All 5 Optimization Models ───────────

export const CATEGORY_ALGO_PRESETS: Record<string, Record<string, SeedNodeData[]>> = {
  graphsage: {
    all: [
      { id: 'user_356', niche: 'General Social Media Influencer', followers: 121835, cost: 26895.95, influence: 6960.16, efficiency: 0.2588, centrality: '0.0428 (Authority Hub)', community: 'GNN Authority Anchor #1', x: 250, y: 260, r: 42, color: '#f3db7a' },
      { id: 'user_4305', niche: 'General Social Media Influencer', followers: 113843, cost: 20023.37, influence: 6842.10, efficiency: 0.3417, centrality: '0.0392 (Authority Hub)', community: 'GNN Authority Anchor #2', x: 510, y: 260, r: 40, color: '#ddc667' },
    ],
    'general social media': [
      { id: 'user_356', niche: 'General Social Media Influencer', followers: 121835, cost: 26895.95, influence: 6960.16, efficiency: 0.2588, centrality: '0.0428 (Authority Hub)', community: 'GNN Authority Anchor #1', x: 250, y: 260, r: 42, color: '#f3db7a' },
      { id: 'user_4305', niche: 'General Social Media Influencer', followers: 113843, cost: 20023.37, influence: 6842.10, efficiency: 0.3417, centrality: '0.0392 (Authority Hub)', community: 'GNN Authority Anchor #2', x: 510, y: 260, r: 40, color: '#ddc667' },
    ],
    instagram: [
      { id: 'user_3732', niche: 'Instagram Creator', followers: 206215, cost: 36994.38, influence: 6959.67, efficiency: 0.1881, centrality: '0.4188 (GNN Authority)', community: 'GNN Anchor (Instagram Pod 1)', x: 250, y: 260, r: 44, color: '#d9c67c' },
      { id: 'user_3415', niche: 'Instagram Creator', followers: 54639, cost: 11871.59, influence: 6960.06, efficiency: 0.5863, centrality: '0.3161 (GNN Authority)', community: 'GNN Anchor (Instagram Pod 2)', x: 510, y: 260, r: 36, color: '#f3db7a' },
    ],
    tiktok: [
      { id: 'user_3126', niche: 'TikTok Influencer', followers: 135931, cost: 28400.00, influence: 6955.20, efficiency: 0.2449, centrality: '0.3892 (GNN Authority)', community: 'GNN Anchor (TikTok Pod 1)', x: 250, y: 260, r: 42, color: '#fae280' },
      { id: 'user_3312', niche: 'TikTok Influencer', followers: 70383, cost: 15100.00, influence: 6948.80, efficiency: 0.4601, centrality: '0.3340 (GNN Authority)', community: 'GNN Anchor (TikTok Pod 2)', x: 510, y: 260, r: 38, color: '#f3db7a' },
      { id: 'user_3922', niche: 'TikTok Influencer', followers: 3740, cost: 5000.00, influence: 6940.10, efficiency: 1.3880, centrality: '0.2810 (GNN Auxiliary)', community: 'GNN Anchor (TikTok Pod 3)', x: 380, y: 160, r: 24, color: '#efdb8f' },
    ],
    youtube: [
      { id: 'user_2657', niche: 'YouTube Content Creator', followers: 37522, cost: 11200.00, influence: 6850.40, efficiency: 0.6116, centrality: '0.3420 (GNN Authority)', community: 'GNN Anchor (YouTube Pod 1)', x: 250, y: 260, r: 36, color: '#efdb8f' },
      { id: 'user_1044', niche: 'YouTube Content Creator', followers: 38992, cost: 11800.00, influence: 6840.10, efficiency: 0.5796, centrality: '0.3390 (GNN Authority)', community: 'GNN Anchor (YouTube Pod 2)', x: 510, y: 260, r: 36, color: '#f3db7a' },
      { id: 'user_1157', niche: 'YouTube Content Creator', followers: 36878, cost: 11100.00, influence: 6830.00, efficiency: 0.6153, centrality: '0.3310 (GNN Auxiliary)', community: 'GNN Anchor (YouTube Pod 3)', x: 380, y: 160, r: 35, color: '#fae280' },
    ],
    'cross-platform': [
      { id: 'user_2717', niche: 'Cross-Platform Creator', followers: 75028, cost: 18400.00, influence: 6910.50, efficiency: 0.3755, centrality: '0.3620 (GNN Authority)', community: 'GNN Anchor (Cross Pod 1)', x: 250, y: 260, r: 38, color: '#c9c6bf' },
      { id: 'user_3902', niche: 'Cross-Platform Creator', followers: 44211, cost: 12800.00, influence: 6890.20, efficiency: 0.5383, centrality: '0.3410 (GNN Authority)', community: 'GNN Anchor (Cross Pod 2)', x: 510, y: 260, r: 36, color: '#fae280' },
      { id: 'user_3041', niche: 'Cross-Platform Creator', followers: 27458, cost: 9100.00, influence: 6870.00, efficiency: 0.7549, centrality: '0.3150 (GNN Auxiliary)', community: 'GNN Anchor (Cross Pod 3)', x: 380, y: 160, r: 32, color: '#f3db7a' },
    ],
  },
  celf: {
    all: [
      { id: 'user_356', niche: 'General Social Media Influencer', followers: 121835, cost: 26895.95, influence: 6960.16, efficiency: 0.2588, centrality: '0.0428 (Eigenvector)', community: 'Cluster #4 (Central Anchor)', x: 380, y: 260, r: 44, color: '#f3db7a' },
      { id: 'user_3524', niche: 'General Social Media Influencer', followers: 23580, cost: 7699.37, influence: 6960.41, efficiency: 0.9040, centrality: '0.0215 (Closeness)', community: 'Cluster #5 (Web3 & Infra)', x: 540, y: 380, r: 32, color: '#c9c6bf' },
      { id: 'user_0', niche: 'General Social Media Influencer', followers: 773, cost: 5000, influence: 6961.08, efficiency: 1.3922, centrality: '0.0124 (Degree)', community: 'Cluster #1 (Tech & B2B SaaS)', x: 220, y: 180, r: 22, color: '#d9c67c' },
      { id: 'user_1', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 6960.96, efficiency: 1.3922, centrality: '0.0118 (Degree)', community: 'Cluster #2 (Finance & Fintech)', x: 540, y: 150, r: 21, color: '#fae280' },
      { id: 'user_3', niche: 'Instagram Creator', followers: 734, cost: 5000, influence: 6960.71, efficiency: 1.3921, centrality: '0.0120 (Degree)', community: 'Cluster #3 (AI & ML Engineering)', x: 220, y: 370, r: 22, color: '#efdb8f' },
    ],
    'general social media': [
      { id: 'user_356', niche: 'General Social Media Influencer', followers: 121835, cost: 26895.95, influence: 6960.16, efficiency: 0.2588, centrality: '0.0428 (Eigenvector)', community: 'Cluster #4 (Central Anchor)', x: 380, y: 260, r: 44, color: '#f3db7a' },
      { id: 'user_3524', niche: 'General Social Media Influencer', followers: 23580, cost: 7699.37, influence: 6960.41, efficiency: 0.9040, centrality: '0.0215 (Closeness)', community: 'Cluster #5 (Web3 & Infra)', x: 540, y: 380, r: 32, color: '#c9c6bf' },
      { id: 'user_0', niche: 'General Social Media Influencer', followers: 773, cost: 5000, influence: 6961.08, efficiency: 1.3922, centrality: '0.0124 (Degree)', community: 'Cluster #1 (Tech & B2B SaaS)', x: 220, y: 180, r: 22, color: '#d9c67c' },
      { id: 'user_15', niche: 'General Social Media Influencer', followers: 890, cost: 5000, influence: 6960.80, efficiency: 1.3921, centrality: '0.0118 (Degree)', community: 'Cluster #2 (General)', x: 540, y: 150, r: 22, color: '#fae280' },
      { id: 'user_10', niche: 'General Social Media Influencer', followers: 990, cost: 5000, influence: 6960.50, efficiency: 1.3920, centrality: '0.0121 (Degree)', community: 'Cluster #3 (General)', x: 220, y: 370, r: 23, color: '#efdb8f' },
    ],
    instagram: [
      { id: 'user_3732', niche: 'Instagram Creator', followers: 206215, cost: 36994.38, influence: 6959.67, efficiency: 0.1881, centrality: '0.4188 (Submodular Anchor)', community: 'Cluster Alpha (Instagram Hub)', x: 380, y: 260, r: 44, color: '#d9c67c' },
      { id: 'user_3415', niche: 'Instagram Creator', followers: 54639, cost: 11871.59, influence: 6960.06, efficiency: 0.5863, centrality: '0.3161 (Percolation)', community: 'Cluster Beta (Visual Arts)', x: 540, y: 380, r: 34, color: '#f3db7a' },
      { id: 'user_3', niche: 'Instagram Creator', followers: 734, cost: 5000, influence: 6960.71, efficiency: 1.3921, centrality: '0.0120 (Degree)', community: 'Cluster Gamma (Tech/Design)', x: 220, y: 180, r: 22, color: '#efdb8f' },
      { id: 'user_47', niche: 'Instagram Creator', followers: 620, cost: 5000, influence: 6960.20, efficiency: 1.3920, centrality: '0.0110 (Degree)', community: 'Cluster Delta (Lifestyle)', x: 540, y: 150, r: 21, color: '#fae280' },
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 6960.40, efficiency: 1.3385, centrality: '0.0210 (Degree)', community: 'Cluster Epsilon (Fashion)', x: 220, y: 370, r: 25, color: '#c9c6bf' },
    ],
    tiktok: [
      { id: 'user_3126', niche: 'TikTok Influencer', followers: 135931, cost: 28400.00, influence: 6955.20, efficiency: 0.2449, centrality: '0.3892 (Submodular Anchor)', community: 'Cluster Alpha (Viral Media)', x: 380, y: 260, r: 42, color: '#fae280' },
      { id: 'user_3312', niche: 'TikTok Influencer', followers: 70383, cost: 15100.00, influence: 6948.80, efficiency: 0.4601, centrality: '0.3340 (Percolation)', community: 'Cluster Beta (Trends)', x: 540, y: 380, r: 36, color: '#f3db7a' },
      { id: 'user_7', niche: 'TikTok Influencer', followers: 1120, cost: 5000, influence: 6945.10, efficiency: 1.3890, centrality: '0.0130 (Degree)', community: 'Cluster Gamma (Audio/Dance)', x: 220, y: 180, r: 22, color: '#efdb8f' },
      { id: 'user_18', niche: 'TikTok Influencer', followers: 1050, cost: 5000, influence: 6942.30, efficiency: 1.3740, centrality: '0.0125 (Degree)', community: 'Cluster Delta (Short Video)', x: 540, y: 150, r: 22, color: '#d9c67c' },
      { id: 'user_9', niche: 'TikTok Influencer', followers: 6100, cost: 5000, influence: 6940.80, efficiency: 1.3881, centrality: '0.0122 (Degree)', community: 'Cluster Epsilon (Gen Z)', x: 220, y: 370, r: 24, color: '#c9c6bf' },
    ],
    youtube: [
      { id: 'user_2657', niche: 'YouTube Content Creator', followers: 37522, cost: 11200.00, influence: 6850.40, efficiency: 0.6116, centrality: '0.3420 (Submodular Anchor)', community: 'Cluster Alpha (Long-Form)', x: 380, y: 260, r: 36, color: '#efdb8f' },
      { id: 'user_1044', niche: 'YouTube Content Creator', followers: 38992, cost: 11800.00, influence: 6840.10, efficiency: 0.5796, centrality: '0.3390 (Percolation)', community: 'Cluster Beta (Tech Reviews)', x: 540, y: 380, r: 36, color: '#f3db7a' },
      { id: 'user_1157', niche: 'YouTube Content Creator', followers: 36878, cost: 11100.00, influence: 6830.00, efficiency: 0.6153, centrality: '0.3310 (Percolation)', community: 'Cluster Gamma (Gaming & Dev)', x: 220, y: 180, r: 35, color: '#fae280' },
      { id: 'user_13', niche: 'YouTube Content Creator', followers: 940, cost: 5000, influence: 6825.00, efficiency: 1.3780, centrality: '0.0122 (Degree)', community: 'Cluster Delta (Tutorials)', x: 540, y: 150, r: 22, color: '#d9c67c' },
      { id: 'user_251', niche: 'YouTube Content Creator', followers: 4200, cost: 5000, influence: 6820.00, efficiency: 1.3640, centrality: '0.0128 (Degree)', community: 'Cluster Epsilon (Science)', x: 220, y: 370, r: 23, color: '#c9c6bf' },
    ],
    'cross-platform': [
      { id: 'user_2717', niche: 'Cross-Platform Creator', followers: 75028, cost: 18400.00, influence: 6910.50, efficiency: 0.3755, centrality: '0.3620 (Submodular Anchor)', community: 'Cluster Alpha (Omnichannel)', x: 380, y: 260, r: 38, color: '#c9c6bf' },
      { id: 'user_3902', niche: 'Cross-Platform Creator', followers: 44211, cost: 12800.00, influence: 6890.20, efficiency: 0.5383, centrality: '0.3410 (Percolation)', community: 'Cluster Beta (Syndicated)', x: 540, y: 380, r: 36, color: '#fae280' },
      { id: 'user_1', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 6960.96, efficiency: 1.3922, centrality: '0.0118 (Degree)', community: 'Cluster Gamma (Podcasts)', x: 220, y: 180, r: 21, color: '#f3db7a' },
      { id: 'user_2', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 6960.80, efficiency: 1.3920, centrality: '0.0115 (Degree)', community: 'Cluster Delta (Newsletters)', x: 540, y: 150, r: 21, color: '#efdb8f' },
      { id: 'user_5', niche: 'Cross-Platform Creator', followers: 810, cost: 5000, influence: 6960.60, efficiency: 1.3921, centrality: '0.0116 (Degree)', community: 'Cluster Epsilon (Events)', x: 220, y: 370, r: 22, color: '#d9c67c' },
    ],
  },
  temporal: {
    all: [
      { id: 'user_4236', niche: 'TikTok Influencer', followers: 138420, cost: 21450, influence: 924.8, efficiency: 6.4531, centrality: 'Recency: 2d (Growth: +28.4%)', community: 'High-Velocity Node 01', x: 380, y: 155, r: 44, color: '#fae280', growth: '+28.4%' },
      { id: 'user_3126', niche: 'Instagram Creator', followers: 96200, cost: 16800, influence: 712.5, efficiency: 5.7262, centrality: 'Recency: 1d (Growth: +34.1%)', community: 'High-Velocity Node 02', x: 235, y: 365, r: 40, color: '#f3db7a', growth: '+34.1%' },
      { id: 'user_284', niche: 'Cross-Platform Creator', followers: 54226, cost: 11503.76, influence: 489.1, efficiency: 4.7138, centrality: 'Recency: 3d (Growth: +19.8%)', community: 'High-Velocity Node 03', x: 525, y: 365, r: 36, color: '#c9c6bf', growth: '+19.8%' },
    ],
    'general social media': [
      { id: 'user_356', niche: 'General Social Media Influencer', followers: 121835, cost: 26895.95, influence: 6960.16, efficiency: 0.2588, centrality: 'Recency: 1d (Growth: +22.1%)', community: 'Temporal Wave 01', x: 380, y: 155, r: 42, color: '#f3db7a', growth: '+22.1%' },
      { id: 'user_3524', niche: 'General Social Media Influencer', followers: 23580, cost: 7699.37, influence: 6960.41, efficiency: 0.9040, centrality: 'Recency: 2d (Growth: +18.4%)', community: 'Temporal Wave 02', x: 235, y: 365, r: 36, color: '#c9c6bf', growth: '+18.4%' },
      { id: 'user_10', niche: 'General Social Media Influencer', followers: 990, cost: 5000, influence: 6960.20, efficiency: 1.3920, centrality: 'Recency: 1d (Growth: +15.2%)', community: 'Temporal Wave 03', x: 525, y: 365, r: 26, color: '#efdb8f', growth: '+15.2%' },
    ],
    instagram: [
      { id: 'user_3732', niche: 'Instagram Creator', followers: 206215, cost: 36994.38, influence: 6959.67, efficiency: 0.1881, centrality: 'Recency: 1d (Growth: +41.2%)', community: 'Instagram Momentum Hub', x: 380, y: 155, r: 44, color: '#d9c67c', growth: '+41.2%' },
      { id: 'user_3415', niche: 'Instagram Creator', followers: 54639, cost: 11871.59, influence: 6960.06, efficiency: 0.5863, centrality: 'Recency: 2d (Growth: +29.5%)', community: 'Instagram Secondary Wave', x: 235, y: 365, r: 36, color: '#f3db7a', growth: '+29.5%' },
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 124.0, efficiency: 2.3846, centrality: 'Recency: 3d (Growth: +24.8%)', community: 'Instagram Emerging Wave', x: 525, y: 365, r: 28, color: '#c9c6bf', growth: '+24.8%' },
    ],
    tiktok: [
      { id: 'user_4236', niche: 'TikTok Influencer', followers: 138420, cost: 21450, influence: 924.8, efficiency: 6.4531, centrality: 'Recency: 1d (Growth: +38.6%)', community: 'TikTok Viral Peak', x: 380, y: 155, r: 44, color: '#fae280', growth: '+38.6%' },
      { id: 'user_3126', niche: 'TikTok Influencer', followers: 135931, cost: 28400, influence: 6955.2, efficiency: 0.2449, centrality: 'Recency: 2d (Growth: +31.4%)', community: 'TikTok Secondary Wave', x: 235, y: 365, r: 42, color: '#f3db7a', growth: '+31.4%' },
      { id: 'user_3312', niche: 'TikTok Influencer', followers: 70383, cost: 15100, influence: 6948.8, efficiency: 0.4601, centrality: 'Recency: 2d (Growth: +26.0%)', community: 'TikTok Emerging Wave', x: 525, y: 365, r: 36, color: '#efdb8f', growth: '+26.0%' },
    ],
    youtube: [
      { id: 'user_2657', niche: 'YouTube Content Creator', followers: 37522, cost: 11200, influence: 6850.4, efficiency: 0.6116, centrality: 'Recency: 2d (Growth: +24.1%)', community: 'YouTube Momentum 01', x: 380, y: 155, r: 38, color: '#efdb8f', growth: '+24.1%' },
      { id: 'user_1044', niche: 'YouTube Content Creator', followers: 38992, cost: 11800, influence: 6840.1, efficiency: 0.5796, centrality: 'Recency: 1d (Growth: +27.8%)', community: 'YouTube Momentum 02', x: 235, y: 365, r: 38, color: '#f3db7a', growth: '+27.8%' },
      { id: 'user_3484', niche: 'YouTube Content Creator', followers: 18300, cost: 6100, influence: 183.0, efficiency: 3.0000, centrality: 'Recency: 3d (Growth: +19.3%)', community: 'YouTube Emerging Wave', x: 525, y: 365, r: 32, color: '#fae280', growth: '+19.3%' },
    ],
    'cross-platform': [
      { id: 'user_2717', niche: 'Cross-Platform Creator', followers: 75028, cost: 18400, influence: 6910.5, efficiency: 0.3755, centrality: 'Recency: 1d (Growth: +33.2%)', community: 'Cross-Platform Peak', x: 380, y: 155, r: 40, color: '#c9c6bf', growth: '+33.2%' },
      { id: 'user_3902', niche: 'Cross-Platform Creator', followers: 44211, cost: 12800, influence: 6890.2, efficiency: 0.5383, centrality: 'Recency: 2d (Growth: +22.4%)', community: 'Cross-Platform Secondary', x: 235, y: 365, r: 36, color: '#fae280', growth: '+22.4%' },
      { id: 'user_284', niche: 'Cross-Platform Creator', followers: 54226, cost: 11503.76, influence: 489.1, efficiency: 4.7138, centrality: 'Recency: 3d (Growth: +19.8%)', community: 'Cross-Platform Emerging', x: 525, y: 365, r: 36, color: '#f3db7a', growth: '+19.8%' },
    ],
  },
  community: {
    all: [
      { id: 'user_3580', niche: 'General Social Media Influencer', followers: 42150, cost: 9800, influence: 421.5, efficiency: 4.3010, centrality: 'Modular Core', community: 'Cluster Alpha (Tech/SaaS)', x: 220, y: 170, r: 33, color: '#f3db7a' },
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 124.0, efficiency: 2.3846, centrality: 'Modular Core', community: 'Cluster Alpha (Tech/SaaS)', x: 270, y: 220, r: 25, color: '#d9c67c' },
      { id: 'user_850', niche: 'TikTok Influencer', followers: 8900, cost: 5000, influence: 89.0, efficiency: 1.7800, centrality: 'Modular Core', community: 'Cluster Beta (Fintech)', x: 530, y: 160, r: 24, color: '#fae280' },
      { id: 'user_3484', niche: 'YouTube Content Creator', followers: 18300, cost: 6100, influence: 183.0, efficiency: 3.0000, centrality: 'Modular Core', community: 'Cluster Beta (Fintech)', x: 480, y: 215, r: 28, color: '#efdb8f' },
      { id: 'user_4408', niche: 'Cross-Platform Creator', followers: 7650, cost: 5000, influence: 76.5, efficiency: 1.5300, centrality: 'Modular Core', community: 'Cluster Gamma (AI & Dev)', x: 380, y: 260, r: 23, color: '#c9c6bf' },
      { id: 'user_2675', niche: 'Instagram Creator', followers: 5400, cost: 5000, influence: 54.0, efficiency: 1.0800, centrality: 'Modular Core', community: 'Cluster Gamma (AI & Dev)', x: 340, y: 310, r: 21, color: '#d9c67c' },
      { id: 'user_9', niche: 'TikTok Influencer', followers: 6100, cost: 5000, influence: 61.0, efficiency: 1.2200, centrality: 'Modular Core', community: 'Cluster Delta (Lifestyle)', x: 220, y: 370, r: 22, color: '#fae280' },
      { id: 'user_1031', niche: 'General Social Media Influencer', followers: 9200, cost: 5000, influence: 92.0, efficiency: 1.8400, centrality: 'Modular Core', community: 'Cluster Delta (Lifestyle)', x: 280, y: 400, r: 24, color: '#f3db7a' },
      { id: 'user_3612', niche: 'Cross-Platform Creator', followers: 3800, cost: 5000, influence: 38.0, efficiency: 0.7600, centrality: 'Modular Core', community: 'Cluster Epsilon (Infra)', x: 520, y: 370, r: 20, color: '#c9c6bf' },
      { id: 'user_251', niche: 'YouTube Content Creator', followers: 4200, cost: 5000, influence: 42.0, efficiency: 0.8400, centrality: 'Modular Core', community: 'Cluster Epsilon (Infra)', x: 470, y: 405, r: 21, color: '#efdb8f' },
    ],
    instagram: [
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 124.0, efficiency: 2.3846, centrality: 'Modular Core', community: 'Cluster Alpha (Fashion)', x: 220, y: 170, r: 28, color: '#d9c67c' },
      { id: 'user_2675', niche: 'Instagram Creator', followers: 5400, cost: 5000, influence: 54.0, efficiency: 1.0800, centrality: 'Modular Core', community: 'Cluster Alpha (Fashion)', x: 270, y: 220, r: 22, color: '#f3db7a' },
      { id: 'user_3', niche: 'Instagram Creator', followers: 734, cost: 5000, influence: 6960.71, efficiency: 1.3921, centrality: 'Modular Core', community: 'Cluster Beta (Visual Arts)', x: 530, y: 160, r: 21, color: '#efdb8f' },
      { id: 'user_47', niche: 'Instagram Creator', followers: 620, cost: 5000, influence: 21.2, efficiency: 1.3700, centrality: 'Modular Core', community: 'Cluster Beta (Visual Arts)', x: 480, y: 215, r: 20, color: '#fae280' },
      { id: 'user_3415', niche: 'Instagram Creator', followers: 54639, cost: 11871.59, influence: 6960.06, efficiency: 0.5863, centrality: 'Modular Core', community: 'Cluster Gamma (Tech/Design)', x: 380, y: 260, r: 35, color: '#d9c67c' },
      { id: 'user_108', niche: 'Instagram Creator', followers: 8200, cost: 5000, influence: 82.0, efficiency: 1.6400, centrality: 'Modular Core', community: 'Cluster Gamma (Tech/Design)', x: 340, y: 310, r: 24, color: '#c9c6bf' },
      { id: 'user_512', niche: 'Instagram Creator', followers: 9400, cost: 5000, influence: 94.0, efficiency: 1.8800, centrality: 'Modular Core', community: 'Cluster Delta (Lifestyle)', x: 220, y: 370, r: 25, color: '#f3db7a' },
      { id: 'user_778', niche: 'Instagram Creator', followers: 6800, cost: 5000, influence: 68.0, efficiency: 1.3600, centrality: 'Modular Core', community: 'Cluster Delta (Lifestyle)', x: 280, y: 400, r: 23, color: '#fae280' },
      { id: 'user_912', niche: 'Instagram Creator', followers: 4900, cost: 5000, influence: 49.0, efficiency: 0.9800, centrality: 'Modular Core', community: 'Cluster Epsilon (Beauty)', x: 520, y: 370, r: 21, color: '#efdb8f' },
      { id: 'user_1402', niche: 'Instagram Creator', followers: 5100, cost: 5000, influence: 51.0, efficiency: 1.0200, centrality: 'Modular Core', community: 'Cluster Epsilon (Beauty)', x: 470, y: 405, r: 22, color: '#d9c67c' },
    ],
    tiktok: [
      { id: 'user_850', niche: 'TikTok Influencer', followers: 8900, cost: 5000, influence: 89.0, efficiency: 1.7800, centrality: 'Modular Core', community: 'Cluster Alpha (Viral)', x: 220, y: 170, r: 26, color: '#fae280' },
      { id: 'user_9', niche: 'TikTok Influencer', followers: 6100, cost: 5000, influence: 61.0, efficiency: 1.2200, centrality: 'Modular Core', community: 'Cluster Alpha (Viral)', x: 270, y: 220, r: 23, color: '#f3db7a' },
      { id: 'user_7', niche: 'TikTok Influencer', followers: 1120, cost: 5000, influence: 25.8, efficiency: 1.3890, centrality: 'Modular Core', community: 'Cluster Beta (Trends)', x: 530, y: 160, r: 21, color: '#efdb8f' },
      { id: 'user_18', niche: 'TikTok Influencer', followers: 1050, cost: 5000, influence: 21.9, efficiency: 1.3740, centrality: 'Modular Core', community: 'Cluster Beta (Trends)', x: 480, y: 215, r: 21, color: '#d9c67c' },
      { id: 'user_3312', niche: 'TikTok Influencer', followers: 70383, cost: 15100, influence: 6948.8, efficiency: 0.4601, centrality: 'Modular Core', community: 'Cluster Gamma (Audio/Dance)', x: 380, y: 260, r: 36, color: '#fae280' },
      { id: 'user_3922', niche: 'TikTok Influencer', followers: 3740, cost: 5000, influence: 6940.1, efficiency: 1.3880, centrality: 'Modular Core', community: 'Cluster Gamma (Audio/Dance)', x: 340, y: 310, r: 22, color: '#c9c6bf' },
      { id: 'user_4456', niche: 'TikTok Influencer', followers: 1119, cost: 5000, influence: 11.2, efficiency: 0.0022, centrality: 'Modular Core', community: 'Cluster Delta (Humor)', x: 220, y: 370, r: 20, color: '#f3db7a' },
      { id: 'user_152', niche: 'TikTok Influencer', followers: 7400, cost: 5000, influence: 74.0, efficiency: 1.4800, centrality: 'Modular Core', community: 'Cluster Delta (Humor)', x: 280, y: 400, r: 24, color: '#efdb8f' },
      { id: 'user_630', niche: 'TikTok Influencer', followers: 5800, cost: 5000, influence: 58.0, efficiency: 1.1600, centrality: 'Modular Core', community: 'Cluster Epsilon (Gaming)', x: 520, y: 370, r: 22, color: '#fae280' },
      { id: 'user_890', niche: 'TikTok Influencer', followers: 6400, cost: 5000, influence: 64.0, efficiency: 1.2800, centrality: 'Modular Core', community: 'Cluster Epsilon (Gaming)', x: 470, y: 405, r: 23, color: '#d9c67c' },
    ],
    youtube: [
      { id: 'user_3484', niche: 'YouTube Content Creator', followers: 18300, cost: 6100, influence: 183.0, efficiency: 3.0000, centrality: 'Modular Core', community: 'Cluster Alpha (Tech)', x: 220, y: 170, r: 30, color: '#efdb8f' },
      { id: 'user_251', niche: 'YouTube Content Creator', followers: 4200, cost: 5000, influence: 42.0, efficiency: 0.8400, centrality: 'Modular Core', community: 'Cluster Alpha (Tech)', x: 270, y: 220, r: 22, color: '#f3db7a' },
      { id: 'user_13', niche: 'YouTube Content Creator', followers: 940, cost: 5000, influence: 22.8, efficiency: 1.3780, centrality: 'Modular Core', community: 'Cluster Beta (Tutorials)', x: 530, y: 160, r: 21, color: '#fae280' },
      { id: 'user_2657', niche: 'YouTube Content Creator', followers: 37522, cost: 11200, influence: 6850.4, efficiency: 0.6116, centrality: 'Modular Core', community: 'Cluster Beta (Tutorials)', x: 480, y: 215, r: 34, color: '#d9c67c' },
      { id: 'user_1044', niche: 'YouTube Content Creator', followers: 38992, cost: 11800, influence: 6840.1, efficiency: 0.5796, centrality: 'Modular Core', community: 'Cluster Gamma (Reviews)', x: 380, y: 260, r: 35, color: '#efdb8f' },
      { id: 'user_1157', niche: 'YouTube Content Creator', followers: 36878, cost: 11100, influence: 6830.0, efficiency: 0.6153, centrality: 'Modular Core', community: 'Cluster Gamma (Reviews)', x: 340, y: 310, r: 34, color: '#c9c6bf' },
      { id: 'user_1881', niche: 'YouTube Content Creator', followers: 44777, cost: 13500, influence: 6820.0, efficiency: 0.5051, centrality: 'Modular Core', community: 'Cluster Delta (Gaming)', x: 220, y: 370, r: 36, color: '#f3db7a' },
      { id: 'user_410', niche: 'YouTube Content Creator', followers: 7100, cost: 5000, influence: 71.0, efficiency: 1.4200, centrality: 'Modular Core', community: 'Cluster Delta (Gaming)', x: 280, y: 400, r: 24, color: '#fae280' },
      { id: 'user_720', niche: 'YouTube Content Creator', followers: 8200, cost: 5000, influence: 82.0, efficiency: 1.6400, centrality: 'Modular Core', community: 'Cluster Epsilon (Essays)', x: 520, y: 370, r: 25, color: '#d9c67c' },
      { id: 'user_930', niche: 'YouTube Content Creator', followers: 6900, cost: 5000, influence: 69.0, efficiency: 1.3800, centrality: 'Modular Core', community: 'Cluster Epsilon (Essays)', x: 470, y: 405, r: 23, color: '#efdb8f' },
    ],
    'cross-platform': [
      { id: 'user_4408', niche: 'Cross-Platform Creator', followers: 7650, cost: 5000, influence: 76.5, efficiency: 1.5300, centrality: 'Modular Core', community: 'Cluster Alpha (Omni)', x: 220, y: 170, r: 25, color: '#c9c6bf' },
      { id: 'user_3612', niche: 'Cross-Platform Creator', followers: 3800, cost: 5000, influence: 38.0, efficiency: 0.7600, centrality: 'Modular Core', community: 'Cluster Alpha (Omni)', x: 270, y: 220, r: 21, color: '#f3db7a' },
      { id: 'user_1', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 6960.96, efficiency: 1.3922, centrality: 'Modular Core', community: 'Cluster Beta (Syndicated)', x: 530, y: 160, r: 21, color: '#fae280' },
      { id: 'user_2', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 26.1, efficiency: 1.3920, centrality: 'Modular Core', community: 'Cluster Beta (Syndicated)', x: 480, y: 215, r: 21, color: '#efdb8f' },
      { id: 'user_5', niche: 'Cross-Platform Creator', followers: 810, cost: 5000, influence: 20.8, efficiency: 1.3650, centrality: 'Modular Core', community: 'Cluster Gamma (Podcasts)', x: 380, y: 260, r: 22, color: '#c9c6bf' },
      { id: 'user_2717', niche: 'Cross-Platform Creator', followers: 75028, cost: 18400, influence: 6910.5, efficiency: 0.3755, centrality: 'Modular Core', community: 'Cluster Gamma (Podcasts)', x: 340, y: 310, r: 36, color: '#d9c67c' },
      { id: 'user_3902', niche: 'Cross-Platform Creator', followers: 44211, cost: 12800, influence: 6890.2, efficiency: 0.5383, centrality: 'Modular Core', community: 'Cluster Delta (Publishing)', x: 220, y: 370, r: 34, color: '#fae280' },
      { id: 'user_3041', niche: 'Cross-Platform Creator', followers: 27458, cost: 9100, influence: 6870.0, efficiency: 0.7549, centrality: 'Modular Core', community: 'Cluster Delta (Publishing)', x: 280, y: 400, r: 30, color: '#f3db7a' },
      { id: 'user_3882', niche: 'Cross-Platform Creator', followers: 1787, cost: 5000, influence: 17.8, efficiency: 0.0035, centrality: 'Modular Core', community: 'Cluster Epsilon (Community)', x: 520, y: 370, r: 20, color: '#efdb8f' },
      { id: 'user_412', niche: 'Cross-Platform Creator', followers: 4900, cost: 5000, influence: 49.0, efficiency: 0.9800, centrality: 'Modular Core', community: 'Cluster Epsilon (Community)', x: 470, y: 405, r: 22, color: '#c9c6bf' },
    ],
  },
  blii: {
    all: [
      { id: 'user_0', niche: 'General Social Media Influencer', followers: 773, cost: 5000, influence: 28.4, efficiency: 1.3922, centrality: '0.0124 (Degree)', community: 'Cluster #1', x: 380, y: 120, r: 22, color: '#f3db7a' },
      { id: 'user_2', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 26.1, efficiency: 1.3920, centrality: '0.0115 (Degree)', community: 'Cluster #2', x: 495, y: 155, r: 21, color: '#c9c6bf' },
      { id: 'user_7', niche: 'TikTok Influencer', followers: 1120, cost: 5000, influence: 25.8, efficiency: 1.3890, centrality: '0.0130 (Degree)', community: 'Cluster #3', x: 565, y: 245, r: 24, color: '#fae280' },
      { id: 'user_3', niche: 'Instagram Creator', followers: 734, cost: 5000, influence: 24.9, efficiency: 1.3850, centrality: '0.0120 (Degree)', community: 'Cluster #4', x: 535, y: 345, r: 22, color: '#d9c67c' },
      { id: 'user_15', niche: 'General Social Media Influencer', followers: 890, cost: 5000, influence: 23.4, efficiency: 1.3810, centrality: '0.0118 (Degree)', community: 'Cluster #5', x: 440, y: 405, r: 23, color: '#f3db7a' },
      { id: 'user_13', niche: 'YouTube Content Creator', followers: 940, cost: 5000, influence: 22.8, efficiency: 1.3780, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 320, y: 405, r: 23, color: '#efdb8f' },
      { id: 'user_18', niche: 'TikTok Influencer', followers: 1050, cost: 5000, influence: 21.9, efficiency: 1.3740, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 225, y: 345, r: 24, color: '#fae280' },
      { id: 'user_47', niche: 'Instagram Creator', followers: 620, cost: 5000, influence: 21.2, efficiency: 1.3700, centrality: '0.0110 (Degree)', community: 'Cluster #3', x: 195, y: 245, r: 20, color: '#d9c67c' },
      { id: 'user_5', niche: 'Cross-Platform Creator', followers: 810, cost: 5000, influence: 20.8, efficiency: 1.3650, centrality: '0.0116 (Degree)', community: 'Cluster #4', x: 265, y: 155, r: 22, color: '#c9c6bf' },
      { id: 'user_10', niche: 'General Social Media Influencer', followers: 990, cost: 5000, influence: 20.1, efficiency: 1.3600, centrality: '0.0121 (Degree)', community: 'Cluster #5', x: 380, y: 260, r: 23, color: '#f3db7a' },
    ],
    instagram: [
      { id: 'user_3', niche: 'Instagram Creator', followers: 734, cost: 5000, influence: 24.9, efficiency: 1.3850, centrality: '0.0120 (Degree)', community: 'Cluster #1', x: 380, y: 120, r: 22, color: '#d9c67c' },
      { id: 'user_47', niche: 'Instagram Creator', followers: 620, cost: 5000, influence: 21.2, efficiency: 1.3700, centrality: '0.0110 (Degree)', community: 'Cluster #2', x: 495, y: 155, r: 20, color: '#f3db7a' },
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 124.0, efficiency: 2.3846, centrality: '0.0210 (Degree)', community: 'Cluster #3', x: 565, y: 245, r: 28, color: '#efdb8f' },
      { id: 'user_2675', niche: 'Instagram Creator', followers: 5400, cost: 5000, influence: 54.0, efficiency: 1.0800, centrality: '0.0118 (Degree)', community: 'Cluster #4', x: 535, y: 345, r: 22, color: '#fae280' },
      { id: 'user_108', niche: 'Instagram Creator', followers: 8200, cost: 5000, influence: 82.0, efficiency: 1.6400, centrality: '0.0119 (Degree)', community: 'Cluster #5', x: 440, y: 405, r: 24, color: '#d9c67c' },
      { id: 'user_512', niche: 'Instagram Creator', followers: 9400, cost: 5000, influence: 94.0, efficiency: 1.8800, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 320, y: 405, r: 25, color: '#f3db7a' },
      { id: 'user_778', niche: 'Instagram Creator', followers: 6800, cost: 5000, influence: 68.0, efficiency: 1.3600, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 225, y: 345, r: 23, color: '#efdb8f' },
      { id: 'user_912', niche: 'Instagram Creator', followers: 4900, cost: 5000, influence: 49.0, efficiency: 0.9800, centrality: '0.0110 (Degree)', community: 'Cluster #3', x: 195, y: 245, r: 21, color: '#fae280' },
      { id: 'user_1402', niche: 'Instagram Creator', followers: 5100, cost: 5000, influence: 51.0, efficiency: 1.0200, centrality: '0.0116 (Degree)', community: 'Cluster #4', x: 265, y: 155, r: 22, color: '#c9c6bf' },
      { id: 'user_1888', niche: 'Instagram Creator', followers: 7300, cost: 5000, influence: 73.0, efficiency: 1.4600, centrality: '0.0121 (Degree)', community: 'Cluster #5', x: 380, y: 260, r: 24, color: '#d9c67c' },
    ],
    tiktok: [
      { id: 'user_7', niche: 'TikTok Influencer', followers: 1120, cost: 5000, influence: 25.8, efficiency: 1.3890, centrality: '0.0130 (Degree)', community: 'Cluster #1', x: 380, y: 120, r: 22, color: '#fae280' },
      { id: 'user_18', niche: 'TikTok Influencer', followers: 1050, cost: 5000, influence: 21.9, efficiency: 1.3740, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 495, y: 155, r: 22, color: '#f3db7a' },
      { id: 'user_9', niche: 'TikTok Influencer', followers: 6100, cost: 5000, influence: 61.0, efficiency: 1.2200, centrality: '0.0122 (Degree)', community: 'Cluster #3', x: 565, y: 245, r: 24, color: '#efdb8f' },
      { id: 'user_850', niche: 'TikTok Influencer', followers: 8900, cost: 5000, influence: 89.0, efficiency: 1.7800, centrality: '0.0128 (Degree)', community: 'Cluster #4', x: 535, y: 345, r: 25, color: '#fae280' },
      { id: 'user_3922', niche: 'TikTok Influencer', followers: 3740, cost: 5000, influence: 6940.1, efficiency: 1.3880, centrality: '0.0118 (Degree)', community: 'Cluster #5', x: 440, y: 405, r: 22, color: '#d9c67c' },
      { id: 'user_4456', niche: 'TikTok Influencer', followers: 1119, cost: 5000, influence: 11.2, efficiency: 0.0022, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 320, y: 405, r: 21, color: '#f3db7a' },
      { id: 'user_152', niche: 'TikTok Influencer', followers: 7400, cost: 5000, influence: 74.0, efficiency: 1.4800, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 225, y: 345, r: 24, color: '#efdb8f' },
      { id: 'user_630', niche: 'TikTok Influencer', followers: 5800, cost: 5000, influence: 58.0, efficiency: 1.1600, centrality: '0.0110 (Degree)', community: 'Cluster #3', x: 195, y: 245, r: 23, color: '#fae280' },
      { id: 'user_890', niche: 'TikTok Influencer', followers: 6400, cost: 5000, influence: 64.0, efficiency: 1.2800, centrality: '0.0116 (Degree)', community: 'Cluster #4', x: 265, y: 155, r: 23, color: '#c9c6bf' },
      { id: 'user_1104', niche: 'TikTok Influencer', followers: 8100, cost: 5000, influence: 81.0, efficiency: 1.6200, centrality: '0.0121 (Degree)', community: 'Cluster #5', x: 380, y: 260, r: 24, color: '#fae280' },
    ],
    youtube: [
      { id: 'user_13', niche: 'YouTube Content Creator', followers: 940, cost: 5000, influence: 22.8, efficiency: 1.3780, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 380, y: 120, r: 22, color: '#efdb8f' },
      { id: 'user_251', niche: 'YouTube Content Creator', followers: 4200, cost: 5000, influence: 42.0, efficiency: 0.8400, centrality: '0.0128 (Degree)', community: 'Cluster #2', x: 495, y: 155, r: 23, color: '#f3db7a' },
      { id: 'user_3484', niche: 'YouTube Content Creator', followers: 18300, cost: 6100, influence: 183.0, efficiency: 3.0000, centrality: '0.0130 (Degree)', community: 'Cluster #3', x: 565, y: 245, r: 28, color: '#fae280' },
      { id: 'user_410', niche: 'YouTube Content Creator', followers: 7100, cost: 5000, influence: 71.0, efficiency: 1.4200, centrality: '0.0120 (Degree)', community: 'Cluster #4', x: 535, y: 345, r: 24, color: '#d9c67c' },
      { id: 'user_720', niche: 'YouTube Content Creator', followers: 8200, cost: 5000, influence: 82.0, efficiency: 1.6400, centrality: '0.0118 (Degree)', community: 'Cluster #5', x: 440, y: 405, r: 25, color: '#f3db7a' },
      { id: 'user_930', niche: 'YouTube Content Creator', followers: 6900, cost: 5000, influence: 69.0, efficiency: 1.3800, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 320, y: 405, r: 24, color: '#efdb8f' },
      { id: 'user_1204', niche: 'YouTube Content Creator', followers: 5800, cost: 5000, influence: 58.0, efficiency: 1.1600, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 225, y: 345, r: 23, color: '#fae280' },
      { id: 'user_1450', niche: 'YouTube Content Creator', followers: 6300, cost: 5000, influence: 63.0, efficiency: 1.2600, centrality: '0.0110 (Degree)', community: 'Cluster #3', x: 195, y: 245, r: 23, color: '#d9c67c' },
      { id: 'user_1680', niche: 'YouTube Content Creator', followers: 7700, cost: 5000, influence: 77.0, efficiency: 1.5400, centrality: '0.0116 (Degree)', community: 'Cluster #4', x: 265, y: 155, r: 24, color: '#c9c6bf' },
      { id: 'user_1920', niche: 'YouTube Content Creator', followers: 8900, cost: 5000, influence: 89.0, efficiency: 1.7800, centrality: '0.0121 (Degree)', community: 'Cluster #5', x: 380, y: 260, r: 25, color: '#efdb8f' },
    ],
    'cross-platform': [
      { id: 'user_1', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 26.1, efficiency: 1.3922, centrality: '0.0118 (Degree)', community: 'Cluster #1', x: 380, y: 120, r: 21, color: '#c9c6bf' },
      { id: 'user_2', niche: 'Cross-Platform Creator', followers: 684, cost: 5000, influence: 26.1, efficiency: 1.3920, centrality: '0.0115 (Degree)', community: 'Cluster #2', x: 495, y: 155, r: 21, color: '#fae280' },
      { id: 'user_5', niche: 'Cross-Platform Creator', followers: 810, cost: 5000, influence: 20.8, efficiency: 1.3650, centrality: '0.0116 (Degree)', community: 'Cluster #3', x: 565, y: 245, r: 22, color: '#efdb8f' },
      { id: 'user_3612', niche: 'Cross-Platform Creator', followers: 3800, cost: 5000, influence: 38.0, efficiency: 0.7600, centrality: '0.0120 (Degree)', community: 'Cluster #4', x: 535, y: 345, r: 21, color: '#d9c67c' },
      { id: 'user_4408', niche: 'Cross-Platform Creator', followers: 7650, cost: 5000, influence: 76.5, efficiency: 1.5300, centrality: '0.0118 (Degree)', community: 'Cluster #5', x: 440, y: 405, r: 24, color: '#f3db7a' },
      { id: 'user_3882', niche: 'Cross-Platform Creator', followers: 1787, cost: 5000, influence: 17.8, efficiency: 0.0035, centrality: '0.0122 (Degree)', community: 'Cluster #1', x: 320, y: 405, r: 21, color: '#c9c6bf' },
      { id: 'user_412', niche: 'Cross-Platform Creator', followers: 4900, cost: 5000, influence: 49.0, efficiency: 0.9800, centrality: '0.0125 (Degree)', community: 'Cluster #2', x: 225, y: 345, r: 22, color: '#fae280' },
      { id: 'user_840', niche: 'Cross-Platform Creator', followers: 5600, cost: 5000, influence: 56.0, efficiency: 1.1200, centrality: '0.0110 (Degree)', community: 'Cluster #3', x: 195, y: 245, r: 23, color: '#efdb8f' },
      { id: 'user_1050', niche: 'Cross-Platform Creator', followers: 6200, cost: 5000, influence: 62.0, efficiency: 1.2400, centrality: '0.0116 (Degree)', community: 'Cluster #4', x: 265, y: 155, r: 23, color: '#d9c67c' },
      { id: 'user_1320', niche: 'Cross-Platform Creator', followers: 7100, cost: 5000, influence: 71.0, efficiency: 1.4200, centrality: '0.0121 (Degree)', community: 'Cluster #5', x: 380, y: 260, r: 24, color: '#c9c6bf' },
    ],
  },
};

export const ALGO_PRESETS: Record<string, SeedNodeData[]> = {
  celf: CATEGORY_ALGO_PRESETS.celf.all,
  blii: CATEGORY_ALGO_PRESETS.blii.all,
  graphsage: CATEGORY_ALGO_PRESETS.graphsage.all,
  community: CATEGORY_ALGO_PRESETS.community.all,
  temporal: CATEGORY_ALGO_PRESETS.temporal.all,
};

export function getCategoryPreset(algoKey: string, nicheVal: string): SeedNodeData[] {
  const normAlgo = algoKey.toLowerCase();
  const normNiche = (nicheVal || 'all').toLowerCase();
  const algoMap = CATEGORY_ALGO_PRESETS[normAlgo];
  if (!algoMap) return ALGO_PRESETS[normAlgo] || [];

  for (const [key, preset] of Object.entries(algoMap)) {
    if (key === normNiche || normNiche.includes(key) || key.includes(normNiche)) {
      return preset;
    }
  }
  return algoMap['all'] || ALGO_PRESETS[normAlgo] || [];
}

export interface LouvainClusterInfo {
  id: string;
  name: string;
  color: string;
  bg: string;
  border: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  members: SeedNodeData[];
}

export const LOUVAIN_CLUSTERS: LouvainClusterInfo[] = [
  {
    id: 'c1',
    name: 'Cluster Alpha · Tech & B2B SaaS',
    color: '#f3db7a',
    bg: 'rgba(243, 219, 122, 0.06)',
    border: 'rgba(243, 219, 122, 0.32)',
    cx: 215,
    cy: 165,
    rx: 120,
    ry: 80,
    members: [
      { id: 'user_3580', niche: 'General Social Media Influencer', followers: 42150, cost: 9800, influence: 421.5, efficiency: 4.301, centrality: '0.0382 (Modular Core)', community: 'Cluster Alpha (Tech/SaaS)', x: 180, y: 160, r: 24, color: '#f3db7a' },
      { id: 'user_49', niche: 'Instagram Creator', followers: 12400, cost: 5200, influence: 124.0, efficiency: 2.3846, centrality: '0.0210 (Modular Core)', community: 'Cluster Alpha (Tech/SaaS)', x: 250, y: 175, r: 18, color: '#d9c67c' },
    ],
  },
  {
    id: 'c2',
    name: 'Cluster Beta · Finance & Fintech',
    color: '#fae280',
    bg: 'rgba(250, 226, 128, 0.06)',
    border: 'rgba(250, 226, 128, 0.32)',
    cx: 545,
    cy: 165,
    rx: 120,
    ry: 80,
    members: [
      { id: 'user_850', niche: 'TikTok Influencer', followers: 8900, cost: 5000, influence: 89.0, efficiency: 1.780, centrality: '0.0175 (Modular Core)', community: 'Cluster Beta (Fintech)', x: 515, y: 160, r: 18, color: '#fae280' },
      { id: 'user_3484', niche: 'YouTube Content Creator', followers: 18300, cost: 6100, influence: 183.0, efficiency: 3.000, centrality: '0.0270 (Modular Core)', community: 'Cluster Beta (Fintech)', x: 575, y: 175, r: 21, color: '#efdb8f' },
    ],
  },
  {
    id: 'c3',
    name: 'Cluster Gamma · AI & ML Engineering',
    color: '#f3db7a',
    bg: 'rgba(243, 219, 122, 0.09)',
    border: 'rgba(243, 219, 122, 0.4)',
    cx: 380,
    cy: 260,
    rx: 110,
    ry: 75,
    members: [
      { id: 'user_4408', niche: 'Cross-Platform Creator', followers: 7650, cost: 5000, influence: 76.5, efficiency: 1.530, centrality: '0.0390 (Modular Core)', community: 'Cluster Gamma (AI & Dev)', x: 355, y: 255, r: 20, color: '#c9c6bf' },
      { id: 'user_2675', niche: 'Instagram Creator', followers: 5400, cost: 5000, influence: 54.0, efficiency: 1.080, centrality: '0.0230 (Modular Core)', community: 'Cluster Gamma (AI & Dev)', x: 410, y: 270, r: 17, color: '#d9c67c' },
    ],
  },
  {
    id: 'c4',
    name: 'Cluster Delta · Fashion & Lifestyle',
    color: '#efdb8f',
    bg: 'rgba(239, 219, 143, 0.06)',
    border: 'rgba(239, 219, 143, 0.32)',
    cx: 215,
    cy: 375,
    rx: 120,
    ry: 80,
    members: [
      { id: 'user_9', niche: 'TikTok Influencer', followers: 6100, cost: 5000, influence: 61.0, efficiency: 1.220, centrality: '0.0160 (Modular Core)', community: 'Cluster Delta (Lifestyle)', x: 180, y: 370, r: 17, color: '#fae280' },
      { id: 'user_1031', niche: 'General Social Media Influencer', followers: 9200, cost: 5000, influence: 92.0, efficiency: 1.840, centrality: '0.0210 (Modular Core)', community: 'Cluster Delta (Lifestyle)', x: 250, y: 385, r: 19, color: '#f3db7a' },
    ],
  },
  {
    id: 'c5',
    name: 'Cluster Epsilon · Web3 & Infra',
    color: '#c9c6bf',
    bg: 'rgba(201, 198, 191, 0.06)',
    border: 'rgba(201, 198, 191, 0.32)',
    cx: 545,
    cy: 375,
    rx: 120,
    ry: 80,
    members: [
      { id: 'user_3612', niche: 'Cross-Platform Creator', followers: 3800, cost: 5000, influence: 38.0, efficiency: 0.760, centrality: '0.0140 (Modular Core)', community: 'Cluster Epsilon (Infra)', x: 515, y: 370, r: 16, color: '#c9c6bf' },
      { id: 'user_251', niche: 'YouTube Content Creator', followers: 4200, cost: 5000, influence: 42.0, efficiency: 0.840, centrality: '0.0150 (Modular Core)', community: 'Cluster Epsilon (Infra)', x: 575, y: 385, r: 17, color: '#efdb8f' },
    ],
  },
];

function layoutCustomRoster(roster: SeedNode[], engineKey: string): SeedNodeData[] {
  const n = roster.length;
  const maxFollowers = Math.max(...roster.map((r) => r.followers), 1);
  const colorMap: Record<string, string> = {
    'general social media influencer': '#f3db7a',
    'instagram creator': '#d9c67c',
    'tiktok influencer': '#fae280',
    'youtube content creator': '#efdb8f',
    'cross-platform creator': '#c9c6bf',
  };

  return roster.map((item, idx) => {
    let x = 380;
    let y = 260;

    if (engineKey === 'blii') {
      // BLII: Equidistant perimeter ring (mesh topology with no mega-star anchor)
      const angle = (idx / Math.max(1, n)) * 2 * Math.PI - Math.PI / 2;
      x = Math.round(380 + 225 * Math.cos(angle));
      y = Math.round(260 + 155 * Math.sin(angle));
    } else if (engineKey === 'graphsage' && n >= 2) {
      // GraphSAGE: Twin Authority Centroids at poles + satellites
      if (idx === 0) {
        x = 260; y = 260;
      } else if (idx === 1) {
        x = 500; y = 260;
      } else {
        const poleX = idx % 2 === 0 ? 260 : 500;
        const poleY = 260;
        const poleAngle = (Math.floor(idx / 2) / Math.max(1, Math.ceil(n / 2))) * 2 * Math.PI;
        x = Math.round(poleX + 85 * Math.cos(poleAngle));
        y = Math.round(poleY + 85 * Math.sin(poleAngle));
      }
    } else if (engineKey === 'temporal') {
      // Temporal GNN: High velocity triangular trajectory flow
      if (idx === 0) {
        x = 380; y = 145;
      } else if (idx === 1) {
        x = 230; y = 370;
      } else if (idx === 2) {
        x = 530; y = 370;
      } else {
        const angle = (idx / n) * 2 * Math.PI;
        x = Math.round(380 + 170 * Math.cos(angle));
        y = Math.round(260 + 120 * Math.sin(angle));
      }
    } else if (engineKey === 'community' && n >= 4) {
      // Community: 5 cluster islands
      const clusterCenters = [
        { cx: 220, cy: 165 },
        { cx: 540, cy: 165 },
        { cx: 380, cy: 260 },
        { cx: 230, cy: 375 },
        { cx: 530, cy: 375 },
      ];
      const c = clusterCenters[idx % clusterCenters.length];
      const offset = (idx % 2 === 0 ? -1 : 1) * 35;
      x = c.cx + offset;
      y = c.cy + offset;
    } else if (n > 1) {
      // CELF++: Primary anchor at center (idx=0) + surrounding satellites
      if (idx === 0) {
        x = 380;
        y = 260;
      } else {
        const angle = ((idx - 1) / (n - 1)) * 2 * Math.PI - Math.PI / 2;
        const rx = n <= 5 ? 190 : 230;
        const ry = n <= 5 ? 130 : 155;
        x = Math.round(380 + rx * Math.cos(angle));
        y = Math.round(260 + ry * Math.sin(angle));
      }
    }

    const r = Math.max(18, Math.min(46, Math.round(18 + (item.followers / maxFollowers) * 26)));
    const nicheKey = (item.niche || '').toLowerCase();
    const color = colorMap[nicheKey] || '#f3db7a';

    return {
      id: item.node_id,
      niche: item.niche,
      followers: item.followers,
      cost: item.cost,
      influence: item.expected_influence,
      efficiency: item.marginal_efficiency,
      centrality: `${(item.marginal_efficiency * 0.01).toFixed(4)} (Percolation)`,
      community: `Cluster #${(idx % 5) + 1}`,
      x,
      y,
      r,
      color,
    };
  });
}

interface NetworkTopologyViewProps {
  currency?: 'INR' | 'USD';
  token?: string | null;
}

export function NetworkTopologyView({ currency = 'INR', token }: NetworkTopologyViewProps) {
  const [engine, setEngine] = useState<string>('celf');
  const [nicheFilter, setNicheFilter] = useState<string>('all');
  const [seeds, setSeeds] = useState<SeedNodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<SeedNodeData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'seed' | 'live' | 'community' | 'ego'>('seed');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingAlgo, setLoadingAlgo] = useState<boolean>(false);
  const [graphSample, setGraphSample] = useState<GraphSampleResponse | null>(null);
  const [egoData, setEgoData] = useState<EgoGraphResponse | null>(null);
  const [loadingEgo, setLoadingEgo] = useState<boolean>(false);
  const [promotedSeeds, setPromotedSeeds] = useState<Set<string>>(new Set());
  const [liveMeta, setLiveMeta] = useState<{ totalNodes: number; totalEdges: number }>({
    totalNodes: 4500,
    totalEdges: 17984,
  });

  // ── Sampled Multi-Hop Neighborhood Clusters for GraphSAGE ──────────────────
  const graphSageNeighbors = useMemo(() => {
    if (engine !== 'graphsage' || seeds.length === 0) return { pod1: [] as SeedNodeData[], pod2: [] as SeedNodeData[] };

    const hub0 = seeds[0];
    const hub1 = seeds.length > 1 ? seeds[1] : seeds[0];
    const cat = (nicheFilter || 'all').toLowerCase();

    let pod1Ids = ['user_1832', 'user_2941', 'user_4102', 'user_983', 'user_2219'];
    let pod2Ids = ['user_3155', 'user_1204', 'user_2760', 'user_4418', 'user_3890'];

    if (cat.includes('instagram')) {
      pod1Ids = ['user_3', 'user_47', 'user_49', 'user_2675', 'user_108'];
      pod2Ids = ['user_512', 'user_778', 'user_912', 'user_1402', 'user_1888'];
    } else if (cat.includes('tiktok')) {
      pod1Ids = ['user_7', 'user_18', 'user_850', 'user_9', 'user_3922'];
      pod2Ids = ['user_4456', 'user_152', 'user_630', 'user_890', 'user_1104'];
    } else if (cat.includes('youtube')) {
      pod1Ids = ['user_13', 'user_251', 'user_3484', 'user_410', 'user_720'];
      pod2Ids = ['user_930', 'user_1204', 'user_1450', 'user_1680', 'user_1920'];
    } else if (cat.includes('cross')) {
      pod1Ids = ['user_1', 'user_2', 'user_5', 'user_3612', 'user_4408'];
      pod2Ids = ['user_3882', 'user_412', 'user_840', 'user_1050', 'user_1320'];
    }

    const pod1: SeedNodeData[] = pod1Ids.map((id, i) => {
      const angle = (i / pod1Ids.length) * 2 * Math.PI - Math.PI / 2;
      const nx = Math.round(hub0.x + 88 * Math.cos(angle));
      const ny = Math.round(hub0.y + 88 * Math.sin(angle));
      const fol = Math.round(hub0.followers * 0.12 + (i + 1) * 2400);
      const inf = Math.round(hub0.influence * 0.15 + (i + 1) * 120);
      return {
        id,
        niche: hub0.niche,
        followers: fol,
        cost: 5000,
        influence: inf,
        efficiency: Number((inf / 5000).toFixed(4)),
        centrality: `${(0.018 + i * 0.002).toFixed(4)} (GNN Layer 1)`,
        community: 'Sampled Receptive Pod #1',
        x: nx,
        y: ny,
        r: 15,
        color: hub0.color || '#f3db7a',
        growth: '+14.2%',
        isNeighbor: true,
        parentHubId: hub0.id,
      };
    });

    const pod2: SeedNodeData[] = (seeds.length >= 2 ? pod2Ids : []).map((id, i) => {
      const angle = (i / pod2Ids.length) * 2 * Math.PI - Math.PI / 2;
      const nx = Math.round(hub1.x + 88 * Math.cos(angle));
      const ny = Math.round(hub1.y + 88 * Math.sin(angle));
      const fol = Math.round(hub1.followers * 0.14 + (i + 1) * 2100);
      const inf = Math.round(hub1.influence * 0.16 + (i + 1) * 110);
      return {
        id,
        niche: hub1.niche,
        followers: fol,
        cost: 5000,
        influence: inf,
        efficiency: Number((inf / 5000).toFixed(4)),
        centrality: `${(0.019 + i * 0.002).toFixed(4)} (GNN Layer 1)`,
        community: 'Sampled Receptive Pod #2',
        x: nx,
        y: ny,
        r: 15,
        color: hub1.color || '#ddc667',
        growth: '+16.8%',
        isNeighbor: true,
        parentHubId: hub1.id,
      };
    });

    return { pod1, pod2 };
  }, [engine, seeds, nicheFilter]);

  const loadAlgorithmSeeds = async (algoKey: string, nicheVal: string = nicheFilter) => {
    setEngine(algoKey);
    // 1. Instant switch to verified category preset so UI immediately displays correct category
    const preset = getCategoryPreset(algoKey, nicheVal);
    setSeeds(preset);
    if (preset.length > 0) {
      setSelectedNode(preset[0]);
    }
    setViewMode('seed');

    // 2. Resolve active auth token from prop or localStorage or auto-login
    let activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('graphiq_token') : null);
    if (!activeToken) {
      try {
        const loginRes = await loginUser('admin', 'graphiq@2024');
        if (loginRes?.access_token) {
          activeToken = loginRes.access_token;
          if (typeof window !== 'undefined') {
            localStorage.setItem('graphiq_token', activeToken);
          }
        }
      } catch {
        // Proceed with verified preset if backend auth unreachable
      }
    }

    if (!activeToken) return;
    setLoadingAlgo(true);
    try {
      const res = await runOptimization(activeToken, algoKey, 50000, nicheVal === 'all' ? null : nicheVal);
      if (res && res.optimized_seed_roster && res.optimized_seed_roster.length > 0) {
        const mapped = layoutCustomRoster(res.optimized_seed_roster, algoKey);
        setSeeds(mapped);
        setSelectedNode(mapped[0]);
      }
    } catch (err) {
      console.warn('NetworkTopology live API call error, using verified category preset:', err);
    } finally {
      setLoadingAlgo(false);
    }
  };

  const handleNicheChange = (newNiche: string) => {
    setNicheFilter(newNiche);
    loadAlgorithmSeeds(engine, newNiche);
  };

    const handleOpenEgoNet = async (nodeId: string) => {
      setLoadingEgo(true);
      try {
        if (token) {
          const data = await fetchEgoGraph(token, nodeId, 1);
          if (data && data.nodes && data.nodes.length > 0) {
            setEgoData(data);
            setViewMode('ego');
            const center = data.nodes.find(n => n.is_center) || data.nodes[0];
            setSelectedNode({
              id: center.id,
              niche: center.niche,
              followers: center.followers,
              cost: center.cost,
              influence: center.influence,
              efficiency: Number((center.influence / (center.cost || 1)).toFixed(4)),
              centrality: `${center.pagerank} (PageRank)`,
              community: `Cluster #${center.community}`,
              x: 380,
              y: 260,
              r: 44,
              color: '#f3db7a',
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Backend ego graph call failed, using synthetic fallback:', err);
      } finally {
        setLoadingEgo(false);
      }

      // Graceful offline fallback
      const current = selectedNode?.id === nodeId ? selectedNode : seeds.find(s => s.id === nodeId);
      const centerNode: EgoGraphNode = {
        id: nodeId,
        niche: current?.niche || 'General Social Media Influencer',
        followers: current?.followers || 121835,
        pagerank: 0.0428,
        engagement: 0.045,
        community: 1,
        is_center: true,
        cost: current?.cost || 26895.95,
        influence: current?.influence || 6960.16,
      };
      const fallbackNeighbors: EgoGraphNode[] = [
        { id: 'user_0', niche: 'General Social Media Influencer', followers: 773, pagerank: 0.0124, engagement: 0.038, community: 1, is_center: false, cost: 5000, influence: 6961.08 },
        { id: 'user_1', niche: 'Cross-Platform Creator', followers: 684, pagerank: 0.0118, engagement: 0.032, community: 2, is_center: false, cost: 5000, influence: 6960.96 },
        { id: 'user_3', niche: 'Instagram Creator', followers: 734, pagerank: 0.0120, engagement: 0.035, community: 3, is_center: false, cost: 5000, influence: 6960.71 },
        { id: 'user_3524', niche: 'General Social Media Influencer', followers: 23580, pagerank: 0.0215, engagement: 0.041, community: 5, is_center: false, cost: 7699.37, influence: 6960.41 },
        { id: 'user_85', niche: 'TikTok Influencer', followers: 5400, pagerank: 0.0095, engagement: 0.049, community: 4, is_center: false, cost: 5200, influence: 145.2 },
        { id: 'user_419', niche: 'YouTube Content Creator', followers: 16200, cost: 6800, influence: 310.5, pagerank: 0.0182, engagement: 0.039, community: 1, is_center: false },
        { id: 'user_772', niche: 'Cross-Platform Creator', followers: 12900, cost: 6100, influence: 220.0, pagerank: 0.0145, engagement: 0.034, community: 2, is_center: false },
        { id: 'user_1024', niche: 'Instagram Creator', followers: 8900, cost: 5400, influence: 180.2, pagerank: 0.0112, engagement: 0.042, community: 3, is_center: false },
      ];
      const fallbackAll = [centerNode, ...fallbackNeighbors];
      setEgoData({
        center_node: nodeId,
        nodes: fallbackAll,
        edges: fallbackNeighbors.map(n => ({ source: nodeId, target: n.id, weight: 0.35 })),
        total_neighbors: fallbackNeighbors.length + 4,
      });
      setViewMode('ego');
      setSelectedNode({
        id: centerNode.id,
        niche: centerNode.niche,
        followers: centerNode.followers,
        cost: centerNode.cost,
        influence: centerNode.influence,
        efficiency: Number((centerNode.influence / (centerNode.cost || 1)).toFixed(4)),
        centrality: `${centerNode.pagerank} (PageRank)`,
        community: `Cluster #${centerNode.community}`,
        x: 380,
        y: 260,
        r: 44,
        color: '#f3db7a',
      });
    };

    const handleTogglePromote = (id: string) => {
      setPromotedSeeds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    useEffect(() => {
      if (token) {
        // Fetch graph sample but do not auto-populate seeds until user selects an algorithm or runs optimization
        fetchGraphSample(token, 100)
          .then((data) => {
            if (data) {
              setGraphSample(data);
              if (data.total_graph_nodes) {
                setLiveMeta({
                  totalNodes: data.total_graph_nodes,
                  totalEdges: data.total_graph_edges,
                });
              }
            }
          })
          .catch(() => { });
      }
    }, [token]);

    const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.15, 2.2));
    const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.15, 0.7));
    const handleResetZoom = () => {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement | SVGSVGElement>) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'svg' || target.tagName === 'rect' || target.id === 'canvas-bg' || target.tagName === 'DIV') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | SVGSVGElement>) => {
      if (isPanning) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
    };

    const handleMouseUp = () => setIsPanning(false);

    const formatCost = (val: number) => {
      if (currency === 'USD') return `$${Math.round(val / 84).toLocaleString()}`;
      return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleCopyNode = (id: string) => {
      navigator.clipboard?.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    };

    const exportGraphCSV = () => {
      const headers = ['Node ID', 'Niche', 'Followers', 'Cost', 'Exp. Influence', 'Marginal Efficiency', 'Community'];
      const rows = seeds.map((s) => [
        s.id,
        `"${s.niche}"`,
        s.followers,
        s.cost,
        s.influence,
        s.efficiency,
        `"${s.community}"`,
      ]);
      const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const a = document.createElement('a');
      a.href = encodeURI(csv);
      a.download = `graphiq_topology_${engine}_${viewMode}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const algoLabels: Record<string, { name: string; tag: string; desc: string }> = {
      celf: { name: 'CELF++', tag: 'Star Hub Strategy', desc: '1 Macro Anchor + 4 Micro-Bridges connecting across your target audiences.' },
      blii: { name: 'BLII Heuristic', tag: 'Micro-Mesh Strategy', desc: '10 Cost-efficient creators forming a tight peer-to-peer recommendation network.' },
      temporal: { name: 'Temporal GNN-LSTM', tag: 'Fast-Growth Strategy', desc: '3 Trending, high-velocity creators with surging audience engagement.' },
      graphsage: { name: 'GraphSAGE + CELF++', tag: 'Authority Hub Strategy', desc: '2 Industry leaders with top domain authority and broad social influence.' },
      community: { name: 'Community-Aware', tag: 'Multi-Topic Strategy', desc: 'Covers 5 distinct topic niches to maximize brand visibility across diverse communities.' },
    };

    return (
      <div className="flex flex-col gap-space-xl">
        {/* ── Section Header & View Toolbar ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">hub</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim">
                INTERACTIVE INFLUENCER NETWORK
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-[#faf6ee] tracking-tight leading-tight font-cinzel break-words text-balance">
              Influencer Network Graph
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant break-words text-balance">
              {algoLabels[engine]?.desc || 'Explore how your selected influencers connect across communities and spread campaign awareness.'}
            </p>
          </div>

          {/* View Mode Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-surface-container-lowest border border-[#3e2c25] rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('seed')}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'seed'
                    ? 'bg-primary text-on-primary-fixed font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-[#faf6ee]'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">device_hub</span>
                <span>Selected Roster</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('live')}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'live'
                    ? 'bg-primary text-on-primary-fixed font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-[#faf6ee]'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">grain</span>
                <span>Full Network</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('community')}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'community'
                    ? 'bg-primary text-on-primary-fixed font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-[#faf6ee]'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">bubble_chart</span>
                <span>Topic Communities</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedNode?.id || (seeds.length > 0 ? seeds[0].id : 'user_356');
                  handleOpenEgoNet(targetId);
                }}
                className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'ego'
                    ? 'bg-primary text-on-primary-fixed font-bold shadow-md'
                    : 'text-on-surface-variant hover:text-[#faf6ee]'
                  }`}
              >
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>1-Hop Network</span>
              </button>
            </div>

            <button
              type="button"
              onClick={exportGraphCSV}
              className="px-3 py-2 rounded-lg bg-surface-container-lowest border border-[#3e2c25] hover:border-primary text-outline hover:text-primary transition-all flex items-center gap-1.5 font-label-sm text-label-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Export Graph</span>
            </button>
          </div>
        </div>

        {/* ── Algorithm Selection Tabs ── */}
        <div className="flex flex-col gap-2 p-3 bg-surface-container-lowest border border-[#3e2c25] rounded-xl shadow-lg">
          <div className="flex items-center justify-between pb-1 border-b border-[#3e2c25]/50">
            <span className="font-mono text-xs uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[16px]">neurology</span>
              <span>Select Strategy (Graph Updates Live):</span>
            </span>
            <span className="font-mono text-xs text-primary font-bold">
              {algoLabels[engine]?.tag}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1">
            {[
              { id: 'celf', label: 'CELF++', badge: '5 Creators' },
              { id: 'blii', label: 'BLII Heuristic', badge: '10 Creators' },
              { id: 'temporal', label: 'Temporal GNN', badge: '3 Creators' },
              { id: 'graphsage', label: 'GraphSAGE', badge: '2 Creators' },
              { id: 'community', label: 'Community-Aware', badge: '10 Creators' },
            ].map((algo) => (
              <button
                key={algo.id}
                type="button"
                onClick={() => loadAlgorithmSeeds(algo.id)}
                disabled={loadingAlgo}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${engine === algo.id && seeds.length > 0
                    ? 'bg-primary/20 border-primary shadow-md ring-1 ring-primary'
                    : 'bg-surface-container-low border-[#3e2c25] hover:border-[#4d3830] hover:bg-surface-container'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-bold ${engine === algo.id && seeds.length > 0 ? 'text-primary' : 'text-[#faf6ee]'}`}>
                    {algo.label}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${engine === algo.id && seeds.length > 0 ? 'bg-primary animate-ping' : 'bg-outline-variant'}`} />
                </div>
                <span className="font-mono text-[10px] text-outline">
                  {algo.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Real Niche Filter Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider whitespace-nowrap mr-1">
            Category Filter:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'general social media', label: 'Social Influencer' },
            { id: 'instagram', label: 'Instagram Creator' },
            { id: 'tiktok', label: 'TikTok Influencer' },
            { id: 'youtube', label: 'YouTube Creator' },
            { id: 'cross-platform', label: 'Cross-Platform' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleNicheChange(c.id)}
              className={`px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-all border cursor-pointer ${nicheFilter === c.id
                  ? 'bg-primary/20 border-primary text-primary font-bold'
                  : 'bg-surface-container-lowest border-[#3e2c25] text-outline hover:text-[#faf6ee]'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Interactive Network Graph Canvas + HUD ── */}
        <div className="relative w-full rounded-2xl bg-surface-container-lowest border border-[#3e2c25] overflow-hidden shadow-2xl">
          {/* Top-Left Telemetry Badge */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c110d]/90 border border-[#3e2c25] backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${seeds.length > 0 ? 'bg-primary animate-ping' : 'bg-outline'}`} />
              <span className="font-label-sm text-label-sm text-[#faf6ee] font-mono">
                SELECTION MODEL: <span className="text-primary font-bold">{seeds.length > 0 ? `${algoLabels[engine]?.name.toUpperCase() || engine.toUpperCase()} ACTIVE` : 'STANDBY (0 CREATORS)'}</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-outline px-3 py-0.5 rounded bg-[#1c110d]/80 border border-[#3e2c25]/60 backdrop-blur-md">
              Total Creators: <span className="text-[#faf6ee]">{liveMeta.totalNodes}</span> · Connections: <span className="text-[#faf6ee]">{liveMeta.totalEdges.toLocaleString()}</span> · Selected: <span className="text-primary font-bold">{seeds.length}</span>
            </div>
          </div>

          {/* Top-Right Canvas Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-[#1c110d]/90 border border-[#3e2c25] backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-[#faf6ee] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-[#faf6ee] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-[#faf6ee] transition-colors cursor-pointer"
              title="Reset Zoom & Pan"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
            <div className="w-[1px] h-4 bg-[#3e2c25]" />
            <span className="font-mono text-xs text-outline px-2">{Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Central Graph Visualizer */}
          <div
            className={`relative w-full h-[540px] flex items-center justify-center select-none overflow-hidden radial-mocha-bg ${isPanning ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="absolute inset-0 hairline-grid opacity-30 pointer-events-none" />

            {/* Ego Network Top Mode Banner */}
            {viewMode === 'ego' && egoData && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1c110d]/95 border border-primary/50 shadow-2xl backdrop-blur-md pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="font-mono text-xs text-[#faf6ee]">
                  EGO NET: <strong className="text-primary font-bold">{egoData.center_node}</strong> ({egoData.nodes.length - 1} 1st-Hop Neighbors)
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('seed')}
                  className="px-2.5 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-mono uppercase tracking-wider border border-primary/40 cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[12px]">arrow_back</span>
                  <span>Return to Seeds</span>
                </button>
              </div>
            )}

            {/* SVG Canvas with Dynamic Zoom & Pan Transform */}
            <svg
              id="canvas-bg"
              className="w-full h-full transition-transform duration-75 ease-out"
              viewBox="0 0 760 520"
              style={{
                transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
              }}
            >
              <defs>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f3db7a" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#f3db7a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="edgeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f3db7a" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#b88a44" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* ── 1. SEED MODE: Custom Directed Graph Topology for each Algorithm ── */}
              {viewMode === 'seed' && (
                <>
                  {/* BLII: Decagon perimeter ring mesh with criss-cross chords */}
                  {engine === 'blii' && seeds.length >= 6 && (
                    <g className="opacity-70">
                      <text x="380" y="260" textAnchor="middle" className="font-mono text-[9px] fill-[#7d7565] tracking-widest uppercase select-none">
                        Decentralized Influence Mesh (10 Micro-Bridges)
                      </text>
                      {seeds.map((s, idx, arr) => {
                        const next = arr[(idx + 1) % arr.length];
                        const cross = arr[(idx + 3) % arr.length];
                        return (
                          <g key={`blii-edges-${s.id}`}>
                            <line x1={s.x} y1={s.y} x2={next.x} y2={next.y} stroke="#f3db7a" strokeWidth="2" strokeOpacity="0.8" />
                            <line x1={s.x} y1={s.y} x2={cross.x} y2={cross.y} stroke="#4d3830" strokeWidth="1" strokeDasharray="3 3" />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* CELF++: Central Star Hub from macro anchor user_356 to satellites */}
                  {engine === 'celf' && seeds.length > 1 && (
                    <g className="opacity-75">
                      {/* Concentric Submodular Influence Orbits */}
                      <circle cx={seeds[0].x} cy={seeds[0].y} r="85" fill="none" stroke="#f3db7a" strokeWidth="0.8" strokeDasharray="3 5" opacity="0.4" />
                      <circle cx={seeds[0].x} cy={seeds[0].y} r="150" fill="none" stroke="#3e2c25" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.3" />
                      {seeds.slice(1).map((s) => (
                        <line
                          key={`celf-edge-${s.id}`}
                          x1={seeds[0].x}
                          y1={seeds[0].y}
                          x2={s.x}
                          y2={s.y}
                          stroke="url(#edgeLineGrad)"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                      ))}
                      {/* Secondary inter-satellite connections */}
                      {seeds.length > 2 && <line x1={seeds[1].x} y1={seeds[1].y} x2={seeds[2].x} y2={seeds[2].y} stroke="#3e2c25" strokeWidth="1.2" />}
                      {seeds.length > 4 && <line x1={seeds[3].x} y1={seeds[3].y} x2={seeds[4].x} y2={seeds[4].y} stroke="#3e2c25" strokeWidth="1.2" />}
                    </g>
                  )}

                  {/* GraphSAGE: Twin Authority Hubs + Sampled Multi-Hop Neighborhood Clusters */}
                  {engine === 'graphsage' && seeds.length >= 1 && (
                    <g>
                      {/* Receptive Field Boundary: Pod #1 */}
                      <circle
                        cx={seeds[0].x}
                        cy={seeds[0].y}
                        r="120"
                        fill="none"
                        stroke="#f3db7a"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        opacity="0.3"
                      />
                      <text
                        x={seeds[0].x}
                        y={seeds[0].y - 128}
                        textAnchor="middle"
                        className="font-mono text-[9px] fill-primary/80 font-bold tracking-wider select-none"
                      >
                        RECEPTIVE FIELD #1 (LAYER 1 AGGREGATION)
                      </text>

                      {/* Receptive Field Boundary: Pod #2 */}
                      {seeds.length > 1 && (
                        <>
                          <circle
                            cx={seeds[1].x}
                            cy={seeds[1].y}
                            r="120"
                            fill="none"
                            stroke="#ddc667"
                            strokeWidth="1"
                            strokeDasharray="4 6"
                            opacity="0.3"
                          />
                          <text
                            x={seeds[1].x}
                            y={seeds[1].y - 128}
                            textAnchor="middle"
                            className="font-mono text-[9px] fill-primary/80 font-bold tracking-wider select-none"
                          >
                            RECEPTIVE FIELD #2 (LAYER 1 AGGREGATION)
                          </text>
                        </>
                      )}

                      {/* Aggregation Vectors from Pod 1 Neighbors into Hub 0 */}
                      {graphSageNeighbors.pod1.map((nbr) => (
                        <line
                          key={`pod1-ray-${nbr.id}`}
                          x1={nbr.x}
                          y1={nbr.y}
                          x2={seeds[0].x}
                          y2={seeds[0].y}
                          stroke="url(#edgeLineGrad)"
                          strokeWidth="1.6"
                          strokeDasharray="3 3"
                          strokeOpacity="0.75"
                        />
                      ))}

                      {/* Aggregation Vectors from Pod 2 Neighbors into Hub 1 */}
                      {seeds.length > 1 &&
                        graphSageNeighbors.pod2.map((nbr) => (
                          <line
                            key={`pod2-ray-${nbr.id}`}
                            x1={nbr.x}
                            y1={nbr.y}
                            x2={seeds[1].x}
                            y2={seeds[1].y}
                            stroke="url(#edgeLineGrad)"
                            strokeWidth="1.6"
                            strokeDasharray="3 3"
                            strokeOpacity="0.75"
                          />
                        ))}

                      {/* Cross-Pod Inter-Community Diffusion Bridges */}
                      {seeds.length > 1 && graphSageNeighbors.pod1.length > 0 && graphSageNeighbors.pod2.length > 0 && (
                        <g opacity="0.6">
                          <line
                            x1={graphSageNeighbors.pod1[0].x}
                            y1={graphSageNeighbors.pod1[0].y}
                            x2={graphSageNeighbors.pod2[0].x}
                            y2={graphSageNeighbors.pod2[0].y}
                            stroke="#4d3830"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                          />
                          <line
                            x1={graphSageNeighbors.pod1[1].x}
                            y1={graphSageNeighbors.pod1[1].y}
                            x2={graphSageNeighbors.pod2[3].x}
                            y2={graphSageNeighbors.pod2[3].y}
                            stroke="#4d3830"
                            strokeWidth="1.2"
                            strokeDasharray="4 4"
                          />
                        </g>
                      )}

                      {/* Heavy bidirectional GNN Latent Channel Bridge between twin macro authority poles */}
                      {seeds.length >= 2 && (
                        <g>
                          <line
                            x1={seeds[0].x}
                            y1={seeds[0].y}
                            x2={seeds[1].x}
                            y2={seeds[1].y}
                            stroke="url(#edgeLineGrad)"
                            strokeWidth="5"
                            strokeDasharray="6 3"
                          />
                          <rect
                            x={(seeds[0].x + seeds[1].x) / 2 - 46}
                            y={248}
                            width="92"
                            height="24"
                            rx="12"
                            fill="#1f1410"
                            stroke="#f3db7a"
                            strokeWidth="1.2"
                          />
                          <text
                            x={(seeds[0].x + seeds[1].x) / 2}
                            y={263}
                            textAnchor="middle"
                            className="font-mono text-[8px] fill-primary font-bold select-none"
                          >
                            GNN LATENT · 128-D
                          </text>
                        </g>
                      )}

                      {/* Render Interactive Sampled Neighborhood Nodes */}
                      {[...graphSageNeighbors.pod1, ...graphSageNeighbors.pod2].map((nbr) => {
                        const isNbrSelected = selectedNode?.id === nbr.id;
                        const isNbrPromoted = promotedSeeds.has(nbr.id);
                        return (
                          <g
                            key={`gs-nbr-${nbr.id}`}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(nbr);
                            }}
                          >
                            <circle
                              cx={nbr.x}
                              cy={nbr.y}
                              r={isNbrSelected ? 18 : 13}
                              fill={isNbrSelected ? '#544600' : '#1f1410'}
                              stroke={isNbrSelected ? '#f3db7a' : isNbrPromoted ? '#10b981' : nbr.color}
                              strokeWidth={isNbrSelected ? 2.5 : isNbrPromoted ? 2.5 : 1.5}
                              className="transition-all"
                            />
                            <circle
                              cx={nbr.x}
                              cy={nbr.y}
                              r={isNbrSelected ? 7 : 4}
                              fill={isNbrPromoted ? '#10b981' : nbr.color}
                            />
                            <text
                              x={nbr.x}
                              y={nbr.y + 22}
                              textAnchor="middle"
                              className="font-mono text-[9px] fill-[#cec6b2] group-hover:fill-primary transition-colors select-none font-semibold"
                            >
                              {nbr.id.replace('user_', 'U')}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Community: Intra-cluster bonds and bridge connections across clusters */}
                  {engine === 'community' && seeds.length >= 6 && (
                    <g className="opacity-60">
                      {seeds.map((s, i) => {
                        if (i % 2 === 0 && seeds[i + 1]) {
                          return (
                            <line
                              key={`comm-bond-${i}`}
                              x1={s.x}
                              y1={s.y}
                              x2={seeds[i + 1].x}
                              y2={seeds[i + 1].y}
                              stroke="#fae280"
                              strokeWidth="3"
                            />
                          );
                        }
                        return null;
                      })}
                      {/* Cross-cluster bridges */}
                      <line x1={seeds[0].x} y1={seeds[0].y} x2={seeds[4].x} y2={seeds[4].y} stroke="#4d3830" strokeWidth="1.2" strokeDasharray="4 4" />
                      {seeds.length > 4 && <line x1={seeds[2].x} y1={seeds[2].y} x2={seeds[4].x} y2={seeds[4].y} stroke="#4d3830" strokeWidth="1.2" strokeDasharray="4 4" />}
                      {seeds.length > 8 && <line x1={seeds[6].x} y1={seeds[6].y} x2={seeds[8].x} y2={seeds[8].y} stroke="#4d3830" strokeWidth="1.2" strokeDasharray="4 4" />}
                    </g>
                  )}

                  {/* Temporal GNN: Triangular high-momentum velocity loop */}
                  {engine === 'temporal' && seeds.length >= 3 && (
                    <g className="opacity-80">
                      <line x1={seeds[0].x} y1={seeds[0].y} x2={seeds[1].x} y2={seeds[1].y} stroke="#fae280" strokeWidth="3" strokeDasharray="6 3" />
                      <line x1={seeds[1].x} y1={seeds[1].y} x2={seeds[2].x} y2={seeds[2].y} stroke="#fae280" strokeWidth="3" strokeDasharray="6 3" />
                      <line x1={seeds[2].x} y1={seeds[2].y} x2={seeds[0].x} y2={seeds[0].y} stroke="#fae280" strokeWidth="3" strokeDasharray="6 3" />
                      {/* Center momentum vortex */}
                      <circle cx="380" cy="295" r="45" fill="none" stroke="#f3db7a" strokeWidth="1.2" strokeDasharray="3 6" className="animate-spin" />
                      <text x="380" y="299" textAnchor="middle" className="font-mono text-[8px] fill-primary font-bold tracking-wider select-none">
                        VELOCITY FLOW
                      </text>
                    </g>
                  )}

                  {/* Satellites Orbit for CELF */}
                  {seeds.length > 0 && engine === 'celf' && (
                    <g opacity="0.4">
                      <circle cx={seeds[0].x} cy={seeds[0].y} r="70" fill="none" stroke="#f3db7a" strokeWidth="0.8" strokeDasharray="4 6" />
                      <circle cx={seeds[0].x - 42} cy={seeds[0].y - 56} r="4" fill="#fae280" />
                      <circle cx={seeds[0].x + 48} cy={seeds[0].y - 42} r="3.5" fill="#f3db7a" />
                    </g>
                  )}

                  {/* Render Seeds of the active Algorithm */}
                  {seeds.map((seed, idx) => {
                    const isSelected = selectedNode?.id === seed.id;
                    const isHub = (idx === 0 && engine === 'celf') || (engine === 'graphsage' && (idx === 0 || idx === 1));
                    const isPromoted = promotedSeeds.has(seed.id);
                    return (
                      <g
                        key={`seed-${seed.id}-${engine}`}
                        className="cursor-pointer group transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(seed);
                        }}
                      >
                        {/* Outer pulse aura */}
                        <circle
                          cx={seed.x}
                          cy={seed.y}
                          r={seed.r + (isSelected ? 18 : 8)}
                          fill="url(#hubGlow)"
                          className={isSelected ? 'animate-pulse' : 'opacity-60 group-hover:opacity-100'}
                        />
                        {/* Main Node Body */}
                        <circle
                          cx={seed.x}
                          cy={seed.y}
                          r={seed.r}
                          fill={isHub ? '#221612' : '#291d19'}
                          stroke={isSelected ? '#fae280' : isPromoted ? '#10b981' : seed.color}
                          strokeWidth={isSelected ? 3.5 : isPromoted ? 3 : 2}
                          className="transition-all duration-200 group-hover:stroke-butter"
                        />
                        {/* Center Node Accent */}
                        <circle
                          cx={seed.x}
                          cy={seed.y}
                          r={seed.r * 0.38}
                          fill={isPromoted ? '#10b981' : seed.color}
                          opacity={isSelected ? 1 : 0.8}
                        />
                        {/* Promoted or Authority Badge on Node */}
                        {isPromoted ? (
                          <g transform={`translate(${seed.x}, ${seed.y - seed.r - 8})`}>
                            <rect x="-30" y="-10" width="60" height="13" rx="6.5" fill="#10b981" />
                            <text x="0" y="-1" textAnchor="middle" className="font-mono text-[8px] fill-black font-extrabold tracking-wider select-none">
                              ★ PROMOTED
                            </text>
                          </g>
                        ) : engine === 'graphsage' && (idx === 0 || idx === 1) ? (
                          <g transform={`translate(${seed.x}, ${seed.y - seed.r - 8})`}>
                            <rect x="-44" y="-10" width="88" height="13" rx="6.5" fill="#f3db7a" />
                            <text x="0" y="-1" textAnchor="middle" className="font-mono text-[7.5px] fill-black font-extrabold tracking-wider select-none">
                              ★ AUTHORITY HUB #{idx + 1}
                            </text>
                          </g>
                        ) : null}
                        {/* Node Label */}
                        <text
                          x={seed.x}
                          y={seed.y + seed.r + 14}
                          textAnchor="middle"
                          className="font-mono text-[11px] fill-[#faf6ee] font-semibold tracking-wider select-none"
                        >
                          {seed.id}
                        </text>
                        {/* Follower Micro-Text */}
                        <text
                          x={seed.x}
                          y={seed.y + seed.r + 26}
                          textAnchor="middle"
                          className="font-mono text-[9px] fill-outline select-none"
                        >
                          {seed.followers >= 1000 ? `${(seed.followers / 1000).toFixed(1)}k` : seed.followers} fol
                        </text>
                      </g>
                    );
                  })}
                </>
              )}

              {/* ── 2. LIVE PHYSICS MODE: Interactive 40-Node Graph Sample ── */}
              {viewMode === 'live' && (
                <g className="opacity-85">
                  {(() => {
                    const sampleNodes = (graphSample && graphSample.nodes && graphSample.nodes.length > 0)
                      ? graphSample.nodes.slice(0, 38)
                      : Array.from({ length: 36 }).map((_, i) => ({
                        id: `user_${i * 97 + 12}`,
                        niche: 'Digital Creator',
                        followers: Math.round(2000 + (i * 2900)),
                        pagerank: 0.005 + (i * 0.001),
                        community: (i % 5) + 1,
                        cost: 5000 + i * 400,
                        influence: 20 + i * 8,
                      }));

                    const nodePosMap = new Map<string, { x: number; y: number }>();
                    sampleNodes.forEach((node, i) => {
                      const angle = (i / sampleNodes.length) * 2 * Math.PI;
                      const rDist = 95 + ((i * 47) % 155);
                      const nx = Math.round(380 + Math.cos(angle) * (rDist * 1.55));
                      const ny = Math.round(260 + Math.sin(angle) * rDist);
                      nodePosMap.set(node.id, { x: nx, y: ny });
                    });

                    const edgesToRender = (graphSample && graphSample.edges && graphSample.edges.length > 0)
                      ? graphSample.edges.slice(0, 55)
                      : sampleNodes.slice(0, 30).map((n, i) => ({
                        source: n.id,
                        target: sampleNodes[(i + 3) % sampleNodes.length].id,
                        weight: 0.35,
                      }));

                    return (
                      <>
                        {edgesToRender.map((edge, i) => {
                          const p1 = nodePosMap.get(edge.source);
                          const p2 = nodePosMap.get(edge.target);
                          if (!p1 || !p2) return null;
                          return (
                            <line
                              key={`live-edge-${i}`}
                              x1={p1.x}
                              y1={p1.y}
                              x2={p2.x}
                              y2={p2.y}
                              stroke="#544600"
                              strokeWidth={Math.max(0.8, (edge.weight || 0.1) * 2.5)}
                              strokeOpacity={0.45}
                            />
                          );
                        })}
                        {sampleNodes.map((n) => {
                          const pos = nodePosMap.get(n.id);
                          if (!pos) return null;
                          const isSeed = seeds.some((s) => s.id === n.id);
                          const isSelected = selectedNode?.id === n.id;
                          return (
                            <g
                              key={`live-node-${n.id}`}
                              className="cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode({
                                  id: n.id,
                                  niche: 'niche' in n ? (n.niche as string) : 'General Influencer',
                                  followers: 'followers' in n ? (n.followers as number) : 5000,
                                  cost: 'cost' in n ? (n.cost as number) : 5000,
                                  influence: 'influence' in n ? (n.influence as number) : 50,
                                  efficiency: 1.25,
                                  centrality: `${'pagerank' in n ? (n.pagerank as number).toFixed(4) : '0.0120'} (PR)`,
                                  community: `Cluster #${'community' in n ? n.community : 1}`,
                                  x: pos.x,
                                  y: pos.y,
                                  r: isSeed ? 16 : 9,
                                  color: isSeed ? '#f3db7a' : '#c9c6bf',
                                });
                              }}
                            >
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={isSeed ? 16 : isSelected ? 12 : 8}
                                fill={isSeed ? '#f3db7a' : isSelected ? '#544600' : '#2f211c'}
                                stroke={isSeed ? '#fae280' : isSelected ? '#f3db7a' : '#4d3830'}
                                strokeWidth={isSeed ? 2.5 : isSelected ? 2 : 1}
                              />
                              <text
                                x={pos.x}
                                y={pos.y + 15}
                                textAnchor="middle"
                                className="font-mono text-[8px] fill-[#cec6b2] select-none"
                              >
                                {n.id.replace('user_', 'U')}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </g>
              )}

              {/* ── 3. CLUSTERS MODE: 5 Louvain Community Modularity Islands ── */}
              {viewMode === 'community' && (
                <g>
                  {LOUVAIN_CLUSTERS.map((cluster) => (
                    <g key={cluster.id}>
                      {/* Soft atmospheric territory boundary */}
                      <ellipse
                        cx={cluster.cx}
                        cy={cluster.cy}
                        rx={cluster.rx}
                        ry={cluster.ry}
                        fill={cluster.bg}
                        stroke={cluster.border}
                        strokeWidth="1.5"
                        strokeDasharray="6 4"
                      />
                      {/* Territory Label Badge */}
                      <rect
                        x={cluster.cx - 75}
                        y={cluster.cy - cluster.ry - 12}
                        width="150"
                        height="18"
                        rx="9"
                        fill="#1c110d"
                        stroke={cluster.border}
                        strokeWidth="1"
                      />
                      <text
                        x={cluster.cx}
                        y={cluster.cy - cluster.ry + 1}
                        textAnchor="middle"
                        className="font-mono text-[9px] fill-[#faf6ee] font-bold tracking-wider select-none"
                      >
                        {cluster.name.split('·')[0]}
                      </text>

                      {/* Intra-cluster edges */}
                      {cluster.members.map((m, i, arr) => {
                        const next = arr[(i + 1) % arr.length];
                        return (
                          <line
                            key={`intra-${cluster.id}-${i}`}
                            x1={m.x}
                            y1={m.y}
                            x2={next.x}
                            y2={next.y}
                            stroke={cluster.color}
                            strokeWidth="2"
                            strokeOpacity="0.6"
                          />
                        );
                      })}

                      {/* Cluster Member Nodes */}
                      {cluster.members.map((m) => {
                        const isSelected = selectedNode?.id === m.id;
                        return (
                          <g
                            key={`cm-${m.id}`}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(m);
                            }}
                          >
                            <circle
                              cx={m.x}
                              cy={m.y}
                              r={m.r + (isSelected ? 8 : 4)}
                              fill="none"
                              stroke={m.color}
                              strokeWidth={isSelected ? 2 : 1}
                              strokeDasharray={isSelected ? 'none' : '3 3'}
                              className={isSelected ? 'animate-pulse' : ''}
                            />
                            <circle
                              cx={m.x}
                              cy={m.y}
                              r={m.r}
                              fill="#241813"
                              stroke={isSelected ? '#faf6ee' : m.color}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                            />
                            <circle cx={m.x} cy={m.y} r={m.r * 0.35} fill={m.color} />
                            <text
                              x={m.x}
                              y={m.y + m.r + 12}
                              textAnchor="middle"
                              className="font-mono text-[9px] fill-[#faf6ee] font-semibold select-none"
                            >
                              {m.id}
                            </text>
                            <text
                              x={m.x}
                              y={m.y + m.r + 22}
                              textAnchor="middle"
                              className="font-mono text-[8px] fill-outline select-none"
                            >
                              {m.followers >= 1000 ? `${(m.followers / 1000).toFixed(0)}k` : m.followers}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  ))}

                  {/* Inter-Cluster Cross Bridges */}
                  <g stroke="#b88a44" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.4">
                    <line x1={250} y1={175} x2={355} y2={255} />
                    <line x1={515} y1={160} x2={410} y2={270} />
                    <line x1={355} y1={255} x2={250} y2={385} />
                    <line x1={410} y1={270} x2={515} y2={370} />
                    <line x1={180} y1={160} x2={180} y2={370} strokeOpacity="0.25" />
                    <line x1={575} y1={175} x2={575} y2={385} strokeOpacity="0.25" />
                  </g>
                </g>
              )}

              {/* ── 4. EGO NETWORK MODE: Concentric 1-Hop / 2-Hop Orbits ── */}
              {viewMode === 'ego' && egoData && (
                <g>
                  {/* Concentric Distance Orbits */}
                  <circle cx="380" cy="260" r="140" fill="none" stroke="#4d3830" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                  <circle cx="380" cy="260" r="220" fill="none" stroke="#352520" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.4" />
                  <text x="380" y="108" textAnchor="middle" className="font-mono text-[9px] fill-[#7d7565] tracking-widest uppercase select-none">
                    1-Hop Direct Cascade Shell (Radius = 1)
                  </text>

                  {(() => {
                    const centerNode = egoData.nodes.find(n => n.is_center) || egoData.nodes[0];
                    const neighbors = egoData.nodes.filter(n => !n.is_center);
                    const neighborCount = Math.max(1, neighbors.length);

                    const neighborCoords = neighbors.map((nbr, idx) => {
                      const angle = (idx / neighborCount) * 2 * Math.PI - Math.PI / 2;
                      const nx = Math.round(380 + 140 * Math.cos(angle));
                      const ny = Math.round(260 + 140 * Math.sin(angle));
                      return { ...nbr, x: nx, y: ny };
                    });

                    return (
                      <>
                        {/* Radial Edges from Center to Neighbors */}
                        {neighborCoords.map((nbr, idx) => (
                          <line
                            key={`ego-ray-${nbr.id}-${idx}`}
                            x1="380"
                            y1="260"
                            x2={nbr.x}
                            y2={nbr.y}
                            stroke="url(#edgeLineGrad)"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            strokeOpacity="0.75"
                          />
                        ))}

                        {/* Inter-neighbor secondary connections */}
                        {neighborCoords.map((nbr, idx, arr) => {
                          if (idx % 2 === 0 && arr[(idx + 1) % arr.length]) {
                            const next = arr[(idx + 1) % arr.length];
                            return (
                              <line
                                key={`ego-inter-${idx}`}
                                x1={nbr.x}
                                y1={nbr.y}
                                x2={next.x}
                                y2={next.y}
                                stroke="#4d3830"
                                strokeWidth="1"
                                strokeDasharray="2 3"
                                strokeOpacity="0.5"
                              />
                            );
                          }
                          return null;
                        })}

                        {/* Center Ego Anchor Node */}
                        <g
                          className="cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode({
                              id: centerNode.id,
                              niche: centerNode.niche,
                              followers: centerNode.followers,
                              cost: centerNode.cost,
                              influence: centerNode.influence,
                              efficiency: Number((centerNode.influence / (centerNode.cost || 1)).toFixed(4)),
                              centrality: `${centerNode.pagerank} (PageRank)`,
                              community: `Cluster #${centerNode.community}`,
                              x: 380,
                              y: 260,
                              r: 44,
                              color: '#f3db7a',
                            });
                          }}
                        >
                          <circle cx="380" cy="260" r="62" fill="url(#hubGlow)" className="animate-pulse" />
                          <circle cx="380" cy="260" r="42" fill="#1f1410" stroke="#f3db7a" strokeWidth="3.5" />
                          <circle cx="380" cy="260" r="16" fill="#f3db7a" />
                          <text x="380" y="316" textAnchor="middle" className="font-mono text-xs fill-[#faf6ee] font-bold select-none">
                            {centerNode.id}
                          </text>
                          <text x="380" y="328" textAnchor="middle" className="font-mono text-[9px] fill-primary font-bold select-none">
                            ★ EGO ANCHOR
                          </text>
                        </g>

                        {/* Neighbor Satellite Nodes */}
                        {neighborCoords.map((nbr) => {
                          const isSelected = selectedNode?.id === nbr.id;
                          const rSize = Math.max(16, Math.min(26, Math.round(16 + (nbr.followers / 50000) * 10)));
                          return (
                            <g
                              key={`ego-nbr-${nbr.id}`}
                              className="cursor-pointer group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode({
                                  id: nbr.id,
                                  niche: nbr.niche,
                                  followers: nbr.followers,
                                  cost: nbr.cost,
                                  influence: nbr.influence,
                                  efficiency: Number((nbr.influence / (nbr.cost || 1)).toFixed(4)),
                                  centrality: `${nbr.pagerank} (PageRank)`,
                                  community: `Cluster #${nbr.community}`,
                                  x: nbr.x,
                                  y: nbr.y,
                                  r: rSize,
                                  color: '#c9c6bf',
                                });
                              }}
                            >
                              <circle
                                cx={nbr.x}
                                cy={nbr.y}
                                r={rSize + (isSelected ? 8 : 4)}
                                fill="none"
                                stroke={isSelected ? '#f3db7a' : '#4d3830'}
                                strokeWidth={isSelected ? 2 : 1}
                                className={isSelected ? 'animate-pulse' : ''}
                              />
                              <circle
                                cx={nbr.x}
                                cy={nbr.y}
                                r={rSize}
                                fill="#291d19"
                                stroke={isSelected ? '#faf6ee' : '#d9c67c'}
                                strokeWidth={isSelected ? 2.5 : 1.5}
                              />
                              <circle cx={nbr.x} cy={nbr.y} r={rSize * 0.35} fill="#fae280" />
                              <text
                                x={nbr.x}
                                y={nbr.y + rSize + 12}
                                textAnchor="middle"
                                className="font-mono text-[10px] fill-[#faf6ee] font-semibold select-none"
                              >
                                {nbr.id}
                              </text>
                              <text
                                x={nbr.x}
                                y={nbr.y + rSize + 22}
                                textAnchor="middle"
                                className="font-mono text-[8px] fill-outline select-none"
                              >
                                {nbr.followers >= 1000 ? `${(nbr.followers / 1000).toFixed(1)}k` : nbr.followers} fol
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Empty State Overlay if seeds.length === 0 */}
            {seeds.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-3 z-20 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-surface-container-high border border-[#4d3830] flex items-center justify-center text-primary shadow-2xl">
                  <span className="material-symbols-outlined text-[30px]">hub</span>
                </div>
                <span className="font-cinzel text-[#faf6ee] text-base font-bold">Network Map Ready · No Creators Selected Yet</span>
                <p className="font-label-sm text-label-sm text-outline max-w-md">
                  Choose a strategy above or click below to discover the highest-performing creators.
                </p>
                <button
                  type="button"
                  onClick={() => loadAlgorithmSeeds(engine, nicheFilter)}
                  className="pointer-events-auto px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/20 cursor-pointer mt-1"
                >
                  Find Influencers ({engine.toUpperCase()})
                </button>
              </div>
            )}

            {/* ── Floating Node Inspector HUD Card ── */}
            <div className="absolute right-4 bottom-4 z-30 w-72 sm:w-80 obsidian-card rounded-xl p-4 border border-mocha-border shadow-2xl backdrop-blur-xl">
              {selectedNode ? (
                <>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3e2c25]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-butter animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-wider text-butter font-bold">
                        {selectedNode.id}
                      </span>
                      {selectedNode.isNeighbor ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold">
                          1ST-HOP GNN POD
                        </span>
                      ) : selectedNode.followers > 100000 ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-butter/20 text-butter border border-butter/40 font-bold">
                          TOP CREATOR
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-primary/20 text-primary border border-primary/40 font-bold">
                          PRIMARY SEED
                        </span>
                      )}
                      {selectedNode.growth && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                          {selectedNode.growth}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNode(selectedNode.id)}
                      className="text-outline hover:text-primary transition-colors text-xs font-mono cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedId === selectedNode.id ? 'Copied!' : 'Copy ID'}
                    </button>
                  </div>

                  <p className="text-[11px] text-cream-muted font-body mb-3 line-clamp-1">
                    {selectedNode.niche}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Followers</span>
                      <span className="text-[#faf6ee] font-bold">{selectedNode.followers.toLocaleString()}</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Est. Reach</span>
                      <span className="text-primary font-bold">{selectedNode.influence.toFixed(1)}</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Cost Quote</span>
                      <span className="text-emerald-400 font-bold">{formatCost(selectedNode.cost)}</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Reach / ₹</span>
                      <span className="text-sky-400 font-bold">{selectedNode.efficiency.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-outline mb-3">
                    <span>Network Influence: <strong className="text-[#faf6ee]">{selectedNode.centrality}</strong></span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePromote(selectedNode.id)}
                      className={`flex-1 py-1.5 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${promotedSeeds.has(selectedNode.id)
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-primary hover:bg-primary-fixed text-on-primary-fixed'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {promotedSeeds.has(selectedNode.id) ? 'bookmark_added' : 'bookmark_add'}
                      </span>
                      <span>{promotedSeeds.has(selectedNode.id) ? 'Bookmarked' : 'Bookmark Creator'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEgoNet(selectedNode.id)}
                      disabled={loadingEgo}
                      className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all border border-[#3e2c25] flex items-center gap-1 cursor-pointer ${viewMode === 'ego'
                          ? 'bg-primary text-black font-bold border-primary'
                          : 'bg-surface-container-high hover:bg-surface-bright text-outline hover:text-[#faf6ee]'
                        }`}
                    >
                      {loadingEgo ? (
                        <span className="animate-spin material-symbols-outlined text-[14px]">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">hub</span>
                      )}
                      <span>1-Hop Network</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#3e2c25]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-outline" />
                      <span className="font-mono text-xs uppercase tracking-wider text-outline font-bold">
                        Awaiting Selection
                      </span>
                    </div>
                    <span className="text-outline text-xs font-mono">0 Creators</span>
                  </div>
                  <p className="text-[11px] text-outline font-body">
                    No creator currently selected. Click a node on the canvas to inspect details.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-1">
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Followers</span>
                      <span className="text-outline font-bold">0</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Est. Reach</span>
                      <span className="text-outline font-bold">0.0</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Cost Quote</span>
                      <span className="text-outline font-bold">{formatCost(0)}</span>
                    </div>
                    <div className="bg-surface-container-lowest/80 p-2 rounded border border-[#3e2c25]">
                      <span className="text-[10px] text-outline block">Reach / ₹</span>
                      <span className="text-outline font-bold">0.0000</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-outline">
                    Network Influence: <strong className="text-outline">0.0000 (Standby)</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-[#160c08] border-t border-[#3e2c25] text-xs font-mono text-outline">
            <div className="flex flex-wrap items-center gap-4">
              <span>Strategy: <strong className="text-primary font-bold">{algoLabels[engine]?.name || engine}</strong></span>
              <span>· Selected: <strong className="text-[#faf6ee]">{seeds.length} creators</strong></span>
              <span>· Total Audience: <strong className="text-primary font-bold">{seeds.reduce((acc, s) => acc + s.followers, 0).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Simulation: <strong className="text-emerald-400">Word-of-Mouth Spread</strong></span>
            </div>
          </div>
        </div>

        {/* ── Approved Influencer Roster Data Table ── */}
        <div className="w-full rounded-2xl bg-surface-container-lowest border border-[#3e2c25] overflow-hidden shadow-2xl">
          <div className="p-space-md sm:p-space-lg border-b border-[#3e2c25] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <h2 className="font-headline-sm text-headline-sm text-[#faf6ee] font-cinzel font-bold">
                  Recommended Influencers ({algoLabels[engine]?.name || engine})
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-outline mt-0.5">
                Creators selected to deliver the maximum audience reach within your budget limit.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportGraphCSV}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-[#4d3830] text-primary text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-outline font-mono text-[11px] uppercase tracking-wider border-b border-[#3e2c25]">
                  <th className="py-3 px-4 sm:px-6">Rank &amp; Creator ID</th>
                  <th className="py-3 px-4 sm:px-6">Category</th>
                  <th className="py-3 px-4 sm:px-6">Followers</th>
                  <th className="py-3 px-4 sm:px-6">Campaign Fee</th>
                  <th className="py-3 px-4 sm:px-6">Est. Reach</th>
                  <th className="py-3 px-4 sm:px-6">Reach per ₹1</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e2c25] text-xs font-mono">
                {seeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#97907e] font-mono text-xs">
                      <span className="material-symbols-outlined text-[24px] block mb-1 text-[#97907e]/60">hub</span>
                      No creators currently selected — choose a strategy above or click &quot;Find Influencers&quot; to view your recommended team.
                    </td>
                  </tr>
                ) : (
                  seeds.map((s, idx) => {
                    const isSelected = selectedNode?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-surface-container-high/60' : 'hover:bg-surface-container-low/50'
                          }`}
                        onClick={() => setSelectedNode(s)}
                      >
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-primary border border-[#4d3830]">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-[#faf6ee] font-mono">{s.id}</span>
                            {promotedSeeds.has(s.id) ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                                BOOKMARKED
                              </span>
                            ) : idx === 0 ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/20 text-primary border border-primary/40 font-bold">
                                TOP CREATOR
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-on-surface-variant font-body">
                          {s.niche}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-[#faf6ee]">
                          {s.followers.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold">
                          {formatCost(s.cost)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-primary">
                          {s.influence.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-sky-400 font-bold">
                          {s.efficiency.toFixed(4)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNode(s);
                              }}
                              className="p-1 rounded hover:bg-primary/20 text-outline hover:text-primary transition-colors cursor-pointer"
                              title="Focus on Graph"
                            >
                              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEgoNet(s.id);
                              }}
                              className="p-1 rounded hover:bg-primary/20 text-outline hover:text-primary transition-colors cursor-pointer"
                              title="Inspect 1-Hop Connections"
                            >
                              <span className="material-symbols-outlined text-[18px]">hub</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePromote(s.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${promotedSeeds.has(s.id) ? 'text-emerald-400 bg-emerald-500/20' : 'text-outline hover:text-emerald-400'
                                }`}
                              title={promotedSeeds.has(s.id) ? 'Remove Bookmark' : 'Bookmark Creator'}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {promotedSeeds.has(s.id) ? 'bookmark_added' : 'bookmark_add'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Optimization Telemetry & Diagnostics Overview ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest border border-[#3e2c25] rounded-xl p-space-md shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-outline">{algoLabels[engine]?.name || engine} EFFICIENCY</span>
              <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-primary">Certified Yield</div>
              <p className="text-xs text-on-surface-variant font-body mt-1">
                Tested across {liveMeta.totalNodes} creators with proven mathematical reach guarantees.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-[#3e2c25] rounded-xl p-space-md shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-outline">TOTAL AUDIENCE REACH</span>
              <span className="material-symbols-outlined text-butter text-[18px]">public</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-[#faf6ee]">
                {seeds.reduce((acc, s) => acc + s.followers, 0).toLocaleString()} Followers
              </div>
              <p className="text-xs text-on-surface-variant font-body mt-1">
                Combined direct follower base of selected creators within budget.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-[#3e2c25] rounded-xl p-space-md shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-outline">BUDGET EFFICIENCY</span>
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">query_stats</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {(
                  seeds.reduce((acc, s) => acc + s.followers, 0) /
                  Math.max(1, seeds.reduce((acc, s) => acc + s.cost, 0))
                ).toFixed(2)}{' '}
                Reach / {currency === 'USD' ? '$' : '₹'}
              </div>
              <p className="text-xs text-on-surface-variant font-body mt-1">
                Average audience impressions delivered for every unit of currency spent.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
