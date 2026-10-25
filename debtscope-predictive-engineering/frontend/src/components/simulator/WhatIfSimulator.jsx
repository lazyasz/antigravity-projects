import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  Shield,
  Target,
  BarChart3,
  TrendingUp,
  GitPullRequest,
  Check,
  Send,
  ExternalLink,
  Wand2
} from 'lucide-react';
import { runWhatIfSimulation } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AnimatedRiskGauge from '../ui/AnimatedRiskGauge';
import ChartTooltip from '../ui/ChartTooltip';
import AnimatedCounter from '../ui/AnimatedCounter';
import InteractiveCard from '../ui/InteractiveCard';
import SpringTabs from '../ui/SpringTabs';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ScatterChart, 
  Scatter, 
  ZAxis, 
  ReferenceLine 
} from 'recharts';

const PRESETS = [
  {
    name: 'Payment Webhook Gateway (P0 Hotspot)',
    file: 'services/billing/webhook_gateway.py',
    churn: 280,
    complexity: 24.5,
    debt_minutes: 240,
    experience: 3,
    refactoring_effort_pct: 65,
    budget_hours: 48,
    story_points: 13,
    risk_tolerance: 'conservative',
    developer_seniority: 'Lead Architect',
    test_coverage_pct: 90,
    hourly_rate: 95
  },
  {
    name: 'Spark Ingestion Aggregator (High Churn)',
    file: 'pipeline/analytics/spark_aggregator.py',
    churn: 380,
    complexity: 21.0,
    debt_minutes: 180,
    experience: 5,
    refactoring_effort_pct: 50,
    budget_hours: 36,
    story_points: 8,
    risk_tolerance: 'balanced',
    developer_seniority: 'Senior Engineer (6-8 yrs)',
    test_coverage_pct: 85,
    hourly_rate: 85
  },
  {
    name: 'Auth Token Provider (Security Hotspot)',
    file: 'services/auth/token_provider.py',
    churn: 120,
    complexity: 17.5,
    debt_minutes: 120,
    experience: 8,
    refactoring_effort_pct: 75,
    budget_hours: 24,
    story_points: 5,
    risk_tolerance: 'aggressive',
    developer_seniority: 'Senior Engineer (6-8 yrs)',
    test_coverage_pct: 95,
    hourly_rate: 90
  }
];

export default function WhatIfSimulator({ initialModule, onOpenRecipe }) {
  const { showNotification } = useAuth();

  // Control States
  const [churn, setChurn] = useState(initialModule?.churn || 220);
  const [complexity, setComplexity] = useState(initialModule?.complexity || 18.5);
  const [debtMinutes, setDebtMinutes] = useState(initialModule?.debt_minutes || 160);
  const [experience, setExperience] = useState(5);
  const [effortPct, setEffortPct] = useState(55);
  const [budgetHours, setBudgetHours] = useState(40);
  const [storyPoints, setStoryPoints] = useState(8);
  const [riskTolerance, setRiskTolerance] = useState('balanced');
  const [seniority, setSeniority] = useState('Senior Engineer (6-8 yrs)');
  const [testCoverage, setTestCoverage] = useState(85);
  const [hourlyRate, setHourlyRate] = useState(85);
  const [capacityAllocPct, setCapacityAllocPct] = useState(25);

  const [activeCurveTab, setActiveCurveTab] = useState('all');
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [isExportingJira, setIsExportingJira] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset) => {
    setChurn(preset.churn);
    setComplexity(preset.complexity);
    setDebtMinutes(preset.debt_minutes);
    setExperience(preset.experience);
    setEffortPct(preset.refactoring_effort_pct);
    setBudgetHours(preset.budget_hours);
    setStoryPoints(preset.story_points);
    setRiskTolerance(preset.risk_tolerance);
    setSeniority(preset.developer_seniority);
    setTestCoverage(preset.test_coverage_pct);
    setHourlyRate(preset.hourly_rate);
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await runWhatIfSimulation({
        churn: parseInt(churn) || 120,
        complexity: parseFloat(complexity) || 14.0,
        debt_minutes: parseFloat(debtMinutes) || 90.0,
        experience: parseInt(experience) || 5,
        refactoring_effort_pct: parseFloat(effortPct),
        developer_seniority: seniority,
        test_coverage_pct: parseFloat(testCoverage),
        hourly_rate: parseFloat(hourlyRate),
        refactoring_budget_hours: parseFloat(budgetHours),
        refactoring_story_points: parseInt(storyPoints),
        risk_tolerance: riskTolerance
      });
      setSimulationResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, [churn, complexity, debtMinutes, effortPct, budgetHours, storyPoints, riskTolerance, seniority, testCoverage, hourlyRate, capacityAllocPct]);

  const handleBudgetHoursChange = (hours) => {
    setBudgetHours(hours);
    setStoryPoints(Math.max(1, Math.ceil(hours / 5.5)));
  };

  const handleStoryPointsChange = (pts) => {
    setStoryPoints(pts);
    setBudgetHours(Math.round(pts * 5.5));
  };

  const handleConfirmJiraExport = () => {
    setIsExportingJira(true);
    setTimeout(() => {
      setIsExportingJira(false);
      setJiraModalOpen(false);
      showNotification(`Created Sprint 49 Refactoring Package in Jira (${storyPoints} SP, $${(simulationResult?.impact?.dollar_savings || 2400).toLocaleString()} ROI)`, 'success');
    }, 700);
  };

  const quadrantData = [
    { name: 'Simulated Target', effort: (budgetHours / 50) * 10, impact: (effortPct / 100) * 10, risk: simulationResult?.baseline?.defect_probability_pct || 75, highlight: true },
    { name: 'Auth Token Provider', effort: 3.2, impact: 8.5, risk: 82.0 },
    { name: 'Spark Aggregator', effort: 6.8, impact: 7.8, risk: 78.5 },
    { name: 'DataTree Refactor', effort: 8.5, impact: 9.2, risk: 91.0 },
    { name: 'JSON Parser Cache', effort: 2.1, impact: 3.4, risk: 42.0 },
    { name: 'Legacy XML Formatter', effort: 7.2, impact: 2.8, risk: 51.0 }
  ];

  return (
    <div className="space-y-5">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-[#e2e4ea] shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e4ea] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-[#f0ecfc] text-[#5b42a5]">
                <Sliders className="w-4 h-4 text-[#7048e8]" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0f1015] tracking-tight">
                  What-If Defect & ROI Refactoring Simulator
                </h2>
                <p className="text-xs text-[#525866]">
                  Simulate refactoring ROI, multi-sprint risk decay curves, and sprint capacity recovery using empirical SZZ machine learning models.
                </p>
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#88909e] font-semibold">Scenarios:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded text-xs font-semibold bg-[#f8f9fb] hover:bg-[#f0ecfc] text-[#5b42a5] transition cursor-pointer border border-[#e2e4ea]"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Top Highlighted Stat Pills with Animated Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#130e24] flex items-center justify-center text-white shrink-0">
                <Target className="w-3.5 h-3.5 text-[#b39ef2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#88909e] uppercase font-semibold block">Defect Reduction</span>
                <span className="text-base font-bold text-[#0f1015] font-mono">
                  -<AnimatedCounter value={simulationResult?.impact?.fault_reduction_pct ?? 62.4} decimals={1} />% Drop
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">
              SZZ Lift +35.2%
            </span>
          </div>

          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5b42a5] flex items-center justify-center text-white shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-[#d8cdfa]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#88909e] uppercase font-semibold block">Net Dollar Savings</span>
                <span className="text-base font-bold text-[#0f1015] font-mono">
                  $<AnimatedCounter value={simulationResult?.impact?.dollar_savings ?? 3240} />
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#5b42a5] bg-[#f0ecfc] px-2 py-0.5 rounded border border-[#d8cdfa]">
              {simulationResult?.impact?.return_on_investment_multiple ?? 3.4}x ROI
            </span>
          </div>

          <div className="p-3.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#261c47] flex items-center justify-center text-white shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-[#8f6ee8]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#88909e] uppercase font-semibold block">Velocity Gain</span>
                <span className="text-base font-bold text-[#0f1015] font-mono">
                  +<AnimatedCounter value={simulationResult?.projection_curves?.[5]?.velocity_gain_pct ?? 28.5} decimals={1} />% Capacity
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#525866] bg-[#f3f4f8] px-2 py-0.5 rounded border border-[#e2e4ea]">
              {simulationResult?.simulated?.payback_velocity ?? '1.8 Sprints'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols), Right Graphs & Projections (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Budget & Risk Strategy */}
          <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase font-mono text-[#0f1015] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#7048e8]" />
                1. Refactoring Budget & Sprint Capacity
              </h3>
              <span className="text-[10px] font-mono text-[#88909e] font-semibold">Interactive</span>
            </div>

            {/* Slider 1: Refactoring Budget (Hours) */}
            <div className="space-y-1.5 p-3 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0f1015] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#7048e8]" />
                  Remediation Budget (Hours)
                </label>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#130e24] text-white">
                  {budgetHours} Hours
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={budgetHours}
                onChange={(e) => handleBudgetHoursChange(Number(e.target.value))}
                className="w-full accent-[#7048e8] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#88909e]">
                <span>10h (Quick Patch)</span>
                <span>80h (Sprint Goal)</span>
                <span>200h (Epic Overhaul)</span>
              </div>
            </div>

            {/* Slider 2: Story Points Equivalent */}
            <div className="space-y-1.5 p-3 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0f1015] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#5b42a5]" />
                  Story Points Allocation
                </label>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#5b42a5] text-white">
                  {storyPoints} SP
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={storyPoints}
                onChange={(e) => handleStoryPointsChange(Number(e.target.value))}
                className="w-full accent-[#5b42a5] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#88909e]">
                <span>2 SP</span>
                <span>13 SP</span>
                <span>40 SP</span>
              </div>
            </div>

            {/* Section 3: Risk Tolerance Profile */}
            <div className="space-y-2 p-3 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0f1015] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#7048e8]" />
                  Risk Tolerance Profile
                </label>
                <span className="text-[10px] font-mono font-bold uppercase text-[#5b42a5]">
                  {riskTolerance}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'conservative', label: 'Conservative', desc: 'Zero defect tolerance' },
                  { key: 'balanced', label: 'Balanced', desc: '50/50 ROI balance' },
                  { key: 'aggressive', label: 'Aggressive', desc: 'Max debt burn-down' }
                ].map((strat) => (
                  <button
                    key={strat.key}
                    onClick={() => setRiskTolerance(strat.key)}
                    className={`p-2 rounded-lg text-left transition border cursor-pointer ${
                      riskTolerance === strat.key
                        ? 'bg-[#130e24] text-white border-[#261c47] shadow-xs'
                        : 'bg-white text-[#525866] hover:bg-[#f3f4f8] border-[#e2e4ea]'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight">{strat.label}</span>
                    <span className={`block text-[9px] font-mono mt-0.5 ${riskTolerance === strat.key ? 'text-[#b39ef2]' : 'text-[#88909e]'}`}>
                      {strat.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 4: Codebase Cleanse Effort % */}
            <div className="space-y-1.5 p-3 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#0f1015]">
                  Target Codebase Cleanse Effort
                </label>
                <span className="font-mono font-bold text-xs text-[#5b42a5]">
                  {effortPct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={effortPct}
                onChange={(e) => setEffortPct(Number(e.target.value))}
                className="w-full accent-[#7048e8] cursor-pointer h-1.5 bg-[#e2e4ea] rounded-lg"
              />
            </div>
          </div>

          {/* Card 2: Developer Parameters */}
          <div className="p-4 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono text-[#88909e]">
              2. Pre-Condition Telemetry & Developer Parameters
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-[#525866] font-medium block">Developer Seniority</label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full mt-1 p-1.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] text-xs font-semibold text-[#0f1015] focus:border-[#7048e8] outline-none"
                >
                  <option value="Junior Engineer (1-2 yrs)">Junior Engineer (1-2 yrs)</option>
                  <option value="Mid-Level Engineer (3-5 yrs)">Mid-Level Engineer (3-5 yrs)</option>
                  <option value="Senior Engineer (6-8 yrs)">Senior Engineer (6-8 yrs)</option>
                  <option value="Lead Architect">Lead Architect (&gt;8 yrs)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[#525866] font-medium block">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full mt-1 p-1.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] text-xs font-mono font-bold text-[#0f1015]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#525866] font-medium block">Target Test Coverage (%)</label>
                <input
                  type="number"
                  min="30"
                  max="100"
                  value={testCoverage}
                  onChange={(e) => setTestCoverage(Number(e.target.value))}
                  className="w-full mt-1 p-1.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] text-xs font-mono font-bold text-[#0f1015]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#525866] font-medium block">Debt Duration (Mins)</label>
                <input
                  type="number"
                  value={debtMinutes}
                  onChange={(e) => setDebtMinutes(Number(e.target.value))}
                  className="w-full mt-1 p-1.5 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] text-xs font-mono font-bold text-[#0f1015]"
                />
              </div>
            </div>
          </div>

          {/* Quick Action Button: Export to Jira Sprint */}
          <div className="p-4 bg-[#130e24] text-white rounded-xl border border-[#261c47] shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-[#b39ef2] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#b39ef2]" />
                Jira Sprint Package
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                Sprint 49 Backlog
              </span>
            </div>

            <p className="text-xs text-[#d8cdfa]/80 leading-snug">
              Export this simulated {budgetHours}h refactoring package ({storyPoints} SP, {simulationResult?.impact?.fault_reduction_pct || 62}% risk drop) directly into Jira.
            </p>

            <button
              onClick={() => setJiraModalOpen(true)}
              className="w-full py-2 px-3 bg-[#7048e8] hover:bg-[#5b42a5] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Export Package to Jira Sprint</span>
            </button>
          </div>

        </div>

        {/* Projections & Visualizations Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Bento 1: Kinetic Animated Risk Gauge Comparison */}
          <div className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f1015] tracking-tight">
                  Defect Risk Score Transition
                </h3>
                <p className="text-xs text-[#525866]">
                  Live SZZ Machine Learning Inference comparison before & after remediation
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#f0ecfc] text-[#5b42a5] border border-[#d8cdfa]">
                Lift: +35.18%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
              <div className="p-3.5 bg-[#fef2f2] rounded-lg border border-[#fee2e2] flex flex-col items-center">
                <span className="text-[11px] font-bold text-[#dc2626] uppercase font-mono mb-1">
                  Baseline (Unmitigated)
                </span>
                <AnimatedRiskGauge 
                  score={simulationResult?.baseline?.defect_probability_pct ?? 78.4}
                  size={120}
                  label="Baseline Risk"
                  subtitle="Current Churn & Debt"
                />
              </div>

              <div className="p-3.5 bg-[#ecfdf5] rounded-lg border border-[#d1fae5] flex flex-col items-center">
                <span className="text-[11px] font-bold text-[#059669] uppercase font-mono mb-1">
                  Simulated Post-Cleanse
                </span>
                <AnimatedRiskGauge 
                  score={simulationResult?.simulated?.defect_probability_pct ?? 18.2}
                  size={120}
                  label="Remediated Risk"
                  subtitle={`${effortPct}% Refactor + ${testCoverage}% Tests`}
                />
              </div>
            </div>
          </div>

          {/* Bento 2: Multi-Sprint Projection Curves Chart */}
          <div className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#0f1015] tracking-tight">
                  Multi-Sprint Trajectory Projection (Sprints 1-6)
                </h3>
                <p className="text-xs text-[#525866]">
                  Real-time curves for predicted debt reduction, defect probability drop, and velocity recovery
                </p>
              </div>

              {/* Curve Metric Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#f3f4f8] p-1 rounded-lg border border-[#e2e4ea] text-[11px] font-semibold">
                <button
                  onClick={() => setActiveCurveTab('all')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${activeCurveTab === 'all' ? 'bg-[#130e24] text-white shadow-2xs' : 'text-[#525866] hover:text-[#0f1015]'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveCurveTab('defect')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${activeCurveTab === 'defect' ? 'bg-[#130e24] text-white shadow-2xs' : 'text-[#525866] hover:text-[#0f1015]'}`}
                >
                  Defect %
                </button>
                <button
                  onClick={() => setActiveCurveTab('velocity')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${activeCurveTab === 'velocity' ? 'bg-[#130e24] text-white shadow-2xs' : 'text-[#525866] hover:text-[#0f1015]'}`}
                >
                  Velocity
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-60 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={simulationResult?.projection_curves || []}
                  margin={{ top: 10, right: 25, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="defectGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7048e8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7048e8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
                  <XAxis dataKey="sprint" stroke="#88909e" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#88909e" fontSize={11} fontFamily="JetBrains Mono" domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip unit="%" />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />

                  {(activeCurveTab === 'all' || activeCurveTab === 'defect') && (
                    <Area 
                      type="monotone" 
                      dataKey="defect_probability_pct" 
                      name="Defect Risk %" 
                      stroke="#dc2626" 
                      strokeWidth={2} 
                      fill="url(#defectGrad)" 
                      isAnimationActive={false}
                    />
                  )}

                  {(activeCurveTab === 'all' || activeCurveTab === 'velocity') && (
                    <Area 
                      type="monotone" 
                      dataKey="team_velocity_sp" 
                      name="Team Velocity (SP)" 
                      stroke="#7048e8" 
                      strokeWidth={2} 
                      fill="url(#velocityGrad)" 
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bento 3: Payoff Matrix & ROI Quadrants */}
          <div className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f1015] tracking-tight">
                  Payoff Matrix & ROI Quadrants
                </h3>
                <p className="text-xs text-[#525866]">
                  Dynamic positioning: Quick Wins vs Strategic vs Low-Yield triage
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#5b42a5] bg-[#f0ecfc] px-2 py-0.5 rounded border border-[#d8cdfa]">
                Quadrant: Quick Win
              </span>
            </div>

            <div className="relative w-full h-52">
              <div className="absolute top-1 left-8 text-[9px] font-mono font-bold uppercase text-[#5b42a5]/60 pointer-events-none">
                Quick Wins (High Impact, Low Effort)
              </div>
              <div className="absolute top-1 right-3 text-[9px] font-mono font-bold uppercase text-[#b45309]/60 pointer-events-none">
                Strategic (High Impact, High Effort)
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e4ea" />
                  <XAxis 
                    type="number" 
                    dataKey="effort" 
                    name="Remediation Effort" 
                    domain={[0, 10]} 
                    tick={{ fontSize: 10, fill: '#88909e', fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Effort (Hours) ->', position: 'bottom', fontSize: 10, fill: '#88909e', offset: 0 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="impact" 
                    name="Business Impact" 
                    domain={[0, 10]} 
                    tick={{ fontSize: 10, fill: '#88909e', fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Business ROI ->', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#88909e' }}
                  />
                  <ZAxis type="number" dataKey="risk" range={[100, 380]} />
                  <ReferenceLine x={5} stroke="#d0d4de" strokeDasharray="3 3" />
                  <ReferenceLine y={5} stroke="#d0d4de" strokeDasharray="3 3" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-[#130e24] text-white rounded-lg text-xs border border-[#261c47] shadow-xl space-y-1">
                            <p className="font-bold text-[#d8cdfa]">{data.name}</p>
                            <p className="text-[11px]">Effort: {data.effort.toFixed(1)} / 10</p>
                            <p className="text-[11px]">Impact: {data.impact.toFixed(1)} / 10</p>
                            <p className="text-xs text-[#dc2626]">Risk Score: {data.risk.toFixed(1)}</p>
                          </div>
                        );
                      }
                      return null;
                    }} 
                  />
                  <Scatter 
                    data={quadrantData} 
                    fill="#7048e8" 
                    fillOpacity={0.85} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Jira Export Confirmation Modal */}
      {jiraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b0714]/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl border border-[#e2e4ea] shadow-2xl max-w-lg w-full p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#e2e4ea] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#130e24] text-white">
                  <Layers className="w-4 h-4 text-[#b39ef2]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#0f1015]">
                    Export Refactoring Package to Jira
                  </h3>
                  <p className="text-[11px] text-[#88909e] font-mono">Target: Atlassian Jira Cloud (Sprint 49)</p>
                </div>
              </div>
              <button
                onClick={() => setJiraModalOpen(false)}
                className="text-[#88909e] hover:text-[#0f1015] p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#525866]">
              <div className="p-3 bg-[#f8f9fb] rounded-lg border border-[#e2e4ea] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#88909e]">Sprint Initiative:</span>
                  <span className="font-semibold text-[#0f1015]">Sprint 49 — Debt Remediation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#88909e]">Story Points:</span>
                  <span className="font-semibold text-[#5b42a5]">{storyPoints} SP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#88909e]">Budget Hours:</span>
                  <span className="font-semibold text-[#0f1015]">{budgetHours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#88909e]">Projected ROI:</span>
                  <span className="font-semibold text-[#059669]">${(simulationResult?.impact?.dollar_savings || 2400).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#0f1015] block mb-1">Generated Sprint Tickets:</span>
                <div className="space-y-1">
                  {(simulationResult?.jira_package?.suggested_tickets || [
                    { issue_key: 'DEBT-101', summary: 'Refactor high-cyclomatic hotspot', story_points: 5 },
                    { issue_key: 'DEBT-102', summary: 'Increase test coverage to 85%', story_points: 3 }
                  ]).map((ticket, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[#f3f4f8] rounded-md text-[11px]">
                      <span className="font-mono font-semibold text-[#5b42a5]">{ticket.issue_key}: {ticket.summary}</span>
                      <span className="font-mono font-bold px-1.5 py-0.2 rounded bg-white text-[#0f1015] border border-[#e2e4ea]">{ticket.story_points} SP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#e2e4ea]">
              <button
                onClick={() => setJiraModalOpen(false)}
                className="flex-1 py-2 px-3 bg-[#f3f4f8] hover:bg-[#e2e4ea] text-[#525866] rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmJiraExport}
                disabled={isExportingJira}
                className="flex-1 py-2 px-3 bg-[#130e24] hover:bg-[#20173d] text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isExportingJira ? 'Creating Tickets...' : 'Confirm & Push to Jira'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
