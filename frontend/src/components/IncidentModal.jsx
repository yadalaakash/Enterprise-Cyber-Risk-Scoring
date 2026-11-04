import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Clock, ArrowRight, Server, Shield } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function IncidentModal({ incident, onClose, onUpdateStatus }) {
  if (!incident) return null;

  const [currentStatus, setCurrentStatus] = useState(incident.status || 'Open');
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses = ['Open', 'Investigating', 'Mitigated', 'Resolved'];

  const handleStatusChange = async (newStat) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(incident.id, newStat);
      setCurrentStatus(newStat);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <RiskBadge level={incident.severity} size="sm" />
                <span className="text-xs font-mono text-slate-400">{incident.source} Vector</span>
              </div>
              <h3 className="font-bold text-white text-base leading-snug">{incident.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Incident Description & Threat Telemetry
            </label>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed">
              {incident.description}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Target Entity / Host</span>
              <span className="text-xs font-mono text-sky-400 font-semibold">{incident.entity}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Logged Timestamp</span>
              <span className="text-xs font-mono text-slate-300">{incident.timestamp}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              SOC Containment Lifecycle Status
            </label>
            <div className="grid grid-cols-4 gap-2">
              {statuses.map((s) => {
                const active = currentStatus === s;
                return (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(s)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      active
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
          >
            Close Incident
          </button>
        </div>
      </div>
    </div>
  );
}
