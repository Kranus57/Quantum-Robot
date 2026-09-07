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
  ArrowLeft
} from 'lucide-react';

export const AdminDBExplorerModal: React.FC = () => {
  const { fetchAdminDBData, deleteUserFromDB, setActiveView, user } = useQuantum();

  const [dbData, setDbData] = useState<DBTableSummary | null>(null);
  const [activeTable, setActiveTable] = useState<'users' | 'quantum_circuits' | 'student_progress' | 'badges' | 'cohort_attempts'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadDB = async () => {
    setIsLoading(true);
    setMsg(null);
    const data = await fetchAdminDBData();
    if (data) {
      setDbData(data);
    } else {
      setMsg('Failed to connect to backend database endpoint.');
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
    if (!dbData || !dbData.tables[activeTable]) return [];
    const rows = dbData.tables[activeTable] as any[];
    if (!searchQuery.trim()) return rows;

    const q = searchQuery.toLowerCase();
    return rows.filter(row => 
      Object.values(row).some(val => 
        val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    );
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Top Banner & Return Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>SQL Database Explorer & Inspector</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time inspection of backend database tables (SQLite / PostgreSQL), user accounts, circuit QASM records, student module progress, and cohort activity log.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('workspace')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition-all flex items-center space-x-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Admin Mode</span>
          </button>

          <button
            onClick={loadDB}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh DB</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-indigo-400 hover:text-white font-bold">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{dbData?.stats.total_users ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Students & Admins</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Circuits Saved</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{dbData?.stats.total_circuits ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">QASM Circuit Records</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Progress Logs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{dbData?.stats.total_progress_records ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Lesson Completions</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Unlocked Badges</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{dbData?.stats.total_badges ?? '-'}</div>
          <div className="text-[10px] text-slate-500 font-mono">Achievement Badges</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">DB Status</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-cyan-400 font-mono mt-1">ONLINE</div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{dbData?.stats.db_engine || 'SQLAlchemy Active'}</div>
        </div>
      </div>

      {/* Table Navigation & Search Bar */}
      <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          {/* Table Switcher */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            {(['users', 'student_progress', 'badges', 'quantum_circuits', 'cohort_attempts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTable(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTable === tab
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.replace('_', ' ').toUpperCase()} ({dbData?.tables[tab]?.length || 0})
              </button>
            ))}
          </div>

          {/* Search Filter Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTable}...`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-700">
                {activeTable === 'users' && (
                  <>
                    <th className="p-3">ID</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Background</th>
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
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
              {getFilteredRows().length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching database records found for "{activeTable}".
                  </td>
                </tr>
              ) : (
                getFilteredRows().map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/60 transition-colors">
                    {activeTable === 'users' && (
                      <>
                        <td className="p-3 text-slate-400">#{row.id}</td>
                        <td className="p-3 font-semibold text-indigo-300">{row.email}</td>
                        <td className="p-3 text-white">{row.full_name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            row.role === 'admin' ? 'bg-indigo-900 text-indigo-300 border border-indigo-700' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {row.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{row.background}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.created_at}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(row.id, row.email)}
                            className="p-1 rounded bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-800 transition-colors"
                            title="Delete User from DB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </>
                    )}

                    {activeTable === 'student_progress' && (
                      <>
                        <td className="p-3 text-slate-400">#{row.id}</td>
                        <td className="p-3 text-indigo-300">User #{row.user_id}</td>
                        <td className="p-3 text-emerald-400 font-semibold">{row.lesson_id}</td>
                        <td className="p-3 text-amber-400 font-bold">{row.quiz_score}%</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.completed_at}</td>
                      </>
                    )}

                    {activeTable === 'badges' && (
                      <>
                        <td className="p-3 text-slate-400">{row.id}</td>
                        <td className="p-3 text-indigo-300">User #{row.user_id}</td>
                        <td className="p-3 text-amber-300 font-bold">{row.badge_name}</td>
                        <td className="p-3 text-slate-300 text-[11px]">{row.description}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.unlocked_at}</td>
                      </>
                    )}

                    {activeTable === 'quantum_circuits' && (
                      <>
                        <td className="p-3 text-slate-400">{row.id}</td>
                        <td className="p-3 font-semibold text-white">{row.title}</td>
                        <td className="p-3 text-indigo-300">User #{row.user_id}</td>
                        <td className="p-3 text-cyan-400">{row.qubit_count} Qubits</td>
                        <td className="p-3 uppercase text-slate-300">{row.framework}</td>
                        <td className="p-3 text-slate-400">{row.gates_count} gates</td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.created_at}</td>
                      </>
                    )}

                    {activeTable === 'cohort_attempts' && (
                      <>
                        <td className="p-3 text-slate-400">#{row.id}</td>
                        <td className="p-3 font-semibold text-white">{row.student_name}</td>
                        <td className="p-3 text-slate-300">{row.lesson_title}</td>
                        <td className="p-3 text-amber-400 font-bold">{row.score}%</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            row.status === 'passed' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{row.timestamp}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
