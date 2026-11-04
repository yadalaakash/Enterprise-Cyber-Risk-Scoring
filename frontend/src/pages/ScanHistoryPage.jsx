import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  FileText,
  Activity,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';

export default function ScanHistoryPage({ onSelectScanForReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getScanHistory();
      setHistory(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesTier = filterTier === 'All' || item.risk_level.toLowerCase() === filterTier.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      item.scan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.timestamp.includes(searchTerm);
    return matchesTier && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <Activity className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        Retrieving Security Scan Archives from SQLite Store...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Security Telemetry Scan Archives & Audit Trail
            </h1>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
              {history.length} Saved Scans
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Immutable log of all ad-hoc, scheduled, and batch AI ensemble risk assessments
          </p>
        </div>

        {/* Search & Tier Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter scan name, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-48"
            />
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
            {['All', 'Low', 'Medium', 'High', 'Critical'].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterTier === tier
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scans Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Scan Description</th>
                <th className="py-3 px-4">Risk Classification</th>
                <th className="py-3 px-4">Threat Score</th>
                <th className="py-3 px-4">Vector Breakdown (Net / End / Eml)</th>
                <th className="py-3 px-4">Threats Flagged</th>
                <th className="py-3 px-4 text-right">Detailed Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 font-mono">
                    No scan archives match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      #{scan.id.toString().padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {scan.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-[200px] truncate">
                      {scan.scan_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={scan.risk_level} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-lg text-white">
                      {scan.risk_score}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">/100</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <span className="text-sky-400">{scan.network_risk}</span> /{' '}
                      <span className="text-indigo-400">{scan.endpoint_risk}</span> /{' '}
                      <span className="text-purple-400">{scan.email_risk}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {scan.total_threats > 0 ? (
                        <span className="text-red-400">{scan.total_threats} threats</span>
                      ) : (
                        <span className="text-emerald-400">0 threats</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectScanForReport(scan.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 text-xs font-semibold border border-slate-800 hover:border-sky-500/40 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
