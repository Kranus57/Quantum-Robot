import React, { useState } from 'react';
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
  BarChart2,
  Sparkles,
  GraduationCap,
  Database,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Navigation,
  Mic,
  Save,
  Check,
  Layers,
  Cpu,
  Compass,
  BrainCircuit,
  Award,
  Volume2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    framework, 
    setFramework, 
    runSimulation, 
    saveCircuitToDB,
    loadPreset, 
    runAiDebug,
    runAiOptimize,
    runAiOptimizeAndDebug,
    runAiExplain,
    isAiLoading,
    userBackground,
    setUserBackground,
    user,
    logoutUser,
    setIsAuthModalOpen,
    isArrowAssistActive,
    toggleArrowAssist,
    setIsVoiceAnimationModalOpen,
    openModuleTest
  } = useQuantum();

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveCircuit = async () => {
    const success = await saveCircuitToDB();
    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-sm">
      {/* Top Bar: Primary Branding, Main Navigation, Run CTA & Account Controls */}
      <div className="h-13 px-4 flex items-center justify-between border-b border-slate-200">
        {/* Left: Custom Product Logo & Navigation Tabs */}
        <div className="flex items-center space-x-6">
          {/* Custom Sleek Corporate Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group select-none" 
            onClick={() => setActiveView('workspace')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-all">
              <Atom className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm tracking-tight text-slate-900 font-sans uppercase">
                  QUANTUM<span className="text-blue-600 font-bold">STUDIO</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  ENTERPRISE v3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Enterprise Simulation & Computing Platform</p>
            </div>
          </div>

          {/* Main View Navigation Switcher */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {user?.role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveView('instructor-dashboard')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'instructor-dashboard'
                      ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Faculty Analytics</span>
                </button>

                <button
                  onClick={() => setActiveView('admin-db')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'admin-db'
                      ? 'bg-slate-900 text-white shadow-sm border border-slate-700 font-bold'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin DB</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('workspace')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'workspace'
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lab Workspace</span>
                </button>

                <button
                  onClick={() => setActiveView('learning-path')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'learning-path'
                      ? 'bg-indigo-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Learning Path</span>
                </button>

                <button
                  onClick={() => setActiveView('theory-math')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'theory-math'
                      ? 'bg-cyan-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Theory Lab</span>
                </button>

                <button
                  onClick={() => setActiveView('student-dashboard')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'student-dashboard'
                      ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student Portal</span>
                </button>

                <button
                  onClick={() => setActiveView('student-analysis')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeView === 'student-analysis'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Student Analysis</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right: Actions, Primary Run CTA & User Account Log Out Widget */}
        <div className="flex items-center space-x-3">
          {user?.role !== 'admin' && (
            <>
              {/* Academic Track Switcher */}
              <div className="hidden xl:flex items-center space-x-1.5">
                <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-semibold">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Track:</span>
                </span>
                <select
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value as UserBackgroundProfile)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
                >
                  <option value="high-school">High School Physics</option>
                  <option value="cs-undergrad">CS Undergraduate</option>
                  <option value="physics-phd">Quantum Physics PhD</option>
                </select>
              </div>

              {/* Dynamic Assessment Test Button (Green Button, No Neon) */}
              <button
                onClick={() => openModuleTest('dynamic-test', 'Dynamic Quantum Assessment Test')}
                className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm border border-emerald-700 active:scale-95"
                title="Launch Dynamic Professional Test Site"
              >
                <Award className="w-3.5 h-3.5 text-white" />
                <span>Test</span>
              </button>

              {/* Save Work to DB Button */}
              <button
                onClick={handleSaveCircuit}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                  isSaved
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
                title="Save Active Circuit to SQLite / PostgreSQL Database"
              >
                {isSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5 text-slate-600" />}
                <span>{isSaved ? 'Saved to DB!' : 'Save Work'}</span>
              </button>

              {/* Run Circuit Main Action */}
              <button
                onClick={runSimulation}
                className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Circuit</span>
              </button>
            </>
          )}

          {/* Account & Always-Visible Log Out Widget at Top Right */}
          <div className="pl-3 border-l border-slate-200 flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 p-1 pl-2 rounded-xl shadow-sm">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user.role === 'admin' 
                    ? 'bg-indigo-600 text-white' 
                    : user.authProvider === 'google'
                      ? 'bg-blue-600 text-white'
                      : user.authProvider === 'otp'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                }`}>
                  {user.role === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : user.authProvider === 'google' ? (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                    </svg>
                  ) : (
                    <UserIcon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="hidden sm:block text-left pr-1">
                  <div className="text-[11px] font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.fullName}</div>
                  <div className="text-[9px] font-mono text-indigo-600 uppercase font-bold flex items-center space-x-1">
                    <span>{user.role}</span>
                  </div>
                </div>

                {/* Always-Visible Prominent Log Out Button */}
                <button
                  onClick={logoutUser}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all active:scale-95 shadow-sm"
                  title="Log Out of your Account"
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar: Framework Switcher, Presets & Workbench Tools (Only for non-admin students/learners) */}
      {user?.role !== 'admin' && (
        <div className="h-9 px-4 bg-slate-50 flex items-center justify-between text-xs border-b border-slate-200">
          {/* Left Sub-Bar Controls: Presets & Multi-Framework Engines */}
          <div className="flex items-center space-x-4">
            {/* Preset Selector */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Presets:</span>
              </span>
              <select
                onChange={(e) => e.target.value && loadPreset(e.target.value)}
                defaultValue=""
                className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-2 py-0.5 focus:outline-none focus:border-blue-500 shadow-sm font-medium"
              >
                <option value="" disabled>Load Circuit Preset...</option>
                <option value="Bell State">Bell State (|Φ+⟩)</option>
                <option value="GHZ State">GHZ State (3 Qubits)</option>
                <option value="Quantum Teleportation">Quantum Teleportation</option>
                <option value="Grover Search">Grover's Search</option>
              </select>
            </div>

            {/* Framework Selector */}
            <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-4">
              <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Backend Engine:</span>
              </span>
              <div className="flex items-center space-x-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                {(['qiskit', 'cirq', 'pennylane', 'qbraid'] as Framework[]).map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      framework === fw
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {fw}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sub-Bar Controls: AI & Study Assistants */}
          <div className="flex items-center space-x-2">
            {/* Workbench Guide */}
            <button
              onClick={toggleArrowAssist}
              className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all border ${
                isArrowAssistActive
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-sm animate-pulse'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-sm'
              }`}
              title="Interactive Workbench Guided Tour"
            >
              <Navigation className={`w-3 h-3 ${isArrowAssistActive ? 'text-white fill-current' : 'text-cyan-600'}`} />
              <span>Guide</span>
            </button>

            {/* Connected Optimizer & Debugger */}
            <button
              onClick={() => runAiOptimizeAndDebug()}
              disabled={isAiLoading}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
              title="AI Connected Circuit Optimizer & Physical Debugger"
            >
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Optimize & Debug</span>
            </button>

            {/* Tutor */}
            <button
              onClick={() => runAiExplain()}
              disabled={isAiLoading}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
              title="Tutor"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tutor</span>
            </button>

            {/* Explain in Voice (Button 1 of 2) */}
            <button
              onClick={() => setIsVoiceAnimationModalOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
              title="Multilingual AI Voice Narration & 3D Bloch Animation"
            >
              <Volume2 className="w-3 h-3 text-white animate-pulse" />
              <span>Explain in Voice</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
