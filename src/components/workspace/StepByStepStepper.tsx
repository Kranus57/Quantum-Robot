import React, { useEffect, useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Activity } from 'lucide-react';

export const StepByStepStepper: React.FC = () => {
  const { gates, qubitCount, setSimulationResult, framework, noiseModel } = useQuantum();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const maxStep = gates.length > 0 ? Math.max(...gates.map(g => g.step)) : 0;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= maxStep) {
            setIsPlaying(false);
            return maxStep;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxStep]);

  useEffect(() => {
    const activeGates = gates.filter(g => g.step <= currentStep);
    import('../../utils/quantumSimulator').then(({ simulateCircuit }) => {
      const partialRes = simulateCircuit(activeGates, qubitCount, 1024, framework, noiseModel);
      setSimulationResult(partialRes);
    });
  }, [currentStep, gates, qubitCount, framework, noiseModel]);

  return (
    <div id="execution-stepper" className="h-10 bg-white border-t border-slate-200 px-4 flex items-center justify-between font-mono text-xs select-none shadow-sm">
      <div className="flex items-center space-x-2 text-blue-600">
        <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="font-bold">Circuit Execution Stepper</span>
        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
          Step {currentStep + 1} of {maxStep + 1}
        </span>
      </div>

      <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
          className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white"
          title="Reset to Step 1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep <= 0}
          className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-40"
          title="Previous Step"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700"
          title={isPlaying ? 'Pause Stepper' : 'Play Stepper'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </button>

        <button
          onClick={() => setCurrentStep(Math.min(maxStep, currentStep + 1))}
          disabled={currentStep >= maxStep}
          className="p-1 rounded text-slate-600 hover:text-slate-900 disabled:opacity-40"
          title="Next Step"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="text-[10px] text-slate-500">
        Column-by-column Quantum StateVector & Bloch Evolution
      </div>
    </div>
  );
};
