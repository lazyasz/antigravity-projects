import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * InteractiveCard
 * Lumina-styled card with subtle hover elevation, gentle specular sheen,
 * and disciplined 1px borders.
 */
export default function InteractiveCard({
  title,
  subtitle,
  children,
  badge,
  action,
  className = '',
  onClick,
  isInteractive = true,
  dark = false,
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={isInteractive ? { y: -1.5, transition: { duration: 0.18, ease: 'easeOut' } } : {}}
      className={`relative overflow-hidden rounded-xl transition-all duration-200 ${
        dark
          ? 'bg-[#130e24] border border-[#261c47] text-white shadow-md'
          : 'bg-white border border-[#e2e4ea] text-[#0f1015] shadow-2xs hover:border-[#d0d4de] hover:shadow-xs'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Specular Light Sheen Overlay (Delicate) */}
      {isHovered && isInteractive && (
        <div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-100 transition-opacity duration-200"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${
              dark ? 'rgba(179, 158, 242, 0.08)' : 'rgba(112, 72, 232, 0.04)'
            }, transparent 80%)`,
          }}
        />
      )}

      {/* Header if title or subtitle present */}
      {(title || subtitle || badge || action) && (
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
          dark ? 'border-[#261c47]' : 'border-[#e2e4ea]'
        }`}>
          <div>
            {title && (
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold tracking-tight ${dark ? 'text-white' : 'text-[#0f1015]'}`}>
                  {title}
                </h3>
                {badge}
              </div>
            )}
            {subtitle && (
              <p className={`mt-0.5 text-xs ${dark ? 'text-[#b39ef2]/80' : 'text-[#525866]'}`}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5">{children}</div>
    </motion.div>
  );
}
