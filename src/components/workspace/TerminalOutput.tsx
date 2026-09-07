import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Terminal, Code, Cpu, Clock, CheckCircle } from 'lucide-react';

export const TerminalOutput: React.FC = () => {
  const { simulationResult, framework } = useQuantum();
  const [activeTab, setActiveTab] = useState<'logs' | 'qasm'>('logs');

  return (
    <div className="h-44 bg-slate-900 text-slate-200 border-t border-slate-800 flex flex-col font-mono text-xs overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'logs'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('qasm')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'qasm'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>OpenQASM 2.0</span>
          </button>
        </div>

        {simulationResult && (
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Status: OK</span>
            </span>
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Gates: {simulationResult.gateCount} (Depth: {simulationResult.depth})</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time: {simulationResult.executionTimeMs}ms</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 uppercase text-[10px]">
              {framework}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 overflow-auto bg-[#090D16] text-slate-300 space-y-1">
        {activeTab === 'logs' ? (
          <>
            <div className="text-emerald-400">[SYSTEM]: Quantum Engine initialized via driver '{framework.toUpperCase()}'.</div>
            <div className="text-sky-400">[SIMULATION]: Compiled circuit matrix vector product successfully.</div>
            {simulationResult && (
              <>
                <div className="text-slate-300">
                  [STATEVECTOR]: [{simulationResult.stateVector.map(c => `(${c.real}${c.imag >= 0 ? '+' : ''}${c.imag}i)`).join(', ')}]
                </div>
                <div className="text-indigo-300">
                  [COUNTS (1024 Shots)]: {JSON.stringify(simulationResult.counts)}
                </div>
              </>
            )}
            <div className="text-slate-500 text-[10px] pt-1">Quantum execution pipeline ready for next pulse sequence.</div>
          </>
        ) : (
          <pre className="text-indigo-300 text-xs font-mono leading-relaxed">
            {simulationResult?.qasm || '// No circuit initialized.'}
          </pre>
        )}
      </div>
    </div>
  );
};
