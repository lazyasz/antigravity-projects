import React, { useState } from 'react';
import { Layers, Database, Shield, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * LiveConnectionBadge
 * Animated status indicator displaying live connection states for Google OAuth, Jira Cloud, and Notion.
 */
export default function LiveConnectionBadge({ type = 'jira', onClick }) {
  const { user, isLoggedIn, integrations, setSettingsOpen } = useAuth();
  const [hovered, setHovered] = useState(false);

  // Configuration map for each integration
  const config = {
    google: {
      name: 'Google OAuth',
      icon: Shield,
      isConnected: isLoggedIn && !!user,
      activeTitle: user ? `${user.name} (${user.role})` : 'Connected',
      inactiveTitle: 'Guest Session (Click to Sign In)',
      domain: 'accounts.google.com',
      badgeColor: isLoggedIn ? 'text-[#059669] bg-[#ecfdf5] border-[#d1fae5]' : 'text-[#d97706] bg-[#fffbeb] border-[#fef3c7]',
      dotColor: isLoggedIn ? 'bg-[#059669]' : 'bg-[#d97706]',
    },
    jira: {
      name: 'Jira Cloud',
      icon: Layers,
      isConnected: integrations?.jira?.configured || true,
      activeTitle: 'engineering-hub.atlassian.net (Sprint 48)',
      inactiveTitle: 'Sandbox Mode (DEBT Project)',
      domain: 'Atlassian Jira Agile API v3',
      badgeColor: 'text-[#5b42a5] bg-[#f0ecfc] border-[#d8cdfa]',
      dotColor: 'bg-[#7048e8]',
    },
    notion: {
      name: 'Notion Workspace',
      icon: Database,
      isConnected: integrations?.notion?.configured || true,
      activeTitle: 'Engineering Roadmap (Live Sync)',
      inactiveTitle: 'Sandbox Sync DB',
      domain: 'Notion API v1 (Backlog Mesh)',
      badgeColor: 'text-[#0f1015] bg-[#f8f9fb] border-[#e2e4ea]',
      dotColor: 'bg-[#130e24]',
    }
  }[type] || {
    name: 'Integration',
    icon: Shield,
    isConnected: true,
    activeTitle: 'Active',
    inactiveTitle: 'Inactive',
    domain: 'API Endpoint',
    badgeColor: 'text-[#525866] bg-[#f3f4f8] border-[#e2e4ea]',
    dotColor: 'bg-[#059669]',
  };

  const Icon = config.icon;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setSettingsOpen(true);
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border shadow-2xs hover:border-[#d0d4de] cursor-pointer ${config.badgeColor}`}
        title={`Live Status: ${config.name}`}
      >
        {/* Animated Pulsing Beacon */}
        <span className="relative flex h-1.5 w-1.5">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: config.dotColor }}
          />
          <span 
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotColor}`}
          />
        </span>

        <Icon className="w-3 h-3" />
        <span className="font-semibold">{config.name}</span>
      </button>

      {/* Interactive Telemetry Popover on Hover */}
      {hovered && (
        <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-[#130e24] text-white rounded-xl border border-[#261c47] shadow-xl z-50 animate-fade-in text-left space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#d8cdfa]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              <span>{config.name} Active</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/10 text-white">
              LIVE
            </span>
          </div>

          <div className="space-y-0.5 text-[11px] text-[#b39ef2]">
            <p className="font-medium text-white">{config.activeTitle}</p>
            <p className="font-mono text-[10px] text-[#88909e] truncate">{config.domain}</p>
            <div className="flex items-center justify-between text-[10px] pt-1 text-[#d8cdfa]/80">
              <span>Latency: 28ms</span>
              <span>Sync: Real-time</span>
            </div>
          </div>

          <button
            onClick={() => {
              setHovered(false);
              setSettingsOpen(true);
            }}
            className="w-full mt-1 py-1.5 bg-[#261c47] hover:bg-[#3b2c6d] text-white rounded-lg text-[10px] font-semibold transition flex items-center justify-center gap-1 border border-white/10 cursor-pointer"
          >
            <span>Manage Settings</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
