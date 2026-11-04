import React, { useState } from 'react';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';

export default function WeightsModal({ isOpen, onClose, currentWeights, onSave }) {
  if (!isOpen) return null;

  const [netWeight, setNetWeight] = useState(currentWeights.net ?? 0.35);
  const [endWeight, setEndWeight] = useState(currentWeights.end ?? 0.35);
  const [emlWeight, setEmlWeight] = useState(currentWeights.eml ?? 0.30);
  const [isSaving, setIsSaving] = useState(false);

  const total = Number(netWeight) + Number(endWeight) + Number(emlWeight);
  const normalizedNet = total > 0 ? (netWeight / total) : 0.35;
  const normalizedEnd = total > 0 ? (endWeight / total) : 0.35;
  const normalizedEml = total > 0 ? (emlWeight / total) : 0.30;

  const handleReset = () => {
    setNetWeight(0.35);
    setEndWeight(0.35);
    setEmlWeight(0.30);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        network_weight: Number(normalizedNet.toFixed(2)),
        endpoint_weight: Number(normalizedEnd.toFixed(2)),
        email_weight: Number(normalizedEml.toFixed(2))
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Configurable Risk Scoring Weights</h3>
              <p className="text-xs text-slate-400">Customize multi-vector contribution ratios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-5">
          {/* Network Weight Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-sky-400">Network Security Signal Weight</span>
              <span className="font-mono text-white">{(normalizedNet * 100).toFixed(0)}% ({normalizedNet.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={netWeight}
              onChange={(e) => setNetWeight(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>

          {/* Endpoint Weight Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-indigo-400">Endpoint Security Signal Weight</span>
              <span className="font-mono text-white">{(normalizedEnd * 100).toFixed(0)}% ({normalizedEnd.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={endWeight}
              onChange={(e) => setEndWeight(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Email Weight Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-purple-400">Email Gateway Signal Weight</span>
              <span className="font-mono text-white">{(normalizedEml * 100).toFixed(0)}% ({normalizedEml.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={emlWeight}
              onChange={(e) => setEmlWeight(parseFloat(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Formula Display */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-400 block mb-1">Active Mathematical Formulation:</span>
            Enterprise Risk = (Network × <span className="text-sky-400">{normalizedNet.toFixed(2)}</span>) + (Endpoint × <span className="text-indigo-400">{normalizedEnd.toFixed(2)}</span>) + (Email × <span className="text-purple-400">{normalizedEml.toFixed(2)}</span>)
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard (35/35/30)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Apply Weights'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
