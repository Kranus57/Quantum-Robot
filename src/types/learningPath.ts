import { UserBackgroundProfile } from './quantum';

export type LearningGoal = 
  | 'foundations'         // Quantum Computing Basics & Superposition
  | 'quantum-algorithms'   // Advanced Quantum Search, Fourier Transforms & Teleportation
  | 'quantum-ml'           // Variational Quantum Eigensolver & Quantum Neural Networks
  | 'hardware-noise';      // Decoherence, T1/T2 Relaxation & NISQ Optimization

export type PaceSetting = 'casual' | 'standard' | 'intensive'; // 15m, 30m, 60m per day

export type SkillCategory = 'superposition' | 'entanglement' | 'algorithms' | 'qml_vqe';

export type NodeStatus = 'mastered' | 'in_progress' | 'recommended_next' | 'unlocked' | 'locked';

export interface AdaptiveExplanation {
  intuitive: string;   // High School level analogies
  csLogic: string;     // CS Undergrad matrix gate logic & Big-O complexity
  physicsMath: string; // Physics PhD Hilbert space & Dirac notation
}

export interface PersonalizedPathNode {
  id: string;
  lessonId: string;
  sequenceOrder: number;
  title: string;
  category: SkillCategory;
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  prerequisiteNodeIds: string[];
  status: NodeStatus;
  recommendedReason: string;
  targetState: string;
  adaptiveExplanations: AdaptiveExplanation;
}

export interface SkillMasteryDomain {
  category: SkillCategory;
  title: string;
  score: number; // 0 to 100%
  completedCount: number;
  totalCount: number;
  iconName: string;
  description: string;
}

export interface PersonalizedPathSummary {
  goal: LearningGoal;
  pace: PaceSetting;
  targetMinutesPerDay: number;
  estimatedDaysToComplete: number;
  totalModules: number;
  completedModules: number;
  overallProgressPct: number;
  skills: SkillMasteryDomain[];
  recommendedNode: PersonalizedPathNode | null;
  nodes: PersonalizedPathNode[];
}
