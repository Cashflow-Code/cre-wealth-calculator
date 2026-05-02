import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Home, AlertTriangle, Trophy,
  Banknote, Zap, Clock, User, Receipt,
  Coins, PanelLeftOpen, Menu, Sun, Moon, Sparkles,
  RefreshCw, Eye, SlidersHorizontal,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import MobileSidebar from './components/MobileSidebar.jsx';
import WealthChart from './components/WealthChart.jsx';
import CashflowChart from './components/CashflowChart.jsx';
import MetricTile from './components/MetricTile.jsx';
import ContrastBullet from './components/ContrastBullet.jsx';
import Logo from './components/Logo.jsx';
import { fmt } from './utils/fmt.js';
import { computeProjection, TOTAL_YEARS, STATUS_QUO_YEARS } from './utils/projection.js';
import { computeTotalTax } from './utils/tax.js';

const DEFAULTS = {
  income: 300_000, stateRate: 9, enoughNumber: 10_000,
  propertyValue: 2_000_000, propertiesPerYear: 2, buyingYears: 5,
  capRate: 12, depreciation: 35, depDeferYears: 0, equityPct: 33,
  forcedAppreciation: 30, annualAppreciation: 4, cashflowGrowth: 3,
  showStockAlt: true, savingsRate: 20, stockReturn: 8,
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
  const [showStockAlt, setShowStockAlt]             = useState(DEFAULTS.showStockAlt);
  const [savingsRate, setSavingsRate]               = useState(DEFAULTS.savingsRate);
  const [stockReturn, setStockReturn]               = useState(DEFAULTS.stockReturn);
  const [horizon, setHorizon]                       = useState(3);
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
    setCashflowGrowth(DEFAULTS.cashflowGrowth);       setShowStockAlt(DEFAULTS.showStockAlt);
    setSavingsRate(DEFAULTS.savingsRate);             setStockReturn(DEFAULTS.stockReturn);
  };

  const projection = useMemo(() => computeProjection({
    income, stateRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
    ltv: 100, loanRate: 6.5, loanTerm: 30,
  }), [
    income, stateRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
  ]);

  const horizonData        = projection.data[horizon];
  const extraYearsBanked   = horizonData.depPool / (enoughNumber * 12);
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

  const sharedSidebarProps = {
    income, setIncome, stateRate, setStateRate, enoughNumber, setEnoughNumber,
    propertyValue, setPropertyValue, propertiesPerYear, setPropertiesPerYear,
    buyingYears, setBuyingYears, capRate, setCapRate, equityPct, setEquityPct,
    depreciation, setDepreciation, depDeferYears, setDepDeferYears,
    forcedAppreciation, setForcedAppreciation,
    annualAppreciation, setAnnualAppreciation,
    cashflowGrowth, setCashflowGrowth,
    showStockAlt, setShowStockAlt, savingsRate, setSavingsRate, stockReturn, setStockReturn,
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
        <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              aria-label="Open settings"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2">
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
            {/* Year picker */}
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
          </div>
        </header>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          {sidebarOpen && (
            <Sidebar {...sharedSidebarProps} onClose={() => setSidebarOpen(false)} />
          )}

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Hero */}
            <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-500/[0.07] dark:via-[#0d1630] dark:to-red-500/[0.05] p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-amber-900/10">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-0 mb-8">

                  {/* Left: badge + big number + subtitle */}
                  <div className="flex-shrink-0 lg:max-w-sm xl:max-w-md lg:pr-10 xl:pr-14 lg:border-r lg:border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-500/70 dark:text-amber-400/70 mb-4">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{horizon}-Year Opportunity Cost</span>
                    </div>
                    <div
                      className="text-5xl sm:text-7xl lg:text-8xl font-black text-amber-500 dark:text-amber-400 tabular-nums leading-none"
                      style={{ textShadow: '0 0 60px rgba(245,158,11,0.25)' }}
                    >
                      {fmt(horizonData.totalProfits)}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 dark:text-amber-400/60 mt-3 text-center">
                      from the 5 wealth engines
                    </p>
                  </div>

                  {/* Right: CRE benefit showcase — simple bullets */}
                  <div className="flex-1 lg:pl-10 xl:pl-14 space-y-3 flex flex-col justify-center">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        <strong className="text-amber-500 dark:text-amber-400">Cashflow</strong> — tenants pay rent every month, income grows with every property
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        <strong className="text-amber-500 dark:text-amber-400">Tax Benefits</strong> — cost segregation turns W2 taxes into equity &amp; cashflow
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        <strong className="text-amber-500 dark:text-amber-400">Appreciation</strong> — forced + market appreciation compounds your capital
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        <strong className="text-amber-500 dark:text-amber-400">Principal Paydown</strong> — renters build your equity by paying down your mortgage
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        <strong className="text-amber-500 dark:text-amber-400">Debt Devaluation</strong> — inflation erodes the real cost of fixed-rate debt (Fisher Effect)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Take Action */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 space-y-4 relative overflow-hidden">
                    <Coins className="absolute bottom-3 right-3 w-16 h-16 text-emerald-500 opacity-10 pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">If You Take Action</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end">
                          <span className="text-xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums leading-none">{fmt(horizonData.cumulativeTaxSavings)}</span>
                          <span className="text-sm font-bold text-emerald-400/60 dark:text-emerald-500/60">+</span>
                          <span className="text-xl font-black text-emerald-500 dark:text-emerald-400 tabular-nums leading-none">{fmt(horizonData.equityGain + horizonData.cumulativeCashflow + horizonData.cumulativePrincipalPaydown)}</span>
                        </div>
                        <div className="flex justify-end gap-3 mt-0.5">
                          <span className="text-[9px] text-slate-500 uppercase tracking-wide">Taxes Saved</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wide">Returns Gained</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <MetricTile label="Net Worth"
                        value={fmt(horizonData.equity)}
                        sublabel="Net equity position"
                        icon={Home} tone="emerald" />
                      <MetricTile label="Cashflow"
                        value={`${fmt(horizonData.monthlyCashflow)}/mo`}
                        sublabel={`${fmt(horizonData.cumulativeCashflow)} cumulative`}
                        icon={Banknote} tone="emerald" />
                      <MetricTile label="Tax Savings"
                        value={fmt(horizonData.cumulativeTaxSavings)}
                        sublabel={
                          !horizonData.depEligible
                            ? `${fmt(horizonData.depPool)} accumulating`
                            : horizonData.bankedFutureTax > 0
                              ? `+${fmt(horizonData.bankedFutureTax)} banked`
                              : 'Pool deployed'
                        }
                        icon={TrendingUp} tone="emerald" />
                      <MetricTile label="Principal Paydown"
                        value={fmt(horizonData.cumulativePrincipalPaydown)}
                        sublabel="paid by the tenants on the loan"
                        icon={Coins} tone="emerald" />
                    </div>
                    <ul className="space-y-2.5 pt-1">
                      {projection.isReachable ? (
                        <ContrastBullet tone="emerald">
                          You'd be free in{' '}
                          <strong className="text-emerald-500 dark:text-emerald-400">
                            {projection.yearsToReach - 1}–{projection.yearsToReach} years
                          </strong>
                          {' '}— <strong>{projection.propsNeeded} properties</strong> at{' '}
                          <strong>{fmt(projection.cashflowAtFreedom)}/mo</strong>
                        </ContrastBullet>
                      ) : (
                        <ContrastBullet tone="amber">
                          You'd need <strong>{projection.propsNeeded === Infinity ? '∞' : projection.propsNeeded} properties</strong> for {fmt(enoughNumber)}/mo — adjust cap rate or equity stake
                        </ContrastBullet>
                      )}
                      <ContrastBullet tone="emerald">
                        You'd gain{' '}
                        <strong className="text-emerald-500 dark:text-emerald-400">{fmt(horizonData.equityGain)}</strong>{' '}
                        in equity appreciation
                      </ContrastBullet>
                      <ContrastBullet tone="emerald">
                        You'd earn{' '}
                        <strong className="text-emerald-500 dark:text-emerald-400">{fmt(horizonData.monthlyCashflow)}/mo</strong>{' '}
                        recurring · {fmt(horizonData.cumulativeCashflow)} cumulative
                      </ContrastBullet>
                      <ContrastBullet tone="emerald">
                        You'd save{' '}
                        <strong className="text-emerald-500 dark:text-emerald-400">{fmt(horizonData.cumulativeTaxSavings)}</strong> in taxes
                        {horizonData.bankedFutureTax > 0 && (
                          <> — plus{' '}
                            <strong className="text-emerald-500 dark:text-emerald-400">{fmt(horizonData.bankedFutureTax)}</strong> banked for the future
                          </>
                        )}
                        {extraYearsBanked > 0.5 && (
                          <span className="text-slate-400 text-xs"> (~{extraYearsBanked.toFixed(1)} yrs of enough number)</span>
                        )}
                      </ContrastBullet>
                    </ul>
                  </div>

                  {/* Do Nothing */}
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 space-y-4 relative overflow-hidden">
                    <Zap className="absolute bottom-3 right-3 w-16 h-16 text-red-500 opacity-10 pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">If You Do Nothing</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-red-500 dark:text-red-400 tabular-nums leading-none">{fmt(horizonData.cumulativeTaxesPaid)}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">thrown away in taxes</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <MetricTile label="Years Working"
                        value={`${STATUS_QUO_YEARS}+`} sublabel="Trading time for money"
                        icon={Clock} tone="red" />
                      <MetricTile label="Passive Income"
                        value="$0/mo" sublabel="Paycheck-to-paycheck"
                        icon={Banknote} tone="red" />
                      <MetricTile label="Taxes Lost"
                        value={fmt(horizonData.cumulativeTaxesPaid)}
                        sublabel={`${fmt(horizonData.yearTaxesPaid)}/yr burn`}
                        icon={Receipt} tone="red" />
                      <MetricTile label="Job Insecurity"
                        value="78%"
                        sublabel="fear they're one layoff away (ADP Research, Mar. 2026)"
                        icon={User} tone="red" />
                    </div>
                    <ul className="space-y-2.5 pt-1">
                      <ContrastBullet tone="red">
                        <strong className="text-red-500 dark:text-red-400">{STATUS_QUO_YEARS} more years</strong> of trading time for money
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        <strong className="text-red-500 dark:text-red-400">$0/mo passive</strong> — paycheck-to-paycheck, every month
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        One layoff away from <strong className="text-red-500 dark:text-red-400">starting from scratch</strong>
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        <strong className="text-red-500 dark:text-red-400">{fmt(horizonData.cumulativeTaxesPaid)}</strong> thrown away in taxes ({fmt(horizonData.yearTaxesPaid)}/yr)
                      </ContrastBullet>
                    </ul>
                  </div>

                </div>
              </div>
            </section>

            {/* Zero Cash Required callout */}
            <section className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">How much capital do I need?</p>
              </div>
              <div className="flex items-stretch gap-0 px-6 pb-6">
                {/* Big $0 */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center pr-6 border-r border-sky-500/20 min-w-[120px]">
                  <div className="text-7xl sm:text-8xl font-black text-sky-500 dark:text-sky-400 tabular-nums leading-none">$0</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500/60 dark:text-sky-400/60 mt-2">of your money</div>
                </div>
                {/* Bullet explanation */}
                <div className="flex-1 pl-6 space-y-3 flex flex-col justify-center">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">Creative financing &amp; capital raises</strong> — partners fund the deals, you bring the knowledge and structure
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">Redirect taxes you already pay</strong> — depreciation turns your W-2 tax bill into real estate equity
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">Tenants pay the mortgage</strong> — principal paydown builds your equity while you sleep
                    </p>
                  </div>
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
              showStockAlt={isSimple || showStockAlt}
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

            {/* Other Optimizations You Can Perform */}
            <section className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden">
              <div className="px-6 pt-5 pb-3">
                <p className="text-sm font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">Other Optimizations You Can Perform</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  These compound on top of your base scenario. All estimates use the settings above.
                </p>
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

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
                  <div className="flex items-stretch gap-0 px-5 py-5">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center pr-5 border-r border-violet-500/20 min-w-[120px]">
                      <div className="text-4xl sm:text-5xl font-black text-violet-500 dark:text-violet-400 tabular-nums leading-none">+{fmt(refiCalc.wealthY20, 1)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500/60 dark:text-violet-400/60 mt-2">extra wealth by Y{TOTAL_YEARS}</div>
                    </div>
                    <div className="flex-1 pl-5 space-y-2.5 flex flex-col justify-center">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          <strong className="text-violet-500 dark:text-violet-400">70% LTV refi every {refiInterval}y</strong>
                          {' '}— first pull Y{refiCalc.deployments[0]?.year ?? buyingYears + 2}: {fmt(refiCalc.deployments[0]?.amount ?? 0, 1)} ({refiCalc.deployments.length} event{refiCalc.deployments.length !== 1 ? 's' : ''} total)
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
                  <div className="flex items-stretch gap-0 px-5 py-5">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center pr-5 border-r border-violet-500/20 min-w-[120px]">
                      <div className="text-4xl sm:text-5xl font-black text-violet-500 dark:text-violet-400 tabular-nums leading-none">+{fmt(reinvestCalc.wealthY20, 1)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500/60 dark:text-violet-400/60 mt-2">extra wealth by Y{TOTAL_YEARS}</div>
                    </div>
                    <div className="flex-1 pl-5 space-y-2.5 flex flex-col justify-center">
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

            {/* But Isn't Stock Investing More Passive? */}
            <section className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] overflow-hidden">
              <div className="px-6 pt-5 pb-2">
                <p className="text-sm font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">But Isn't Stock Investing More Passive?</p>
              </div>
              <div className="flex items-stretch gap-0 px-6 pb-6">
                <div className="flex-shrink-0 flex flex-col items-center justify-center pr-6 border-r border-sky-500/20 min-w-[150px]">
                  <div className="text-5xl sm:text-6xl font-black text-sky-500 dark:text-sky-400 tabular-nums leading-none">{fmt(finalStockBalance)}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-sky-500/60 dark:text-sky-400/60 mt-2 text-center">in the stock market by Y{TOTAL_YEARS}</div>
                </div>
                <div className="flex-1 pl-6 space-y-3 flex flex-col justify-center">
                  <p className="text-base font-black text-sky-500 dark:text-sky-400 tracking-tight">Well, you can do both.</p>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">It's not binary</strong> — your stock portfolio compounds the same {fmt(finalStockBalance)} regardless of whether you do CRE
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">You'll have MORE to invest in stocks</strong> — CRE cashflow + tax savings funnel back into your brokerage
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                      <strong className="text-sky-500 dark:text-sky-400">Two compounding engines</strong> — depreciation accelerates both paths simultaneously
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </main>
        </div>

        {/* Desktop sidebar re-open toggle */}
        {!sidebarOpen && (
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
