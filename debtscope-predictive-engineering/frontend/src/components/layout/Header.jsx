import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Settings, 
  Shield, 
  Layers, 
  Database, 
  ChevronDown, 
  GitBranch, 
  Command, 
  ArrowRight, 
  Activity, 
  Network,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LiveConnectionBadge from '../ui/LiveConnectionBadge';

export default function Header({ onMenuClick, onOpenScanModal }) {
  const { user, isLoggedIn, setAuthModalOpen, setSettingsOpen, handleLogout, notification } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    if (query.includes('hotspot') || query.includes('smell') || query.includes('god')) {
      navigate('/hotspots');
    } else if (query.includes('predict') || query.includes('defect') || query.includes('ml')) {
      navigate('/predictions');
    } else if (query.includes('matrix') || query.includes('priorit') || query.includes('jira')) {
      navigate('/priorities');
    } else if (query.includes('copilot') || query.includes('refactor') || query.includes('ai')) {
      navigate('/copilot');
    } else if (query.includes('simulat') || query.includes('what-if') || query.includes('tco') || query.includes('roi')) {
      navigate('/simulator');
    } else if (query.includes('debt') || query.includes('inventory')) {
      navigate('/debt');
    } else if (query.includes('quality') || query.includes('audit') || query.includes('lakehouse')) {
      navigate('/data-quality');
    } else {
      navigate('/dashboard');
    }
    setSearchQuery('');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/integrations': return 'Connected Integrations Hub';
      case '/simulator': return 'What-If & ROI Simulator';
      case '/debt': return 'Technical Debt Inventory';
      case '/predictions': return 'ML Defect Predictions';
      case '/priorities': return '5D Remediation Matrix';
      case '/hotspots': return 'Code Hotspots';
      case '/data-quality': return 'Data Quality & Lineage';
      case '/copilot': return 'Engineering Copilot';
      default: return 'DebtScope Platform';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-[#e2e4ea]">
        
        {/* Left: Mobile Toggle + Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-[#525866] hover:bg-[#f3f4f8] transition cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#130e24] flex items-center justify-center text-white">
              <Network className="w-3.5 h-3.5 text-[#b39ef2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs sm:text-sm text-[#0f1015] tracking-tight leading-none">DebtScope</span>
              <span className="text-[11px] font-mono text-[#525866] font-medium leading-tight hidden sm:block">{getPageTitle()}</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#f8f9fb] rounded-lg px-3.5 py-1.5 border border-[#e2e4ea] focus-within:border-[#7048e8] focus-within:bg-white transition">
            <Search className="w-3.5 h-3.5 text-[#88909e] mr-2 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search telemetry, modules, hot-zones (⌘K)..."
              className="bg-transparent border-none text-xs text-[#0f1015] placeholder-[#88909e] focus:outline-none w-full"
            />
            <span className="hidden lg:inline-block bg-white border border-[#e2e4ea] font-mono text-[10px] text-[#525866] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-2">
              ⌘K
            </span>
          </form>
        </div>

        {/* Right: Live Connection Badges, Settings & User Profile */}
        <div className="flex items-center gap-2">
          
          {/* Live Ecosystem Badges */}
          <div className="hidden xl:flex items-center gap-1.5 p-1">
            <LiveConnectionBadge type="google" onClick={() => setAuthModalOpen(true)} />
            <LiveConnectionBadge type="jira" onClick={() => setSettingsOpen(true)} />
            <LiveConnectionBadge type="notion" onClick={() => setSettingsOpen(true)} />
          </div>

          {/* User Profile / Sign In Section */}
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-[#f8f9fb] py-1 pl-1 pr-2.5 rounded-lg border border-[#e2e4ea] hover:border-[#d0d4de] transition cursor-pointer"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=130e24&color=ffffff`}
                  alt={user.name}
                  className="w-6 h-6 rounded-md object-cover ring-1 ring-[#130e24]/20"
                />
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-xs font-semibold text-[#0f1015] leading-tight truncate max-w-[100px]">{user.name}</span>
                  <span className="text-[10px] text-[#5b42a5] font-medium leading-tight truncate max-w-[100px]">{user.role}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-[#525866] transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#e2e4ea] p-3.5 z-50 animate-fade-in text-left">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#e2e4ea]">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-lg object-cover border border-[#e2e4ea]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0f1015] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#525866] truncate">{user.email}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 bg-[#f0ecfc] text-[#5b42a5] rounded">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 space-y-0.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#0f1015] hover:bg-[#f8f9fb] rounded-lg transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#7048e8]" /> Switch Persona / Account
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#88909e]" />
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-[#0f1015] hover:bg-[#f8f9fb] rounded-lg transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5 text-[#7048e8]" /> Ecosystem Settings
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#88909e]" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-[#e2e4ea]">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#dc2626] hover:bg-[#fef2f2] font-semibold rounded-lg transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#130e24] hover:bg-[#20173d] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#b39ef2]" />
              <span>Connect Auth</span>
            </button>
          )}

          {/* Quick Settings Gear */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg text-[#525866] hover:bg-[#f3f4f8] transition cursor-pointer"
            title="Ecosystem Integrations & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Live Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#130e24] text-white px-4 py-2.5 rounded-xl shadow-xl border border-[#261c47] flex items-center gap-2.5 animate-fade-in text-xs font-medium">
          <Info className="w-4 h-4 text-[#b39ef2]" />
          <span>{notification}</span>
        </div>
      )}
    </>
  );
}
