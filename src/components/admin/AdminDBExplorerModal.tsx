import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { DBTableSummary } from '../../types/quantum';
import { 
  Database, 
  Users, 
  Cpu, 
  Award, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  FileSpreadsheet,
  AlertTriangle,
  ArrowLeft,
  Server,
  Key,
  Upload
} from 'lucide-react';
import { CSVDataModal } from './CSVDataModal';

export const AdminDBExplorerModal: React.FC = () => {
  const { fetchAdminDBData, deleteUserFromDB, setActiveView, user } = useQuantum();

  const [dbData, setDbData] = useState<DBTableSummary | null>(null);
  const [dbHealth, setDbHealth] = useState<any | null>(null);
  const [activeTable, setActiveTable] = useState<'users' | 'quantum_circuits' | 'student_progress' | 'badges' | 'cohort_attempts' | 'module_test_results'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);

  const loadDB = async () => {
    setIsLoading(true);
    setMsg(null);
    const data = await fetchAdminDBData();
    if (data) {
      setDbData(data);
    } else {
      setMsg('Failed to connect to backend database endpoint.');
    }

    try {
      const healthRes = await fetch('/api/db/health');
      if (healthRes.ok) {
        const hData = await healthRes.json();
        setDbHealth(hData);
      }
    } catch (e) {
      console.warn('Could not fetch DB health status:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDB();
  }, []);

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user #${userId} (${email}) from the database?`)) return;
    
    const success = await deleteUserFromDB(userId);
    if (success) {
      setMsg(`User #${userId} deleted successfully.`);
      loadDB();
    } else {
      setMsg(`Failed to delete user #${userId}.`);
    }
  };

  const getFilteredRows = () => {
    if (!dbData || !dbData.tables[activeTable as keyof typeof dbData.tables]) return [];
    const rows = (dbData.tables[activeTable as keyof typeof dbData.tables] || []) as any[];
    if (!searchQuery.trim()) return rows;

    const q = searchQuery.toLowerCase();
    return rows.filter(row => 
      Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    );
  };

  return (
    <div className="w-full flex-1 h-full bg-slate-50 text-slate-900 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-200 mb-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Administrator Control Center & Database Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-indigo-300" />
            <span>SQL & Document DB Explorer & Record Inspector</span>
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-2xl">
            Real-time inspection of backend SQLite / PostgreSQL database tables, user authentication records, quantum circuit QASM state vectors, and AI-graded module tests.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('instructor-dashboard')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center space-x-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Faculty Analytics</span>
          </button>

          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            title="Import and Add CSV Records into Database"
          >
            <Upload className="w-4 h-4" />
            <span>Add CSV to DB</span>
          </button>

          <button
            onClick={loadDB}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh DB</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between shadow-sm font-medium">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-indigo-600 hover:text-indigo-900 font-bold">Dismiss</button>
        </div>
      )}

      {/* Stats KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{dbData?.stats.total_users ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Circuits</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{dbData?.stats.total_circuits ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Saved QASM</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Progress</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{dbData?.stats.total_progress_records ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Lessons Completed</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Badges</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{dbData?.stats.total_badges ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Achievements</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">AI Module Tests</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{dbData?.stats.total_module_tests ?? dbData?.tables.module_test_results?.length ?? 0}</div>
          <div className="text-[10px] text-slate-500 font-mono">Test Evaluations</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">DB Engine</span>
            <Server className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xs font-bold text-emerald-600 font-mono mt-1 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{dbHealth?.status === 'healthy' ? 'HEALTHY' : 'ACTIVE'}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono truncate">{dbData?.stats.db_engine || 'SQLAlchemy Engine'}</div>
        </div>
      </div>

      {/* Table Navigation & Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Table Switcher */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['users', 'student_progress', 'badges', 'quantum_circuits', 'cohort_attempts', 'module_test_results'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTable(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTable === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.replace(/_/g, ' ').toUpperCase()} ({dbData?.tables[tab as keyof typeof dbData.tables]?.length || 0})
              </button>
            ))}
          </div>

          {/* Search Filter Bar */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTable.replace(/_/g, ' ')}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-sm"
            />
          </div>
        </div>

        {/* Professional Light Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-mono border-b border-slate-200 uppercase text-[11px]">
                {activeTable === 'users' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Background Track</th>
                    <th className="p-3">Created At</th>
                    <th className="p-3 text-right">Actions</th>
                  </>
                )}

                {activeTable === 'student_progress' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Lesson ID</th>
                    <th className="p-3">Quiz Score</th>
                    <th className="p-3">Completed At</th>
                  </>
                )}

                {activeTable === 'badges' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Badge Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Unlocked At</th>
                  </>
                )}

                {activeTable === 'quantum_circuits' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Qubits</th>
                    <th className="p-3">Framework</th>
                    <th className="p-3">Gates Count</th>
                    <th className="p-3">Created At</th>
                  </>
                )}

                {activeTable === 'cohort_attempts' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Lesson Title</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                  </>
                )}

                {activeTable === 'module_test_results' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Module</th>
                    <th className="p-3">MCQ</th>
                    <th className="p-3">Circuit</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted At</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-mono text-slate-800 bg-white">
              {getFilteredRows().length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                    No matching database records found for "{activeTable}".
                  </td>
                </tr>
              ) : (
                getFilteredRows().map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    {activeTable === 'users' && (
                      <>
                        <td className="p-3 text-slate-500">#{row.id}</td>
                        <td className="p-3 font-bold text-blue-700">{row.email}</td>
                        <td className="p-3 text-slate-900 font-bold">{row.full_name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            row.role === 'admin' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {row.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{row.background}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.created_at}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(row.id, row.email)}
                            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all font-bold text-[11px] flex items-center space-x-1 ml-auto"
                            title="Delete User from DB"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </>
                    )}

                    {activeTable === 'student_progress' && (
                      <>
                        <td className="p-3 text-slate-500">#{row.id}</td>
                        <td className="p-3 text-blue-700 font-bold">User #{row.user_id}</td>
                        <td className="p-3 text-emerald-700 font-bold">{row.lesson_id}</td>
                        <td className="p-3 text-amber-700 font-extrabold">{row.quiz_score}%</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.completed_at}</td>
                      </>
                    )}

                    {activeTable === 'badges' && (
                      <>
                        <td className="p-3 text-slate-500">{row.id}</td>
                        <td className="p-3 text-blue-700 font-bold">User #{row.user_id}</td>
                        <td className="p-3 text-amber-800 font-bold">{row.badge_name}</td>
                        <td className="p-3 text-slate-600 text-[11px]">{row.description}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.unlocked_at}</td>
                      </>
                    )}

                    {activeTable === 'quantum_circuits' && (
                      <>
                        <td className="p-3 text-slate-500">{row.id}</td>
                        <td className="p-3 font-bold text-slate-900">{row.title}</td>
                        <td className="p-3 text-blue-700 font-bold">User #{row.user_id}</td>
                        <td className="p-3 text-indigo-700 font-bold">{row.qubit_count} Qubits</td>
                        <td className="p-3 uppercase text-slate-700 font-bold">{row.framework}</td>
                        <td className="p-3 text-slate-600">{row.gates_count} gates</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.created_at}</td>
                      </>
                    )}

                    {activeTable === 'cohort_attempts' && (
                      <>
                        <td className="p-3 text-slate-500">#{row.id}</td>
                        <td className="p-3 font-bold text-slate-900">{row.student_name}</td>
                        <td className="p-3 text-slate-700">{row.lesson_title}</td>
                        <td className="p-3 text-amber-700 font-bold">{row.score}%</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            row.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.timestamp}</td>
                      </>
                    )}

                    {activeTable === 'module_test_results' && (
                      <>
                        <td className="p-3 text-slate-500">#{row.id}</td>
                        <td className="p-3 font-bold text-slate-900">{row.student_name}</td>
                        <td className="p-3 text-indigo-700 font-bold">{row.module_title}</td>
                        <td className="p-3 text-slate-700">{row.mcq_score} pts</td>
                        <td className="p-3 text-slate-700">{row.circuit_score} pts</td>
                        <td className="p-3 text-slate-700">{row.code_score} pts</td>
                        <td className="p-3 font-extrabold text-blue-700">{row.percentage}% ({row.total_score} pts)</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            row.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.submitted_at}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import & Export Modal (Pure White Background, Non-Neon) */}
      <CSVDataModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onDataImported={loadDB}
        dbData={dbData}
      />
    </div>
  );
};

