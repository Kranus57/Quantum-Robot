import { CURRICULUM_LESSONS } from '../data/curriculumData';
import { UserBackgroundProfile } from '../types/quantum';
import { 
  LearningGoal, 
  PaceSetting, 
  PersonalizedPathNode, 
  PersonalizedPathSummary, 
  SkillMasteryDomain,
  NodeStatus,
  AdaptiveExplanation
} from '../types/learningPath';

// Comprehensive profile-adaptive explanation database
const ADAPTIVE_EXPLANATION_MAP: Record<string, AdaptiveExplanation> = {
  'lesson-1': {
    intuitive: `Think of a qubit like a coin spinning on a tabletop. While spinning, it's not strictly heads (0) or tails (1), but both at once! The Hadamard gate gives the coin its spin.`,
    csLogic: `A qubit is represented as a normalized 2D state vector α|0⟩ + β|1⟩ where |α|² + |β|² = 1. The Hadamard gate is a 2x2 unitary matrix H = 1/√2 [[1, 1], [1, -1]] mapping computational basis states to equal superposition.`,
    physicsMath: `The state space is a 2D complex Hilbert space H ≅ ℂ². Applying the Hadamard operator transforms Pauli Z basis eigenkets {|0⟩, |1⟩} into Pauli X basis eigenkets {|+⟩, |-⟩} under unitary evolution U = (X + Z)/√2.`
  },
  'lesson-2': {
    intuitive: `Entanglement is like having two magical dice in separate cities. Rolling die A automatically forces die B to show the exact same number instantly!`,
    csLogic: `Combining H on qubit 0 with a CNOT gate produces the maximally entangled Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2. The joint 4D state vector cannot be factorized into individual qubit state vectors (tensor product decomposition fails).`,
    physicsMath: `Entanglement exhibits non-local quantum correlations violating Bell's Inequalities (CHSH inequality S ≤ 2). The composite system density operator ρ = |Φ+⟩⟨Φ+| yields partial trace ρ_A = Tr_B(ρ) = I/2, representing maximal von Neumann entropy S(ρ_A) = 1 bit.`
  },
  'lesson-3': {
    intuitive: `Quantum Teleportation doesn't move physical matter—it transfers the exact quantum state of a qubit across space using a shared entangled link and 2 phone calls!`,
    csLogic: `The protocol transmits an arbitrary unknown state |ψ⟩ = α|0⟩ + β|1⟩ via an entangled Bell pair. Alice measures in the Bell basis, transmitting 2 classical bits. Bob applies conditional Pauli Pauli-X and Pauli-Z gates to reconstruct |ψ⟩ with O(1) circuit depth.`,
    physicsMath: `The 3-qubit state space H_A1 ⊗ H_A2 ⊗ H_B undergoes projective measurement in Alice's Bell subsystem. Under unitary recovery operators U_B ∈ {I, X, Z, XZ}, Bob recovers the exact state ket |ψ⟩ preserving the No-Cloning Theorem.`
  },
  'lesson-4': {
    intuitive: `Imagine searching for a needle in a haystack. Grover's algorithm continuously magnifies the needle's shine until it stands out brightly above all the straw!`,
    csLogic: `Grover's algorithm searches an unsorted database of N = 2ⁿ elements in O(√N) queries vs classical O(N). It alternates Phase Inversion Oracle U_ω with Amplitude Amplification Diffuser U_s = 2|s⟩⟨s| - I.`,
    physicsMath: `The state vector undergoes SU(2) rotations in a 2D subspace spanned by the target state |ω⟩ and uniform superposition |s'⟩. Each Grover iteration rotates the state ket by geometric angle θ = 2 arcsin(1/√N) toward the target manifold.`
  },
  'lesson-5': {
    intuitive: `The Quantum Fourier Transform decomposes complex quantum patterns into single pure notes, just like a musical ear picks out individual instruments in a symphony!`,
    csLogic: `QFT transforms input amplitudes into phase frequencies in O(n²) gate operations, achieving an exponential speedup over classical Fast Fourier Transform O(n 2ⁿ). Key building block for Shor's factoring algorithm and QPE.`,
    physicsMath: `QFT acts as unitary operator F_N |x⟩ = 1/√N ∑_y e^(2πi xy / N) |y⟩. The circuit implementation utilizes Hadamard gates and controlled phase shift rotations R_k = diag(1, e^(2πi / 2^k)) across target registers.`
  },
  'lesson-6': {
    intuitive: `VQE acts like an intelligent compass that guides a quantum computer down a mountain peak to find the lowest valley (ground state energy of a molecule).`,
    csLogic: `VQE is a NISQ hybrid quantum-classical algorithm. A parameterized quantum circuit (ansatz) prepares |ψ(θ)⟩, quantum hardware measures ⟨H⟩, and classical optimization (SPSA/COBYLA) iteratively tunes parameters θ.`,
    physicsMath: `Based on the Rayleigh-Ritz Variational Principle, E(θ) = ⟨ψ(θ)| H_mol |ψ(θ)⟩ ≥ E_0. Hamiltonian decomposition into Pauli strings H = ∑ c_i P_i allows expectation value evaluation under noisy NISQ density operators.`
  }
};

// Priority ordering maps for different learning goals
const GOAL_SEQUENCE_PRIORITIES: Record<LearningGoal, string[]> = {
  'foundations': ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6'],
  'quantum-algorithms': ['lesson-1', 'lesson-2', 'lesson-4', 'lesson-5', 'lesson-3', 'lesson-6'],
  'quantum-ml': ['lesson-1', 'lesson-2', 'lesson-6', 'lesson-4', 'lesson-5', 'lesson-3'],
  'hardware-noise': ['lesson-1', 'lesson-2', 'lesson-6', 'lesson-3', 'lesson-4', 'lesson-5']
};

export const getAdaptiveExplanation = (
  lessonId: string, 
  background: UserBackgroundProfile
): string => {
  const map = ADAPTIVE_EXPLANATION_MAP[lessonId];
  if (!map) return 'Adaptive explanation currently loading...';

  if (background === 'high-school') return map.intuitive;
  if (background === 'physics-phd') return map.physicsMath;
  return map.csLogic;
};

export const calculateSkillMastery = (
  completedLessonIds: string[], 
  quizScores: Record<string, number>
): SkillMasteryDomain[] => {
  const isDone = (id: string) => completedLessonIds.includes(id);

  const getScore = (ids: string[]) => {
    const completed = ids.filter(isDone);
    if (completed.length === 0) return 0;
    const sum = completed.reduce((acc, id) => acc + (quizScores[id] || 100), 0);
    return Math.round(sum / ids.length);
  };

  return [
    {
      category: 'superposition',
      title: 'Superposition & Qubit Geometry',
      score: getScore(['lesson-1']),
      completedCount: isDone('lesson-1') ? 1 : 0,
      totalCount: 1,
      iconName: 'Globe',
      description: 'Single qubit states, Bloch sphere vectors & Hadamard phase transformations.'
    },
    {
      category: 'entanglement',
      title: 'Entanglement & Bell States',
      score: getScore(['lesson-2', 'lesson-3']),
      completedCount: ['lesson-2', 'lesson-3'].filter(isDone).length,
      totalCount: 2,
      iconName: 'Network',
      description: 'Multi-qubit non-local correlations, CNOT logic & Quantum Teleportation.'
    },
    {
      category: 'algorithms',
      title: 'Quantum Algorithms & QFT',
      score: getScore(['lesson-4', 'lesson-5']),
      completedCount: ['lesson-4', 'lesson-5'].filter(isDone).length,
      totalCount: 2,
      iconName: 'Cpu',
      description: 'Grover amplitude amplification, quadratic speedups & Quantum Fourier Transform.'
    },
    {
      category: 'qml_vqe',
      title: 'Quantum ML & NISQ Optimization',
      score: getScore(['lesson-6']),
      completedCount: isDone('lesson-6') ? 1 : 0,
      totalCount: 1,
      iconName: 'Sparkles',
      description: 'Variational Quantum Eigensolver (VQE), Hamiltonian expectations & NISQ algorithms.'
    }
  ];
};

export const generatePersonalizedPath = (
  userBackground: UserBackgroundProfile,
  goal: LearningGoal,
  pace: PaceSetting,
  completedLessonIds: string[]
): PersonalizedPathSummary => {
  const sequence = GOAL_SEQUENCE_PRIORITIES[goal] || GOAL_SEQUENCE_PRIORITIES.foundations;
  
  let recommendedNodeFound = false;
  let recommendedNode: PersonalizedPathNode | null = null;

  const nodes: PersonalizedPathNode[] = sequence.map((lessonId, idx) => {
    const rawLesson = CURRICULUM_LESSONS.find(l => l.id === lessonId) || CURRICULUM_LESSONS[0];
    const isCompleted = completedLessonIds.includes(lessonId);

    // Determine prerequisites
    const prereqIds = idx > 0 ? [sequence[idx - 1]] : [];
    const prereqsCompleted = prereqIds.every(id => completedLessonIds.includes(id));

    let status: NodeStatus = 'locked';

    if (isCompleted) {
      status = 'mastered';
    } else if (!recommendedNodeFound && (idx === 0 || prereqsCompleted)) {
      status = 'recommended_next';
      recommendedNodeFound = true;
    } else if (prereqsCompleted) {
      status = 'unlocked';
    } else {
      status = 'locked';
    }

    let category: 'superposition' | 'entanglement' | 'algorithms' | 'qml_vqe' = 'algorithms';
    if (rawLesson.category === 'Fundamentals') category = 'superposition';
    else if (rawLesson.category === 'Entanglement') category = 'entanglement';
    else if (rawLesson.category === 'Quantum ML') category = 'qml_vqe';

    let reason = `Recommended based on your ${goal.replace('-', ' ').toUpperCase()} goal track.`;
    if (goal === 'quantum-ml' && lessonId === 'lesson-6') {
      reason = 'Top Priority: Essential for understanding hybrid quantum-classical algorithms like VQE.';
    } else if (goal === 'quantum-algorithms' && lessonId === 'lesson-4') {
      reason = 'Core Focus: Key speedup algorithm featuring Oracle phase inversion & diffuser.';
    }

    const nodeObj: PersonalizedPathNode = {
      id: `node-${lessonId}`,
      lessonId,
      sequenceOrder: idx + 1,
      title: rawLesson.title,
      category,
      categoryLabel: rawLesson.category,
      difficulty: rawLesson.difficulty,
      estimatedMinutes: rawLesson.difficulty === 'Beginner' ? 15 : rawLesson.difficulty === 'Intermediate' ? 25 : 35,
      prerequisiteNodeIds: prereqIds,
      status,
      recommendedReason: reason,
      targetState: rawLesson.challengeTargetState || '|0...0>',
      adaptiveExplanations: ADAPTIVE_EXPLANATION_MAP[lessonId] || {
        intuitive: rawLesson.description,
        csLogic: rawLesson.description,
        physicsMath: rawLesson.description
      }
    };

    if (status === 'recommended_next') {
      recommendedNode = nodeObj;
    }

    return nodeObj;
  });

  if (!recommendedNode && nodes.length > 0) {
    recommendedNode = nodes.find(n => n.status !== 'mastered') || nodes[nodes.length - 1];
  }

  const completedCount = nodes.filter(n => n.status === 'mastered').length;
  const overallProgressPct = Math.round((completedCount / nodes.length) * 100);

  const minutesPerDay = pace === 'casual' ? 15 : pace === 'intensive' ? 60 : 30;
  const remainingMinutes = nodes
    .filter(n => n.status !== 'mastered')
    .reduce((acc, n) => acc + n.estimatedMinutes, 0);

  const estimatedDaysToComplete = Math.max(1, Math.ceil(remainingMinutes / minutesPerDay));
  const skills = calculateSkillMastery(completedLessonIds, {});

  return {
    goal,
    pace,
    targetMinutesPerDay: minutesPerDay,
    estimatedDaysToComplete,
    totalModules: nodes.length,
    completedModules: completedCount,
    overallProgressPct,
    skills,
    recommendedNode,
    nodes
  };
};
