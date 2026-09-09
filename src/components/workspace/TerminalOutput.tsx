import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { aiVoiceEngine } from '../../utils/aiVoiceEngine';
import { Terminal, Code, Cpu, Clock, CheckCircle, Trash2, Volume2, Sparkles, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export const TerminalOutput: React.FC = () => {
  const { simulationResult, framework, terminalLogs, clearTerminalLogs } = useQuantum();
  const [activeTab, setActiveTab] = useState<'logs' | 'qasm'>('logs');

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'error': return <span className="text-red-400 font-bold px-1.5 py-0.5 rounded bg-red-950/80 border border-red-800 text-[10px] uppercase">ERROR</span>;
      case 'warning': return <span className="text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-[10px] uppercase">WARN</span>;
      case 'ai-hint': return <span className="text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] uppercase">AI HINT</span>;
      case 'info': return <span className="text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-[10px] uppercase">INFO</span>;
      default: return <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px] uppercase">SYS</span>;
    }
  };

  return (
    <div className="h-44 bg-slate-900 text-slate-200 border-t border-slate-800 flex flex-col font-mono text-xs overflow-hidden select-none">
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
            <span>Execution & AI Debug Logs ({terminalLogs.length})</span>
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

          <button
            onClick={clearTerminalLogs}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors ml-2"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {simulationResult && (
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center space-x-1 text-emerald-400 font-bold">
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
            <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700 uppercase text-[10px] font-bold">
              {framework}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 overflow-auto bg-[#090D16] text-slate-300 space-y-1.5 font-mono">
        {activeTab === 'logs' ? (
          <>
            {terminalLogs.map((log) => (
              <div key={log.id} className="space-y-0.5 leading-relaxed">
                <div className="flex items-start space-x-2 text-xs">
                  <span className="text-slate-500 text-[10px] flex-shrink-0 pt-0.5">{log.timestamp}</span>
                  {getLogBadge(log.type)}
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-300' :
                    log.type === 'warning' ? 'text-amber-300' :
                    log.type === 'ai-hint' ? 'text-cyan-300 font-semibold' : 'text-slate-300'
                  }`}>
                    {log.message}
                  </span>

                  {log.codeHint && (
                    <button
                      onClick={() => aiVoiceEngine.speak(log.message + ". " + log.codeHint)}
                      className="p-1 rounded bg-cyan-950 text-cyan-400 hover:text-white border border-cyan-800 flex items-center space-x-1 text-[10px]"
                      title="Speak AI Voice Hint Aloud"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>Speak Hint</span>
                    </button>
                  )}
                </div>

                {log.codeHint && (
                  <div className="ml-16 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
                    💡 RECOMMENDED FIX: {log.codeHint}
                  </div>
                )}
              </div>
            ))}

            {simulationResult && (
              <>
                <div className="text-slate-400 text-[11px]">
                  [STATEVECTOR]: [{simulationResult.stateVector.map(c => `(${c.real}${c.imag >= 0 ? '+' : ''}${c.imag}i)`).join(', ')}]
                </div>
                <div className="text-indigo-300 text-[11px]">
                  [COUNTS (1024 Shots)]: {JSON.stringify(simulationResult.counts)}
                </div>
              </>
            )}
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

