import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Layers, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Sliders, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Trash2, 
  Check, 
  Key,
  Cpu,
  Zap,
  Globe,
  Plus
} from 'lucide-react';
import { 
  getIntegrationsStatus, 
  disconnectProvider, 
  syncProviderResources, 
  exchangeProviderCode 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import GitHubOnboardingWizard from '../components/integrations/GitHubOnboardingWizard';
import JiraSyncModal from '../components/integrations/JiraSyncModal';
import NotionPickerModal from '../components/integrations/NotionPickerModal';
import AccountSecurityModal from '../components/auth/AccountSecurityModal';
import SettingsDrawer from '../components/integrations/SettingsDrawer';

export default function IntegrationsHub() {
  const { user, notify } = useAuth();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingProvider, setSyncingProvider] = useState(null);
  
  // Modals
  const [ghWizardOpen, setGhWizardOpen] = useState(false);
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [notionModalOpen, setNotionModalOpen] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await getIntegrationsStatus();
      setStatusData(data);
    } catch (e) {
      console.warn('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSandbox = async (provider) => {
    setSyncingProvider(provider);
    try {
      await exchangeProviderCode(provider, `${provider}_mock_auth_code_2026`);
      notify(`✅ Successfully connected ${provider.toUpperCase()} in Evaluation Sandbox mode!`);
      await loadStatus();
    } catch (e) {
      notify(`Failed to connect ${provider}`, 'error');
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!window.confirm(`Are you sure you want to disconnect ${provider.toUpperCase()}?`)) return;
    try {
      await disconnectProvider(provider);
      notify(`Disconnected ${provider.toUpperCase()} integration.`);
      await loadStatus();
    } catch (e) {
      notify(`Failed to disconnect ${provider}`, 'error');
    }
  };

  const handleQuickSync = async (provider, resourceIds = []) => {
    setSyncingProvider(provider);
    try {
      await syncProviderResources(provider, resourceIds);
      notify(`⚡ Synchronized ${provider.toUpperCase()} telemetry successfully!`);
      await loadStatus();
    } catch (e) {
      notify(`Failed to synchronize ${provider}`, 'error');
    } finally {
      setSyncingProvider(null);
    }
  };

  const github = statusData?.github || {};
  const jira = statusData?.jira || {};
  const notion = statusData?.notion || {};
  const google = statusData?.google_auth || {};

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-[1720px] mx-auto animate-fade-in">
      
      {/* Top Hero Banner */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f1db] text-[#2d3f16] font-mono text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#43562b] animate-pulse"></span>
              Unified Integrations Hub
            </span>
            <span className="text-xs text-[#45483e] font-mono">Enterprise Mesh v4.18</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#161e10] tracking-tight">
            Connected Engineering Ecosystem
          </h1>
          <p className="text-sm text-[#45483e] max-w-3xl">
            Authorize repository telemetry, bidirectional sprint ticket synchronization, and executive documentation hubs. All tokens are encrypted at rest via AES-256.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setGhWizardOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#43562b] hover:bg-[#2d3f16] text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Repository</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#f4f6f0] text-[#161e10] text-xs font-bold transition border border-[#d4dece] shadow-xs active:scale-95 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#43562b]" />
            <span>Configure Keys</span>
          </button>
        </div>
      </section>

      {/* 3 Main Integration Cards Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. GITHUB INTEGRATION CARD */}
        <div className="p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#24292e] text-white flex items-center justify-center shadow-md">
                  <Github className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#161e10]">GitHub App</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      github.connected 
                        ? 'bg-[#e8f1db] text-[#2d3f16] border border-[#c5c8ba]' 
                        : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
                    }`}>
                      {github.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#75786d]">Source AST & Churn Telemetry</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#45483e] leading-relaxed">
              Indexes code complexity, author entropy, pull request velocity, and feeds the SZZ Random Forest defect model.
            </p>

            {github.connected ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Connected Account:</span>
                    <span className="font-bold text-[#161e10]">{github.account?.name || 'Dhruv Patel'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Active Repositories:</span>
                    <span className="font-mono font-bold text-[#43562b]">{github.connected_repos_count || 5} Repos</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Last Synchronized:</span>
                    <span className="font-mono text-[#161e10]">Just now</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold">debtscope-core</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold">payment-gateway</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold">zookeeper</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] text-xs text-[#75786d] space-y-1">
                <span className="font-bold text-[#161e10] block">Zero Configuration Needed:</span>
                <span>Connect with 1-click sandbox authorization or live GitHub OAuth credentials.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#e5ebe0] flex items-center justify-between gap-2 flex-wrap">
            {github.connected ? (
              <>
                <button
                  onClick={() => setGhWizardOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f4f6f0] hover:bg-[#e5ebe0] text-[#161e10] text-xs font-bold transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Manage Repos</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    disabled={syncingProvider === 'github'}
                    onClick={() => handleQuickSync('github', ['gh_repo_101', 'gh_repo_102'])}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e8f1db] hover:bg-[#d3e4ac] text-[#2d3f16] text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'github' ? 'animate-spin' : ''}`} />
                    <span>Sync AST</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect('github')}
                    className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition cursor-pointer"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setGhWizardOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#24292e] hover:bg-[#1b1f23] text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer w-full justify-center"
                >
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. JIRA CLOUD INTEGRATION CARD */}
        <div className="p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0052cc] text-white flex items-center justify-center shadow-md">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#161e10]">Atlassian Jira</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      jira.connected 
                        ? 'bg-[#e8f1db] text-[#2d3f16] border border-[#c5c8ba]' 
                        : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
                    }`}>
                      {jira.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#75786d]">Sprint Backlog Automation</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#45483e] leading-relaxed">
              Converts 5D prioritized technical debt items into formatted Jira sprint tickets with ML defect metrics and remediation steps.
            </p>

            {jira.connected ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Domain:</span>
                    <span className="font-bold text-[#161e10]">{jira.domain || 'engineering-hub.atlassian.net'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Primary Project Key:</span>
                    <span className="font-mono font-bold text-[#0052cc]">{jira.project_key || 'DEBT'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Status:</span>
                    <span className="font-mono text-emerald-700 font-bold">2-Way Sync Active</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0369a1] text-[10px] font-mono font-bold">DEBT-104</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0369a1] text-[10px] font-mono font-bold">DEBT-105</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0369a1] text-[10px] font-mono font-bold">CORE-89</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] text-xs text-[#75786d] space-y-1">
                <span className="font-bold text-[#161e10] block">Enterprise OAuth 3LO:</span>
                <span>Direct integration with Atlassian Cloud for automated sprint planning.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#e5ebe0] flex items-center justify-between gap-2 flex-wrap">
            {jira.connected ? (
              <>
                <button
                  onClick={() => setJiraModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f4f6f0] hover:bg-[#e5ebe0] text-[#161e10] text-xs font-bold transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Projects</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    disabled={syncingProvider === 'jira'}
                    onClick={() => setJiraModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'jira' ? 'animate-spin' : ''}`} />
                    <span>Export Sprint</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect('jira')}
                    className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition cursor-pointer"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleConnectSandbox('jira')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0052cc] hover:bg-[#0747a6] text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer w-full justify-center"
              >
                <Layers className="w-4 h-4" />
                <span>Connect Jira Cloud</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. NOTION INTEGRATION CARD */}
        <div className="p-6 bg-white rounded-3xl border border-[#d4dece] shadow-[0_4px_20px_-4px_rgba(45,63,22,0.06)] flex flex-col justify-between space-y-6 hover:shadow-md transition">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#000000] text-white flex items-center justify-center shadow-md">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#161e10]">Notion</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      notion.connected 
                        ? 'bg-[#e8f1db] text-[#2d3f16] border border-[#c5c8ba]' 
                        : 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6]'
                    }`}>
                      {notion.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#75786d]">Roadmap & Executive Docs</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#45483e] leading-relaxed">
              Synchronizes technical debt backlogs into live Notion databases and publishes boardroom executive health audit documents.
            </p>

            {notion.connected ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Workspace:</span>
                    <span className="font-bold text-[#161e10]">{notion.workspace_name || 'DebtScope Architecture Hub'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Target Database:</span>
                    <span className="font-mono font-bold text-[#161e10]">Engineering Roadmap 2026</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#75786d]">Status:</span>
                    <span className="font-mono text-emerald-700 font-bold">Sync Pipeline Ready</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#b45309] text-[10px] font-mono font-bold">⚡ Tech Debt 2026</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#b45309] text-[10px] font-mono font-bold">🏛️ Architecture ADR</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] text-xs text-[#75786d] space-y-1">
                <span className="font-bold text-[#161e10] block">Notion API v1:</span>
                <span>Publish technical audits and engineering decision records directly to Notion.</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#e5ebe0] flex items-center justify-between gap-2 flex-wrap">
            {notion.connected ? (
              <>
                <button
                  onClick={() => setNotionModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f4f6f0] hover:bg-[#e5ebe0] text-[#161e10] text-xs font-bold transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Databases</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    disabled={syncingProvider === 'notion'}
                    onClick={() => setNotionModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fef3c7] hover:bg-[#fde68a] text-[#b45309] text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingProvider === 'notion' ? 'animate-spin' : ''}`} />
                    <span>Sync Notion</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect('notion')}
                    className="p-2 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition cursor-pointer"
                    title="Disconnect"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleConnectSandbox('notion')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#161e10] hover:bg-[#2c3722] text-white text-xs font-bold transition shadow-md active:scale-95 cursor-pointer w-full justify-center"
              >
                <Database className="w-4 h-4" />
                <span>Connect Notion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </section>

      {/* Account & Security Capsule */}
      <section className="p-6 bg-gradient-to-br from-[#f8faf6] to-[#edf1e8] rounded-3xl border border-[#d4dece] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} 
            alt={user?.name} 
            className="w-16 h-16 rounded-2xl ring-2 ring-[#43562b]/30 shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-[#161e10]">{user?.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#43562b] text-white text-[10px] font-mono font-bold">
                {user?.role || 'Lead Architect'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold border border-[#c5c8ba]">
                Google Verified
              </span>
            </div>
            <p className="text-xs text-[#45483e]">{user?.email} · {user?.team || 'Core Platform Architecture'}</p>
            <p className="text-[11px] font-mono text-[#75786d]">Session secured via HS256 JWT Token</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSecurityModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-[#f4f6f0] text-[#161e10] text-xs font-bold transition border border-[#d4dece] shadow-xs active:scale-95 cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#43562b]" />
            <span>Account & Security</span>
          </button>
        </div>
      </section>

      {/* Modals */}
      <GitHubOnboardingWizard
        isOpen={ghWizardOpen}
        onClose={() => setGhWizardOpen(false)}
        onComplete={() => {
          loadStatus();
          notify('🎉 Repository successfully onboarded into DebtScope mesh!');
        }}
        initialConnected={github.connected}
      />

      <JiraSyncModal
        isOpen={jiraModalOpen}
        onClose={() => setJiraModalOpen(false)}
        onComplete={() => {
          loadStatus();
          notify('📑 Exported sprint backlog tickets to Jira Cloud!');
        }}
      />

      <NotionPickerModal
        isOpen={notionModalOpen}
        onClose={() => setNotionModalOpen(false)}
        onComplete={() => {
          loadStatus();
          notify('🌿 Synchronized initiatives with Notion database!');
        }}
      />

      <AccountSecurityModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={() => {
          loadStatus();
          notify('Credentials updated successfully.');
        }}
      />

    </div>
  );
}
