import { computeTotalTax, taxSavingsFromDeduction } from './tax.js';

export const TOTAL_YEARS = 20;
export const STATUS_QUO_YEARS = 30;

function annualLoanPayment(principal, rate, termYears) {
  if (principal <= 0) return 0;
  if (rate === 0) return principal / termYears;
  const pow = Math.pow(1 + rate, termYears);
  return (principal * rate * pow) / (pow - 1);
}

function loanRemainingBalance(principal, rate, termYears, yearsPaid) {
  if (principal <= 0 || yearsPaid >= termYears) return 0;
  if (rate === 0) return Math.max(0, principal * (1 - yearsPaid / termYears));
  const pow = Math.pow(1 + rate, termYears);
  return (principal * (pow - Math.pow(1 + rate, yearsPaid))) / (pow - 1);
}

export function computeProjection({
  income,
  stateRate = 5,
  enoughNumber,
  propertyValue,
  propertiesPerYear,
  buyingYears,
  capRate,
  depreciation,
  depDeferYears,
  equityPct,
  forcedAppreciation,
  annualAppreciation,
  cashflowGrowth,
  savingsRate,
  stockReturn,
  ltv = 0,
  loanRate = 6.5,
  loanTerm = 25,
}) {
  const stateRateDecimal  = stateRate / 100;
  const ltvDecimal        = ltv / 100;
  const loanRateDecimal   = loanRate / 100;
  const apprecRate        = annualAppreciation / 100;
  const forcedApprecRate  = forcedAppreciation / 100;
  const cfGrowthRate      = cashflowGrowth / 100;
  const equityRate        = equityPct / 100;
  const capRateDecimal    = capRate / 100;
  const eligibleStartYear = depDeferYears + 1;

  const baseYearTax    = computeTotalTax(income, stateRateDecimal);
  const afterTaxIncome = income - baseYearTax;
  const annualStockSavings = afterTaxIncome * (savingsRate / 100);
  const stockGrowthRate    = stockReturn / 100;

  const data = [{
    year: 'Y0', yearNum: 0,
    totalDealValue: 0, equity: 0,
    cumulativeCashflow: 0, cumulativeTaxSavings: 0,
    yearTaxSavings: 0, monthlyCashflow: 0, annualCashflow: 0,
    properties: 0, cumulativeTaxesPaid: 0, yearTaxesPaid: 0,
    investorWealth: 0, doNothingPosition: 0,
    depPool: 0, bankedFutureTax: 0, totalProfits: 0,
    equityGain: 0, cumulativePrincipalPaydown: 0, yearPrincipalPaydown: 0, totalOriginalPurchaseCost: 0,
    stockBalance: 0, totalLoanBalance: 0,
    annualDebtService: 0, capitalDeployed: 0,
    isBuyingPhase: true, depEligible: depDeferYears === 0,
  }];

  let totalDealMonthlyCashflow    = 0;
  let totalDealAssetValue         = 0;
  let totalOriginalPurchaseCost   = 0;
  let cumulativeProperties        = 0;
  let cumulativeCashflow          = 0;
  let cumulativeTaxSavings        = 0;
  let depPool                     = 0;
  let cumulativeTaxesPaid         = 0;
  let stockBalance                = 0;
  let capitalDeployed             = 0;
  let cumulativePrincipalPaydown  = 0;
  const loanCohorts               = [];

  for (let year = 1; year <= TOTAL_YEARS; year++) {
    stockBalance             = (stockBalance + annualStockSavings) * (1 + stockGrowthRate);
    totalDealAssetValue      *= (1 + apprecRate);
    totalDealMonthlyCashflow *= (1 + cfGrowthRate);

    const isBuying = year <= buyingYears;

    if (isBuying) {
      cumulativeProperties  += propertiesPerYear;
      const totalPurchase    = propertiesPerYear * propertyValue;
      const loanPrincipal    = totalPurchase * ltvDecimal;
      const downPayment      = totalPurchase - loanPrincipal;

      totalDealAssetValue      += totalPurchase * (1 + forcedApprecRate);
      totalOriginalPurchaseCost += totalPurchase;
      totalDealMonthlyCashflow += totalPurchase * capRateDecimal / 12;
      depPool                  += totalPurchase * (depreciation / 100) * equityRate;
      // capitalDeployed stays 0: investor raises capital / uses creative financing

      if (loanPrincipal > 0) {
        loanCohorts.push({
          originYear:    year,
          principal:     loanPrincipal,
          annualPayment: annualLoanPayment(loanPrincipal, loanRateDecimal, loanTerm),
        });
      }
    }

    // Aggregate loan position across all cohorts
    let totalLoanBalance       = 0;
    let totalAnnualDebtService = 0;
    for (const cohort of loanCohorts) {
      const age = year - cohort.originYear; // 0 = purchase year
      if (age < loanTerm) {
        totalAnnualDebtService += cohort.annualPayment;
        totalLoanBalance       += loanRemainingBalance(
          cohort.principal, loanRateDecimal, loanTerm, age
        );
      }
    }

    // Principal paid down this year across all active cohorts
    let yearPrincipalPaydown = 0;
    for (const cohort of loanCohorts) {
      const age = year - cohort.originYear;
      if (age > 0 && age <= loanTerm) {
        yearPrincipalPaydown += (
          loanRemainingBalance(cohort.principal, loanRateDecimal, loanTerm, age - 1) -
          loanRemainingBalance(cohort.principal, loanRateDecimal, loanTerm, age)
        );
      }
    }
    yearPrincipalPaydown     = Math.max(0, yearPrincipalPaydown) * equityRate;
    cumulativePrincipalPaydown += yearPrincipalPaydown;

    // Equity (net of loan balance) and cashflow (net of debt service)
    const yourEquity           = Math.max(0, (totalDealAssetValue - totalLoanBalance) * equityRate);
    const dealNetMonthlyCF     = totalDealMonthlyCashflow - totalAnnualDebtService / 12;
    const yourMonthlyCashflow  = dealNetMonthlyCF * equityRate;
    const yourAnnualCashflow   = yourMonthlyCashflow * 12;
    cumulativeCashflow        += yourAnnualCashflow;

    // Tax savings via depreciation — bracket-accurate
    let yearTaxSavings  = 0;
    const depEligible   = year >= eligibleStartYear;

    if (depEligible) {
      if (isBuying) {
        // Depreciation offsets W2 + cashflow (active investor / REPS during buying)
        const grossIncome = income + yourAnnualCashflow;
        const used        = Math.min(depPool, Math.max(0, grossIncome));
        depPool          -= used;
        yearTaxSavings    = taxSavingsFromDeduction(grossIncome, used, stateRateDecimal);
      } else {
        // Holding phase: REPS makes cashflow tax-free; remaining depPool shelters W2
        const cashflowTax  = computeTotalTax(income + yourAnnualCashflow, stateRateDecimal)
                           - computeTotalTax(income, stateRateDecimal);
        const w2Sheltered  = Math.min(depPool, income);
        depPool           -= w2Sheltered;
        const w2Savings    = taxSavingsFromDeduction(income, w2Sheltered, stateRateDecimal);
        yearTaxSavings     = cashflowTax + w2Savings;
      }
    }
    cumulativeTaxSavings += yearTaxSavings;

    const yearTaxesPaid      = computeTotalTax(income, stateRateDecimal);
    cumulativeTaxesPaid     += yearTaxesPaid;

    // Value of the remaining depreciation pool at current income/rates
    const bankedFutureTax = taxSavingsFromDeduction(income, depPool, stateRateDecimal);
    const equityGain      = Math.max(0, (totalDealAssetValue - totalOriginalPurchaseCost) * equityRate);
    const totalProfits    = equityGain + cumulativePrincipalPaydown + cumulativeCashflow + cumulativeTaxSavings + bankedFutureTax;

    data.push({
      year: `Y${year}`, yearNum: year,
      totalDealValue:      totalDealAssetValue,
      equity:              yourEquity,
      cumulativeCashflow,
      cumulativeTaxSavings,
      yearTaxSavings,
      monthlyCashflow:     yourMonthlyCashflow,
      annualCashflow:      yourAnnualCashflow,
      properties:          cumulativeProperties,
      cumulativeTaxesPaid,
      yearTaxesPaid,
      investorWealth:      totalProfits,
      doNothingPosition:   -cumulativeTaxesPaid,
      depPool,
      bankedFutureTax,
      totalProfits,
      equityGain,
      cumulativePrincipalPaydown,
      yearPrincipalPaydown,
      totalOriginalPurchaseCost,
      stockBalance,
      totalLoanBalance,
      annualDebtService:   totalAnnualDebtService * equityRate,
      capitalDeployed,
      isBuyingPhase:       isBuying,
      depEligible,
    });
  }

  // Freedom calculation (net of debt service per property)
  const grossMonthlyPerProp  = propertyValue * capRateDecimal / 12;
  const loanPerPropMonthly   = ltvDecimal > 0
    ? annualLoanPayment(propertyValue * ltvDecimal, loanRateDecimal, loanTerm) / 12
    : 0;
  const monthlyCashflowPerProp = (grossMonthlyPerProp - loanPerPropMonthly) * equityRate;
  const propsNeeded   = monthlyCashflowPerProp > 0
    ? Math.ceil(enoughNumber / monthlyCashflowPerProp)
    : Infinity;
  const yearsToReach  = Number.isFinite(propsNeeded)
    ? Math.ceil(propsNeeded / propertiesPerYear)
    : Infinity;
  const cashflowAtFreedom = Number.isFinite(propsNeeded)
    ? propsNeeded * monthlyCashflowPerProp
    : 0;
  const isReachable = Number.isFinite(propsNeeded)
    && propsNeeded <= propertiesPerYear * buyingYears;

  return {
    data, propsNeeded, yearsToReach, cashflowAtFreedom,
    isReachable, eligibleStartYear, monthlyCashflowPerProp,
  };
}
