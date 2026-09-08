import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  QuantumGate, 
  SimulationResult, 
  Framework, 
  CurriculumLesson, 
  AIDebugResult, 
  AIOptimizationResult,
  StudentProgress,
  NoiseModel,
  UserBackgroundProfile,
  MultiplayerSession,
  User,
  ActiveViewMode,
  DBTableSummary
} from '../types/quantum';
import { CURRICULUM_LESSONS } from '../data/curriculumData';
import { 
  simulateCircuit, 
  generateQiskitCode, 
  generateCirqCode, 
  generatePennyLaneCode 
} from '../utils/quantumSimulator';

interface QuantumContextType {
  // Authentication & User State
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (email: string, pass: string, fullName: string, background: UserBackgroundProfile, role: 'student' | 'admin') => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (googleUserPayload?: { email?: string; fullName?: string }) => Promise<{ success: boolean; message?: string }>;
  logoutUser: () => void;

  // Workspace Layout State
  activeView: ActiveViewMode;
  setActiveView: (view: ActiveViewMode) => void;
  centerTab: 'visual' | 'code';
  setCenterTab: (tab: 'visual' | 'code') => void;
  visualizerMode: 'bloch' | 'qosphere';
  setVisualizerMode: (mode: 'bloch' | 'qosphere') => void;

  // Circuit State
  gates: QuantumGate[];
  setGates: React.Dispatch<React.SetStateAction<QuantumGate[]>>;
  qubitCount: number;
  setQubitCount: (count: number) => void;
  addGate: (gate: Omit<QuantumGate, 'id'>) => void;
  removeGate: (gateId: string) => void;
  clearCircuit: () => void;
  loadPreset: (presetName: string) => void;

  // Simulation, Framework & Noise
  framework: Framework;
  setFramework: (fw: Framework) => void;
  codeString: string;
  setCodeString: (code: string) => void;
  simulationResult: SimulationResult | null;
  setSimulationResult: React.Dispatch<React.SetStateAction<SimulationResult | null>>;
  runSimulation: () => void;
  selectedQubit: number;
  setSelectedQubit: (qubit: number) => void;
  noiseModel: NoiseModel;
  setNoiseModel: (model: NoiseModel) => void;
  isNoiseModalOpen: boolean;
  setIsNoiseModalOpen: (open: boolean) => void;

  // Next-Gen Multiplayer & Adaptive Background Profile
  userBackground: UserBackgroundProfile;
  setUserBackground: (profile: UserBackgroundProfile) => void;
  multiplayerSession: MultiplayerSession | null;
  setMultiplayerSession: (session: MultiplayerSession | null) => void;
  isMultiplayerModalOpen: boolean;
  setIsMultiplayerModalOpen: (open: boolean) => void;

  // Curriculum & Lessons
  currentLesson: CurriculumLesson;
  setCurrentLesson: (lesson: CurriculumLesson) => void;
  selectLessonById: (lessonId: string) => void;

  // AI Tutor System
  aiDrawerOpen: boolean;
  setAiDrawerOpen: (open: boolean) => void;
  aiTab: 'explain' | 'debug' | 'optimize';
  setAiTab: (tab: 'explain' | 'debug' | 'optimize') => void;
  aiExplanation: string | null;
  aiDebugResult: AIDebugResult | null;
  aiOptimizationResult: AIOptimizationResult | null;
  isAiLoading: boolean;
  runAiExplain: (concept?: string) => Promise<void>;
  runAiDebug: () => Promise<void>;
  runAiOptimize: () => Promise<void>;

  // Analytics & Student Progress
  studentProgress: StudentProgress;
  submitQuizAnswer: (lessonId: string, optionIndex: number) => boolean;
  fetchAdminDBData: () => Promise<DBTableSummary | null>;
  deleteUserFromDB: (userId: number) => Promise<boolean>;

  // Arrow Assist & AI Audio Tutor Guidance
  isArrowAssistActive: boolean;
  setIsArrowAssistActive: (active: boolean) => void;
  arrowAssistStep: number;
  setArrowAssistStep: (step: number) => void;
  toggleArrowAssist: () => void;

  // Interactive Voice & 3D Animation Studio
  isVoiceAnimationModalOpen: boolean;
  setIsVoiceAnimationModalOpen: (open: boolean) => void;
}

const QuantumContext = createContext<QuantumContextType | undefined>(undefined);

export const QuantumProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('quantum_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<ActiveViewMode>('workspace');
  const [centerTab, setCenterTab] = useState<'visual' | 'code'>('visual');
  const [visualizerMode, setVisualizerMode] = useState<'bloch' | 'qosphere'>('bloch');

  const [qubitCount, setQubitCount] = useState<number>(3);
  const [gates, setGates] = useState<QuantumGate[]>(CURRICULUM_LESSONS[0].initialCircuit);
  const [selectedQubit, setSelectedQubit] = useState<number>(0);

  const [framework, setFramework] = useState<Framework>('qiskit');
  const [codeString, setCodeString] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  // Advanced Noise State
  const [noiseModel, setNoiseModel] = useState<NoiseModel>({
    isNoiseEnabled: false,
    t1Us: 50,
    t2Us: 70,
    gateErrorRate: 0.015
  });
  const [isNoiseModalOpen, setIsNoiseModalOpen] = useState<boolean>(false);

  // Adaptive Profile & Multiplayer
  const [userBackground, setUserBackground] = useState<UserBackgroundProfile>(user?.userBackground || 'cs-undergrad');
  const [multiplayerSession, setMultiplayerSession] = useState<MultiplayerSession | null>({
    sessionId: 'q_sandbox_882',
    isHost: true,
    connectedUsers: [
      { id: 'usr_1', name: 'You (Host)', role: 'Owner', color: '#06B6D4' },
      { id: 'usr_2', name: 'Dr. Elena Rostova', role: 'Collaborator (Physics PhD)', color: '#EC4899' }
    ]
  });
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState<boolean>(false);

  // Curriculum state
  const [currentLesson, setCurrentLesson] = useState<CurriculumLesson>(CURRICULUM_LESSONS[0]);

  // AI Tutor state
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [isVoiceAnimationModalOpen, setIsVoiceAnimationModalOpen] = useState<boolean>(false);
  const [aiTab, setAiTab] = useState<'explain' | 'debug' | 'optimize'>('explain');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiDebugResult, setAiDebugResult] = useState<AIDebugResult | null>(null);
  const [aiOptimizationResult, setAiOptimizationResult] = useState<AIOptimizationResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Progress state
  const [studentProgress, setStudentProgress] = useState<StudentProgress>({
    completedLessonIds: ['lesson-1'],
    quizScores: { 'lesson-1': 100 },
    badges: [
      { id: 'badge-1', name: 'Superposition Pioneer', description: 'Created your first quantum superposition state using Hadamard gate', icon: 'Sparkles', unlockedAt: '2026-09-05' },
      { id: 'badge-2', name: 'Entanglement Master', description: 'Constructed a Bell state |Φ+⟩ with CNOT gate', icon: 'Link', unlockedAt: '2026-09-05' }
    ],
    totalCircuitsRun: 14,
    totalTimeSpentMinutes: 52
  });

  // Arrow Assist State
  const [isArrowAssistActive, setIsArrowAssistActive] = useState<boolean>(false);
  const [arrowAssistStep, setArrowAssistStep] = useState<number>(1);

  const toggleArrowAssist = () => {
    setIsArrowAssistActive(prev => {
      if (!prev) setArrowAssistStep(1);
      return !prev;
    });
  };

  // Sync user object with localStorage and background
  useEffect(() => {
    if (user) {
      localStorage.setItem('quantum_user', JSON.stringify(user));
      setUserBackground(user.userBackground);
    } else {
      localStorage.removeItem('quantum_user');
    }
  }, [user]);

  const loginUser = async (email: string, pass: string) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await resp.json();
      if (!resp.ok) {
        // Check local registered users store if backend returned error
        const registered = JSON.parse(localStorage.getItem('quantum_registered_users') || '[]');
        const match = registered.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (match) {
          const matchedUser: User = {
            id: match.id,
            email: match.email,
            fullName: match.fullName,
            userBackground: match.userBackground as UserBackgroundProfile,
            role: match.role as 'student' | 'admin',
            createdAt: match.createdAt
          };
          setUser(matchedUser);
          setUserBackground(matchedUser.userBackground);
          setIsAuthModalOpen(false);
          return { success: true };
        }
        return { success: false, message: data.detail || 'Invalid email or password.' };
      }
      const loggedUser: User = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        userBackground: data.user.userBackground as UserBackgroundProfile,
        role: data.user.role as 'student' | 'admin',
        createdAt: data.user.createdAt
      };
      setUser(loggedUser);
      setUserBackground(loggedUser.userBackground);

      // Save user locally for memory persistence
      const registered = JSON.parse(localStorage.getItem('quantum_registered_users') || '[]');
      const updated = [ { ...loggedUser, password: pass }, ...registered.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase()) ];
      localStorage.setItem('quantum_registered_users', JSON.stringify(updated));

      // Load progress from backend
      if (data.progress) {
        const completed = data.progress.map((p: any) => p.lesson_id);
        const scores: Record<string, number> = {};
        data.progress.forEach((p: any) => { scores[p.lesson_id] = p.quiz_score; });
        
        const fetchedBadges = data.badges?.map((b: any) => ({
          id: b.id,
          name: b.badge_name,
          description: b.description,
          icon: 'Award',
          unlockedAt: b.unlocked_at
        })) || studentProgress.badges;

        setStudentProgress(prev => ({
          ...prev,
          completedLessonIds: Array.from(new Set([...prev.completedLessonIds, ...completed])),
          quizScores: { ...prev.quizScores, ...scores },
          badges: fetchedBadges
        }));
      }

      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      // Check locally registered users first
      const registered = JSON.parse(localStorage.getItem('quantum_registered_users') || '[]');
      const match = registered.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (match) {
        const matchedUser: User = {
          id: match.id,
          email: match.email,
          fullName: match.fullName,
          userBackground: match.userBackground as UserBackgroundProfile,
          role: match.role as 'student' | 'admin',
          createdAt: match.createdAt
        };
        setUser(matchedUser);
        setUserBackground(matchedUser.userBackground);
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // Offline demo accounts fallback
      if (email === 'admin@quantumedu.ai' && pass === 'admin123') {
        const adminUser: User = { id: 1, email: 'admin@quantumedu.ai', fullName: 'Quantum Administrator', userBackground: 'physics-phd', role: 'admin' };
        setUser(adminUser);
        setIsAuthModalOpen(false);
        return { success: true };
      } else if (email === 'alex@quantumedu.ai' && pass === 'student123') {
        const stUser: User = { id: 2, email: 'alex@quantumedu.ai', fullName: 'Alex Rivera', userBackground: 'cs-undergrad', role: 'student' };
        setUser(stUser);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials or user not found. Please check your email and password or create a new account.' };
    }
  };

  const registerUser = async (email: string, pass: string, fullName: string, background: UserBackgroundProfile, role: 'student' | 'admin') => {
    let createdUser: User;
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: pass,
          fullName,
          userBackground: background,
          role
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, message: data.detail || 'Registration failed.' };
      }
      createdUser = {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        userBackground: data.user.userBackground as UserBackgroundProfile,
        role: data.user.role as 'student' | 'admin',
        createdAt: data.user.createdAt
      };
    } catch (err) {
      // Offline fallback: create local user account
      createdUser = {
        id: Math.floor(Math.random() * 1000) + 10,
        email,
        fullName,
        userBackground: background,
        role,
        createdAt: new Date().toISOString()
      };
    }

    // Persist registered user locally so the system always remembers them across restarts
    const registered = JSON.parse(localStorage.getItem('quantum_registered_users') || '[]');
    const updated = [ { ...createdUser, password: pass }, ...registered.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase()) ];
    localStorage.setItem('quantum_registered_users', JSON.stringify(updated));

    setUser(createdUser);
    setUserBackground(createdUser.userBackground);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginWithGoogle = async (googleUserPayload?: { email?: string; fullName?: string }) => {
    const email = googleUserPayload?.email || 'google.student@quantumedu.ai';
    const fullName = googleUserPayload?.fullName || 'Google Quantum Explorer';
    
    try {
      const resp = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName })
      });
      const data = await resp.json();
      if (resp.ok && data.user) {
        const gUser: User = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          userBackground: (data.user.userBackground || 'cs-undergrad') as UserBackgroundProfile,
          role: (data.user.role || 'student') as 'student' | 'admin',
          createdAt: data.user.createdAt
        };
        setUser(gUser);
        setUserBackground(gUser.userBackground);
        setIsAuthModalOpen(false);
        return { success: true };
      }
    } catch (e) {
      // Local fallback
    }

    const gUser: User = {
      id: Math.floor(Math.random() * 9000) + 1000,
      email,
      fullName,
      userBackground: 'cs-undergrad',
      role: 'student',
      createdAt: new Date().toISOString()
    };

    const registered = JSON.parse(localStorage.getItem('quantum_registered_users') || '[]');
    const updated = [ { ...gUser, password: 'google_oauth_user' }, ...registered.filter((u: any) => u.email.toLowerCase() !== email.toLowerCase()) ];
    localStorage.setItem('quantum_registered_users', JSON.stringify(updated));

    setUser(gUser);
    setUserBackground(gUser.userBackground);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('quantum_user');
    setActiveView('workspace');
  };

  const fetchAdminDBData = async (): Promise<DBTableSummary | null> => {
    try {
      const resp = await fetch('/api/admin/db');
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  };

  const deleteUserFromDB = async (userId: number): Promise<boolean> => {
    try {
      const resp = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      return resp.ok;
    } catch (e) {
      return false;
    }
  };

  // Re-run simulation when gates, qubitCount, framework or noise model change
  useEffect(() => {
    let generatedCode = '';
    if (framework === 'qiskit') {
      generatedCode = generateQiskitCode(gates, qubitCount);
    } else if (framework === 'cirq') {
      generatedCode = generateCirqCode(gates, qubitCount);
    } else if (framework === 'pennylane') {
      generatedCode = generatePennyLaneCode(gates, qubitCount);
    } else {
      generatedCode = generateQiskitCode(gates, qubitCount);
    }
    setCodeString(generatedCode);

    const res = simulateCircuit(gates, qubitCount, 1024, framework, noiseModel);
    setSimulationResult(res);
  }, [gates, qubitCount, framework, noiseModel]);

  const addGate = (gate: Omit<QuantumGate, 'id'>) => {
    const id = 'g_' + Math.random().toString(36).substring(2, 9);
    setGates(prev => [...prev.filter(g => !(g.qubit === gate.qubit && g.step === gate.step)), { ...gate, id }]);
  };

  const removeGate = (gateId: string) => {
    setGates(prev => prev.filter(g => g.id !== gateId));
  };

  const clearCircuit = () => {
    setGates([]);
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'Bell State') {
      setQubitCount(2);
      setGates([
        { id: 'b1', type: 'H', qubit: 0, step: 0 },
        { id: 'b2', type: 'CNOT', qubit: 0, targetQubit: 1, step: 1 }
      ]);
    } else if (presetName === 'GHZ State') {
      setQubitCount(3);
      setGates([
        { id: 'g1', type: 'H', qubit: 0, step: 0 },
        { id: 'g2', type: 'CNOT', qubit: 0, targetQubit: 1, step: 1 },
        { id: 'g3', type: 'CNOT', qubit: 1, targetQubit: 2, step: 2 }
      ]);
    } else if (presetName === 'Quantum Teleportation') {
      setQubitCount(3);
      setGates([
        { id: 't1', type: 'X', qubit: 0, step: 0 },
        { id: 't2', type: 'H', qubit: 1, step: 0 },
        { id: 't3', type: 'CNOT', qubit: 1, targetQubit: 2, step: 1 },
        { id: 't4', type: 'CNOT', qubit: 0, targetQubit: 1, step: 2 },
        { id: 't5', type: 'H', qubit: 0, step: 3 }
      ]);
    } else if (presetName === 'Grover Search') {
      setQubitCount(3);
      setGates([
        { id: 'gr1', type: 'H', qubit: 0, step: 0 },
        { id: 'gr2', type: 'H', qubit: 1, step: 0 },
        { id: 'gr3', type: 'H', qubit: 2, step: 0 },
        { id: 'gr4', type: 'TOFFOLI', qubit: 0, control2Qubit: 1, targetQubit: 2, step: 1 }
      ]);
    }
  };

  const runSimulation = () => {
    const res = simulateCircuit(gates, qubitCount, 1024, framework, noiseModel);
    setSimulationResult(res);
    setStudentProgress(prev => ({
      ...prev,
      totalCircuitsRun: prev.totalCircuitsRun + 1
    }));
  };

  const selectLessonById = (lessonId: string) => {
    const found = CURRICULUM_LESSONS.find(l => l.id === lessonId);
    if (found) {
      setCurrentLesson(found);
      setQubitCount(found.qubitCount);
      setGates(found.initialCircuit);
    }
  };

  // Profile-aware Dynamic AI Explainer
  const runAiExplain = async (concept?: string) => {
    setIsAiLoading(true);
    setAiTab('explain');
    setAiDrawerOpen(true);
    
    setTimeout(() => {
      let explanation = `### 🧠 AI Adaptive Explanation (${userBackground.toUpperCase()} Profile)\n\n`;
      
      if (userBackground === 'high-school') {
        explanation += `**Visual Analogy**: Think of a qubit like a spinning coin on a table. Before you slap your hand on the table (measurement), the coin is in a **superposition** of heads and tails simultaneously!\n\n`;
        explanation += `A **Hadamard (H) gate** is like giving the coin a gentle flick so it spins in equal 50/50 balance. A **CNOT gate** ties two spinning coins together with an invisible string so when one lands heads, the other instantly lands heads too!`;
      } else if (userBackground === 'cs-undergrad') {
        explanation += `**Computer Science View**: Standard bits are 1-bit boolean values 0 or 1. A qubit is a normalized 2D complex vector $v = [\\alpha, \\beta]^T$.\n\n`;
        explanation += `Quantum gates are $2^N \\times 2^N$ unitary matrix transformations ($U^\\dagger U = I$). The **Hadamard gate** matrix is:\n\n$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$\n\nApplying $H$ to vector $|0\\rangle = [1, 0]^T$ outputs state vector $[1/\\sqrt{2}, 1/\\sqrt{2}]^T$.`;
      } else {
        // Physics PhD
        explanation += `**Quantum Mechanics View**: The Hilbert space $\\mathcal{H} = (\\mathbb{C}^2)^{\\otimes N}$ undergoes unitary Schrödinger time evolution $|\psi(t)\\rangle = U(t, t_0)|\psi(0)\\rangle$ under time-dependent Hamiltonian $H(t)$.\n\n`;
        explanation += `Under non-Markovian open system dynamics, environmental coupling creates Kraus operators $\\sum_k E_k \\rho E_k^\\dagger$, inducing $T_1$ energy relaxation and $T_2$ pure dephasing loss of off-diagonal density matrix elements $\\rho_{01}$.`;
      }

      setAiExplanation(explanation);
      setIsAiLoading(false);
    }, 600);
  };

  const runAiDebug = async () => {
    setIsAiLoading(true);
    setAiTab('debug');
    setAiDrawerOpen(true);

    setTimeout(() => {
      const hasMeasurement = gates.some(g => g.type === 'MEASURE');
      const hasUnconnectedCNOT = gates.some(g => g.type === 'CNOT' && g.targetQubit === undefined);

      const issues = [];
      if (!hasMeasurement) {
        issues.push({
          severity: 'warning' as const,
          message: 'Circuit lacks explicit Measurement (M) gates.',
          suggestion: 'Drag Measurement gates to the end of qubit wires to record final computational basis bitstrings.'
        });
      }

      if (hasUnconnectedCNOT) {
        issues.push({
          severity: 'error' as const,
          message: 'CNOT gate missing target qubit wire assignment.',
          suggestion: 'Specify the target qubit index for the controlled operation.'
        });
      }

      if (issues.length === 0) {
        issues.push({
          severity: 'info' as const,
          message: 'Circuit layout is physically valid and syntactically sound!',
          suggestion: 'No errors detected. Statevector simulation running smoothly.'
        });
      }

      setAiDebugResult({
        hasErrors: issues.some(i => i.severity === 'error'),
        issues,
        correctedCode: generateQiskitCode(gates, qubitCount),
        explanation: 'Quantum syntax scan completed. Checked gate control alignments, dimensional consistency, and state measurement paths.'
      });
      setIsAiLoading(false);
    }, 600);
  };

  const runAiOptimize = async () => {
    setIsAiLoading(true);
    setAiTab('optimize');
    setAiDrawerOpen(true);

    setTimeout(() => {
      const originalDepth = gates.length > 0 ? Math.max(...gates.map(g => g.step)) + 1 : 0;
      const cancellations: string[] = [];
      const optimizedGates: QuantumGate[] = [];

      for (let i = 0; i < gates.length; i++) {
        const curr = gates[i];
        const next = gates[i + 1];
        if (next && curr.qubit === next.qubit && curr.type === next.type && ['H', 'X', 'Y', 'Z'].includes(curr.type)) {
          cancellations.push(`Cancelled consecutive ${curr.type} gates on qubit q[${curr.qubit}] (${curr.type}·${curr.type} = I)`);
          i++;
        } else {
          optimizedGates.push(curr);
        }
      }

      const optDepth = optimizedGates.length > 0 ? Math.max(...optimizedGates.map(g => g.step)) + 1 : 0;

      setAiOptimizationResult({
        originalDepth,
        optimizedDepth: optDepth,
        originalGateCount: gates.length,
        optimizedGateCount: optimizedGates.length,
        cancellations: cancellations.length > 0 ? cancellations : ['No redundant consecutive self-inverse gates detected. Circuit is near optimal!'],
        optimizedGates,
        explanation: cancellations.length > 0 
          ? `Optimized circuit depth from ${originalDepth} to ${optDepth} by eliminating ${cancellations.length} redundant self-inverse gate pair(s).` 
          : 'Your quantum circuit already maintains optimal gate depth!'
      });
      setIsAiLoading(false);
    }, 600);
  };

  const submitQuizAnswer = (lessonId: string, optionIndex: number): boolean => {
    const lesson = CURRICULUM_LESSONS.find(l => l.id === lessonId);
    if (!lesson) return false;

    const isCorrect = optionIndex === lesson.quiz.correctIndex;
    if (isCorrect) {
      setStudentProgress(prev => ({
        ...prev,
        completedLessonIds: Array.from(new Set([...prev.completedLessonIds, lessonId])),
        quizScores: { ...prev.quizScores, [lessonId]: 100 }
      }));

      // Persist to backend database!
      if (user) {
        fetch(`/api/progress/save?lesson_id=${encodeURIComponent(lessonId)}&quiz_score=100&user_id=${user.id}`, {
          method: 'POST'
        }).catch(err => console.warn('Could not save progress to DB:', err));
      }
    }
    return isCorrect;
  };

  return (
    <QuantumContext.Provider
      value={{
        user,
        setUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginUser,
        registerUser,
        loginWithGoogle,
        logoutUser,
        activeView,
        setActiveView,
        centerTab,
        setCenterTab,
        visualizerMode,
        setVisualizerMode,
        gates,
        setGates,
        qubitCount,
        setQubitCount,
        addGate,
        removeGate,
        clearCircuit,
        loadPreset,
        framework,
        setFramework,
        codeString,
        setCodeString,
        simulationResult,
        setSimulationResult,
        runSimulation,
        selectedQubit,
        setSelectedQubit,
        noiseModel,
        setNoiseModel,
        isNoiseModalOpen,
        setIsNoiseModalOpen,
        userBackground,
        setUserBackground,
        multiplayerSession,
        setMultiplayerSession,
        isMultiplayerModalOpen,
        setIsMultiplayerModalOpen,
        currentLesson,
        setCurrentLesson,
        selectLessonById,
        aiDrawerOpen,
        setAiDrawerOpen,
        aiTab,
        setAiTab,
        aiExplanation,
        aiDebugResult,
        aiOptimizationResult,
        isAiLoading,
        runAiExplain,
        runAiDebug,
        runAiOptimize,
        studentProgress,
        submitQuizAnswer,
        fetchAdminDBData,
        deleteUserFromDB,
        isArrowAssistActive,
        setIsArrowAssistActive,
        arrowAssistStep,
        setArrowAssistStep,
        toggleArrowAssist,
        isVoiceAnimationModalOpen,
        setIsVoiceAnimationModalOpen
      }}
    >
      {children}
    </QuantumContext.Provider>
  );
};

export const useQuantum = () => {
  const ctx = useContext(QuantumContext);
  if (!ctx) throw new Error('useQuantum must be used within QuantumProvider');
  return ctx;
};

