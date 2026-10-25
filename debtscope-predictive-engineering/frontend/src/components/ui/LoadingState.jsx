import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingState({ message = 'Synchronizing AST telemetry & predictive models...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 select-none animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#e2e4ea] border-t-[#7048e8] animate-spin" />
        <Activity className="w-4 h-4 text-[#7048e8] absolute" />
      </div>
      <p className="mt-4 text-xs font-mono text-[#525866] font-medium tracking-tight">{message}</p>
    </div>
  );
}
