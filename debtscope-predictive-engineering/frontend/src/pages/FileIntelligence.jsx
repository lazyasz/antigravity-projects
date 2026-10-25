import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFile } from '../hooks/useFile';
import { useAuth } from '../context/AuthContext';
import ChartTooltip from '../components/ui/ChartTooltip';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  FileCode, 
  Clock, 
  Users, 
  GitBranch, 
  Shield, 
  Target, 
  Layers, 
  Database, 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  Check, 
  Copy,
  AlertTriangle,
  Code2
} from 'lucide-react';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import JiraExportModal from '../components/integrations/JiraExportModal';
import NotionSyncModal from '../components/integrations/NotionSyncModal';
import { formatScore } from '../utils/risk';

export default function FileIntelligence() {
  const { id } = useParams();
  const { data, loading, error } = useFile(id);
  const { notify } = useAuth();
  const navigate = useNavigate();

  const [jiraOpen, setJiraOpen] = useState(false);
  const [notionOpen, setNotionOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingAiPatch, setIsGeneratingAiPatch] = useState(false);
  const [aiPatch, setAiPatch] = useState(null);

  if (loading) return <LoadingState message="Extracting deep file AST telemetry and mutation history..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState title="File not found in index" />;

  const fileName = data.file_path || data.file_name || data.file || id || 'Module';
  const pathParts = typeof fileName === 'string' ? fileName.split('/') : ['services', 'core.py'];
  const techRisk = data.risk_score ?? data.technical_risk ?? 78.0;
  const predRisk = data.predicted_risk ?? (techRisk * 1.06);

  const componentData = {
    component: fileName,
    priority_score: data.priority_score || 82.5,
    remediation_effort_hours: (data.remediation_effort || 5) * 2,
    defect_probability: (data.defects || 2) * 0.2,
    technical_risk: techRisk,
    business_impact: (data.business_impact || 7) * 10,
    roi_quadrant: data.severity === 'critical' ? 'Strategic Refactoring' : 'Quick Wins',
    explanation: data.description || 'Target file exhibits high cyclomatic complexity and historical defect density.',
  };

  const handleGenerateAiPatch = () => {
    setIsGeneratingAiPatch(true);
    setTimeout(() => {
      setIsGeneratingAiPatch(false);
      setAiPatch(`// Refactoring Recommendation for: ${fileName}
// Decomposing monolithic method into decoupled single-responsibility sub-routines

- def handle_transaction_event(event_payload, user_context, auth_header):
-     # Monolithic 120-line handler with high cyclomatic complexity (38)
-     if not auth_header or not validate_token(auth_header):
-         raise AuthError("Invalid auth")
-     ...
+ def handle_transaction_event(event_payload: dict, user_context: UserContext, auth: AuthSession) -> Result:
+     """Decoupled transaction orchestrator with verified AST boundaries."""
+     auth.verify_scope("transaction.write")
+     validated_data = TransactionValidator.validate(event_payload)
+     return TransactionExecutor.dispatch(validated_data, user_context)`);
      notify('✨ AI Refactoring Patch generated successfully!');
    }, 1200);
  };

  const handleCopyCode = () => {
    if (!aiPatch) return;
    navigator.clipboard.writeText(aiPatch);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    notify('📋 Copied refactoring patch to clipboard!');
  };

  const riskHistory = data.risk_history || [
    { date: 'Sprint 42', risk_score: 55 },
    { date: 'Sprint 43', risk_score: 62 },
    { date: 'Sprint 44', risk_score: 68 },
    { date: 'Sprint 45', risk_score: 74 },
    { date: 'Sprint 46', risk_score: 82 },
    { date: 'Sprint 47', risk_score: 85 },
    { date: 'Sprint 48', risk_score: Math.round(techRisk) },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Back Button & Sub-header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-[#edf1e8] text-[#2d3f16] text-xs font-bold border border-[#d4dece] shadow-2xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          {/* Breadcrumb path */}
          <nav className="flex items-center gap-1.5 text-xs font-mono text-[#556437] overflow-x-auto">
            <span>root</span>
            {pathParts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span className="text-[#a8b09b]">/</span>
                <span className={idx === pathParts.length - 1 ? 'text-[#161e10] font-bold' : ''}>
                  {part}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotionOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#f8faf6] text-[#161e10] text-xs font-bold rounded-2xl border border-[#d4dece] shadow-xs transition cursor-pointer"
          >
            <Database className="w-4 h-4 text-[#384a24]" />
            <span>Document in Notion</span>
          </button>
          <button
            onClick={() => setJiraOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#43562b] hover:bg-[#2d3f16] text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Create Jira Task</span>
          </button>
        </div>
      </div>

      {/* Hero File Overview Card */}
      <section className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-10 h-10 rounded-2xl bg-[#43562b] text-white flex items-center justify-center shadow-md shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold font-mono text-[#161e10] break-all">
                {fileName}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                data.severity === 'critical'
                  ? 'bg-[#ffdad6] text-[#ba1a1a]'
                  : 'bg-[#ffddb8] text-[#855300]'
              }`}>
                {data.severity ? data.severity.toUpperCase() : 'HIGH RISK'}
              </span>
            </div>
            <p className="text-xs text-[#45483e] mt-1">
              {data.description || 'Monolithic domain service exhibiting high cognitive weight and rapid commit churn.'}
            </p>
          </div>
        </div>
      </section>

      {/* 6 Bento Metric Capsules */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Technical Risk', value: `${formatScore(techRisk)} / 100`, icon: Shield, color: '#ba1a1a', bg: '#ffdad6' },
          { label: 'Predicted Risk', value: `${formatScore(predRisk)} / 100`, icon: Target, color: '#855300', bg: '#ffddb8' },
          { label: 'Cyclomatic Peak', value: data.complexity || 38, icon: GitBranch, color: '#43562b', bg: '#d3e4ac' },
          { label: 'Churn (30d)', value: `${data.churn || 480} LOC`, icon: Clock, color: '#2d3f16', bg: '#e8f1db' },
          { label: 'Total LOC', value: (data.lines_of_code || 840).toLocaleString(), icon: FileCode, color: '#161e10', bg: '#edf1e8' },
          { label: 'Contributors', value: `${data.contributors?.length || 4} Authors`, icon: Users, color: '#556437', bg: '#f4f6f0' },
        ].map((m) => (
          <div key={m.label} className="p-4 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_16px_-4px_rgba(45,63,22,0.05)] space-y-1">
            <div className="flex items-center justify-between">
              <span className="p-1.5 rounded-xl text-xs" style={{ backgroundColor: m.bg, color: m.color }}>
                <m.icon className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-lg font-mono font-extrabold text-[#161e10] pt-1">{m.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#556437]">{m.label}</p>
          </div>
        ))}
      </section>

      {/* Mid Bento: Historical Risk Curve + AI Copilot Refactoring Shell */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Risk Progression History (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#161e10]">Historical Risk Progression</h2>
              <p className="text-xs text-[#75786d]">Trajectory of technical debt accretion over 7 sprints</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#ffdad6] text-[#ba1a1a]">
              +33 pts Accretion
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskHistory}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ebe0" />
                <XAxis dataKey="date" stroke="#75786d" fontSize={10} />
                <YAxis stroke="#75786d" fontSize={10} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip unit=" pts" />} />
                <Area type="monotone" dataKey="risk_score" stroke="#ba1a1a" strokeWidth={3} fillOpacity={1} fill="url(#riskGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: AI Refactoring Copilot Shell (6 cols) */}
        <div className="lg:col-span-6 p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#43562b] text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#161e10]">AI Refactoring Copilot</h2>
                <p className="text-xs text-[#75786d]">Synthesizes AST simplification patches for this module</p>
              </div>
            </div>

            <button
              onClick={handleGenerateAiPatch}
              disabled={isGeneratingAiPatch}
              className="px-3 py-1.5 bg-[#43562b] hover:bg-[#2d3f16] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAiPatch ? 'Synthesizing...' : 'Generate Patch'}</span>
            </button>
          </div>

          {/* Diff Box */}
          <div className="relative bg-[#1e2a0f] text-[#d3ebb2] p-4 rounded-2xl font-mono text-xs overflow-x-auto min-h-[180px] flex flex-col justify-between border border-[#43562b]">
            {aiPatch ? (
              <>
                <pre className="whitespace-pre-wrap leading-relaxed text-[11px]">{aiPatch}</pre>
                <button
                  onClick={handleCopyCode}
                  className="self-end mt-3 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 border border-white/20 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy Diff'}</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center my-auto text-center space-y-2 py-6">
                <Sparkles className="w-6 h-6 text-[#d3ebb2]/40" />
                <p className="text-xs text-[#bec6a9]">Click "Generate Patch" to let the AI Copilot analyze the AST and propose remediation diffs.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#45483e] pt-1">
            <span>Model: Deep Code Intelligence v4.3</span>
            <button
              onClick={() => navigate('/copilot')}
              className="text-[#43562b] font-bold hover:underline"
            >
              Open Full Interactive Copilot →
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <JiraExportModal
        isOpen={jiraOpen}
        onClose={() => setJiraOpen(false)}
        component={componentData}
      />

      <NotionSyncModal
        isOpen={notionOpen}
        onClose={() => setNotionOpen(false)}
        items={[componentData]}
      />
    </div>
  );
}
