import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { calculateQosphereNodes } from '../../utils/quantumSimulator';
import { Network, Sparkles } from 'lucide-react';

export const QosphereVisualizer: React.FC = () => {
  const { simulationResult, qubitCount } = useQuantum();

  const stateVector = simulationResult?.stateVector || [
    { real: 1, imag: 0 },
    { real: 0, imag: 0 }
  ];

  const center = 110;
  const nodes = calculateQosphereNodes(stateVector, qubitCount, 85);

  const getPhaseColor = (deg: number) => {
    // HSL color wheel for phase angles 0-360 degrees
    return `hsl(${deg}, 90%, 60%)`;
  };

  return (
    <div className="h-64 flex flex-col bg-quantum-panel/90 border-b border-quantum-border overflow-hidden relative">
      {/* Header Bar */}
      <div className="p-2.5 bg-quantum-dark/95 border-b border-quantum-border flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-quantum-magenta">
          <Network className="w-4 h-4 text-quantum-magenta" />
          <span>Multi-Qubit Qosphere Visualizer</span>
        </div>
        <span className="text-[10px] font-mono text-pink-300">Entanglement State Mapper</span>
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-2 bg-[#070A14]">
        <svg width="220" height="220" className="overflow-visible">
          {/* Concentric Hamming Weight Rings */}
          {Array.from({ length: qubitCount + 1 }, (_, h) => {
            const r = (85 * (h + 1)) / (qubitCount + 1);
            return (
              <circle
                key={h}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Entanglement Correlation Links between non-zero states */}
          {nodes.filter(n => n.probability > 0.01).map((n1, idx1) => (
            nodes.filter(n => n.probability > 0.01).map((n2, idx2) => {
              if (idx1 < idx2) {
                return (
                  <line
                    key={`${idx1}-${idx2}`}
                    x1={center + n1.x}
                    y1={center + n1.y}
                    x2={center + n2.x}
                    y2={center + n2.y}
                    stroke="rgba(236, 72, 153, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                );
              }
              return null;
            })
          ))}

          {/* Qosphere State Nodes */}
          {nodes.map((node) => {
            const cx = center + node.x;
            const cy = center + node.y;
            const nodeRadius = Math.max(6, Math.sqrt(node.probability) * 16);
            const isNonZero = node.probability > 0.01;

            return (
              <g key={node.bitstring} className="cursor-pointer group">
                {/* Glowing Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={nodeRadius + 2}
                  fill="none"
                  stroke={isNonZero ? getPhaseColor(node.phaseDeg) : '#374151'}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Node Fill */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={nodeRadius}
                  fill={isNonZero ? getPhaseColor(node.phaseDeg) : '#1F293D'}
                  opacity={isNonZero ? 0.85 : 0.4}
                />

                {/* Bitstring Label */}
                <text
                  x={cx}
                  y={cy + nodeRadius + 10}
                  textAnchor="middle"
                  fill={isNonZero ? '#EC4899' : '#6B7280'}
                  fontSize="9"
                  fontFamily="Fira Code"
                  fontWeight="bold"
                >
                  |{node.bitstring}⟩
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Legend Overlay */}
        <div className="absolute top-2 right-2 text-[9px] font-mono space-y-1 bg-quantum-dark/80 p-1.5 rounded border border-quantum-border/60">
          <div className="text-pink-400 font-bold flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Size = |α|² Prob</span>
          </div>
          <div className="text-cyan-400 font-bold">Color = Phase Angle</div>
        </div>
      </div>
    </div>
  );
};
