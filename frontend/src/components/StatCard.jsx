import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendPositive = false,
  accent = 'blue',
  onClick
}) {
  const accentThemes = {
    blue: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      iconBg: 'bg-sky-500/10 text-sky-400',
      glow: 'hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]'
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]'
    },
    cyan: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
    },
    red: {
      border: 'border-red-500/20 hover:border-red-500/40',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    }
  };

  const theme = accentThemes[accent] || accentThemes.blue;

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden group ${theme.border} ${theme.glow} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.iconBg} border border-white/5`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {subtext && (
          <span className="text-slate-400 truncate max-w-[170px]">{subtext}</span>
        )}
        {trend && (
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
