import React, { useState } from 'react';
import { 
  Sliders, 
  GitPullRequest, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Zap,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import WhatIfSimulator from '../components/simulator/WhatIfSimulator';
import FinancialTcoEngine from '../components/simulator/FinancialTcoEngine';
import PrRiskGateSimulator from '../components/cicd/PrRiskGateSimulator';
import CodebaseTopologyTreemap from '../components/topology/CodebaseTopologyTreemap';
import RemediationRecipeModal from '../components/remediation/RemediationRecipeModal';
import ExecutiveReportModal from '../components/reports/ExecutiveReportModal';
import SpringTabs from '../components/ui/SpringTabs';

export default function Simulator() {
  const [activeTab, setActiveTab] = useState('what-if'); // 'what-if' | 'financial-tco' | 'topology' | 'pr-gate'
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeTargetFile, setRecipeTargetFile] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedModuleForSimulator, setSelectedModuleForSimulator] = useState(null);

  const handleOpenRecipe = (fileObj) => {
    setRecipeTargetFile(fileObj);
    setRecipeModalOpen(true);
  };

  const handleOpenSimulator = (fileObj) => {
    setSelectedModuleForSimulator(fileObj);
    setActiveTab('what-if');
  };

  const tabs = [
    { id: 'what-if', label: 'What-If ROI Simulator', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'financial-tco', label: 'Executive Financial TCO', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'topology', label: 'Hotspot Treemap', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'pr-gate', label: 'CI/CD Risk Gate', icon: <GitPullRequest className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Top Hero Banner with Mode Selector */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-[#e2e4ea] shadow-2xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f0ecfc] text-[#5b42a5] font-mono text-[11px] font-bold tracking-wide uppercase border border-[#d8cdfa]">
              <Zap className="w-3 h-3 text-[#7048e8]" />
              Simulation & Financial TCO Engine
            </span>
            <span className="text-[11px] text-[#525866] font-mono">Real-time SZZ & ISO/IEC 25010 Models</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#0f1015] tracking-tight">
            Refactoring ROI, Financial TCO & Pre-Merge Risk Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#525866] max-w-3xl">
            Simulate code improvements with real-time projection curves, compute balance-sheet TCO interest, explore spatial topology, and enforce automated pre-merge gates.
          </p>
        </div>

        {/* Action Button: 1-Click Executive PDF Report */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#130e24] hover:bg-[#20173d] text-white text-xs font-semibold transition shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Audit PDF</span>
          </button>
        </div>
      </section>

      {/* Feature Switcher Tabs */}
      <div>
        <SpringTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          size="md"
        />
      </div>

      {/* Active Feature Component */}
      <div className="space-y-6">
        {activeTab === 'what-if' && (
          <WhatIfSimulator
            initialModule={selectedModuleForSimulator}
            onOpenRecipe={handleOpenRecipe}
          />
        )}

        {activeTab === 'financial-tco' && (
          <FinancialTcoEngine
            onOpenBoardroomReport={() => setReportModalOpen(true)}
          />
        )}

        {activeTab === 'topology' && (
          <CodebaseTopologyTreemap
            onOpenRecipe={handleOpenRecipe}
            onOpenSimulator={handleOpenSimulator}
          />
        )}

        {activeTab === 'pr-gate' && (
          <PrRiskGateSimulator
            onOpenRecipe={handleOpenRecipe}
          />
        )}
      </div>

      {/* Modals */}
      <RemediationRecipeModal
        isOpen={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        targetFile={recipeTargetFile}
      />

      <ExecutiveReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

    </div>
  );
}
