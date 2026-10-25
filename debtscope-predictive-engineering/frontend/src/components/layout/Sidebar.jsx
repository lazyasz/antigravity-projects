import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid,
  Flame,
  Activity,
  Bot,
  Layers,
  GitBranch,
  ShieldCheck,
  Zap,
  Sliders,
  Network,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Integrations Hub', to: '/integrations', icon: Layers, badge: 'Hub' },
  { name: 'Simulator & Gates', to: '/simulator', icon: Sliders, badge: 'ROI' },
  { name: 'Debt Matrix', to: '/priorities', icon: Grid, badge: '5D' },
  { name: 'Code Hotspots', to: '/hotspots', icon: Flame, badge: 'AST' },
  { name: 'Telemetry & ML', to: '/predictions', icon: Activity, badge: 'SZZ' },
  { name: 'Data Lineage & Quality', to: '/data-quality', icon: ShieldCheck, badge: 'Audit' },
  { name: 'Copilot Refactor', to: '/copilot', icon: Bot, badge: 'AI' },
];

export default function Sidebar({ open, onClose, onOpenScanModal }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0b0714]/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-[#e2e4ea] transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 h-18 px-5 border-b border-[#e2e4ea]">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#130e24] text-white border border-[#261c47]">
            <Network className="w-4 h-4 text-[#b39ef2]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0f1015] tracking-tight">DebtScope</h1>
            <p className="text-[10px] font-mono text-[#5b42a5] font-semibold leading-tight">Intelligence Mesh</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
          <div>
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-[#88909e]">
              Decision Engine
            </span>
            <nav className="mt-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#130e24] text-white shadow-xs'
                        : 'text-[#525866] hover:bg-[#f3f4f8] hover:text-[#0f1015]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#f0ecfc] text-[#5b42a5]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Quick Repo Scan Trigger */}
          <div className="p-3.5 bg-[#f8f9fb] rounded-xl border border-[#e2e4ea] space-y-2">
            <div className="flex items-center gap-2 text-[#0f1015]">
              <GitBranch className="w-4 h-4 text-[#7048e8]" />
              <span className="text-xs font-bold">Repository Scanner</span>
            </div>
            <p className="text-[11px] text-[#525866] leading-snug">
              Analyze AST metrics & ML risk for public GitHub repositories.
            </p>
            <button
              onClick={() => {
                if (onClose) onClose();
                if (onOpenScanModal) onOpenScanModal();
              }}
              className="w-full mt-1 py-1.5 px-3 bg-white hover:bg-[#f0ecfc] text-[#5b42a5] text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 border border-[#e2e4ea] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#7048e8]" />
              <span>Scan Repository AST</span>
            </button>
          </div>
        </div>

        {/* System Health Footer */}
        <div className="p-3.5 m-3 bg-[#f8f9fb] rounded-xl border border-[#e2e4ea]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#0f1015]">System Health</span>
            <span className="bg-[#f0ecfc] text-[#5b42a5] px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">
              94.2%
            </span>
          </div>
          <div className="w-full bg-[#e2e4ea] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#7048e8] h-full rounded-full w-[94.2%]"></div>
          </div>
          <p className="text-[10px] text-[#88909e] mt-1.5 leading-tight font-mono">
            AST defect triage active across 48 services.
          </p>
        </div>
      </aside>
    </>
  );
}
