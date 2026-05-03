import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, Trophy,
  Banknote, Receipt,
  Coins, PanelLeftOpen, Menu, Sun, Moon, Sparkles,
  RefreshCw, Eye, SlidersHorizontal,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import MobileSidebar from './components/MobileSidebar.jsx';
import WealthChart from './components/WealthChart.jsx';
import CashflowChart from './components/CashflowChart.jsx';
import SimpleCalculator from './components/SimpleCalculator.jsx';
import Logo from './components/Logo.jsx';
import { fmt } from './utils/fmt.js';
import { computeProjection, TOTAL_YEARS } from './utils/projection.js';
import { computeTotalTax } from './utils/tax.js';

const DEFAULTS = {
  income: 300_000, stateRate: 9, enoughNumber: 10_000,
  propertyValue: 2_500_000, propertiesPerYear: 3, buyingYears: 5,
  capRate: 8, depreciation: 35, depDeferYears: 0, equityPct: 33,
  forcedAppreciation: 20, annualAppreciation: 3, cashflowGrowth: 2,
  savingsRate: 20, stockReturn: 8,
  ltv: 70, loanRate: 6, pilotYearProperties: 2,
};

export default function App() {
  const [income, setIncome]                         = useState(DEFAULTS.income);
  const [stateRate, setStateRate]                   = useState(DEFAULTS.stateRate);
  const [enoughNumber, setEnoughNumber]             = useState(DEFAULTS.enoughNumber);
  const [propertyValue, setPropertyValue]           = useState(DEFAULTS.propertyValue);
  const [propertiesPerYear, setPropertiesPerYear]   = useState(DEFAULTS.propertiesPerYear);
  const [buyingYears, setBuyingYears]               = useState(DEFAULTS.buyingYears);
  const [capRate, setCapRate]                       = useState(DEFAULTS.capRate);
  const [depreciation, setDepreciation]             = useState(DEFAULTS.depreciation);
  const [depDeferYears, setDepDeferYears]           = useState(DEFAULTS.depDeferYears);
  const [equityPct, setEquityPct]                   = useState(DEFAULTS.equityPct);
  const [forcedAppreciation, setForcedAppreciation] = useState(DEFAULTS.forcedAppreciation);
  const [annualAppreciation, setAnnualAppreciation] = useState(DEFAULTS.annualAppreciation);
  const [cashflowGrowth, setCashflowGrowth]         = useState(DEFAULTS.cashflowGrowth);
  const [savingsRate, setSavingsRate]                 = useState(DEFAULTS.savingsRate);
  const [stockReturn, setStockReturn]                 = useState(DEFAULTS.stockReturn);
  const [ltv, setLtv]                                 = useState(DEFAULTS.ltv);
  const [loanRate, setLoanRate]                       = useState(DEFAULTS.loanRate);
  const [pilotYearProperties, setPilotYearProperties] = useState(DEFAULTS.pilotYearProperties);
  const [horizon, setHorizon]                         = useState(3);
  const [sidebarOpen, setSidebarOpen]               = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [isDark, setIsDark]                         = useState(false);
  const [refiInterval, setRefiInterval]             = useState(5);
  const [reinvestMode, setReinvestMode]             = useState('both');
  const [isSimple, setIsSimple]                     = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const resetToDefaults = () => {
    setIncome(DEFAULTS.income);                       setStateRate(DEFAULTS.stateRate);
    setEnoughNumber(DEFAULTS.enoughNumber);           setPropertyValue(DEFAULTS.propertyValue);
    setPropertiesPerYear(DEFAULTS.propertiesPerYear); setBuyingYears(DEFAULTS.buyingYears);
    setCapRate(DEFAULTS.capRate);                     setDepreciation(DEFAULTS.depreciation);
    setDepDeferYears(DEFAULTS.depDeferYears);         setEquityPct(DEFAULTS.equityPct);
    setForcedAppreciation(DEFAULTS.forcedAppreciation);
    setAnnualAppreciation(DEFAULTS.annualAppreciation);
    setCashflowGrowth(DEFAULTS.cashflowGrowth);
    setSavingsRate(DEFAULTS.savingsRate);             setStockReturn(DEFAULTS.stockReturn);
    setLtv(DEFAULTS.ltv);                             setLoanRate(DEFAULTS.loanRate);
    setPilotYearProperties(DEFAULTS.pilotYearProperties);
  };

  const projection = useMemo(() => computeProjection({
    income, stateRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
    ltv, loanRate, loanTerm: 30, pilotYearProperties,
  }), [
    income, stateRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
    ltv, loanRate, pilotYearProperties,
  ]);

  const horizonData        = projection.data[horizon];
  const baseYearTax        = computeTotalTax(income, stateRate / 100);
  const afterTaxIncome     = income - baseYearTax;
  const annualStockDeposit = afterTaxIncome * (savingsRate / 100);
  const totalStockInvested = annualStockDeposit * TOTAL_YEARS;

  const reinvestCalc = useMemo(() => {
    const apprecRate     = annualAppreciation / 100;
    const capRateDecimal = capRate / 100;
    let wealthY20 = 0, runRateMonthlyCF = 0, cumulativeCF = 0;
    for (let y = 1; y <= TOTAL_YEARS; y++) {
      const d = projection.data[y];
      if (!d) continue;
      let deployed = 0;
      if (reinvestMode === 'tax'      || reinvestMode === 'both') deployed += d.yearTaxSavings  ?? 0;
      if (reinvestMode === 'cashflow' || reinvestMode === 'both') deployed += d.annualCashflow  ?? 0;
      if (deployed <= 0) continue;
      wealthY20        += deployed * Math.pow(1 + apprecRate, TOTAL_YEARS - y);
      runRateMonthlyCF += deployed * capRateDecimal / 12;
      cumulativeCF     += deployed * capRateDecimal * (TOTAL_YEARS - y + 1);
    }
    return { wealthY20, runRateMonthlyCF, cumulativeCF };
  }, [projection, annualAppreciation, capRate, reinvestMode]);

  const refiCalc = useMemo(() => {
    const apprecRate     = annualAppreciation / 100;
    const capRateDecimal = capRate / 100;
    const equityRate     = equityPct / 100;

    let cumulativeRefiDebt = 0;
    const deployments = [];
    const firstYear = Math.min(buyingYears, TOTAL_YEARS);

    for (let y = firstYear; y <= TOTAL_YEARS; y += refiInterval) {
      const d = projection.data[y];
      if (!d) break;
      const maxBorrow = Math.max(0,
        (0.70 * d.totalDealValue - d.totalLoanBalance) * equityRate - cumulativeRefiDebt
      );
      if (maxBorrow <= 0) continue;
      cumulativeRefiDebt += maxBorrow;
      deployments.push({ year: y, amount: maxBorrow });
    }

    const wealthY20 = deployments.reduce((s, { year, amount }) =>
      s + amount * Math.pow(1 + apprecRate, TOTAL_YEARS - year), 0);
    const runRateMonthlyCF = deployments.reduce((s, { amount }) =>
      s + amount * capRateDecimal / 12, 0);
    const cumulativeCF = deployments.reduce((s, { year, amount }) =>
      s + amount * capRateDecimal * (TOTAL_YEARS - year + 1), 0);

    return { deployments, wealthY20, runRateMonthlyCF, cumulativeCF };
  }, [projection, annualAppreciation, capRate, equityPct, buyingYears, refiInterval]);

  const finalStockBalance = projection.data[TOTAL_YEARS].stockBalance;
  const combinedY20       = projection.data[TOTAL_YEARS].investorWealth + finalStockBalance;
  const wealthMultiplier  = finalStockBalance > 0 ? combinedY20 / finalStockBalance : 0;
  const taxesLostY20      = projection.data[TOTAL_YEARS].cumulativeTaxesPaid;

  const sharedSidebarProps = {
    income, setIncome, stateRate, setStateRate, enoughNumber, setEnoughNumber,
    propertyValue, setPropertyValue, propertiesPerYear, setPropertiesPerYear,
    buyingYears, setBuyingYears, capRate, setCapRate, equityPct, setEquityPct,
    depreciation, setDepreciation, depDeferYears, setDepDeferYears,
    forcedAppreciation, setForcedAppreciation,
    annualAppreciation, setAnnualAppreciation,
    cashflowGrowth, setCashflowGrowth,
    savingsRate, setSavingsRate, stockReturn, setStockReturn,
    ltv, setLtv, loanRate, setLoanRate, pilotYearProperties, setPilotYearProperties,
    annualStockDeposit, totalStockInvested,
    finalStockBalance,
    onReset: resetToDefaults,
    isSimple,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060d1f] text-slate-900 dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle - Advanced only */}
            {!isSimple && (
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                aria-label="Open settings"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Logo />
          </div>
          <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
            {/* Year picker - Advanced only (Simple has its own internal picker) */}
            {!isSimple && (
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl backdrop-blur-sm">
                {[1, 3, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setHorizon(y)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      horizon === y
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {y}Y
                  </button>
                ))}
              </div>
            )}
            {/* Simple/Advanced toggle */}
            <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl backdrop-blur-sm">
              <button
                onClick={() => setIsSimple(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSimple
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                Simple
              </button>
              <button
                onClick={() => setIsSimple(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  !isSimple
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Advanced
              </button>
            </div>
            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {isSimple ? (
          <SimpleCalculator
            projection={projection}
            income={income}
            setIncome={setIncome}
            enoughNumber={enoughNumber}
            setEnoughNumber={setEnoughNumber}
            isDark={isDark}
            totalYears={TOTAL_YEARS}
            buyingYears={buyingYears}
          />
        ) : (

        <div className="flex gap-4 md:gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          {sidebarOpen && (
            <Sidebar {...sharedSidebarProps} onClose={() => setSidebarOpen(false)} />
          )}

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Hero */}
            <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/[0.07] dark:via-[#0d1630] dark:to-red-500/[0.05] p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xl shadow-amber-900/10">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative space-y-6">

                {/* Top row: big number (left) + gap breakdown (right) */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-5 lg:gap-6">

                  {/* Left: big number */}
                  <div className="flex-shrink-0 lg:w-56">
                    <div className="flex items-center gap-2 text-amber-500/70 dark:text-amber-400/70 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Opportunity Cost</span>
                    </div>
                    <div
                      className="text-5xl sm:text-6xl lg:text-7xl font-black text-amber-500 dark:text-amber-400 tabular-nums leading-none"
                      style={{ textShadow: '0 0 60px rgba(245,158,11,0.25)' }}
                    >
                      {fmt(horizonData.investorWealth - horizonData.doNothingPosition)}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 dark:text-amber-400/60 mt-2">
                      vs. doing nothing &middot; {horizon} year{horizon !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Right: where the gap comes from */}
                  <div className="flex-1 lg:max-w-[580px] lg:ml-auto rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500/60 dark:text-amber-400/60 mb-2.5">Where the gap comes from</p>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      {[
                        { line1: 'Equity',     line2: 'Appreciation', value: horizonData.equityGain,                                         negative: false },
                        { line1: 'Cumulative', line2: 'Cashflow',     value: horizonData.cumulativeCashflow,                                 negative: false },
                        { line1: 'Tax',        line2: 'Savings',      value: horizonData.cumulativeTaxSavings + horizonData.bankedFutureTax, negative: false },
                        { line1: 'Principal',  line2: 'Paydown',      value: horizonData.cumulativePrincipalPaydown,                        negative: false },
                        { line1: 'Tax Drag',   line2: '(do nothing)', value: horizonData.cumulativeTaxesPaid,                               negative: true  },
                      ].map(({ line1, line2, value, negative }) => (
                        <div key={line1 + line2} className="flex flex-col gap-1">
                          <div className="flex items-start gap-1.5">
                            <Sparkles className={`w-3 h-3 flex-shrink-0 mt-0.5 ${negative ? 'text-red-400' : 'text-amber-400'}`} />
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-tight">
                              {line1}<br/>{line2}
                            </span>
                          </div>
                          <span className={`text-sm font-bold tabular-nums ml-[18px] ${negative ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`}>
                            {negative ? '−' : '+'}{fmt(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Freedom callout — full-width, prominent */}
                {projection.isReachable ? (
                  <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/[0.08] px-5 py-4 flex items-baseline gap-2 flex-wrap">
                    <Trophy className="w-5 h-5 text-emerald-500 dark:text-emerald-400 self-center flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Financially free in</span>
                    <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{projection.yearsLabel}</span>
                    <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">years,</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">by acquiring</span>
                    <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{projection.minPropsNeeded}</span>
                    <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">properties</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">with</span>
                    <span className="text-2xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums">{fmt(projection.cashflowAtFreedom)}</span>
                    <span className="text-sm font-medium text-emerald-500/80 dark:text-emerald-400/80">/mo</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">total passive income</span>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Reaching <strong className="text-amber-500 dark:text-amber-400">{fmt(enoughNumber)}/mo</strong> passively isn't achievable in {TOTAL_YEARS} years. Adjust cap rate or equity stake.
                    </p>
                  </div>
                )}

                {/* Comparison tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Wealth',            icon: TrendingUp, takeAction: fmt(horizonData.investorWealth),             doNothing: `−${fmt(horizonData.cumulativeTaxesPaid)}`, doNothingLabel: 'taxes thrown away' },
                    { label: 'Monthly Cashflow',  icon: Banknote,   takeAction: `${fmt(horizonData.monthlyCashflow)}/mo`,    doNothing: '$0/mo',                                        doNothingLabel: 'paycheck dependent' },
                    { label: 'Tax Impact',        icon: Receipt,    takeAction: `+${fmt(horizonData.cumulativeTaxSavings)}`, doNothing: `−${fmt(horizonData.cumulativeTaxesPaid)}`, doNothingLabel: 'thrown away'        },
                    { label: 'Principal Paydown', icon: Coins,      takeAction: fmt(horizonData.cumulativePrincipalPaydown), doNothing: '$0',                                           doNothingLabel: 'zero equity built'  },
                  ].map(({ label, icon: Icon, takeAction, doNothing, doNothingLabel }) => (
                    <div key={label} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white/60 dark:bg-[#0c1428]/60 overflow-hidden">
                      <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/40 flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-700/40">
                        <div className="p-2.5 sm:p-3">
                          <div className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/70 mb-1">Act</div>
                          <div className="text-sm sm:text-base font-black tabular-nums leading-none text-emerald-500 dark:text-emerald-400">{takeAction}</div>
                        </div>
                        <div className="p-2.5 sm:p-3">
                          <div className="text-[8px] font-bold uppercase tracking-wider text-red-500/70 mb-1">Wait</div>
                          <div className="text-sm sm:text-base font-black tabular-nums leading-none text-red-400 dark:text-red-500">{doNothing}</div>
                          <div className="text-[8px] text-slate-500 mt-0.5 leading-tight">{doNothingLabel}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* Chart */}
            <WealthChart
              data={projection.data}
              buyingYears={buyingYears}
              eligibleStartYear={projection.eligibleStartYear}
              isReachable={projection.isReachable}
              yearsToReach={projection.yearsToReach}
              totalYears={TOTAL_YEARS}
              showStockAlt={true}
              enoughNumber={enoughNumber}
              isDark={isDark}
            />

            {/* Cashflow Chart */}
            <CashflowChart
              data={projection.data}
              enoughNumber={enoughNumber}
              isReachable={projection.isReachable}
              yearsToReach={projection.yearsToReach}
              totalYears={TOTAL_YEARS}
              buyingYears={buyingYears}
              isDark={isDark}
            />

            {/* How much capital do I need? */}
            <section className="rounded-2xl border border-slate-300/40 dark:border-slate-600/30 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-500/[0.07] dark:via-[#0c1428] dark:to-slate-400/[0.04] relative overflow-hidden shadow-2xl shadow-slate-900/10">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-slate-300/15 dark:bg-slate-400/[0.06] blur-3xl" />
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-6">

                  {/* Left: title + hero number */}
                  <div className="flex-shrink-0 lg:w-72">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">How much capital do I need?</p>
                    <p
                      className="text-5xl sm:text-6xl font-black text-slate-800 dark:text-slate-100 leading-none tabular-nums"
                      style={{ textShadow: '0 0 60px rgba(148,163,184,0.45)' }}
                    >$0</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">of your own capital is required to get started</p>
                  </div>

                  {/* Vertical divider — slate hint */}
                  <div className="hidden lg:block self-stretch w-px bg-gradient-to-b from-transparent via-slate-300/60 dark:via-slate-600/40 to-transparent" />

                  {/* Right: 3 supporting boxes */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Taxes Redirected',          value: fmt(horizonData.cumulativeTaxSavings),       sub: 'W-2 tax bill becomes equity instead',     valueClass: 'text-2xl sm:text-3xl tabular-nums' },
                      { label: 'Tenant Principal',           value: fmt(horizonData.cumulativePrincipalPaydown), sub: 'renters build your equity over time',     valueClass: 'text-2xl sm:text-3xl tabular-nums' },
                      { label: 'Scale Without Your Capital', value: 'Creative Financing',                        sub: 'can cover up to 100% of the acquisition', valueClass: 'text-lg sm:text-xl' },
                    ].map(({ label, value, sub, valueClass }) => (
                      <div key={label} className="flex flex-col rounded-xl border border-slate-300/40 dark:border-slate-600/30 bg-white/60 dark:bg-slate-500/[0.06] px-4 py-4">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
                        <p className={`flex-1 flex items-center font-black leading-tight text-slate-800 dark:text-slate-100 ${valueClass}`}>{value}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 leading-snug">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* But Isn't Stock Investing More Passive? */}
            <section className="rounded-2xl border border-slate-300/40 dark:border-slate-600/30 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-500/[0.07] dark:via-[#0c1428] dark:to-slate-400/[0.04] relative overflow-hidden shadow-2xl shadow-slate-900/10">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-slate-300/15 dark:bg-slate-400/[0.06] blur-3xl" />
              <div className="relative p-4 sm:p-6 space-y-4">

                {/* Top row: punchy answer (left) + 3-cell comparison (right) */}
                <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-6">
                  <div className="flex-shrink-0 lg:w-72">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">But isn't stock investing more passive?</p>
                    <p
                      className="text-5xl sm:text-6xl font-black text-slate-800 dark:text-slate-100 leading-none"
                      style={{ textShadow: '0 0 60px rgba(148,163,184,0.45)' }}
                    >Do both.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Stocks compound. CRE multiplies.</p>
                  </div>

                  {/* Vertical divider — slate hint */}
                  <div className="hidden lg:block self-stretch w-px bg-gradient-to-b from-transparent via-slate-300/60 dark:via-slate-600/40 to-transparent" />

                  {/* Right: 3-cell comparison */}
                  <div className="flex-1 rounded-xl border border-slate-300/40 dark:border-slate-600/30 bg-white/60 dark:bg-slate-500/[0.06] overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/40">
                      <div className="p-4">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-sky-500/70 mb-2">Stock Portfolio</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl sm:text-2xl font-black tabular-nums text-sky-500 dark:text-sky-400">{fmt(finalStockBalance)}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">by Y{TOTAL_YEARS}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-2">CRE Wealth</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl sm:text-2xl font-black tabular-nums text-emerald-500 dark:text-emerald-400">{fmt(projection.data[TOTAL_YEARS].investorWealth)}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">by Y{TOTAL_YEARS}</div>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-500/[0.04]">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-2">Combined</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-xl sm:text-2xl font-black tabular-nums text-slate-800 dark:text-slate-100">{fmt(combinedY20)}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">by Y{TOTAL_YEARS}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom row: 3 equal-width callouts (sky, emerald, red) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-sky-500/70 mb-2">Stocks Unchanged</div>
                    <div className="text-xl sm:text-2xl font-black tabular-nums text-sky-500 dark:text-sky-400">{fmt(finalStockBalance)}</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Same trajectory whether or not you do CRE &mdash; nothing's traded off.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-2">CRE Funnels Back</div>
                    <div className="text-xl sm:text-2xl font-black tabular-nums text-emerald-500 dark:text-emerald-400">{fmt(projection.data[TOTAL_YEARS].cumulativeCashflow + projection.data[TOTAL_YEARS].cumulativeTaxSavings)}</div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      Cashflow + tax savings over {TOTAL_YEARS} years recycle into your brokerage.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-900 p-4">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">vs. Waiting</div>
                    <div className="text-xl sm:text-2xl font-black tabular-nums text-white">{wealthMultiplier.toFixed(1)}&times;</div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-snug">
                      More wealth than stocks alone &mdash; and you'd lose <strong className="text-red-400">{fmt(taxesLostY20)}</strong> to taxes either way.
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* Other Optimizations You Can Perform */}
            <section className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden">
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
                <p className="text-sm font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">Other Optimizations You Can Perform</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  These compound on top of your base scenario. All estimates use the settings above.
                </p>
              </div>
              {/* Combined upside callout */}
              <div className="mx-4 sm:mx-6 mb-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <p className="text-3xl font-black tabular-nums text-violet-500 dark:text-violet-400 leading-none">
                  +{fmt(refiCalc.wealthY20 + reinvestCalc.wealthY20)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold uppercase tracking-widest text-violet-500/70 dark:text-violet-400/70">Combined upside at Y{TOTAL_YEARS}</span>
                  {' '}&mdash; refi cycles + reinvestment stacked on your base scenario
                </p>
              </div>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Refi Cycle */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] overflow-hidden">
                  <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-violet-500/20">
                    <RefreshCw className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Refi Cycle</span>
                  </div>
                  <div className="px-5 pt-3 pb-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Refi every</span>
                      <span className="text-[10px] font-bold text-violet-400">{refiInterval}y</span>
                    </div>
                    <input type="range" min={2} max={10} step={1} value={refiInterval}
                      onChange={e => setRefiInterval(Number(e.target.value))}
                      className="w-full h-1 accent-violet-500" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-0 px-4 sm:px-5 py-4 sm:py-5">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center pb-4 border-b sm:pb-0 sm:border-b-0 sm:pr-5 sm:border-r border-violet-500/20 sm:min-w-[120px]">
                      <div className="text-4xl sm:text-5xl font-black text-violet-500 dark:text-violet-400 tabular-nums leading-none">+{fmt(refiCalc.wealthY20, 1)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500/60 dark:text-violet-400/60 mt-2">extra wealth by Y{TOTAL_YEARS}</div>
                    </div>
                    <div className="flex-1 sm:pl-5 space-y-2.5 flex flex-col justify-center">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">70% LTV refi every {refiInterval}y</strong>
                          {' '}&mdash; first pull Y{refiCalc.deployments[0]?.year ?? buyingYears + 2}: {fmt(refiCalc.deployments[0]?.amount ?? 0, 1)} ({refiCalc.deployments.length} event{refiCalc.deployments.length !== 1 ? 's' : ''} total)
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">+{fmt(refiCalc.runRateMonthlyCF, 1)}/mo</strong> run-rate cashflow at Y{TOTAL_YEARS}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">+{fmt(refiCalc.cumulativeCF, 1)} cumulative</strong> cashflow over the period
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax & Cashflow Reinvestment */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] overflow-hidden">
                  <div className="px-5 pt-4 pb-3 flex items-center gap-2 border-b border-violet-500/20">
                    <TrendingUp className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Tax &amp; Cashflow Reinvestment</span>
                  </div>
                  <div className="px-5 pt-3 pb-1">
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'tax',      label: 'Tax only' },
                        { id: 'cashflow', label: 'Cashflow' },
                        { id: 'both',     label: 'Both' },
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          onClick={() => setReinvestMode(id)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-colors ${
                            reinvestMode === id
                              ? 'bg-violet-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-0 px-4 sm:px-5 py-4 sm:py-5">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center pb-4 border-b sm:pb-0 sm:border-b-0 sm:pr-5 sm:border-r border-violet-500/20 sm:min-w-[120px]">
                      <div className="text-4xl sm:text-5xl font-black text-violet-500 dark:text-violet-400 tabular-nums leading-none">+{fmt(reinvestCalc.wealthY20, 1)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500/60 dark:text-violet-400/60 mt-2">extra wealth by Y{TOTAL_YEARS}</div>
                    </div>
                    <div className="flex-1 sm:pl-5 space-y-2.5 flex flex-col justify-center">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">
                            {reinvestMode === 'tax' ? 'Yearly tax savings' : reinvestMode === 'cashflow' ? 'Yearly cashflow' : 'Tax savings + cashflow'}
                          </strong>{' '}redeployed into more CRE deals
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">+{fmt(reinvestCalc.runRateMonthlyCF, 1)}/mo</strong> run-rate cashflow at Y{TOTAL_YEARS}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">+{fmt(reinvestCalc.cumulativeCF, 1)} cumulative</strong> cashflow over the period
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </main>
        </div>

        )} {/* end isSimple conditional */}

        {/* Desktop sidebar re-open toggle - Advanced only */}
        {!isSimple && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 px-2 py-4 rounded-r-xl bg-white dark:bg-[#0c1428] border border-l-0 border-slate-200 dark:border-slate-700/40 shadow-2xl hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            title="Show your numbers"
          >
            <PanelLeftOpen className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <span
              className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Your Numbers
            </span>
          </button>
        )}
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        {...sharedSidebarProps}
      />
    </div>
  );
}