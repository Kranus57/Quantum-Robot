import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { aiVoiceEngine } from '../../utils/aiVoiceEngine';
import { 
  X, 
  Sparkles, 
  Bug, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Check, 
  Send, 
  Volume2, 
  Copy, 
  MessageSquare, 
  RotateCcw,
  Bot
} from 'lucide-react';

const SUGGESTED_QUERIES = [
  "How does the Hadamard gate create superposition?",
  "Why does CNOT entangle two qubits?",
  "Explain my current circuit gates and statevector",
  "How does Grover's search achieve quadratic speedup?",
  "What is the difference between Bell states?",
  "Why does measurement cause wavefunction collapse?"
];

export const AITutorDrawer: React.FC = () => {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    aiTab, 
    setAiTab,
    aiExplanation, 
    aiDebugResult, 
    aiOptimizationResult, 
    isAiLoading,
    runAiExplain,
    runAiOptimizeAndDebug,
    applyOptimizationToCircuit,
    userBackground,
    gates,
    qubitCount
  } = useQuantum();

  const [userQuery, setUserQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [appliedOptimization, setAppliedOptimization] = useState<boolean>(false);
  const [activeQueryTitle, setActiveQueryTitle] = useState<string>('');

  if (!aiDrawerOpen) return null;

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = userQuery.trim();
    if (!query || isAiLoading) return;

    setActiveQueryTitle(query);
    setUserQuery('');
    await runAiExplain(query);
  };

  const handleQuickPrompt = async (prompt: string) => {
    setActiveQueryTitle(prompt);
    await runAiExplain(prompt);
  };

  const handleCopyExplanation = () => {
    if (!aiExplanation) return;
    navigator.clipboard.writeText(aiExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!aiDebugResult?.correctedCode) return;
    navigator.clipboard.writeText(aiDebugResult.correctedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleApplyOptimization = () => {
    applyOptimizationToCircuit();
    setAppliedOptimization(true);
    setTimeout(() => setAppliedOptimization(false), 2500);
  };

  const handleSpeakExplanation = () => {
    if (!aiExplanation) return;
    aiVoiceEngine.speak(aiExplanation);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Drawer Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Tutor</h3>
            <p className="text-[11px] text-blue-600 font-medium">Neural Physics & Q&A Engine Active</p>
          </div>
        </div>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Feature Selector Tabs: Tutor & Connected Optimize & Debug */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex space-x-1">
        <button
          onClick={() => {
            setAiTab('explain');
            if (!aiExplanation) runAiExplain();
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            aiTab === 'explain'
              ? 'bg-white text-blue-600 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Tutor</span>
        </button>

        <button
          onClick={() => runAiOptimizeAndDebug()}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            aiTab === 'optimize-debug' || aiTab === 'debug' || aiTab === 'optimize'
              ? 'bg-white text-indigo-600 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Optimize & Debug</span>
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">

        {/* SECTION 1: INTERACTIVE EXPLAINER WITH USER QUERY INPUT */}
        {aiTab === 'explain' && (
          <div className="space-y-4">
            
            {/* User Query Input Form */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ask AI Tutor Any Question:</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
                  {userBackground} Track
                </span>
              </div>

              <form onSubmit={handleSendQuery} className="space-y-2">
                <div className="relative">
                  <textarea
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendQuery();
                      }
                    }}
                    rows={3}
                    placeholder="Ask about quantum circuits, gates, entanglement, mathematics, or physics (e.g., 'Why does CNOT create entanglement?')..."
                    className="w-full text-xs p-3 pr-10 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 leading-relaxed shadow-inner resize-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!userQuery.trim() || isAiLoading}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white transition-all shadow-xs cursor-pointer"
                    title="Process Query with AI Tutor"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                  <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">Enter</kbd> to submit</span>
                  <span>Active Circuit: {gates.length} gates, {qubitCount} qubits</span>
                </div>
              </form>

              {/* Quick Prompt Suggestions */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 block">Suggested Quick Topics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_QUERIES.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isAiLoading}
                      className="text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-all cursor-pointer text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Explanation Output Area */}
            {isAiLoading ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-mono font-medium text-slate-600">
                  AI Quantum Engine processing query & analyzing circuit matrix...
                </span>
              </div>
            ) : aiExplanation ? (
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-1.5 font-bold text-blue-700 text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Quantum Explanation Output</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleSpeakExplanation}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                      title="Read Explanation Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Listen</span>
                    </button>

                    <button
                      onClick={handleCopyExplanation}
                      className="flex items-center space-x-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                      title="Copy Explanation to Clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {activeQueryTitle && (
                  <div className="text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    Query: <span className="text-blue-700">"{activeQueryTitle}"</span>
                  </div>
                )}

                {/* Formatted Markdown/Code content */}
                <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                  {aiExplanation.split('\n\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-sm font-black text-slate-900 pt-2 border-t border-slate-100 first:border-0 first:pt-0 flex items-center space-x-1.5">
                          <span className="text-blue-600">■</span>
                          <span>{trimmed.replace('### ', '')}</span>
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('#### ')) {
                      return (
                        <h4 key={idx} className="text-xs font-bold text-indigo-900 pt-1 flex items-center space-x-1">
                          <span className="text-indigo-500">▶</span>
                          <span>{trimmed.replace('#### ', '')}</span>
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('```')) {
                      const codeContent = trimmed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
                      return (
                        <div key={idx} className="space-y-1 my-2">
                          <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-500 px-1">
                            <span>Qiskit Python Simulation</span>
                            <span>Executable</span>
                          </div>
                          <pre className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800 leading-relaxed">
                            {codeContent}
                          </pre>
                        </div>
                      );
                    }
                    if (trimmed.includes('$$')) {
                      return (
                        <div key={idx} className="space-y-1.5">
                          {trimmed.split('$$').map((part, pIdx) => {
                            if (pIdx % 2 === 1) {
                              return (
                                <div key={pIdx} className="my-2 p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-center text-xs overflow-x-auto shadow-inner border border-slate-800">
                                  {part.trim()}
                                </div>
                              );
                            }
                            return part.trim() ? <p key={pIdx} className="leading-relaxed">{part.trim()}</p> : null;
                          })}
                        </div>
                      );
                    }
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      const items = trimmed.split('\n');
                      return (
                        <ul key={idx} className="space-y-1 pl-2">
                          {items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-start space-x-2 text-slate-700">
                              <span className="text-blue-500 text-sm leading-none">•</span>
                              <span className="leading-relaxed">{item.replace(/^[-*]\s+/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="leading-relaxed">{trimmed}</p>;
                  })}
                </div>
              </div>
            ) : null}

          </div>
        )}

        {/* SECTION 2: CONNECTED CODE OPTIMIZER & DEBUGGER */}
        {(aiTab === 'optimize-debug' || aiTab === 'debug' || aiTab === 'optimize') && (
          <div className="space-y-3">
            {isAiLoading ? (
              <div className="p-8 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3 shadow-xs">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="text-xs font-mono font-medium text-slate-600">
                  Running connected quantum AST diagnostics & gate optimization...
                </span>
              </div>
            ) : (
              <>
                {/* Unified Overview Metrics Card */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-900">Unified Circuit Analysis</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      aiDebugResult?.hasErrors
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : (aiDebugResult?.issues && aiDebugResult.issues.some(i => i.severity === 'warning'))
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {aiDebugResult?.hasErrors 
                        ? 'Errors Detected' 
                        : (aiDebugResult?.issues && aiDebugResult.issues.some(i => i.severity === 'warning'))
                        ? 'Suggestions Available'
                        : 'Circuit Sound & Valid'}
                    </span>
                  </div>

                  {/* Depth & Gate Reductions Comparison */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Circuit Depth</div>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-sm font-bold text-slate-900">
                          {aiOptimizationResult ? `${aiOptimizationResult.optimizedDepth} Steps` : '0 Steps'}
                        </span>
                        {aiOptimizationResult && aiOptimizationResult.originalDepth > aiOptimizationResult.optimizedDepth && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (-{aiOptimizationResult.originalDepth - aiOptimizationResult.optimizedDepth})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Original: {aiOptimizationResult?.originalDepth ?? 0} Steps
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] uppercase font-semibold">Total Gates</div>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-sm font-bold text-indigo-700">
                          {aiOptimizationResult ? `${aiOptimizationResult.optimizedGateCount} Gates` : `${gates.length} Gates`}
                        </span>
                        {aiOptimizationResult && aiOptimizationResult.originalGateCount > aiOptimizationResult.optimizedGateCount && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (-{aiOptimizationResult.originalGateCount - aiOptimizationResult.optimizedGateCount})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Original: {aiOptimizationResult?.originalGateCount ?? gates.length} Gates
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1. Circuit Diagnostics (Debugger) */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800">
                    <Bug className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Physical & Syntax Diagnostics (Debugger)</span>
                  </div>

                  <div className="space-y-2">
                    {aiDebugResult?.issues.map((issue, idx) => (
                      <div key={idx} className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        issue.severity === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : issue.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="font-bold flex items-center space-x-1.5">
                          {issue.severity === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />}
                          {issue.severity === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                          {issue.severity === 'info' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                          <span>{issue.message}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-normal pl-5">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Gate Cancellations & Simplifications (Optimizer) */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gate Reductions & Cancellations (Optimizer)</span>
                  </div>

                  <div className="space-y-1.5">
                    {aiOptimizationResult?.cancellations.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-800 font-mono flex items-start space-x-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>

                  {aiOptimizationResult?.explanation && (
                    <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {aiOptimizationResult.explanation}
                    </p>
                  )}
                </div>

                {/* 3. Connected Corrected & Optimized Circuit Code */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span>Optimized & Corrected Python Code:</span>
                    </span>

                    <button
                      onClick={handleCopyCode}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
                      title="Copy Code to Clipboard"
                    >
                      {codeCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                      <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto shadow-inner border border-slate-800 max-h-48">
                    {aiDebugResult?.correctedCode || '# No code generated.'}
                  </pre>

                  {/* Connected Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={handleApplyOptimization}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                        appliedOptimization
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      title="Directly update canvas circuit with optimized gate sequence"
                    >
                      {appliedOptimization ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Circuit!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current" />
                          <span>Apply Optimization to Circuit</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => runAiOptimizeAndDebug()}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                      title="Re-run Diagnostics & Gate Optimization"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Drawer Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Neural AI Reasoning Engine Active</span>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs cursor-pointer font-semibold"
        >
          Close Drawer
        </button>
      </div>

    </div>
  );
};
