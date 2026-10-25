import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateIntegrationsConfig } from '../../services/api';
import { X, CheckCircle, Save, Key, Shield, Layers, Database, Sparkles } from 'lucide-react';

export default function SettingsDrawer() {
  const { settingsOpen, setSettingsOpen, integrations, refreshIntegrations, showNotification } = useAuth();
  const [saving, setSaving] = useState(false);

  const [googleClientId, setGoogleClientId] = useState('');
  const [jiraDomain, setJiraDomain] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraToken, setJiraToken] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('DEBT');
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionDbId, setNotionDbId] = useState('');

  useEffect(() => {
    if (integrations) {
      if (integrations.jira?.domain) setJiraDomain(integrations.jira.domain);
      if (integrations.jira?.project_key) setJiraProjectKey(integrations.jira.project_key);
      if (integrations.notion?.database_id) setNotionDbId(integrations.notion.database_id);
    }
  }, [integrations]);

  if (!settingsOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateIntegrationsConfig({
        google_client_id: googleClientId,
        jira_domain: jiraDomain,
        jira_email: jiraEmail,
        jira_api_token: jiraToken,
        jira_project_key: jiraProjectKey,
        notion_api_key: notionApiKey,
        notion_database_id: notionDbId
      });
      await refreshIntegrations();
      showNotification('Enterprise integration settings updated successfully!');
      setSettingsOpen(false);
    } catch (err) {
      showNotification('Failed to update settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#161e10]/60 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#d4dece] flex flex-col">
          
          {/* Drawer Header */}
          <div className="p-6 bg-gradient-to-r from-[#2d3f16] via-[#43562b] to-[#1e2a0f] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                <Key className="h-5 w-5 text-[#d3ebb2]" />
              </div>
              <div>
                <h3 className="text-base font-bold">Enterprise Integrations</h3>
                <p className="text-xs text-[#d3ebb2]">Google OAuth, Jira Cloud & Notion Credentials</p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            
            {/* Google OAuth Section */}
            <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#d4dece] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[#161e10]">
                  <Shield className="h-4 w-4 text-[#43562b]" /> Google OAuth 2.0
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  integrations?.google_auth?.configured
                    ? 'bg-[#d3ebb2] text-[#2d3f16]'
                    : 'bg-[#ffddb8] text-[#855300]'
                }`}>
                  {integrations?.google_auth?.configured ? 'Live Active' : 'Sandbox Demo Mode'}
                </span>
              </div>
              <div>
                <label className="block text-[#45483e] font-medium mb-1">Google Client ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none"
                />
              </div>
            </div>

            {/* Jira Cloud Section */}
            <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#d4dece] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[#161e10]">
                  <Layers className="h-4 w-4 text-[#43562b]" /> Atlassian Jira Cloud
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  integrations?.jira?.configured
                    ? 'bg-[#d3ebb2] text-[#2d3f16]'
                    : 'bg-[#ffddb8] text-[#855300]'
                }`}>
                  {integrations?.jira?.configured ? 'Live Connected' : 'Sandbox Simulated'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">Jira Domain</label>
                  <input
                    type="text"
                    placeholder="your-company.atlassian.net"
                    value={jiraDomain}
                    onChange={(e) => setJiraDomain(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">Account Email</label>
                  <input
                    type="email"
                    placeholder="developer@company.com"
                    value={jiraEmail}
                    onChange={(e) => setJiraEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">API Token</label>
                  <input
                    type="password"
                    placeholder="Atlassian API Token"
                    value={jiraToken}
                    onChange={(e) => setJiraToken(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">Project Key</label>
                  <input
                    type="text"
                    placeholder="DEBT"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Notion Workspace Section */}
            <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#d4dece] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[#161e10]">
                  <Database className="h-4 w-4 text-[#384a24]" /> Notion Workspace API
                </span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  integrations?.notion?.configured
                    ? 'bg-[#d3ebb2] text-[#2d3f16]'
                    : 'bg-[#ffddb8] text-[#855300]'
                }`}>
                  {integrations?.notion?.configured ? 'Live Connected' : 'Sandbox Simulated'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">Notion Integration Secret</label>
                  <input
                    type="password"
                    placeholder="secret_..."
                    value={notionApiKey}
                    onChange={(e) => setNotionApiKey(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#45483e] font-medium mb-1">Roadmap Database ID</label>
                  <input
                    type="text"
                    placeholder="e.g. notion_db_pei_backlog_2026"
                    value={notionDbId}
                    onChange={(e) => setNotionDbId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-[#c5c8ba] rounded-xl focus:ring-2 focus:ring-[#43562b] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#e5ebe0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 bg-[#edf1e8] hover:bg-[#dde5d7] text-[#2d3f16] font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#43562b] hover:bg-[#2d3f16] text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
