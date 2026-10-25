import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ChartTooltip from '../components/ui/ChartTooltip';

export default function RiskDistribution({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          stroke="#ffffff"
          strokeWidth={2}
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip unit="%" />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: '#525866', fontFamily: 'JetBrains Mono' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
