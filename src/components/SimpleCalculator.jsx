import React, { useState } from 'react';
import { TrendingUp, Banknote, Receipt, Trophy, AlertTriangle, Sparkles } from 'lucide-react';
import { fmt } from '../utils/fmt.js';
import WealthChart from './WealthChart.jsx';

function ComparisonTile({ label, icon: Icon, takeAction, doNothing, actionColor, doNothingLabel }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/40 bg-white/60 dark:bg-[#0c1428]/60 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/40 flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700/40">
        <div className="p-3 sm:p-4">
          <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-1">Take Action</div>
          <div className={`text-lg sm:text-xl font-black tabular-nums leading-none ${actionColor}`}>{takeAction}</div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="text-[9px] font-bold uppercase tracking-wider text-red-500/70 mb-1">Do Nothing</div>
          <div className="text-lg sm:text-xl font-black tabular-nums leading-none text-red-400 dark:text-red-500">{doNothing}</div>
          {doNothingLabel && <div className="text-[9px] text-slate-500 mt-0.5">{doNothingLabel}</div>}
        </div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step, prefix = '$', suffix }) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-slate-400 font-bold text-sm pointer-events-none">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 font-black text-base sm:text-lg pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 tabular-nums"
        />
        {suffix && <span className="absolute right-3 text-slate-400 font-bold text-xs pointer-events-none">{suffix}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full mt-2 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500"
      />
    </div>
  );
}

export default function SimpleCalculator({
  projection, income, setIncome, enoughNumber, setEnoughNumber,
  isDark, totalYears, buyingYears,
}) {
  const [horizon, setHorizon] = useState(3);
  const d = projection.data[horizon];

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Your Opportunity Cost
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          The difference between acting now and waiting — no jargon, just numbers
        </p>
      </div>

      {/* Inputs */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/40 bg-white/80 dark:bg-[#0c1428]/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
          <NumberInput
            label="Your Annual Income"
            value={income}
            onChange={setIncome}
            min={50000}
            max={2000000}
            step={10000}
          />
          <NumberInput
            label="Monthly 'I'm Free At'"
            value={enoughNumber}
            onChange={setEnoughNumber}
            min={2000}
            max={100000}
            step={500}
            suffix="/mo"
          />
        </div>
      </div>

      {/* Horizon picker */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Show me</span>
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl">
          {[1, 3, 5].map(y => (
            <button
              key={y}
              onClick={() => setHorizon(y)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                horizon === y
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {y}Y
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">from now</span>
      </div>

      {/* Three comparison tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <ComparisonTile
          label="Wealth"
          icon={TrendingUp}
          takeAction={fmt(d.investorWealth)}
          doNothing={fmt(d.doNothingPosition)}
          actionColor="text-emerald-500 dark:text-emerald-400"
          doNothingLabel="still paying taxes"
        />
        <ComparisonTile
          label="Monthly Cashflow"
          icon={Banknote}
          takeAction={`${fmt(d.monthlyCashflow)}/mo`}
          doNothing="$0/mo"
          actionColor="text-emerald-500 dark:text-emerald-400"
          doNothingLabel="paycheck dependent"
        />
        <ComparisonTile
          label="Tax Impact"
          icon={Receipt}
          takeAction={`+${fmt(d.cumulativeTaxSavings)}`}
          doNothing={`−${fmt(d.cumulativeTaxesPaid)}`}
          actionColor="text-emerald-500 dark:text-emerald-400"
          doNothingLabel="thrown away"
        />
      </div>

      {/* Freedom callout */}
      {projection.isReachable ? (
        <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.08] px-5 py-4 flex items-baseline gap-2 flex-wrap">
          <Trophy className="w-5 h-5 text-emerald-500 dark:text-emerald-400 self-center flex-shrink-0" />
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Financially free in</span>
          <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{projection.yearsLabel}</span>
          <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">years,</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">acquiring</span>
          <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{projection.minPropsNeeded}</span>
          <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">properties</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">with</span>
          <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{fmt(projection.cashflowAtFreedom)}</span>
          <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">/mo</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">total passive income</span>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 dark:text-slate-300">
            At current settings, reaching{' '}
            <strong className="text-amber-500 dark:text-amber-400">{fmt(enoughNumber)}/mo</strong>
            {' '}passively isn't achievable in {totalYears} years. Switch to Advanced to adjust cap rate and equity stake.
          </p>
        </div>
      )}

      {/* Opportunity gap callout */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-red-500 dark:text-red-400 mb-2">Opportunity Gap</p>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <span className="text-3xl sm:text-4xl font-black text-red-500 dark:text-red-400 tabular-nums">
            {fmt(d.investorWealth - d.doNothingPosition)}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            difference between acting and not acting after {horizon} year{horizon !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Combined wealth chart */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 text-center">
          20-Year Wealth Trajectory · Take Action vs. Do Nothing
        </p>
        <WealthChart
          data={projection.data}
          buyingYears={buyingYears}
          eligibleStartYear={projection.eligibleStartYear}
          isReachable={projection.isReachable}
          yearsToReach={projection.yearsToReach}
          totalYears={totalYears}
          showStockAlt={false}
          enoughNumber={enoughNumber}
          isDark={isDark}
        />
      </div>

      {/* Subtle hint */}
      <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 pb-2">
        Switch to <span className="font-bold">Advanced</span> to tune every assumption — cap rate, depreciation, equity, refi cycles, and more.
      </p>

    </div>
  );
}