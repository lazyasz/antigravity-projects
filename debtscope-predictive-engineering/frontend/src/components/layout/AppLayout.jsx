import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, GitBranch, Activity, Lock, Cpu, ArrowUpRight } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import AuthModal from '../auth/AuthModal';
import SettingsDrawer from '../integrations/SettingsDrawer';
import ScanRepoModal from '../common/ScanRepoModal';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#0f1015] flex flex-col">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpenScanModal={() => setScanModalOpen(true)}
      />
      
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          onOpenScanModal={() => setScanModalOpen(true)}
        />
        
        <main className="w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Product Trust, Compliance & Telemetry Footer */}
        <footer className="mt-auto border-t border-[#e2e4ea] bg-white px-4 sm:px-8 py-6 text-xs text-[#525866]">
          <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-[#0f1015]">
                <div className="w-4 h-4 rounded bg-[#130e24] flex items-center justify-center text-white text-[9px] font-mono">
                  D
                </div>
                <span>DebtScope Platform</span>
              </div>
              <span className="text-[#88909e]">·</span>
              <span className="font-mono text-[11px] text-[#525866]">
                ISO/IEC 25010 & SZZ Defect Engine (R² = 0.9885)
              </span>
              <span className="text-[#88909e] hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#059669]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
                <span>Telemetry Operational</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-[11px] text-[#525866]">
              <span className="hover:text-[#0f1015] transition cursor-pointer">
                Privacy Policy
              </span>
              <span className="hover:text-[#0f1015] transition cursor-pointer">
                Terms of Service
              </span>
              <span className="hover:text-[#0f1015] transition cursor-pointer">
                Security Architecture
              </span>
              <a 
                href="http://127.0.0.1:8000/docs" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 hover:text-[#7048e8] font-semibold transition"
              >
                <span>API Docs</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal />
      <SettingsDrawer />
      <ScanRepoModal 
        isOpen={scanModalOpen} 
        onClose={() => setScanModalOpen(false)} 
      />
    </div>
  );
}
