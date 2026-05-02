import React from 'react';
import { User, Building2, TrendingUp, BarChart3, ChevronDown } from 'lucide-react';
import EquityInput from './EquityInput.jsx';
import Switch from './Switch.jsx';
import { fmt } from '../utils/fmt.js';
import { TOTAL_YEARS } from '../utils/projection.js';
import { effectiveRate } from '../utils/tax.js';

const STATE_PRESETS = [
  { label: '0 TAXES', value: 0, hint: 'FL, TX, WY — No income tax' },
  { label: 'LCOL',    value: 3, hint: 'CO, UT — Low cost of living' },
  { label: 'MCOL',    value: 5, hint: 'GA, VA — Mid cost of living' },
  { label: 'HCOL',    value: 9, hint: 'CA, NY — High cost of living' },
];

const ENOUGH_PRESETS = [
  { label: '$10K', value: 10_000 },
  { label: '$15K', value: 15_000 },
  { label: '$20K', value: 20_000 },
  { label: '$30K', value: 30_000 },
];

const presetButtonClass = (active) =>
  `py-1 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap ${
    active
      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
  }`;

function SectionHeader({ icon: Icon, label, iconColor = 'text-emerald-500 dark:text-emerald-400' }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function DisclosureSummary({ icon: Icon, label, iconColor = 'text-slate-400' }) {
  return (
    <summary className="flex items-center gap-2 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
      {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
      <ChevronDown className="w-3 h-3 text-slate-400 ml-auto transition-transform group-open:rotate-180" />
    </summary>
  );
}

function Slider({ label, value, onChange, min, max, step, format, sublabel, disabled, tone = 'emerald' }) {
  const valueClass = tone === 'sky' ? 'text-sky-500 dark:text-sky-400' : 'text-emerald-500 dark:text-emerald-400';
  const thumbColor = tone === 'sky'
    ? '[&::-webkit-slider-thumb]:bg-sky-500 [&::-moz-range-thumb]:bg-sky-500'
    : '[&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:bg-emerald-500';
  return (
    <div className={`space-y-1.5 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className={`text-sm font-bold tabular-nums ${valueClass}`}>{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step} disabled={disabled}
        className={`w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full ${thumbColor}`}
      />
      {sublabel && <p className="text-[10px] text-slate-500 leading-tight">{sublabel}</p>}
    </div>
  );
}

export default function SidebarContent({
  income, setIncome, stateRate, setStateRate, enoughNumber, setEnoughNumber,
  propertyValue, setPropertyValue, propertiesPerYear, setPropertiesPerYear,
  buyingYears, setBuyingYears, capRate, setCapRate, equityPct, setEquityPct,
  depreciation, setDepreciation, depDeferYears, setDepDeferYears,
  forcedAppreciation, setForcedAppreciation,
  annualAppreciation, setAnnualAppreciation,
  cashflowGrowth, setCashflowGrowth,
  showStockAlt, setShowStockAlt, savingsRate, setSavingsRate,
  stockReturn, setStockReturn,
  ltv, setLtv, loanRate, setLoanRate, pilotYearProperties, setPilotYearProperties,
  annualStockDeposit, totalStockInvested, finalStockBalance,
  isSimple,
}) {
  const federalEffective = effectiveRate(income);
  const totalEffective   = federalEffective + stateRate / 100;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

      {/* Personal */}
      <section className="space-y-4">
        <SectionHeader icon={User} label="Personal" />
        <Slider label="Annual Income" value={income} onChange={setIncome}
          min={50000} max={2000000} step={25000} format={fmt} />

        {!isSimple && (
          <p className="text-[10px] text-slate-500 leading-tight -mt-1">
            Effective tax · <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{(federalEffective * 100).toFixed(1)}%</span> fed · <span className="font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{(totalEffective * 100).toFixed(1)}%</span> combined
          </p>
        )}

        {/* State Tax — label + presets + slider */}
        {!isSimple && (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">State Tax Rate</label>
              <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{stateRate}%</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {STATE_PRESETS.map(({ label, value, hint }) => (
                <button key={value} onClick={() => setStateRate(value)} title={hint}
                  className={presetButtonClass(stateRate === value)}>
                  {label}
                </button>
              ))}
            </div>
            <input type="range" value={stateRate} onChange={(e) => setStateRate(Number(e.target.value))}
              min={0} max={15} step={0.5}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500" />
            <p className="text-[10px] text-slate-500 leading-tight">Added on top of 2026 federal brackets</p>
          </div>
        )}

        {/* Enough Number — label + presets + slider */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Enough Number / mo</label>
            <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">${(enoughNumber / 1000).toFixed(0)}K</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {ENOUGH_PRESETS.map(({ label, value }) => (
              <button key={value} onClick={() => setEnoughNumber(value)}
                className={presetButtonClass(enoughNumber === value)}>
                {label}
              </button>
            ))}
          </div>
          <input type="range" value={enoughNumber} onChange={(e) => setEnoughNumber(Number(e.target.value))}
            min={2000} max={50000} step={1000}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500" />
          <p className="text-[10px] text-slate-500 leading-tight">Monthly passive income to feel free</p>
        </div>
      </section>

      {/* Deal Structure — daily-driver inputs */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-4">
        <SectionHeader icon={Building2} label="Deal Structure" />
        <Slider label="Avg Property Value" value={propertyValue} onChange={setPropertyValue}
          min={500000} max={5000000} step={100000} format={fmt} />
        <Slider label="Properties / Year" value={propertiesPerYear} onChange={setPropertiesPerYear}
          min={1} max={6} step={1}
          format={(v) => `${v} ${v === 1 ? 'deal' : 'deals'}`}
          sublabel="During the buying phase (year 2+)" />
        {!isSimple && (
          <Slider label="Year 1 Deals" value={pilotYearProperties} onChange={setPilotYearProperties}
            min={0} max={4} step={1}
            format={(v) => v === 0 ? 'Training only' : `${v} ${v === 1 ? 'deal' : 'deals'}`}
            sublabel="Pilot acquisitions; full pace from year 2" />
        )}
        {!isSimple && (
          <Slider label="Cap Rate" value={capRate} onChange={setCapRate}
            min={4} max={20} step={1} format={(v) => `${v}%`}
            sublabel="Annual NOI ÷ property value" />
        )}
        {!isSimple && <EquityInput value={equityPct} onChange={setEquityPct} />}
      </section>

      {/* Advanced deal terms — collapsed by default */}
      {!isSimple && (
        <details className="group border-t border-slate-200 dark:border-slate-700/40 pt-5">
          <DisclosureSummary icon={Building2} label="Advanced deal terms" />
          <div className="mt-4 space-y-4">
            <Slider label="Buying Years" value={buyingYears} onChange={setBuyingYears}
              min={1} max={10} step={1}
              format={(v) => `${v} ${v === 1 ? 'year' : 'years'}`}
              sublabel={`Then hold through Y${TOTAL_YEARS}`} />
            <Slider label="Deal LTV" value={ltv} onChange={setLtv}
              min={0} max={100} step={5} format={(v) => `${v}%`}
              sublabel="Bank debt as % of purchase price; rest raised from equity partners" />
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
          </div>
        </details>
      )}

      {/* Growth Assumptions — collapsed by default */}
      {!isSimple && (
        <details className="group border-t border-slate-200 dark:border-slate-700/40 pt-5">
          <DisclosureSummary icon={TrendingUp} label="Growth Assumptions" />
          <div className="mt-4 space-y-4">
            <Slider label="Forced Appreciation Y1" value={forcedAppreciation} onChange={setForcedAppreciation}
              min={0} max={50} step={5} format={(v) => `${v}%`}
              sublabel="Value-add in purchase year" />
            <Slider label="Annual Appreciation Y2+" value={annualAppreciation} onChange={setAnnualAppreciation}
              min={0} max={20} step={1} format={(v) => `${v}%`}
              sublabel="Compounded after Y1" />
            <Slider label="Cashflow Growth / Yr" value={cashflowGrowth} onChange={setCashflowGrowth}
              min={0} max={10} step={1} format={(v) => `${v}%`}
              sublabel="Rent escalation" />
          </div>
        </details>
      )}

      {/* Stocks — always shown */}
      <section className="border-t border-slate-200 dark:border-slate-700/40 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader icon={BarChart3} label="Alternative · Stocks" iconColor="text-sky-500 dark:text-sky-400" />
          {!isSimple && <Switch checked={showStockAlt} onChange={() => setShowStockAlt(!showStockAlt)} />}
        </div>
        {!isSimple && (
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Compare against saving a % of after-tax income and compounding it in stocks.
            {showStockAlt ? ' Line shown on chart.' : ' Toggle on to add a line.'}
          </p>
        )}
        <Slider label="Savings Rate" value={savingsRate} onChange={setSavingsRate}
          min={5} max={50} step={5} format={(v) => `${v}%`}
          sublabel="% of after-tax income saved" disabled={!isSimple && !showStockAlt} tone="sky" />
        <Slider label="Stock Market Return" value={stockReturn} onChange={setStockReturn}
          min={4} max={12} step={1} format={(v) => `${v}%`}
          sublabel="Annual, net of fees" disabled={!isSimple && !showStockAlt} tone="sky" />
        <div className={`rounded-xl border border-sky-500/20 bg-sky-500/[0.05] p-3 space-y-1.5 transition-opacity ${(!isSimple && !showStockAlt) ? 'opacity-40' : ''}`}>
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