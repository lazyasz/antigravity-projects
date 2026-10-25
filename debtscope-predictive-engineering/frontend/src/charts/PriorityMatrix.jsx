import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
} from 'recharts';

export default function PriorityMatrix({ data, onSelectPoint }) {
  if (!data || data.length === 0) return null;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 bg-[#130e24] border border-[#261c47] rounded-lg shadow-xl text-white text-xs space-y-1.5 min-w-[200px]">
          <p className="font-mono font-bold text-[#d8cdfa] truncate">{item.file || item.name || 'Component'}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/10">
            <div>
              <span className="text-[#88909e] block">Business Impact:</span>
              <span className="font-bold text-white">{item.business_impact || 7.5} / 10</span>
            </div>
            <div>
              <span className="text-[#88909e] block">Remediation Effort:</span>
              <span className="font-bold text-white">{item.remediation_effort || 4.2}h</span>
            </div>
            <div>
              <span className="text-[#88909e] block">Risk Score:</span>
              <span className="font-bold text-[#dc2626]">{item.risk_score || 82.0}</span>
            </div>
            <div>
              <span className="text-[#88909e] block">Quadrant:</span>
              <span className="font-bold text-[#b39ef2]">
                {(item.business_impact || 7) >= 5 && (item.remediation_effort || 4) <= 5 ? 'Quick Win' : 'Strategic'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-[360px]">
      {/* Quadrant Background Labels (Clean & Professional) */}
      <div className="absolute top-2 left-10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5b42a5]/60 pointer-events-none">
        Quick Wins (High Impact, Low Effort)
      </div>
      <div className="absolute top-2 right-4 text-[10px] font-mono font-bold uppercase tracking-wider text-[#b45309]/60 pointer-events-none">
        Strategic Refactoring (High Impact, High Effort)
      </div>
      <div className="absolute bottom-8 left-10 text-[10px] font-mono font-bold uppercase tracking-wider text-[#88909e]/60 pointer-events-none">
        Deprioritized (Low Impact, Low Effort)
      </div>
      <div className="absolute bottom-8 right-4 text-[10px] font-mono font-bold uppercase tracking-wider text-[#dc2626]/50 pointer-events-none">
        Technical Debt Trap (Low Impact, High Effort)
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 25, right: 25, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
          <XAxis
            type="number"
            dataKey="remediation_effort"
            name="Remediation Effort"
            unit="h"
            stroke="#88909e"
            fontSize={11}
            fontFamily="JetBrains Mono"
            domain={[0, 10]}
            label={{
              value: 'Remediation Effort (Hours) ->',
              position: 'insideBottom',
              offset: -12,
              fill: '#525866',
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="business_impact"
            name="Business Impact"
            stroke="#88909e"
            fontSize={11}
            fontFamily="JetBrains Mono"
            domain={[0, 10]}
            label={{
              value: 'Business Impact (0-10) ->',
              angle: -90,
              position: 'insideLeft',
              fill: '#525866',
              fontSize: 11,
              offset: 12,
            }}
          />
          <ZAxis type="number" dataKey="risk_score" range={[60, 260]} name="Risk Score" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#7048e8' }} />

          {/* Dividing Threshold Lines */}
          <ReferenceLine x={5} stroke="#d0d4de" strokeDasharray="4 4" strokeWidth={1.5} />
          <ReferenceLine y={5} stroke="#d0d4de" strokeDasharray="4 4" strokeWidth={1.5} />

          <Scatter
            name="Codebase Components"
            data={data}
            fill="#7048e8"
            onClick={(node) => onSelectPoint && onSelectPoint(node)}
            className="cursor-pointer"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
