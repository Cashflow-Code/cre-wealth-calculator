import React from 'react';
import { Target, User, Building2, TrendingUp, BarChart3, PanelLeftClose } from 'lucide-react';
import Slider from './Slider.jsx';
import EquityInput from './EquityInput.jsx';
import Switch from './Switch.jsx';
import { fmt } from '../utils/fmt.js';
import { TOTAL_YEARS } from '../utils/projection.js';

function SectionHeader({ icon: Icon, label, iconColor = 'text-emerald-400' }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    </div>
  );
}

export default function Sidebar({
  income, setIncome, taxRate, setTaxRate, enoughNumber, setEnoughNumber,
  propertyValue, setPropertyValue, propertiesPerYear, setPropertiesPerYear,
  buyingYears, setBuyingYears, capRate, setCapRate, equityPct, setEquityPct,
  depreciation, setDepreciation, depDeferYears, setDepDeferYears,
  forcedAppreciation, setForcedAppreciation, annualAppreciation, setAnnualAppreciation,
  cashflowGrowth, setCashflowGrowth, showStockAlt, setShowStockAlt,
  savingsRate, setSavingsRate, stockReturn, setStockReturn,
  annualStockDeposit, totalStockInvested, finalStockBalance, onClose,
}) {
  return (
    // Fixed w-72 with flex-shrink-0 — width never changes regardless of content
    <aside className="hidden md:block w-72 flex-shrink-0">
      <div className="sticky top-4" style={{ height: 'calc(100vh - 2rem)' }}>
        <div className="h-full flex flex-col rounded-2xl bg-[#0c1428] border border-slate-700/40 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200">Your Numbers</h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Hide panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

            {/* Personal */}
            <section className="space-y-4">
              <SectionHeader icon={User} label="Personal" />
              <Slider label="Annual Income" value={income} onChange={setIncome}
                min={50000} max={2000000} step={10000} format={fmt} />
              <Slider label="Tax Rate" value={taxRate} onChange={setTaxRate}
                min={10} max={50} step={1} format={(v) => `${v}%`} />
              <Slider label="Enough Number / mo" value={enoughNumber} onChange={setEnoughNumber}
                min={2000} max={50000} step={1000}
                format={(v) => `$${(v / 1000).toFixed(0)}K`}
                sublabel="Monthly passive income to feel free" />
            </section>

            {/* Deal Structure */}
            <section className="border-t border-slate-700/40 pt-5 space-y-4">
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
                sublabel="Annual NOI ÷ property value (no loan)" />
              <EquityInput value={equityPct} onChange={setEquityPct} />
              <Slider label="Bonus Depreciation" value={depreciation} onChange={setDepreciation}
                min={10} max={50} step={5} format={(v) => `${v}%`}
                sublabel="Cost seg, year-1 acceleration" />
              <Slider label="Years to Use Depreciation" value={depDeferYears} onChange={setDepDeferYears}
                min={0} max={15} step={1}
                format={(v) => v === 0 ? 'Now' : `${v}y`}
                sublabel={depDeferYears === 0
                  ? 'You can deduct today (W-2 + REPS)'
                  : 'Deferred (H1B visa, pre-REPS) — accumulates until eligible'
                } />
            </section>

            {/* Growth */}
            <section className="border-t border-slate-700/40 pt-5 space-y-4">
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
            <section className="border-t border-slate-700/40 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <SectionHeader icon={BarChart3} label="Alternative · Stocks" iconColor="text-sky-400" />
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
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Your Stock Investment</div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Per year</span>
                  <span className="text-sm font-bold text-sky-400 tabular-nums">{fmt(annualStockDeposit)}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Total over {TOTAL_YEARS} yrs</span>
                  <span className="text-sm font-bold text-sky-400 tabular-nums">{fmt(totalStockInvested)}</span>
                </div>
                <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-sky-500/20">
                  <span className="text-[10px] text-slate-500">Final balance Y{TOTAL_YEARS}</span>
                  <span className="text-sm font-bold text-sky-400 tabular-nums">{fmt(finalStockBalance)}</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </aside>
  );
}
