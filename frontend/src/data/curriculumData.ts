import { CurriculumLesson } from '../types/quantum';

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  {
    id: 'lesson-1',
    title: '1. Qubit Fundamentals & Superposition',
    category: 'Fundamentals',
    description: 'Learn how quantum bits exist in superpositions of |0⟩ and |1⟩ states using Hadamard gates.',
    difficulty: 'Beginner',
    qubitCount: 2,
    initialCircuit: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
    ],
    markdownContent: `
# 1. Qubit Fundamentals & Superposition

Unlike a classical bit which is strictly **0** or **1**, a Quantum Bit (qubit) exists in a quantum state $|\psi\rangle$:

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$$

where $\alpha, \beta \in \mathbb{C}$ are complex probability amplitudes satisfying:

$$|\alpha|^2 + |\beta|^2 = 1$$

## The Hadamard Gate ($H$)
The **Hadamard Gate** creates an equal superposition from a basis state:

$$H |0\rangle = \frac{1}{\sqrt{2}} (|0\rangle + |1\rangle) = |+\rangle$$

$$H |1\rangle = \frac{1}{\sqrt{2}} (|0\rangle - |1\rangle) = |-\rangle$$

When measured, a qubit in state $|+\rangle$ yields outcome **0** with 50% probability and **1** with 50% probability!

### Hands-on Exercise:
1. Apply an **H gate** to $q_0$.
2. Inspect the **3D Bloch Sphere** on the right panel to see the vector point along the $+X$ axis ($|+\rangle$).
3. Check the **Measurement Probabilities** chart to verify equal 50%-50% distribution.
`,
    quiz: {
      question: 'What is the state of a qubit initialized to |0⟩ after applying a single Hadamard (H) gate?',
      options: [
        'Strictly |1⟩ with 100% certainty',
        'Equal superposition (|0⟩ + |1⟩)/√2',
        'Phase shifted state i|0⟩',
        'Zero state vector |00⟩'
      ],
      correctIndex: 1,
      explanation: 'The Hadamard gate maps the computational basis state |0⟩ to the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2.'
    },
    challengeTargetState: '|00> + |01>'
  },
  {
    id: 'lesson-2',
    title: '2. Quantum Entanglement & Bell States',
    category: 'Entanglement',
    description: 'Create Einstein’s "spooky action at a distance" by pairing H and CNOT gates to construct maximal entanglement.',
    difficulty: 'Beginner',
    qubitCount: 2,
    initialCircuit: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'CNOT', qubit: 0, targetQubit: 1, step: 1 },
    ],
    markdownContent: `
# 2. Quantum Entanglement & Bell States

**Quantum Entanglement** is a phenomenon where the quantum state of two or more qubits cannot be described independently.

## Creating the $|\Phi^+\rangle$ Bell State
To create the maximally entangled Bell state:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}} (|00\rangle + |11\rangle)$$

Follow these steps:
1. Initialize two qubits $|00\rangle$.
2. Apply Hadamard gate $H$ to qubit 0 $\rightarrow \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)|0\rangle$.
3. Apply Controlled-NOT ($CNOT$) gate with control qubit 0 and target qubit 1.

$$\text{CNOT} \left(\frac{|00\rangle + |10\rangle}{\sqrt{2}}\right) = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$

### Key Observation:
Measuring $q_0$ as **0** instantly collapses $q_1$ to **0**. Measuring $q_0$ as **1** instantly collapses $q_1$ to **1**! Neither state $|01\rangle$ nor $|10\rangle$ will ever occur.
`,
    quiz: {
      question: 'In the Bell state (|00⟩ + |11⟩)/√2, if qubit 0 is measured and found to be 1, what is the state of qubit 1?',
      options: [
        '0 with 50% probability',
        '1 with 100% certainty',
        'Superposition state |+⟩',
        'Indeterminate state'
      ],
      correctIndex: 1,
      explanation: 'Due to entanglement in the |Φ+⟩ state, measuring qubit 0 as 1 instantly collapses qubit 1 to 1.'
    },
    challengeTargetState: '|00> + |11>'
  },
  {
    id: 'lesson-3',
    title: '3. Quantum Teleportation Protocol',
    category: 'Algorithms',
    description: 'Transfer an unknown quantum state using entanglement, Hadamard, CNOT, and classical bit communications.',
    difficulty: 'Intermediate',
    qubitCount: 3,
    initialCircuit: [
      { id: 'g1', type: 'X', qubit: 0, step: 0 },
      { id: 'g2', type: 'H', qubit: 1, step: 0 },
      { id: 'g3', type: 'CNOT', qubit: 1, targetQubit: 2, step: 1 },
      { id: 'g4', type: 'CNOT', qubit: 0, targetQubit: 1, step: 2 },
      { id: 'g5', type: 'H', qubit: 0, step: 3 },
    ],
    markdownContent: `
# 3. Quantum Teleportation Protocol

Quantum Teleportation allows Alice to transmit an unknown quantum state $|\psi\rangle$ to Bob using a shared entangled pair and 2 classical bits.

## Protocol Steps:
1. **Entanglement Distribution**: Alice and Bob share an entangled pair $|\Phi^+\rangle$ on qubits $q_1$ and $q_2$.
2. **Alice’s Operations**: Alice performs CNOT between state $q_0$ and $q_1$, followed by $H$ on $q_0$.
3. **Measurement**: Alice measures $q_0$ and $q_1$.
4. **Bob’s Recovery**: Bob applies conditional $X$ and $Z$ gates on $q_2$ based on Alice’s measurement results to reconstruct $|\psi\rangle$ perfectly!
`,
    quiz: {
      question: 'Does Quantum Teleportation violate the principle that nothing can travel faster than light?',
      options: [
        'Yes, state transfer is instant without classical communication',
        'No, Bob requires 2 classical bits sent at light speed to reconstruct the state',
        'Yes, because quantum information cloning is allowed',
        'No, because state vectors do not carry physical information'
      ],
      correctIndex: 1,
      explanation: 'Quantum Teleportation requires 2 classical bits of information sent over traditional communication channels to recover the state, preserving relativity.'
    }
  },
  {
    id: 'lesson-4',
    title: '4. Grover’s Quantum Search Algorithm',
    category: 'Algorithms',
    description: 'Achieve quadratic speedup O(√N) for unstructured database search using Oracle phase inversion and Amplitude Amplification.',
    difficulty: 'Advanced',
    qubitCount: 3,
    initialCircuit: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'H', qubit: 1, step: 0 },
      { id: 'g3', type: 'H', qubit: 2, step: 0 },
      { id: 'g4', type: 'TOFFOLI', qubit: 0, control2Qubit: 1, targetQubit: 2, step: 1 },
    ],
    markdownContent: `
# 4. Grover’s Search Algorithm

Grover’s algorithm searches an unsorted database of $N = 2^n$ items in $O(\sqrt{N})$ queries compared to classical $O(N)$ brute-force search!

## Core Components:
1. **Equal Superposition**: Prepare initial state $|\mathbf{s}\rangle = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} |x\rangle$.
2. **Oracle Inversion**: Flip the phase of target item $|w\rangle$: $U_\omega |x\rangle = -|x\rangle$ if $x = w$.
3. **Diffuser (Reflection about Average)**: Amplifies target amplitude while suppressing non-target states.
`,
    quiz: {
      question: 'What is the time complexity of Grover’s Search on N items vs classical search?',
      options: [
        'Quantum O(log N) vs Classical O(N)',
        'Quantum O(√N) vs Classical O(N)',
        'Quantum O(1) vs Classical O(N^2)',
        'Quantum O(N) vs Classical O(N log N)'
      ],
      correctIndex: 1,
      explanation: 'Grover’s algorithm provides quadratic speedup O(√N) over classical unstructured search O(N).'
    }
  },
  {
    id: 'lesson-5',
    title: '5. Quantum Fourier Transform (QFT)',
    category: 'Algorithms',
    description: 'Map quantum state amplitudes into phase frequency space. Essential component for Shor’s Factoring Algorithm.',
    difficulty: 'Advanced',
    qubitCount: 3,
    initialCircuit: [
      { id: 'g1', type: 'H', qubit: 0, step: 0 },
      { id: 'g2', type: 'S', qubit: 1, step: 1 },
      { id: 'g3', type: 'H', qubit: 1, step: 2 },
      { id: 'g4', type: 'T', qubit: 2, step: 3 },
      { id: 'g5', type: 'H', qubit: 2, step: 4 },
    ],
    markdownContent: `
# 5. Quantum Fourier Transform (QFT)

The **Quantum Fourier Transform (QFT)** is the quantum analogue of the Discrete Fourier Transform (DFT). It transforms computational basis states into phase states:

$$\text{QFT} |x\rangle = \frac{1}{\sqrt{N}} \sum_{y=0}^{N-1} \omega^{xy} |y\rangle \quad \text{where } \omega = e^{2\pi i / N}$$

## Why QFT Matters:
QFT achieves exponential speedup $O(n^2)$ gate complexity compared to classical Fast Fourier Transform (FFT) $O(n 2^n)$. It is the key building block for **Shor’s Factoring Algorithm** and **Quantum Phase Estimation (QPE)**.
`,
    quiz: {
      question: 'What is the circuit complexity of QFT on n qubits?',
      options: [
        'O(n^2) gates',
        'O(2^n) gates',
        'O(n!) gates',
        'O(1) gates'
      ],
      correctIndex: 0,
      explanation: 'QFT requires only O(n^2) quantum gates, providing an exponential speedup over classical FFT O(n 2^n).'
    }
  },
  {
    id: 'lesson-6',
    title: '6. Variational Quantum Eigensolver (VQE)',
    category: 'Quantum ML',
    description: 'Use hybrid quantum-classical algorithms to find ground state energies of molecular Hamiltonians.',
    difficulty: 'Advanced',
    qubitCount: 2,
    initialCircuit: [
      { id: 'g1', type: 'RX', qubit: 0, step: 0 },
      { id: 'g2', type: 'RY', qubit: 1, step: 0 },
      { id: 'g3', type: 'CNOT', qubit: 0, targetQubit: 1, step: 1 },
    ],
    markdownContent: `
# 6. Variational Quantum Eigensolver (VQE)

**VQE** is a Noisy Intermediate-Scale Quantum (NISQ) hybrid algorithm designed to calculate the lowest energy state (ground state) of a quantum system described by Hamiltonian $\hat{H}$.

## The Variational Principle:
$$\langle \psi(\vec{\theta}) | \hat{H} | \psi(\vec{\theta}) \rangle \ge E_0$$

1. **Ansatz Preparation**: Prepare parameterized quantum state $|\psi(\vec{\theta})\rangle$ on quantum hardware.
2. **Energy Measurement**: Measure expectation values of Hamiltonian terms.
3. **Classical Optimization**: Update parameters $\vec{\theta}$ using gradient descent on classical processor.
`,
    quiz: {
      question: 'Which principle guarantees that the VQE measured energy expectation value is always greater than or equal to the true ground state energy E0?',
      options: [
        'Heisenberg Uncertainty Principle',
        'Variational Principle',
        'Pauli Exclusion Principle',
        'No-Cloning Theorem'
      ],
      correctIndex: 1,
      explanation: 'The Variational Principle guarantees that ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E0 for any parameterized trial wavefunction.'
    }
  }
];
