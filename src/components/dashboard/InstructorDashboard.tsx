import React from 'react';
import { CohortAnalytics } from '../../types/quantum';
import { 
  Users, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const cohortData: CohortAnalytics = {
    totalStudents: 148,
    averageCompletionRate: 78.5,
    mostChallengingTopics: [
      { topic: 'Phase Kickback & Controlled Unitaries', errorRate: 42.1 },
      { topic: 'Grover Oracle Diffuser Phase Inversion', errorRate: 36.4 },
      { topic: 'Quantum Fourier Transform (QFT) Swaps', errorRate: 29.8 },
      { topic: 'Bell State CNOT Control Alignment', errorRate: 18.2 },
    ],
    recentAttempts: [
      { studentId: 'st_101', studentName: 'Alex Rivera', lessonTitle: '2. Quantum Entanglement & Bell States', score: 100, timestamp: '10 mins ago', status: 'passed' },
      { studentId: 'st_102', studentName: 'Maya Patel', lessonTitle: '4. Grover’s Quantum Search Algorithm', score: 60, timestamp: '25 mins ago', status: 'failed' },
      { studentId: 'st_103', studentName: 'Jordan Chen', lessonTitle: '1. Qubit Fundamentals & Superposition', score: 100, timestamp: '1 hour ago', status: 'passed' },
      { studentId: 'st_104', studentName: 'Sarah Jenkins', lessonTitle: '3. Quantum Teleportation Protocol', score: 85, timestamp: '2 hours ago', status: 'passed' },
    ]
  };

  return (
    <div className="h-full bg-quantum-bg overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-quantum-panel via-quantum-card to-quantum-dark border border-quantum-border flex items-center justify-between shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-quantum-magenta mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Instructor Cohort Analytics Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Quantum Computing Course Performance</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time analytics pinpointing student concept friction, error rates, and assignment pass rates.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-quantum-card border border-quantum-border text-xs font-bold text-gray-200 hover:text-white hover:border-quantum-cyan/40 transition-all flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-quantum-cyan" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-quantum-panel/80 border border-quantum-border flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-quantum-cyan/20 text-quantum-cyan flex items-center justify-center border border-quantum-cyan/40">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{cohortData.totalStudents}</div>
            <div className="text-xs text-gray-400">Enrolled Students</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-quantum-panel/80 border border-quantum-border flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{cohortData.averageCompletionRate}%</div>
            <div className="text-xs text-gray-400">Average Module Completion</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-quantum-panel/80 border border-quantum-border flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/40">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">4 Topics</div>
            <div className="text-xs text-gray-400">Friction Points Identified</div>
          </div>
        </div>
      </div>

      {/* Grid: Error Heatmap + Student Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Error Heatmap */}
        <div className="p-5 rounded-2xl bg-quantum-panel/80 border border-quantum-border space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-pink-400" />
            <span>Highest Error Rate Quantum Topics</span>
          </h3>

          <div className="space-y-3">
            {cohortData.mostChallengingTopics.map((item, idx) => (
              <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-quantum-dark/80 border border-quantum-border">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-gray-200">{item.topic}</span>
                  <span className="font-mono text-pink-400 font-bold">{item.errorRate}% Error Rate</span>
                </div>

                <div className="w-full bg-quantum-card h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-red-500 h-full rounded-full"
                    style={{ width: `${item.errorRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Attempt Logs */}
        <div className="p-5 rounded-2xl bg-quantum-panel/80 border border-quantum-border space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-quantum-cyan" />
            <span>Recent Student Submissions</span>
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {cohortData.recentAttempts.map((attempt) => (
              <div
                key={attempt.studentId}
                className="p-3 rounded-xl bg-quantum-dark/80 border border-quantum-border flex items-center justify-between hover:border-quantum-cyan/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {attempt.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <div className="font-bold text-gray-200">{attempt.studentName}</div>
                    <div className="text-[10px] text-gray-400">{attempt.lessonTitle}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold ${attempt.status === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>
                    Score: {attempt.score}%
                  </div>
                  <div className="text-[10px] text-gray-500">{attempt.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
