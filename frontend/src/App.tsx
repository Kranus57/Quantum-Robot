import React, { useEffect, useRef, useState } from 'react';
import { QuantumProvider, useQuantum } from './context/QuantumContext';
import { Header } from './components/Header';
import { CurriculumPanel } from './components/workspace/CurriculumPanel';
import { VisualCircuitBuilder } from './components/workspace/VisualCircuitBuilder';
import { CodeEditorPanel } from './components/workspace/CodeEditorPanel';
import { BlochSphere3D } from './components/workspace/BlochSphere3D';
import { QosphereVisualizer } from './components/workspace/QosphereVisualizer';
import { ProbabilitiesChart } from './components/workspace/ProbabilitiesChart';
import { StateVectorMatrix } from './components/workspace/StateVectorMatrix';
import { TerminalOutput } from './components/workspace/TerminalOutput';
import { StepByStepStepper } from './components/workspace/StepByStepStepper';
import { AITutorDrawer } from './components/ai/AITutorDrawer';
import { NoiseControlModal } from './components/workspace/NoiseControlModal';
import { MultiplayerModal } from './components/workspace/MultiplayerModal';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { StudentAnalysis } from './components/dashboard/StudentAnalysis';
import { InstructorDashboard } from './components/dashboard/InstructorDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDBExplorerModal } from './components/admin/AdminDBExplorerModal';
import { PersonalizedLearningPath } from './components/learningPath/PersonalizedLearningPath';
import { AITheoryMathStudio } from './components/theoryMath/AITheoryMathStudio';
import { ArrowAssistOverlay } from './components/workspace/ArrowAssistOverlay';
import { InteractiveVoiceAnimationModal } from './components/workspace/InteractiveVoiceAnimationModal';
import { AICodeArchitectModal } from './components/ai/AICodeArchitectModal';
import { ModuleAgenticTestModal } from './components/assessment/ModuleAgenticTestModal';
import { Activity, BarChart2, BrainCircuit, Compass, Cpu, Code2, Globe, Network, X, Minimize2, Maximize2 } from 'lucide-react';

const ModeChooser: React.FC<{ onChoose: (view: 'workspace' | 'learning-path' | 'theory-math' | 'student-dashboard' | 'student-analysis') => void; onClose: () => void }> = ({ onChoose, onClose }) => {
  const toneClasses: Record<string, string> = {
    cyan: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-100 dark:border-cyan-400/20',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-100 dark:border-indigo-400/20',
    blue: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-400/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-400/20',
    violet: 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-100 dark:border-violet-400/20'
  };

  const modes = [
    {
      view: 'theory-math' as const,
      title: 'Theory Lab',
      description: 'Explore quantum concepts, formulas, and guided explanations.',
      icon: BrainCircuit,
      color: 'cyan'
    },
    {
      view: 'learning-path' as const,
      title: 'Learning Path',
      description: 'Follow a personalized sequence of lessons built around your goals.',
      icon: Compass,
      color: 'indigo'
    },
    {
      view: 'workspace' as const,
      title: 'Lab Workspace',
      description: 'Build circuits, run simulations, and inspect quantum states.',
      icon: Cpu,
      color: 'blue'
    },
    {
      view: 'student-dashboard' as const,
      title: 'Student Portal',
      description: 'Review progress, badges, saved work, and your learning activity.',
      icon: Globe,
      color: 'emerald'
    },
    {
      view: 'student-analysis' as const,
      title: 'Student Analysis',
      description: 'See performance insights and identify your next areas of focus.',
      icon: BarChart2,
      color: 'violet'
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50/80 dark:bg-slate-800/70">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600 dark:text-cyan-400">Workspace selection</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Where would you like to begin?</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose a mode and you can switch between spaces anytime from the top navigation.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
            aria-label="Close mode chooser"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
          {modes.map(({ view, title, description, icon: Icon, color }) => (
            <button
              key={view}
              onClick={() => onChoose(view)}
              className="group text-left rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-4 hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-cyan-500 hover:shadow-lg transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${toneClasses[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
              <span className="mt-4 inline-flex text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">Open mode</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const WorkspaceLayout: React.FC = () => {
  const { 
    centerTab, 
    setCenterTab, 
    visualizerMode, 
    setVisualizerMode,
    isFullscreenWorkspace,
    setIsFullscreenWorkspace,
    qubitCount,
    stepCount,
    gates
  } = useQuantum();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenWorkspace) {
        setIsFullscreenWorkspace(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenWorkspace, setIsFullscreenWorkspace]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Fullscreen Workspace Modal Overlay with Live Quantum Preview */}
      {isFullscreenWorkspace && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden select-none animate-fadeIn">
          {/* Fullscreen Top Navigation Bar */}
          <div className="h-12 bg-slate-900 text-white px-4 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span>Quantum Studio (Full Screen Mode)</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-slate-400 pl-3 border-l border-slate-700">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-semibold border border-slate-700">Rows (Qubits): {qubitCount}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold border border-slate-700">Cols (Steps): {stepCount}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold border border-slate-700">Gates: {gates.length}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-mono text-slate-400 hidden md:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Esc</kbd> to exit
              </span>
              <button
                onClick={() => setIsFullscreenWorkspace(false)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Body: Split between Circuit Canvas and Quantum Preview Panel */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left/Center: Visual Circuit Builder with Stepper */}
            <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden bg-white">
              <div className="flex-1 overflow-hidden">
                <VisualCircuitBuilder />
              </div>
              <StepByStepStepper />
            </div>

            {/* Right: Quantum Preview Panel (Always visible in fullscreen) */}
            <div className="w-[420px] flex-shrink-0 flex flex-col bg-slate-50 border-l border-slate-200 overflow-y-auto">
              <div className="h-10 flex-shrink-0 px-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Quantum Preview Analysis</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">Live State</span>
              </div>

              {/* Visualizer Mode Selector Switcher */}
              <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-center space-x-1 sticky top-10 z-20">
                <button
                  onClick={() => setVisualizerMode('bloch')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    visualizerMode === 'bloch'
                      ? 'bg-white text-blue-600 border border-slate-200 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>3D Bloch Sphere</span>
                </button>

                <button
                  onClick={() => setVisualizerMode('qosphere')}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    visualizerMode === 'qosphere'
                      ? 'bg-white text-indigo-600 border border-slate-200 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Qosphere Entanglement</span>
                </button>
              </div>

              {/* Render Active Visualizer */}
              {visualizerMode === 'bloch' ? <BlochSphere3D /> : <QosphereVisualizer />}
              <ProbabilitiesChart />
              <StateVectorMatrix />
            </div>
          </div>
        </div>
      )}

      <div className="h-14 flex-shrink-0 px-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-300 flex items-center justify-center border border-blue-100 dark:border-blue-400/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Lab Workspace</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Learn, build, simulate, and inspect your quantum circuit</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-cyan-300 border border-blue-100 dark:border-blue-400/20">1. Learn</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-400/20">2. Build</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-400/20">3. Run</span>
        </div>
      </div>
      {/* 3-Panel Split View Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Structured Markdown Curriculum Viewer */}
        <div className="w-[320px] flex-shrink-0 border-r border-slate-200 dark:border-slate-700">
          <CurriculumPanel />
        </div>

        {/* Center Panel: Dual Mode (Visual Circuit Builder vs Monaco Code Editor) */}
        <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden">
          {/* Center Panel Header Tabs */}
          <div className="h-10 bg-slate-50 border-b border-slate-200 px-3 flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-slate-200/60 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setCenterTab('visual')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  centerTab === 'visual'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Visual Drag & Drop Builder</span>
              </button>

              <button
                onClick={() => setCenterTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
                  centerTab === 'code'
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Monaco Code Editor</span>
              </button>
            </div>
          </div>

          {/* Active Center Tab Component */}
          <div className="flex-1 overflow-hidden">
            {centerTab === 'visual' ? <VisualCircuitBuilder /> : <CodeEditorPanel />}
          </div>

          {/* Step-by-Step Quantum Circuit Stepper Bar */}
          <StepByStepStepper />
        </div>

        {/* Right Panel: Real-Time Quantum Visualization Space */}
        <div id="visualizer-panel" className="w-[360px] flex-shrink-0 flex flex-col bg-slate-50 border-l border-slate-200 overflow-hidden">
          <div className="h-10 flex-shrink-0 px-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Quantum preview</span>
            <span className="text-[10px] text-slate-500">Live state</span>
          </div>
          {/* Visualizer Mode Selector Switcher */}
          <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-center space-x-1">
            <button
              onClick={() => setVisualizerMode('bloch')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                visualizerMode === 'bloch'
                  ? 'bg-white text-blue-600 border border-slate-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>3D Bloch Sphere</span>
            </button>

            <button
              onClick={() => setVisualizerMode('qosphere')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-[11px] font-semibold transition-all ${
                visualizerMode === 'qosphere'
                  ? 'bg-white text-indigo-600 border border-slate-200 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-indigo-600" />
              <span>Qosphere Entanglement</span>
            </button>
          </div>

          {/* Render Active Visualizer */}
          {visualizerMode === 'bloch' ? <BlochSphere3D /> : <QosphereVisualizer />}
          
          <ProbabilitiesChart />
          <StateVectorMatrix />
        </div>
      </div>

      {/* Bottom Panel: Execution Logs, Terminal & QASM */}
      <TerminalOutput />
    </div>
  );
};

const MainContent: React.FC = () => {
  const { 
    user,
    activeView, 
    setActiveView,
    isNoiseModalOpen, 
    setIsNoiseModalOpen, 
    isMultiplayerModalOpen, 
    setIsMultiplayerModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    activeTestModal,
    closeModuleTest
  } = useQuantum();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('quantum-theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isModeChooserOpen, setIsModeChooserOpen] = useState(false);
  const previousUser = useRef(user);

  useEffect(() => {
    if (!previousUser.current && user && user.role !== 'admin') {
      setIsModeChooserOpen(true);
    }
    if (!user) {
      setIsModeChooserOpen(false);
    }
    previousUser.current = user;
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('quantum-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (!user) {
    return <AuthModal isOpen={true} isMandatory={true} onClose={() => {}} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-quantum-bg overflow-hidden select-none">
      <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((current) => !current)} />
      <main className="flex-1 flex overflow-hidden w-full">
        {activeView === 'workspace' && <WorkspaceLayout />}
        {activeView === 'learning-path' && <PersonalizedLearningPath />}
        {activeView === 'theory-math' && <AITheoryMathStudio />}
        {activeView === 'student-dashboard' && <StudentDashboard />}
        {activeView === 'student-analysis' && <StudentAnalysis />}
        {activeView === 'instructor-dashboard' && <InstructorDashboard />}
        {activeView === 'admin-db' && <AdminDBExplorerModal />}
      </main>
      <AITutorDrawer />
      <ArrowAssistOverlay />
      <InteractiveVoiceAnimationModal />
      <AICodeArchitectModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NoiseControlModal isOpen={isNoiseModalOpen} onClose={() => setIsNoiseModalOpen(false)} />
      <MultiplayerModal isOpen={isMultiplayerModalOpen} onClose={() => setIsMultiplayerModalOpen(false)} />
      <ModuleAgenticTestModal
        isOpen={activeTestModal.isOpen}
        moduleId={activeTestModal.moduleId}
        moduleTitle={activeTestModal.moduleTitle}
        onClose={closeModuleTest}
      />
      {isModeChooserOpen && (
        <ModeChooser
          onChoose={(view) => {
            setActiveView(view);
            setIsModeChooserOpen(false);
          }}
          onClose={() => setIsModeChooserOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <QuantumProvider>
      <MainContent />
    </QuantumProvider>
  );
}
