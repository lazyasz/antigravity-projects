import React from 'react';

/**
 * AnimatedRiskGauge
 * Kinetic SVG Radial Gauge with animated stroke dashoffset, glowing beacon,
 * and dynamic risk category color mapping in the Lumina palette.
 */
export default function AnimatedRiskGauge({ 
  score = 0, 
  maxScore = 100, 
  size = 140, 
  strokeWidth = 9,
  label = 'Risk Index',
  subtitle = 'SZZ Inference',
  showBeacon = true
}) {
  const normalizedScore = Math.min(maxScore, Math.max(0, score));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / maxScore) * circumference;

  // Determine color and status classification
  const getColorScheme = (val) => {
    if (val >= 75) {
      return {
        color: '#dc2626',
        badgeBg: 'bg-[#fef2f2]',
        badgeText: 'text-[#dc2626]',
        badgeBorder: 'border-[#fca5a5]',
        label: 'CRITICAL',
      };
    }
    if (val >= 50) {
      return {
        color: '#d97706',
        badgeBg: 'bg-[#fffbeb]',
        badgeText: 'text-[#b45309]',
        badgeBorder: 'border-[#fcd34d]',
        label: 'ELEVATED',
      };
    }
    if (val >= 25) {
      return {
        color: '#5b42a5',
        badgeBg: 'bg-[#f0ecfc]',
        badgeText: 'text-[#5b42a5]',
        badgeBorder: 'border-[#d8cdfa]',
        label: 'MODERATE',
      };
    }
    return {
      color: '#059669',
      badgeBg: 'bg-[#ecfdf5]',
      badgeText: 'text-[#047857]',
      badgeBorder: 'border-[#a7f3d0]',
      label: 'OPTIMAL',
    };
  };

  const scheme = getColorScheme(normalizedScore);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* SVG Radial Progress Circle */}
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e4ea"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Kinetic Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold font-mono tracking-tight text-[#0f1015]">
              {typeof score === 'number' ? score.toFixed(1) : score}
            </span>
            <span className="text-[10px] font-mono text-[#88909e] ml-0.5">/100</span>
          </div>
          <span className={`px-2 py-0.2 mt-0.5 rounded text-[9px] font-bold font-mono tracking-wider border ${scheme.badgeBg} ${scheme.badgeText} ${scheme.badgeBorder}`}>
            {scheme.label}
          </span>
        </div>

        {/* Pulsing Beacon Dot */}
        {showBeacon && (
          <div 
            className="absolute top-2 right-2 w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: scheme.color }}
          />
        )}
      </div>

      {(label || subtitle) && (
        <div className="text-center mt-2">
          {label && <p className="text-xs font-semibold text-[#0f1015]">{label}</p>}
          {subtitle && <p className="text-[10px] font-mono text-[#525866]">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
