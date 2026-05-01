export const TOTAL_YEARS = 20;
export const STATUS_QUO_YEARS = 30;

export function computeProjection({
  income, taxRate, enoughNumber, propertyValue, propertiesPerYear,
  buyingYears, capRate, depreciation, depDeferYears, equityPct,
  forcedAppreciation, annualAppreciation, cashflowGrowth, savingsRate, stockReturn,
}) {
  const data = [{
    year: 'Y0', yearNum: 0, totalDealValue: 0, equity: 0,
    cumulativeCashflow: 0, cumulativeTaxSavings: 0, yearTaxSavings: 0,
    monthlyCashflow: 0, annualCashflow: 0, properties: 0,
    cumulativeTaxesPaid: 0, yearTaxesPaid: 0, investorWealth: 0,
    doNothingPosition: 0, depPool: 0, bankedFutureTax: 0,
    totalProfits: 0, stockBalance: 0,
    isBuyingPhase: true, depEligible: depDeferYears === 0,
  }];

  let totalDealMonthlyCashflow = 0;
  let totalDealAssetValue = 0;
  let cumulativeProperties = 0;
  let cumulativeCashflow = 0;
  let cumulativeTaxSavings = 0;
  let depPool = 0;
  let cumulativeTaxesPaid = 0;
  let stockBalance = 0;

  const apprecRate      = annualAppreciation / 100;
  const forcedApprecRate = forcedAppreciation / 100;
  const cfGrowthRate    = cashflowGrowth / 100;
  const equityRate      = equityPct / 100;
  const taxRateDecimal  = taxRate / 100;
  const capRateDecimal  = capRate / 100;
  const eligibleStartYear = depDeferYears + 1;

  const afterTaxIncome    = income * (1 - taxRateDecimal);
  const annualStockSavings = afterTaxIncome * (savingsRate / 100);
  const stockGrowthRate   = stockReturn / 100;

  for (let year = 1; year <= TOTAL_YEARS; year++) {
    stockBalance = (stockBalance + annualStockSavings) * (1 + stockGrowthRate);
    totalDealAssetValue      *= (1 + apprecRate);
    totalDealMonthlyCashflow *= (1 + cfGrowthRate);

    const isBuying = year <= buyingYears;

    if (isBuying) {
      cumulativeProperties += propertiesPerYear;
      const newPurchasePrice = propertiesPerYear * propertyValue;
      totalDealAssetValue      += newPurchasePrice * (1 + forcedApprecRate);
      totalDealMonthlyCashflow += newPurchasePrice * capRateDecimal / 12;
      const yearDepNew = newPurchasePrice * (depreciation / 100);
      depPool += yearDepNew * equityRate;
    }

    const yourEquity         = totalDealAssetValue * equityRate;
    const yourMonthlyCashflow = totalDealMonthlyCashflow * equityRate;
    const yourAnnualCashflow  = yourMonthlyCashflow * 12;
    cumulativeCashflow += yourAnnualCashflow;

    let yearTaxSavings = 0;
    const depEligible = year >= eligibleStartYear;

    if (depEligible) {
      if (isBuying) {
        const used = Math.min(depPool, income + yourAnnualCashflow);
        depPool -= used;
        yearTaxSavings = used * taxRateDecimal;
      } else {
        const w2Sheltered = Math.min(depPool, income);
        depPool -= w2Sheltered;
        yearTaxSavings = (yourAnnualCashflow + w2Sheltered) * taxRateDecimal;
      }
    }
    cumulativeTaxSavings += yearTaxSavings;

    const yearTaxesPaid = income * taxRateDecimal;
    cumulativeTaxesPaid += yearTaxesPaid;

    const bankedFutureTax  = depPool * taxRateDecimal;
    const totalProfits     = yourEquity + cumulativeCashflow + cumulativeTaxSavings + bankedFutureTax;
    const doNothingPosition = -cumulativeTaxesPaid;

    data.push({
      year: `Y${year}`, yearNum: year,
      totalDealValue: totalDealAssetValue,
      equity: yourEquity,
      cumulativeCashflow,
      cumulativeTaxSavings,
      yearTaxSavings,
      monthlyCashflow: yourMonthlyCashflow,
      annualCashflow: yourAnnualCashflow,
      properties: cumulativeProperties,
      cumulativeTaxesPaid,
      yearTaxesPaid,
      investorWealth: totalProfits,
      doNothingPosition,
      depPool,
      bankedFutureTax,
      totalProfits,
      stockBalance,
      isBuyingPhase: isBuying,
      depEligible,
    });
  }

  const monthlyCashflowPerProp = propertyValue * capRateDecimal / 12 * equityRate;
  const propsNeeded     = monthlyCashflowPerProp > 0
    ? Math.ceil(enoughNumber / monthlyCashflowPerProp)
    : Infinity;
  const yearsToReach    = Math.ceil(propsNeeded / propertiesPerYear);
  const cashflowAtFreedom = propsNeeded * monthlyCashflowPerProp;
  const isReachable     = propsNeeded <= propertiesPerYear * buyingYears;

  return { data, propsNeeded, yearsToReach, cashflowAtFreedom, isReachable, eligibleStartYear, monthlyCashflowPerProp };
}
