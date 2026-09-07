import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { CURRICULUM_LESSONS } from '../../data/curriculumData';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Play, 
  Sparkles, 
  Trophy,
  Database,
  User as UserIcon,
  LogIn
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { studentProgress, selectLessonById, setActiveView, user, setIsAuthModalOpen } = useQuantum();

  const completionPct = Math.round(
    (studentProgress.completedLessonIds.length / CURRICULUM_LESSONS.length) * 100
  );

  return (
    <div className="h-full bg-slate-50 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-blue-200 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Student Learning Profile & DB Tracking</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/40 text-white border border-blue-300/40 text-[10px] flex items-center space-x-1">
                <Database className="w-3 h-3 text-cyan-300" />
                <span>DB Live Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {user ? `Welcome back, ${user.fullName}!` : 'Quantum Learner Progress & Badges'}
            </h1>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              {user 
                ? `Account: ${user.email} | Background Profile: ${user.userBackground.toUpperCase()} | Student ID: #${user.id}`
                : 'Track your module completion, quiz accuracy scores, hands-on quantum challenge badges, and statevector execution history.'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs shadow-md hover:bg-white/30 border border-white/40 transition-all flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Register</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('workspace')}
              className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center space-x-2"
            >
              <Play className="w-4 h-4 fill-blue-700" />
              <span>Continue Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{completionPct}%</div>
            <div className="text-xs text-slate-500">Curriculum Progress</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{studentProgress.badges.length}</div>
            <div className="text-xs text-slate-500">Unlocked Badges</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{studentProgress.totalCircuitsRun}</div>
            <div className="text-xs text-slate-500">Circuits Executed</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{studentProgress.totalTimeSpentMinutes}m</div>
            <div className="text-xs text-slate-500">Interactive Learning Time</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Curriculum Modules Roadmap</span>
            </h3>
            <span className="text-xs text-slate-500">{studentProgress.completedLessonIds.length} of {CURRICULUM_LESSONS.length} Completed</span>
          </div>

          <div className="space-y-3">
            {CURRICULUM_LESSONS.map((lesson) => {
              const isDone = studentProgress.completedLessonIds.includes(lesson.id);
              const score = studentProgress.quizScores[lesson.id] || 0;

              return (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isDone
                      ? 'bg-slate-50 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-4 h-4" />}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{lesson.title}</h4>
                      <p className="text-[11px] text-slate-500">{lesson.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-blue-600">
                      Quiz: {score}%
                    </span>
                    <button
                      onClick={() => {
                        selectLessonById(lesson.id);
                        setActiveView('workspace');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 shadow-sm"
                    >
                      {isDone ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Achievement Badges</span>
          </h3>

          <div className="space-y-3">
            {studentProgress.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-indigo-900">{badge.name}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{badge.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">Unlocked: {badge.unlockedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
