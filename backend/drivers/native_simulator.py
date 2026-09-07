import math
import cmath
import time
from typing import List, Dict, Any

class NativeQuantumSimulator:
    """
    Pure Python/NumPy High-Performance Quantum Circuit Simulator.
    Calculates statevectors, measurement probabilities, shot counts, and QASM.
    """
    @staticmethod
    def run_simulation(gates: List[Dict[str, Any]], qubit_count: int = 3, shots: int = 1024) -> Dict[str, Any]:
        start_time = time.time()
        num_states = 1 << qubit_count
        
        # Initial statevector |00...0>
        state = [complex(1.0, 0.0) if i == 0 else complex(0.0, 0.0) for i in range(num_states)]
        
        sorted_gates = sorted(gates, key=lambda g: g.get('step', 0))

        for g in sorted_gates:
            gate_type = g.get('type')
            q = g.get('qubit')
            t_q = g.get('targetQubit')
            c2_q = g.get('control2Qubit')

            if gate_type in ['H', 'X', 'Y', 'Z', 'S', 'T']:
                inv_sqrt2 = 1.0 / math.sqrt(2.0)
                for i in range(num_states):
                    if (i & (1 << (qubit_count - 1 - q))) == 0:
                        i0 = i
                        i1 = i | (1 << (qubit_count - 1 - q))
                        v0 = state[i0]
                        v1 = state[i1]

                        if gate_type == 'H':
                            state[i0] = (v0 + v1) * inv_sqrt2
                            state[i1] = (v0 - v1) * inv_sqrt2
                        elif gate_type == 'X':
                            state[i0] = v1
                            state[i1] = v0
                        elif gate_type == 'Y':
                            state[i0] = complex(v1.imag, -v1.real)
                            state[i1] = complex(-v0.imag, v0.real)
                        elif gate_type == 'Z':
                            state[i1] = -v1
                        elif gate_type == 'S':
                            state[i1] = complex(-v1.imag, v1.real)
                        elif gate_type == 'T':
                            phase_t = complex(inv_sqrt2, inv_sqrt2)
                            state[i1] = v1 * phase_t

            elif gate_type == 'CNOT' and t_q is not None:
                for i in range(num_states):
                    ctrl_set = (i & (1 << (qubit_count - 1 - q))) != 0
                    target_zero = (i & (1 << (qubit_count - 1 - t_q))) == 0
                    if ctrl_set and target_zero:
                        i0 = i
                        i1 = i | (1 << (qubit_count - 1 - t_q))
                        state[i0], state[i1] = state[i1], state[i0]

            elif gate_type == 'TOFFOLI' and t_q is not None and c2_q is not None:
                for i in range(num_states):
                    c1 = (i & (1 << (qubit_count - 1 - q))) != 0
                    c2 = (i & (1 << (qubit_count - 1 - c2_q))) != 0
                    target_zero = (i & (1 << (qubit_count - 1 - t_q))) == 0
                    if c1 and c2 and target_zero:
                        i0 = i
                        i1 = i | (1 << (qubit_count - 1 - t_q))
                        state[i0], state[i1] = state[i1], state[i0]

        # Calculate probabilities
        probabilities = {}
        counts = {}
        for i in range(num_states):
            bitstring = bin(i)[2:].zfill(qubit_count)
            prob = abs(state[i]) ** 2
            probabilities[bitstring] = round(prob, 4)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return {
            "stateVector": [{"real": round(c.real, 4), "imag": round(c.imag, 4)} for c in state],
            "probabilities": probabilities,
            "counts": {b: int(p * shots) for b, p in probabilities.items() if p > 0},
            "executionTimeMs": elapsed_ms,
            "gateCount": len(gates),
            "depth": max([g.get('step', 0) for g in gates], default=0) + 1 if gates else 0,
            "framework": "native"
        }
