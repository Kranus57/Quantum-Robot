import React from 'react';
import { useQuantum } from '../context/QuantumContext';
import { Framework, UserBackgroundProfile } from '../types/quantum';
import { 
  Atom, 
  Play, 
  Bug, 
  Zap, 
  BookOpen, 
  UserCheck, 
  BarChart3, 
  Sparkles,
  Activity,
  Users,
  GraduationCap,
  Database,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Navigation,
  Mic
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    framework, 
    setFramework, 
    runSimulation, 
    loadPreset, 
    runAiDebug,
    runAiOptimize,
    runAiExplain,
    isAiLoading,
    noiseModel,
    setIsNoiseModalOpen,
    userBackground,
    setUserBackground,
    setIsMultiplayerModalOpen,
    multiplayerSession,
    user,
    logoutUser,
    setIsAuthModalOpen,
    isArrowAssistActive,
    toggleArrowAssist,
    setIsVoiceAnimationModalOpen
  } = useQuantum();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Brand, Arrow Assist & Navigation Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('workspace')}>
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Atom className="w-5 h-5 text-blue-600 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Quantum Lab
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Academic Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Quantum Physics & Computing Study Workbench</p>
          </div>
        </div>

        {/* Top Left Arrow Assist Toggle Button */}
        <button
          onClick={toggleArrowAssist}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 border ${
            isArrowAssistActive
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
          }`}
          title="Interactive Workbench Guided Tour & Study Steps"
        >
          <Navigation className={`w-3.5 h-3.5 ${isArrowAssistActive ? 'text-slate-950 fill-current' : 'text-cyan-600'}`} />
          <span>Workbench Guide</span>
          {isArrowAssistActive && (
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping ml-0.5" />
          )}
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveView('workspace')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'workspace'
                ? 'bg-white text-blue-600 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lab Workspace</span>
          </button>

          <button
            onClick={() => setActiveView('student-dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'student-dashboard'
                ? 'bg-white text-indigo-600 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student Study Portal</span>
          </button>

          <button
            onClick={() => setActiveView('instructor-dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'instructor-dashboard'
                ? 'bg-white text-emerald-600 font-semibold shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Faculty Analytics</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveView('admin-db')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'admin-db'
                  ? 'bg-slate-900 text-indigo-400 font-semibold shadow-sm border border-slate-700'
                  : 'text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Database Explorer</span>
            </button>
          )}
        </nav>
      </div>

      {/* Control Bar Actions */}
      <div className="flex items-center space-x-2">
        {/* User Background Profile Switcher */}
        <div className="hidden lg:flex items-center space-x-1.5">
          <span className="text-xs text-slate-500 flex items-center space-x-1 font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] text-slate-600">Track:</span>
          </span>
          <select
            value={userBackground}
            onChange={(e) => setUserBackground(e.target.value as UserBackgroundProfile)}
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            title="Curriculum Academic Study Track"
          >
            <option value="high-school">High School Physics</option>
            <option value="cs-undergrad">CS Undergraduate</option>
            <option value="physics-phd">Quantum Physics PhD</option>
          </select>
        </div>

        {/* Preset Loader */}
        <div className="hidden md:flex items-center space-x-1.5">
          <select
            onChange={(e) => e.target.value && loadPreset(e.target.value)}
            defaultValue=""
            className="bg-white border border-slate-200 text-xs text-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-sm"
          >
            <option value="" disabled>Presets...</option>
            <option value="Bell State">Bell State (|Φ+⟩)</option>
            <option value="GHZ State">GHZ State (3 Qubits)</option>
            <option value="Quantum Teleportation">Quantum Teleportation</option>
            <option value="Grover Search">Grover's Search</option>
          </select>
        </div>

        {/* Framework Selector */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {(['qiskit', 'cirq', 'pennylane'] as Framework[]).map((fw) => (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              className={`px-2 py-1 rounded text-[11px] font-mono uppercase transition-all ${
                framework === fw
                  ? 'bg-white text-blue-600 font-bold border border-slate-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        {/* AI Action Triggers */}
        <div id="ai-tutor-trigger" className="flex items-center space-x-1 pl-1 border-l border-slate-200">
          <button
            onClick={() => runAiDebug()}
            disabled={isAiLoading}
            className="p-1.5 rounded-lg bg-white text-indigo-600 border border-slate-200 hover:bg-indigo-50 transition-all shadow-sm flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold"
            title="Circuit Diagnostics & Verification"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>

          <button
            onClick={() => runAiOptimize()}
            disabled={isAiLoading}
            className="p-1.5 rounded-lg bg-white text-amber-600 border border-slate-200 hover:bg-amber-50 transition-all shadow-sm flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold"
            title="Gate Depth Optimization"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Optimizer</span>
          </button>

          <button
            onClick={() => runAiExplain()}
            disabled={isAiLoading}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shadow-sm text-xs font-semibold transition-all"
            title="Study Reference & Theoretical Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Study Assistant</span>
          </button>

          {/* Interactive Voice & Animation Explainer CTA Button */}
          <button
            onClick={() => setIsVoiceAnimationModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md active:scale-95 border border-cyan-300/30"
            title="Open 3D Bloch Sphere & Interactive Voice Narration Explainer Studio"
          >
            <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>Voice & Animation</span>
          </button>
        </div>

        {/* Run Circuit Main CTA */}
        <button
          onClick={runSimulation}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Run</span>
        </button>

        {/* User Account / Auth Control Widget */}
        <div className="pl-2 border-l border-slate-200 flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {user.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="hidden xl:block text-left pr-1">
                <div className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user.fullName}</div>
                <div className="text-[9px] font-mono text-slate-500 uppercase">{user.role}</div>
              </div>
              <button
                onClick={logoutUser}
                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

