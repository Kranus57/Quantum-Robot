import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { DBTableSummary, QuantumGate } from '../../types/quantum';
import { CURRICULUM_LESSONS } from '../../data/curriculumData';
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  FileSpreadsheet,
  RefreshCw,
  Database,
  Eye,
  BookOpen,
  Cpu,
  Award,
  Play,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface StudentStudyDetail {
  student: { id: number; full_name: string; email: string; background: string };
  circuits: Array<{ id: string; title: string; qubit_count: number; gates: QuantumGate[]; framework: string; created_at: string }>;
  progress: Array<{ id: number; lesson_id: string; quiz_score: number; completed_at: string }>;
  badges: Array<{ id: string; badge_name: string; description: string; unlocked_at: string }>;
}

export const InstructorDashboard: React.FC = () => {
  const { fetchAdminDBData, loadStudentCircuitIntoWorkspace, setInspectedStudent, setActiveView } = useQuantum();
  const [dbData, setDbData] = useState<DBTableSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Selected Student Study Modal State
  const [selectedStudentStudy, setSelectedStudentStudy] = useState<StudentStudyDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFetchingStudentDetail, setIsFetchingStudentDetail] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchAdminDBData();
    if (data) {
      setDbData(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const inspectStudentStudy = async (student: { id: number; full_name: string; email: string; background: string }) => {
    setIsFetchingStudentDetail(true);
    setSelectedStudentStudy({ student, circuits: [], progress: [], badges: [] });
    setIsModalOpen(true);

    try {
      const [circuitsRes, progressRes] = await Promise.all([
        fetch(`/api/user/circuits/${student.id}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/user/progress/${student.id}`).then(r => r.ok ? r.json() : null)
      ]);

      setSelectedStudentStudy({
        student,
        circuits: Array.isArray(circuitsRes) ? circuitsRes : [],
        progress: progressRes?.progress || [],
        badges: progressRes?.badges || []
      });
    } catch (e) {
      console.warn('Could not fetch student detailed study info:', e);
    } finally {
      setIsFetchingStudentDetail(false);
    }
  };

  // Compute live analytics from backend database
  const studentUsers = dbData?.tables.users.filter((u: any) => u.role === 'student') || [
    { id: 2, full_name: 'Alex Rivera', email: 'alex@quantumedu.ai', background: 'cs-undergrad' }
  ];
  const totalStudents = studentUsers.length;
  const progressRecords = dbData?.tables.student_progress || [];
  const cohortAttempts = dbData?.tables.cohort_attempts || [];

  // Average Completion Rate
  const totalPossible = totalStudents > 0 ? totalStudents * 4 : 1;
  const averageCompletionRate = totalStudents > 0 
    ? Math.round((progressRecords.length / totalPossible) * 100)
    : 0;

  return (
    <div className="h-full bg-slate-50 text-slate-900 overflow-y-auto p-6 space-y-6 relative">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-200 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Live Faculty Analytics & Student Study Inspector</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Quantum Computing Course Performance</h1>
          <p className="text-xs text-blue-100 mt-1">
            Inspect individual student study activity, saved circuits, lesson progress, and quiz performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={loadData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white transition-all flex items-center space-x-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh DB</span>
          </button>

          <button className="px-4 py-2 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-700" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{totalStudents}</div>
            <div className="text-xs text-slate-500 font-medium">Registered Students in DB</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{averageCompletionRate}%</div>
            <div className="text-xs text-slate-500 font-medium font-sans">Module Completion Rate</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{progressRecords.length}</div>
            <div className="text-xs text-slate-500 font-medium">Progress Logs Recorded</div>
          </div>
        </div>
      </div>

      {/* Grid: Enrolled Students Database List + Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Students Database List with Study Inspection */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Enrolled Student Accounts</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Click to inspect study details</span>
          </div>

          {studentUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
              No student accounts registered in database yet.
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {studentUsers.map((st: any) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all flex items-center justify-between shadow-sm group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      #{st.id}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{st.full_name || st.fullName}</div>
                      <div className="text-[10px] text-slate-500">{st.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-bold uppercase">
                      {st.background || 'cs-undergrad'}
                    </span>
                    <button
                      onClick={() => inspectStudentStudy({ id: st.id, full_name: st.full_name || st.fullName, email: st.email, background: st.background || 'cs-undergrad' })}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all flex items-center space-x-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Study</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Attempt Logs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Recent Student Submissions</span>
          </h3>

          {cohortAttempts.length === 0 && progressRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
              No recent student submissions recorded in database yet.
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {(cohortAttempts.length > 0 ? cohortAttempts : progressRecords).map((attempt: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">{attempt.student_name || `Student #${attempt.user_id}`}</div>
                      <div className="text-[10px] text-slate-500">{attempt.lesson_title || attempt.lesson_id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-emerald-600">
                      Score: {attempt.score || attempt.quiz_score || 100}%
                    </div>
                    <div className="text-[10px] text-slate-400">{attempt.timestamp || attempt.completed_at || 'Just now'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Teacher Student Study Inspection Modal */}
      {isModalOpen && selectedStudentStudy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  #{selectedStudentStudy.student.id}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {selectedStudentStudy.student.full_name} — Student Study Profile
                  </h2>
                  <div className="text-xs text-slate-300 font-mono">
                    {selectedStudentStudy.student.email} • Track: {selectedStudentStudy.student.background.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {isFetchingStudentDetail ? (
                <div className="p-12 text-center text-slate-500 font-mono text-xs flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>Fetching real-time student study records from database...</span>
                </div>
              ) : (
                <>
                  {/* Progress & Badges Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold mb-1">Lessons Completed</div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {selectedStudentStudy.progress.length} / {CURRICULUM_LESSONS.length}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold mb-1">Saved Quantum Circuits</div>
                      <div className="text-xl font-extrabold text-blue-600">
                        {selectedStudentStudy.circuits.length}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs text-slate-500 font-semibold mb-1">Badges Earned</div>
                      <div className="text-xl font-extrabold text-indigo-600">
                        {selectedStudentStudy.badges.length}
                      </div>
                    </div>
                  </div>

                  {/* Student Saved Circuits Section */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      <span>Student Study Saved Circuits & Workspaces</span>
                    </h3>

                    {selectedStudentStudy.circuits.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
                        No saved quantum circuits found for this student. Default sandbox active.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedStudentStudy.circuits.map((circ) => (
                          <div
                            key={circ.id}
                            className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                                <span>{circ.title}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-bold uppercase">
                                  {circ.framework}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Qubits: {circ.qubit_count} | Gates: {Array.isArray(circ.gates) ? circ.gates.length : 0} | Saved: {circ.created_at || 'Recently'}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                loadStudentCircuitIntoWorkspace(circ.gates, circ.qubit_count, circ.title);
                                setIsModalOpen(false);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Load in Workspace</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Completed Curriculum Modules */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      <span>Completed Lesson Progress</span>
                    </h3>

                    {selectedStudentStudy.progress.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
                        Student has not logged lesson progress yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedStudentStudy.progress.map((prog) => (
                          <div
                            key={prog.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-slate-900">{prog.lesson_id}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-600">Quiz: {prog.quiz_score}%</span>
                              <div className="text-[10px] text-slate-400">{prog.completed_at || 'Completed'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setInspectedStudent({ id: selectedStudentStudy.student.id, name: selectedStudentStudy.student.full_name });
                  setActiveView('student-analysis');
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Full Student Analysis</span>
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
