import React from 'react';
import { ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';
import { fmt } from '../utils/fmt.js';

export default function ChartTooltip({ active, payload, showStockAlt }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white/95 dark:bg-[#0d1630]/95 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 shadow-2xl backdrop-blur-sm min-w-[260px]">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
        Year {d.yearNum}{' '}
        {d.isBuyingPhase
          ? <span className="text-emerald-500 dark:text-emerald-400">· Buying</span>
          : <span className="text-sky-500 dark:text-sky-400">· Holding</span>}
      </p>
      <div className="space-y-1 text-xs mb-2">
        <div className="flex items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-700/50">
          <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <ArrowUp className="w-3 h-3" /> Take Action
          </span>
          <span className="font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{fmt(d.totalProfits)}</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400 pl-3">
          <span>Equity gain</span>
          <span className="tabular-nums">{fmt(d.equityGain ?? d.equity)}</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400 pl-3">
          <span>Cashflow (cumulative)</span>
          <span className="tabular-nums">{fmt(d.cumulativeCashflow)}</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400 pl-3">
          <span>Tax savings (taken)</span>
          <span className="tabular-nums">{fmt(d.cumulativeTaxSavings)}</span>
        </div>
        {d.bankedFutureTax > 0 && (
          <div className="flex justify-between gap-4 text-slate-500 dark:text-slate-400 pl-3">
            <span>Banked future tax</span>
            <span className="tabular-nums">{fmt(d.bankedFutureTax)}</span>
          </div>
        )}
      </div>
      {showStockAlt && (
        <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/50">
          <span className="text-sky-500 dark:text-sky-400 flex items-center gap-1 font-semibold">
            <BarChart3 className="w-3 h-3" /> Just Stocks
          </span>
          <span className="font-bold text-sky-500 dark:text-sky-400 tabular-nums">{fmt(d.stockBalance)}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 text-xs pt-2 border-t border-slate-200 dark:border-slate-700/50">
        <span className="text-red-500 dark:text-red-400 flex items-center gap-1 font-semibold">
          <ArrowDown className="w-3 h-3" /> Taxes Lost
        </span>
        <span className="font-bold text-red-500 dark:text-red-400 tabular-nums">{fmt(d.cumulativeTaxesPaid)}</span>
      </div>
    </div>
  );
}
