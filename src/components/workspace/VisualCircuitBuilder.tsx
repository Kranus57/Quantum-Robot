import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { GateType, QuantumGate } from '../../types/quantum';
import { audioSynth } from '../../utils/audioSynth';
import { QasmImportModal } from './QasmImportModal';
import { Plus, Minus, Cpu, Code, Sliders } from 'lucide-react';

export const VisualCircuitBuilder: React.FC = () => {
  const { gates, qubitCount, setQubitCount, addGate, removeGate } = useQuantum();
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>('H');
  const [rotationAngle, setRotationAngle] = useState<number>(Math.PI / 2);
  const [cnotControl, setCnotControl] = useState<number | null>(null);
  const [toffoliControl1, setToffoliControl1] = useState<number | null>(null);
  const [toffoliControl2, setToffoliControl2] = useState<number | null>(null);
  const [isQasmModalOpen, setIsQasmModalOpen] = useState<boolean>(false);

  const numSteps = 8;

  const handleWireCellClick = (qubitIdx: number, stepIdx: number) => {
    if (!selectedGateType) return;

    audioSynth.playGatePlace();

    if (selectedGateType === 'CNOT' || selectedGateType === 'CZ') {
      if (cnotControl === null) {
        setCnotControl(qubitIdx);
      } else {
        if (cnotControl !== qubitIdx) {
          addGate({
            type: selectedGateType,
            qubit: cnotControl,
            targetQubit: qubitIdx,
            step: stepIdx
          });
        }
        setCnotControl(null);
      }
      return;
    }

    if (selectedGateType === 'TOFFOLI') {
      if (toffoliControl1 === null) {
        setToffoliControl1(qubitIdx);
      } else if (toffoliControl2 === null) {
        if (toffoliControl1 !== qubitIdx) setToffoliControl2(qubitIdx);
      } else {
        if (qubitIdx !== toffoliControl1 && qubitIdx !== toffoliControl2) {
          addGate({
            type: 'TOFFOLI',
            qubit: toffoliControl1,
            control2Qubit: toffoliControl2,
            targetQubit: qubitIdx,
            step: stepIdx
          });
        }
        setToffoliControl1(null);
        setToffoliControl2(null);
      }
      return;
    }

    addGate({
      type: selectedGateType,
      qubit: qubitIdx,
      param: ['RX', 'RY', 'RZ'].includes(selectedGateType) ? rotationAngle : undefined,
      step: stepIdx
    });
  };

  const getGateStyle = (type: GateType) => {
    switch (type) {
      case 'H': return 'gate-h';
      case 'X': return 'gate-x';
      case 'Y': return 'gate-y';
      case 'Z': return 'gate-z';
      case 'S':
      case 'T':
      case 'RX':
      case 'RY':
      case 'RZ': return 'gate-phase';
      case 'CNOT':
      case 'CZ': return 'gate-cnot';
      case 'TOFFOLI': return 'gate-toffoli';
      case 'MEASURE': return 'gate-measure';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div id="circuit-builder-panel" className="h-full flex flex-col bg-white overflow-hidden">
      {/* Gate Palette Bar */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Gates:</span>
          </span>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['H', 'X', 'Y', 'Z', 'S', 'T', 'RX', 'RY', 'RZ', 'CNOT', 'CZ', 'TOFFOLI', 'MEASURE'] as GateType[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGateType(g);
                  setCnotControl(null);
                  setToffoliControl1(null);
                  setToffoliControl2(null);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all ${
                  selectedGateType === g
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Rotation Gate Angle Parameter Slider */}
          {['RX', 'RY', 'RZ'].includes(selectedGateType || '') && (
            <div className="flex items-center space-x-2 bg-slate-100 px-2.5 py-1 rounded-lg border border-indigo-200 text-xs font-mono">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-indigo-700">θ: {(rotationAngle / Math.PI).toFixed(2)}π</span>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.1"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-20 accent-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Qubit Count & QASM Import */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsQasmModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-indigo-700 hover:bg-indigo-50 shadow-sm"
          >
            <Code className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import QASM</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-600 font-mono">Qubits ({qubitCount}):</span>
            <button
              onClick={() => setQubitCount(Math.max(1, qubitCount - 1))}
              disabled={qubitCount <= 1}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 shadow-sm"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setQubitCount(Math.min(5, qubitCount + 1))}
              disabled={qubitCount >= 5}
              className="p-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-qubit Placement Status Banner */}
      {(cnotControl !== null || toffoliControl1 !== null) && (
        <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-200 text-xs font-mono text-blue-800 flex items-center justify-between">
          <span>
            {cnotControl !== null && `CNOT Active: Control set to q[${cnotControl}]. Click target qubit wire on grid.`}
            {toffoliControl1 !== null && toffoliControl2 === null && `Toffoli Active: Control 1 set to q[${toffoliControl1}]. Click Control 2 qubit.`}
            {toffoliControl1 !== null && toffoliControl2 !== null && `Toffoli Active: Controls q[${toffoliControl1}], q[${toffoliControl2}]. Click Target qubit.`}
          </span>
          <button 
            onClick={() => { setCnotControl(null); setToffoliControl1(null); setToffoliControl2(null); }}
            className="underline hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Stave Circuit Canvas Grid */}
      <div className="flex-1 overflow-auto p-6 flex flex-col justify-center quantum-grid-bg relative select-none">
        {/* Step Column Headers */}
        <div className="flex items-center ml-24 mb-3 space-x-4 font-mono text-[11px] text-slate-500">
          {Array.from({ length: numSteps }, (_, stepIdx) => (
            <div key={stepIdx} className="w-12 text-center font-semibold">
              Step {stepIdx + 1}
            </div>
          ))}
        </div>

        {/* Qubit Wires */}
        <div className="space-y-6">
          {Array.from({ length: qubitCount }, (_, qubitIdx) => (
            <div key={qubitIdx} className="flex items-center relative">
              <div className="w-20 font-mono text-xs font-semibold text-blue-600 flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-sm text-slate-800">
                  q[{qubitIdx}] |0⟩
                </span>
              </div>

              <div className="absolute left-24 right-4 top-1/2 h-[2px] bg-slate-300 z-0" />

              <div className="flex items-center space-x-4 ml-4 z-10">
                {Array.from({ length: numSteps }, (_, stepIdx) => {
                  const gateOnCell = gates.find(g => (g.qubit === qubitIdx || g.targetQubit === qubitIdx || g.control2Qubit === qubitIdx) && g.step === stepIdx);

                  return (
                    <div
                      key={stepIdx}
                      onClick={() => handleWireCellClick(qubitIdx, stepIdx)}
                      className={`w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white/80 flex items-center justify-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50 shadow-sm ${
                        cnotControl === qubitIdx ? 'ring-2 ring-emerald-500' : ''
                      }`}
                    >
                      {gateOnCell && (
                        <div className="relative group w-full h-full flex items-center justify-center">
                          {gateOnCell.qubit === qubitIdx && !['CNOT', 'CZ', 'TOFFOLI'].includes(gateOnCell.type) && (
                            <div className={`w-9 h-9 rounded ${getGateStyle(gateOnCell.type)} text-xs flex flex-col items-center justify-center font-bold shadow-sm`}>
                              <span>{gateOnCell.type}</span>
                              {gateOnCell.param !== undefined && (
                                <span className="text-[9px] font-mono opacity-80">{(gateOnCell.param / Math.PI).toFixed(1)}π</span>
                              )}
                            </div>
                          )}

                          {gateOnCell.type === 'CNOT' && gateOnCell.qubit === qubitIdx && (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white shadow-sm" />
                          )}

                          {gateOnCell.type === 'CNOT' && gateOnCell.targetQubit === qubitIdx && (
                            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-xs">
                              ⊕
                            </div>
                          )}

                          {gateOnCell.type === 'TOFFOLI' && (gateOnCell.qubit === qubitIdx || gateOnCell.control2Qubit === qubitIdx) && (
                            <div className="w-4 h-4 rounded-full bg-amber-600 border border-white shadow-sm" />
                          )}
                          {gateOnCell.type === 'TOFFOLI' && gateOnCell.targetQubit === qubitIdx && (
                            <div className="w-8 h-8 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center text-amber-700 font-bold text-xs">
                              ⊕
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGate(gateOnCell.id);
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-600 border border-white text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-sm"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <QasmImportModal isOpen={isQasmModalOpen} onClose={() => setIsQasmModalOpen(false)} />
    </div>
  );
};
