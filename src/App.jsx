import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Home, AlertTriangle, Trophy,
  Banknote, Zap, Clock, User, Receipt,
  Coins, PanelLeftOpen, Menu, Sun, Moon, Sparkles,
  RefreshCw, Layers,
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
  capRate: 10, depreciation: 35, depDeferYears: 0, equityPct: 33,
  forcedAppreciation: 30, annualAppreciation: 10, cashflowGrowth: 3,
  showStockAlt: false, savingsRate: 20, stockReturn: 8,
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
  const [horizon, setHorizon]                       = useState(5);
  const [sidebarOpen, setSidebarOpen]               = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [isDark, setIsDark]                         = useState(true);

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

  // Tax savings reinvested at 25%/yr compounded to Y20
  const taxReinvestWealth = useMemo(() => {
    let portfolio = 0;
    for (let y = 1; y <= TOTAL_YEARS; y++) {
      portfolio = portfolio * 1.25 + (projection.data[y]?.yearTaxSavings ?? 0);
    }
    return portfolio;
  }, [projection]);
  const taxReinvestMonthlyCF = taxReinvestWealth * (capRate / 100) / 12;

  // Cash-out refi estimate: 70% LTV refi two years after buying phase ends
  const refiYear    = Math.min(buyingYears + 2, TOTAL_YEARS);
  const refiD       = projection.data[refiYear];
  const refiCashOut = refiD
    ? Math.max(0, (0.70 * refiD.totalDealValue - refiD.totalLoanBalance) * (equityPct / 100))
    : 0;
  const refiExtraWealth     = refiCashOut > 0 ? refiCashOut * Math.pow(1.25, TOTAL_YEARS - refiYear) : 0;
  const refiExtraMonthlyCF  = refiExtraWealth * (capRate / 100) / 12;

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
    finalStockBalance: projection.data[TOTAL_YEARS].stockBalance,
    onReset: resetToDefaults,
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 max-w-xl">
                  Equity appreciation + principal paydown + cashflow + tax savings — over {horizon} {horizon === 1 ? 'year' : 'years'}.
                </p>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Take Action */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 space-y-4 relative overflow-hidden">
                    <Coins className="absolute bottom-3 right-3 w-16 h-16 text-emerald-500 opacity-10 pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">If You Take Action</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-500 dark:text-emerald-400 tabular-nums leading-none">{fmt(horizonData.totalProfits)}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">total ROI</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <MetricTile label="Net Worth"
                        value={fmt(horizonData.equity)}
                        sublabel={`Net equity · ${equityPct}% of ${fmt(horizonData.totalDealValue)} portfolio`}
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
                        sublabel="Loan amortization · your share"
                        icon={Coins} tone="emerald" />
                    </div>
                    <ul className="space-y-2.5 pt-1">
                      {projection.isReachable ? (
                        <ContrastBullet tone="emerald">
                          You'd be free in{' '}
                          <strong className="text-emerald-500 dark:text-emerald-400">
                            {projection.yearsToReach} {projection.yearsToReach === 1 ? 'year' : 'years'}
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
                        in equity ({equityPct}% of {fmt(horizonData.totalDealValue)} portfolio)
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
                        <span className="text-xs font-bold uppercase tracking-widest">If You Do Nothing</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-red-500 dark:text-red-400 tabular-nums leading-none">−{fmt(horizonData.totalProfits)}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">opportunity cost</div>
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
                      <MetricTile label="1 Layoff Away"
                        value="78%"
                        sublabel="lack job security (ADP Research, Mar. 2026)"
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
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">How much capital does this require?</p>
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
              showStockAlt={showStockAlt}
              isDark={isDark}
            />

            {/* Cashflow Chart */}
            <CashflowChart
              data={projection.data}
              enoughNumber={enoughNumber}
              isReachable={projection.isReachable}
              yearsToReach={projection.yearsToReach}
              totalYears={TOTAL_YEARS}
              isDark={isDark}
            />

            {/* Optimizations */}
            <section className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] overflow-hidden">
              <div className="px-6 pt-5 pb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">Unlock Even More — Advanced Strategies</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  These are additive on top of the base scenario. All estimates use the settings above.
                </p>
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Refi Cycle */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Refi Cycle</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Cash-out refi at 70% LTV in Y{refiYear} (post-buying + appreciation buffer),
                    extracting equity and reinvesting at 25% annualized through Y{TOTAL_YEARS}.
                    Repeating every few years multiplies the effect further.
                  </p>
                  <div className="pt-2 border-t border-violet-500/20 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Equity extracted Y{refiYear}</span>
                      <span className="font-bold text-violet-500 dark:text-violet-400 tabular-nums">{fmt(refiCashOut)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Extra wealth by Y{TOTAL_YEARS}</span>
                      <span className="font-bold text-violet-500 dark:text-violet-400 tabular-nums">+{fmt(refiExtraWealth)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Extra cashflow</span>
                      <span className="font-bold text-violet-500 dark:text-violet-400 tabular-nums">+{fmt(refiExtraMonthlyCF)}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Tax Reinvestment */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">Tax Reinvestment</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Every year, instead of keeping your tax savings as cash, you redeploy them into
                    commercial real estate at a 25% annualized return — compounding year over year.
                  </p>
                  <div className="pt-2 border-t border-violet-500/20 space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Extra wealth by Y{TOTAL_YEARS}</span>
                      <span className="font-bold text-violet-500 dark:text-violet-400 tabular-nums">+{fmt(taxReinvestWealth)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Extra cashflow at {capRate}% cap</span>
                      <span className="font-bold text-violet-500 dark:text-violet-400 tabular-nums">+{fmt(taxReinvestMonthlyCF)}/mo</span>
                    </div>
                  </div>
                </div>

                {/* CRE + Stocks */}
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">CRE + Stocks</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    This is not a binary choice. You're already investing {savingsRate}% of your after-tax
                    income into stocks — CRE is the multiplier on top.
                  </p>
                  <ul className="pt-2 border-t border-violet-500/20 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-violet-400 flex-shrink-0">·</span>
                      Keep your current savings rate and compound in stocks as you do today
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-violet-400 flex-shrink-0">·</span>
                      Once free, redeploy CRE cashflow into stocks for a second compounding engine
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-violet-400 flex-shrink-0">·</span>
                      Depreciation shelters your W-2 taxes, accelerating <em>both</em> paths simultaneously
                    </li>
                  </ul>
                </div>

              </div>
            </section>

            {/* Footnote */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-600 max-w-2xl mx-auto leading-relaxed pb-6">
              Buying years 1–{buyingYears}, hold through year {TOTAL_YEARS}.
              Year-1 deal jumps {forcedAppreciation}% (forced), then {annualAppreciation}%/yr after.
              Your equity = {equityPct}% share of total deal value. Creative financing — no personal cash.
              100% LTV at 6.5% / 30-yr amortization. Cashflow grows {cashflowGrowth}%/yr.
              2026 federal brackets + {stateRate}% state.
              {depDeferYears > 0 && ` Depreciation deferred ${depDeferYears}y.`}
              {showStockAlt && ` Stock alt = ${savingsRate}% after-tax at ${stockReturn}%/yr.`}
            </p>
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
