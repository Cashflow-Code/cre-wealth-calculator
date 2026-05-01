import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Home, AlertTriangle, Trophy,
  Building2, Banknote, Zap, Clock,
  User, Receipt, Coins, PanelLeftOpen,
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import WealthChart from './components/WealthChart.jsx';
import MetricTile from './components/MetricTile.jsx';
import TotalBanner from './components/TotalBanner.jsx';
import ContrastBullet from './components/ContrastBullet.jsx';
import Logo from './components/Logo.jsx';
import { fmt } from './utils/fmt.js';
import { computeProjection, TOTAL_YEARS, STATUS_QUO_YEARS } from './utils/projection.js';

export default function App() {
  const [income, setIncome]                         = useState(300_000);
  const [taxRate, setTaxRate]                       = useState(37);
  const [enoughNumber, setEnoughNumber]             = useState(10_000);
  const [propertyValue, setPropertyValue]           = useState(2_000_000);
  const [propertiesPerYear, setPropertiesPerYear]   = useState(2);
  const [buyingYears, setBuyingYears]               = useState(5);
  const [capRate, setCapRate]                       = useState(10);
  const [depreciation, setDepreciation]             = useState(40);
  const [depDeferYears, setDepDeferYears]           = useState(0);
  const [equityPct, setEquityPct]                   = useState(25);
  const [forcedAppreciation, setForcedAppreciation] = useState(30);
  const [annualAppreciation, setAnnualAppreciation] = useState(10);
  const [cashflowGrowth, setCashflowGrowth]         = useState(3);
  const [showStockAlt, setShowStockAlt]             = useState(false);
  const [savingsRate, setSavingsRate]               = useState(20);
  const [stockReturn, setStockReturn]               = useState(8);
  const [horizon, setHorizon]                       = useState(5);
  const [sidebarOpen, setSidebarOpen]               = useState(true);

  const projection = useMemo(() => computeProjection({
    income, taxRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
  }), [
    income, taxRate, enoughNumber, propertyValue, propertiesPerYear,
    buyingYears, capRate, depreciation, depDeferYears, equityPct,
    forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
  ]);

  const horizonData        = projection.data[horizon];
  const extraYearsBanked   = horizonData.depPool / (enoughNumber * 12);
  const afterTaxIncome     = income * (1 - taxRate / 100);
  const annualStockDeposit = afterTaxIncome * (savingsRate / 100);
  const totalStockInvested = annualStockDeposit * TOTAL_YEARS;

  const takeActionBreakdown = [
    fmt(horizonData.equity), 'equity',
    '·', fmt(horizonData.cumulativeCashflow), 'cashflow',
    '·', fmt(horizonData.cumulativeTaxSavings), 'saved',
    ...(horizonData.bankedFutureTax > 0 ? ['·', fmt(horizonData.bankedFutureTax), 'banked'] : []),
  ].join(' ');

  return (
    <div className="min-h-screen bg-[#060d1f] text-slate-100">
      {/* Subtle radial glow in the top-right */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <Logo />
          <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-slate-700/40 rounded-xl backdrop-blur-sm">
            {[1, 3, 5].map((y) => (
              <button
                key={y}
                onClick={() => setHorizon(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  horizon === y
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {y}Y
              </button>
            ))}
          </div>
        </header>

        <div className="flex gap-8">

          {/* Sidebar */}
          {sidebarOpen && (
            <Sidebar
              income={income} setIncome={setIncome}
              taxRate={taxRate} setTaxRate={setTaxRate}
              enoughNumber={enoughNumber} setEnoughNumber={setEnoughNumber}
              propertyValue={propertyValue} setPropertyValue={setPropertyValue}
              propertiesPerYear={propertiesPerYear} setPropertiesPerYear={setPropertiesPerYear}
              buyingYears={buyingYears} setBuyingYears={setBuyingYears}
              capRate={capRate} setCapRate={setCapRate}
              equityPct={equityPct} setEquityPct={setEquityPct}
              depreciation={depreciation} setDepreciation={setDepreciation}
              depDeferYears={depDeferYears} setDepDeferYears={setDepDeferYears}
              forcedAppreciation={forcedAppreciation} setForcedAppreciation={setForcedAppreciation}
              annualAppreciation={annualAppreciation} setAnnualAppreciation={setAnnualAppreciation}
              cashflowGrowth={cashflowGrowth} setCashflowGrowth={setCashflowGrowth}
              showStockAlt={showStockAlt} setShowStockAlt={setShowStockAlt}
              savingsRate={savingsRate} setSavingsRate={setSavingsRate}
              stockReturn={stockReturn} setStockReturn={setStockReturn}
              annualStockDeposit={annualStockDeposit}
              totalStockInvested={totalStockInvested}
              finalStockBalance={projection.data[TOTAL_YEARS].stockBalance}
              onClose={() => setSidebarOpen(false)}
            />
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Hero — opportunity cost */}
            <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] via-[#0d1630] to-red-500/[0.05] p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-amber-900/10">
              <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-amber-400/70 mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">{horizon}-Year Opportunity Cost</span>
                </div>
                <div className="text-5xl sm:text-7xl lg:text-8xl font-black text-amber-400 tabular-nums leading-none"
                  style={{ textShadow: '0 0 60px rgba(245,158,11,0.25)' }}>
                  {fmt(horizonData.totalProfits)}
                </div>
                <p className="text-sm text-slate-400 mt-3 max-w-xl">
                  Equity you’d build + cashflow you’d earn + tax savings (taken & banked) — over {horizon} {horizon === 1 ? 'year' : 'years'}.
                </p>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Take Action */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">If You Take Action</span>
                    </div>
                    <TotalBanner
                      label={`Total Profits · Year ${horizon}`}
                      value={fmt(horizonData.totalProfits)}
                      breakdown={takeActionBreakdown}
                      tone="emerald"
                      icon={Coins}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <MetricTile label="Net Worth"
                        value={fmt(horizonData.equity)}
                        sublabel={`${equityPct}% of ${fmt(horizonData.totalDealValue)}`}
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
                    </div>
                    <ul className="space-y-2.5 pt-1">
                      {projection.isReachable ? (
                        <ContrastBullet tone="emerald">
                          You’d be free in{' '}
                          <strong className="text-emerald-400">
                            {projection.yearsToReach} {projection.yearsToReach === 1 ? 'year' : 'years'}
                          </strong>
                          {' '}— <strong>{projection.propsNeeded} properties</strong> at{' '}
                          <strong>{fmt(projection.cashflowAtFreedom)}/mo</strong>
                        </ContrastBullet>
                      ) : (
                        <ContrastBullet tone="amber">
                          You’d need <strong>{projection.propsNeeded} properties</strong> for {fmt(enoughNumber)}/mo — buy more or higher-cashflow deals
                        </ContrastBullet>
                      )}
                      <ContrastBullet tone="emerald">
                        You’d build{' '}
                        <strong className="text-emerald-400">{fmt(horizonData.equity)}</strong> equity
                        ({equityPct}% of {fmt(horizonData.totalDealValue)} portfolio)
                      </ContrastBullet>
                      <ContrastBullet tone="emerald">
                        You’d earn{' '}
                        <strong className="text-emerald-400">{fmt(horizonData.monthlyCashflow)}/mo</strong>{' '}
                        recurring · {fmt(horizonData.cumulativeCashflow)} cumulative
                      </ContrastBullet>
                      <ContrastBullet tone="emerald">
                        You’d save{' '}
                        <strong className="text-emerald-400">{fmt(horizonData.cumulativeTaxSavings)}</strong> in taxes
                        {horizonData.bankedFutureTax > 0 && (
                          <> — plus{' '}
                            <strong className="text-emerald-400">{fmt(horizonData.bankedFutureTax)}</strong> banked for the future
                          </>
                        )}
                        {extraYearsBanked > 0.5 && (
                          <span className="text-slate-500 text-xs"> (~{extraYearsBanked.toFixed(1)} yrs of enough number)</span>
                        )}
                      </ContrastBullet>
                    </ul>
                  </div>

                  {/* Do Nothing */}
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">If You Do Nothing</span>
                    </div>
                    <TotalBanner
                      label={`Total Opportunity Cost · Year ${horizon}`}
                      value={fmt(horizonData.totalProfits)}
                      breakdown="Same number, opposite side. Every dollar that would have been your profit is opportunity walking out the door."
                      tone="red"
                      icon={Zap}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <MetricTile label="Years Working"
                        value={`${STATUS_QUO_YEARS}+`}
                        sublabel="Time for paychecks"
                        icon={Clock} tone="red" />
                      <MetricTile label="Cashflow"
                        value="$0/mo"
                        sublabel="Paycheck-to-paycheck"
                        icon={Banknote} tone="red" />
                      <MetricTile label="Taxes Lost"
                        value={fmt(horizonData.cumulativeTaxesPaid)}
                        sublabel={`${fmt(horizonData.yearTaxesPaid)}/yr burn`}
                        icon={Receipt} tone="red" />
                    </div>
                    <ul className="space-y-2.5 pt-1">
                      <ContrastBullet tone="red">
                        <strong className="text-red-400">{STATUS_QUO_YEARS} more years</strong> of you trading time for paychecks
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        <strong className="text-red-400">$0/mo passive</strong> — paycheck-to-paycheck, every month
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        One layoff away from <strong className="text-red-400">starting from scratch</strong>
                      </ContrastBullet>
                      <ContrastBullet tone="red">
                        <strong className="text-red-400">{fmt(horizonData.cumulativeTaxesPaid)}</strong> thrown away in taxes ({fmt(horizonData.yearTaxesPaid)}/yr burn rate)
                      </ContrastBullet>
                    </ul>
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
            />

            {/* Footnote */}
            <p className="text-center text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed pb-6">
              Buying years 1–{buyingYears}, hold through year {TOTAL_YEARS}.
              Year-1 deal jumps {forcedAppreciation}% (forced), then {annualAppreciation}%/yr after.
              Your equity = {equityPct}% share of total deal value. No loan modeled.
              Cashflow grows {cashflowGrowth}%/yr.
              {depDeferYears > 0 && ` Depreciation accumulates ${depDeferYears} ${depDeferYears === 1 ? 'year' : 'years'} before usable.`}
              {showStockAlt && ` Stock alt = ${savingsRate}% of after-tax income compounded at ${stockReturn}%/yr.`}
            </p>

          </main>
        </div>

        {/* Sidebar open toggle (shown when sidebar is hidden) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 px-2 py-4 rounded-r-xl bg-[#0c1428] border border-l-0 border-slate-700/40 shadow-2xl hover:border-emerald-500/30 hover:bg-slate-800 transition-all"
            title="Show your numbers"
          >
            <PanelLeftOpen className="w-5 h-5 text-emerald-400" />
            <span
              className="text-[9px] font-bold uppercase tracking-widest text-slate-400"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Your Numbers
            </span>
          </button>
        )}

      </div>
    </div>
  );
}
