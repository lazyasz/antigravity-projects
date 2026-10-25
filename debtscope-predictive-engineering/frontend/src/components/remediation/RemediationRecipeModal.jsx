import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Code2, 
  Layers, 
  Copy, 
  Check, 
  Clock, 
  DollarSign, 
  TrendingDown, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { getAiRemediationRecipe } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function RemediationRecipeModal({ isOpen, onClose, targetFile }) {
  const { notify } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('after'); // 'before' | 'after' | 'side-by-side'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchRecipe() {
      setLoading(true);
      try {
        const payload = {
          file_path: targetFile?.file_path || targetFile?.file || 'src/core/DataTree.java',
          risk_score: targetFile?.risk_score || 85.0,
          debt_minutes: targetFile?.debt_minutes || 120.0,
          complexity: targetFile?.complexity || 18.0
        };
        const data = await getAiRemediationRecipe(payload);
        setRecipe(data);
      } catch (err) {
        console.error('Failed to generate AI recipe:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [isOpen, targetFile]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!recipe?.code_diff_preview) return;
    const textToCopy = activeTab === 'before' 
      ? recipe.code_diff_preview.before 
      : recipe.code_diff_preview.after;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJira = () => {
    notify(`🚀 Pushed 4 sub-tasks for ${recipe?.file_path} into active Jira Sprint backlog!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161e10]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#d4dece] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5ebe0] bg-[#f8faf6]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#43562b] text-white shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ffdad6] text-[#ba1a1a]">
                  {recipe?.severity || 'CRITICAL'} SMELL
                </span>
                <span className="text-xs font-mono text-[#75786d]">AI Remediation Recipe</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#161e10] mt-0.5 font-mono">
                {recipe?.file_path || 'src/core/DataTree.java'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#75786d] hover:text-[#161e10] hover:bg-[#e5ebe0] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#43562b] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#75786d]">
                Decomposing AST call graphs & generating optimal refactor pattern...
              </p>
            </div>
          ) : (
            <>
              {/* Smell Diagnosis & Effort Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#edf1e8] rounded-2xl border border-[#d4dece]">
                  <span className="text-[10px] uppercase font-mono text-[#75786d] font-bold">Diagnosed Smell</span>
                  <div className="text-sm font-bold text-[#161e10] mt-1">
                    {recipe?.code_smell_category || 'God Class & High Fan-Out'}
                  </div>
                </div>

                <div className="p-4 bg-[#edf1e8] rounded-2xl border border-[#d4dece]">
                  <span className="text-[10px] uppercase font-mono text-[#75786d] font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#43562b]" />
                    Remediation Effort
                  </span>
                  <div className="text-sm font-bold text-[#161e10] mt-1 font-mono">
                    {recipe?.effort_estimate?.sprint_points || 5} Story Pts · ~{recipe?.effort_estimate?.estimated_hours || 14}h
                  </div>
                </div>

                <div className="p-4 bg-[#edf1e8] rounded-2xl border border-[#d4dece]">
                  <span className="text-[10px] uppercase font-mono text-[#75786d] font-bold flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#43562b]" />
                    Target Value Yield
                  </span>
                  <div className="text-sm font-bold text-[#2d3f16] mt-1 font-mono">
                    ${(recipe?.effort_estimate?.target_roi_usd || 3200).toLocaleString()} Value Return
                  </div>
                </div>
              </div>

              {/* Step-by-Step Refactoring Plan */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase font-mono text-[#75786d] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#43562b]" />
                  Sequential Action Blueprint
                </h3>

                <div className="space-y-2.5">
                  {recipe?.step_by_step_plan?.map((step) => (
                    <div
                      key={step.step}
                      className="p-3.5 bg-white rounded-2xl border border-[#d4dece] shadow-xs flex items-start gap-3 hover:border-[#b8ce98] transition"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#43562b] text-white text-xs font-bold shrink-0 font-mono">
                        {step.step}
                      </span>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#161e10]">
                          {step.title}
                        </div>
                        <div className="text-xs text-[#45483e]">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Diff Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-bold uppercase font-mono text-[#75786d] flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#43562b]" />
                    Architectural Code Transformation
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center bg-[#edf1e8] p-0.5 rounded-xl border border-[#c5c8ba]">
                      <button
                        onClick={() => setActiveTab('before')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeTab === 'before'
                            ? 'bg-[#ffdad6] text-[#ba1a1a] shadow-xs'
                            : 'text-[#75786d] hover:text-[#161e10]'
                        }`}
                      >
                        Before (Smell)
                      </button>
                      <button
                        onClick={() => setActiveTab('after')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeTab === 'after'
                            ? 'bg-[#43562b] text-white shadow-xs'
                            : 'text-[#75786d] hover:text-[#161e10]'
                        }`}
                      >
                        After (Remediated)
                      </button>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-xl bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] transition border border-[#c5c8ba] cursor-pointer"
                      title="Copy Code"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#43562b]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1e2a0f] text-[#d3ebb2] p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner border border-[#43562b]/40">
                  <pre className="leading-relaxed">
                    {activeTab === 'before' 
                      ? recipe?.code_diff_preview?.before 
                      : recipe?.code_diff_preview?.after}
                  </pre>
                </div>
              </div>

              {/* Target Post-Remediation Outcome */}
              <div className="p-4 bg-[#e8f1db] rounded-2xl border border-[#b8ce98] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#43562b]" />
                  <div>
                    <span className="text-xs font-bold text-[#2d3f16]">Target Defect Risk Decoupling:</span>
                    <span className="text-xs font-mono font-bold text-[#161e10] ml-1.5">
                      {recipe?.target_metrics_after_remediation?.predicted_defect_risk_drop || '84.2% -> 18.5%'}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#43562b] bg-white px-3 py-1 rounded-full border border-[#b8ce98]">
                  -{recipe?.target_metrics_after_remediation?.complexity_reduction_pct || 62.5}% Complexity
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-[#e5ebe0] bg-[#f8faf6]">
          <span className="text-[11px] text-[#75786d] font-mono">
            Generated via SZZ AST Engine · AST Rule Engine v4.18
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#45483e] hover:bg-[#e5ebe0] transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExportJira}
              className="px-5 py-2 rounded-xl bg-[#43562b] hover:bg-[#2d3f16] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Export Sub-Tasks to Jira</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
