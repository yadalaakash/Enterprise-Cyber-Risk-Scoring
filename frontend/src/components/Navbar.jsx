import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Sliders,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function Navbar({
  currentPage,
  onOpenSidebar,
  onTriggerAnalysis,
  onOpenWeights,
  isAnalyzing = false,
  overallScore = 54.6,
  riskLevel = 'High',
  incidents = []
}) {
  const [time, setTime] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles = {
    landing: 'Cyber Defense Platform',
    dashboard: 'CISO Enterprise SOC Dashboard',
    network: 'Network Telemetry & Traffic Analysis',
    endpoint: 'Host Endpoint & Device Posture',
    email: 'Email Gateway & Phishing Defense',
    prediction: 'AI Multi-Model Ensemble Predictor',
    report: 'Enterprise Cyber-Risk Assessment Report',
    history: 'Security Telemetry Scan Archives'
  };

  const unreadIncidents = incidents.filter(i => i.status === 'Open').slice(0, 5);

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left Title & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base lg:text-lg font-bold text-white tracking-tight">
              {pageTitles[currentPage] || 'Cyber Risk Intelligence'}
            </h2>
            <RiskBadge level={riskLevel} score={overallScore} size="sm" />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              {time}
            </span>
            <span>•</span>
            <span className="text-emerald-400">Zero Trust Telemetry Engine</span>
          </div>
        </div>
      </div>

      {/* Right Controls & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Analyze Security Data Button */}
        <button
          onClick={onTriggerAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
            isAnalyzing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
          }`}
          title="Simulate telemetry ingest and run multi-vector risk evaluation"
        >
          <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">
            {isAnalyzing ? 'Analyzing...' : 'Analyze Security Data'}
          </span>
          <span className="sm:hidden">{isAnalyzing ? '...' : 'Analyze'}</span>
        </button>

        {/* Adjust Weights Configuration */}
        <button
          onClick={onOpenWeights}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          title="Configure Risk Scoring Weights"
        >
          <Sliders className="w-4 h-4 text-sky-400" />
        </button>

        {/* Notifications / Alerts Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Active Threat Alerts"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadIncidents.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadIncidents.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Active Alerts ({unreadIncidents.length})
                </span>
                <span className="text-[10px] font-mono text-sky-400">SOC Feed</span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                {unreadIncidents.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No active unaddressed alerts
                  </div>
                ) : (
                  unreadIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                          {inc.title}
                        </span>
                        <RiskBadge level={inc.severity} size="sm" />
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2">
                        {inc.description}
                      </p>
                      <div className="mt-1 text-[10px] text-slate-400 font-mono">
                        Target: {inc.entity}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
