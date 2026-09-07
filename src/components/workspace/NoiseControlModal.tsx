import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { X, Activity, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export const NoiseControlModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { noiseModel, setNoiseModel, simulationResult } = useQuantum();

  if (!isOpen) return null;

  const fidelityPct = Math.round((simulationResult?.fidelity || 1.0) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-quantum-panel border border-quantum-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-quantum-dark border-b border-quantum-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Quantum Hardware Noise Engine</h3>
              <p className="text-[11px] text-gray-400">Model T1/T2 Relaxation & Gate Decoherence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs text-gray-300">
          {/* Main Noise Toggle */}
          <div className="p-3.5 rounded-xl bg-quantum-card border border-quantum-border flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Cpu className="w-5 h-5 text-quantum-cyan" />
              <div>
                <div className="font-bold text-white">Realistic Decoherence Noise</div>
                <div className="text-[11px] text-gray-400">Simulate noisy quantum processing unit (QPU)</div>
              </div>
            </div>
            <button
              onClick={() => setNoiseModel({ ...noiseModel, isNoiseEnabled: !noiseModel.isNoiseEnabled })}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                noiseModel.isNoiseEnabled ? 'bg-quantum-cyan justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-md" />
            </button>
          </div>

          {/* Fidelity Gauge Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            fidelityPct > 90 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div className="space-y-0.5">
              <div className="text-[11px] text-gray-400 font-mono">Calculated State Fidelity</div>
              <div className="text-2xl font-extrabold">{fidelityPct}%</div>
            </div>
            {fidelityPct > 90 ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : <AlertTriangle className="w-8 h-8 text-amber-400" />}
          </div>

          {/* Sliders for T1, T2, Gate Error */}
          {noiseModel.isNoiseEnabled && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span>T1 Thermal Relaxation Time</span>
                  <span className="text-quantum-cyan font-bold">{noiseModel.t1Us} µs</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={noiseModel.t1Us}
                  onChange={(e) => setNoiseModel({ ...noiseModel, t1Us: Number(e.target.value) })}
                  className="w-full accent-quantum-cyan"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span>T2 Dephasing Time</span>
                  <span className="text-quantum-violet font-bold">{noiseModel.t2Us} µs</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={noiseModel.t2Us}
                  onChange={(e) => setNoiseModel({ ...noiseModel, t2Us: Number(e.target.value) })}
                  className="w-full accent-quantum-violet"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono">
                  <span>Gate Depolarizing Error Rate</span>
                  <span className="text-pink-400 font-bold">{(noiseModel.gateErrorRate * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.05"
                  step="0.001"
                  value={noiseModel.gateErrorRate}
                  onChange={(e) => setNoiseModel({ ...noiseModel, gateErrorRate: Number(e.target.value) })}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-quantum-dark border-t border-quantum-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-quantum-cyan text-black font-bold text-xs shadow-cyan-glow hover:opacity-90"
          >
            Apply Noise Model
          </button>
        </div>
      </div>
    </div>
  );
};
