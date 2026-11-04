import React from 'react';
import RiskBadge from './RiskBadge';
import { Activity, Shield, Network, Laptop, Mail } from 'lucide-react';

export default function ScoreGauge({ score = 50, level = 'Medium', subScores = {}, weights = {} }) {
  const clampedScore = Math.min(100, Math.max(0, Number(score) || 0));
  
  // Circumference calculation for SVG circle gauge
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc gauge
  const arcPercentage = 0.75;
  const arcLength = circumference * arcPercentage;
  const offset = arcLength - (clampedScore / 100) * arcLength;

  const getColor = (s) => {
    if (s < 25) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', text: 'text-emerald-400', label: 'Low Risk' };
    if (s < 50) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', text: 'text-amber-400', label: 'Medium Risk' };
    if (s < 75) return { stroke: '#f97316', glow: 'rgba(249,115,22,0.3)', text: 'text-orange-400', label: 'High Risk' };
    return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: 'text-red-400', label: 'Critical Risk' };
  };

  const theme = getColor(clampedScore);
  const netRisk = subScores.network_risk ?? 50;
  const endRisk = subScores.endpoint_risk ?? 50;
  const emlRisk = subScores.email_risk ?? 50;
  const wNet = weights.network ?? weights.net ?? 0.35;
  const wEnd = weights.endpoint ?? weights.end ?? 0.35;
  const wEml = weights.email ?? weights.eml ?? 0.30;

  return (
    <div className="glass-panel-elevated rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-between">
      {/* Background radial glow */}
      <div 
        className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none -top-10 -right-10 opacity-20"
        style={{ backgroundColor: theme.stroke }}
      />

      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide uppercase">Enterprise Risk Gauge</h3>
        </div>
        <RiskBadge level={level} size="sm" />
      </div>

      {/* Radial Gauge Visual */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-56 h-56 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Dynamic Fill Arc */}
          <circle
            cx="112"
            cy="112"
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
          />
        </svg>

        {/* Centered Score Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            {clampedScore.toFixed(1)}
          </span>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-400">/ 100</span>
          <div className="mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.text}`}>
              {level.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Vector Signal Breakdown */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-sky-500/10">
          <div className="flex items-center justify-center gap-1 text-sky-400 text-xs mb-1">
            <Network className="w-3.5 h-3.5" />
            <span>Network</span>
          </div>
          <div className="font-bold text-slate-200 text-sm">{netRisk}</div>
          <div className="text-[10px] text-slate-400 font-mono">{(wNet * 100).toFixed(0)}% wt</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-indigo-500/10">
          <div className="flex items-center justify-center gap-1 text-indigo-400 text-xs mb-1">
            <Laptop className="w-3.5 h-3.5" />
            <span>Endpoint</span>
          </div>
          <div className="font-bold text-slate-200 text-sm">{endRisk}</div>
          <div className="text-[10px] text-slate-400 font-mono">{(wEnd * 100).toFixed(0)}% wt</div>
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-purple-500/10">
          <div className="flex items-center justify-center gap-1 text-purple-400 text-xs mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </div>
          <div className="font-bold text-slate-200 text-sm">{emlRisk}</div>
          <div className="text-[10px] text-slate-400 font-mono">{(wEml * 100).toFixed(0)}% wt</div>
        </div>
      </div>

      {/* Formula Readout */}
      <div className="w-full mt-3 px-3 py-1.5 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 text-center truncate">
        Risk = ({netRisk}×{wNet.toFixed(2)}) + ({endRisk}×{wEnd.toFixed(2)}) + ({emlRisk}×{wEml.toFixed(2)}) = <span className="text-white font-semibold">{clampedScore.toFixed(1)}</span>
      </div>
    </div>
  );
}
