import React, { useState } from 'react';
import { 
  Flame, 
  Layers, 
  Sparkles, 
  Search, 
  Filter, 
  Sliders, 
  Code2, 
  Cpu, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_TOPOLOGY_MODULES = [
  { id: 1, file: 'src/core/DataTree.java', size: 450, churn: 280, complexity: 24.5, risk_score: 91.2, debt_minutes: 180, category: 'Core AST' },
  { id: 2, file: 'src/services/auth/token_provider.py', size: 380, churn: 195, complexity: 22.0, risk_score: 89.2, debt_minutes: 160, category: 'Security' },
  { id: 3, file: 'src/pipeline/analytics/spark_aggregator.py', size: 410, churn: 320, complexity: 20.5, risk_score: 85.6, debt_minutes: 150, category: 'Big Data' },
  { id: 4, file: 'src/api/routes/transaction_billing.py', size: 340, churn: 210, complexity: 18.0, risk_score: 81.4, debt_minutes: 120, category: 'API' },
  { id: 5, file: 'src/models/decision_matrix_calculator.py', size: 290, churn: 140, complexity: 16.5, risk_score: 75.0, debt_minutes: 90, category: 'ML Engine' },
  { id: 6, file: 'src/pipeline/ingestion/kafka_stream.py', size: 260, churn: 130, complexity: 14.0, risk_score: 68.2, debt_minutes: 80, category: 'Big Data' },
  { id: 7, file: 'src/services/notification/dispatch_queue.py', size: 220, churn: 90, complexity: 12.0, risk_score: 61.5, debt_minutes: 60, category: 'Services' },
  { id: 8, file: 'src/api/middleware/rate_limiter.py', size: 180, churn: 75, complexity: 10.5, risk_score: 54.0, debt_minutes: 45, category: 'API' },
  { id: 9, file: 'src/core/parser/ast_visitor.py', size: 190, churn: 60, complexity: 9.0, risk_score: 46.2, debt_minutes: 40, category: 'Core AST' },
  { id: 10, file: 'src/utils/crypto_signer.py', size: 140, churn: 40, complexity: 7.5, risk_score: 38.0, debt_minutes: 30, category: 'Security' },
  { id: 11, file: 'src/pipeline/delta/storage_writer.py', size: 160, churn: 50, complexity: 6.0, risk_score: 31.5, debt_minutes: 25, category: 'Big Data' },
  { id: 12, file: 'src/utils/logger_context.py', size: 110, churn: 25, complexity: 4.0, risk_score: 22.0, debt_minutes: 15, category: 'Utils' },
  { id: 13, file: 'src/models/feature_encoder.py', size: 130, churn: 30, complexity: 5.0, risk_score: 26.4, debt_minutes: 20, category: 'ML Engine' },
  { id: 14, file: 'src/api/schema/health_response.py', size: 90, churn: 15, complexity: 2.5, risk_score: 14.2, debt_minutes: 10, category: 'API' },
];

export default function CodebaseTopologyTreemap({ onSelectModule, onOpenRecipe, onOpenSimulator }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedModule, setSelectedModule] = useState(DEFAULT_TOPOLOGY_MODULES[0]);

  const categories = ['ALL', 'Core AST', 'Security', 'Big Data', 'API', 'ML Engine', 'Services', 'Utils'];

  const filteredModules = DEFAULT_TOPOLOGY_MODULES.filter((m) => {
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch = m.file.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTileStyle = (risk) => {
    if (risk >= 80) {
      return 'bg-gradient-to-br from-[#ba1a1a] to-[#730006] text-white border-[#ba1a1a]/50 shadow-[0_4px_16px_rgba(186,26,26,0.25)]';
    } else if (risk >= 60) {
      return 'bg-gradient-to-br from-[#b26a00] to-[#723f00] text-white border-[#b26a00]/50 shadow-[0_4px_16px_rgba(178,106,0,0.2)]';
    } else if (risk >= 40) {
      return 'bg-gradient-to-br from-[#556437] to-[#384a24] text-white border-[#556437]/50';
    } else {
      return 'bg-gradient-to-br from-[#43562b] to-[#253314] text-[#d3ebb2] border-[#43562b]/40';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_24px_-4px_rgba(45,63,22,0.08)] p-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e5ebe0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#e8f1db] text-[#2d3f16]">
              <Layers className="w-5 h-5 text-[#43562b]" />
            </span>
            <h2 className="text-xl font-extrabold text-[#161e10] tracking-tight">
              Interactive Codebase Hotspot Treemap & Topology
            </h2>
          </div>
          <p className="text-xs text-[#75786d] mt-1">
            Spatial distribution where <strong>box volume = code churn/LOC</strong> and <strong>color gradient = SZZ ML defect risk</strong>.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-[#75786d] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search file path..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#f8faf6] rounded-xl border border-[#c5c8ba] text-xs text-[#161e10] focus:ring-2 focus:ring-[#43562b] outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#edf1e8] p-1 rounded-xl border border-[#c5c8ba] overflow-x-auto max-w-full">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#43562b] text-white shadow-xs'
                    : 'text-[#75786d] hover:text-[#161e10]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Treemap Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Treemap Visual Tiles (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#75786d] px-1">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#43562b]"></span> Safe (&lt;40%)
              <span className="w-3 h-3 rounded-md bg-[#556437] ml-2"></span> Moderate (40-60%)
              <span className="w-3 h-3 rounded-md bg-[#b26a00] ml-2"></span> High (60-80%)
              <span className="w-3 h-3 rounded-md bg-[#ba1a1a] ml-2"></span> Critical (&gt;80%)
            </span>
            <span>{filteredModules.length} Modules Mapped</span>
          </div>

          {/* Treemap Grid Simulation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 min-h-[380px]">
            {filteredModules.map((module) => {
              const isSelected = selectedModule?.id === module.id;
              const isLarge = module.size > 300;
              const isMedium = module.size > 200 && module.size <= 300;
              
              return (
                <div
                  key={module.id}
                  onClick={() => {
                    setSelectedModule(module);
                    if (onSelectModule) onSelectModule(module);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group ${
                    getTileStyle(module.risk_score)
                  } ${
                    isSelected 
                      ? 'ring-3 ring-[#43562b] ring-offset-2 scale-[1.02] shadow-xl' 
                      : 'hover:scale-[1.01] hover:shadow-lg'
                  } ${
                    isLarge ? 'col-span-2 row-span-2' : isMedium ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                  style={{ minHeight: isLarge ? '180px' : '110px' }}
                >
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider opacity-85 font-bold">
                        {module.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-black/25 backdrop-blur-md">
                        {module.risk_score}% RISK
                      </span>
                    </div>

                    <div className="text-xs font-bold font-mono truncate text-white mt-1">
                      {module.file.split('/').pop()}
                    </div>
                    <div className="text-[10px] font-mono opacity-75 truncate">
                      {module.file}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] font-mono opacity-90 relative z-10">
                    <span>{module.churn} Churn LOC</span>
                    <span className="font-bold">CC: {module.complexity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Module Detail Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#f8faf6] p-5 rounded-3xl border border-[#d4dece] space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[#75786d] font-bold">
                Selected Hotspot Inspector
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                selectedModule?.risk_score >= 80 ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e8f1db] text-[#2d3f16]'
              }`}>
                {selectedModule?.risk_score >= 80 ? 'CRITICAL HOTSPOT' : 'ACTIVE MODULE'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#161e10] font-mono break-all">
                {selectedModule?.file}
              </h3>
              <p className="text-xs text-[#556437] mt-0.5 font-medium">
                Category: {selectedModule?.category}
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-2xl border border-[#e2ecd5]">
                <span className="text-[10px] uppercase font-mono text-[#75786d]">SZZ Defect Risk</span>
                <div className="text-xl font-bold font-mono text-[#ba1a1a] mt-0.5">
                  {selectedModule?.risk_score}%
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#e2ecd5]">
                <span className="text-[10px] uppercase font-mono text-[#75786d]">Cyclomatic CC</span>
                <div className="text-xl font-bold font-mono text-[#161e10] mt-0.5">
                  {selectedModule?.complexity}
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#e2ecd5]">
                <span className="text-[10px] uppercase font-mono text-[#75786d]">Code Churn</span>
                <div className="text-xl font-bold font-mono text-[#161e10] mt-0.5">
                  {selectedModule?.churn} lines
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#e2ecd5]">
                <span className="text-[10px] uppercase font-mono text-[#75786d]">Debt Remediation</span>
                <div className="text-xl font-bold font-mono text-[#2d3f16] mt-0.5">
                  {selectedModule?.debt_minutes} mins
                </div>
              </div>
            </div>
          </div>

          {/* Direct Action Triggers */}
          <div className="space-y-2 pt-3 border-t border-[#e2ecd5]">
            <button
              onClick={() => onOpenRecipe && onOpenRecipe(selectedModule)}
              className="w-full py-2.5 px-4 bg-[#43562b] hover:bg-[#2d3f16] text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Remediation Recipe</span>
            </button>

            <button
              onClick={() => onOpenSimulator && onOpenSimulator(selectedModule)}
              className="w-full py-2.5 px-4 bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border border-[#c5c8ba] cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#43562b]" />
              <span>Simulate Refactoring What-If</span>
            </button>

            <button
              onClick={() => navigate(`/files/${selectedModule?.id}`)}
              className="w-full py-2 px-4 text-xs font-semibold text-[#75786d] hover:text-[#161e10] transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Full AST File Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
