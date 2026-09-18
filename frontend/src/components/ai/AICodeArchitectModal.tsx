import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Framework } from '../../types/quantum';
import { 
  Sparkles, 
  X, 
  Code2, 
  Bug, 
  Volume2, 
  Play, 
  Terminal, 
  Cpu, 
  Zap, 
  Check, 
  Copy,
  Loader2,
  Bot
} from 'lucide-react';

export const AICodeArchitectModal: React.FC = () => {
  const { 
    isCodeArchitectOpen, 
    setIsCodeArchitectOpen, 
    framework, 
    setFramework, 
    generateCodeWithAI, 
    debugCodeWithAI,
    codeString,
    isAiLoading
  } = useQuantum();

  const [promptInput, setPromptInput] = useState<string>('Grover Search Algorithm with Oracle Phase Inversion');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isCodeArchitectOpen) return null;

  const handleGenerate = async () => {
    if (!promptInput.trim()) return;
    await generateCodeWithAI(promptInput, framework);
  };

  const handleDebug = async () => {
    await debugCodeWithAI();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeTemplates = [
    { label: 'Bell State (|Φ+⟩)', prompt: 'Bell State Entanglement with Hadamard and CNOT' },
    { label: 'Grover Search', prompt: 'Grover Search Algorithm with Oracle Phase Inversion' },
    { label: 'Quantum Teleportation', prompt: 'Quantum Teleportation Protocol' },
    { label: 'Quantum Fourier Transform', prompt: 'Quantum Fourier Transform (QFT)' },
    { label: 'VQE Molecule Ansatz', prompt: 'Variational Quantum Eigensolver (VQE) Ansatz' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight uppercase font-mono">
                AI CODE ARCHITECT & DEBUGGER AGENT
              </h3>
              <p className="text-[10px] text-blue-600 font-mono font-medium">
                Generates Python Quantum Code & Provides Spoken Voice Hints
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCodeArchitectOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all border border-slate-200 bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Framework Selector & Mode Options */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Target Backend Framework:</span>
              </label>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                {(['qiskit', 'cirq', 'pennylane', 'qbraid'] as Framework[]).map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all ${
                      framework === fw
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fw}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-slate-700">
                Describe Quantum Algorithm to Generate:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. Generate Grover Search with Oracle Phase Inversion..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Code</span>
                </button>
              </div>
            </div>

            {/* Template Buttons */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 font-mono">Quick Template Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {codeTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(tmpl.prompt);
                      generateCodeWithAI(tmpl.prompt, framework);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-blue-700 font-mono transition-all shadow-sm"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Code Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Active Output Code Snippet ({framework.toUpperCase()}):</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 transition-all flex items-center space-x-1 shadow-sm font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDebug}
                  disabled={isAiLoading}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Bug className="w-3.5 h-3.5" />
                  <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Debug & Speak Voice Hint</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-blue-900 font-mono text-xs overflow-x-auto max-h-52 leading-relaxed shadow-sm">
              {codeString || '// Click Generate to generate quantum Python code'}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-mono">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Diagnostic log output sent to Terminal Panel & Web Speech Voice Engine</span>
          </div>

          <button
            onClick={() => setIsCodeArchitectOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
