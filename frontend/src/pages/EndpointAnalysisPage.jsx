import React, { useState, useEffect } from 'react';
import {
  Laptop,
  ShieldAlert,
  Cpu,
  AlertOctagon,
  Download,
  Activity,
  Lock,
  Terminal,
  Server
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

export default function EndpointAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isolatedHosts, setIsolatedHosts] = useState(new Set());

  const loadEndpointData = async () => {
    try {
      setLoading(true);
      const res = await api.getEndpointAnalysis();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEndpointData();
  }, []);

  const handleIsolateHost = (hostname) => {
    setIsolatedHosts(prev => new Set(prev).add(hostname));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <Activity className="w-6 h-6 animate-spin text-purple-400 mr-2" />
        Ingesting Host Endpoint Sensor Telemetry...
      </div>
    );
  }

  const {
    endpoint_threat_score = 55.0,
    endpoint_risk_classification = 'High',
    monitored_devices = 60,
    malware_detection_alerts = 8,
    suspicious_processes_detected = 12,
    unauthorized_access_attempts = 19,
    device_risk_distribution = [],
    endpoint_devices = [],
    malware_incidents = []
  } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Host Endpoint & Fleet Behavior Posture
            </h1>
            <RiskBadge level={endpoint_risk_classification} score={endpoint_threat_score} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            EDR sensor indicators, process injection anomalies, malware signatures, and credential access monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/sample-datasets/endpoint"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Endpoint CSV</span>
          </a>

          <button
            onClick={loadEndpointData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Re-Scan Fleet</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Endpoint Threat Sub-Score"
          value={`${endpoint_threat_score} / 100`}
          subtext={`Classified as ${endpoint_risk_classification}`}
          icon={Activity}
          accent="purple"
        />

        <StatCard
          title="Active Malware Detections"
          value={malware_detection_alerts}
          subtext="Trojan, ransomware canary & rootkit indicators"
          icon={ShieldAlert}
          accent="red"
          trend="Quarantine Req."
          trendPositive={false}
        />

        <StatCard
          title="Suspicious Processes"
          value={suspicious_processes_detected}
          subtext="LoLBin abuse, powershell & token manipulation"
          icon={Terminal}
          accent="amber"
          trend="Anomalous PID"
          trendPositive={false}
        />

        <StatCard
          title="Unauthorized Access Events"
          value={unauthorized_access_attempts}
          subtext="Privilege escalation & UAC bypass probes"
          icon={Lock}
          accent="blue"
        />
      </div>

      {/* Distribution Chart & Malware Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Risk Tier Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-1">
          <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Device Risk Tier Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Fleet health segmentation</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={device_risk_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tier" stroke="#64748b" fontSize={9} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="Device Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Malware Alerts */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                High-Severity Endpoint Malware Alerts
              </h3>
              <p className="text-xs text-slate-400">Heuristic memory analysis & abnormal registry modifications</p>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              {malware_incidents.length} Critical Workstations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Hostname</th>
                  <th className="py-2.5 px-3">User & OS</th>
                  <th className="py-2.5 px-3">Suspicious Procs</th>
                  <th className="py-2.5 px-3">Malware Count</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3 text-right">EDR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {malware_incidents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-500">
                      No critical endpoint malware alerts detected in current sample.
                    </td>
                  </tr>
                ) : (
                  malware_incidents.map((dev, idx) => {
                    const isIsolated = isolatedHosts.has(dev.hostname);
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-300">
                          {dev.hostname}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {dev.user} ({dev.os_name})
                        </td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 font-semibold">
                          {dev.suspicious_processes}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-red-400 font-bold">
                          {dev.malware_indicators}
                        </td>
                        <td className="py-2.5 px-3">
                          <RiskBadge level={dev.risk_score >= 75 ? 'Critical' : 'High'} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleIsolateHost(dev.hostname)}
                            disabled={isIsolated}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              isIsolated
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer'
                            }`}
                          >
                            {isIsolated ? 'Isolated' : 'Isolate Host'}
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

      {/* Monitored Endpoint Devices Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-purple-400" />
          Enterprise Endpoint Devices Fleet Status
        </h3>
        <p className="text-xs text-slate-400 mb-4">Real-time host sensor telemetry and privilege escalation audit</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Device Record</th>
                <th className="py-2.5 px-3">Hostname</th>
                <th className="py-2.5 px-3">Operating System</th>
                <th className="py-2.5 px-3">Active User</th>
                <th className="py-2.5 px-3">Susp. Processes</th>
                <th className="py-2.5 px-3">Registry Mods</th>
                <th className="py-2.5 px-3">Priv. Escalation</th>
                <th className="py-2.5 px-3 text-right">Device Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {endpoint_devices.map((dev) => (
                <tr key={dev.record_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-purple-400 font-semibold">{dev.record_id}</td>
                  <td className="py-2.5 px-3 text-white font-bold">{dev.hostname}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans">{dev.os_name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{dev.user}</td>
                  <td className="py-2.5 px-3">
                    {dev.suspicious_processes > 0 ? (
                      <span className="text-amber-400 font-bold">{dev.suspicious_processes}</span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{dev.registry_modifications}</td>
                  <td className="py-2.5 px-3">
                    {dev.privilege_escalation_flag === 1 ? (
                      <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                        DETECTED
                      </span>
                    ) : (
                      <span className="text-slate-500">Clean</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <RiskBadge
                      level={dev.risk_score >= 75 ? 'Critical' : dev.risk_score >= 50 ? 'High' : dev.risk_score >= 25 ? 'Medium' : 'Low'}
                      score={dev.risk_score}
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
