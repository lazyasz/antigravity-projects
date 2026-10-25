/**
 * Member 4: Adesh - File Intelligence Explorer View
 * Module: file_intelligence.jsx
 * Description: Deep-dive explorer rendering cyclomatic complexity, author entropy, and risk breakdown.
 */

import React from 'react';
import { FileCode, AlertTriangle, Users, GitCommit } from 'lucide-react';

export const FileIntelligence = ({ file = {} }) => {
  const sampleFile = {
    filePath: file.filePath || 'src/services/payment_gateway.py',
    loc: file.loc || 482,
    cyclomaticComplexity: file.cyclomaticComplexity || 18.5,
    codeSmells: file.codeSmells || 14,
    ownershipEntropy: file.ownershipEntropy || 0.82,
    commitsLast90d: file.commitsLast90d || 34,
    topRiskDriver: file.topRiskDriver || 'Archetype Legacy Hotspot (40.7%)'
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-xl shadow-xl text-white">
      <div className="flex items-center gap-3 mb-6">
        <FileCode className="h-6 w-6 text-indigo-400" />
        <div>
          <h3 className="text-lg font-bold">{sampleFile.filePath}</h3>
          <p className="text-xs text-slate-400">Deep telemetry and causal risk driver analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60">
          <span className="text-xs text-slate-400">Cyclomatic Complexity</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{sampleFile.cyclomaticComplexity}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60">
          <span className="text-xs text-slate-400">Code Smells</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{sampleFile.codeSmells} issues</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60">
          <span className="text-xs text-slate-400">Ownership Entropy</span>
          <div className="text-xl font-bold text-purple-400 mt-1">{sampleFile.ownershipEntropy}</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60">
          <span className="text-xs text-slate-400">90d Commit Churn</span>
          <div className="text-xl font-bold text-cyan-400 mt-1">{sampleFile.commitsLast90d} commits</div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-medium text-slate-300">Primary Risk Driver:</span>
          <span className="text-sm font-semibold text-rose-400">{sampleFile.topRiskDriver}</span>
        </div>
        <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-md transition-colors">
          Launch AI Copilot Refactor
        </button>
      </div>
    </div>
  );
};

export default FileIntelligence;
