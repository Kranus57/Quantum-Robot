import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { LearningGoal, PaceSetting, PersonalizedPathNode } from '../../types/learningPath';
import { UserBackgroundProfile } from '../../types/quantum';
import { 
  Compass, 
  Target, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Play, 
  BookOpen, 
  Globe, 
  Network, 
  Cpu, 
  Brain,
  GraduationCap,
  Info,
  X,
  Zap,
  Flame
} from 'lucide-react';

export const PersonalizedLearningPath: React.FC = () => {
  const { 
    user, 
    userBackground, 
    setUserBackground,
    learningGoal, 
    setLearningGoal, 
    learningPace, 
    setLearningPace, 
    pathSummary, 
    launchPathNode,
    setActiveView,
    openModuleTest
  } = useQuantum();

  const [selectedInspectNode, setSelectedInspectNode] = useState<PersonalizedPathNode | null>(null);
  const [activeExplanationTab, setActiveExplanationTab] = useState<'intuitive' | 'csLogic' | 'physicsMath'>('csLogic');

  const handleGoalChange = (newGoal: LearningGoal) => {
    setLearningGoal(newGoal);
  };

  const handlePaceChange = (newPace: PaceSetting) => {
    setLearningPace(newPace);
  };

  const getDomainIcon = (category: string) => {
    switch (category) {
      case 'superposition': return <Globe className="w-5 h-5 text-blue-600" />;
      case 'entanglement': return <Network className="w-5 h-5 text-indigo-600" />;
      case 'algorithms': return <Cpu className="w-5 h-5 text-purple-600" />;
      case 'qml_vqe': return <Sparkles className="w-5 h-5 text-amber-600" />;
      default: return <BookOpen className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="w-full flex-1 h-full bg-white overflow-y-auto p-6 space-y-6 select-none">
      {/* Top Banner: User Profile, Goal Selection & Dynamic Pace */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-600 mb-1">
                <Compass className="w-4 h-4 text-blue-600" />
                <span className="font-bold">Adaptive Learning Pathway Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
                  REAL-TIME ADAPTIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {user ? `Personalized Pathway for ${user.fullName}` : 'Personalized Quantum Roadmap'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed font-medium">
                Tailored dynamically based on your academic profile ({userBackground.toUpperCase()}) and chosen learning goal.
              </p>
            </div>

            {/* Quick Action Button to Lab Workspace */}
            <button
              onClick={() => setActiveView('workspace')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-2 border border-blue-600 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Lab Workspace</span>
            </button>
          </div>

          {/* Goal & Track Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Learning Goal Selector */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Focus Goal:</span>
              </label>
              <select
                value={learningGoal}
                onChange={(e) => handleGoalChange(e.target.value as LearningGoal)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-600 shadow-xs"
              >
                <option value="foundations">Foundations & Superposition</option>
                <option value="quantum-algorithms">Quantum Algorithms & Fourier Transform</option>
                <option value="quantum-ml">Quantum ML & Variational Eigensolvers</option>
                <option value="hardware-noise">Hardware Noise & NISQ Optimization</option>
              </select>
            </div>

            {/* Academic Track Switcher */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Background:</span>
              </label>
              <select
                value={userBackground}
                onChange={(e) => setUserBackground(e.target.value as UserBackgroundProfile)}
                className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-600 shadow-xs"
              >
                <option value="high-school">High School (Intuitive Analogies)</option>
                <option value="cs-undergrad">CS Undergrad (Matrix & Code Logic)</option>
                <option value="physics-phd">Physics PhD (Dirac Notation & Hilbert Space)</option>
              </select>
            </div>

            {/* Learning Pace Selector */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
              <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Target Pace:</span>
              </label>
              <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {(['casual', 'standard', 'intensive'] as PaceSetting[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePaceChange(p)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      learningPace === p
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p === 'casual' ? '15m/d' : p === 'standard' ? '30m/d' : '60m/d'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Milestone Overview Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Completion Percentage Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-slate-100" fill="transparent" />
              <circle 
                cx="28" 
                cy="28" 
                r="22" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-blue-600 transition-all duration-1000 ease-out" 
                fill="transparent" 
                strokeDasharray={138}
                strokeDashoffset={138 - (138 * pathSummary.overallProgressPct) / 100}
              />
            </svg>
            <span className="absolute font-black text-xs text-slate-900">{pathSummary.overallProgressPct}%</span>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Goal Progress</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              {pathSummary.completedModules} of {pathSummary.totalModules} Completed
            </div>
          </div>
        </div>

        {/* Estimated Days to Mastery */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Estimated Pace</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">
              ~{pathSummary.estimatedDaysToComplete} Days to Mastery
            </div>
          </div>
        </div>

        {/* Active Goal Focus */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Track Focus</div>
            <div className="text-sm font-extrabold text-slate-900 mt-0.5 truncate max-w-[140px]">
              {learningGoal.replace('-', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Next Action Indicator */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Recommended Next</div>
            <div className="text-xs font-extrabold text-slate-900 mt-0.5 truncate max-w-[140px]">
              {pathSummary.recommendedNode?.title.split('.')[1] || 'All Completed!'}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Mastery Domains Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span>Skill Mastery Domains</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pathSummary.skills.map((skill) => (
            <div key={skill.category} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  {getDomainIcon(skill.category)}
                  <span className="truncate max-w-[130px]">{skill.title}</span>
                </span>
                <span className="text-xs font-mono font-bold text-blue-600">{skill.score}%</span>
              </div>
              
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700" 
                  style={{ width: `${skill.score}%` }} 
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-tight font-medium">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Pathway Connected Tree Nodes */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>Your Custom Learning Sequence Roadmap</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click any node to preview tailored content, adaptive math explanations, or launch in workspace.
            </p>
          </div>
        </div>

        {/* Node Connection Pathway List */}
        <div className="space-y-4 relative">
          {pathSummary.nodes.map((node, index) => {
            const isLast = index === pathSummary.nodes.length - 1;
            const isMastered = node.status === 'mastered';
            const isRecommended = node.status === 'recommended_next';
            const isLocked = node.status === 'locked';

            return (
              <div key={node.id} className="relative pl-8">
                {/* Vertical Connector Line */}
                {!isLast && (
                  <div 
                    className={`absolute left-3.5 top-10 bottom-0 w-0.5 ${
                      isMastered ? 'bg-emerald-400' : 'bg-slate-200'
                    }`} 
                  />
                )}

                {/* Node Status Circle Badge */}
                <div 
                  className={`absolute left-0 top-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                    isMastered
                      ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                      : isRecommended
                      ? 'bg-indigo-600 text-white shadow-indigo-500/30 animate-bounce'
                      : isLocked
                      ? 'bg-slate-100 text-slate-400 border border-slate-300'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isMastered ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span>{node.sequenceOrder}</span>
                  )}
                </div>

                {/* Node Card Container */}
                <div 
                  className={`p-5 rounded-2xl border transition-all ${
                    isRecommended
                      ? 'bg-indigo-50/60 border-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                      : isMastered
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : isLocked
                      ? 'bg-white border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        {isRecommended && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs animate-pulse">
                            ★ RECOMMENDED NEXT STEP
                          </span>
                        )}
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
                          {node.categoryLabel}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ~{node.estimatedMinutes} mins • {node.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        {node.title}
                      </h4>
                      
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {node.recommendedReason}
                      </p>

                      {/* Adaptive Explanation Teaser */}
                      <div className="pt-2 flex items-center space-x-2 text-xs">
                        <span className="text-[11px] font-semibold text-slate-500">Adaptive Math Mode:</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold">
                          {userBackground === 'high-school' ? 'Analogies' : userBackground === 'physics-phd' ? 'Dirac Notation' : 'CS Matrix Logic'}
                        </span>
                      </div>
                    </div>

                    {/* Node Action CTA Buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedInspectNode(node)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect Preview</span>
                      </button>

                      <button
                        onClick={() => openModuleTest(node.lessonId, node.title)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Take Module Test</span>
                      </button>

                      <button
                        onClick={() => launchPathNode(node.lessonId)}
                        disabled={isLocked}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs active:scale-95 cursor-pointer ${
                          isRecommended
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                            : isMastered
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : isLocked
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-none'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isMastered ? 'Review Lesson' : isRecommended ? 'Start Lesson Now' : 'Start Lesson'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Adaptive Explanation Inspector Modal */}
      {selectedInspectNode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-mono text-blue-600">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="font-bold">Adaptive Explanation Inspector</span>
              </div>
              <button 
                onClick={() => setSelectedInspectNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 space-y-5 text-slate-700 text-sm max-h-[80vh] overflow-y-auto">
              <div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedInspectNode.categoryLabel}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedInspectNode.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedInspectNode.recommendedReason}</p>
              </div>

              {/* Perspective Mode Switcher Tabs */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800">Select Adaptive Explanation Mode:</div>
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setActiveExplanationTab('intuitive')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeExplanationTab === 'intuitive'
                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Intuitive Analogies
                  </button>
                  <button
                    onClick={() => setActiveExplanationTab('csLogic')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeExplanationTab === 'csLogic'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CS Matrix & Code
                  </button>
                  <button
                    onClick={() => setActiveExplanationTab('physicsMath')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeExplanationTab === 'physicsMath'
                        ? 'bg-white text-purple-600 shadow-xs border border-slate-200 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Physics & Dirac Math
                  </button>
                </div>
              </div>

              {/* Formatted Adaptive Explanation Text */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 leading-relaxed text-xs text-slate-800 font-mono shadow-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1.5">
                  {activeExplanationTab === 'intuitive' ? '🎨 High School Level Analogies' : activeExplanationTab === 'physicsMath' ? '🔬 Physics PhD Dirac Notation' : '💻 CS Matrix Logic'}
                </div>
                <p className="whitespace-pre-line text-xs font-sans text-slate-800 leading-normal font-medium">
                  {selectedInspectNode.adaptiveExplanations[activeExplanationTab]}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedInspectNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const lessonId = selectedInspectNode.lessonId;
                    setSelectedInspectNode(null);
                    launchPathNode(lessonId);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open in Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
