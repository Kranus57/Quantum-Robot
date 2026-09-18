import React, { useState, useRef, useEffect } from 'react';
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
  Bot,
  User as UserIcon,
  Trash2
} from 'lucide-react';

export const AITutorDrawer: React.FC = () => {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    aiTab, 
    setAiTab,
    tutorMessages,
    clearTutorChat,
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
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState<boolean>(false);
  const [appliedOptimization, setAppliedOptimization] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message in chat
  useEffect(() => {
    if (aiTab === 'explain') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tutorMessages, isAiLoading, aiTab]);

  if (!aiDrawerOpen) return null;

  const handleSendQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = userQuery.trim();
    if (!query || isAiLoading) return;

    setUserQuery('');
    await runAiExplain(query);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleCopyCode = () => {
    const code = aiDebugResult?.correctedCode || '';
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleApplyOptimization = () => {
    if (applyOptimizationToCircuit) {
      applyOptimizationToCircuit();
      setAppliedOptimization(true);
      setTimeout(() => setAppliedOptimization(false), 3000);
    }
  };

  const handleSpeakMessage = (text: string) => {
    const cleanSpeech = text
      .replace(/###/g, '')
      .replace(/####/g, '')
      .replace(/\*\*/g, '')
      .replace(/```[a-z]*[\s\S]*?```/g, 'Code block omitted.')
      .replace(/\$\$[\s\S]*?\$\$/g, 'Mathematical equation.');
    aiVoiceEngine.speak(cleanSpeech);
  };

  const renderInline = (str: string): React.ReactNode => {
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\$[^$]+\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-indigo-700 font-semibold border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return (
          <span key={i} className="font-mono text-cyan-800 font-medium bg-cyan-50/80 px-1 py-0.5 rounded border border-cyan-200 text-[10px]">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const renderFormattedMarkdown = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xs font-bold text-slate-900 pt-2 pb-1 border-b border-slate-100 flex items-center space-x-1.5">
            <span className="text-blue-600">■</span>
            <span>{trimmed.replace(/^#{1,2}\s+/, '')}</span>
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xs font-bold text-slate-900 pt-1.5 border-t border-slate-100 first:border-0 first:pt-0 flex items-center space-x-1.5">
            <span className="text-blue-500">◆</span>
            <span>{trimmed.replace(/^###\s+/, '')}</span>
          </h3>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-[11px] font-bold text-indigo-900 pt-1 flex items-center space-x-1">
            <span className="text-indigo-500">▶</span>
            <span>{trimmed.replace(/^####\s+/, '')}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('```')) {
        const codeContent = trimmed.replace(/```[a-z]*\n?/g, '').replace(/```/g, '').trim();
        return (
          <div key={idx} className="my-2 rounded-lg bg-slate-900 p-2.5 shadow-inner border border-slate-800">
            <pre className="text-emerald-300 font-mono text-[10px] overflow-x-auto leading-relaxed">
              {codeContent}
            </pre>
          </div>
        );
      }
      if (trimmed.includes('$$')) {
        return (
          <div key={idx} className="my-1.5 p-2 rounded bg-slate-900 text-cyan-300 font-mono text-center text-[11px] overflow-x-auto shadow-inner border border-slate-800">
            {trimmed.replace(/\$\$/g, '').trim()}
          </div>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="space-y-1.5 pl-1 text-[11px]">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="flex items-start space-x-2 text-slate-700 leading-relaxed">
                <span className="text-blue-500 font-bold text-xs leading-none mt-1">•</span>
                <span className="flex-1">{renderInline(item.replace(/^[-*]\s+/, ''))}</span>
              </li>
            ))}
          </ul>
        );
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ol key={idx} className="space-y-1.5 pl-1 text-[11px]">
            {items.map((item, itemIdx) => {
              const numMatch = item.match(/^(\d+)\.\s+(.*)$/);
              return (
                <li key={itemIdx} className="flex items-start space-x-2 text-slate-700 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-200">
                    {numMatch ? numMatch[1] : itemIdx + 1}
                  </span>
                  <span className="flex-1">{renderInline(numMatch ? numMatch[2] : item)}</span>
                </li>
              );
            })}
          </ol>
        );
      }
      return <p key={idx} className="text-[11px] text-slate-700 leading-relaxed">{renderInline(trimmed)}</p>;
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Drawer Header */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Stark Sensei</h3>
            <p className="text-[10px] text-blue-600 font-medium">Universal AI Tutor & Q&A Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {aiTab === 'explain' && tutorMessages.length > 1 && (
            <button
              onClick={clearTutorChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center space-x-1 text-[11px]"
              title="Reset Chat Session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-semibold">Clear</span>
            </button>
          )}

          <button
            onClick={() => setAiDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feature Selector Tabs */}
      <div className="p-2 bg-slate-50 border-b border-slate-200 flex space-x-1">
        <button
          onClick={() => setAiTab('explain')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            aiTab === 'explain'
              ? 'bg-white text-blue-600 border border-slate-200 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Tutor Chat</span>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">

        {/* SECTION 1: CONVERSATIONAL MULTI-TURN CHAT */}
        {aiTab === 'explain' && (
          <div className="space-y-3">
            {tutorMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  // User Message Bubble
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-blue-600 text-white p-3 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-blue-100 font-semibold space-x-2">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>You ({userBackground.toUpperCase()})</span>
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  // Tutor Message Card
                  <div className="max-w-[95%] rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3.5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Bot className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">Stark Sensei</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold uppercase">
                          AI Tutor
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-400 font-mono mr-1">{msg.timestamp}</span>
                        <button
                          onClick={() => handleSpeakMessage(msg.content)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Listen to message"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                          title="Copy message"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {renderFormattedMarkdown(msg.content)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Loading State Typing Indicator */}
            {isAiLoading && (
              <div className="flex items-start max-w-[90%]">
                <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3 shadow-xs flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-xs font-mono text-slate-600">
                    Stark Sensei is thinking and formulating response...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
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

      {/* Sticky Interactive Input Footer for Chat */}
      {aiTab === 'explain' && (
        <div className="p-3 bg-white border-t border-slate-200 shadow-md space-y-2">
          <form onSubmit={handleSendQuery} className="relative flex items-center">
            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendQuery();
                }
              }}
              rows={2}
              placeholder="Ask Stark Sensei anything (e.g. 'Explain superposition with a real-life example', quantum gates, Python)..."
              className="w-full text-xs p-2.5 pr-12 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 leading-relaxed resize-none shadow-inner transition-all"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || isAiLoading}
              className="absolute right-2.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white transition-all shadow-xs cursor-pointer"
              title="Send to Stark Sensei"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Press <kbd className="px-1 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">Enter</kbd> to send</span>
            <span>Circuit: {gates.length} gates, {qubitCount} qubits</span>
          </div>
        </div>
      )}

      {/* Drawer Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium text-[11px]">Neural AI Reasoning Engine Active</span>
        <button
          onClick={() => setAiDrawerOpen(false)}
          className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs cursor-pointer font-semibold text-xs"
        >
          Close
        </button>
      </div>

    </div>
  );
};
