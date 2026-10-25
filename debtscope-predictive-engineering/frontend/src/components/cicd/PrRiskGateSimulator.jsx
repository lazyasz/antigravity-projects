import React, { useState, useEffect } from 'react';
import { 
  GitPullRequest, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileCode, 
  AlertTriangle,
  Play,
  RotateCcw,
  KeyRound,
  Download,
  Flame,
  ArrowRight
} from 'lucide-react';
import { evaluateCiCdPr } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PR_PRESETS = [
  {
    id: 104,
    title: 'feat(core): Add Payment Webhook Gateway & Settlement Handler',
    author: 'alex.developer',
    author_commits: 4,
    branch: 'main',
    files: [
      { filename: 'services/payment/webhook_gateway.py', lines_added: 260, lines_deleted: 30, cyclomatic_complexity: 22.0, debt_minutes: 90 },
      { filename: 'services/payment/ledger_settlement.py', lines_added: 180, lines_deleted: 20, cyclomatic_complexity: 17.5, debt_minutes: 60 },
      { filename: 'models/transaction_lock.py', lines_added: 85, lines_deleted: 15, cyclomatic_complexity: 12.0, debt_minutes: 30 },
    ]
  },
  {
    id: 105,
    title: 'fix(ui): Responsive Header Glassmorphism & Token Cache',
    author: 'sarah.frontend',
    author_commits: 28,
    branch: 'main',
    files: [
      { filename: 'frontend/src/components/Header.jsx', lines_added: 35, lines_deleted: 18, cyclomatic_complexity: 4.5, debt_minutes: 10 },
      { filename: 'frontend/src/styles/theme.css', lines_added: 20, lines_deleted: 5, cyclomatic_complexity: 2.0, debt_minutes: 5 },
    ]
  },
  {
    id: 106,
    title: 'refactor(analytics): Delta Lake Partitioning & SZZ Aggregator',
    author: 'david.data',
    author_commits: 14,
    branch: 'main',
    files: [
      { filename: 'pipeline/analytics/szz_spark_transformer.py', lines_added: 190, lines_deleted: 85, cyclomatic_complexity: 14.0, debt_minutes: 45 },
      { filename: 'backend/services/cache_layer.py', lines_added: 75, lines_deleted: 25, cyclomatic_complexity: 8.5, debt_minutes: 20 },
    ]
  }
];

export default function PrRiskGateSimulator({ onOpenRecipe }) {
  const { notify } = useAuth();
  const [selectedPr, setSelectedPr] = useState(PR_PRESETS[0]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overridden, setOverridden] = useState(false);

  const runEvaluation = async (pr) => {
    setLoading(true);
    setOverridden(false);
    try {
      const res = await evaluateCiCdPr({
        pr_number: pr.id,
        pr_title: pr.title,
        author: pr.author,
        author_experience_commits: pr.author_commits,
        target_branch: pr.branch,
        changed_files: pr.files
      });
      setEvaluation(res);
    } catch (err) {
      console.error('Failed to evaluate PR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation(selectedPr);
  }, [selectedPr]);

  const isBlocked = evaluation?.gate_status === 'BLOCKED' && !overridden;

  const handleOverride = () => {
    setOverridden(true);
    notify('⚠️ Lead Architect Override Granted: PR bypass recorded in audit log.');
  };

  const handleSimulateMerge = () => {
    if (isBlocked) {
      notify('⛔ Cannot merge: CI/CD Quality Gate is BLOCKED. Risk threshold violated!');
    } else {
      notify(`🎉 PR #${selectedPr.id} merged into ${selectedPr.branch} successfully!`);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evaluation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pr_${selectedPr.id}_risk_gate.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('📥 Downloaded CI/CD Risk Gate Artifact JSON.');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_24px_-4px_rgba(45,63,22,0.08)] p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5ebe0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#e8f1db] text-[#2d3f16]">
              <GitPullRequest className="w-5 h-5 text-[#43562b]" />
            </span>
            <h2 className="text-xl font-extrabold text-[#161e10] tracking-tight">
              GitHub PR "Pre-Merge Risk Gate" CI/CD Simulator
            </h2>
          </div>
          <p className="text-xs text-[#75786d] mt-1">
            Automated machine learning gate assessing code churn, AST cyclomatic spikes, and SZZ regression probabilities before merging.
          </p>
        </div>

        {/* PR Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#75786d] font-bold">Select PR:</span>
          <select
            value={selectedPr.id}
            onChange={(e) => {
              const found = PR_PRESETS.find(p => p.id === Number(e.target.value));
              if (found) setSelectedPr(found);
            }}
            className="p-2 bg-[#f8faf6] rounded-xl border border-[#c5c8ba] text-xs font-semibold text-[#161e10] focus:ring-2 focus:ring-[#43562b] outline-none"
          >
            {PR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                PR #{p.id}: {p.title.substring(0, 42)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Status Gate Banner + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Gate Status Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className={`p-6 rounded-3xl border transition-all ${
            isBlocked
              ? 'bg-[#fff0ef] border-[#ffdad6] text-[#ba1a1a]'
              : 'bg-[#edf7e2] border-[#d3ebb2] text-[#2d3f16]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Quality Gate Status
              </span>
              <span className={`p-2 rounded-2xl ${isBlocked ? 'bg-[#ffdad6]' : 'bg-[#d3ebb2]'}`}>
                {isBlocked ? (
                  <ShieldAlert className="w-6 h-6 text-[#ba1a1a]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#2d3f16]" />
                )}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight uppercase font-mono">
                {isBlocked ? 'MERGE BLOCKED (HIGH RISK)' : 'MERGE ALLOWED (PASS)'}
              </div>
              <p className="text-xs mt-2 text-[#45483e] leading-relaxed">
                {overridden 
                  ? '⚠️ Status overridden by Lead Architect. Defect threshold waiver active.'
                  : evaluation?.merge_recommendation || 'Evaluating pull request telemetry...'}
              </p>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-black/10 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#75786d] block">Peak Defect Risk</span>
                <span className="text-lg font-bold font-mono">
                  {evaluation?.peak_defect_risk_pct ?? 78.4}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-[#75786d] block">Total Churn</span>
                <span className="text-lg font-bold font-mono">
                  {evaluation?.total_churn_lines ?? 470} Lines
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateMerge}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                  isBlocked
                    ? 'bg-[#c5c8ba] text-[#556437] opacity-80'
                    : 'bg-[#43562b] hover:bg-[#2d3f16] text-white active:scale-95'
                }`}
              >
                <Play className="w-4 h-4" />
                <span>Simulate CI/CD Merge</span>
              </button>

              {isBlocked && (
                <button
                  onClick={handleOverride}
                  className="py-3 px-3 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-[#ffdad6] cursor-pointer"
                  title="Lead Architect Override"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Override</span>
                </button>
              )}
            </div>

            <button
              onClick={handleExportJson}
              className="w-full py-2.5 px-4 bg-[#f8faf6] hover:bg-[#edf1e8] text-[#45483e] rounded-2xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-[#d4dece] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#43562b]" />
              <span>Export CI/CD Quality Gate JSON</span>
            </button>
          </div>

        </div>

        {/* Right Column: Policy Checklist & File Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Policy Checklist */}
          <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#d4dece] space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono text-[#75786d]">
              Automated Policy Checklist
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#e2ecd5]">
                <div className="flex items-center gap-2">
                  {evaluation?.policy_evaluation?.defect_threshold_check?.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#43562b]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#ba1a1a]" />
                  )}
                  <span className="font-semibold text-[#161e10]">ML Defect Risk Threshold (&lt; 70%)</span>
                </div>
                <span className="font-mono font-bold text-[#75786d]">
                  {evaluation?.policy_evaluation?.defect_threshold_check?.actual_pct}%
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#e2ecd5]">
                <div className="flex items-center gap-2">
                  {evaluation?.policy_evaluation?.churn_volume_check?.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#43562b]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#ba1a1a]" />
                  )}
                  <span className="font-semibold text-[#161e10]">Max Churn per PR (&le; 500 lines)</span>
                </div>
                <span className="font-mono font-bold text-[#75786d]">
                  {evaluation?.policy_evaluation?.churn_volume_check?.actual_lines} lines
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#e2ecd5]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#43562b]" />
                  <span className="font-semibold text-[#161e10]">Author Trust & Commit History</span>
                </div>
                <span className="font-mono font-bold text-[#2d3f16]">
                  {evaluation?.policy_evaluation?.author_trust_score?.status || 'Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Changed Files Risk Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase font-mono text-[#75786d]">
              Changed Files Risk Breakdown ({selectedPr.files.length} Files)
            </h3>

            <div className="space-y-2">
              {selectedPr.files.map((file, idx) => {
                const isHigh = file.cyclomatic_complexity > 15;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border border-[#d4dece] flex items-center justify-between gap-3 hover:border-[#b8ce98] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode className="w-4 h-4 text-[#43562b] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-[#161e10] truncate">
                          {file.filename}
                        </div>
                        <div className="text-[10px] text-[#75786d] font-mono">
                          +{file.lines_added} / -{file.lines_deleted} · Complexity {file.cyclomatic_complexity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isHigh ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e8f1db] text-[#2d3f16]'
                      }`}>
                        {isHigh ? 'HIGH RISK' : 'SAFE'}
                      </span>

                      {onOpenRecipe && isHigh && (
                        <button
                          onClick={() => onOpenRecipe({
                            file_path: file.filename,
                            complexity: file.cyclomatic_complexity,
                            debt_minutes: file.debt_minutes,
                            risk_score: 82.0
                          })}
                          className="px-2 py-1 bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Flame className="w-3 h-3 text-[#ba1a1a]" />
                          <span>Remediate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
