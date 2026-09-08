import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { 
  X, 
  Sparkles, 
  Bug, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Check,
  Mic
} from 'lucide-react';

export const AITutorDrawer: React.FC = () => {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    aiTab, 
    aiExplanation, 
    aiDebugResult, 
    aiOptimizationResult, 
    isAiLoading,
    runAiExplain,
    runAiDebug,
    runAiOptimize,
    setIsVoiceAnimationModalOpen
  } = useQuantum();

  if (!aiDrawerOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">AI Intelligent Tutor System</h3>
            <p className="text-[11px] text-blue-600 font-medium">Quantum Intelligence Engine Active</p>
          </div>
        </div>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Feature Selector Tabs */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex space-x-1">
        <button
          onClick={() => runAiExplain()}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            aiTab === 'explain'
              ? 'bg-white text-blue-600 border border-slate-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainer</span>
        </button>

        <button
          onClick={() => runAiDebug()}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            aiTab === 'debug'
              ? 'bg-white text-indigo-600 border border-slate-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Debugger</span>
        </button>

        <button
          onClick={() => runAiOptimize()}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            aiTab === 'optimize'
              ? 'bg-white text-amber-600 border border-slate-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Optimizer</span>
        </button>
      </div>

      {/* Drawer Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Launch Interactive Voice & 3D Animation Studio CTA Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md space-y-2 border border-blue-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300">Voice & 3D Animation Explainer</span>
            </div>
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              AUDIO & BLOCH
            </span>
          </div>
          <p className="text-[11px] text-blue-100/90 leading-tight">
            Listen to live Text-to-Speech voice physics narration synchronized with 3D Bloch sphere vector animations & probability collapse!
          </p>
          <button
            onClick={() => setIsVoiceAnimationModalOpen(true)}
            className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 fill-current" />
            <span>Launch Interactive Voice Studio</span>
          </button>
        </div>

        {isAiLoading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3 text-blue-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-mono">Analyzing Quantum AST Matrix...</span>
          </div>
        ) : (
          <>
            {aiTab === 'explain' && (
              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                  <div className="font-bold text-blue-600 flex items-center space-x-2 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Quantum Concept AI Analysis</span>
                  </div>

                  <div className="prose prose-xs text-slate-700">
                    {aiExplanation?.split('\n\n').map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {aiTab === 'debug' && aiDebugResult && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-700 flex items-center space-x-1.5">
                      <Bug className="w-4 h-4" />
                      <span>Syntax & Physical Diagnostics</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      aiDebugResult.hasErrors 
                        ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {aiDebugResult.hasErrors ? 'Errors Found' : 'Circuit Valid'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {aiDebugResult.issues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border text-xs space-y-1 ${
                        issue.severity === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : issue.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="font-bold flex items-center space-x-1.5">
                          {issue.severity === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                          {issue.severity === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {issue.severity === 'info' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{issue.message}</span>
                        </div>
                        <p className="text-[11px] text-slate-700">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 shadow-sm">
                  <div className="text-xs font-mono font-bold text-slate-800">AI Suggested Corrected Code:</div>
                  <pre className="p-2.5 rounded bg-white text-blue-700 text-[11px] font-mono overflow-x-auto border border-slate-200">
                    {aiDebugResult.correctedCode}
                  </pre>
                </div>
              </div>
            )}

            {aiTab === 'optimize' && aiOptimizationResult && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Gate Depth & Cancellation Report</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-white border border-slate-200 shadow-sm">
                      <div className="text-slate-500 text-[10px]">Original Depth</div>
                      <div className="text-base font-bold text-slate-900">{aiOptimizationResult.originalDepth} Steps</div>
                      <div className="text-[10px] text-slate-500">{aiOptimizationResult.originalGateCount} Gates</div>
                    </div>

                    <div className="p-2.5 rounded bg-white border border-blue-200 shadow-sm">
                      <div className="text-blue-600 text-[10px]">Optimized Depth</div>
                      <div className="text-base font-bold text-emerald-600">{aiOptimizationResult.optimizedDepth} Steps</div>
                      <div className="text-[10px] text-emerald-700">{aiOptimizationResult.optimizedGateCount} Gates</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-800">Gate Simplification Details:</div>
                    {aiOptimizationResult.cancellations.map((item, idx) => (
                      <div key={idx} className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-800 font-mono flex items-start space-x-2 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                    {aiOptimizationResult.explanation}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500">Powered by OpenAI / Anthropic Integration</span>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
