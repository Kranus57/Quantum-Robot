import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { QuantumGate, GateType } from '../../types/quantum';
import { X, Code, CheckCircle, AlertCircle } from 'lucide-react';

export const QasmImportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setGates, setQubitCount, runSimulation } = useQuantum();
  const [qasmInput, setQasmInput] = useState<string>(`OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
cx q[0],q[1];
cx q[1],q[2];
measure q[0] -> c[0];`);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      setParseError(null);
      const lines = qasmInput.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      
      let numQubits = 3;
      const newGates: QuantumGate[] = [];
      let stepCounter = 0;

      for (const line of lines) {
        if (line.startsWith('qreg')) {
          const match = line.match(/qreg\s+q\[(\d+)\]/);
          if (match) {
            numQubits = parseInt(match[1], 10);
          }
        } else if (line.startsWith('h ')) {
          const match = line.match(/h\s+q\[(\d+)\]/);
          if (match) newGates.push({ id: 'qg_' + Math.random(), type: 'H', qubit: parseInt(match[1], 10), step: stepCounter++ });
        } else if (line.startsWith('x ')) {
          const match = line.match(/x\s+q\[(\d+)\]/);
          if (match) newGates.push({ id: 'qg_' + Math.random(), type: 'X', qubit: parseInt(match[1], 10), step: stepCounter++ });
        } else if (line.startsWith('y ')) {
          const match = line.match(/y\s+q\[(\d+)\]/);
          if (match) newGates.push({ id: 'qg_' + Math.random(), type: 'Y', qubit: parseInt(match[1], 10), step: stepCounter++ });
        } else if (line.startsWith('z ')) {
          const match = line.match(/z\s+q\[(\d+)\]/);
          if (match) newGates.push({ id: 'qg_' + Math.random(), type: 'Z', qubit: parseInt(match[1], 10), step: stepCounter++ });
        } else if (line.startsWith('cx ')) {
          const match = line.match(/cx\s+q\[(\d+)\]\s*,\s*q\[(\d+)\]/);
          if (match) {
            newGates.push({
              id: 'qg_' + Math.random(),
              type: 'CNOT',
              qubit: parseInt(match[1], 10),
              targetQubit: parseInt(match[2], 10),
              step: stepCounter++
            });
          }
        } else if (line.startsWith('measure')) {
          const match = line.match(/measure\s+q\[(\d+)\]/);
          if (match) newGates.push({ id: 'qg_' + Math.random(), type: 'MEASURE', qubit: parseInt(match[1], 10), step: stepCounter++ });
        }
      }

      setQubitCount(numQubits);
      setGates(newGates);
      runSimulation();
      onClose();
    } catch (err: unknown) {
      setParseError('Failed to parse OpenQASM 2.0 code format. Ensure syntax matches standard qelib1.inc specification.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-quantum-panel border border-quantum-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 bg-quantum-dark border-b border-quantum-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-quantum-magenta/20 border border-quantum-magenta/40 text-quantum-magenta flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Import OpenQASM 2.0 Code</h3>
              <p className="text-[11px] text-gray-400">Paste QASM text to populate visual circuit builder</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-gray-300">
          {parseError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <textarea
            value={qasmInput}
            onChange={(e) => setQasmInput(e.target.value)}
            rows={8}
            spellCheck={false}
            className="w-full bg-[#070A12] border border-quantum-border p-3 rounded-xl font-mono text-xs text-cyan-300 leading-relaxed focus:outline-none focus:border-quantum-cyan"
          />
        </div>

        <div className="p-4 bg-quantum-dark border-t border-quantum-border flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-quantum-card border border-quantum-border text-xs text-gray-300 hover:text-white">
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-1.5 rounded-lg bg-quantum-cyan text-black font-bold text-xs shadow-cyan-glow hover:opacity-90 flex items-center space-x-1.5"
          >
            <CheckCircle className="w-4 h-4 fill-black text-quantum-cyan" />
            <span>Import Circuit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
