/**
 * Member 4: Adesh - Executive Overview Dashboard Component
 * Module: dashboard.jsx
 * Description: Executive KPI health cards, risk distributions, and telemetry overview.
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, CheckCircle2, TrendingUp, Layers } from 'lucide-react';

export const ExecutiveDashboard = ({ metrics = {} }) => {
  const [healthScore, setHealthScore] = useState(metrics.healthScore || 84.5);
  const [totalDebtHours, setTotalDebtHours] = useState(metrics.totalDebtHours || 142);
  const [criticalHotspots, setCriticalHotspots] = useState(metrics.criticalHotspots || 7);
  const [predictedDefects, setPredictedDefects] = useState(metrics.predictedDefects || 3.8);

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Layers className="h-8 w-8 text-indigo-400" />
          DebtScope Executive Intelligence
        </h1>
        <p className="text-slate-400 mt-1">Real-time telemetry, predictive defect analytics & 5D priority matrix.</p>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Health Index</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2">{healthScore} / 100</div>
          <p className="text-xs text-emerald-400 mt-1">+2.4% from last sprint</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Total Debt Hours</span>
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2">{totalDebtHours} hrs</div>
          <p className="text-xs text-amber-400 mt-1">Est. 3.5 developer sprints</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Active Hotspots</span>
            <ShieldAlert className="h-5 w-5 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2">{criticalHotspots} files</div>
          <p className="text-xs text-rose-400 mt-1">High churn + high complexity</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Predicted Defect Rate</span>
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mt-2">{predictedDefects}%</div>
          <p className="text-xs text-cyan-400 mt-1">Random Forest ML forecast</p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
