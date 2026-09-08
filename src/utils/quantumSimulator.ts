import { QuantumGate, ComplexNumber, SimulationResult, BlochVector, Framework, NoiseModel, QosphereNode } from '../types/quantum';

export class Complex {
  constructor(public real: number, public imag: number) {}

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  sub(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    );
  }

  mulScalar(s: number): Complex {
    return new Complex(this.real * s, this.imag * s);
  }

  magnitudeSquared(): number {
    return this.real * this.real + this.imag * this.imag;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  phase(): number {
    return Math.atan2(this.imag, this.real);
  }
}

/**
 * Native Quantum Circuit Simulator Engine with Noise & Hardware Realities Model
 */
export function simulateCircuit(
  gates: QuantumGate[],
  qubitCount: number = 3,
  shots: number = 1024,
  framework: Framework = 'qiskit',
  noiseModel?: NoiseModel
): SimulationResult {
  const startTime = performance.now();
  const numStates = 1 << qubitCount;
  
  let state: Complex[] = Array.from({ length: numStates }, (_, i) => 
    i === 0 ? new Complex(1, 0) : new Complex(0, 0)
  );

  const sortedGates = [...gates].sort((a, b) => a.step - b.step);

  for (const gate of sortedGates) {
    state = applyGate(state, gate, qubitCount);
  }

  const depth = calculateCircuitDepth(sortedGates);
  const probabilities: Record<string, number> = {};
  const noisyProbabilities: Record<string, number> = {};
  const counts: Record<string, number> = {};

  // Default noise params if enabled
  const isNoise = noiseModel?.isNoiseEnabled || false;
  const gateErrorRate = noiseModel?.gateErrorRate || 0.01; // 1% default error
  const noiseDecay = isNoise ? Math.pow(1 - gateErrorRate, depth) : 1.0;
  const uniformUniformProb = 1.0 / numStates;

  for (let i = 0; i < numStates; i++) {
    const bitstring = i.toString(2).padStart(qubitCount, '0');
    const idealProb = state[i].magnitudeSquared();
    probabilities[bitstring] = Math.round(idealProb * 10000) / 10000;

    // Apply depolarizing noise attenuation
    const noisyProb = noiseDecay * idealProb + (1 - noiseDecay) * uniformUniformProb;
    noisyProbabilities[bitstring] = Math.round(noisyProb * 10000) / 10000;
  }

  // Active probabilities for shot sampling
  const activeProbs = isNoise ? noisyProbabilities : probabilities;

  if (shots > 0) {
    for (let s = 0; s < shots; s++) {
      const rand = Math.random();
      let cumulative = 0;
      let sampled = '';
      for (const [bitstring, prob] of Object.entries(activeProbs)) {
        cumulative += prob;
        if (rand <= cumulative || sampled === '') {
          sampled = bitstring;
          if (rand <= cumulative) break;
        }
      }
      counts[sampled] = (counts[sampled] || 0) + 1;
    }
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
  const qasm = generateQASM(gates, qubitCount);
  const fidelity = isNoise ? Math.round(noiseDecay * 1000) / 1000 : 1.0;

  return {
    stateVector: state.map(c => ({ real: Math.round(c.real * 1000) / 1000, imag: Math.round(c.imag * 1000) / 1000 })),
    probabilities,
    noisyProbabilities: isNoise ? noisyProbabilities : undefined,
    counts,
    executionTimeMs,
    gateCount: gates.length,
    depth,
    qasm,
    framework,
    fidelity
  };
}

function applyGate(state: Complex[], gate: QuantumGate, numQubits: number): Complex[] {
  const nextState: Complex[] = state.map(c => new Complex(c.real, c.imag));
  const numStates = 1 << numQubits;

  if (['H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RY', 'RZ'].includes(gate.type)) {
    const q = gate.qubit;
    const invSqrt2 = 1 / Math.sqrt(2);

    for (let i = 0; i < numStates; i++) {
      if ((i & (1 << (numQubits - 1 - q))) === 0) {
        const i0 = i;
        const i1 = i | (1 << (numQubits - 1 - q));

        const v0 = state[i0];
        const v1 = state[i1];

        switch (gate.type) {
          case 'H':
            nextState[i0] = v0.add(v1).mulScalar(invSqrt2);
            nextState[i1] = v0.sub(v1).mulScalar(invSqrt2);
            break;
          case 'X':
            nextState[i0] = v1;
            nextState[i1] = v0;
            break;
          case 'Y':
            nextState[i0] = new Complex(v1.imag, -v1.real);
            nextState[i1] = new Complex(-v0.imag, v0.real);
            break;
          case 'Z':
            nextState[i0] = v0;
            nextState[i1] = v1.mulScalar(-1);
            break;
          case 'S':
            nextState[i0] = v0;
            nextState[i1] = new Complex(-v1.imag, v1.real);
            break;
          case 'T':
            nextState[i0] = v0;
            const phaseT = new Complex(invSqrt2, invSqrt2);
            nextState[i1] = v1.mul(phaseT);
            break;
        }
      }
    }
  }

  if (gate.type === 'CNOT' && gate.targetQubit !== undefined) {
    const control = gate.qubit;
    const target = gate.targetQubit;

    for (let i = 0; i < numStates; i++) {
      const isControlSet = (i & (1 << (numQubits - 1 - control))) !== 0;
      const isTargetZero = (i & (1 << (numQubits - 1 - target))) === 0;

      if (isControlSet && isTargetZero) {
        const i0 = i;
        const i1 = i | (1 << (numQubits - 1 - target));

        nextState[i0] = state[i1];
        nextState[i1] = state[i0];
      }
    }
  }

  if (gate.type === 'CZ' && gate.targetQubit !== undefined) {
    const control = gate.qubit;
    const target = gate.targetQubit;

    for (let i = 0; i < numStates; i++) {
      const isControlSet = (i & (1 << (numQubits - 1 - control))) !== 0;
      const isTargetSet = (i & (1 << (numQubits - 1 - target))) !== 0;

      if (isControlSet && isTargetSet) {
        nextState[i] = state[i].mulScalar(-1);
      }
    }
  }

  if (gate.type === 'TOFFOLI' && gate.targetQubit !== undefined && gate.control2Qubit !== undefined) {
    const ctrl1 = gate.qubit;
    const ctrl2 = gate.control2Qubit;
    const target = gate.targetQubit;

    for (let i = 0; i < numStates; i++) {
      const c1 = (i & (1 << (numQubits - 1 - ctrl1))) !== 0;
      const c2 = (i & (1 << (numQubits - 1 - ctrl2))) !== 0;
      const targetZero = (i & (1 << (numQubits - 1 - target))) === 0;

      if (c1 && c2 && targetZero) {
        const i0 = i;
        const i1 = i | (1 << (numQubits - 1 - target));

        nextState[i0] = state[i1];
        nextState[i1] = state[i0];
      }
    }
  }

  return nextState;
}

export function calculateBlochVector(
  stateVector: ComplexNumber[],
  qubitIndex: number,
  numQubits: number
): BlochVector {
  let rho00 = 0;
  let rho11 = 0;
  let rho01 = new Complex(0, 0);

  const numStates = 1 << numQubits;
  const safeSV = stateVector && stateVector.length >= numStates 
    ? stateVector 
    : Array.from({ length: numStates }, (_, i) => i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 });

  const safeQubitIndex = Math.min(qubitIndex, numQubits - 1);

  for (let i = 0; i < numStates; i++) {
    const isOne = (i & (1 << (numQubits - 1 - safeQubitIndex))) !== 0;
    const ampVal = safeSV[i] || { real: 0, imag: 0 };
    const amp = new Complex(ampVal.real, ampVal.imag);
    const prob = amp.magnitudeSquared();

    if (!isOne) {
      rho00 += prob;
      const iOne = i | (1 << (numQubits - 1 - safeQubitIndex));
      const ampOneVal = safeSV[iOne] || { real: 0, imag: 0 };
      const ampOne = new Complex(ampOneVal.real, ampOneVal.imag);
      const conjOne = new Complex(ampOne.real, -ampOne.imag);
      rho01 = rho01.add(amp.mul(conjOne));
    } else {
      rho11 += prob;
    }
  }

  const resX = Math.round(2 * rho01.real * 1000) / 1000;
  const resY = Math.round(2 * rho01.imag * 1000) / 1000;
  const resZ = Math.round((rho00 - rho11) * 1000) / 1000;

  const x = isNaN(resX) ? 0 : resX;
  const y = isNaN(resY) ? 0 : resY;
  const z = isNaN(resZ) ? 1 : resZ;

  const theta = Math.acos(Math.max(-1, Math.min(1, z)));
  const phi = Math.atan2(y, x);

  return { x, y, z, theta: isNaN(theta) ? 0 : theta, phi: isNaN(phi) ? 0 : phi };
}

/**
 * Calculates Qosphere nodes layout mapped by Hamming Weight levels and Phase Angle colors
 */
export function calculateQosphereNodes(
  stateVector: ComplexNumber[],
  numQubits: number,
  radius: number = 100
): QosphereNode[] {
  const numStates = 1 << numQubits;
  const safeSV = stateVector && stateVector.length >= numStates 
    ? stateVector 
    : Array.from({ length: numStates }, (_, i) => i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 });
  const nodes: QosphereNode[] = [];

  for (let i = 0; i < numStates; i++) {
    const bitstring = i.toString(2).padStart(numQubits, '0');
    const ampVal = safeSV[i] || { real: 0, imag: 0 };
    const amp = new Complex(ampVal.real, ampVal.imag);
    const prob = Math.round(amp.magnitudeSquared() * 10000) / 10000;
    const phaseRad = amp.phase();
    const phaseDeg = Math.round(((phaseRad >= 0 ? phaseRad : phaseRad + 2 * Math.PI) * 180) / Math.PI);

    const hammingWeight = bitstring.split('').filter(b => b === '1').length;
    
    const levelStates = [];
    for (let j = 0; j < numStates; j++) {
      const bs = j.toString(2).padStart(numQubits, '0');
      if (bs.split('').filter(b => b === '1').length === hammingWeight) {
        levelStates.push(j);
      }
    }

    const idxInLevel = levelStates.indexOf(i);
    const angleStep = (2 * Math.PI) / Math.max(1, levelStates.length);
    const angle = idxInLevel * angleStep;

    const levelRadius = (radius * (hammingWeight + 1)) / (numQubits + 1);

    const x = Math.round(levelRadius * Math.cos(angle));
    const y = Math.round(levelRadius * Math.sin(angle));

    nodes.push({
      bitstring,
      probability: prob,
      phaseRad,
      phaseDeg,
      hammingWeight,
      x,
      y
    });
  }

  return nodes;
}

export function calculateCircuitDepth(gates: QuantumGate[]): number {
  if (gates.length === 0) return 0;
  return Math.max(...gates.map(g => g.step)) + 1;
}

export function generateQASM(gates: QuantumGate[], numQubits: number): string {
  let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${numQubits}];\ncreg c[${numQubits}];\n\n`;
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  for (const g of sorted) {
    switch (g.type) {
      case 'H': qasm += `h q[${g.qubit}];\n`; break;
      case 'X': qasm += `x q[${g.qubit}];\n`; break;
      case 'Y': qasm += `y q[${g.qubit}];\n`; break;
      case 'Z': qasm += `z q[${g.qubit}];\n`; break;
      case 'S': qasm += `s q[${g.qubit}];\n`; break;
      case 'T': qasm += `t q[${g.qubit}];\n`; break;
      case 'CNOT': qasm += `cx q[${g.qubit}],q[${g.targetQubit}];\n`; break;
      case 'CZ': qasm += `cz q[${g.qubit}],q[${g.targetQubit}];\n`; break;
      case 'TOFFOLI': qasm += `ccx q[${g.qubit}],q[${g.control2Qubit}],q[${g.targetQubit}];\n`; break;
      case 'MEASURE': qasm += `measure q[${g.qubit}] -> c[${g.qubit}];\n`; break;
    }
  }
  return qasm;
}

export function generateQiskitCode(gates: QuantumGate[], numQubits: number): string {
  let code = `from qiskit import QuantumCircuit, Aer, execute\n\n# Initialize ${numQubits}-qubit Quantum Circuit\nqc = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  for (const g of sorted) {
    switch (g.type) {
      case 'H': code += `qc.h(${g.qubit})\n`; break;
      case 'X': code += `qc.x(${g.qubit})\n`; break;
      case 'Y': code += `qc.y(${g.qubit})\n`; break;
      case 'Z': code += `qc.z(${g.qubit})\n`; break;
      case 'S': code += `qc.s(${g.qubit})\n`; break;
      case 'T': code += `qc.t(${g.qubit})\n`; break;
      case 'CNOT': code += `qc.cx(${g.qubit}, ${g.targetQubit})\n`; break;
      case 'CZ': code += `qc.cz(${g.qubit}, ${g.targetQubit})\n`; break;
      case 'TOFFOLI': code += `qc.ccx(${g.qubit}, ${g.control2Qubit}, ${g.targetQubit})\n`; break;
      case 'MEASURE': code += `qc.measure(${g.qubit}, ${g.qubit})\n`; break;
    }
  }

  code += `\n# Run on Aer Statevector Simulator\nsimulator = Aer.get_backend('statevector_simulator')\nresult = execute(qc, simulator).result()\nstatevector = result.get_statevector()\nprint("Statevector:", statevector)\n`;
  return code;
}

export function generateCirqCode(gates: QuantumGate[], numQubits: number): string {
  let code = `import cirq\n\n# Create qubits and circuit\nqubits = cirq.LineQubit.range(${numQubits})\ncircuit = cirq.Circuit()\n\n`;
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  for (const g of sorted) {
    switch (g.type) {
      case 'H': code += `circuit.append(cirq.H(qubits[${g.qubit}]))\n`; break;
      case 'X': code += `circuit.append(cirq.X(qubits[${g.qubit}]))\n`; break;
      case 'Y': code += `circuit.append(cirq.Y(qubits[${g.qubit}]))\n`; break;
      case 'Z': code += `circuit.append(cirq.Z(qubits[${g.qubit}]))\n`; break;
      case 'S': code += `circuit.append(cirq.S(qubits[${g.qubit}]))\n`; break;
      case 'T': code += `circuit.append(cirq.T(qubits[${g.qubit}]))\n`; break;
      case 'CNOT': code += `circuit.append(cirq.CNOT(qubits[${g.qubit}], qubits[${g.targetQubit}]))\n`; break;
      case 'CZ': code += `circuit.append(cirq.CZ(qubits[${g.qubit}], qubits[${g.targetQubit}]))\n`; break;
      case 'TOFFOLI': code += `circuit.append(cirq.TOFFOLI(qubits[${g.qubit}], qubits[${g.control2Qubit}], qubits[${g.targetQubit}]))\n`; break;
      case 'MEASURE': code += `circuit.append(cirq.measure(qubits[${g.qubit}], key='m${g.qubit}'))\n`; break;
    }
  }

  code += `\n# Simulate statevector\nsimulator = cirq.Simulator()\nresult = simulator.simulate(circuit)\nprint(result)\n`;
  return code;
}

export function generatePennyLaneCode(gates: QuantumGate[], numQubits: number): string {
  let code = `import pennylane as qml\n\ndev = qml.device("default.qubit", wires=${numQubits})\n\n@qml.qnode(dev)\ndef quantum_circuit():\n`;
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  if (sorted.length === 0) {
    code += `    pass\n`;
  }

  for (const g of sorted) {
    switch (g.type) {
      case 'H': code += `    qml.Hadamard(wires=${g.qubit})\n`; break;
      case 'X': code += `    qml.PauliX(wires=${g.qubit})\n`; break;
      case 'Y': code += `    qml.PauliY(wires=${g.qubit})\n`; break;
      case 'Z': code += `    qml.PauliZ(wires=${g.qubit})\n`; break;
      case 'S': code += `    qml.S(wires=${g.qubit})\n`; break;
      case 'T': code += `    qml.T(wires=${g.qubit})\n`; break;
      case 'CNOT': code += `    qml.CNOT(wires=[${g.qubit}, ${g.targetQubit}])\n`; break;
      case 'CZ': code += `    qml.CZ(wires=[${g.qubit}, ${g.targetQubit}])\n`; break;
      case 'TOFFOLI': code += `    qml.Toffoli(wires=[${g.qubit}, ${g.control2Qubit}, ${g.targetQubit}])\n`; break;
    }
  }

  code += `    return qml.state()\n\nprint("Statevector:", quantum_circuit())\n`;
  return code;
}

export function generateQBraidCode(gates: QuantumGate[], numQubits: number): string {
  let code = `from qbraid import QProgram, device_wrapper\nfrom qiskit import QuantumCircuit\n\n# Initialize ${numQubits}-qubit circuit in qBraid SDK environment\nqc = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;
  const sorted = [...gates].sort((a, b) => a.step - b.step);

  for (const g of sorted) {
    switch (g.type) {
      case 'H': code += `qc.h(${g.qubit})\n`; break;
      case 'X': code += `qc.x(${g.qubit})\n`; break;
      case 'Y': code += `qc.y(${g.qubit})\n`; break;
      case 'Z': code += `qc.z(${g.qubit})\n`; break;
      case 'S': code += `qc.s(${g.qubit})\n`; break;
      case 'T': code += `qc.t(${g.qubit})\n`; break;
      case 'CNOT': code += `qc.cx(${g.qubit}, ${g.targetQubit})\n`; break;
      case 'CZ': code += `qc.cz(${g.qubit}, ${g.targetQubit})\n`; break;
      case 'TOFFOLI': code += `qc.ccx(${g.qubit}, ${g.control2Qubit}, ${g.targetQubit})\n`; break;
      case 'MEASURE': code += `qc.measure(${g.qubit}, ${g.qubit})\n`; break;
    }
  }

  code += `\n# Transpile & Execute across qBraid Quantum Device Wrapper\nqprogram = QProgram(qc)\ndevice = device_wrapper("qbraid_qiskit_simulator")\njob = device.run(qprogram, shots=1024)\nresult = job.result()\nprint("qBraid Execution Results:", result.measurement_counts())\n`;
  return code;
}
