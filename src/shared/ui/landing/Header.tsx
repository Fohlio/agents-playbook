'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { ROUTES } from "@/shared/routes";

interface GitHubStats {
  stargazers_count: number;
  forks_count: number;
}

function GitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    const cached = localStorage.getItem('github-stats');
    const cacheTime = localStorage.getItem('github-stats-time');
    
    if (cached && cacheTime) {
      const isExpired = Date.now() - parseInt(cacheTime) > 5 * 60 * 1000; // 5 minutes
      if (!isExpired) {
        setStats(JSON.parse(cached));
        setLoading(false);
        return;
      }
    }

    fetch('https://api.github.com/repos/chernobelenkiy/agents-playbook')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: GitHubStats) => {
        setStats(data);
        setLoading(false);
        // Cache the result
        localStorage.setItem('github-stats', JSON.stringify(data));
        localStorage.setItem('github-stats-time', Date.now().toString());
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-4 text-sm text-slate-300">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
          </svg>
          <span className="w-6 h-4 bg-slate-700 rounded animate-pulse"></span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75H7.25A.75.75 0 016.5 6.25v-.878z"/>
          </svg>
          <span className="w-6 h-4 bg-slate-700 rounded animate-pulse"></span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-slate-300">
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
        </svg>
        <span>{stats.stargazers_count}</span>
      </div>
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75H7.25A.75.75 0 016.5 6.25v-.878z"/>
        </svg>
        <span>{stats.forks_count}</span>
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-sm opacity-60"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl tracking-tight">AI Agents Playbook</h1>
              <p className="text-slate-300 text-sm">Intelligent Workflow Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <GitHubStats />
            
            {/* Authentication Buttons */}
            <Link 
              href={ROUTES.LOGIN}
              className="px-4 py-2 text-white hover:text-white/80 transition-colors"
            >
              Sign In
            </Link>
            
            <Link 
              href="https://github.com/chernobelenkiy/agents-playbook"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 