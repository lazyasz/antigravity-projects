import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import ChartTooltip from '../components/ui/ChartTooltip';

export default function RiskTrend({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 25, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="luminaRiskTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7048e8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#7048e8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
          <XAxis dataKey="sprint" stroke="#88909e" fontSize={11} tickLine={false} fontFamily="JetBrains Mono" />
          <YAxis stroke="#88909e" fontSize={11} tickLine={false} domain={[0, 100]} fontFamily="JetBrains Mono" />
          <Tooltip content={<ChartTooltip unit=" pts" />} />
          <Area
            type="monotone"
            dataKey="score"
            name="Risk Score"
            stroke="#7048e8"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#luminaRiskTrendGrad)"
            isAnimationActive={false}
            dot={{ r: 3.5, fill: '#7048e8', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#130e24', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
