import React from 'react';
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts';
import { fmt } from '../utils/fmt.js';
import ChartTooltip from './ChartTooltip.jsx';

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function WealthChart({
  data, buyingYears, eligibleStartYear, isReachable,
  yearsToReach, totalYears, showStockAlt, isDark = true,
}) {
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#475569' : '#94a3b8';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/40 bg-white/80 dark:bg-[#0c1428]/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Wealth Trajectory</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{totalYears}-year projection</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <LegendDot color="bg-emerald-500" label="Take Action" />
          {showStockAlt && <LegendDot color="bg-sky-500" label="Just Stocks" />}
          <LegendDot color="bg-red-500" label="Taxes Lost" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={480}>
        <ComposedChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="redGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="year" stroke={axisColor} fontSize={11} interval={0} />
          <YAxis tickFormatter={(v) => fmt(v)} stroke={axisColor} fontSize={11} width={72} />
          <Tooltip content={(props) => <ChartTooltip {...props} showStockAlt={showStockAlt} />} />
          <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
          <ReferenceLine
            x={`Y${eligibleStartYear}`}
            stroke="#a78bfa" strokeDasharray="4 4"
            label={{ value: 'Tax savings start', fill: '#a78bfa', fontSize: 10, position: 'top', dy: -5 }}
          />
          <ReferenceLine
            x={`Y${buyingYears}`}
            stroke="#f59e0b" strokeDasharray="4 4"
            label={{ value: 'Buying ends', fill: '#f59e0b', fontSize: 10, position: 'top', dy: 8 }}
          />
          {isReachable && yearsToReach <= totalYears && (
            <ReferenceLine
              x={`Y${yearsToReach}`}
              stroke="#10b981" strokeDasharray="2 2"
              label={(props) => {
                const { viewBox: { x, y } } = props;
                return (
                  <text
                    x={x + 5} y={y + 14}
                    fill="#10b981" fontSize={10} fontWeight="bold"
                    textAnchor="start"
                    transform={`rotate(-90, ${x + 5}, ${y + 14})`}
                  >
                    Financial Freedom
                  </text>
                );
              }}
            />
          )}
          <Area type="monotone" dataKey="investorWealth" stroke="none" fill="url(#emeraldGrad)" />
          <Area type="monotone" dataKey="doNothingPosition" stroke="none" fill="url(#redGrad)" />
          <Line type="monotone" dataKey="investorWealth" stroke="#10b981" strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          {showStockAlt && (
            <Line type="monotone" dataKey="stockBalance" stroke="#0ea5e9" strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ fill: '#0ea5e9', r: 2, strokeWidth: 0 }} activeDot={{ r: 4.5 }} />
          )}
          <Line type="monotone" dataKey="doNothingPosition" stroke="#ef4444" strokeWidth={2.5}
            dot={{ fill: '#ef4444', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
