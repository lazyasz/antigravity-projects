import React, { useState } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Lock, 
  Key, 
  LogOut, 
  UserCheck, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccountSecurityModal({ isOpen, onClose }) {
  const { user, isLoggedIn, profiles, switchProfile, logout, handleGoogleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'sessions', 'personas'
  const [switching, setSwitching] = useState(false);

  if (!isOpen) return null;

  const handleSelectPersona = async (key) => {
    setSwitching(true);
    await switchProfile(key);
    setSwitching(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#d4dece] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-slide-up">
        
        {/* Header */}
        <div className="p-6 bg-[#f4f6f0] border-b border-[#e5ebe0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#43562b] text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-[#43562b] uppercase tracking-wider">Account & Security</span>
              <h2 className="text-lg font-extrabold text-[#161e10]">Identity & Role-Based Access</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[#75786d] hover:bg-[#e5ebe0] transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#e5ebe0] bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'profile' ? 'border-[#43562b] text-[#2d3f16]' : 'border-transparent text-[#75786d] hover:text-[#161e10]'
            }`}
          >
            Active Identity
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'personas' ? 'border-[#43562b] text-[#2d3f16]' : 'border-transparent text-[#75786d] hover:text-[#161e10]'
            }`}
          >
            Switch Evaluation Persona
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'sessions' ? 'border-[#43562b] text-[#2d3f16]' : 'border-transparent text-[#75786d] hover:text-[#161e10]'
            }`}
          >
            Session & JWT Security
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="p-5 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'} 
                    alt={user?.name} 
                    className="w-14 h-14 rounded-2xl ring-2 ring-[#43562b]/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-[#161e10]">{user?.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold border border-[#c5c8ba]">
                        {user?.role || 'Lead Architect'}
                      </span>
                    </div>
                    <p className="text-xs text-[#75786d] mt-0.5">{user?.email}</p>
                    <p className="text-[11px] font-mono text-[#43562b] mt-1">{user?.team || 'Core Platform Architecture'}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-xs font-bold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#45483e]">Granted RBAC Permissions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(user?.permissions || ['prioritize', 'export_jira', 'sync_notion', 'manage_integrations', 'override_weights']).map((perm) => (
                    <div key={perm} className="p-2.5 bg-white border border-[#e5ebe0] rounded-xl flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-mono text-[11px] text-[#161e10]">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Personas */}
          {activeTab === 'personas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#161e10]">1-Click Evaluation Persona Switcher</h3>
                <p className="text-xs text-[#75786d]">Test RBAC capabilities as different enterprise stakeholders.</p>
              </div>

              <div className="space-y-2.5">
                {Object.entries(profiles).map(([key, prof]) => (
                  <div
                    key={key}
                    onClick={() => handleSelectPersona(key)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      user?.email === prof.email ? 'bg-[#f4f8ee] border-[#43562b] ring-1 ring-[#43562b]' : 'bg-white border-[#e5ebe0] hover:border-[#b8ce98]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={prof.avatar} alt={prof.name} className="w-10 h-10 rounded-xl" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#161e10]">{prof.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#e8f1db] text-[#2d3f16] font-bold">
                            {prof.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#75786d]">{prof.team} · {prof.email}</p>
                      </div>
                    </div>
                    {user?.email === prof.email ? (
                      <span className="text-xs font-mono font-bold text-[#43562b] flex items-center gap-1">
                        <Check className="w-4 h-4" /> Active
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#75786d] hover:text-[#161e10]">Switch →</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f8faf6] rounded-2xl border border-[#e5ebe0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#43562b]" />
                    <span className="text-xs font-bold text-[#161e10]">Signed Session Token (JWT)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#e8f1db] text-[#2d3f16] text-[10px] font-mono font-bold">
                    HS256 Encrypted
                  </span>
                </div>
                <p className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-[#e5ebe0] text-[#45483e] break-all select-all">
                  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfbGVhZF8wMSIsImVtYWlsIjoiZGhydXZzYWtoYXJlMjAwNkBnbWFpbC5jb20iLCJyb2xlIjoibGVhZF9hcmNoaXRlY3QiLCJleHAiOjE3OTAwMDAwMDB9
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#45483e]">
                <div className="flex justify-between py-1 border-b border-[#e5ebe0]">
                  <span>Authentication Issuer:</span>
                  <span className="font-mono font-bold text-[#161e10]">Google Identity Services & DebtScope Mesh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5ebe0]">
                  <span>Token Life:</span>
                  <span className="font-mono font-bold text-[#161e10]">30 Days Persistent Session</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5ebe0]">
                  <span>OAuth State & CSRF Protection:</span>
                  <span className="font-mono font-bold text-emerald-600">Active</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
