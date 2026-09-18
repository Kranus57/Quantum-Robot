import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Users, 
  Sparkles, 
  TrendingUp,
  Database
} from 'lucide-react';
import { DBTableSummary } from '../../types/quantum';

interface CSVDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported?: () => void;
  dbData: DBTableSummary | null;
  moduleTestResults?: any[];
}

export const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseCSV = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
  const lines = text.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const splitRow = (rowStr: string) => {
    const result: string[] = [];
    let insideQuotes = false;
    let entry = '';
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const headers = splitRow(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]).map(v => v.replace(/^["']|["']$/g, '').trim());
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rowObj[h] = values[colIdx] ?? '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
};

const TEMPLATES: Record<string, { headers: string[]; sample: string; description: string }> = {
  users: {
    headers: ['full_name', 'email', 'background', 'role'],
    sample: `full_name,email,background,role
Emma Watson,emma.watson@quantumedu.ai,cs-undergrad,student
David Chen,david.chen@quantumedu.ai,physics-phd,student
Sophia Rodriguez,sophia.r@quantumedu.ai,high-school,student`,
    description: 'Enrolls new student or faculty accounts into the database system.'
  },
  module_test_results: {
    headers: ['student_name', 'module_id', 'module_title', 'mcq_score', 'circuit_score', 'code_score'],
    sample: `student_name,module_id,module_title,mcq_score,circuit_score,code_score
Emma Watson,module_1,Qubit Fundamentals & Superposition,38,28,26
David Chen,module_2,Quantum Entanglement & Bell States,40,30,28
Sophia Rodriguez,module_1,Qubit Fundamentals & Superposition,32,24,20`,
    description: 'Imports comprehensive module assessment marks and automated test performance.'
  },
  cohort_attempts: {
    headers: ['student_name', 'lesson_title', 'score', 'status'],
    sample: `student_name,lesson_title,score,status
Emma Watson,Lesson 1: Superposition & Statevector,95,passed
David Chen,Lesson 2: Quantum Gates & Bloch Sphere,88,passed
Sophia Rodriguez,Lesson 1: Superposition & Statevector,74,passed`,
    description: 'Imports study submission attempts and quiz scores for class cohorts.'
  },
  student_progress: {
    headers: ['email', 'lesson_id', 'quiz_score'],
    sample: `email,lesson_id,quiz_score
emma.watson@quantumedu.ai,lesson_1,100
david.chen@quantumedu.ai,lesson_2,90
sophia.r@quantumedu.ai,lesson_1,80`,
    description: 'Logs individual student curriculum milestone completions.'
  }
};

export const CSVDataModal: React.FC<CSVDataModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
  dbData,
  moduleTestResults = []
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [rawCSVText, setRawCSVText] = useState<string>(TEMPLATES['users'].sample);
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: Record<string, string>[] }>(
    parseCSV(TEMPLATES['users'].sample)
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTableChange = (tbl: string) => {
    setSelectedTable(tbl);
    const tmpl = TEMPLATES[tbl] || TEMPLATES['users'];
    setRawCSVText(tmpl.sample);
    setParsedData(parseCSV(tmpl.sample));
    setFeedback(null);
  };

  const handleTextChange = (text: string) => {
    setRawCSVText(text);
    const parsed = parseCSV(text);
    setParsedData(parsed);
    setFeedback(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const tmpl = TEMPLATES[selectedTable];
    if (!tmpl) return;
    const blob = new Blob([tmpl.sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${selectedTable}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportToDB = async () => {
    if (parsedData.rows.length === 0) {
      setFeedback({ type: 'error', message: 'No valid data rows found in CSV. Please verify formatting.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: selectedTable,
          rows: parsedData.rows
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFeedback({
          type: 'success',
          message: data.message || `Successfully added ${data.inserted_count} record(s) to database!`
        });
        if (onDataImported) {
          onDataImported();
        }
      } else {
        setFeedback({
          type: 'error',
          message: data.detail || (data.errors && data.errors.join(', ')) || 'Failed to import CSV into database.'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error connecting to database.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export handlers
  const handleExportFullStudyReport = () => {
    const users = dbData?.tables.users || [];
    const progress = dbData?.tables.student_progress || [];
    const circuits = dbData?.tables.quantum_circuits || [];
    const attempts = dbData?.tables.cohort_attempts || [];

    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Track Background',
      'Role',
      'Completed Lessons',
      'Saved Circuits Count',
      'Recent Submissions',
      'Registered At'
    ];

    const rows = users.map((u: any) => {
      const userProgress = progress.filter((p: any) => p.user_id === u.id);
      const userCircuits = circuits.filter((c: any) => c.user_id === u.id);
      const userAttempts = attempts.filter((a: any) => a.student_id === String(u.id) || a.student_name === u.full_name);

      return [
        u.id,
        u.full_name,
        u.email,
        u.background || 'cs-undergrad',
        u.role || 'student',
        userProgress.length,
        userCircuits.length,
        userAttempts.length,
        u.created_at || 'Recently'
      ];
    });

    downloadCSV(`quantum_course_study_report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleExportTestResults = () => {
    const tests = moduleTestResults.length > 0 ? moduleTestResults : (dbData?.tables.module_test_results || []);
    const headers = [
      'Record ID',
      'Student Name',
      'Module Title',
      'MCQ Score (40)',
      'Circuit Score (30)',
      'Code Score (30)',
      'Total Marks (100)',
      'Percentage',
      'Grading Status',
      'Submitted At'
    ];

    const rows = tests.map((t: any) => [
      t.id,
      t.student_name,
      t.module_title,
      t.mcq_score,
      t.circuit_score,
      t.code_score,
      t.total_score,
      `${t.percentage}%`,
      t.status,
      t.submitted_at || 'Recently'
    ]);

    downloadCSV(`quantum_module_test_marks_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleExportEnrolledStudents = () => {
    const users = dbData?.tables.users || [];
    const headers = ['User ID', 'Full Name', 'Email Address', 'Track', 'Role', 'Enrolled Date'];
    const rows = users.map((u: any) => [
      u.id,
      u.full_name,
      u.email,
      u.background || 'cs-undergrad',
      u.role || 'student',
      u.created_at || 'Recently'
    ]);

    downloadCSV(`enrolled_students_roster_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleExportCohortAttempts = () => {
    const attempts = dbData?.tables.cohort_attempts || [];
    const headers = ['Attempt ID', 'Student Name', 'Lesson Title', 'Quiz Score', 'Status', 'Timestamp'];
    const rows = attempts.map((a: any) => [
      a.id,
      a.student_name,
      a.lesson_title,
      `${a.score}%`,
      a.status,
      a.timestamp || 'Recently'
    ]);

    downloadCSV(`cohort_submissions_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[96vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                CSV Report & Database Import Center
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Generate dynamic course CSV reports or upload CSV files directly to backend database.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setActiveTab('export'); setFeedback(null); }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Take / Download CSV Report</span>
            </button>

            <button
              onClick={() => { setActiveTab('import'); setFeedback(null); }}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Add CSV to Database</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            SQLite / PostgreSQL Database Sync Active
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-4 rounded-xl border text-xs flex items-center justify-between font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="text-xs font-bold hover:underline cursor-pointer ml-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: EXPORT CSV REPORTS */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Download Faculty & Course Reports</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export structured CSV data containing real-time student profiles, quiz scores, and module test marks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Study Report */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Comprehensive Course Study Report</h4>
                      <p className="text-[11px] text-slate-500">Includes all student study metrics, progress, and circuit stats.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportFullStudyReport}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Study Report (CSV)</span>
                  </button>
                </div>

                {/* Module Test Results */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-indigo-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Module Test Marks & Assessment Scores</h4>
                      <p className="text-[11px] text-slate-500">Automated MCQ, circuit, and code grading breakdown.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportTestResults}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Test Marks (CSV)</span>
                  </button>
                </div>

                {/* Enrolled Students */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-emerald-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Enrolled Student Accounts Roster</h4>
                      <p className="text-[11px] text-slate-500">Student ID, full names, emails, academic track, and role.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportEnrolledStudents}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Student Roster (CSV)</span>
                  </button>
                </div>

                {/* Cohort Attempts */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-purple-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Recent Lesson Submissions</h4>
                      <p className="text-[11px] text-slate-500">Real-time lesson completion submissions and quiz logs.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportCohortAttempts}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Submissions (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT CSV TO DB */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {/* Step 1: Target Table Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Step 1: Select Target Database Table
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'users', label: 'Enrolled Students', icon: Users },
                    { id: 'module_test_results', label: 'Test Marks', icon: Sparkles },
                    { id: 'cohort_attempts', label: 'Cohort Submissions', icon: TrendingUp },
                    { id: 'student_progress', label: 'Lesson Progress', icon: Database }
                  ].map((tbl) => {
                    const Icon = tbl.icon;
                    return (
                      <button
                        key={tbl.id}
                        onClick={() => handleTableChange(tbl.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col space-y-1 ${
                          selectedTable === tbl.id
                            ? 'bg-blue-50/70 border-blue-500 text-blue-900 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">{tbl.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500">
                  {TEMPLATES[selectedTable]?.description}
                </p>
              </div>

              {/* Step 2: Upload File or Edit CSV */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Step 2: Upload CSV File or Paste Data
                  </label>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample Template</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-600" />
                    <span>Browse .CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400">or paste / edit CSV data directly below:</span>
                </div>

                <textarea
                  value={rawCSVText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={5}
                  className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-blue-600 leading-relaxed shadow-xs"
                  placeholder="Paste CSV contents with header row..."
                />
              </div>

              {/* Step 3: Parsed Data Live Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Step 3: Preview Parsed Records ({parsedData.rows.length} rows detected)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Target Table: <span className="font-bold text-slate-800">{selectedTable}</span>
                  </span>
                </div>

                {parsedData.rows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
                    No data rows parsed yet. Enter or upload CSV text above.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-48 bg-white shadow-xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] sticky top-0">
                        <tr>
                          <th className="p-2.5 w-10 text-center">#</th>
                          {parsedData.headers.map((h, idx) => (
                            <th key={idx} className="p-2.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {parsedData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-blue-50/40 transition-all">
                            <td className="p-2.5 text-center text-slate-400 font-bold">{rIdx + 1}</td>
                            {parsedData.headers.map((h, cIdx) => (
                              <td key={cIdx} className="p-2.5 font-medium">{row[h] || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>

          {activeTab === 'import' && (
            <button
              onClick={handleImportToDB}
              disabled={isSubmitting || parsedData.rows.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Inserting into Database...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Confirm & Add {parsedData.rows.length} Record(s) to DB</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
