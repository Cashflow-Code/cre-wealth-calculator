import React from 'react';
import { User, Building2, TrendingUp, BarChart3, RotateCcw } from 'lucide-react';
import Slider from './Slider.jsx';
import EquityInput from './EquityInput.jsx';
import Switch from './Switch.jsx';
import { fmt } from '../utils/fmt.js';
import { TOTAL_YEARS } from '../utils/projection.js';
import { effectiveRate } from '../utils/tax.js';

const STATE_PRESETS = [
  { label: 'No Tax', value: 0, hint: 'FL, TX, WY' },
  { label: 'Low',    value: 3, hint: 'CO, UT' },
  { label: 'Mid',    value: 5, hint: 'GA, VA' },
  { label: 'High',   value: 9, hint: 'CA, NY' },
];

function SectionHeader({ icon: Icon, label, iconColor = 'text-emerald-500 dark:text-emerald-400' }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function SidebarContent({
  // personal
  income, setIncome, stateRate, setStateRate, enoughNumber, setEnoughNumber,
  // deal
  propertyValue, setPropertyValue, propertiesPerYear, setPropertiesPerYear,
  buyingYears, setBuyingYears, capRate, setCapRate, equityPct, setEquityPct,
  depreciation, setDepreciation, depDeferYears, setDepDeferYears,
  // loan
  ltv, setLtv, loanRate, setLoanRate, loanTerm, setLoanTerm,
  // growth
  forcedAppreciation, setForcedAppreciation,
  annualAppreciation, setAnnualAppreciation,
  cashflowGrowth, setCashflowGrowth,
  // stocks
  showStockAlt, setShowStockAlt, savingsRate, setSavingsRate,
  stockReturn, setStockReturn,
  // derived
  annualStockDeposit, totalStockInvested, finalStockBalance,
  // actions
  onReset,
}) {
  const federalEffective = effectiveRate(income);
  const totalEffective   = federalEffective + stateRate / 100;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset to defaults
      </button>

      {/* Personal */}
      <section className="space-y-4">
        <SectionHeader icon={User} label="Personal" />
        <Slider label="Annual Income" value={income} onChange={setIncome}
          min={50000} max={2000000} step={10000} format={fmt} />

        {/* Effective rate read-out */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700/40 bg-slate-100 dark:bg-slate-800/30 px-3 py-2.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Federal effective rate</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">{(federalEffective * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Combined (fed + state)</span>
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{(totalEffective * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* State tax presets */}
        <div className="space-y-1.5">
          <div className="flex gap-1.5 flex-wrap">
            {STATE_PRESETS.map(({ label, value, hint }) => (
              <button
                key={value}
                onClick={() => setStateRate(value)}
                title={hint}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  stateRate === value
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {label} {value}%
              </button>
            ))}
          </div>
        </div>

        <Slider label="State Tax Rate" value={stateRate} onChange={setStateRate}
          min={0} max={15} step={0.5} format={(v) => `${v}%`}
          sublabel="Added on top of 2024 federal brackets" />
        <Slider label="Enough Number / mo" value={enoughNumber} onChange={setEnoughNumber}
          min={2000} max={50000} step={1000}
          format={(v) => `$${(v / 1000).toFixed(0)}K`}
          sublabel="Monthly passive income to feel free" />
      </section>

      {/* Deal Structure */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-4">
        <SectionHeader icon={Building2} label="Deal Structure" />
        <Slider label="Avg Property Value" value={propertyValue} onChange={setPropertyValue}
          min={500000} max={5000000} step={100000} format={fmt} />
        <Slider label="Properties / Year" value={propertiesPerYear} onChange={setPropertiesPerYear}
          min={1} max={10} step={1}
          format={(v) => `${v} ${v === 1 ? 'deal' : 'deals'}`}
          sublabel="During the buying phase" />
        <Slider label="Buying Years" value={buyingYears} onChange={setBuyingYears}
          min={1} max={10} step={1}
          format={(v) => `${v} ${v === 1 ? 'year' : 'years'}`}
          sublabel={`Then hold through Y${TOTAL_YEARS}`} />
        <Slider label="Cap Rate" value={capRate} onChange={setCapRate}
          min={4} max={20} step={1} format={(v) => `${v}%`}
          sublabel="Annual NOI ÷ property value" />
        <EquityInput value={equityPct} onChange={setEquityPct} />
        <Slider label="Bonus Depreciation" value={depreciation} onChange={setDepreciation}
          min={10} max={50} step={5} format={(v) => `${v}%`}
          sublabel="Cost seg, year-1 acceleration" />
        <Slider label="Years to Use Depreciation" value={depDeferYears} onChange={setDepDeferYears}
          min={0} max={15} step={1}
          format={(v) => (v === 0 ? 'Now' : `${v}y`)}
          sublabel={depDeferYears === 0
            ? 'You can deduct today (W-2 + REPS)'
            : 'Deferred — accumulates until eligible (H1B, pre-REPS)'
          } />
      </section>

      {/* Loan */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-4">
        <SectionHeader icon={Building2} label="Loan / Leverage" iconColor="text-violet-500 dark:text-violet-400" />
        <Slider label="LTV (Loan-to-Value)" value={ltv} onChange={setLtv}
          min={0} max={80} step={5} format={(v) => (v === 0 ? 'None (all cash)' : `${v}%`)}
          sublabel={ltv === 0 ? 'No debt — all cash' : `${100 - ltv}% down per property`} />
        {ltv > 0 && (
          <>
            <Slider label="Loan Interest Rate" value={loanRate} onChange={setLoanRate}
              min={3} max={12} step={0.25} format={(v) => `${v}%`}
              sublabel="Annual rate on commercial loan" />
            <Slider label="Loan Term" value={loanTerm} onChange={setLoanTerm}
              min={10} max={30} step={1}
              format={(v) => `${v} yrs`}
              sublabel="Amortization period" />
          </>
        )}
      </section>

      {/* Growth */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-4">
        <SectionHeader icon={TrendingUp} label="Growth Assumptions" />
        <Slider label="Forced Appreciation Y1" value={forcedAppreciation} onChange={setForcedAppreciation}
          min={0} max={50} step={5} format={(v) => `${v}%`}
          sublabel="Value-add in purchase year" />
        <Slider label="Annual Appreciation Y2+" value={annualAppreciation} onChange={setAnnualAppreciation}
          min={0} max={20} step={1} format={(v) => `${v}%`}
          sublabel="Compounded after Y1" />
        <Slider label="Cashflow Growth / Yr" value={cashflowGrowth} onChange={setCashflowGrowth}
          min={0} max={10} step={1} format={(v) => `${v}%`}
          sublabel="Rent escalation" />
      </section>

      {/* Stocks */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader icon={BarChart3} label="Alternative · Stocks" iconColor="text-sky-500 dark:text-sky-400" />
          <Switch checked={showStockAlt} onChange={() => setShowStockAlt(!showStockAlt)} />
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Compare against saving a % of after-tax income and compounding it in stocks.
          {showStockAlt ? ' Line shown on chart.' : ' Toggle on to add a line.'}
        </p>
        <Slider label="Savings Rate" value={savingsRate} onChange={setSavingsRate}
          min={5} max={50} step={5} format={(v) => `${v}%`}
          sublabel="% of after-tax income saved" disabled={!showStockAlt} />
        <Slider label="Stock Market Return" value={stockReturn} onChange={setStockReturn}
          min={4} max={12} step={1} format={(v) => `${v}%`}
          sublabel="Annual, net of fees" disabled={!showStockAlt} />
        <div className={`rounded-xl border border-sky-500/20 bg-sky-500/[0.05] p-3 space-y-1.5 transition-opacity ${!showStockAlt ? 'opacity-40' : ''}`}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">Your Stock Investment</div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-slate-500">Per year</span>
            <span className="text-sm font-bold text-sky-500 dark:text-sky-400 tabular-nums">{fmt(annualStockDeposit)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] text-slate-500">Total over {TOTAL_YEARS} yrs</span>
            <span className="text-sm font-bold text-sky-500 dark:text-sky-400 tabular-nums">{fmt(totalStockInvested)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-sky-500/20">
            <span className="text-[10px] text-slate-500">Final balance Y{TOTAL_YEARS}</span>
            <span className="text-sm font-bold text-sky-500 dark:text-sky-400 tabular-nums">{fmt(finalStockBalance)}</span>
          </div>
        </div>
      </section>

    </div>
  );
}
