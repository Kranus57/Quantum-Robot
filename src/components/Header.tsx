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
  Cpu
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
    runAiExplain,
    isAiLoading,
    userBackground,
    setUserBackground,
    user,
    logoutUser,
    setIsAuthModalOpen,
    isArrowAssistActive,
    toggleArrowAssist,
    setIsVoiceAnimationModalOpen
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
          {/* Custom Sleek Logo */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group select-none" 
            onClick={() => setActiveView('workspace')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
              <Atom className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 font-sans uppercase">
                  QUANTUM<span className="text-blue-600 font-light">STUDIO</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Enterprise Simulation & Computing Platform</p>
            </div>
          </div>

          {/* Main View Navigation Switcher */}
          <nav className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveView('workspace')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'workspace'
                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lab Workspace</span>
            </button>

            {user?.role !== 'admin' && (
              <button
                onClick={() => setActiveView('student-dashboard')}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'student-dashboard'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('instructor-dashboard')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'instructor-dashboard'
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Faculty Analytics</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin-db')}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'admin-db'
                    ? 'bg-slate-900 text-indigo-400 shadow-sm border border-slate-700 font-bold'
                    : 'text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin DB</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right: Actions, Primary Run CTA & User Account Log Out Widget */}
        <div className="flex items-center space-x-3">
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

          {/* Account & Prominent Log Out Widget */}
          <div className="pl-3 border-l border-slate-200 flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user.role === 'admin' 
                    ? 'bg-indigo-600 text-white' 
                    : user.authProvider === 'google'
                      ? 'bg-blue-600 text-white'
                      : user.authProvider === 'twilio'
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

                <div className="hidden lg:block text-left pr-1">
                  <div className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user.fullName}</div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase flex items-center space-x-1">
                    <span>{user.role}</span>
                  </div>
                </div>

                {/* Explicit Prominent Log Out Button */}
                <button
                  onClick={logoutUser}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
                  title="Log Out of your Quantum Account"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
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

      {/* Bottom Sub-Bar: Framework Switcher, Presets & Workbench Tools */}
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

          {/* Diagnostics */}
          <button
            onClick={() => runAiDebug()}
            disabled={isAiLoading}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 text-[11px] font-semibold transition-all shadow-sm"
            title="Circuit Diagnostics"
          >
            <Bug className="w-3 h-3 text-indigo-600" />
            <span>Diagnostics</span>
          </button>

          {/* Optimizer */}
          <button
            onClick={() => runAiOptimize()}
            disabled={isAiLoading}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white hover:bg-amber-50 text-amber-600 border border-slate-200 text-[11px] font-semibold transition-all shadow-sm"
            title="Gate Optimization"
          >
            <Zap className="w-3 h-3 text-amber-600" />
            <span>Optimizer</span>
          </button>

          {/* Study Assistant */}
          <button
            onClick={() => runAiExplain()}
            disabled={isAiLoading}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-all shadow-sm"
            title="Study Reference Assistant"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Study Assistant</span>
          </button>

          {/* Voice & Animation Studio */}
          <button
            onClick={() => setIsVoiceAnimationModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[11px] font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-sm"
            title="Voice Narration & 3D Animation Studio"
          >
            <Mic className="w-3 h-3 text-white animate-pulse" />
            <span>Voice Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
