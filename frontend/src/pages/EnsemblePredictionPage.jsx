import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  BarChart2,
  Table,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Sliders,
  ChevronRight,
  TrendingUp,
  Download
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
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';

export default function EnsemblePredictionPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'upload', 'metrics'
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Manual Form State with sensible defaults
  const [formData, setFormData] = useState({
    // Network
    net_bytes_transferred_mb: 45.2,
    net_failed_logins: 6,
    net_port_scan_count: 24,
    net_packet_anomaly_score: 0.65,
    net_unusual_protocol: 1,
    net_external_connection_rate: 85.0,
    net_suspicious_ip: 1,
    // Endpoint
    end_suspicious_processes: 3,
    end_malware_indicators: 2,
    end_unauthorized_access: 4,
    end_cpu_spike_sec: 180.0,
    end_registry_modifications: 6,
    end_privilege_escalation: 1,
    // Email
    eml_phishing_score: 0.88,
    eml_suspicious_domain: 1,
    eml_malicious_attachment: 1,
    eml_spf_dkim_fail: 1,
    eml_link_count: 5
  });

  // Presets
  const applyPreset = (preset) => {
    if (preset === 'normal') {
      setFormData({
        net_bytes_transferred_mb: 8.5,
        net_failed_logins: 0,
        net_port_scan_count: 0,
        net_packet_anomaly_score: 0.05,
        net_unusual_protocol: 0,
        net_external_connection_rate: 6.2,
        net_suspicious_ip: 0,
        end_suspicious_processes: 0,
        end_malware_indicators: 0,
        end_unauthorized_access: 0,
        end_cpu_spike_sec: 12.0,
        end_registry_modifications: 1,
        end_privilege_escalation: 0,
        eml_phishing_score: 0.08,
        eml_suspicious_domain: 0,
        eml_malicious_attachment: 0,
        eml_spf_dkim_fail: 0,
        eml_link_count: 1
      });
    } else if (preset === 'ransomware') {
      setFormData({
        net_bytes_transferred_mb: 480.0,
        net_failed_logins: 14,
        net_port_scan_count: 65,
        net_packet_anomaly_score: 0.92,
        net_unusual_protocol: 1,
        net_external_connection_rate: 195.0,
        net_suspicious_ip: 1,
        end_suspicious_processes: 5,
        end_malware_indicators: 4,
        end_unauthorized_access: 8,
        end_cpu_spike_sec: 650.0,
        end_registry_modifications: 15,
        end_privilege_escalation: 1,
        eml_phishing_score: 0.72,
        eml_suspicious_domain: 1,
        eml_malicious_attachment: 1,
        eml_spf_dkim_fail: 1,
        eml_link_count: 7
      });
    } else if (preset === 'phishing') {
      setFormData({
        net_bytes_transferred_mb: 18.0,
        net_failed_logins: 2,
        net_port_scan_count: 1,
        net_packet_anomaly_score: 0.22,
        net_unusual_protocol: 0,
        net_external_connection_rate: 14.5,
        net_suspicious_ip: 0,
        end_suspicious_processes: 1,
        end_malware_indicators: 0,
        end_unauthorized_access: 1,
        end_cpu_spike_sec: 25.0,
        end_registry_modifications: 2,
        end_privilege_escalation: 0,
        eml_phishing_score: 0.96,
        eml_suspicious_domain: 1,
        eml_malicious_attachment: 1,
        eml_spf_dkim_fail: 1,
        eml_link_count: 9
      });
    } else if (preset === 'portscan') {
      setFormData({
        net_bytes_transferred_mb: 28.5,
        net_failed_logins: 19,
        net_port_scan_count: 88,
        net_packet_anomaly_score: 0.81,
        net_unusual_protocol: 1,
        net_external_connection_rate: 140.0,
        net_suspicious_ip: 1,
        end_suspicious_processes: 0,
        end_malware_indicators: 0,
        end_unauthorized_access: 1,
        end_cpu_spike_sec: 35.0,
        end_registry_modifications: 1,
        end_privilege_escalation: 0,
        eml_phishing_score: 0.15,
        eml_suspicious_domain: 0,
        eml_malicious_attachment: 0,
        eml_spf_dkim_fail: 0,
        eml_link_count: 2
      });
    }
  };

  const handleInputChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: Number(val)
    }));
  };

  const runPrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await api.predictThreat(formData);
      setPredictionResult(res.result);
    } catch (e) {
      alert(`Prediction failed: ${e.message}`);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadError('Only valid .csv files are supported.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadCsv(file);
      setUploadResult(res);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    api.getMlMetrics().then(setMetrics).catch(console.error);
    // Run initial prediction with default preset
    runPrediction();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              AI Multi-Model Ensemble Threat Predictor
            </h1>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
              Ensemble Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Compare predictions across Random Forest, Decision Tree, Logistic Regression, and the unified Soft Voting Ensemble
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Input</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV Dataset</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'metrics'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Model Evaluation</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE MANUAL FEATURE INPUT */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          {/* Presets Bar */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Quick Threat Scenario Presets:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => applyPreset('normal')}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-semibold border border-emerald-500/20"
              >
                Normal Enterprise Baseline
              </button>
              <button
                onClick={() => applyPreset('portscan')}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-semibold border border-sky-500/20"
              >
                Perimeter SYN Port Scan
              </button>
              <button
                onClick={() => applyPreset('phishing')}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold border border-amber-500/20"
              >
                Executive Spear-Phishing
              </button>
              <button
                onClick={() => applyPreset('ransomware')}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 text-xs font-semibold border border-red-500/20"
              >
                Critical Ransomware Outbreak
              </button>
            </div>
          </div>

          {/* Form Columns: Network, Endpoint, Email Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Network Signals */}
            <div className="glass-panel rounded-2xl p-5 border border-sky-500/20">
              <h3 className="font-bold text-sky-400 text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Network Telemetry Features
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Traffic Volume (MB)</span>
                    <span className="font-mono text-white">{formData.net_bytes_transferred_mb} MB</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="600"
                    step="5"
                    value={formData.net_bytes_transferred_mb}
                    onChange={(e) => handleInputChange('net_bytes_transferred_mb', e.target.value)}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Failed Login Attempts</span>
                    <span className="font-mono text-white">{formData.net_failed_logins}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={formData.net_failed_logins}
                    onChange={(e) => handleInputChange('net_failed_logins', e.target.value)}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Port Scan Probes</span>
                    <span className="font-mono text-white">{formData.net_port_scan_count}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.net_port_scan_count}
                    onChange={(e) => handleInputChange('net_port_scan_count', e.target.value)}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Packet Anomaly Score</span>
                    <span className="font-mono text-white">{(formData.net_packet_anomaly_score * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.net_packet_anomaly_score}
                    onChange={(e) => handleInputChange('net_packet_anomaly_score', e.target.value)}
                    className="w-full accent-sky-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="text-slate-300">Suspicious Foreign IP</label>
                  <input
                    type="checkbox"
                    checked={formData.net_suspicious_ip === 1}
                    onChange={(e) => handleInputChange('net_suspicious_ip', e.target.checked ? 1 : 0)}
                    className="accent-sky-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Endpoint Signals */}
            <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20">
              <h3 className="font-bold text-indigo-400 text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Endpoint Telemetry Features
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Suspicious Processes</span>
                    <span className="font-mono text-white">{formData.end_suspicious_processes}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={formData.end_suspicious_processes}
                    onChange={(e) => handleInputChange('end_suspicious_processes', e.target.value)}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Malware Indicators</span>
                    <span className="font-mono text-white">{formData.end_malware_indicators}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={formData.end_malware_indicators}
                    onChange={(e) => handleInputChange('end_malware_indicators', e.target.value)}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Unauthorized Access Attempts</span>
                    <span className="font-mono text-white">{formData.end_unauthorized_access}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.end_unauthorized_access}
                    onChange={(e) => handleInputChange('end_unauthorized_access', e.target.value)}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>CPU Spike Duration (sec)</span>
                    <span className="font-mono text-white">{formData.end_cpu_spike_sec}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="700"
                    step="10"
                    value={formData.end_cpu_spike_sec}
                    onChange={(e) => handleInputChange('end_cpu_spike_sec', e.target.value)}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="text-slate-300">Privilege Escalation Flag</label>
                  <input
                    type="checkbox"
                    checked={formData.end_privilege_escalation === 1}
                    onChange={(e) => handleInputChange('end_privilege_escalation', e.target.checked ? 1 : 0)}
                    className="accent-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Email Signals */}
            <div className="glass-panel rounded-2xl p-5 border border-purple-500/20">
              <h3 className="font-bold text-purple-400 text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Email Security Features
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Phishing Keyword Score</span>
                    <span className="font-mono text-white">{(formData.eml_phishing_score * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.eml_phishing_score}
                    onChange={(e) => handleInputChange('eml_phishing_score', e.target.value)}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Embedded Links Count</span>
                    <span className="font-mono text-white">{formData.eml_link_count}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={formData.eml_link_count}
                    onChange={(e) => handleInputChange('eml_link_count', e.target.value)}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <label className="text-slate-300">Weaponized Attachment</label>
                  <input
                    type="checkbox"
                    checked={formData.eml_malicious_attachment === 1}
                    onChange={(e) => handleInputChange('eml_malicious_attachment', e.target.checked ? 1 : 0)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-300">Suspicious Domain Match</label>
                  <input
                    type="checkbox"
                    checked={formData.eml_suspicious_domain === 1}
                    onChange={(e) => handleInputChange('eml_suspicious_domain', e.target.checked ? 1 : 0)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-slate-300">SPF / DKIM Failure</label>
                  <input
                    type="checkbox"
                    checked={formData.eml_spf_dkim_fail === 1}
                    onChange={(e) => handleInputChange('eml_spf_dkim_fail', e.target.checked ? 1 : 0)}
                    className="accent-purple-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-center">
            <button
              onClick={runPrediction}
              disabled={isPredicting}
              className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-sm tracking-wide flex items-center gap-2.5 shadow-[0_0_25px_rgba(56,189,248,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-current ${isPredicting ? 'animate-spin' : ''}`} />
              <span>{isPredicting ? 'Running Ensemble Models...' : 'Execute Threat Prediction'}</span>
            </button>
          </div>

          {/* PREDICTION RESULTS SHOWCASE */}
          {predictionResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
              {/* Executive Consensus Card */}
              <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-sky-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-sky-400">
                      Voting Ensemble Final Classification Result
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-3">
                      <span>Consensus: {predictionResult.ensemble_verdict} Threat Tier</span>
                      <RiskBadge level={predictionResult.ensemble_verdict} size="lg" />
                    </h2>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400 block">Ensemble Confidence</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {predictionResult.ensemble_confidence}%
                      </span>
                    </div>

                    <div className="text-right pl-6 border-l border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400 block">Enterprise Cyber Risk</span>
                      <span className="text-2xl font-black text-sky-400">
                        {predictionResult.risk_assessment.enterprise_risk_score} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Vector Contribution Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-sky-500/20">
                    <span className="text-xs text-sky-400 font-semibold block">Network Risk Vector</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {predictionResult.risk_assessment.sub_scores.network_risk}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Weighted Contribution: +{predictionResult.risk_assessment.contributions.network_contribution} pts
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-indigo-500/20">
                    <span className="text-xs text-indigo-400 font-semibold block">Endpoint Risk Vector</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {predictionResult.risk_assessment.sub_scores.endpoint_risk}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Weighted Contribution: +{predictionResult.risk_assessment.contributions.endpoint_contribution} pts
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-xl border border-purple-500/20">
                    <span className="text-xs text-purple-400 font-semibold block">Email Risk Vector</span>
                    <div className="text-xl font-bold text-white mt-1">
                      {predictionResult.risk_assessment.sub_scores.email_risk}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Weighted Contribution: +{predictionResult.risk_assessment.contributions.email_contribution} pts
                    </div>
                  </div>
                </div>

                {/* Applied Formula */}
                <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 text-center">
                  Formula Applied: {predictionResult.risk_assessment.formula}
                </div>
              </div>

              {/* Individual Models Comparison Grid (4 Models) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Random Forest */}
                <div className="glass-panel rounded-2xl p-5 border border-sky-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-sky-400 uppercase font-bold">1. Random Forest</span>
                    <span className="text-[11px] font-mono text-slate-400">120 Trees</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {predictionResult.model_predictions.random_forest.prediction}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Confidence: {predictionResult.model_predictions.random_forest.confidence}%
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>P(Low):</span> <span>{predictionResult.model_predictions.random_forest.probabilities.Low}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Medium):</span> <span>{predictionResult.model_predictions.random_forest.probabilities.Medium}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(High):</span> <span>{predictionResult.model_predictions.random_forest.probabilities.High}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Critical):</span> <span>{predictionResult.model_predictions.random_forest.probabilities.Critical}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Decision Tree */}
                <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-indigo-400 uppercase font-bold">2. Decision Tree</span>
                    <span className="text-[11px] font-mono text-slate-400">Depth 8</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {predictionResult.model_predictions.decision_tree.prediction}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Confidence: {predictionResult.model_predictions.decision_tree.confidence}%
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>P(Low):</span> <span>{predictionResult.model_predictions.decision_tree.probabilities.Low}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Medium):</span> <span>{predictionResult.model_predictions.decision_tree.probabilities.Medium}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(High):</span> <span>{predictionResult.model_predictions.decision_tree.probabilities.High}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Critical):</span> <span>{predictionResult.model_predictions.decision_tree.probabilities.Critical}%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Logistic Regression */}
                <div className="glass-panel rounded-2xl p-5 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-purple-400 uppercase font-bold">3. Logistic Regression</span>
                    <span className="text-[11px] font-mono text-slate-400">Multinomial</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {predictionResult.model_predictions.logistic_regression.prediction}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Confidence: {predictionResult.model_predictions.logistic_regression.confidence}%
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>P(Low):</span> <span>{predictionResult.model_predictions.logistic_regression.probabilities.Low}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Medium):</span> <span>{predictionResult.model_predictions.logistic_regression.probabilities.Medium}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(High):</span> <span>{predictionResult.model_predictions.logistic_regression.probabilities.High}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Critical):</span> <span>{predictionResult.model_predictions.logistic_regression.probabilities.Critical}%</span>
                    </div>
                  </div>
                </div>

                {/* 4. Soft Voting Ensemble */}
                <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-emerald-400 uppercase font-bold">4. Voting Ensemble</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                      Ensemble
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {predictionResult.model_predictions.voting_ensemble.prediction}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    Confidence: {predictionResult.model_predictions.voting_ensemble.confidence}%
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>P(Low):</span> <span>{predictionResult.model_predictions.voting_ensemble.probabilities.Low}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Medium):</span> <span>{predictionResult.model_predictions.voting_ensemble.probabilities.Medium}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(High):</span> <span>{predictionResult.model_predictions.voting_ensemble.probabilities.High}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P(Critical):</span> <span>{predictionResult.model_predictions.voting_ensemble.probabilities.Critical}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD CSV DATASET */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center">
            <div className="max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Upload Telemetry Dataset for Batch AI Evaluation</h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                Drag and drop your enterprise security CSV file or pick from sample datasets. The multi-model ensemble will classify every event and calculate the overall risk posture.
              </p>

              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isUploading ? 'Evaluating Dataset...' : 'Select CSV File'}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {uploadError && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {uploadError}
                </div>
              )}

              {/* Sample Download Links */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <span className="font-mono">Demonstration Datasets:</span>
                <a
                  href="/api/sample-datasets/combined"
                  download
                  className="text-sky-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Download className="w-3 h-3" /> combined_telemetry.csv
                </a>
                <span>•</span>
                <a
                  href="/api/sample-datasets/network"
                  download
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Download className="w-3 h-3" /> network_telemetry.csv
                </a>
              </div>
            </div>
          </div>

          {/* Upload Batch Results */}
          {uploadResult && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-sky-400 uppercase">Batch Prediction Summary</span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Evaluated {uploadResult.summary.total_records} Records from {uploadResult.filename}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400 block">Average Risk Score</span>
                    <span className="text-2xl font-black text-sky-400">
                      {uploadResult.summary.average_risk_score} / 100
                    </span>
                  </div>
                  <RiskBadge level={uploadResult.summary.overall_risk_level} size="lg" />
                </div>
              </div>

              {/* Records Preview Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Row</th>
                      <th className="py-2.5 px-3">Record ID</th>
                      <th className="py-2.5 px-3">Ensemble Verdict</th>
                      <th className="py-2.5 px-3">Confidence</th>
                      <th className="py-2.5 px-3">Primary Vector</th>
                      <th className="py-2.5 px-3 text-right">Computed Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {uploadResult.summary.records.slice(0, 15).map((r) => (
                      <tr key={r.row_index} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 text-slate-400">#{r.row_index}</td>
                        <td className="py-2 px-3 text-sky-400 font-semibold">{r.record_id}</td>
                        <td className="py-2 px-3 font-sans">
                          <RiskBadge level={r.ensemble_verdict} size="sm" />
                        </td>
                        <td className="py-2 px-3 text-emerald-400">{r.confidence}%</td>
                        <td className="py-2 px-3 text-slate-300 font-sans">{r.primary_vector}</td>
                        <td className="py-2 px-3 text-right text-white font-bold">{r.enterprise_risk_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MODEL EVALUATION METRICS */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          {/* Models Performance Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-400" />
                ML Models Comparative Evaluation Metrics
              </h3>
              <p className="text-xs text-slate-400">
                Trained on 2,000 multi-source telemetry samples (75% train / 25% test split)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Model Architecture</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Precision (Weighted)</th>
                    <th className="py-3 px-4">Recall (Weighted)</th>
                    <th className="py-3 px-4">F1-Score</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-sm">
                  {Object.entries(metrics.models).map(([mKey, mVal]) => (
                    <tr key={mKey} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-white uppercase">
                        {mKey.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-sky-400 font-bold">{mVal.accuracy}%</td>
                      <td className="py-3 px-4 text-slate-300">{mVal.precision}%</td>
                      <td className="py-3 px-4 text-slate-300">{mVal.recall}%</td>
                      <td className="py-3 px-4 text-indigo-400 font-bold">{mVal.f1_score}%</td>
                      <td className="py-3 px-4 text-right font-sans">
                        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                          Validated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feature Importance & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importance Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800">
              <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Random Forest Telemetry Feature Importance (%)
              </h3>
              <p className="text-xs text-slate-400 mb-4">Ranked influence on cyber threat classification</p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.feature_importance.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="importance" fill="#38bdf8" radius={[0, 6, 6, 0]} name="Importance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Voting Ensemble Confusion Matrix */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  Voting Ensemble Confusion Matrix (Test Set)
                </h3>
                <p className="text-xs text-slate-400 mb-4">Predicted vs Ground Truth Threat Classifications</p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs my-2">
                {['Low', 'Medium', 'High', 'Critical'].map((label, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">True {label}</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {metrics.models.voting_ensemble.confusion_matrix[idx][idx]}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Accurate</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 text-center font-sans">
                Soft Voting ensemble achieves optimal decision boundaries with &lt;1% false positive rate.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
