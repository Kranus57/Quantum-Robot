import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { QuantumGate } from '../../types/quantum';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  BrainCircuit, 
  Cpu, 
  Code2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  X, 
  Award, 
  Save, 
  Check, 
  AlertCircle,
  FileCode,
  Layers,
  Zap
} from 'lucide-react';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ModuleTestData {
  moduleId: string;
  moduleTitle: string;
  mcqs: MCQQuestion[];
  circuitTask: {
    title: string;
    instructions: string;
    targetQubitCount: number;
    requiredGateTypes: string[];
    targetStateVector: string;
  };
  codeTask: {
    title: string;
    instructions: string;
    starterCode: string;
  };
}

interface EvaluationResult {
  mcqScore: number;
  circuitScore: number;
  codeScore: number;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  status: string;
  aiSummary: string;
  mcqFeedback: Array<{
    questionId: string;
    question: string;
    userChoice: number;
    correctChoice: number;
    isCorrect: boolean;
    explanation: string;
  }>;
  circuitNotes: string[];
  codeNotes: string[];
}

interface ModuleAgenticTestModalProps {
  moduleId: string;
  moduleTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onTestSubmitted?: () => void;
}

export const ModuleAgenticTestModal: React.FC<ModuleAgenticTestModalProps> = ({
  moduleId,
  moduleTitle,
  isOpen,
  onClose,
  onTestSubmitted
}) => {
  const { user } = useQuantum();

  const [activeStep, setActiveStep] = useState<'mcq' | 'circuit' | 'code' | 'result'>('mcq');
  const [testData, setTestData] = useState<ModuleTestData | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState<boolean>(true);

  // Student Answers State
  const [currentMcqIndex, setCurrentMcqIndex] = useState<number>(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [placedGates, setPlacedGates] = useState<QuantumGate[]>([]);
  const [qubitCount, setQubitCount] = useState<number>(2);
  const [codeSnippet, setCodeSnippet] = useState<string>('');

  // AI Evaluation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [dbSavedAt, setDbSavedAt] = useState<string | null>(null);

  // Fetch test data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingTest(true);
    setActiveStep('mcq');
    setEvaluation(null);
    setMcqAnswers({});
    setPlacedGates([]);
    setCurrentMcqIndex(0);

    fetch(`/api/test/generate/${moduleId}`)
      .then(res => res.json())
      .then(data => {
        setTestData(data);
        setCodeSnippet(data.codeTask?.starterCode || '');
        setQubitCount(data.circuitTask?.targetQubitCount || 2);
      })
      .catch(err => {
        console.error('Error generating module test:', err);
      })
      .finally(() => {
        setIsLoadingTest(false);
      });
  }, [isOpen, moduleId]);

  if (!isOpen) return null;

  const handleSelectMCQ = (questionId: string, optionIdx: number) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleAddGate = (type: string, wireQubit: number) => {
    const newGate: QuantumGate = {
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      qubit: wireQubit,
      targetQubit: type === 'CNOT' ? (wireQubit === 0 ? 1 : 0) : undefined,
      step: placedGates.length
    };
    setPlacedGates([...placedGates, newGate]);
  };

  const handleRemoveGate = (gateId: string) => {
    setPlacedGates(placedGates.filter(g => g.id !== gateId));
  };

  const handleClearCircuit = () => {
    setPlacedGates([]);
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id || 1,
        studentName: user?.fullName || 'Alex Rivera',
        moduleId,
        moduleTitle: testData?.moduleTitle || moduleTitle,
        mcqAnswers,
        circuitGates: placedGates.map(g => ({
          id: g.id,
          type: g.type,
          qubit: g.qubit,
          targetQubit: g.targetQubit,
          step: g.step
        })),
        circuitQubitCount: qubitCount,
        codeSnippet
      };

      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.status === 'success') {
        setEvaluation(data.evaluation);
        setDbSavedAt(data.submittedAt);
        setActiveStep('result');
        if (onTestSubmitted) onTestSubmitted();
      }
    } catch (e) {
      console.error('Error submitting module test:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mcqs = testData?.mcqs || [];
  const currentMcq = mcqs[currentMcqIndex];
  const answeredMcqCount = Object.keys(mcqAnswers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col text-slate-100 overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>AGENTIC AI AUTOMATED MODULE EVALUATION</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 text-[10px] font-bold">
                100 MARKS TOTAL
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {testData?.moduleTitle || moduleTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveStep('mcq')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                activeStep === 'mcq'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>1. 8 MCQs ({answeredMcqCount}/8)</span>
            </button>

            <button
              onClick={() => setActiveStep('circuit')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                activeStep === 'circuit'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>2. Circuit Diagram ({placedGates.length} Gates)</span>
            </button>

            <button
              onClick={() => setActiveStep('code')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                activeStep === 'code'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>3. Code Task</span>
            </button>

            {evaluation && (
              <button
                onClick={() => setActiveStep('result')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                  activeStep === 'result'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Score: {evaluation.totalScore}%</span>
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-1 text-[11px] text-slate-400">
            <span>MCQ: 40 pts</span>
            <span>•</span>
            <span>Circuit: 30 pts</span>
            <span>•</span>
            <span>Code: 30 pts</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoadingTest ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                Agentic AI generating 8 MCQs, Circuit Diagram, and Quantum Coding challenges...
              </p>
            </div>
          ) : activeStep === 'mcq' ? (
            /* SECTION 1: 8 MCQs */
            <div className="space-y-6">
              {/* Question Index Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {mcqs.map((q, idx) => {
                  const isAnswered = mcqAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentMcqIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentMcqIndex(idx)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                          : isAnswered
                          ? 'bg-indigo-900/80 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  );
                })}
              </div>

              {currentMcq && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
                      Question {currentMcqIndex + 1} of 8 (5 Marks)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {currentMcq.question}
                  </h3>

                  <div className="space-y-3">
                    {currentMcq.options.map((opt, optIdx) => {
                      const isSelected = mcqAnswers[currentMcq.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectMCQ(currentMcq.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-400 text-cyan-100 shadow-md shadow-cyan-500/10'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center border ${
                              isSelected ? 'bg-cyan-400 text-slate-950 border-cyan-300' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="text-sm font-medium">{opt}</span>
                          </div>

                          {isSelected && <Check className="w-5 h-5 text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MCQ Pagination Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentMcqIndex === 0}
                  onClick={() => setCurrentMcqIndex(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>

                {currentMcqIndex < mcqs.length - 1 ? (
                  <button
                    onClick={() => setCurrentMcqIndex(prev => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center space-x-2"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveStep('circuit')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-2"
                  >
                    <span>Proceed to Circuit Diagram Task</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : activeStep === 'circuit' ? (
            /* SECTION 2: 1 CIRCUIT DIAGRAM TASK */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-indigo-200 flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span>{testData?.circuitTask.title}</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                    30 Marks
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {testData?.circuitTask.instructions}
                </p>
              </div>

              {/* Interactive Mini Circuit Canvas */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-300 font-mono">Interactive Circuit Wires (2 Qubits)</span>
                  <button
                    onClick={handleClearCircuit}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Gates</span>
                  </button>
                </div>

                {/* Gate Palette */}
                <div className="flex items-center space-x-2 pb-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase mr-2">Click to Place:</span>
                  {(['H', 'X', 'Y', 'Z', 'CNOT', 'MEASURE'] as string[]).map(gType => (
                    <div key={gType} className="flex space-x-1">
                      <button
                        onClick={() => handleAddGate(gType, 0)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500 hover:text-slate-950 font-mono font-bold text-xs transition-all"
                      >
                        +{gType} (q0)
                      </button>
                      <button
                        onClick={() => handleAddGate(gType, 1)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 hover:bg-indigo-500 hover:text-white font-mono font-bold text-xs transition-all"
                      >
                        +{gType} (q1)
                      </button>
                    </div>
                  ))}
                </div>

                {/* Wires Representation */}
                <div className="space-y-4 pt-2">
                  {[0, 1].map(qIdx => {
                    const wireGates = placedGates.filter(g => g.qubit === qIdx || g.targetQubit === qIdx);
                    return (
                      <div key={qIdx} className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold text-cyan-400 w-12">q[{qIdx}] ─</span>
                        <div className="flex-1 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center px-4 space-x-3 relative overflow-x-auto">
                          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-700 pointer-events-none" />
                          {wireGates.map(g => (
                            <div
                              key={g.id}
                              onClick={() => handleRemoveGate(g.id)}
                              className="relative z-10 px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-mono font-bold text-xs shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-all flex items-center space-x-1"
                              title="Click to remove gate"
                            >
                              <span>{g.type}</span>
                              {g.type === 'CNOT' && <span className="text-[10px]">({g.qubit}→{g.targetQubit})</span>}
                            </div>
                          ))}
                          {wireGates.length === 0 && (
                            <span className="text-[11px] text-slate-600 font-mono relative z-10">Empty wire (Identity |0⟩)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveStep('mcq')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to MCQs</span>
                </button>

                <button
                  onClick={() => setActiveStep('code')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center space-x-2"
                >
                  <span>Proceed to Quantum Code Task</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : activeStep === 'code' ? (
            /* SECTION 3: 1 QUANTUM CODE TASK */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-purple-200 flex items-center space-x-2">
                    <Code2 className="w-5 h-5 text-purple-400" />
                    <span>{testData?.codeTask.title}</span>
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                    30 Marks
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {testData?.codeTask.instructions}
                </p>
              </div>

              {/* Code Editor Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>quantum_solution.py (Qiskit Python 3.10)</span>
                  </span>
                  <button
                    onClick={() => setCodeSnippet(testData?.codeTask.starterCode || '')}
                    className="text-slate-400 hover:text-white transition-all text-[11px]"
                  >
                    Reset Code Template
                  </button>
                </div>

                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={10}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-200 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
                  placeholder="# Write your Qiskit python code snippet here..."
                />
              </div>

              {/* Submission Action Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-white">Ready for Agentic AI Grading?</div>
                  <div className="text-xs text-slate-400">
                    Submits all 8 MCQs, Circuit Diagram, and Code task to Agentic AI for evaluation and saves score to DB.
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  onClick={handleSubmitTest}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-slate-950 font-black text-xs shadow-xl shadow-cyan-500/20 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Agentic AI Grading Test...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>SUBMIT TEST FOR AI GRADING</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : activeStep === 'result' && evaluation ? (
            /* SECTION 4: AI EVALUATION & SCORE RESULT SCREEN */
            <div className="space-y-6">
              {/* Score Banner */}
              <div className={`p-6 rounded-2xl border text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 ${
                evaluation.status === 'passed'
                  ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-500/40'
                  : 'bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900 border-amber-500/40'
              }`}>
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono mb-1">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>AGENTIC AI EVALUATION COMPLETE</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      evaluation.status === 'passed' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-amber-400/20 text-amber-300'
                    }`}>
                      {evaluation.status === 'passed' ? 'PASSED 🎉' : 'NEEDS REVIEW'}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-white tracking-tight">
                    Score: {evaluation.totalScore} / 100 Marks ({evaluation.percentage}%)
                  </h3>
                  {dbSavedAt && (
                    <p className="text-xs text-emerald-300 mt-1 flex items-center space-x-1">
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved to Database at {dbSavedAt}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-center p-3 bg-slate-950/60 rounded-xl border border-white/10">
                    <div className="text-lg font-black text-cyan-300">{evaluation.mcqScore}/40</div>
                    <div className="text-[10px] text-slate-400 font-mono">8 MCQs</div>
                  </div>
                  <div className="text-center p-3 bg-slate-950/60 rounded-xl border border-white/10">
                    <div className="text-lg font-black text-indigo-300">{evaluation.circuitScore}/30</div>
                    <div className="text-[10px] text-slate-400 font-mono">Circuit</div>
                  </div>
                  <div className="text-center p-3 bg-slate-950/60 rounded-xl border border-white/10">
                    <div className="text-lg font-black text-purple-300">{evaluation.codeScore}/30</div>
                    <div className="text-[10px] text-slate-400 font-mono">Code</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Circuit Notes */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center space-x-2 font-mono">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Circuit Diagram Evaluation Notes</span>
                  </h4>
                  <div className="space-y-2">
                    {evaluation.circuitNotes.map((note, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Notes */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-purple-300 flex items-center space-x-2 font-mono">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    <span>Quantum Code Evaluation Notes</span>
                  </h4>
                  <div className="space-y-2">
                    {evaluation.codeNotes.map((note, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MCQ Feedback Trace */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-cyan-300 flex items-center space-x-2 font-mono">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>8 MCQ Question Detailed Review & AI Explanations</span>
                </h4>

                <div className="space-y-3">
                  {evaluation.mcqFeedback.map((fb, idx) => (
                    <div
                      key={fb.questionId}
                      className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        fb.isCorrect
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-red-950/20 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-200">Q{idx + 1}: {fb.question}</span>
                        {fb.isCorrect ? (
                          <span className="text-emerald-400 flex items-center space-x-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct (+5 pts)</span>
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center space-x-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect (0 pts)</span>
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">{fb.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {user ? `Logged as: ${user.fullName} (${user.email})` : 'Student Mode'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
