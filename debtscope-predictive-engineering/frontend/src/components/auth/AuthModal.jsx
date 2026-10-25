import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Sparkles, X, CheckCircle, Lock, Key, Settings, UserPlus, ArrowRight, ChevronRight, HelpCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, profiles, user, handleSwitchPersona, handleGoogleLogin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('google'); // 'google' or 'personas'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState('Lead Architect');
  const [showManualInput, setShowManualInput] = useState(false);
  const [clientId, setClientId] = useState(() => localStorage.getItem('pei_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID);
  const [showConfig, setShowConfig] = useState(false);
  const googleBtnRef = useRef(null);

  // Accounts detected or configured (including the user's accounts from the screenshot)
  const savedGoogleAccounts = [
    {
      name: 'Dhruv Sakhare',
      email: 'dhruvsakhare2006@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Dhruv+Sakhare&background=1e293b&color=ffffff&size=96',
      badge: 'D'
    },
    {
      name: 'Kakashi Sakhare',
      email: 'sakharekakashi@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Kakashi+Sakhare&background=6b21a8&color=ffffff&size=96',
      badge: 'K'
    },
    {
      name: 'Aditya Dhamdhere',
      email: 'spideythehero007@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Aditya+Dhamdhere&background=0369a1&color=ffffff&size=96',
      badge: 'A'
    },
    {
      name: 'D ruv Sakhare',
      email: 'sakharedruv@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=D+ruv+Sakhare&background=78350f&color=ffffff&size=96',
      badge: 'D'
    },
    {
      name: 'Ashwin Gaikwad',
      email: 'asgaikwad224@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Ashwin+Gaikwad&background=374151&color=ffffff&size=96',
      badge: 'A'
    },
    {
      name: 'MITADTU Innovation',
      email: 'innovation@mituniversity.edu.in',
      avatar: 'https://ui-avatars.com/api/?name=MIT+Innovation&background=4c1d95&color=ffffff&size=96',
      badge: 'M'
    },
    {
      name: 'Adesh Patankar',
      email: 'adeshpatankar0512@gmail.com',
      avatar: 'https://ui-avatars.com/api/?name=Adesh+Patankar&background=c2410c&color=ffffff&size=96',
      badge: 'A'
    }
  ];

  // Initialize official Google Identity Services SDK if Client ID is configured
  useEffect(() => {
    if (clientId && window.google?.accounts?.id && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              handleGoogleLogin(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          width: '100%'
        });
      } catch (err) {
        console.warn('Google GSI SDK init:', err);
      }
    }
  }, [clientId, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSelectGoogleAccount = (acc) => {
    const payload = {
      email: acc.email,
      name: acc.name,
      role: selectedRole,
      picture: acc.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&background=43562b&color=ffffff&size=120`,
      sub: `usr_google_${Date.now()}`
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    handleGoogleLogin(`eyJhbGciOiJSUzI1NiJ9.${b64}.signature_mock`);
  };

  const handleCustomSubmit = (e) => {
    e?.preventDefault();
    if (!customEmail) return;
    const name = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const payload = {
      email: customEmail.trim(),
      name,
      role: selectedRole,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=43562b&color=ffffff&size=120`,
      sub: `usr_google_${Date.now()}`
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    handleGoogleLogin(`eyJhbGciOiJSUzI1NiJ9.${b64}.signature_mock`);
  };

  const saveClientId = (e) => {
    e.preventDefault();
    localStorage.setItem('pei_google_client_id', clientId.trim());
    setShowConfig(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1f1f1f] text-[#e3e3e3] rounded-[28px] shadow-2xl border border-[#333538] overflow-hidden">
        
        {/* Google Header Branding */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#2d2f31]">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-xs font-semibold text-[#c4c7c5] tracking-wide">Sign in with Google</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowConfig(!showConfig)}
              title="Google Cloud OAuth Settings"
              className="p-1.5 rounded-full text-[#8e918f] hover:text-white hover:bg-[#2d2f31] transition cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-1.5 rounded-full text-[#8e918f] hover:text-white hover:bg-[#2d2f31] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Google Identity Services vs Evaluation Personas */}
        <div className="flex border-b border-[#2d2f31] px-6 bg-[#181818]">
          <button
            onClick={() => setActiveTab('google')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-[#a8c7fa] text-[#a8c7fa]'
                : 'border-transparent text-[#8e918f] hover:text-[#c4c7c5]'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Choose Google Account
          </button>
          <button
            onClick={() => setActiveTab('personas')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'personas'
                ? 'border-[#a8c7fa] text-[#a8c7fa]'
                : 'border-transparent text-[#8e918f] hover:text-[#c4c7c5]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Evaluation Personas (Defense)
          </button>
        </div>

        {/* Optional Google Cloud OAuth Client ID Setting Drawer */}
        {showConfig && (
          <div className="p-4 bg-[#282a2c] border-b border-[#3c4043] space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#a8c7fa] flex items-center gap-1">
                <Key className="h-3.5 w-3.5" /> Google Cloud OAuth 2.0 Client ID
              </span>
              <span className="text-[10px] text-[#8e918f]">Google Identity Services</span>
            </div>
            <form onSubmit={saveClientId} className="flex gap-2">
              <input
                type="text"
                placeholder="xxxx.apps.googleusercontent.com"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#1f1f1f] border border-[#444746] rounded-lg text-[#e3e3e3] text-xs font-mono focus:outline-none focus:border-[#a8c7fa]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#a8c7fa] text-[#041e49] font-bold rounded-lg text-xs hover:bg-[#c2e7ff] transition"
              >
                Save
              </button>
            </form>
            <p className="text-[10px] text-[#8e918f]">
              Tip: Set your Web OAuth Client ID from Google Cloud Console to trigger browser-level Google popups.
            </p>
          </div>
        )}

        {/* Tab 1: Google Account Picker Dialog (Exact layout matching Google GSI) */}
        {activeTab === 'google' && (
          <div className="p-6 space-y-5">
            <div>
              <h2 className="text-xl font-normal text-[#e3e3e3] tracking-tight">Choose an account</h2>
              <p className="text-xs text-[#8e918f] mt-1">
                to continue to <span className="text-[#a8c7fa] font-semibold">pei-platform.onrender.com</span>
              </p>
            </div>

            {/* Official GSI Button mount point if Client ID is configured */}
            {clientId && (
              <div className="pb-2">
                <div ref={googleBtnRef} className="w-full flex justify-center" />
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-[#333538] w-full" />
                  <span className="bg-[#1f1f1f] px-2 text-[10px] text-[#8e918f] uppercase">or choose saved account</span>
                </div>
              </div>
            )}

            {/* Accounts List (Google Account Chooser) */}
            <div className="divide-y divide-[#2d2f31] border-y border-[#2d2f31] max-h-64 overflow-y-auto pr-1">
              {savedGoogleAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  disabled={loading}
                  className="w-full flex items-center gap-3.5 py-3 px-2 rounded-xl text-left hover:bg-[#282a2c] active:bg-[#333538] transition cursor-pointer group"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#444746]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#e3e3e3] group-hover:text-white truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-[#8e918f] group-hover:text-[#c4c7c5] truncate font-mono">
                      {acc.email}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#5e615f] group-hover:text-[#a8c7fa] flex-shrink-0 transition" />
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="w-full flex items-center gap-3.5 py-3 px-2 rounded-xl text-left hover:bg-[#282a2c] active:bg-[#333538] transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-[#2d2f31] flex items-center justify-center text-[#8e918f] group-hover:text-white">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#e3e3e3] group-hover:text-[#a8c7fa]">
                    Use another Google account
                  </p>
                  <p className="text-[10px] text-[#8e918f]">Enter any custom Gmail or Google Workspace</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#5e615f] group-hover:text-[#a8c7fa] flex-shrink-0 transition" />
              </button>
            </div>

            {/* Custom Email Expandable Form */}
            {showManualInput && (
              <form onSubmit={handleCustomSubmit} className="p-3.5 bg-[#282a2c] rounded-2xl border border-[#3c4043] space-y-3 animate-fade-in">
                <div className="text-[11px] font-semibold text-[#a8c7fa]">Enter Custom Google / Gmail Account:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="px-3 py-2 bg-[#1f1f1f] border border-[#444746] rounded-xl text-xs text-[#e3e3e3] focus:outline-none focus:border-[#a8c7fa]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="px-3 py-2 bg-[#1f1f1f] border border-[#444746] rounded-xl text-xs text-[#e3e3e3] focus:outline-none focus:border-[#a8c7fa]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-[#1f1f1f] border border-[#444746] text-[#e3e3e3] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="Lead Architect">Role: Lead Architect</option>
                    <option value="Staff ML Engineer">Role: Staff ML Engineer</option>
                    <option value="Product & Engineering Lead">Role: Product Lead</option>
                    <option value="Software Engineer">Role: Software Engineer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading || !customEmail}
                    className="px-4 py-1.5 bg-[#a8c7fa] hover:bg-[#c2e7ff] text-[#041e49] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Privacy & Terms notice */}
            <div className="text-[11px] text-[#8e918f] leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with DebtScope.
            </div>
          </div>
        )}

        {/* Tab 2: Evaluation Personas (for Project Defense / Viva) */}
        {activeTab === 'personas' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Evaluation & Viva Personas</h3>
                <p className="text-xs text-[#8e918f]">1-click switch between RBAC roles to test access control</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#a8c7fa] bg-[#041e49] px-2.5 py-0.5 rounded-full border border-[#1e40af]">
                RBAC Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(profiles).map(([key, prof]) => {
                const isActive = user?.email === prof.email;
                return (
                  <button
                    key={key}
                    onClick={() => handleSwitchPersona(key)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1b2a47] border-[#a8c7fa] ring-1 ring-[#a8c7fa]'
                        : 'bg-[#282a2c] border-[#3c4043] hover:border-[#5e615f] hover:bg-[#303336]'
                    }`}
                  >
                    <img
                      src={prof.avatar}
                      alt={prof.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#444746]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{prof.name}</p>
                        {isActive && <UserCheck className="h-3.5 w-3.5 text-[#a8c7fa] flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] font-semibold text-[#a8c7fa] truncate">{prof.role}</p>
                      <p className="text-[10px] text-[#8e918f] truncate mt-0.5">{prof.team}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Permissions */}
            <div className="pt-3 border-t border-[#2d2f31] flex items-center justify-between text-xs text-[#8e918f] flex-wrap gap-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="h-3.5 w-3.5 text-[#a8c7fa]" /> Active Permissions:
              </span>
              <div className="flex flex-wrap gap-1">
                {user?.permissions?.map((perm) => (
                  <span key={perm} className="text-[10px] px-2 py-0.5 bg-[#282a2c] text-[#a8c7fa] border border-[#3c4043] rounded-md font-mono font-semibold">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
