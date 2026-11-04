import React, { useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Network,
  Laptop,
  Mail,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import ScoreGauge from '../components/ScoreGauge';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import IncidentModal from '../components/IncidentModal';

export default function DashboardPage({
  dashboardData,
  onRefresh,
  onTriggerAnalyze,
  onOpenWeights,
  onNavigate,
  onUpdateIncidentStatus,
  isAnalyzing = false
}) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentFilter, setIncidentFilter] = useState('All');
  const [incidentSearch, setIncidentSearch] = useState('');

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        Connecting to Security Operations Center Telemetry Stream...
      </div>
    );
  }

  const {
    overall_risk_score = 54.6,
    risk_classification = 'High',
    weights = { net: 0.35, end: 0.35, eml: 0.30 },
    counters = {},
    trends = [],
    network_distribution = [],
    endpoint_alerts = [],
    email_threat_analysis = [],
    risk_category_distribution = [],
    recent_incidents = [],
    latest_scan = {}
  } = dashboardData;

  // Filtered incidents
  const filteredIncidents = recent_incidents.filter((inc) => {
    const matchesFilter =
      incidentFilter === 'All' ||
      inc.source.toLowerCase() === incidentFilter.toLowerCase() ||
      inc.severity.toLowerCase() === incidentFilter.toLowerCase();
    const matchesSearch =
      incidentSearch === '' ||
      inc.title.toLowerCase().includes(incidentSearch.toLowerCase()) ||
      inc.entity.toLowerCase().includes(incidentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#fb923c'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Enterprise Cyber-Risk Operations Center
            </h1>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
              v2.4 LIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time multi-vector threat ingestion, machine learning ensemble fusion, and risk mitigation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={() => onNavigate('prediction')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Run AI Prediction</span>
          </button>
        </div>
      </div>

      {/* Top Row: Executive Risk Gauge & SOC Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CISO Radial Risk Gauge */}
        <div className="lg:col-span-1">
          <ScoreGauge
            score={overall_risk_score}
            level={risk_classification}
            subScores={{
              network_risk: latest_scan.network_risk ?? 62.0,
              endpoint_risk: latest_scan.endpoint_risk ?? 55.0,
              email_risk: latest_scan.email_risk ?? 46.0
            }}
            weights={weights}
          />
        </div>

        {/* Right 2 Columns: 4 Key Telemetry Stat Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Network Events Analyzed"
            value={counters.total_network_events?.toLocaleString() || '48,520'}
            subtext="Perimeter & internal packet telemetry"
            icon={Network}
            accent="blue"
            trend="+8.4% traffic"
            trendPositive={true}
            onClick={() => onNavigate('network')}
          />

          <StatCard
            title="Endpoint Device Security Alerts"
            value={counters.endpoint_alerts || '32'}
            subtext="Fleet hosts reporting anomalous behavior"
            icon={Laptop}
            accent="purple"
            trend="14 Critical"
            trendPositive={false}
            onClick={() => onNavigate('endpoint')}
          />

          <StatCard
            title="Email Gateway Threats Filtered"
            value={counters.email_threats || '89'}
            subtext="Phishing heuristics & weaponized payloads"
            icon={Mail}
            accent="cyan"
            trend="97.2% Blocked"
            trendPositive={true}
            onClick={() => onNavigate('email')}
          />

          <StatCard
            title="Active Suspicious Activities"
            value={counters.suspicious_activities || '7'}
            subtext="Open containment investigations"
            icon={AlertTriangle}
            accent="red"
            trend="Active Triage"
            trendPositive={false}
          />
        </div>
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Enterprise Cyber-Risk Scoring Historical Trend
              </h3>
              <p className="text-xs text-slate-400">Chronological telemetry evaluation timeline (0-100 Score)</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>View Archives</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="enterprise_score"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#riskScoreGrad)"
                  name="Risk Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Threat Distribution */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              Network Threat Distribution
            </h3>
            <p className="text-xs text-slate-400">Anomalous flows by attack taxonomy</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={network_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {network_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {network_distribution.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-mono text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoint Security Alerts */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Laptop className="w-4 h-4 text-purple-400" />
                Endpoint Security Alert Classifications
              </h3>
              <p className="text-xs text-slate-400">Host EDR heuristics and suspicious execution detections</p>
            </div>
            <button
              onClick={() => onNavigate('endpoint')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Inspect</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endpoint_alerts} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} name="Alert Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Threat Analysis (Detected vs Blocked) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Email Threat Interception Telemetry
              </h3>
              <p className="text-xs text-slate-400">Phishing heuristics: Detected vs Automated Quarantine</p>
            </div>
            <button
              onClick={() => onNavigate('email')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Inspect</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={email_threat_analysis} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="detected" fill="#f43f5e" name="Threats Detected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" fill="#10b981" name="Quarantined / Blocked" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Security Incidents Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Recent Enterprise Security Incidents & Threat Activity
            </h3>
            <p className="text-xs text-slate-400">Interactive SOC incident triage queue</p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entity, IP, host..."
                value={incidentSearch}
                onChange={(e) => setIncidentSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44"
              />
            </div>

            <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              {['All', 'Network', 'Endpoint', 'Email'].map((f) => (
                <button
                  key={f}
                  onClick={() => setIncidentFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    incidentFilter === f
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Vector</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Incident Title</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500">
                    No incidents match current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="hover:bg-slate-900/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono text-slate-300 font-semibold">{inc.source}</span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={inc.severity} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200 group-hover:text-sky-300">
                      {inc.title}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {inc.entity}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {inc.timestamp}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inc.status === 'Open'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : inc.status === 'Investigating'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : inc.status === 'Mitigated'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncident(inc);
                        }}
                        className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateStatus={async (id, status) => {
            await onUpdateIncidentStatus(id, status);
            setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}
    </div>
  );
}
