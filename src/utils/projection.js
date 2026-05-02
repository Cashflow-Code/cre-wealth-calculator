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
  ltv = 70,
  loanRate = 6,
  loanTerm = 30,
  pilotYearProperties = null,
}) {
  const propsYear1 = pilotYearProperties !== null ? pilotYearProperties : propertiesPerYear;
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
      const propsThisYear    = year === 1 ? propsYear1 : propertiesPerYear;
      cumulativeProperties  += propsThisYear;
      const totalPurchase    = propsThisYear * propertyValue;
      const loanPrincipal    = totalPurchase * ltvDecimal;
      const downPayment      = totalPurchase - loanPrincipal;

      totalDealAssetValue      += totalPurchase * (1 + forcedApprecRate);
      totalOriginalPurchaseCost += totalPurchase;
      totalDealMonthlyCashflow += totalPurchase * capRateDecimal / 12;
      depPool                  += totalPurchase * (depreciation / 100) * equityRate;

      if (loanPrincipal > 0) {
        loanCohorts.push({
          originYear:    year,
          principal:     loanPrincipal,
          annualPayment: annualLoanPayment(loanPrincipal, loanRateDecimal, loanTerm),
        });
      }
    }

    let totalLoanBalance       = 0;
    let totalAnnualDebtService = 0;
    for (const cohort of loanCohorts) {
      const age = year - cohort.originYear;
      if (age < loanTerm) {
        totalAnnualDebtService += cohort.annualPayment;
        totalLoanBalance       += loanRemainingBalance(
          cohort.principal, loanRateDecimal, loanTerm, age
        );
      }
    }

    let yearPrincipalPaydown = 0;
    for (const cohort of loanCohorts) {
      const age = year - cohort.originYear;
      if (age >= 0 && age < loanTerm) {
        yearPrincipalPaydown += (
          loanRemainingBalance(cohort.principal, loanRateDecimal, loanTerm, age) -
          loanRemainingBalance(cohort.principal, loanRateDecimal, loanTerm, age + 1)
        );
      }
    }
    yearPrincipalPaydown     = Math.max(0, yearPrincipalPaydown) * equityRate;
    cumulativePrincipalPaydown += yearPrincipalPaydown;

    const yourEquity           = Math.max(0, (totalDealAssetValue - totalLoanBalance) * equityRate);
    const dealNetMonthlyCF     = totalDealMonthlyCashflow - totalAnnualDebtService / 12;
    const yourMonthlyCashflow  = dealNetMonthlyCF * equityRate;
    const yourAnnualCashflow   = yourMonthlyCashflow * 12;
    cumulativeCashflow        += yourAnnualCashflow;

    let yearTaxSavings  = 0;
    const depEligible   = year >= eligibleStartYear;

    if (depEligible) {
      const used    = Math.min(depPool, income);
      depPool      -= used;
      yearTaxSavings = taxSavingsFromDeduction(income, used, stateRateDecimal);
    }
    cumulativeTaxSavings += yearTaxSavings;

    const yearTaxesPaid      = computeTotalTax(income, stateRateDecimal);
    cumulativeTaxesPaid     += yearTaxesPaid;

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

  const grossMonthlyPerProp    = propertyValue * capRateDecimal / 12;
  const loanPerPropMonthly     = ltvDecimal > 0
    ? annualLoanPayment(propertyValue * ltvDecimal, loanRateDecimal, loanTerm) / 12
    : 0;
  const monthlyCashflowPerProp = (grossMonthlyPerProp - loanPerPropMonthly) * equityRate;

  let yearsToReach = Infinity;
  for (let y = 1; y <= TOTAL_YEARS; y++) {
    if (data[y] && Math.ceil(data[y].monthlyCashflow / 100) * 100 >= enoughNumber) { yearsToReach = y; break; }
  }
  const isReachable       = Number.isFinite(yearsToReach);
  const cashflowAtFreedom = isReachable ? data[yearsToReach].monthlyCashflow : 0;
  const propsNeeded       = isReachable ? data[yearsToReach].properties      : Infinity;

  const minPropsNeeded = monthlyCashflowPerProp > 0
    ? Math.ceil(enoughNumber / monthlyCashflowPerProp)
    : Infinity;

  let yearsLabel = isReachable ? String(yearsToReach) : null;
  if (isReachable && yearsToReach >= 1) {
    const prevCF     = data[yearsToReach - 1]?.monthlyCashflow ?? 0;
    const frac       = cashflowAtFreedom > prevCF
      ? Math.max(0, Math.min(1, (enoughNumber - prevCF) / (cashflowAtFreedom - prevCF)))
      : 0;
    const fractional = (yearsToReach - 1) + frac;
    const floorY     = Math.floor(fractional);
    const remainder  = fractional - floorY;
    if (remainder < 0.25)       yearsLabel = String(Math.max(1, floorY));
    else if (remainder <= 0.75) yearsLabel = `${Math.max(1, floorY)}–${floorY + 1}`;
    else                        yearsLabel = String(floorY + 1);
  }

  return {
    data, propsNeeded, minPropsNeeded, yearsToReach, yearsLabel,
    cashflowAtFreedom, isReachable, eligibleStartYear,
    monthlyCashflowPerProp,
  };
}
