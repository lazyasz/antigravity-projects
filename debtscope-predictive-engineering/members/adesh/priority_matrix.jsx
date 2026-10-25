/**
 * Member 4: Adesh - Interactive 4-Quadrant Priority Matrix
 * Module: priority_matrix.jsx
 * Description: Recharts 2D scatterplot plotting Business Value (Y-Axis) vs Remediation Effort (X-Axis).
 */

import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

export const PriorityMatrix = ({ data = [] }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');

  const defaultData = [
    { name: 'payment_orchestrator.py', effort: 25, value: 88, quadrant: 'QUICK_WIN', fill: '#10b981' },
    { name: 'auth_middleware.py', effort: 70, value: 85, quadrant: 'STRATEGIC_REFACTOR', fill: '#f59e0b' },
    { name: 'date_formatter.py', effort: 20, value: 35, quadrant: 'OPPORTUNISTIC', fill: '#3b82f6' },
    { name: 'legacy_exporter.py', effort: 80, value: 30, quadrant: 'DEPRIORITIZED', fill: '#6b7280' },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Actionable ROI Priority Matrix</h2>
          <p className="text-sm text-slate-400">Segments codebase technical debt into 4 ROI decision quadrants.</p>
        </div>
      </div>

      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="effort" name="Remediation Effort" unit=" pts" domain={[0, 100]} stroke="#94a3b8" />
            <YAxis type="number" dataKey="value" name="Business Value / Risk" unit=" pts" domain={[0, 100]} stroke="#94a3b8" />
            <ReferenceLine x={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Effort Threshold (40)', fill: '#ef4444', position: 'top' }} />
            <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 4" label={{ value: 'Value Threshold (60)', fill: '#3b82f6', position: 'right' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }} />
            <Scatter name="Debt Items" data={chartData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
          <span className="text-emerald-400 font-semibold block text-sm">Quick Wins (Top Priority)</span>
          <span className="text-xs text-slate-400">High Value, Low Effort</span>
        </div>
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg">
          <span className="text-amber-400 font-semibold block text-sm">Strategic Refactoring</span>
          <span className="text-xs text-slate-400">High Value, High Effort</span>
        </div>
        <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg">
          <span className="text-blue-400 font-semibold block text-sm">Opportunistic</span>
          <span className="text-xs text-slate-400">Low Value, Low Effort</span>
        </div>
        <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
          <span className="text-slate-400 font-semibold block text-sm">Deprioritized</span>
          <span className="text-xs text-slate-500">Low Value, High Effort</span>
        </div>
      </div>
    </div>
  );
};

export default PriorityMatrix;
