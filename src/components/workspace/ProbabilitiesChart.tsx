import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

export const ProbabilitiesChart: React.FC = () => {
  const { simulationResult } = useQuantum();

  const probabilities = simulationResult?.probabilities || { '00': 1 };
  const counts = simulationResult?.counts || { '00': 1024 };

  const data = Object.entries(probabilities).map(([bitstring, prob]) => ({
    state: `|${bitstring}⟩`,
    probability: Math.round(prob * 1000) / 10,
    shots: counts[bitstring] || 0,
  }));

  const colors = ['#2563EB', '#4F46E5', '#0284C7', '#059669', '#D97706', '#E11D48'];

  return (
    <div className="h-56 flex flex-col bg-white border-b border-slate-200 overflow-hidden shadow-sm">
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
          <BarChart2 className="w-4 h-4" />
          <span>Measurement Probabilities Distribution</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">1024 Shots Simulated</span>
      </div>

      <div className="flex-1 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="state" stroke="#64748B" tick={{ fill: '#2563EB', fontSize: 11, fontFamily: 'Fira Code' }} />
            <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10 }} unit="%" domain={[0, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white p-2.5 rounded border border-slate-200 text-xs font-mono shadow-md">
                      <div className="text-blue-600 font-bold">{item.state}</div>
                      <div className="text-slate-800">Probability: {item.probability}%</div>
                      <div className="text-slate-500">Shots: {item.shots} / 1024</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
