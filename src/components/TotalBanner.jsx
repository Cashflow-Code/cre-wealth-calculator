import React from 'react';

const TONES = {
  emerald: { border: 'border-emerald-500/40', bg: 'from-emerald-500/15 to-emerald-500/0', text: 'text-emerald-400' },
  red:     { border: 'border-red-500/50',     bg: 'from-red-500/20 to-red-500/0',         text: 'text-red-400' },
};

export default function TotalBanner({ label, value, breakdown, tone, icon: Icon }) {
  const t = TONES[tone];
  return (
    <div className={`rounded-xl border ${t.border} bg-gradient-to-r ${t.bg} p-4 relative overflow-hidden`}>
      {Icon && <Icon className={`absolute -right-2 -bottom-2 w-16 h-16 ${t.text} opacity-10 pointer-events-none`} />}
      <div className="relative">
        <div className={`text-[10px] font-bold uppercase tracking-widest ${t.text} mb-1`}>{label}</div>
        <div className={`text-3xl sm:text-4xl font-black ${t.text} tabular-nums leading-none`}>{value}</div>
        {breakdown && <div className="text-[10px] text-slate-400 mt-2 leading-relaxed">{breakdown}</div>}
      </div>
    </div>
  );
}
