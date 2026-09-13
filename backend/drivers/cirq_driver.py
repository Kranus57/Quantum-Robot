import time
import math
from typing import List, Dict, Any

class CirqDriver:
    """
    Google Cirq Quantum Simulator Driver.
    Executes circuits on Cirq's official Simulator engine with exact state vector extraction.
    """
    @staticmethod
    def execute_circuit(gates: List[Dict[str, Any]], qubit_count: int, shots: int = 1024) -> Dict[str, Any]:
        start_time = time.time()
        try:
            import cirq
            import numpy as np

            qubits = cirq.LineQubit.range(qubit_count)
            circuit = cirq.Circuit()
            sorted_gates = sorted(gates, key=lambda g: g.get('step', 0))

            for g in sorted_gates:
                g_type = g.get('type')
                q = g.get('qubit')
                t_q = g.get('targetQubit')
                c2_q = g.get('control2Qubit')
                param = g.get('param')
                if param is None:
                    param = math.pi / 2.0

                if g_type == 'H': circuit.append(cirq.H(qubits[q]))
                elif g_type == 'X': circuit.append(cirq.X(qubits[q]))
                elif g_type == 'Y': circuit.append(cirq.Y(qubits[q]))
                elif g_type == 'Z': circuit.append(cirq.Z(qubits[q]))
                elif g_type == 'S': circuit.append(cirq.S(qubits[q]))
                elif g_type == 'T': circuit.append(cirq.T(qubits[q]))
                elif g_type == 'RX': circuit.append(cirq.rx(param)(qubits[q]))
                elif g_type == 'RY': circuit.append(cirq.ry(param)(qubits[q]))
                elif g_type == 'RZ': circuit.append(cirq.rz(param)(qubits[q]))
                elif g_type == 'CNOT' and t_q is not None: circuit.append(cirq.CNOT(qubits[q], qubits[t_q]))
                elif g_type == 'CZ' and t_q is not None: circuit.append(cirq.CZ(qubits[q], qubits[t_q]))
                elif g_type == 'SWAP' and t_q is not None: circuit.append(cirq.SWAP(qubits[q], qubits[t_q]))
                elif g_type == 'TOFFOLI' and t_q is not None and c2_q is not None: circuit.append(cirq.TOFFOLI(qubits[q], qubits[c2_q], qubits[t_q]))

            simulator = cirq.Simulator()
            result = simulator.simulate(circuit)
            sv = result.final_state_vector

            num_states = 1 << qubit_count
            state_vector = []
            probabilities = {}

            for i in range(num_states):
                bitstring = bin(i)[2:].zfill(qubit_count)
                amp = sv[i]
                state_vector.append({
                    "real": round(float(amp.real), 4),
                    "imag": round(float(amp.imag), 4)
                })
                prob = float(abs(amp) ** 2)
                probabilities[bitstring] = round(prob, 4)

            # Sample shots
            counts = {}
            if shots > 0:
                probs_list = [float(abs(sv[i])**2) for i in range(num_states)]
                probs_sum = sum(probs_list)
                if probs_sum > 0:
                    probs_norm = [p / probs_sum for p in probs_list]
                else:
                    probs_norm = [1.0 / num_states] * num_states
                samples = np.random.choice(num_states, size=shots, p=probs_norm)
                for idx in samples:
                    bs = bin(idx)[2:].zfill(qubit_count)
                    counts[bs] = counts.get(bs, 0) + 1

            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "stateVector": state_vector,
                "probabilities": probabilities,
                "counts": counts,
                "executionTimeMs": elapsed_ms,
                "gateCount": len(gates),
                "depth": len(circuit),
                "qasm": str(circuit),
                "framework": "cirq",
                "fidelity": 1.0
            }
        except Exception as e:
            from backend.drivers.native_simulator import NativeQuantumSimulator
            res = NativeQuantumSimulator.run_simulation(gates, qubit_count, shots)
            res["framework"] = "cirq (fallback)"
            res["error"] = str(e)
            return res
