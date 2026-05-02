import React from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart,
} from 'recharts';
import { fmt } from '../utils/fmt.js';

function CashflowTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white/95 dark:bg-[#0d1630]/95 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 shadow-2xl min-w-[200px]">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Year {d.yearNum}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-emerald-500 dark:text-emerald-400">CRE passive</span>
          <span className="font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{fmt(d.creCashflow)}/mo</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-sky-500 dark:text-sky-400">Stocks (4% SWR)</span>
          <span className="font-bold text-sky-500 dark:text-sky-400 tabular-nums">{fmt(d.stockCashflow)}/mo</span>
        </div>
        <div className="flex justify-between gap-4 text-slate-400 dark:text-slate-600">
          <span>Do nothing</span>
          <span className="tabular-nums">$0/mo</span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, dashed }) {
  return (
    <div className="flex items-center gap-1.5">
      {dashed
        ? <div className="w-5 h-0.5 border-t-2 border-dashed" style={{ borderColor: color }} />
        : <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />}
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function CashflowChart({
  data, enoughNumber, isReachable, yearsToReach, totalYears, buyingYears, isDark = true,
}) {
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#475569' : '#94a3b8';

  const chartData = data.map((d) => ({
    year: d.year,
    yearNum: d.yearNum,
    creCashflow: d.monthlyCashflow,
    stockCashflow: d.stockBalance * 0.04 / 12,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/40 bg-white/80 dark:bg-[#0c1428]/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Monthly Cashflow</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Passive income per month · {totalYears}-year comparison</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <LegendDot color="#10b981" label="CRE" />
          <LegendDot color="#0ea5e9" label="Stocks (4% SWR)" dashed />
          <LegendDot color="#10b981" label={`Freedom (${fmt(enoughNumber)}/mo)`} dashed />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="year" stroke={axisColor} fontSize={11} interval={0} />
          <YAxis
            tickFormatter={(v) => `${fmt(v)}/mo`}
            stroke={axisColor} fontSize={11} width={84}
          />
          <Tooltip content={<CashflowTooltip />} />
          <ReferenceLine y={0} stroke="#334155" strokeWidth={1}
            label={{ value: 'Do Nothing · $0', fill: axisColor, fontSize: 9, position: 'insideBottomLeft' }} />
          <ReferenceLine y={enoughNumber} stroke="#10b981" strokeDasharray="4 4"
            label={{ value: `Freedom`, fill: '#10b981', fontSize: 10, position: 'top' }} />
          {buyingYears && (
            <ReferenceLine
              x={`Y${buyingYears}`}
              stroke="#f59e0b" strokeDasharray="4 4"
              label={{ value: 'Buying ends', fill: '#f59e0b', fontSize: 10, position: 'top', dy: 8 }}
            />
          )}
          <Line type="monotone" dataKey="creCashflow" stroke="#10b981" strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="stockCashflow" stroke="#0ea5e9" strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ fill: '#0ea5e9', r: 2, strokeWidth: 0 }} activeDot={{ r: 4.5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
