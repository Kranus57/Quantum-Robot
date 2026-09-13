import time
import math
from typing import List, Dict, Any

class PennyLaneDriver:
    """
    PennyLane Quantum Machine Learning & Circuit Simulator Driver.
    Executes circuits on PennyLane's default.qubit analytical state engine.
    """
    @staticmethod
    def execute_circuit(gates: List[Dict[str, Any]], qubit_count: int, shots: int = 1024) -> Dict[str, Any]:
        start_time = time.time()
        try:
            import pennylane as qml
            import numpy as np

            dev = qml.device("default.qubit", wires=qubit_count)
            sorted_gates = sorted(gates, key=lambda g: g.get('step', 0))

            @qml.qnode(dev)
            def q_circuit():
                for g in sorted_gates:
                    g_type = g.get('type')
                    q = g.get('qubit')
                    t_q = g.get('targetQubit')
                    c2_q = g.get('control2Qubit')
                    param = g.get('param')
                    if param is None:
                        param = math.pi / 2.0

                    if g_type == 'H': qml.Hadamard(wires=q)
                    elif g_type == 'X': qml.PauliX(wires=q)
                    elif g_type == 'Y': qml.PauliY(wires=q)
                    elif g_type == 'Z': qml.PauliZ(wires=q)
                    elif g_type == 'S': qml.S(wires=q)
                    elif g_type == 'T': qml.T(wires=q)
                    elif g_type == 'RX': qml.RX(param, wires=q)
                    elif g_type == 'RY': qml.RY(param, wires=q)
                    elif g_type == 'RZ': qml.RZ(param, wires=q)
                    elif g_type == 'CNOT' and t_q is not None: qml.CNOT(wires=[q, t_q])
                    elif g_type == 'CZ' and t_q is not None: qml.CZ(wires=[q, t_q])
                    elif g_type == 'SWAP' and t_q is not None: qml.SWAP(wires=[q, t_q])
                    elif g_type == 'TOFFOLI' and t_q is not None and c2_q is not None: qml.Toffoli(wires=[q, c2_q, t_q])

                return qml.state(), qml.probs(wires=range(qubit_count))

            state, raw_probs = q_circuit()
            num_states = 1 << qubit_count
            state_vector = []
            probabilities = {}

            for i in range(num_states):
                bitstring = bin(i)[2:].zfill(qubit_count)
                amp = state[i]
                state_vector.append({
                    "real": round(float(amp.real), 4),
                    "imag": round(float(amp.imag), 4)
                })
                probabilities[bitstring] = round(float(raw_probs[i]), 4)

            # Sample shots
            counts = {}
            if shots > 0:
                p_sum = sum(raw_probs)
                p_norm = [float(p / p_sum) for p in raw_probs] if p_sum > 0 else [1.0 / num_states] * num_states
                samples = np.random.choice(num_states, size=shots, p=p_norm)
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
                "depth": max([g.get('step', 0) for g in gates], default=0) + 1 if gates else 0,
                "framework": "pennylane",
                "fidelity": 1.0
            }
        except Exception as e:
            from backend.drivers.native_simulator import NativeQuantumSimulator
            res = NativeQuantumSimulator.run_simulation(gates, qubit_count, shots)
            res["framework"] = "pennylane (fallback)"
            res["error"] = str(e)
            return res
