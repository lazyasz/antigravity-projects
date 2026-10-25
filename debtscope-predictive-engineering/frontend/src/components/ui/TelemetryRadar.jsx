import React from 'react';
import { motion } from 'motion/react';

/**
 * TelemetryRadar
 * Visual engineering radar sweep with rotating beam, concentric rings,
 * and kinetic blip animations in the Lumina Purple & Obsidian palette.
 */
export default function TelemetryRadar({
  size = 120,
  active = true,
  healthScore = 95.0,
  label = 'AST Telemetry Stream',
  className = '',
}) {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-full overflow-hidden bg-[#0b0714] border border-[#261c47] shadow-inner"
        style={{ width: size, height: size }}
      >
        {/* Concentric Coordinate Rings */}
        <div className="absolute inset-2 rounded-full border border-[#261c47]/50 pointer-events-none" />
        <div className="absolute inset-6 rounded-full border border-[#3b2c6d]/50 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-[#5b42a5]/40 pointer-events-none" />

        {/* Crosshair Axis Lines */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#261c47]/60 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#261c47]/60 pointer-events-none" />

        {/* Sweeping Radar Beam */}
        {active && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 4.0,
              ease: 'linear',
            }}
            className="absolute inset-0 origin-center pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(143, 110, 232, 0.22) 360deg)',
            }}
          />
        )}

        {/* Target Nodes / Blips */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-[#b39ef2] shadow-[0_0_6px_#b39ef2]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ repeat: Infinity, duration: 3.0, delay: 0.8, ease: 'easeInOut' }}
          className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-[#d97706] shadow-[0_0_5px_#d97706]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 1.4, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[#dc2626] shadow-[0_0_5px_#dc2626]"
        />

        {/* Center Origin Node */}
        <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-[#b39ef2] border border-[#0b0714] shadow-[0_0_8px_#b39ef2] flex items-center justify-center">
          <div className="w-0.5 h-0.5 rounded-full bg-[#0b0714]" />
        </div>
      </div>

      {label && (
        <div className="mt-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b39ef2] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#b39ef2]">
              {label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
