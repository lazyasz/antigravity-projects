/**
 * Risk display utilities.
 *
 * These are purely presentational helpers — formatting values for display.
 * Analytics values come from the FastAPI backend.
 */

/** Maps risk/severity level to restrained text color classes */
export function getRiskColor(level) {
  const colors = {
    critical: 'text-[#dc2626]',
    high: 'text-[#d97706]',
    medium: 'text-[#5b42a5]',
    low: 'text-[#059669]',
    attention: 'text-[#d97706]',
  };
  return colors[level] || 'text-[#525866]';
}

/** Maps risk/severity level to subtle background and border classes */
export function getRiskBgColor(level) {
  const colors = {
    critical: 'bg-[#fef2f2] border-[#fee2e2]',
    high: 'bg-[#fffbeb] border-[#fef3c7]',
    medium: 'bg-[#f0ecfc] border-[#d8cdfa]',
    low: 'bg-[#ecfdf5] border-[#d1fae5]',
    attention: 'bg-[#fffbeb] border-[#fef3c7]',
  };
  return colors[level] || 'bg-[#f3f4f8] border-[#e2e4ea]';
}

/** Maps risk/severity level to restrained badge classes */
export function getRiskBadgeColor(level) {
  const colors = {
    critical: 'bg-[#fef2f2] text-[#dc2626] border-[#fca5a5]',
    high: 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]',
    medium: 'bg-[#f0ecfc] text-[#5b42a5] border-[#d8cdfa]',
    low: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
    attention: 'bg-[#fffbeb] text-[#b45309] border-[#fcd34d]',
  };
  return colors[level] || 'bg-[#f3f4f8] text-[#525866] border-[#e2e4ea]';
}

/** Returns a human-readable label for a risk level */
export function getRiskLabel(level) {
  const labels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    attention: 'Attention',
  };
  return labels[level] || 'Unknown';
}

/** Formats a numeric score for display (1 decimal place) */
export function formatScore(score) {
  if (score == null) return '-';
  return Number(score).toFixed(1);
}
