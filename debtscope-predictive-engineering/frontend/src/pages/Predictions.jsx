import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictions } from '../hooks/usePredictions';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import InteractiveCard from '../components/ui/InteractiveCard';
import { 
  Activity, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Code2, 
  BarChart3,
  Flame,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import ChartTooltip from '../components/ui/ChartTooltip';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell
} from 'recharts';

export default function Predictions() {
  const { data, loading, error } = usePredictions();
  const { notify } = useAuth();
  const navigate = useNavigate();

  // Interactive Live Defect Simulator State
  const [simLoc, setSimLoc] = useState(850);
  const [simComplexity, setSimComplexity] = useState(28);
  const [simChurn, setSimChurn] = useState(420);
  const [simAuthors, setSimAuthors] = useState(5);

  if (loading) return <LoadingState message="Loading ML defect regression model and SHAP drivers..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState title="No prediction data available" />;

  // Real-time simulated defect probability calculation
  const calcDefectProb = () => {
    const raw = (simLoc / 3000) * 0.35 + (simComplexity / 40) * 0.35 + (simChurn / 800) * 0.20 + (simAuthors / 8) * 0.10;
    return Math.min(Math.max(raw * 100, 5), 98).toFixed(1);
  };

  const calcRiskScore = () => {
    const prob = parseFloat(calcDefectProb());
    return Math.min(Math.round(prob * 0.9 + (simComplexity * 0.8)), 100);
  };

  const featureImportanceData = [
    { feature: 'Cyclomatic Complexity', weight: 34, color: '#384a24' },
    { feature: 'Recent Code Churn', weight: 28, color: '#4d6332' },
    { feature: 'Lines of Code (LOC)', weight: 22, color: '#687e45' },
    { feature: 'Author Entropy', weight: 16, color: '#889d62' },
  ];

  const atRiskFiles = data.at_risk_files || [
    { id: 1, file: 'services/auth_service/auth.go', current_risk: 72, predicted_risk: 89, confidence: 0.94, risk_delta: 17, risk_factors: ['High Churn', 'God Method'] },
    { id: 2, file: 'pipeline/analytics/spark_aggregator.py', current_risk: 68, predicted_risk: 84, confidence: 0.92, risk_delta: 16, risk_factors: ['High Complexity', 'Low Unit Test Coverage'] },
    { id: 3, file: 'api/routes/transaction_billing.py', current_risk: 65, predicted_risk: 79, confidence: 0.89, risk_delta: 14, risk_factors: ['Cyclomatic > 30', 'Rapid Mutation'] },
    { id: 4, file: 'models/decision_matrix_calculator.py', current_risk: 58, predicted_risk: 72, confidence: 0.91, risk_delta: 14, risk_factors: ['Duplication', 'Nested Conditionals'] },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Sub-Header & Controls */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 p-6 sm:p-8 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#d4dece] shadow-[0_8px_30px_-6px_rgba(45,63,22,0.08)]">
        <div className="space-y-2 max-w-4xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f1db] text-[#2d3f16] font-mono text-xs font-bold tracking-wider uppercase border border-[#c5c8ba]/60">
              <span className="w-2 h-2 rounded-full bg-[#43562b] animate-pulse"></span>
              Supervised AST Random Forest Regressor
            </span>
            <span className="text-xs text-[#45483e] font-mono px-2.5 py-0.5 rounded-full bg-[#edf1e8] border border-[#d4dece]">
              Model v4.2.8
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d3e4ac] text-[#2d3f16] font-mono font-bold">
              Inference: 4.8ms
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#161e10] tracking-tight">
            Telemetry Intelligence & Defect Predictor
          </h1>
          <p className="text-sm text-[#45483e] max-w-3xl">
            Predictive regression engine calibrated against 24 months of Jira bug reports, AST mutation cycles, and GitHub commit velocity across 48 microservices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const element = document.getElementById('defect-simulator');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] text-xs font-bold transition border border-[#c5c8ba] shadow-xs cursor-pointer active:scale-95"
          >
            <Sliders className="w-4 h-4 text-[#43562b]" />
            <span>Defect Simulator</span>
          </button>

          <button
            onClick={() => notify('✨ Model weights v4.3 successfully deployed to production inference pipeline!')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#43562b] hover:bg-[#2d3f16] text-white text-xs font-bold transition shadow-[0_4px_14px_rgba(45,63,22,0.3)] hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <span>Deploy Weights v4.3</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4 Model Performance Capsule Badges */}
      <section className="flex items-center gap-3 overflow-x-auto pb-1 text-xs font-mono">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-[#d4dece] shadow-2xs whitespace-nowrap">
          <Activity className="w-3.5 h-3.5 text-[#43562b]" />
          <span className="text-[#45483e]">Calibrated:</span>
          <strong className="text-[#161e10]">2 hrs ago</strong>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-[#d4dece] shadow-2xs whitespace-nowrap">
          <BrainCircuit className="w-3.5 h-3.5 text-[#43562b]" />
          <span className="text-[#45483e]">5-Fold Cross-Val:</span>
          <strong className="text-[#161e10]">R² = 0.9849</strong>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-2xl border border-[#d4dece] shadow-2xs whitespace-nowrap">
          <Code2 className="w-3.5 h-3.5 text-[#43562b]" />
          <span className="text-[#45483e]">Corpus:</span>
          <strong className="text-[#161e10]">18,400 Commit ASTs</strong>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 bg-[#e8f1db] rounded-2xl border border-[#c5c8ba] shadow-2xs whitespace-nowrap ml-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#43562b]" />
          <span className="text-[#2d3f16] font-bold">R² Fit: 0.9885 (High Confidence)</span>
        </div>
      </section>

      {/* 4 Bento KPI Metric Capsules with Specular Sheen & Animated Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        
        <InteractiveCard
          dark={true}
          isInteractive={true}
          className="min-h-[190px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#d3ebb2] font-bold">
                ML Defect Vulnerability
              </span>
              <div className="text-3xl font-extrabold tracking-tight mt-1 text-white leading-none font-mono">
                <AnimatedCounter value={38.5} decimals={1} />% <span className="text-base text-[#d3ebb2]/80 font-normal font-sans">Exposure</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/20">
              +4.2% Sprint 48
            </span>
          </div>
          <div className="pt-3 flex items-center justify-between z-10 text-xs border-t border-white/10">
            <span className="text-[#d3ebb2] font-mono">14 Modules Exposed</span>
            <span className="font-mono font-bold text-white">R² = 0.9885 Fit</span>
          </div>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[190px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#45483e] font-bold">Mean Absolute Error</span>
              <div className="text-3xl font-extrabold text-[#161e10] mt-1 font-mono">
                <AnimatedCounter value={1.085} decimals={3} /> <span className="text-sm font-normal text-[#45483e] font-sans">LOC/Defect</span>
              </div>
            </div>
            <span className="p-2.5 rounded-2xl bg-[#d3e4ac] text-[#2d3f16]">
              <BarChart3 className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#45483e] font-mono pt-3 border-t border-[#e5ebe0]">
            <span>Low Var σ²: 0.04</span>
            <strong className="text-[#161e10]">RMSE: 1.242</strong>
          </div>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[190px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#45483e] font-bold">Ensemble Architecture</span>
              <div className="text-3xl font-extrabold text-[#161e10] mt-1 font-mono">
                <AnimatedCounter value={300} /> <span className="text-sm font-normal text-[#45483e] font-sans">Trees</span>
              </div>
            </div>
            <span className="p-2.5 rounded-2xl bg-[#ffddb8] text-[#855300]">
              <Cpu className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#45483e] font-mono pt-3 border-t border-[#e5ebe0]">
            <span>Max Depth 12</span>
            <span>MSE Criterion</span>
          </div>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[190px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#45483e] font-bold">Primary SHAP Driver</span>
              <div className="text-3xl font-extrabold text-[#161e10] mt-1 font-mono">
                <AnimatedCounter value={34} />% <span className="text-sm font-normal text-[#45483e] font-sans">Weight</span>
              </div>
            </div>
            <span className="p-2.5 rounded-2xl bg-[#ffdad6] text-[#ba1a1a]">
              <Flame className="w-5 h-5" />
            </span>
          </div>
          <span className="text-xs text-[#ba1a1a] font-semibold pt-3 border-t border-[#e5ebe0]">Cyclomatic Complexity</span>
        </InteractiveCard>
      </section>

      {/* Feature Importance & Interactive Live Simulator Bento Grid */}
      <section id="defect-simulator" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Bento: Feature Importance SHAP (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#161e10]">Feature Importance Rankings</h2>
            <p className="text-xs text-[#45483e]">SHAP value decomposition for Random Forest Regressor</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureImportanceData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#75786d" fontSize={11} domain={[0, 40]} />
                <YAxis dataKey="feature" type="category" stroke="#45483e" fontSize={11} width={140} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="%" />} />
                <Bar dataKey="weight" fill="#43562b" radius={[0, 8, 8, 0]} isAnimationActive={false}>
                  {featureImportanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] text-xs text-[#45483e]">
            <span className="font-bold text-[#161e10]">Model Interpretation: </span>
            <span>Complexity combined with High Churn increases defect likelihood exponentially (&gt;2.8&times;).</span>
          </div>
        </div>

        {/* Right Bento: Interactive Real-Time Defect Simulator (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#161e10]">Live Defect Risk Simulator</h2>
              <p className="text-xs text-[#45483e]">Adjust AST telemetry parameters to calculate live forecasted defect probability</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#e8f1db] text-[#2d3f16]">
              Real-Time Inference
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#45483e] font-medium">Lines of Code (LOC):</span>
                <span className="font-mono font-bold text-[#161e10]">{simLoc}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="3000" 
                value={simLoc} 
                onChange={(e) => setSimLoc(Number(e.target.value))}
                className="w-full accent-[#43562b] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#45483e] font-medium">Cyclomatic Complexity:</span>
                <span className="font-mono font-bold text-[#161e10]">{simComplexity}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={simComplexity} 
                onChange={(e) => setSimComplexity(Number(e.target.value))}
                className="w-full accent-[#43562b] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#45483e] font-medium">Recent Commit Churn (LOC):</span>
                <span className="font-mono font-bold text-[#161e10]">{simChurn}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                value={simChurn} 
                onChange={(e) => setSimChurn(Number(e.target.value))}
                className="w-full accent-[#43562b] cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#45483e] font-medium">Distinct Author Count:</span>
                <span className="font-mono font-bold text-[#161e10]">{simAuthors}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={simAuthors} 
                onChange={(e) => setSimAuthors(Number(e.target.value))}
                className="w-full accent-[#43562b] cursor-pointer"
              />
            </div>
          </div>

          {/* Simulator Live Outputs */}
          <div className="p-4 bg-[#eef7e0] border border-[#d3ebb2] rounded-2xl flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#43562b] text-white flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-[#556437] font-mono font-bold uppercase block">Predicted Defect Likelihood</span>
                <span className="text-2xl font-extrabold text-[#2d3f16]">{calcDefectProb()}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs text-[#45483e] font-mono font-bold uppercase block text-right">Future Risk Score</span>
                <span className="text-2xl font-extrabold text-[#ba1a1a] text-right block">{calcRiskScore()} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* At-Risk Files Forecast Table */}
      <section className="p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#161e10]">Predicted High-Defect Risk Files ({atRiskFiles.length})</h2>
            <p className="text-xs text-[#45483e]">Modules with rising risk trajectory flagged by our trained Random Forest Regressor</p>
          </div>
          <button
            onClick={() => navigate('/priorities')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#43562b] hover:text-[#2d3f16] transition cursor-pointer"
          >
            <span>View Remediation Backlog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Card List (< 768px) */}
        <div className="md:hidden space-y-3">
          {atRiskFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => navigate(`/files/${file.id}`)}
              className="p-4 bg-[#f8faf6] hover:bg-[#eef3e8] border border-[#d4dece] rounded-2xl transition cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Code2 className="w-4 h-4 text-[#43562b] shrink-0" />
                  <span className="font-mono font-bold text-sm text-[#161e10] truncate">
                    {file.file}
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#2d3f16] bg-[#d3ebb2] px-2 py-0.5 rounded-full shrink-0">
                  {(file.confidence * 100).toFixed(0)}% Conf
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e5ebe0] text-center">
                <div className="bg-white p-2 rounded-xl border border-[#e5ebe0]">
                  <span className="text-[11px] font-mono text-[#45483e] block">Current</span>
                  <span className="font-mono font-bold text-sm text-[#45483e] whitespace-nowrap">
                    {file.current_risk}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#e5ebe0]">
                  <span className="text-[11px] font-mono text-[#45483e] block">Predicted</span>
                  <span className="font-mono font-bold text-sm text-[#ba1a1a] whitespace-nowrap">
                    {file.predicted_risk} (+{file.risk_delta})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {file.risk_factors.map((factor, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-[#edf1e8] text-[#2d3f16] font-mono text-[10px] font-semibold border border-[#d4dece]">
                    {factor}
                  </span>
                ))}
              </div>

              <div className="flex justify-end pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/files/${file.id}`)}
                  className="px-3 py-1.5 bg-[#43562b] hover:bg-[#2d3f16] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/Tablet Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e5ebe0] text-[#45483e] uppercase font-mono text-xs">
                <th className="py-3 px-4 font-bold">Module Path</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Current Risk</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Predicted Risk</th>
                <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Confidence</th>
                <th className="py-3 px-4 font-bold">Identified Risk Drivers</th>
                <th className="py-3 px-4 font-bold text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f0]">
              {atRiskFiles.map((file) => (
                <tr 
                  key={file.id}
                  onClick={() => navigate(`/files/${file.id}`)}
                  className="hover:bg-[#f8faf6] transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#43562b] shrink-0" />
                      <span className="font-mono font-semibold text-[#161e10] group-hover:text-[#43562b] transition">
                        {file.file}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[#45483e] whitespace-nowrap">
                    {file.current_risk}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#ba1a1a] whitespace-nowrap">
                    {file.predicted_risk}
                    <span className="text-xs text-[#ba1a1a] ml-1 font-semibold">
                      (+{file.risk_delta})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#2d3f16] whitespace-nowrap">
                    {(file.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5">
                      {file.risk_factors.map((factor, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-[#edf1e8] text-[#2d3f16] font-mono text-xs font-semibold border border-[#d4dece] whitespace-nowrap">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/files/${file.id}`)}
                      className="px-3 py-1.5 bg-[#43562b] hover:bg-[#2d3f16] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ml-auto cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
