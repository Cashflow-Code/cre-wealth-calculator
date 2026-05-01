import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo.svg" alt="Cashflow Code logo" className="w-11 h-11 flex-shrink-0 rounded-2xl" />
      <div>
        <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">Cashflow Code</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
          See what{' '}
          <span className="font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wide">commercial real estate</span>
          {' '}could do for you
        </p>
      </div>
    </div>
  );
}
