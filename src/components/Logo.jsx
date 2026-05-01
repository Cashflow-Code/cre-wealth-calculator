import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/30 flex-shrink-0">
        <span className="text-white font-black text-base tracking-tight">CC</span>
      </div>
      <div>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">Cashflow Code</h1>
        <p className="text-sm font-medium text-slate-400 -mt-0.5">See what commercial real estate could do for you</p>
      </div>
    </div>
  );
}
