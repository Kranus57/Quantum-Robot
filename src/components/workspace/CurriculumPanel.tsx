import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { CURRICULUM_LESSONS } from '../../data/curriculumData';
import { getAdaptiveExplanation } from '../../utils/personalizedPathEngine';
import { BookOpen, CheckCircle, HelpCircle, Sparkles, ChevronRight, Compass, GraduationCap, BrainCircuit } from 'lucide-react';

export const CurriculumPanel: React.FC = () => {
  const { currentLesson, selectLessonById, submitQuizAnswer, studentProgress, runAiExplain, userBackground, pathSummary, setActiveView } = useQuantum();
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const handleAnswer = (optionIdx: number) => {
    setSelectedQuizOption(optionIdx);
    const isCorrect = submitQuizAnswer(currentLesson.id, optionIdx);
    setQuizSubmitted(true);
    setQuizFeedback({
      isCorrect,
      explanation: currentLesson.quiz.explanation
    });
  };

  const handleLessonSwitch = (lessonId: string) => {
    selectLessonById(lessonId);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setQuizFeedback(null);
  };

  const adaptiveText = getAdaptiveExplanation(currentLesson.id, userBackground);

  return (
    <div id="curriculum-panel" className="h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
      {/* Lesson Selector Bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Modules</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveView('theory-math')}
            className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 font-bold flex items-center space-x-1 transition-all"
            title="Open AI Theory & Math Studio"
          >
            <BrainCircuit className="w-3 h-3 text-cyan-600" />
            <span>Math Lab</span>
          </button>
          <button
            onClick={() => setActiveView('learning-path')}
            className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold flex items-center space-x-1 transition-all"
            title="Open Personalized Pathway Roadmap"
          >
            <Compass className="w-3 h-3 text-indigo-600" />
            <span>Path</span>
          </button>
          <span className="text-[11px] px-2.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-mono font-medium shadow-sm">
            {studentProgress.completedLessonIds.length} / {CURRICULUM_LESSONS.length} Completed
          </span>
        </div>
      </div>

      {/* Module List Pills */}
      <div className="p-2 border-b border-slate-200 bg-slate-50/50 flex space-x-1.5 overflow-x-auto">
        {CURRICULUM_LESSONS.map((lesson) => {
          const isCompleted = studentProgress.completedLessonIds.includes(lesson.id);
          const isActive = currentLesson.id === lesson.id;
          return (
            <button
              key={lesson.id}
              onClick={() => handleLessonSwitch(lesson.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {isCompleted ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <ChevronRight className="w-3 h-3" />}
              <span>{lesson.title.split('.')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm text-slate-700 leading-relaxed">
        {/* Module Header */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200">
              {currentLesson.category}
            </span>
            <span className="text-xs text-slate-500">{currentLesson.difficulty} Level</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{currentLesson.title}</h2>
          <p className="text-xs text-slate-500 mt-1">{currentLesson.description}</p>
        </div>

        {/* Adaptive Explanation Profile Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-blue-900 font-bold">
            <span className="flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Adaptive Explanation ({userBackground.toUpperCase()} Track)</span>
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            {adaptiveText}
          </p>
        </div>

        {/* Formatted Lesson Text & Formulas */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {currentLesson.markdownContent.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return null;
            }
            if (paragraph.startsWith('## ')) {
              return <h3 key={idx} className="text-sm font-bold text-blue-700 mt-3">{paragraph.replace('## ', '')}</h3>;
            }
            if (paragraph.startsWith('### ')) {
              return <h4 key={idx} className="text-xs font-semibold text-indigo-700 mt-2">{paragraph.replace('### ', '')}</h4>;
            }
            if (paragraph.includes('$$')) {
              const formula = paragraph.replace(/\$\$/g, '');
              return (
                <div key={idx} className="my-2 p-3 rounded-lg bg-white border border-slate-200 text-center font-mono text-blue-700 text-xs overflow-x-auto shadow-sm">
                  {formula}
                </div>
              );
            }
            return <p key={idx} className="text-xs text-slate-700 leading-normal">{paragraph}</p>;
          })}
        </div>

        {/* AI Explain Helper Button */}
        <button
          onClick={() => runAiExplain(currentLesson.title)}
          className="w-full py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium flex items-center justify-center space-x-2 hover:bg-blue-100 shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Ask AI Tutor to Explain Math & Gates</span>
        </button>

        {/* Interactive Lesson Quiz */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Module Quiz</span>
          </div>

          <p className="text-xs text-slate-900 font-semibold">{currentLesson.quiz.question}</p>

          <div className="space-y-2">
            {currentLesson.quiz.options.map((option, optionIdx) => {
              const isSelected = selectedQuizOption === optionIdx;
              const isCorrect = optionIdx === currentLesson.quiz.correctIndex;
              let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm';

              if (quizSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                }
              }

              return (
                <button
                  key={optionIdx}
                  onClick={() => !quizSubmitted && handleAnswer(optionIdx)}
                  disabled={quizSubmitted}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start space-x-2 ${btnStyle}`}
                >
                  <span className="font-mono font-bold text-slate-500">{String.fromCharCode(65 + optionIdx)}.</span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {quizSubmitted && quizFeedback && (
            <div className={`p-4 rounded-xl text-xs space-y-3 shadow-sm ${
              quizFeedback.isCorrect 
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  {quizFeedback.isCorrect ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Module Solved & Verified! +100 XP</span>
                    </>
                  ) : (
                    <span>Incorrect Answer. Review explanation below:</span>
                  )}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">{quizFeedback.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
