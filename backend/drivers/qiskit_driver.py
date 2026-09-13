import time
import math
from typing import List, Dict, Any

class QiskitDriver:
    """
    Qiskit Statevector & Quantum Circuit Simulation Driver.
    Uses official Qiskit 2.x Statevector engine to simulate arbitrary circuits with exact math.
    """
    @staticmethod
    def execute_circuit(gates: List[Dict[str, Any]], qubit_count: int, shots: int = 1024) -> Dict[str, Any]:
        start_time = time.time()
        try:
            from qiskit import QuantumCircuit
            from qiskit.quantum_info import Statevector
            from qiskit import qasm2

            qc = QuantumCircuit(qubit_count)
            sorted_gates = sorted(gates, key=lambda g: g.get('step', 0))

            for g in sorted_gates:
                g_type = g.get('type')
                q = g.get('qubit')
                t_q = g.get('targetQubit')
                c2_q = g.get('control2Qubit')
                param = g.get('param')
                if param is None:
                    param = math.pi / 2.0

                if g_type == 'H': qc.h(q)
                elif g_type == 'X': qc.x(q)
                elif g_type == 'Y': qc.y(q)
                elif g_type == 'Z': qc.z(q)
                elif g_type == 'S': qc.s(q)
                elif g_type == 'T': qc.t(q)
                elif g_type == 'RX': qc.rx(param, q)
                elif g_type == 'RY': qc.ry(param, q)
                elif g_type == 'RZ': qc.rz(param, q)
                elif g_type == 'CNOT' and t_q is not None: qc.cx(q, t_q)
                elif g_type == 'CZ' and t_q is not None: qc.cz(q, t_q)
                elif g_type == 'SWAP' and t_q is not None: qc.swap(q, t_q)
                elif g_type == 'TOFFOLI' and t_q is not None and c2_q is not None: qc.ccx(q, c2_q, t_q)

            sv = Statevector.from_instruction(qc)
            
            num_states = 1 << qubit_count
            raw_data = sv.data
            state_vector = []
            probabilities = {}

            for i in range(num_states):
                # Standard bitstring representation with qubit 0 on the left
                bitstring = bin(i)[2:].zfill(qubit_count)
                # Map to Qiskit little-endian index
                qiskit_idx = int(bitstring[::-1], 2)
                amp = raw_data[qiskit_idx]
                state_vector.append({
                    "real": round(float(amp.real), 4),
                    "imag": round(float(amp.imag), 4)
                })
                prob = float(abs(amp) ** 2)
                probabilities[bitstring] = round(prob, 4)

            # Sample shots
            counts = {}
            if shots > 0:
                qiskit_counts = sv.sample_counts(shots=shots)
                for bit_rev, cnt in qiskit_counts.items():
                    # reverse bitstring to match standard display
                    counts[str(bit_rev)[::-1]] = int(cnt)

            try:
                qasm_str = qasm2.dumps(qc)
            except Exception:
                qasm_str = ""

            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return {
                "stateVector": state_vector,
                "probabilities": probabilities,
                "counts": counts,
                "executionTimeMs": elapsed_ms,
                "gateCount": len(gates),
                "depth": qc.depth(),
                "qasm": qasm_str,
                "framework": "qiskit",
                "fidelity": 1.0
            }
        except Exception as e:
            from backend.drivers.native_simulator import NativeQuantumSimulator
            res = NativeQuantumSimulator.run_simulation(gates, qubit_count, shots)
            res["framework"] = "qiskit (fallback)"
            res["error"] = str(e)
            return res
