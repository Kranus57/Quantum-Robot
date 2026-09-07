import React from 'react';
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
import { InstructorDashboard } from './components/dashboard/InstructorDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AdminDBExplorerModal } from './components/admin/AdminDBExplorerModal';
import { ArrowAssistOverlay } from './components/workspace/ArrowAssistOverlay';
import { Cpu, Code2, Globe, Network } from 'lucide-react';

const WorkspaceLayout: React.FC = () => {
  const { centerTab, setCenterTab, visualizerMode, setVisualizerMode } = useQuantum();

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* 3-Panel Split View Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Structured Markdown Curriculum Viewer */}
        <div className="w-[360px] flex-shrink-0">
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
        <div id="visualizer-panel" className="w-[380px] flex-shrink-0 flex flex-col bg-slate-50 border-l border-slate-200 overflow-hidden">
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
    isNoiseModalOpen, 
    setIsNoiseModalOpen, 
    isMultiplayerModalOpen, 
    setIsMultiplayerModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useQuantum();

  if (!user) {
    return <AuthModal isOpen={true} isMandatory={true} onClose={() => {}} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-quantum-bg overflow-hidden select-none">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'workspace' && <WorkspaceLayout />}
        {activeView === 'student-dashboard' && <StudentDashboard />}
        {activeView === 'instructor-dashboard' && <InstructorDashboard />}
        {activeView === 'admin-db' && <AdminDBExplorerModal />}
      </main>
      <AITutorDrawer />
      <ArrowAssistOverlay />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <NoiseControlModal isOpen={isNoiseModalOpen} onClose={() => setIsNoiseModalOpen(false)} />
      <MultiplayerModal isOpen={isMultiplayerModalOpen} onClose={() => setIsMultiplayerModalOpen(false)} />
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
