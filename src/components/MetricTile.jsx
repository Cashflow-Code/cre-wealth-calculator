import React from 'react';

const TONES = {
  emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.06]', text: 'text-emerald-500 dark:text-emerald-400', icon: 'text-emerald-500' },
  red:     { border: 'border-red-500/20',     bg: 'bg-red-500/[0.06]',     text: 'text-red-500 dark:text-red-400',         icon: 'text-red-500' },
};

export default function MetricTile({ label, value, sublabel, icon: Icon, tone }) {
  const t = TONES[tone];
  return (
    <div className={`rounded-xl border ${t.border} ${t.bg} p-2.5 sm:p-3`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon className={`w-3.5 h-3.5 ${t.icon}`} />}
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate">{label}</span>
      </div>
      <div className={`text-lg sm:text-xl font-black ${t.text} tabular-nums leading-none`}>{value}</div>
      {sublabel && <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">{sublabel}</p>}
    </div>
  );
}
