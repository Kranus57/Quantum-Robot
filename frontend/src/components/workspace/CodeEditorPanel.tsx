import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Framework } from '../../types/quantum';
import { Code2, Copy, Check, Terminal, Play, Bug, Volume2, Bot, FileCode2 } from 'lucide-react';

export const CodeEditorPanel: React.FC = () => {
  const { codeString, setCodeString, framework, setFramework, runSimulation, setIsCodeArchitectOpen, debugCodeWithAI, isAiLoading } = useQuantum();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      {/* Code Editor Header Bar */}
      <div className="p-3 bg-[#0d0d0d] border-b border-neutral-800 flex items-center justify-between flex-wrap gap-2 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-200">
            <Code2 className="w-4 h-4 text-white" />
            <span>Target Framework:</span>
          </div>

          <div className="flex items-center space-x-1 bg-[#171717] p-1 rounded-lg border border-neutral-800">
            {(['qiskit', 'cirq', 'pennylane', 'qbraid'] as Framework[]).map((fw) => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase transition-all ${
                  framework === fw
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Generate Quantum Code using AI Agent"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>AI Code Architect</span>
          </button>

          {/* AI Debugger & Spoken Voice Hint Trigger */}
          <button
            onClick={() => debugCodeWithAI()}
            disabled={isAiLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171717] hover:bg-[#222222] border border-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Run AI Debugger, Output Log Entries & Speak Spoken Voice Hints"
          >
            <Bug className="w-3.5 h-3.5 text-indigo-400" />
            <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Debug & Voice Hint</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#171717] border border-neutral-700 text-xs text-neutral-200 hover:text-white hover:bg-[#222222] transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={runSimulation}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Execute Code</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor File Tab Bar */}
      <div className="bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between px-3 pt-1 select-none">
        <div className="flex items-center space-x-1">
          <div className="bg-black border-t-2 border-white text-white px-3.5 py-1.5 rounded-t text-xs font-mono font-medium flex items-center space-x-2 shadow-xs">
            <FileCode2 className="w-3.5 h-3.5 text-white" />
            <span>circuit_{framework}.py</span>
          </div>
        </div>
        <div className="text-[11px] font-mono text-neutral-400 pr-2">
          workspace &gt; src &gt; circuit_{framework}.py
        </div>
      </div>

      {/* Code Textarea / Monaco-style Display with Pure Black Background and White Font */}
      <div className="flex-1 relative font-mono text-xs overflow-auto bg-black">
        {/* Line Numbers Sidebar & Textarea Container */}
        <div className="flex min-h-full bg-black">
          <div className="select-none bg-[#0a0a0a] text-neutral-500 py-3 pr-3 pl-3 text-right border-r border-neutral-800 space-y-1 font-mono text-[11px] min-w-[3rem]">
            {codeString.split('\n').map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          <textarea
            value={codeString}
            onChange={(e) => setCodeString(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-black text-white font-mono text-xs leading-relaxed p-3 focus:outline-none resize-none border-none whitespace-pre selection:bg-neutral-800 caret-white min-h-full"
            rows={Math.max(codeString.split('\n').length + 2, 20)}
          />
        </div>
      </div>

      {/* Code Sync Footer Bar */}
      <div className="px-4 py-2 bg-[#0d0d0d] border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono shadow-inner">
        <span className="flex items-center space-x-2 text-white">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bi-directional Live Sync Active ({framework.toUpperCase()})</span>
        </span>
        <span>Python 3.11+ • UTF-8 • Monaco Black Engine</span>
      </div>
    </div>
  );
};

