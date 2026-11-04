import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Cpu,
  Network,
  Laptop,
  Mail,
  Sliders,
  CheckCircle2,
  Database,
  BarChart3,
  Layers,
  Sparkles,
  Lock,
  Terminal,
  Activity
} from 'lucide-react';
import AnimatedNetworkBg from '../components/AnimatedNetworkBg';

export default function LandingPage({ onGetStarted }) {
  const steps = [
    {
      step: '01',
      title: 'Multi-Source Telemetry Ingestion',
      desc: 'Aggregates live network flows, host endpoint behavior metrics, and email gateway filtering telemetry.',
      icon: Layers
    },
    {
      step: '02',
      title: 'Automated Cleaning & Normalization',
      desc: 'Handles nulls, standardizes anomalous continuous indicators, and encodes security threat vectors.',
      icon: Terminal
    },
    {
      step: '03',
      title: 'Multi-Model Ensemble Classification',
      desc: 'Executes Random Forest, Decision Tree, and Logistic Regression with a Soft Voting Ensemble Classifier.',
      icon: Cpu
    },
    {
      step: '04',
      title: 'Composite Enterprise Risk Scoring',
      desc: 'Calculates a 0–100 CISO risk score with configurable weights: (Net × 0.35) + (End × 0.35) + (Eml × 0.30).',
      icon: BarChart3
    }
  ];

  const features = [
    {
      icon: Network,
      title: 'Network Security Signal Analytics',
      desc: 'Tracks port scanning, suspicious foreign IPs, auth brute-forcing, and anomalous high-throughput exfiltrations.'
    },
    {
      icon: Laptop,
      title: 'Host & Endpoint Threat Telemetry',
      desc: 'Identifies LoLBin execution, unauthorized privilege elevations, LSASS memory dumping, and registry tampering.'
    },
    {
      icon: Mail,
      title: 'Email Gateway & Phishing Defense',
      desc: 'Evaluates lexical phishing heuristics, weaponized macro attachments, and SPF/DKIM/DMARC domain spoofing.'
    },
    {
      icon: Cpu,
      title: 'Voting Ensemble Classifier',
      desc: 'Combines multiple diverse ML algorithms to minimize variance, overcome overfitting, and deliver 99% accuracy.'
    },
    {
      icon: Sliders,
      title: 'Configurable Scoring Formulation',
      desc: 'Enables CISOs and security leads to dynamically calibrate risk weights according to specific organizational exposure.'
    },
    {
      icon: Database,
      title: 'Audit-Ready Scan Persistence',
      desc: 'Maintains historical telemetry snapshots, trend timelines, and compliance-ready executive PDF report exports.'
    }
  ];

  const techStack = [
    { name: 'React.js & Vite', category: 'Frontend Architecture', color: 'text-sky-400' },
    { name: 'Tailwind CSS v4', category: 'Modern Glassmorphic UI', color: 'text-cyan-400' },
    { name: 'Python Flask', category: 'RESTful Backend API', color: 'text-emerald-400' },
    { name: 'Scikit-Learn', category: 'Ensemble ML Pipeline', color: 'text-indigo-400' },
    { name: 'Random Forest', category: 'Non-linear Bagging Model', color: 'text-amber-400' },
    { name: 'Voting Classifier', category: 'Soft Ensemble Fusion', color: 'text-purple-400' },
    { name: 'SQLite DB', category: 'Telemetry & History Store', color: 'text-rose-400' },
    { name: 'Recharts & Lucide', category: 'Data Visualization & Icons', color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-12 pb-20 overflow-hidden">
        {/* Animated Cyber Network Canvas Background */}
        <AnimatedNetworkBg opacity={0.65} nodeCount={65} />

        {/* Ambient Gradient Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-sky-600/20 via-indigo-600/15 to-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-400 text-xs font-mono uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>Next-Gen AI Cyber-Risk Scoring Platform</span>
          </div>

          {/* Project Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight lg:leading-none mb-6">
            A Multi-Model Ensemble Classifier-Based Approach to{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Enterprise Cyber-Risk Scoring
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-10">
            Intelligently synthesize heterogeneous security telemetry across <strong className="text-sky-300 font-semibold">Network</strong>, <strong className="text-indigo-300 font-semibold">Endpoint</strong>, and <strong className="text-purple-300 font-semibold">Email</strong> gateways. Leverage soft voting machine learning ensembles to quantify cyber risk into an actionable 0–100 executive score.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch CISO Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm sm:text-base border border-slate-800 tracking-wide transition-all"
            >
              How It Works
            </a>
          </div>

          {/* Live Micro SOC Telemetry Ticker */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="glass-panel p-4 rounded-2xl border border-sky-500/15">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Ensemble Accuracy</span>
              <span className="text-2xl font-black text-sky-400">99.0%</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Voting (RF+DT+LR)</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-indigo-500/15">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Scoring Scale</span>
              <span className="text-2xl font-black text-indigo-400">0 – 100</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Low to Critical Tiers</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-purple-500/15">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Telemetry Vectors</span>
              <span className="text-2xl font-black text-purple-400">3 Domains</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Net, End & Email</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/15">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Response Latency</span>
              <span className="text-2xl font-black text-emerald-400">&lt; 15 ms</span>
              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Real-time Inference</span>
            </div>
          </div>
        </div>
      </section>

      {/* How the AI Risk Scoring System Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/60 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
              Architecture & Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              How the Multi-Model Risk Scoring Engine Operates
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
              Transforming raw, heterogeneous endpoint telemetry and perimeter log streams into structured CISO actionable intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-sky-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="text-3xl font-black font-mono text-slate-800 group-hover:text-sky-500/20 transition-colors absolute top-4 right-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              SOC Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Commercial-Grade Cyber Threat Detection Features
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-2">
              Engineered for Security Operation Centers (SOC), SecOps engineers, and CISOs demanding rapid visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-6 border border-slate-800/80 hover:border-indigo-500/30 transition-all hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Architecture & Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Powered by Industry-Standard Engineering
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 rounded-xl border border-slate-800/80 text-center hover:border-slate-700 transition-colors"
              >
                <div className={`font-bold text-sm sm:text-base ${tech.color}`}>{tech.name}</div>
                <div className="text-slate-400 text-[11px] font-mono mt-1">{tech.category}</div>
              </div>
            ))}
          </div>

          {/* Bottom Action Banner */}
          <div className="mt-16 glass-panel-elevated rounded-3xl p-8 sm:p-12 text-center border border-sky-500/30 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Ready to Evaluate Your Enterprise Cyber Exposure?
              </h3>
              <p className="text-slate-300 text-sm mb-6">
                Inspect active network telemetry, run AI batch predictions from CSV files, and generate executive PDF reports.
              </p>
              <button
                onClick={onGetStarted}
                className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer"
              >
                Access SOC Platform Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
