import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { DBTableSummary } from '../../types/quantum';
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Database
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { fetchAdminDBData } = useQuantum();
  const [dbData, setDbData] = useState<DBTableSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Compute live analytics from backend database
  const studentUsers = dbData?.tables.users.filter((u: any) => u.role === 'student') || [];
  const totalStudents = studentUsers.length;
  const progressRecords = dbData?.tables.student_progress || [];
  const cohortAttempts = dbData?.tables.cohort_attempts || [];

  // Average Completion Rate
  const totalPossible = totalStudents > 0 ? totalStudents * 4 : 1;
  const averageCompletionRate = totalStudents > 0 
    ? Math.round((progressRecords.length / totalPossible) * 100)
    : 0;

  return (
    <div className="h-full bg-slate-50 text-slate-900 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-200 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Live Faculty Analytics & DB Inspector</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Quantum Computing Course Performance</h1>
          <p className="text-xs text-blue-100 mt-1">
            Real-time cohort performance synced directly with active SQLite / PostgreSQL user records.
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

      {/* Grid: Error Heatmap + Student Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Students Database List */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Enrolled Student Accounts</span>
          </h3>

          {studentUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
              No student accounts registered in database yet.
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs">
              {studentUsers.map((st: any) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      #{st.id}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{st.full_name}</div>
                      <div className="text-[10px] text-slate-500">{st.email}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-bold uppercase">
                    {st.background || 'cs-undergrad'}
                  </span>
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
    </div>
  );
};
