import React, { useEffect, useState, useRef } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { aiVoiceEngine } from '../../utils/aiVoiceEngine';
import { 
  Navigation, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AssistStepInfo {
  step: number;
  title: string;
  targetId: string;
  whatToDo: string;
  howToDoIt: string;
  quantumConsequence: string;
}

const ASSIST_STEPS: AssistStepInfo[] = [
  {
    step: 1,
    title: "1. Curriculum & Lesson Guide",
    targetId: "curriculum-panel",
    whatToDo: "Explore structured quantum computing lessons and interactive challenges.",
    howToDoIt: "Click any lesson in the left panel sidebar to switch topics from Superposition to Quantum Teleportation.",
    quantumConsequence: "Loads theory content, starter circuits, and unlocks adaptive quizzes tailored to your academic background."
  },
  {
    step: 2,
    title: "2. Visual Drag & Drop Gate Builder",
    targetId: "circuit-builder-panel",
    whatToDo: "Build quantum circuits by adding single and multi-qubit logic gates.",
    howToDoIt: "Click or drag gate chips (H, X, Y, Z, CNOT, Measure) onto qubit wire steps (q[0], q[1], q[2]).",
    quantumConsequence: "Hadamard (H) puts qubits into superposition states (|0⟩+|1⟩)/√2. CNOT creates multi-qubit entanglement."
  },
  {
    step: 3,
    title: "3. Circuit Stepper & Simulator Controls",
    targetId: "execution-stepper",
    whatToDo: "Step through circuit gate transformations step-by-step or run 1024-shot simulation.",
    howToDoIt: "Use bottom playback controls (Play, Step Forward, Reset) or click 'Run Simulation' in the header.",
    quantumConsequence: "Collapses quantum wavefunctions according to Born rule probabilities |α|² and |β|² upon measurement."
  },
  {
    step: 4,
    title: "4. 3D Bloch Sphere & Qosphere Visualizer",
    targetId: "visualizer-panel",
    whatToDo: "Inspect statevector phase angles, superposition vectors, and multi-qubit entanglement nodes.",
    howToDoIt: "Switch between 3D Bloch Sphere and Qosphere modes using the toggle buttons at the top right.",
    quantumConsequence: "Visualizes exact state vector coordinates (θ, φ) on the Hilbert space sphere in real-time."
  },
  {
    step: 5,
    title: "5. Profile-Adaptive AI Tutor Engine",
    targetId: "ai-tutor-trigger",
    whatToDo: "Ask AI to explain circuit physics, debug gate errors, or optimize circuit gate depth.",
    howToDoIt: "Click 'AI Explain', 'AI Debug', or 'AI Optimize' in the top header bar.",
    quantumConsequence: "Generates step-by-step mathematical explanations matched to your High School, CS, or Physics PhD profile."
  }
];

export const ArrowAssistOverlay: React.FC = () => {
  const { isArrowAssistActive, setIsArrowAssistActive, arrowAssistStep, setArrowAssistStep } = useQuantum();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(aiVoiceEngine.isMuted());

  const currentStepInfo = ASSIST_STEPS.find(s => s.step === arrowAssistStep) || ASSIST_STEPS[0];

  // Update target element positioning on step change or resize
  useEffect(() => {
    if (!isArrowAssistActive) {
      aiVoiceEngine.stop();
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(currentStepInfo.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    // Speak explanation automatically aloud
    const narrationText = `${currentStepInfo.title}. ${currentStepInfo.whatToDo} ${currentStepInfo.howToDoIt} Quantum physics consequence: ${currentStepInfo.quantumConsequence}`;
    aiVoiceEngine.speak(narrationText);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isArrowAssistActive, arrowAssistStep, currentStepInfo]);

  if (!isArrowAssistActive) return null;

  const handleNext = () => {
    if (arrowAssistStep < ASSIST_STEPS.length) {
      setArrowAssistStep(arrowAssistStep + 1);
    } else {
      setArrowAssistStep(1);
    }
  };

  const handlePrev = () => {
    if (arrowAssistStep > 1) {
      setArrowAssistStep(arrowAssistStep - 1);
    } else {
      setArrowAssistStep(ASSIST_STEPS.length);
    }
  };

  const handleToggleMute = () => {
    const muted = aiVoiceEngine.toggleMute();
    setIsAudioMuted(muted);
  };

  const handleReplayVoice = () => {
    const narrationText = `${currentStepInfo.title}. ${currentStepInfo.whatToDo} ${currentStepInfo.howToDoIt} Quantum consequence: ${currentStepInfo.quantumConsequence}`;
    aiVoiceEngine.speak(narrationText);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* Background Dim Backdrop with Spotlight Mask */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] transition-all duration-300" />

      {/* Target Element Highlight Box & Pulsing Arrow */}
      {targetRect && (
        <div
          className="absolute transition-all duration-300 ease-out border-2 border-cyan-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.6)] bg-cyan-500/10 pointer-events-none"
          style={{
            top: `${Math.max(10, targetRect.top - 6)}px`,
            left: `${Math.max(10, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        >
          {/* Pulsing Corner Markers */}
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />

          {/* Animated Dynamic Pointer Arrow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
            <div className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-black text-[11px] rounded-full shadow-lg flex items-center space-x-1 uppercase tracking-wider">
              <Zap className="w-3 h-3 text-slate-950 fill-current" />
              <span>Target Focus</span>
            </div>
            <svg className="w-6 h-6 text-cyan-400 rotate-180 -mt-1 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 14h6v8h4v-8h6L12 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating Guidance Banner Box */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl p-5 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-5 duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center font-bold">
              <Navigation className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">{currentStepInfo.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-mono font-bold">
                  Step {arrowAssistStep} of {ASSIST_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">AI Voice Assistant & Interactive Workflow Guide</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleReplayVoice}
              className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
              title="Replay Voice Explanation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors ${isAudioMuted ? 'text-rose-500 bg-rose-50' : 'text-slate-600 hover:bg-slate-100'}`}
              title={isAudioMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
            </button>
            <button
              onClick={() => { aiVoiceEngine.stop(); setIsArrowAssistActive(false); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-1"
              title="Close Arrow Assist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Explanation Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>What To Do</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">{currentStepInfo.whatToDo}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="font-bold text-blue-900 mb-1 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>How To Do It</span>
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">{currentStepInfo.howToDoIt}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="font-bold text-purple-900 mb-1 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Quantum Physics Consequence</span>
            </div>
            <p className="text-purple-800 text-[11px] leading-relaxed">{currentStepInfo.quantumConsequence}</p>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex space-x-1">
            {ASSIST_STEPS.map(s => (
              <button
                key={s.step}
                onClick={() => setArrowAssistStep(s.step)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.step === arrowAssistStep ? 'bg-cyan-500 w-6' : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 active:scale-95"
            >
              <span>{arrowAssistStep === ASSIST_STEPS.length ? 'Restart Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
