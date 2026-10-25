import React from 'react';

/**
 * Premium ChartTooltip for all Recharts visualizations across DebtScope.
 * Provides high-contrast, crystal-clear typography, glowing category dots,
 * and JetBrains Mono tabular values in the Lumina Obsidian palette.
 */
export default function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#130e24]/95 backdrop-blur-md border border-[#261c47] rounded-lg p-2.5 shadow-xl text-white text-xs space-y-1 min-w-[160px] pointer-events-none z-50 animate-fade-in">
      {label && (
        <div className="text-[11px] font-mono font-bold text-[#d8cdfa] tracking-wide border-b border-white/10 pb-1">
          {label}
        </div>
      )}
      <div className="space-y-1 pt-0.5">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: entry.color || entry.fill || '#7048e8' }}
              />
              <span className="text-white/80 truncate font-medium text-[11px]">
                {entry.name || 'Value'}:
              </span>
            </div>
            <span className="font-mono font-bold text-white text-xs whitespace-nowrap">
              {entry.value !== undefined ? entry.value : ''}
              {unit || entry.unit || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
