import math
import cmath
import time
import numpy as np
from typing import List, Dict, Any

class NativeQuantumSimulator:
    """
    Pure Python/NumPy High-Performance Quantum Circuit Simulator.
    Simulates exact unitary matrix statevector evolution, Born rule probabilities,
    and multinomial shot counts for all standard gate types.
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
            param = g.get('param')
            if param is None:
                param = math.pi / 2.0

            if gate_type in ['H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RY', 'RZ']:
                inv_sqrt2 = 1.0 / math.sqrt(2.0)
                cos_half = math.cos(param / 2.0)
                sin_half = math.sin(param / 2.0)
                phase_rz_0 = cmath.exp(-1j * (param / 2.0))
                phase_rz_1 = cmath.exp(1j * (param / 2.0))

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
                        elif gate_type == 'RX':
                            state[i0] = cos_half * v0 - 1j * sin_half * v1
                            state[i1] = -1j * sin_half * v0 + cos_half * v1
                        elif gate_type == 'RY':
                            state[i0] = cos_half * v0 - sin_half * v1
                            state[i1] = sin_half * v0 + cos_half * v1
                        elif gate_type == 'RZ':
                            state[i0] = v0 * phase_rz_0
                            state[i1] = v1 * phase_rz_1

            elif gate_type == 'CNOT' and t_q is not None:
                for i in range(num_states):
                    ctrl_set = (i & (1 << (qubit_count - 1 - q))) != 0
                    target_zero = (i & (1 << (qubit_count - 1 - t_q))) == 0
                    if ctrl_set and target_zero:
                        i0 = i
                        i1 = i | (1 << (qubit_count - 1 - t_q))
                        state[i0], state[i1] = state[i1], state[i0]

            elif gate_type == 'CZ' and t_q is not None:
                for i in range(num_states):
                    ctrl_set = (i & (1 << (qubit_count - 1 - q))) != 0
                    target_set = (i & (1 << (qubit_count - 1 - t_q))) != 0
                    if ctrl_set and target_set:
                        state[i] = -state[i]

            elif gate_type == 'SWAP' and t_q is not None:
                for i in range(num_states):
                    q1_set = (i & (1 << (qubit_count - 1 - q))) != 0
                    q2_zero = (i & (1 << (qubit_count - 1 - t_q))) == 0
                    if q1_set and q2_zero:
                        i_swap = (i & ~(1 << (qubit_count - 1 - q))) | (1 << (qubit_count - 1 - t_q))
                        state[i], state[i_swap] = state[i_swap], state[i]

            elif gate_type == 'TOFFOLI' and t_q is not None and c2_q is not None:
                for i in range(num_states):
                    c1 = (i & (1 << (qubit_count - 1 - q))) != 0
                    c2 = (i & (1 << (qubit_count - 1 - c2_q))) != 0
                    target_zero = (i & (1 << (qubit_count - 1 - t_q))) == 0
                    if c1 and c2 and target_zero:
                        i0 = i
                        i1 = i | (1 << (qubit_count - 1 - t_q))
                        state[i0], state[i1] = state[i1], state[i0]

        # Calculate exact Born rule probabilities
        probabilities = {}
        probs_list = []
        for i in range(num_states):
            bitstring = bin(i)[2:].zfill(qubit_count)
            prob = abs(state[i]) ** 2
            prob_rounded = round(float(prob), 4)
            probabilities[bitstring] = prob_rounded
            probs_list.append(float(prob))

        # Sample measurement shots using true multinomial distribution
        counts = {}
        if shots > 0:
            total_p = sum(probs_list)
            if total_p > 0:
                p_norm = [p / total_p for p in probs_list]
            else:
                p_norm = [1.0 / num_states] * num_states
            sampled_indices = np.random.choice(num_states, size=shots, p=p_norm)
            for idx in sampled_indices:
                bs = bin(idx)[2:].zfill(qubit_count)
                counts[bs] = counts.get(bs, 0) + 1

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        
        return {
            "stateVector": [{"real": round(float(c.real), 4), "imag": round(float(c.imag), 4)} for c in state],
            "probabilities": probabilities,
            "counts": counts,
            "executionTimeMs": elapsed_ms,
            "gateCount": len(gates),
            "depth": max([g.get('step', 0) for g in gates], default=0) + 1 if gates else 0,
            "framework": "native",
            "fidelity": 1.0
        }
