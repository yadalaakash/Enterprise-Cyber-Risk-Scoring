import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Network,
  Laptop,
  Mail,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { api } from '../services/api';

export default function RiskReportPage({ selectedScanId = null }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport(selectedScanId);
  }, [selectedScanId]);

  const loadReport = async (id) => {
    try {
      setLoading(true);
      const res = await api.getReport(id);
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 font-mono text-sm">
        <Activity className="w-6 h-6 animate-spin text-sky-400 mr-2" />
        Compiling Executive CISO Cyber-Risk Assessment Report...
      </div>
    );
  }

  const {
    report_id,
    generated_at,
    enterprise_name,
    ciso_briefing,
    vector_breakdown,
    formula_applied,
    detected_threats_count,
    model_predictions,
    recommendations
  } = report;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto print:p-0 print:max-w-none">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Enterprise Cyber-Risk Assessment Report
            </h1>
            <span className="text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">
              {report_id}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Formal CISO executive threat brief with multi-model validation and prioritized remediation roadmap
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(56,189,248,0.25)] transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div
        id="risk-report-document"
        className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 bg-slate-900/90 print:bg-white print:text-black print:border-none print:shadow-none print:p-4"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-gray-300">
          <div>
            <div className="flex items-center gap-2 text-sky-400 print:text-sky-700 text-xs font-mono font-bold tracking-widest uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>CISO CYBERSECURITY OPERATIONS ASSESSMENT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black">
              {enterprise_name}
            </h2>
            <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
              Evaluation Timestamp: {generated_at} UTC • System Doc: {report_id}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
            <RiskBadge level={ciso_briefing.risk_classification} size="lg" />
            <span className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1.5">
              Score: <strong className="text-white print:text-black font-extrabold">{ciso_briefing.overall_risk_score} / 100</strong>
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-5 rounded-2xl bg-slate-950/70 print:bg-gray-100 border border-slate-800 print:border-gray-200">
          <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 print:text-sky-800 font-bold mb-2">
            Executive Briefing & Exposure Posture
          </h3>
          <p className="text-sm text-slate-300 print:text-gray-800 leading-relaxed font-sans">
            {ciso_briefing.executive_summary}
          </p>
        </div>

        {/* Multi-Vector Mathematical Breakdown */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 print:text-gray-600 font-bold mb-3">
            Multi-Vector Risk Breakdown & Weight Calibration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Network Vector */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-gray-50 border border-sky-500/20 print:border-gray-200">
              <div className="flex items-center gap-1.5 text-sky-400 print:text-sky-700 text-xs font-semibold mb-1">
                <Network className="w-3.5 h-3.5" />
                <span>Network Security Vector</span>
              </div>
              <div className="text-2xl font-bold text-white print:text-black">
                {vector_breakdown.network_risk} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
                Weight: {(vector_breakdown.network_weight * 100).toFixed(0)}% • Contrib: +{vector_breakdown.network_contribution} pts
              </div>
            </div>

            {/* Endpoint Vector */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-gray-50 border border-indigo-500/20 print:border-gray-200">
              <div className="flex items-center gap-1.5 text-indigo-400 print:text-indigo-700 text-xs font-semibold mb-1">
                <Laptop className="w-3.5 h-3.5" />
                <span>Endpoint Security Vector</span>
              </div>
              <div className="text-2xl font-bold text-white print:text-black">
                {vector_breakdown.endpoint_risk} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
                Weight: {(vector_breakdown.endpoint_weight * 100).toFixed(0)}% • Contrib: +{vector_breakdown.endpoint_contribution} pts
              </div>
            </div>

            {/* Email Vector */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-gray-50 border border-purple-500/20 print:border-gray-200">
              <div className="flex items-center gap-1.5 text-purple-400 print:text-purple-700 text-xs font-semibold mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Email Gateway Vector</span>
              </div>
              <div className="text-2xl font-bold text-white print:text-black">
                {vector_breakdown.email_risk} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-gray-600 mt-1">
                Weight: {(vector_breakdown.email_weight * 100).toFixed(0)}% • Contrib: +{vector_breakdown.email_contribution} pts
              </div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-950 print:bg-gray-100 border border-slate-800 print:border-gray-200 text-xs font-mono text-slate-400 print:text-gray-700 text-center">
            {formula_applied}
          </div>
        </div>

        {/* Machine Learning Multi-Model Consensus */}
        {model_predictions && Object.keys(model_predictions).length > 0 && (
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 print:text-gray-600 font-bold mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Machine Learning Ensemble Model Consensus
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(model_predictions).map(([modelKey, modelVal]) => (
                <div
                  key={modelKey}
                  className="p-3.5 rounded-xl bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-200"
                >
                  <span className="text-[10px] font-mono uppercase text-slate-400 print:text-gray-600 block mb-1">
                    {modelKey.replace('_', ' ')}
                  </span>
                  <div className="text-sm font-bold text-white print:text-black">
                    {typeof modelVal === 'object' ? modelVal.prediction : modelVal}
                  </div>
                  {typeof modelVal === 'object' && modelVal.confidence && (
                    <span className="text-[11px] font-mono text-emerald-400 print:text-emerald-700 block mt-0.5">
                      Conf: {modelVal.confidence}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actionable Security Recommendations */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 print:text-gray-600 font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            CISO-Prioritized Remediation Roadmap
          </h3>

          <div className="space-y-3">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 print:bg-gray-50 border border-slate-800 print:border-gray-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400 print:text-sky-700">
                        {rec.category || 'Defense Remediation'}
                      </span>
                      {rec.priority && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold ${
                            rec.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400 print:text-red-700'
                              : rec.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-400 print:text-orange-700'
                              : 'bg-amber-500/20 text-amber-400 print:text-amber-700'
                          }`}
                        >
                          {rec.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 print:text-gray-900 font-medium leading-relaxed">
                      {typeof rec === 'string' ? rec : rec.action}
                    </p>
                    {rec.impact && (
                      <p className="text-[11px] text-slate-400 print:text-gray-600 font-sans">
                        Expected Impact: {rec.impact}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">No active mitigation steps pending.</div>
            )}
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 print:text-gray-500 font-mono gap-2">
          <span>Enterprise Cyber-Risk AI Scoring Engine • Automated Audit Report</span>
          <span>Classification: CONFIDENTIAL / SOC INTERNAL</span>
        </div>
      </div>
    </div>
  );
}
