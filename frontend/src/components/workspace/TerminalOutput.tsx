import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { aiVoiceEngine } from '../../utils/aiVoiceEngine';
import { Terminal, Code, Cpu, Clock, CheckCircle, Trash2, Volume2, Sparkles, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const TerminalOutput: React.FC = () => {
  const { simulationResult, framework, terminalLogs, clearTerminalLogs } = useQuantum();
  const [activeTab, setActiveTab] = useState<'logs' | 'qasm'>('logs');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const getLogBadge = (type: string) => {
    switch (type) {
      case 'error': return <span className="text-red-700 font-bold px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-[10px] uppercase">ERROR</span>;
      case 'warning': return <span className="text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] uppercase">WARN</span>;
      case 'ai-hint': return <span className="text-cyan-800 font-bold px-1.5 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-[10px] uppercase">AI HINT</span>;
      case 'info': return <span className="text-blue-700 font-bold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[10px] uppercase">INFO</span>;
      default: return <span className="text-emerald-700 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] uppercase">SYS</span>;
    }
  };

  return (
    <div className={`${isCollapsed ? 'h-9' : 'h-44'} bg-white text-slate-800 border-t border-slate-200 flex flex-col font-mono text-xs overflow-hidden select-none transition-all duration-200 ease-in-out`}>
      {/* Header Bar */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setActiveTab('logs'); if (isCollapsed) setIsCollapsed(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'logs'
                ? 'bg-white text-blue-600 border border-slate-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Execution & AI Debug Logs ({terminalLogs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('qasm'); if (isCollapsed) setIsCollapsed(false); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'qasm'
                ? 'bg-white text-indigo-600 border border-slate-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>OpenQASM 2.0</span>
          </button>

          <button
            onClick={clearTerminalLogs}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-1"
            title="Clear Terminal Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {simulationResult && (
            <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-600">
              <span className="flex items-center space-x-1 text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status: OK</span>
              </span>
              <span className="flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Gates: {simulationResult.gateCount} (Depth: {simulationResult.depth})</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{simulationResult.executionTimeMs}ms</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-white text-blue-700 border border-slate-200 uppercase text-[10px] font-bold shadow-sm">
                {framework}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs cursor-pointer transition-colors"
            title={isCollapsed ? 'Expand Terminal' : 'Minimize Terminal'}
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Expand Terminal</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Minimize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-3 overflow-auto bg-slate-50/50 text-slate-800 space-y-1.5 font-mono">
        {activeTab === 'logs' ? (
          <>
            {terminalLogs.map((log) => (
              <div key={log.id} className="space-y-0.5 leading-relaxed">
                <div className="flex items-start space-x-2 text-xs">
                  <span className="text-slate-400 text-[10px] flex-shrink-0 pt-0.5">{log.timestamp}</span>
                  {getLogBadge(log.type)}
                  <span className={`flex-1 ${
                    log.type === 'error' ? 'text-red-700 font-medium' :
                    log.type === 'warning' ? 'text-amber-800 font-medium' :
                    log.type === 'ai-hint' ? 'text-cyan-800 font-semibold' : 'text-slate-800'
                  }`}>
                    {log.message}
                  </span>

                  {log.codeHint && (
                    <button
                      onClick={() => aiVoiceEngine.speak(log.message + ". " + log.codeHint)}
                      className="p-1 rounded bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 flex items-center space-x-1 text-[10px] font-bold"
                      title="Speak AI Voice Hint Aloud"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-600 animate-pulse" />
                      <span>Speak Hint</span>
                    </button>
                  )}
                </div>

                {log.codeHint && (
                  <div className="ml-16 p-2 rounded bg-white border border-slate-200 text-[11px] text-emerald-800 font-mono shadow-sm">
                    💡 RECOMMENDED FIX: {log.codeHint}
                  </div>
                )}
              </div>
            ))}

            {simulationResult && (
              <>
                <div className="text-slate-600 text-[11px]">
                  [STATEVECTOR]: [{simulationResult.stateVector.map(c => `(${c.real}${c.imag >= 0 ? '+' : ''}${c.imag}i)`).join(', ')}]
                </div>
                <div className="text-indigo-800 text-[11px] font-semibold">
                  [COUNTS (1024 Shots)]: {JSON.stringify(simulationResult.counts)}
                </div>
              </>
            )}
          </>
        ) : (
          <pre className="text-indigo-800 text-xs font-mono leading-relaxed">
            {simulationResult?.qasm || '// No circuit initialized.'}
          </pre>
        )}
      </div>
      )}
    </div>
  );
};

