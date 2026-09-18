export type ActiveViewMode = 'workspace' | 'student-dashboard' | 'student-analysis' | 'instructor-dashboard' | 'admin-db' | 'learning-path' | 'theory-math';

export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  userBackground: UserBackgroundProfile;
  role: UserRole;
  phoneNumber?: string;
  authProvider?: 'email' | 'google' | 'otp';
  createdAt?: string;
}

export interface DBTableSummary {
  stats: {
    total_users: number;
    total_circuits: number;
    total_progress_records: number;
    total_badges: number;
    total_attempts: number;
    total_module_tests?: number;
    db_engine: string;
  };
  tables: {
    users: Array<{
      id: number;
      email: string;
      full_name: string;
      role: string;
      background: string;
      created_at: string;
    }>;
    quantum_circuits: Array<{
      id: string;
      title: string;
      user_id?: number;
      qubit_count: number;
      framework: string;
      gates_count: number;
      created_at: string;
    }>;
    student_progress: Array<{
      id: number;
      user_id?: number;
      lesson_id: string;
      quiz_score: number;
      completed_at: string;
    }>;
    badges: Array<{
      id: string;
      user_id?: number;
      badge_name: string;
      description: string;
      unlocked_at: string;
    }>;
    cohort_attempts: Array<{
      id: number;
      student_id: string;
      student_name: string;
      lesson_title: string;
      score: number;
      status: string;
      timestamp: string;
    }>;
    module_test_results?: Array<{
      id: number;
      user_id?: number;
      student_name: string;
      module_id: string;
      module_title: string;
      mcq_score: number;
      circuit_score: number;
      code_score: number;
      total_score: number;
      percentage: number;
      status: string;
      submitted_at: string;
    }>;
  };
}


export type GateType = 
  | 'H' 
  | 'X' 
  | 'Y' 
  | 'Z' 
  | 'S' 
  | 'T' 
  | 'CNOT' 
  | 'CZ' 
  | 'SWAP' 
  | 'TOFFOLI' 
  | 'MEASURE'
  | 'RX' 
  | 'RY' 
  | 'RZ';

export interface QuantumGate {
  id: string;
  type: GateType;
  qubit: number;
  targetQubit?: number;
  control2Qubit?: number;
  param?: number;
  step: number;
}

export type Framework = 'qiskit' | 'cirq' | 'pennylane' | 'qbraid' | 'native';

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface NoiseModel {
  isNoiseEnabled: boolean;
  t1Us: number;        // Thermal relaxation time in microseconds
  t2Us: number;        // Dephasing time in microseconds
  gateErrorRate: number; // Single/two qubit depolarizing error rate (0 - 0.05)
}

export interface SimulationResult {
  stateVector: ComplexNumber[];
  probabilities: Record<string, number>;
  noisyProbabilities?: Record<string, number>;
  counts: Record<string, number>;
  densityMatrix?: ComplexNumber[][];
  executionTimeMs: number;
  gateCount: number;
  depth: number;
  qasm: string;
  framework: Framework;
  fidelity?: number; // Quantum state fidelity [0, 1]
}

export interface BlochVector {
  x: number;
  y: number;
  z: number;
  theta: number;
  phi: number;
}

export interface QosphereNode {
  bitstring: string;
  probability: number;
  phaseRad: number;
  phaseDeg: number;
  hammingWeight: number;
  x: number;
  y: number;
}

export type UserBackgroundProfile = 'high-school' | 'cs-undergrad' | 'physics-phd';

export interface MultiplayerSession {
  sessionId: string;
  isHost: boolean;
  connectedUsers: {
    id: string;
    name: string;
    role: string;
    color: string;
  }[];
}

export interface CurriculumLesson {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Entanglement' | 'Algorithms' | 'Quantum ML';
  description: string;
  markdownContent: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  initialCircuit: QuantumGate[];
  qubitCount: number;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  challengeTargetState?: string;
}

export interface AIDebugResult {
  hasErrors: boolean;
  issues: {
    severity: 'error' | 'warning' | 'info';
    message: string;
    location?: string;
    suggestion: string;
  }[];
  correctedCode: string;
  explanation: string;
}

export interface AIOptimizationResult {
  originalDepth: number;
  optimizedDepth: number;
  originalGateCount: number;
  optimizedGateCount: number;
  cancellations: string[];
  optimizedGates: QuantumGate[];
  explanation: string;
}

export interface StudentProgress {
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: string;
  }[];
  totalCircuitsRun: number;
  totalTimeSpentMinutes: number;
}

export interface CohortAnalytics {
  totalStudents: number;
  averageCompletionRate: number;
  mostChallengingTopics: {
    topic: string;
    errorRate: number;
  }[];
  recentAttempts: {
    studentId: string;
    studentName: string;
    lessonTitle: string;
    score: number;
    timestamp: string;
    status: 'passed' | 'failed';
  }[];
}

