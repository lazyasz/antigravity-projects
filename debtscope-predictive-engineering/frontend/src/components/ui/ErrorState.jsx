import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Failed to load telemetry pipeline.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none animate-fade-in">
      <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#fef2f2] border border-[#fee2e2]">
        <AlertCircle className="h-5 w-5 text-[#dc2626]" />
      </div>
      <p className="mt-3 text-xs font-bold text-[#0f1015]">Telemetry Service Error</p>
      <p className="mt-1 text-xs text-[#525866] max-w-md font-mono">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#130e24] hover:bg-[#20173d] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
}
