import React, { useState } from 'react';
import { 
  GitBranch, 
  Search, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  ShieldAlert, 
  Cpu, 
  Sparkles, 
  Star, 
  GitFork, 
  FileCode, 
  ExternalLink,
  Flame,
  Activity,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scanRepository } from '../../services/api';

export default function ScanRepoModal({ isOpen, onClose, onScanComplete }) {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const popularRepos = [
    { name: 'Flask Framework', repo: 'pallets/flask', tag: 'Python' },
    { name: 'FastAPI Core', repo: 'tiangolo/fastapi', tag: 'Python' },
    { name: 'Requests HTTP', repo: 'psf/requests', tag: 'Python' },
    { name: 'Apache Zookeeper', repo: 'apache/zookeeper', tag: 'Lakehouse' },
    { name: 'Apache Commons-IO', repo: 'apache/commons-io', tag: 'Lakehouse' },
    { name: 'Express.js', repo: 'expressjs/express', tag: 'Node.js' },
  ];

  const handleScan = async (targetRepo) => {
    const repoToScan = targetRepo || repoInput;
    if (!repoToScan || !repoToScan.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadingStep('Connecting to GitHub API & fetching file tree...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Performing AST lexical analysis & complexity profiling...');
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Evaluating SZZ Random Forest ML defect predictor...');
    }, 2400);

    try {
      const data = await scanRepository(repoToScan.trim());
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (data && data.status === 'SUCCESS') {
        setResult(data);
        if (onScanComplete) {
          onScanComplete(data);
        }
      } else {
        throw new Error(data.message || 'Repository scan failed to return valid metrics.');
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      console.error('Scan error:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Failed to scan repository. Please verify the repository name or URL.';
      setError(errMsg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const getRiskColor = (prob) => {
    if (prob >= 0.7) return 'bg-[#ba1a1a]/10 text-[#ba1a1a] border-[#ba1a1a]/30';
    if (prob >= 0.4) return 'bg-[#e5a000]/10 text-[#a06800] border-[#e5a000]/30';
    return 'bg-[#43562b]/10 text-[#43562b] border-[#43562b]/30';
  };

  const getQuadrantBadge = (quadrant) => {
    switch (quadrant) {
      case 'QUICK_WIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eef7e0] text-[#3d671d] border border-[#c4e498]">Quick Win</span>;
      case 'STRATEGIC_REFACTOR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#93000a] border border-[#ffb4ab]">Strategic Refactor</span>;
      case 'OPPORTUNISTIC':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf1e8] text-[#45483e] border border-[#c5c8ba]">Opportunistic</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f6f0] text-[#75786d]">Deprioritized</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161e10]/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#d4dece] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5ebe0] bg-[#f4f6f0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#43562b] flex items-center justify-center text-white shadow-md">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#161e10] leading-tight">Live Repository Scanner</h3>
              <p className="text-xs text-[#45483e]">Extract live AST metrics, code complexity, and SZZ ML defect risk from any GitHub repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#75786d] hover:text-[#161e10] hover:bg-[#e5ebe0] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Input & Scan Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75786d]" />
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="e.g. pallets/flask, tiangolo/fastapi, or https://github.com/org/repo"
                className="w-full pl-10 pr-4 py-3 bg-[#f8faf6] border border-[#c5c8ba] rounded-2xl text-sm text-[#161e10] placeholder-[#75786d] focus:outline-none focus:ring-2 focus:ring-[#43562b] focus:border-transparent transition"
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                disabled={loading}
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={loading || !repoInput.trim()}
              className="px-6 py-3 bg-[#43562b] hover:bg-[#2d3f16] text-white text-sm font-semibold rounded-2xl shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan AST</span>
                </>
              )}
            </button>
          </div>

          {/* Loading status message */}
          {loading && (
            <div className="flex items-center gap-3 p-4 bg-[#eef7e0] border border-[#d3ebb2] rounded-2xl animate-pulse">
              <Loader2 className="w-5 h-5 text-[#43562b] animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#2d3f16]">{loadingStep || 'Processing repository...'}</p>
                <p className="text-[11px] text-[#556437]">Querying GitHub AST trees, measuring branch complexity, and running ML inference</p>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          {!result && (
            <div>
              <span className="text-[11px] font-bold text-[#75786d] uppercase tracking-wider block mb-2">Preloaded & Live Presets</span>
              <div className="flex flex-wrap gap-2">
                {popularRepos.map((preset) => (
                  <button
                    key={preset.repo}
                    onClick={() => {
                      setRepoInput(preset.repo);
                      handleScan(preset.repo);
                    }}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#edf1e8] hover:bg-[#dde5d7] rounded-full text-xs font-medium text-[#2d3f16] transition border border-[#d4dece] disabled:opacity-50"
                  >
                    <span>{preset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white text-[#556437] font-semibold">{preset.tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-[#ffdad6] border border-[#ffb4ab] rounded-2xl flex items-start gap-3 text-[#93000a] text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Scan Encountered an Issue</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Dynamic Result Card */}
          {result && (
            <div className="space-y-4 animate-slide-up">
              {/* Repo Info Header Card */}
              <div className="p-4 bg-[#f8faf6] border border-[#d4dece] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#43562b]" />
                    <span className="text-base font-extrabold text-[#161e10]">
                      {result.repository?.full_name || result.repository?.name || repoInput}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#43562b] text-white">
                      {result.repository?.language || 'Code'}
                    </span>
                    {result.repository?.default_branch && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#edf1e8] text-[#45483e]">
                        {result.repository.default_branch}
                      </span>
                    )}
                  </div>
                  {result.repository?.description && (
                    <p className="text-xs text-[#45483e] line-clamp-1">{result.repository.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  {result.repository?.stars > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#75786d] bg-white px-2.5 py-1 rounded-xl border border-[#d4dece]">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{result.repository.stars.toLocaleString()}</span>
                    </div>
                  )}
                  {result.repository?.url && (
                    <a
                      href={result.repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-white text-[#45483e] hover:text-[#161e10] rounded-xl border border-[#d4dece] transition"
                      title="Open GitHub repository"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* 4 Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-[#d4dece]">
                  <span className="text-[10px] text-[#75786d] uppercase font-bold block">Scanned Files</span>
                  <span className="text-lg font-extrabold text-[#161e10]">
                    {result.summary?.total_files_analyzed || result.files?.length || 0}
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-[#d4dece]">
                  <span className="text-[10px] text-[#75786d] uppercase font-bold block">Total LOC</span>
                  <span className="text-lg font-extrabold text-[#161e10]">
                    {(result.summary?.total_loc || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-[#d4dece]">
                  <span className="text-[10px] text-[#75786d] uppercase font-bold block">Avg AST Complexity</span>
                  <span className="text-lg font-extrabold text-[#161e10]">
                    {result.summary?.avg_cyclomatic_complexity || 0}
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-2xl shadow-xs border border-[#d4dece]">
                  <span className="text-[10px] text-[#75786d] uppercase font-bold block">Technical Risk</span>
                  <span className="text-lg font-extrabold text-[#ba1a1a]">
                    {result.summary?.overall_technical_risk_score || 0} / 100
                  </span>
                </div>
              </div>

              {/* Scanned Files List */}
              {result.files && result.files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#161e10] flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-[#43562b]" />
                      <span>Scanned Source Files ({result.files.length})</span>
                    </span>
                    <span className="text-[11px] text-[#75786d]">
                      {result.summary?.high_risk_hotspots_count || 0} high-severity defect hotspots detected
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#f0f4ec] border border-[#e5ebe0] rounded-2xl bg-white p-2">
                    {result.files.map((file, idx) => (
                      <div key={file.file_id || idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs py-1.5 px-2 hover:bg-[#f8faf6] rounded-xl transition">
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-3">
                          <FileCode className="w-3.5 h-3.5 text-[#75786d] shrink-0" />
                          <span className="font-mono text-xs text-[#161e10] truncate" title={file.file_path}>
                            {file.file_path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#75786d] font-semibold">{file.lines_of_code} LOC</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#edf1e8] text-[#2d3f16] font-medium">
                            v(G): {file.complexity}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRiskColor(file.defect_probability || 0)}`}>
                            {Math.round((file.defect_probability || 0) * 100)}% Defect Risk
                          </span>
                          {getQuadrantBadge(file.quadrant)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e5ebe0]">
                <button
                  onClick={() => {
                    setResult(null);
                    setRepoInput('');
                  }}
                  className="text-xs font-semibold text-[#75786d] hover:text-[#161e10] transition"
                >
                  Scan another repository
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/hotspots');
                    }}
                    className="px-4 py-2 bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] text-xs font-bold rounded-xl transition border border-[#d4dece]"
                  >
                    View Hotspots
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/priorities');
                    }}
                    className="px-4 py-2 bg-[#43562b] hover:bg-[#2d3f16] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>Open in 5D Debt Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
