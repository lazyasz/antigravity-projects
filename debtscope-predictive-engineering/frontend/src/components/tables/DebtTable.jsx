import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatScore, getRiskLabel } from '../../utils/risk';
import { Code2, ArrowRight, Search } from 'lucide-react';
import SpringTabs from '../ui/SpringTabs';

export default function DebtTable({ data }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  if (!data || data.length === 0) return null;

  const normalizeItem = (item, idx) => {
    const file = item.file_path || item.file_name || item.file || item.path || item.description || `module_${item.file_id || idx + 1}`;
    const category = item.category || item.debt_category || item.issue_type || 'Architecture';
    const severity = (item.severity || (item.risk_score >= 80 ? 'critical' : item.risk_score >= 60 ? 'high' : 'medium')).toLowerCase();
    const currentRisk = item.risk_score ?? item.technical_risk ?? item.current_risk ?? 72.0;
    const predictedRisk = item.predicted_risk ?? item.predicted_future_risk ?? item.predicted_defects ?? 65.0;
    const businessImpact = item.business_impact ?? item.impact_score ?? 7.5;
    const priorityLevel = (item.priority_level || item.priority || (currentRisk >= 80 ? 'CRITICAL' : 'HIGH')).toUpperCase();
    const id = item.file_id || item.id || idx + 1;

    return { id, file, category, severity, currentRisk, predictedRisk, businessImpact, priorityLevel };
  };

  const normalizedList = data.map(normalizeItem);

  const categories = ['ALL', ...new Set(normalizedList.map(item => item.category.toUpperCase()))];
  const categoryTabs = categories.map(cat => ({
    id: cat,
    label: cat,
    count: cat === 'ALL' ? normalizedList.length : normalizedList.filter(i => i.category.toUpperCase() === cat).length
  }));

  const filteredItems = normalizedList.filter(item => {
    const matchesCategory = activeCategory === 'ALL' || item.category.toUpperCase() === activeCategory;
    const matchesSearch = !search.trim() || item.file.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full space-y-4">
      {/* Search & Category Filter Controls using SpringTabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e2e4ea]">
        <div className="overflow-x-auto pb-1 max-w-full">
          <SpringTabs
            tabs={categoryTabs}
            activeTab={activeCategory}
            onChange={setActiveCategory}
            size="md"
          />
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#8b909a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter files or debt types..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#f8f9fb] border border-[#e2e4ea] rounded-xl text-xs text-[#130e24] placeholder-[#8b909a] focus:outline-none focus:ring-2 focus:ring-[#7048e8]/30 font-mono transition"
          />
        </div>
      </div>

      {/* Mobile Card List (Reflow for < 768px) */}
      <div className="md:hidden space-y-3">
        {filteredItems.map((item, idx) => {
          return (
            <div
              key={item.id || idx}
              onClick={() => navigate(`/files/${item.id}`)}
              className="p-4 bg-[#f8f9fb] hover:bg-[#f0ecff]/40 border border-[#e2e4ea] rounded-2xl transition cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Code2 className="w-4 h-4 text-[#7048e8] shrink-0" />
                  <span className="font-mono font-bold text-sm text-[#130e24] truncate">
                    {item.file}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shrink-0 ${
                  item.severity === 'critical'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {item.severity.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e2e4ea] text-center">
                <div className="bg-white p-2 rounded-xl border border-[#e2e4ea]">
                  <span className="text-[11px] font-mono text-[#525866] block">Current</span>
                  <span className="font-mono font-bold text-sm text-rose-600 whitespace-nowrap tnum">
                    {formatScore(item.currentRisk)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#e2e4ea]">
                  <span className="text-[11px] font-mono text-[#525866] block">Predicted</span>
                  <span className="font-mono font-bold text-sm text-amber-600 whitespace-nowrap tnum">
                    {formatScore(item.predictedRisk)}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-[#e2e4ea]">
                  <span className="text-[11px] font-mono text-[#525866] block">Impact</span>
                  <span className="font-mono font-bold text-sm text-[#130e24] whitespace-nowrap tnum">
                    {formatScore(item.businessImpact)}/10
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#525866] font-medium bg-[#f0ecff] text-[#5b42a5] px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/files/${item.id}`);
                  }}
                  className="px-3 py-1.5 bg-[#130e24] hover:bg-[#7048e8] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
            <tr className="border-b border-[#e2e4ea] text-[#525866] uppercase font-mono text-xs">
              <th className="py-3 px-4 font-bold">Module File</th>
              <th className="py-3 px-4 font-bold">Category</th>
              <th className="py-3 px-4 font-bold text-center">Severity</th>
              <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Current Risk</th>
              <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Predicted Risk</th>
              <th className="py-3 px-4 font-bold text-center whitespace-nowrap">Business Impact</th>
              <th className="py-3 px-4 font-bold text-center">Priority</th>
              <th className="py-3 px-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f1f5]">
            {filteredItems.map((item, idx) => {
              return (
                <tr
                  key={item.id || idx}
                  onClick={() => navigate(`/files/${item.id}`)}
                  className="hover:bg-[#f8f9fb] cursor-pointer transition group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#7048e8] shrink-0" />
                      <span className="font-mono font-semibold text-[#130e24] group-hover:text-[#7048e8] transition">
                        {item.file}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#525866] font-medium whitespace-nowrap">{item.category}</td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      item.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {getRiskLabel(item.severity)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600 whitespace-nowrap tnum">
                    {formatScore(item.currentRisk)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600 whitespace-nowrap tnum">
                    {formatScore(item.predictedRisk)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-[#130e24] whitespace-nowrap tnum">
                    {formatScore(item.businessImpact)} / 10
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      item.priorityLevel === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-[#f0ecff] text-[#5b42a5] border border-[#d8cffc]/60'
                    }`}>
                      {item.priorityLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/files/${item.id}`);
                      }}
                      className="px-3 py-1.5 bg-[#130e24] hover:bg-[#7048e8] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ml-auto cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
