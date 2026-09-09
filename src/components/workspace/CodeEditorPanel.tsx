import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Framework } from '../../types/quantum';
import { Code2, Copy, Check, Terminal, Play, Sparkles, Bug, Volume2, Bot } from 'lucide-react';

export const CodeEditorPanel: React.FC = () => {
  const { codeString, setCodeString, framework, setFramework, runSimulation, setIsCodeArchitectOpen, debugCodeWithAI, isAiLoading } = useQuantum();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-quantum-dark overflow-hidden">
      {/* Code Editor Header Bar */}
      <div className="p-3 bg-quantum-panel/90 border-b border-quantum-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
            <Code2 className="w-4 h-4 text-quantum-cyan" />
            <span>Target Framework:</span>
          </div>

          <div className="flex items-center space-x-1 bg-quantum-bg p-1 rounded-lg border border-quantum-border">
            {(['qiskit', 'cirq', 'pennylane', 'qbraid'] as Framework[]).map((fw) => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase transition-all ${
                  framework === fw
                    ? 'bg-quantum-cyan text-black shadow-cyan-glow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Code Architect Modal Trigger */}
          <button
            onClick={() => setIsCodeArchitectOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            title="Generate Quantum Code using AI Agent"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>AI Code Architect</span>
          </button>

          {/* AI Debugger & Spoken Voice Hint Trigger */}
          <button
            onClick={() => debugCodeWithAI()}
            disabled={isAiLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
            title="Run AI Debugger, Output Log Entries & Speak Spoken Voice Hints"
          >
            <Bug className="w-3.5 h-3.5 text-indigo-400" />
            <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Debug & Voice Hint</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-quantum-card border border-quantum-border text-xs text-gray-300 hover:text-white hover:border-quantum-cyan/40 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={runSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-quantum-cyan text-black font-bold text-xs shadow-cyan-glow hover:opacity-90 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Execute Code</span>
          </button>
        </div>
      </div>

      {/* Code Textarea / Monaco-style Display */}
      <div className="flex-1 p-4 relative font-mono text-xs overflow-auto bg-[#0A0D16]">
        {/* Line Numbers Sidebar */}
        <div className="flex">
          <div className="select-none text-gray-600 pr-4 text-right border-r border-gray-800 space-y-1 font-mono text-[11px]">
            {codeString.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          <textarea
            value={codeString}
            onChange={(e) => setCodeString(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-transparent text-cyan-300 font-mono text-xs leading-relaxed p-0 pl-4 focus:outline-none resize-none border-none whitespace-pre"
            rows={codeString.split('\n').length || 10}
          />
        </div>
      </div>

      {/* Code Sync Footer Bar */}
      <div className="px-4 py-2 bg-quantum-panel/90 border-t border-quantum-border flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <span className="flex items-center space-x-2 text-emerald-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Bi-directional Live Sync Active ({framework.toUpperCase()})</span>
        </span>
        <span>Python 3.11+ • UTF-8</span>
      </div>
    </div>
  );
};
