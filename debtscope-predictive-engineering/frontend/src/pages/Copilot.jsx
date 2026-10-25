import React from 'react';
import CopilotShell from '../components/copilot/CopilotShell';
import { Bot, Sparkles } from 'lucide-react';

export default function Copilot() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Top Header */}
      <section className="p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f1db] text-[#2d3f16] font-mono text-[11px] font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#43562b] animate-pulse"></span>
              Conversational Code Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#161e10] tracking-tight">
            AI Engineering & Refactoring Copilot
          </h1>
          <p className="text-sm text-[#45483e]">
            Query your codebase telemetry, analyze ML defect forecasts, and generate verified AST refactoring diffs in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#d3e4ac] text-[#2d3f16] text-xs font-mono font-bold">
            GSD + Roo + Ralph Enabled
          </span>
        </div>
      </section>

      {/* Main Interactive Copilot Shell */}
      <CopilotShell />
    </div>
  );
}
