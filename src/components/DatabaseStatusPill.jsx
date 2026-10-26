import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';

export const DatabaseStatusPill = ({ compact = false }) => {
  const [dbState, setDbState] = useState({
    status: 'checking', // 'connected' | 'disconnected' | 'checking'
    dbName: null,
    latency: null,
    error: null
  });

  const checkHealth = async () => {
    const start = Date.now();
    try {
      const data = await apiClient.get('/health');
      const elapsed = Date.now() - start;
      
      const isConnected = data && (data.database?.status === 'connected' || data.database?.readyState === 1 || data.status === 'ok');
      setDbState({
        status: isConnected ? 'connected' : 'disconnected',
        dbName: data?.database?.name || (isConnected ? 'skillswap' : null),
        latency: elapsed,
        error: isConnected ? null : (data?.database?.status || 'Database offline')
      });
    } catch (err) {
      setDbState({
        status: 'disconnected',
        dbName: null,
        latency: null,
        error: 'Backend unreachable'
      });
    }
  };

  useEffect(() => {
    checkHealth();
    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (dbState.status === 'checking') {
    return (
      <span
        title="Checking database connection..."
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-medium"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
        <span className="hidden sm:inline">Checking DB...</span>
      </span>
    );
  }

  if (dbState.status === 'connected') {
    return (
      <span
        title={`Database: ${dbState.dbName} (${dbState.latency}ms) - Verified active`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-semibold"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">DB Active</span>
      </span>
    );
  }

  return (
    <span
      onClick={checkHealth}
      title={`Database disconnected (${dbState.error || 'Offline'}). Click to retry.`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 text-[10px] font-semibold cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
      <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
      <span className="hidden sm:inline">DB Offline</span>
      <RefreshCw className="w-2.5 h-2.5 opacity-60 ml-0.5" />
    </span>
  );
};

export default DatabaseStatusPill;
