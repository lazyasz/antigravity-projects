import React from 'react';

export default function Card({ title, subtitle, children, className = '', action }) {
  return (
    <div className={`bg-white rounded-xl border border-[#e2e4ea] shadow-2xs ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-5 py-3.5 border-b border-[#e2e4ea] flex items-center justify-between">
          <div>
            {title && <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f1015]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-[#525866]">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
