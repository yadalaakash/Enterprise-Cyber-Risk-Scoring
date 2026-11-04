import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level = 'Low', score = null, size = 'md' }) {
  const normLevel = (level || 'Low').toLowerCase();

  const configs = {
    low: {
      label: 'Low Risk',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      Icon: ShieldCheck
    },
    medium: {
      label: 'Medium Risk',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      Icon: AlertTriangle
    },
    high: {
      label: 'High Risk',
      color: 'bg-orange-500/15 text-orange-400 border-orange-500/35',
      dot: 'bg-orange-400',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
      Icon: AlertOctagon
    },
    critical: {
      label: 'Critical Risk',
      color: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
      dot: 'bg-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
      Icon: ShieldAlert
    }
  };

  const current = configs[normLevel] || configs.low;
  const Icon = current.Icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${current.color} ${current.glow} ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot} animate-ping-slow`} />
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{level}</span>
      {score !== null && (
        <span className="opacity-80 text-xs ml-0.5">({score})</span>
      )}
    </span>
  );
}
