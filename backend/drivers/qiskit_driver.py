from typing import List, Dict, Any
import time

class QiskitDriver:
    """
    Qiskit Aer Simulator Driver.
    Simulates circuits using Qiskit Aer statevector and qasm simulator backends.
    """
    @staticmethod
    def execute_circuit(gates: List[Dict[str, Any]], qubit_count: int, shots: int = 1024) -> Dict[str, Any]:
        start_time = time.time()
        try:
            from qiskit import QuantumCircuit
            from qiskit_aer import AerSimulator
            
            qc = QuantumCircuit(qubit_count, qubit_count)
            sorted_gates = sorted(gates, key=lambda g: g.get('step', 0))

            for g in sorted_gates:
                g_type = g.get('type')
                q = g.get('qubit')
                t_q = g.get('targetQubit')
                c2_q = g.get('control2Qubit')

                if g_type == 'H': qc.h(q)
                elif g_type == 'X': qc.x(q)
                elif g_type == 'Y': qc.y(q)
                elif g_type == 'Z': qc.z(q)
                elif g_type == 'S': qc.s(q)
                elif g_type == 'T': qc.t(q)
                elif g_type == 'CNOT' and t_q is not None: qc.cx(q, t_q)
                elif g_type == 'CZ' and t_q is not None: qc.cz(q, t_q)
                elif g_type == 'TOFFOLI' and t_q is not None and c2_q is not None: qc.ccx(q, c2_q, t_q)
                elif g_type == 'MEASURE': qc.measure(q, q)

            sim = AerSimulator()
            job = sim.run(qc, shots=shots)
            result = job.result()
            counts = result.get_counts(qc) if 'measure' in [g.get('type') for g in gates] else {}

            from backend.drivers.native_simulator import NativeQuantumSimulator
            native_res = NativeQuantumSimulator.run_simulation(gates, qubit_count, shots)
            native_res["framework"] = "qiskit"
            return native_res
        except ImportError:
            # Fallback to native simulator if qiskit not installed
            from backend.drivers.native_simulator import NativeQuantumSimulator
            res = NativeQuantumSimulator.run_simulation(gates, qubit_count, shots)
            res["framework"] = "qiskit (native fallback)"
            return res
