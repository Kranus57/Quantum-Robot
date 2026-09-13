export interface AIAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarBg: string;
  avatarColor: string;
  greeting: string;
}

export interface TheoryTopic {
  id: string;
  title: string;
  subtitle: string;
  category: 'Fundamentals' | 'Bra-Ket Algebra' | 'Operators' | 'Entanglement' | 'Open Systems';
  summary: string;
  diracForm: string;
  matrixForm: string;
  proofSteps: string[];
  initialTheta: number; // in degrees [0, 180]
  initialPhi: number;   // in degrees [0, 360]
  presetEquations: string[];
}

export const AI_TEACHING_AGENTS: AIAgent[] = [
  {
    id: 'training_agent',
    name: 'Training Agent',
    role: 'Stark Sensei',
    specialty: 'Dirac bra-ket algebra, physical intuition, mathematical proofs & circuit dynamics',
    avatarBg: 'bg-blue-600',
    avatarColor: 'text-blue-400',
    greeting: 'Hello! I am Stark Sensei. Ask me any question about quantum mechanics, linear algebra, circuit design, or algorithms, and I will generate a complete answer for you!'
  }
];

export const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: 'topic-1',
    title: '1. Qubit State Vectors & Complex Amplitudes',
    subtitle: 'Representation of 2-level quantum state vectors in Hilbert space ℂ²',
    category: 'Fundamentals',
    summary: 'A pure single-qubit state ket |ψ⟩ is represented as a linear combination of computational basis kets |0⟩ and |1⟩ parameterized by complex amplitudes α and β.',
    diracForm: '|ψ⟩ = α|0⟩ + β|1⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩',
    matrixForm: '|ψ⟩ = [ α ] = [ cos(θ/2)         ]\n      [ β ]   [ e^(iφ) sin(θ/2) ]',
    proofSteps: [
      '1. Normalization Condition: ⟨ψ|ψ⟩ = |α|² + |β|² = 1',
      '2. Born Rule Probability: P(0) = |α|² = cos²(θ/2), P(1) = |β|² = sin²(θ/2)',
      '3. Global Phase Equivalence: e^(iγ) |ψ⟩ ≡ |ψ⟩ (physically indistinguishable)',
      '4. Parameter Mapping: θ ∈ [0, π] sets polar angle, φ ∈ [0, 2π) sets relative phase'
    ],
    initialTheta: 90,
    initialPhi: 0,
    presetEquations: [
      '|0⟩ = [1, 0]^T  (Z-basis Ground State)',
      '|1⟩ = [0, 1]^T  (Z-basis Excited State)',
      '|+⟩ = (|0⟩ + |1⟩)/√2  (Equal Superposition, X-basis)',
      '|-⟩ = (|0⟩ - |1⟩)/√2  (Anti-phase Superposition)'
    ]
  },
  {
    id: 'topic-2',
    title: '2. Dirac Bra-Ket Algebra & Inner Products',
    subtitle: 'Dual vector space ℂ²* dual pairs, bra ⟨ψ|, ket |ϕ⟩ & overlap ⟨ψ|ϕ⟩',
    category: 'Bra-Ket Algebra',
    summary: 'For every ket vector |ψ⟩ in Hilbert space H, there exists a conjugate transpose bra vector ⟨ψ| in dual space H*. The inner product ⟨ψ|ϕ⟩ defines probability amplitudes.',
    diracForm: '⟨ψ| = α* ⟨0| + β* ⟨1|   ==>   Inner Product ⟨ψ|ϕ⟩ = α* a + β* b',
    matrixForm: '⟨ψ| = [ α*,  β* ]   ==>   ⟨ψ|ϕ⟩ = [ α*, β* ] [ a ] = α* a + β* b\n                                             [ b ]',
    proofSteps: [
      '1. Conjugate Transpose: Bra ⟨ψ| = (|ψ⟩)^† = [α*, β*]',
      '2. Orthonormal Basis: ⟨0|0⟩ = 1, ⟨1|1⟩ = 1, ⟨0|1⟩ = 0, ⟨1|0⟩ = 0',
      '3. State Transition Probability: P(ψ → ϕ) = |⟨ϕ|ψ⟩|²',
      '4. Outer Product Operator: |ψ⟩⟨ψ| = [ |α|²   α β* ] (Projector onto |ψ⟩)\n                                   [ α* β   |β|² ]'
    ],
    initialTheta: 60,
    initialPhi: 45,
    presetEquations: [
      '⟨+|0⟩ = 1/√2',
      '⟨+|1⟩ = 1/√2',
      '⟨+|-⟩ = 0  (Orthogonal States)',
      '|0⟩⟨0| + |1⟩⟨1| = I  (Completeness Relation / Resolution of Identity)'
    ]
  },
  {
    id: 'topic-3',
    title: '3. Unitary Operators & Quantum Gates',
    subtitle: 'Reversible quantum state evolution under U^† U = I operators',
    category: 'Operators',
    summary: 'Quantum logic gates are represented by linear unitary operators U that preserve inner products and state vector normalization: ‖U|ψ⟩‖ = ‖|ψ⟩‖.',
    diracForm: 'U = exp(-i H t / ℏ)   ==>   U^† U = U U^† = I',
    matrixForm: 'H = 1/√2 [ 1   1 ] ,  X = [ 0  1 ] ,  Z = [ 1   0 ]\n         [ 1  -1 ]      [ 1  0 ]      [ 0  -1 ]',
    proofSteps: [
      '1. Unitary Preservation: ⟨Uψ|Uϕ⟩ = ⟨ψ|U^† U|ϕ⟩ = ⟨ψ|I|ϕ⟩ = ⟨ψ|ϕ⟩',
      '2. Hadamard Operator: H |0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩, H |1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩',
      '3. Pauli Involutory Property: X² = Y² = Z² = I, H² = I',
      '4. Rotation Operators: R_z(φ) = exp(-i φ Z / 2) = diag(e^(-iφ/2), e^(iφ/2))'
    ],
    initialTheta: 0,
    initialPhi: 0,
    presetEquations: [
      'H |0⟩ = |+⟩',
      'X |0⟩ = |1⟩',
      'Z |+⟩ = |-⟩',
      'S = diag(1, i)  (Phase Gate)'
    ]
  },
  {
    id: 'topic-4',
    title: '4. Quantum Entanglement & Partial Trace',
    subtitle: 'Non-separable bipartite tensor states H_A ⊗ H_B & reduced density matrices',
    category: 'Entanglement',
    summary: 'An entangled state vector in composite Hilbert space H_A ⊗ H_B cannot be written as a product state |ψ_A⟩ ⊗ |ψ_B⟩. Partial tracing out subsystem B yields a mixed reduced state.',
    diracForm: '|Φ+⟩ = 1/√2 (|00⟩ + |11⟩)   ==>   ρ_A = Tr_B(|Φ+⟩⟨Φ+|) = I_A / 2',
    matrixForm: '|Φ+⟩ = 1/√2 [ 1, 0, 0, 1 ]^T\nρ_A = 1/2 [ 1  0 ] (Maximally Mixed Reduced Density Matrix)\n          [ 0  1 ]',
    proofSteps: [
      '1. Composite Tensor Product Basis: {|00⟩, |01⟩, |10⟩, |11⟩} in ℂ⁴',
      '2. Non-Separability Test: Det(matrix of amplitudes) ≠ 0 ==> Entangled',
      '3. Full Density Operator: ρ = |Φ+⟩⟨Φ+| = 1/2 (|00⟩⟨00| + |00⟩⟨11| + |11⟩⟨00| + |11⟩⟨11|)',
      '4. Partial Trace Reduction: ρ_A = ⟨0_B|ρ|0_B⟩ + ⟨1_B|ρ|1_B⟩ = 1/2 |0⟩⟨0| + 1/2 |1⟩⟨1|'
    ],
    initialTheta: 90,
    initialPhi: 90,
    presetEquations: [
      '|Φ+⟩ = (|00⟩ + |11⟩)/√2  (Bell State 1)',
      '|Φ-⟩ = (|00⟩ - |11⟩)/√2  (Bell State 2)',
      '|Ψ+⟩ = (|01⟩ + |10⟩)/√2  (Bell State 3)',
      '|Ψ-⟩ = (|01⟩ - |10⟩)/√2  (Bell State 4)'
    ]
  },
  {
    id: 'topic-5',
    title: '5. Density Matrices & Decoherence',
    subtitle: 'Statistical ensembles of quantum states ρ = ∑ p_i |ψ_i⟩⟨ψ_i| & Kraus noise',
    category: 'Open Systems',
    summary: 'The density matrix formalism generalizes state vectors to describe statistical ensembles and open quantum systems coupled to an environment.',
    diracForm: 'ρ = ∑ p_i |ψ_i⟩⟨ψ_i|   ==>   Tr(ρ) = 1,  ρ = ρ^†,  ρ ≥ 0',
    matrixForm: 'ρ = [ ρ_00  ρ_01 ] = 1/2 [ 1 + r_z     r_x - i r_y ]\n    [ ρ_10  ρ_11 ]       [ r_x + i r_y   1 - r_z   ]',
    proofSteps: [
      '1. Pure vs Mixed States: Pure State Tr(ρ²) = 1; Mixed State Tr(ρ²) < 1',
      '2. Bloch Vector Formalism: ρ = 1/2 (I + r · σ) where r = (r_x, r_y, r_z)',
      '3. Environmental Dephasing (T₂): Off-diagonal coherences decay ρ_01(t) = ρ_01(0) e^(-t/T₂)',
      '4. Kraus Operator Map: E(ρ) = ∑_k E_k ρ E_k^† satisfying ∑_k E_k^† E_k = I'
    ],
    initialTheta: 120,
    initialPhi: 180,
    presetEquations: [
      'Tr(ρ) = 1  (Probability Conservation)',
      'Pure State: ρ² = ρ',
      'Maximally Mixed: ρ = I/2',
      'Dephasing Map: E_0 = √p I, E_1 = √(1-p) Z'
    ]
  }
];
