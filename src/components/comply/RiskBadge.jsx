import React from 'react';

const RISK_COLORS = {
  low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  unknown: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function RiskBadge({ level }) {
  const color = RISK_COLORS[level?.toLowerCase()] || RISK_COLORS.unknown;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${color}`}>
      {level || 'Unknown'}
    </span>
  );
}
