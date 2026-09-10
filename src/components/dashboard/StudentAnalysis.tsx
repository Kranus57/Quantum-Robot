import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { CURRICULUM_LESSONS } from '../../data/curriculumData';
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  BrainCircuit, 
  Award, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Compass,
  Zap,
  Layers,
  PieChart
} from 'lucide-react';

export const StudentAnalysis: React.FC = () => {
  const { studentProgress, setActiveView, user, pathSummary, launchPathNode, inspectedStudent, setInspectedStudent } = useQuantum();

  // Compute analytics
  const totalLessons = CURRICULUM_LESSONS.length;
  const completedCount = studentProgress.completedLessonIds.length;
  const overallCompletionRate = Math.round((completedCount / totalLessons) * 100);

  // Quiz scores calculation
  const quizScoresList = Object.values(studentProgress.quizScores);
  const avgQuizScore = quizScoresList.length > 0 
    ? Math.round(quizScoresList.reduce((a, b) => a + b, 0) / quizScoresList.length)
    : 100;

  // Category performance breakdown
  const categoryStats = CURRICULUM_LESSONS.reduce((acc, lesson) => {
    const cat = lesson.category;
    if (!acc[cat]) {
      acc[cat] = { total: 0, completed: 0, scoreSum: 0, countScored: 0 };
    }
    acc[cat].total += 1;
    if (studentProgress.completedLessonIds.includes(lesson.id)) {
      acc[cat].completed += 1;
    }
    if (studentProgress.quizScores[lesson.id] !== undefined) {
      acc[cat].scoreSum += studentProgress.quizScores[lesson.id];
      acc[cat].countScored += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number; scoreSum: number; countScored: number }>);

  // Skill mastery levels
  const categories = Object.keys(categoryStats);

  const displayName = inspectedStudent 
    ? inspectedStudent.name 
    : user 
      ? user.fullName 
      : 'Student';

  return (
    <div className="h-full bg-slate-50 text-slate-900 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-purple-200 mb-1">
              <BarChart2 className="w-4 h-4 text-cyan-300" />
              <span>{inspectedStudent ? `Teacher Inspection Mode: ${inspectedStudent.name}` : 'Personalized Learning & Performance Analytics'}</span>
              {inspectedStudent && (
                <button
                  onClick={() => setInspectedStudent(null)}
                  className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white border border-white/30 text-[10px] font-bold"
                >
                  Clear Inspection
                </button>
              )}
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyan-200 border border-white/20 text-[10px] font-bold">
                Student Intelligence v3.0
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {`${displayName}'s Performance Analysis`}
            </h1>
            <p className="text-xs text-purple-100 mt-1 max-w-2xl">
              Deep analytics on quiz accuracy, concept mastery, circuit execution metrics, and AI-recommended target areas.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveView('learning-path')}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Personalized Roadmap</span>
            </button>
            <button
              onClick={() => setActiveView('workspace')}
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-md hover:bg-purple-50 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-indigo-700 fill-current" />
              <span>Open Lab Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{avgQuizScore}%</div>
            <div className="text-xs text-slate-500 font-medium">Average Quiz Accuracy</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{overallCompletionRate}%</div>
            <div className="text-xs text-slate-500 font-medium">Curriculum Completion</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{studentProgress.totalCircuitsRun}</div>
            <div className="text-xs text-slate-500 font-medium">Circuits Executed</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{studentProgress.totalTimeSpentMinutes} mins</div>
            <div className="text-xs text-slate-500 font-medium">Interactive Learning Time</div>
          </div>
        </div>
      </div>

      {/* Grid: Skill Mastery Breakdown + AI Coach Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Skill Mastery Matrix */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <span>Concept Mastery Breakdown by Topic</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">4 Core Domains</span>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const stat = categoryStats[category];
              const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
              const avgScore = stat.countScored > 0 ? Math.round(stat.scoreSum / stat.countScored) : 100;

              return (
                <div key={category} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold">
                        {stat.completed} / {stat.total} Lessons Done
                      </span>
                    </div>
                    <div className="text-xs font-mono font-extrabold text-indigo-600">
                      Quiz Score: {avgScore}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Domain Mastery: {pct >= 80 ? 'Mastered ★' : pct >= 40 ? 'In Progress' : 'Needs Practice'}</span>
                    <span>{pct}% Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Personal Coach & Insights */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white space-y-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">AI Learning Coach Insights</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
                <BrainCircuit className="w-4 h-4" />
                <span>Recommended Next Step</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {pathSummary.recommendedNode 
                  ? pathSummary.recommendedNode.recommendedReason
                  : 'Great job! You have achieved high proficiency across all fundamental quantum topics.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>Circuit Execution Mastery</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                You have executed <span className="font-mono text-white font-bold">{studentProgress.totalCircuitsRun} quantum simulations</span>. Adding explicit Measurement gates and testing with noise models will increase statevector fidelity comprehension.
              </p>
            </div>

            {pathSummary.recommendedNode && (
              <button
                onClick={() => launchPathNode(pathSummary.recommendedNode!.lessonId)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Practice Recommended Topic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
