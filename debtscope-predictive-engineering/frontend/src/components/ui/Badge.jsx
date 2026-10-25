import React from 'react';
import { getRiskBadgeColor } from '../../utils/risk';

export default function Badge({ variant = 'medium', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${getRiskBadgeColor(variant)} ${className}`}
    >
      {children}
    </span>
  );
}
