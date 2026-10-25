import React from 'react';
import { motion } from 'motion/react';

/**
 * SpringTabs
 * Fluid animated filter bar with gliding spring indicator.
 */
export default function SpringTabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  size = 'md',
  dark = false,
}) {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-3.5 py-2 text-sm gap-2.5',
  }[size] || 'px-3 py-1.5 text-xs gap-2';

  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg transition-colors ${
        dark
          ? 'bg-[#130e24] border border-[#261c47]'
          : 'bg-[#f3f4f8] border border-[#e2e4ea]'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center font-semibold tracking-tight rounded-md transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7048e8] ${sizeStyles} ${
              isActive
                ? dark
                  ? 'text-white'
                  : 'text-[#0f1015]'
                : dark
                ? 'text-[#b39ef2]/70 hover:text-white'
                : 'text-[#525866] hover:text-[#0f1015]'
            }`}
          >
            {/* Sliding Spring Background */}
            {isActive && (
              <motion.div
                layoutId="springTabPill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className={`absolute inset-0 rounded-md shadow-2xs ${
                  dark ? 'bg-[#261c47] border border-[#3b2c6d]' : 'bg-white border border-[#e2e4ea]'
                }`}
              />
            )}

            {/* Tab Label Content */}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? dark
                        ? 'bg-[#7048e8]/30 text-[#d8cdfa]'
                        : 'bg-[#f0ecfc] text-[#5b42a5]'
                      : dark
                      ? 'bg-white/10 text-[#b39ef2]'
                      : 'bg-[#e2e4ea] text-[#525866]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
