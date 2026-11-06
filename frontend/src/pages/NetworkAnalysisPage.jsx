import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Server,
  Download,
  Filter,
  CheckCircle,
  Ban,
  Radio,
  ArrowDownCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';

export default function NetworkAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedIps, setBlockedIps] = useState(new Set());

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      const res = await api.getNetworkAnalysis();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const handleBlockIp = (ip) => {
    setBlockedIps(prev => new Set(prev).add(ip));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <Activity className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        Ingesting Perimeter Network Flow Telemetry...
      </div>
    );
  }

  const {
    network_threat_score = 62.0,
    network_risk_classification = 'High',
    total_traffic_mb = 1420.5,
    failed_login_attempts = 48,
    port_scan_alerts_count = 14,
    suspicious_ips_detected = 6,
    traffic_by_protocol = [],
    recent_events = [],
    top_suspicious_ips = []
  } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Network Security & Perimeter Telemetry Analysis
            </h1>
            <RiskBadge level={network_risk_classification} score={network_threat_score} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Ingress/Egress traffic inspection, port scanning sweeps, foreign IP reputation, and brute-force indicators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://enterprise-cyber-risk-scoring.onrender.com/api/sample-datasets/network"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Network CSV</span>
          </a>

          <button
            onClick={loadNetworkData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Live Re-Poll</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Network Threat Sub-Score"
          value={`${network_threat_score} / 100`}
          subtext={`Classified as ${network_risk_classification}`}
          icon={Activity}
          accent="blue"
        />

        <StatCard
          title="Failed Login Attempts"
          value={failed_login_attempts}
          subtext="Repeated SSH/RDP/VPN auth rejections"
          icon={AlertTriangle}
          accent="red"
          trend="High Auth Noise"
          trendPositive={false}
        />

        <StatCard
          title="Port Scanning Alerts"
          value={port_scan_alerts_count}
          subtext="SYN sweeps & automated reconnaissance"
          icon={Network}
          accent="purple"
          trend="Active Probes"
          trendPositive={false}
        />

        <StatCard
          title="Total Inspected Traffic"
          value={`${total_traffic_mb.toLocaleString()} MB`}
          subtext="NetFlow across monitored subnets"
          icon={Server}
          accent="cyan"
        />
      </div>

      {/* Protocol Breakdown & Suspicious IP Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Traffic Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-1">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-400" />
            Traffic Ingestion by Protocol (MB)
          </h3>
          <p className="text-xs text-slate-400 mb-4">Volume distribution across network ports</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={traffic_by_protocol} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="protocol" stroke="#64748b" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="megabytes" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Megabytes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Suspicious IP Addresses */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" />
                Identified Malicious & Suspicious External IP Addresses
              </h3>
              <p className="text-xs text-slate-400">Reputation matches against threat intelligence blacklists</p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              {top_suspicious_ips.length} High Risk Sources
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Suspicious Source IP</th>
                  <th className="py-2.5 px-3">Target Subnet</th>
                  <th className="py-2.5 px-3">Port & Protocol</th>
                  <th className="py-2.5 px-3">Packet Anomaly</th>
                  <th className="py-2.5 px-3">Threat Tier</th>
                  <th className="py-2.5 px-3 text-right">Firewall Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {top_suspicious_ips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-500">
                      No external suspicious IPs flagged in current flow window.
                    </td>
                  </tr>
                ) : (
                  top_suspicious_ips.map((ipRec, idx) => {
                    const isBlocked = blockedIps.has(ipRec.source_ip);
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-red-400">
                          {ipRec.source_ip}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {ipRec.destination_ip}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {ipRec.destination_port} / {ipRec.protocol}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">
                          {(ipRec.packet_anomaly_score * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <RiskBadge level={ipRec.threat_level >= 3 ? 'Critical' : 'High'} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleBlockIp(ipRec.source_ip)}
                            disabled={isBlocked}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              isBlocked
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer'
                            }`}
                          >
                            {isBlocked ? 'Shunned' : 'Block IP'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Granular Network Events Feed */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
          <Network className="w-5 h-5 text-sky-400" />
          Recent Network Telemetry Events Stream
        </h3>
        <p className="text-xs text-slate-400 mb-4">Ingested perimeter flows with anomaly evaluations</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Source & Port</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Volume (MB)</th>
                <th className="py-2.5 px-3">Failed Logins</th>
                <th className="py-2.5 px-3">Port Scans</th>
                <th className="py-2.5 px-3 text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recent_events.map((evt) => (
                <tr key={evt.record_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-sky-400 font-semibold">{evt.record_id}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{evt.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {evt.source_ip}:{evt.destination_port}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{evt.destination_ip}</td>
                  <td className="py-2.5 px-3 text-slate-400">{evt.bytes_transferred_mb} MB</td>
                  <td className="py-2.5 px-3">
                    {evt.failed_logins > 0 ? (
                      <span className="text-amber-400 font-bold">{evt.failed_logins}</span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {evt.port_scan_count > 0 ? (
                      <span className="text-red-400 font-bold">{evt.port_scan_count}</span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <RiskBadge
                      level={evt.risk_score >= 75 ? 'Critical' : evt.risk_score >= 50 ? 'High' : evt.risk_score >= 25 ? 'Medium' : 'Low'}
                      score={evt.risk_score}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
