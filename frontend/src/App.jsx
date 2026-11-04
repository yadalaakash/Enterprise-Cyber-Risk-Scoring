import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WeightsModal from './components/WeightsModal';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import NetworkAnalysisPage from './pages/NetworkAnalysisPage';
import EndpointAnalysisPage from './pages/EndpointAnalysisPage';
import EmailAnalysisPage from './pages/EmailAnalysisPage';
import EnsemblePredictionPage from './pages/EnsemblePredictionPage';
import RiskReportPage from './pages/RiskReportPage';
import ScanHistoryPage from './pages/ScanHistoryPage';

import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedScanIdForReport, setSelectedScanIdForReport] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setDashboardData(res);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const showToast = (msg, duration = 3500) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    showToast('Executing live multi-vector telemetry ingest and AI ensemble scoring...');
    try {
      const res = await api.triggerAnalyze();
      await fetchDashboard();
      showToast(`Analysis complete! Enterprise Risk Score calculated at ${res.risk_summary.enterprise_risk_score} (${res.risk_summary.classification}).`);
    } catch (e) {
      showToast(`Analysis failed: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveWeights = async (newWeights) => {
    try {
      await api.updateConfig(newWeights);
      await fetchDashboard();
      showToast('Risk scoring weights updated and applied across all vectors.');
    } catch (e) {
      showToast(`Failed to update weights: ${e.message}`);
    }
  };

  const handleUpdateIncidentStatus = async (id, status) => {
    try {
      await api.updateIncidentStatus(id, status);
      await fetchDashboard();
      showToast(`Incident #${id} containment status marked as "${status}".`);
    } catch (e) {
      showToast(`Failed to update status: ${e.message}`);
    }
  };

  const handleSelectScanForReport = (scanId) => {
    setSelectedScanIdForReport(scanId);
    setCurrentPage('report');
  };

  const currentRiskScore = dashboardData?.overall_risk_score ?? 54.6;
  const currentRiskLevel = dashboardData?.risk_classification ?? 'High';
  const currentWeights = dashboardData?.weights ?? { net: 0.35, end: 0.35, eml: 0.30 };
  const recentIncidents = dashboardData?.recent_incidents ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-black">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-sky-500/50 shadow-2xl text-xs font-semibold text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* When on Landing Page, render full-bleed Landing Experience without standard SOC frame */}
      {currentPage === 'landing' ? (
        <div>
          {/* Quick Landing Topbar */}
          <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-md flex items-center justify-center font-black text-sky-400 text-xs">
                  CR
                </div>
              </div>
              <span className="font-extrabold text-white text-sm tracking-wide">
                CYBER<span className="text-sky-400">RISK</span> AI
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer"
              >
                Launch SOC Dashboard
              </button>
            </div>
          </nav>

          <LandingPage onGetStarted={() => setCurrentPage('dashboard')} />
        </div>
      ) : (
        /* Full SOC Application Shell with Sidebar and Navbar */
        <div className="flex min-h-screen bg-slate-950">
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (page === 'report') setSelectedScanIdForReport(null);
              setCurrentPage(page);
            }}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            riskLevel={currentRiskLevel}
          />

          {/* Main Content Area (offset by sidebar width on lg screens) */}
          <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
            <Navbar
              currentPage={currentPage}
              onOpenSidebar={() => setSidebarOpen(true)}
              onTriggerAnalysis={handleTriggerAnalysis}
              onOpenWeights={() => setWeightsModalOpen(true)}
              isAnalyzing={isAnalyzing}
              overallScore={currentRiskScore}
              riskLevel={currentRiskLevel}
              incidents={recentIncidents}
            />

            <main className="flex-1 bg-slate-950 grid-bg-pattern">
              {currentPage === 'dashboard' && (
                <DashboardPage
                  dashboardData={dashboardData}
                  onRefresh={fetchDashboard}
                  onTriggerAnalyze={handleTriggerAnalysis}
                  onOpenWeights={() => setWeightsModalOpen(true)}
                  onNavigate={setCurrentPage}
                  onUpdateIncidentStatus={handleUpdateIncidentStatus}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {currentPage === 'network' && <NetworkAnalysisPage />}

              {currentPage === 'endpoint' && <EndpointAnalysisPage />}

              {currentPage === 'email' && <EmailAnalysisPage />}

              {currentPage === 'prediction' && (
                <EnsemblePredictionPage onNavigate={setCurrentPage} />
              )}

              {currentPage === 'report' && (
                <RiskReportPage selectedScanId={selectedScanIdForReport} />
              )}

              {currentPage === 'history' && (
                <ScanHistoryPage onSelectScanForReport={handleSelectScanForReport} />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Weights Tuning Modal */}
      <WeightsModal
        isOpen={weightsModalOpen}
        onClose={() => setWeightsModalOpen(false)}
        currentWeights={currentWeights}
        onSave={handleSaveWeights}
      />
    </div>
  );
}
