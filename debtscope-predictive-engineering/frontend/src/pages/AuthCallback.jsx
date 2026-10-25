import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { showNotification, handleGoogleLogin } = useAuth();

  useEffect(() => {
    // Parse JWT from URL hash fragment: #token=...
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const token = params.get('token');

    if (token) {
      localStorage.setItem('pei_jwt_token', token);
      handleGoogleLogin(token);
      showNotification('Successfully authenticated via Google OAuth 2.0!');
      navigate('/dashboard', { replace: true });
    } else {
      showNotification('OAuth callback received without valid token.', 'warning');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, showNotification, handleGoogleLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center space-y-4 max-w-sm p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl">
        <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold">Verifying Google Credentials</h3>
        <p className="text-xs text-slate-400">Exchanging authorization code and establishing secure session...</p>
        <div className="flex justify-center pt-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
