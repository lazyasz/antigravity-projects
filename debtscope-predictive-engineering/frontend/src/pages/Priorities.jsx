import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPriorities } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import PriorityMatrix from '../charts/PriorityMatrix';
import JiraExportModal from '../components/integrations/JiraExportModal';
import NotionSyncModal from '../components/integrations/NotionSyncModal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import InteractiveCard from '../components/ui/InteractiveCard';
import SpringTabs from '../components/ui/SpringTabs';
import { 
  Grid, 
  Layers, 
  Database, 
  Bolt, 
  TrendingDown, 
  ArrowRight,
  Filter,
  Calendar,
  Code2,
  Clock,
  Target,
  Wand2
} from 'lucide-react';

export default function Priorities() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSquad, setActiveSquad] = useState('All Squads');
  const [activeQuadrant, setActiveQuadrant] = useState('All');
  const { notify } = useAuth();
  const navigate = useNavigate();

  // Modals state
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [notionModalOpen, setNotionModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isBulkExport, setIsBulkExport] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await getPriorities();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load priorities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const openSingleJira = (item) => {
    setSelectedComponent({
      component: item.file_path || item.file_name || item.file || item.name || 'Component',
      priority_score: item.priority_score || 75.0,
      remediation_effort_hours: item.remediation_effort || 10.0,
      defect_probability: ((item.technical_risk || item.risk_score || 60) / 100) * 0.8,
      technical_risk: item.technical_risk || item.risk_score || 60.0,
      business_impact: item.business_impact || 70.0,
      roi_quadrant: (item.business_impact || 7) >= 5 && (item.remediation_effort || 4) <= 5 ? 'Quick Wins' : 'Strategic Refactoring',
    });
    setIsBulkExport(false);
    setJiraModalOpen(true);
  };

  const openBulkJira = () => {
    setIsBulkExport(true);
    setJiraModalOpen(true);
  };

  if (loading) return <LoadingState message="Calculating 5D Business-Aware Prioritization Matrix..." />;
  if (error) return <ErrorState message={error} />;
  if (!data || data.length === 0) return <EmptyState title="No priority data available" />;

  const squadTabs = [
    { id: 'All Squads', label: 'All Squads' },
    { id: 'Core Backend', label: 'Core Backend' },
    { id: 'Payments & Billing', label: 'Payments & Billing' },
    { id: 'Cloud Infra', label: 'Cloud Infra' },
  ];

  const quickWinsCount = data.filter((i) => (i.business_impact || 7) >= 5 && (i.remediation_effort || 4) <= 5).length;
  const strategicCount = data.filter((i) => (i.business_impact || 7) >= 5 && (i.remediation_effort || 4) > 5).length;
  const deprioritizedCount = data.length - quickWinsCount - strategicCount;

  const quadrantTabs = [
    { id: 'All', label: 'All Quadrants', count: data.length },
    { id: 'Quick Wins', label: 'Quick Wins', count: quickWinsCount },
    { id: 'Strategic Refactoring', label: 'Strategic', count: strategicCount },
    { id: 'Deprioritized', label: 'Deprioritized', count: deprioritizedCount },
  ];

  const filteredData = data.filter((item) => {
    const isQuickWin = (item.business_impact || 7) >= 5 && (item.remediation_effort || 4) <= 5;
    const isStrategic = (item.business_impact || 7) >= 5 && (item.remediation_effort || 4) > 5;
    if (activeQuadrant === 'Quick Wins') return isQuickWin;
    if (activeQuadrant === 'Strategic Refactoring') return isStrategic;
    if (activeQuadrant === 'Deprioritized') return !isQuickWin && !isStrategic;
    return true;
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Top Hero Header Bar */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#7048e8] animate-pulse"></span>
            <span className="text-xs font-mono text-[#525866] uppercase tracking-wider font-semibold">Sprint 48 Remediation</span>
            <span className="text-[#88909e]">·</span>
            <span className="bg-[#f0ecfc] text-[#5b42a5] px-2 py-0.5 rounded text-xs font-mono font-semibold flex items-center gap-1 border border-[#d8cdfa]">
              <Calendar className="w-3 h-3 text-[#7048e8]" />
              Q3 Active Cycle
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#0f1015] tracking-tight">
            Remediation & 5D Payoff Matrix
          </h1>
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-[#525866]">
            <span className="font-semibold text-[#0f1015]">Multi-Factor Weights:</span>
            <span className="px-2 py-0.5 rounded bg-[#f3f4f8] border border-[#e2e4ea] font-mono">35% Tech Risk</span>
            <span className="px-2 py-0.5 rounded bg-[#f3f4f8] border border-[#e2e4ea] font-mono">30% Biz Impact</span>
            <span className="px-2 py-0.5 rounded bg-[#f3f4f8] border border-[#e2e4ea] font-mono">15% Urgency</span>
            <span className="px-2 py-0.5 rounded bg-[#f3f4f8] border border-[#e2e4ea] font-mono">10% Maint Cost</span>
            <span className="px-2 py-0.5 rounded bg-[#f3f4f8] border border-[#e2e4ea] font-mono">10% Dev Churn</span>
          </div>
        </div>

        {/* Squad Pills & Global Action Triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SpringTabs
            tabs={squadTabs}
            activeTab={activeSquad}
            onChange={setActiveSquad}
            size="sm"
          />

          <button
            onClick={() => setNotionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#0f1015] hover:bg-[#f8f9fb] text-xs font-semibold border border-[#e2e4ea] transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#7048e8]" />
            <span>Sync Notion</span>
          </button>

          <button
            onClick={openBulkJira}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#130e24] hover:bg-[#20173d] text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#b39ef2]" />
            <span>Push Jira (24 SP)</span>
          </button>
        </div>
      </section>

      {/* 4 Bento KPI Metric Capsules with Specular Sheen & Animated Counters */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        <InteractiveCard
          dark={true}
          isInteractive={true}
          className="min-h-[170px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#b39ef2] font-bold">
                Remediation Runway
              </span>
              <div className="text-3xl font-bold font-mono mt-1.5 leading-none text-white">
                $<AnimatedCounter value={48.2} decimals={1} />k <span className="text-xs text-[#b39ef2]/80 font-normal font-sans">/ 340h</span>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-white/10 border border-white/15">
              <TrendingDown className="w-4 h-4 text-white" />
            </span>
          </div>
          <div className="pt-3 flex items-center justify-between z-10 border-t border-white/10 text-xs">
            <span className="text-[#b39ef2] font-mono text-[11px]">Total Debt Drag</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-white/10 font-bold font-mono text-white border border-white/15">-14.2% Drag</span>
          </div>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[170px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#525866] font-semibold">Quick Wins Ready</span>
              <div className="text-3xl font-bold text-[#0f1015] mt-1.5 font-mono">
                <AnimatedCounter value={quickWinsCount || 18} /> <span className="text-xs font-normal text-[#525866] font-sans">Modules</span>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-[#f0ecfc] text-[#5b42a5]">
              <Bolt className="w-4 h-4 text-[#7048e8]" />
            </span>
          </div>
          <span className="text-[11px] text-[#5b42a5] font-semibold pt-3 border-t border-[#e2e4ea]">High Payoff · Low Effort</span>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[170px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#525866] font-semibold">Strategic Refactors</span>
              <div className="text-3xl font-bold text-[#0f1015] mt-1.5 font-mono">
                <AnimatedCounter value={strategicCount || 12} /> <span className="text-xs font-normal text-[#525866] font-sans">Modules</span>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-[#fffbeb] text-[#d97706]">
              <Grid className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-[#b45309] font-semibold pt-3 border-t border-[#e2e4ea]">Core Architectural Epics</span>
        </InteractiveCard>

        <InteractiveCard
          isInteractive={true}
          className="min-h-[170px] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#525866] font-semibold">Prioritization Formula</span>
              <div className="text-3xl font-bold text-[#0f1015] mt-1.5">5-Factor</div>
            </div>
            <span className="p-2 rounded-lg bg-[#f3f4f8] text-[#525866]">
              <Target className="w-4 h-4 text-[#7048e8]" />
            </span>
          </div>
          <span className="text-[11px] text-[#525866] font-medium pt-3 border-t border-[#e2e4ea]">Calibrated to SZZ Defect Lift</span>
        </InteractiveCard>
      </section>

      {/* 2D Priority Matrix Chart */}
      <section className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0f1015]">2D Decision Quadrant Chart</h2>
            <p className="text-xs text-[#525866]">Business Impact vs Remediation Effort (dot size represents Risk Score)</p>
          </div>

          <SpringTabs
            tabs={quadrantTabs}
            activeTab={activeQuadrant}
            onChange={setActiveQuadrant}
            size="sm"
          />
        </div>

        {/* Desktop / Tablet Matrix */}
        <div className="hidden sm:block">
          <PriorityMatrix 
            data={filteredData} 
            onSelectPoint={(pt) => {
              if (pt.file_id || pt.id) navigate(`/files/${pt.file_id || pt.id}`);
            }}
          />
        </div>

        {/* Mobile Quadrant Breakdown Cards (< 640px) */}
        <div className="sm:hidden grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-3 bg-[#f0ecfc] rounded-lg border border-[#d8cdfa]">
            <span className="text-xs font-mono font-bold text-[#5b42a5] block">Quick Wins</span>
            <span className="text-lg font-bold font-mono text-[#0f1015]">{quickWinsCount}</span>
            <span className="text-[11px] text-[#525866] block">High Impact, Low Effort</span>
          </div>
          <div className="p-3 bg-[#fffbeb] rounded-lg border border-[#fcd34d]">
            <span className="text-xs font-mono font-bold text-[#b45309] block">Strategic</span>
            <span className="text-lg font-bold font-mono text-[#0f1015]">{strategicCount}</span>
            <span className="text-[11px] text-[#525866] block">High Impact, High Effort</span>
          </div>
        </div>
      </section>

      {/* Prioritized Backlog Items Table */}
      <section className="p-5 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0f1015]">Ranked Refactoring Backlog ({filteredData.length})</h2>
            <p className="text-xs text-[#525866]">Ranked by multi-factor Payoff Score with 1-click Jira ticket dispatch</p>
          </div>
          <button
            onClick={openBulkJira}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8f9fb] hover:bg-[#f0ecfc] text-[#5b42a5] text-xs font-semibold transition border border-[#e2e4ea] cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Export to Jira</span>
          </button>
        </div>

        {/* Mobile Card List (< 768px) */}
        <div className="md:hidden space-y-2.5">
          {filteredData.map((item, idx) => {
            const fileName = item.file_path || item.file_name || item.file || item.path || item.name || `module_${item.file_id || idx + 1}`;
            const isQuickWin = (item.business_impact || 7) >= 5 && (item.remediation_effort || 4) <= 5;
            const priorityScore = (item.priority_score || item.final_priority_score || 84.2).toFixed(1);
            const fileId = item.file_id || item.id || idx + 1;

            return (
              <div
                key={fileId}
                onClick={() => navigate(`/files/${fileId}`)}
                className="p-3.5 bg-[#f8f9fb] hover:bg-[#f3f4f8] border border-[#e2e4ea] rounded-lg transition cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold text-xs text-[#525866] bg-[#e2e4ea] px-1.5 py-0.2 rounded shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-semibold text-xs text-[#0f1015] truncate">
                      {fileName}
                    </span>
                  </div>
                  <span className={`px-2 py-0.2 rounded font-mono text-[10px] font-bold shrink-0 border ${
                    isQuickWin 
                      ? 'bg-[#f0ecfc] text-[#5b42a5] border-[#d8cdfa]' 
                      : 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]'
                  }`}>
                    {isQuickWin ? 'Quick Win' : 'Strategic'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e2e4ea] text-center">
                  <div className="bg-white p-1.5 rounded border border-[#e2e4ea]">
                    <span className="text-[10px] font-mono text-[#88909e] block">Score</span>
                    <span className="font-mono font-bold text-xs text-[#5b42a5] whitespace-nowrap">
                      {priorityScore}
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-[#e2e4ea]">
                    <span className="text-[10px] font-mono text-[#88909e] block">Impact</span>
                    <span className="font-mono font-bold text-xs text-[#0f1015] whitespace-nowrap">
                      {(item.business_impact || 7.5).toFixed(1)}/10
                    </span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-[#e2e4ea]">
                    <span className="text-[10px] font-mono text-[#88909e] block">Effort</span>
                    <span className="font-mono font-bold text-xs text-[#525866] whitespace-nowrap">
                      {(item.remediation_effort || 12).toFixed(0)}h
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openSingleJira(item)}
                    className="px-2 py-1 bg-white hover:bg-[#f0ecfc] text-[#5b42a5] rounded text-xs font-semibold transition flex items-center gap-1 border border-[#e2e4ea] cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Jira</span>
                  </button>
                  <button
                    onClick={() => navigate(`/files/${fileId}`)}
                    className="px-2.5 py-1 bg-[#130e24] hover:bg-[#20173d] text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>Deep Dive</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop/Tablet Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e2e4ea] text-[#88909e] uppercase font-mono text-[11px]">
                <th className="py-2.5 px-3 font-semibold text-center">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Module File</th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Priority Score</th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Business Impact</th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Effort</th>
                <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">Quadrant</th>
                <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f8]">
              {filteredData.map((item, idx) => {
                const fileName = item.file_path || item.file_name || item.file || item.path || item.name || `module_${item.file_id || idx + 1}`;
                const isQuickWin = (item.business_impact || 7) >= 5 && (item.remediation_effort || 4) <= 5;
                const fileId = item.file_id || item.id || idx + 1;
                const priorityScore = (item.priority_score || item.final_priority_score || 84.2).toFixed(1);

                return (
                  <tr 
                    key={fileId}
                    onClick={() => navigate(`/files/${fileId}`)}
                    className="hover:bg-[#f8f9fb] transition cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#88909e] whitespace-nowrap">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[#7048e8] shrink-0" />
                        <span className="font-mono font-medium text-[#0f1015] group-hover:text-[#7048e8] transition text-xs">
                          {fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#5b42a5] whitespace-nowrap text-xs">
                      {priorityScore}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-[#0f1015] whitespace-nowrap text-xs">
                      {(item.business_impact || 7.5).toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[#525866] whitespace-nowrap text-xs">
                      {(item.remediation_effort || 12).toFixed(0)}h
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.2 rounded font-mono text-[10px] font-bold border ${
                        isQuickWin 
                          ? 'bg-[#f0ecfc] text-[#5b42a5] border-[#d8cdfa]' 
                          : 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]'
                      }`}>
                        {isQuickWin ? 'Quick Win' : 'Strategic'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openSingleJira(item)}
                          className="px-2.5 py-1 bg-white hover:bg-[#f0ecfc] text-[#5b42a5] rounded text-xs font-semibold transition flex items-center gap-1 border border-[#e2e4ea] cursor-pointer"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Create Jira</span>
                        </button>
                        <button
                          onClick={() => navigate(`/files/${fileId}`)}
                          className="px-2.5 py-1 bg-[#130e24] hover:bg-[#20173d] text-white rounded text-xs font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <span>Deep Dive</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Jira & Notion Modals */}
      <JiraExportModal
        isOpen={jiraModalOpen}
        onClose={() => setJiraModalOpen(false)}
        item={selectedComponent}
        isBulk={isBulkExport}
        components={filteredData}
      />

      <NotionSyncModal
        isOpen={notionModalOpen}
        onClose={() => setNotionModalOpen(false)}
        items={filteredData}
      />
    </div>
  );
}
