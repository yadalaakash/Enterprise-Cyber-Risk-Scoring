import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Network,
  Laptop,
  Mail,
  Cpu,
  FileText,
  History,
  Home,
  Sliders,
  ChevronRight,
  Radio,
  X
} from 'lucide-react';

export default function Sidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  riskLevel = 'Medium'
}) {
  const navItems = [
    { id: 'landing', label: 'Platform Overview', icon: Home, badge: 'Home' },
    { id: 'dashboard', label: 'Main SOC Dashboard', icon: LayoutDashboard, badge: 'CISO' },
    { id: 'network', label: 'Network Security', icon: Network },
    { id: 'endpoint', label: 'Endpoint Security', icon: Laptop },
    { id: 'email', label: 'Email Security', icon: Mail },
    { id: 'prediction', label: 'AI Ensemble Prediction', icon: Cpu, badge: 'ML' },
    { id: 'report', label: 'Risk Assessment Report', icon: FileText },
    { id: 'history', label: 'Scan History', icon: History }
  ];

  const getThreatBorder = () => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'high': return 'border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
      case 'medium': return 'border-amber-500/30';
      default: return 'border-emerald-500/30';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950/95 lg:bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-slate-100 text-sm tracking-wide flex items-center gap-1.5">
                  CYBER<span className="text-sky-400">RISK</span>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.2 rounded font-mono">
                    AI
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">SOC Defense Platform</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Posture Status Indicator */}
          <div className="mx-4 my-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <span className="text-xs font-mono uppercase text-slate-300">Live SOC Sensor</span>
            </div>
            <span className="text-[11px] text-sky-400 font-mono font-medium">ONLINE</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600/25 to-indigo-600/15 text-white border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Architecture Details */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/80">
            <div className="text-[11px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Ensemble Pipeline</span>
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              RF + DT + LR Soft Voting
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              99.0% Cross-Val Accuracy
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 text-center font-mono">
            Enterprise Security v2.4 SOC
          </div>
        </div>
      </aside>
    </>
  );
}
