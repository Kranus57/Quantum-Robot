import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Binary } from 'lucide-react';

export const StateVectorMatrix: React.FC = () => {
  const { simulationResult, qubitCount } = useQuantum();

  const stateVector = simulationResult?.stateVector || [
    { real: 1, imag: 0 },
    { real: 0, imag: 0 }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
          <Binary className="w-4 h-4" />
          <span>State Vector & Amplitude Matrix</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Dim: 2^{qubitCount} = {1 << qubitCount} States</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
        {stateVector.map((c, idx) => {
          const bitstring = idx.toString(2).padStart(qubitCount, '0');
          const magSq = c.real * c.real + c.imag * c.imag;
          const phaseRad = Math.atan2(c.imag, c.real);
          const phaseDeg = Math.round((phaseRad * 180) / Math.PI);

          return (
            <div
              key={idx}
              className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between font-mono text-xs shadow-sm hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  |{bitstring}⟩
                </span>
                <span className="text-slate-800 font-medium">
                  {c.real >= 0 ? '+' : ''}{c.real} {c.imag >= 0 ? '+' : ''}{c.imag}i
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${Math.round(magSq * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-indigo-700 font-semibold w-12 text-right">
                  {(magSq * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 w-10 text-right">
                  {phaseDeg}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
