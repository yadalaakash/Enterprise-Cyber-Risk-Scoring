import React, { useState, useEffect } from 'react';
import {
  Mail,
  ShieldAlert,
  AlertTriangle,
  Download,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  Ban,
  AtSign,
  Paperclip,
  Radio
} from 'lucide-react';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';

export default function EmailAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quarantinedIds, setQuarantinedIds] = useState(new Set());

  const loadEmailData = async () => {
    try {
      setLoading(true);
      const res = await api.getEmailAnalysis();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmailData();
  }, []);

  const handleQuarantine = (recordId) => {
    setQuarantinedIds(prev => new Set(prev).add(recordId));
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <Activity className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
        Ingesting Email Gateway & Message Filtering Telemetry...
      </div>
    );
  }

  const {
    email_threat_score = 46.0,
    email_risk_classification = 'Medium',
    total_emails_analyzed = 4512,
    phishing_emails_detected = 16,
    malicious_attachments_detected = 9,
    suspicious_senders_count = 14,
    spf_dkim_failures = 12,
    recent_emails = [],
    flagged_emails = []
  } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Email Security Gateway & Phishing Defense
            </h1>
            <RiskBadge level={email_risk_classification} score={email_threat_score} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            DMARC/SPF authentication, spear-phishing heuristics, weaponized attachment detonation, and sender reputation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://enterprise-cyber-risk-scoring.onrender.com/api/sample-datasets/email"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Email CSV</span>
          </a>

          <button
            onClick={loadEmailData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Re-Filter Inbound</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Email Threat Sub-Score"
          value={`${email_threat_score} / 100`}
          subtext={`Classified as ${email_risk_classification}`}
          icon={Activity}
          accent="cyan"
        />

        <StatCard
          title="Phishing Emails Detected"
          value={phishing_emails_detected}
          subtext="Credential harvesters & executive spoofing"
          icon={Mail}
          accent="red"
          trend="Targeted BEC"
          trendPositive={false}
        />

        <StatCard
          title="Malicious Attachments"
          value={malicious_attachments_detected}
          subtext="Macro-enabled documents & archive payloads"
          icon={Paperclip}
          accent="amber"
          trend="Detonated"
          trendPositive={false}
        />

        <StatCard
          title="Total Inbound Scanned"
          value={total_emails_analyzed.toLocaleString()}
          subtext="Corporate MX gateway messages"
          icon={AtSign}
          accent="blue"
        />
      </div>

      {/* Flagged Emails Interception List */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              High-Risk Flagged Emails & Malicious Campaigns
            </h3>
            <p className="text-xs text-slate-400">Interception queue requiring mailbox retraction</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            {flagged_emails.length} Threat Campaigns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Sender Email & Domain</th>
                <th className="py-2.5 px-3">Target Recipient</th>
                <th className="py-2.5 px-3">Subject Line</th>
                <th className="py-2.5 px-3">Phishing Score</th>
                <th className="py-2.5 px-3">Attachment</th>
                <th className="py-2.5 px-3">SPF/DKIM</th>
                <th className="py-2.5 px-3 text-right">Quarantine Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {flagged_emails.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-slate-500">
                    No active high-risk emails flagged in current queue.
                  </td>
                </tr>
              ) : (
                flagged_emails.map((eml, idx) => {
                  const isQuarantined = quarantinedIds.has(eml.record_id);
                  return (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                        {eml.sender_email}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {eml.recipient_email}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {eml.subject}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-amber-400 font-bold">
                          {(eml.phishing_keywords_score * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {eml.malicious_attachment_flag === 1 ? (
                          <span className="text-red-400 font-mono text-[11px] font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                            WEAPONIZED
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {eml.spf_dkim_fail === 1 ? (
                          <span className="text-red-400 font-mono text-[11px] font-bold">FAILED</span>
                        ) : (
                          <span className="text-emerald-400 font-mono text-[11px]">PASS</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleQuarantine(eml.record_id)}
                          disabled={isQuarantined}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            isQuarantined
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 cursor-pointer'
                          }`}
                        >
                          {isQuarantined ? 'Quarantined' : 'Quarantine Email'}
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

      {/* General Email Ingestion Stream */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
          <Mail className="w-5 h-5 text-sky-400" />
          Recent Inbound Email Telemetry Stream
        </h3>
        <p className="text-xs text-slate-400 mb-4">Live inspection log across gateway message headers</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Message ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Sender</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Links</th>
                <th className="py-2.5 px-3">Phish Score</th>
                <th className="py-2.5 px-3 text-right">Email Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recent_emails.map((msg) => (
                <tr key={msg.record_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 text-cyan-400 font-semibold">{msg.record_id}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{msg.timestamp}</td>
                  <td className="py-2.5 px-3 text-slate-300">{msg.sender_email}</td>
                  <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[200px]">{msg.subject}</td>
                  <td className="py-2.5 px-3 text-slate-400">{msg.link_count}</td>
                  <td className="py-2.5 px-3 text-amber-400">
                    {(msg.phishing_keywords_score * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <RiskBadge
                      level={msg.risk_score >= 75 ? 'Critical' : msg.risk_score >= 50 ? 'High' : msg.risk_score >= 25 ? 'Medium' : 'Low'}
                      score={msg.risk_score}
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
