import { describe, it, expect } from 'vitest';
import { computeProjection, TOTAL_YEARS } from '../utils/projection.js';

const defaults = {
  income: 300_000,
  stateRate: 5,          // replaces flat taxRate
  enoughNumber: 10_000,
  propertyValue: 2_000_000,
  propertiesPerYear: 2,
  buyingYears: 5,
  capRate: 10,
  depreciation: 40,
  depDeferYears: 0,
  equityPct: 25,
  forcedAppreciation: 30,
  annualAppreciation: 10,
  cashflowGrowth: 3,
  savingsRate: 20,
  stockReturn: 8,
  ltv: 0,
  loanRate: 6.5,
  loanTerm: 25,
};

describe('computeProjection', () => {
  it('Y0 starts at zero', () => {
    const { data } = computeProjection(defaults);
    const y0 = data[0];
    expect(y0.totalProfits).toBe(0);
    expect(y0.equity).toBe(0);
    expect(y0.cumulativeCashflow).toBe(0);
    expect(y0.stockBalance).toBe(0);
    expect(y0.totalLoanBalance).toBe(0);
    expect(y0.capitalDeployed).toBe(0);
  });

  it('returns TOTAL_YEARS + 1 data points (Y0–Y20)', () => {
    const { data } = computeProjection(defaults);
    expect(data).toHaveLength(TOTAL_YEARS + 1);
  });

  it('accumulates properties during buying phase only', () => {
    const { data } = computeProjection(defaults);
    expect(data[1].properties).toBe(2);
    expect(data[5].properties).toBe(10);
    expect(data[6].properties).toBe(10); // hold phase
    expect(data[20].properties).toBe(10);
  });

  it('isBuyingPhase correct for each year', () => {
    const { data } = computeProjection(defaults);
    expect(data[1].isBuyingPhase).toBe(true);
    expect(data[5].isBuyingPhase).toBe(true);
    expect(data[6].isBuyingPhase).toBe(false);
  });

  it('depDeferYears=0 means tax savings start year 1', () => {
    const { data } = computeProjection({ ...defaults, depDeferYears: 0 });
    expect(data[1].depEligible).toBe(true);
    expect(data[1].yearTaxSavings).toBeGreaterThan(0);
  });

  it('depDeferYears=3 defers eligibility to year 4', () => {
    const { data } = computeProjection({ ...defaults, depDeferYears: 3 });
    expect(data[1].depEligible).toBe(false);
    expect(data[3].depEligible).toBe(false);
    expect(data[4].depEligible).toBe(true);
    expect(data[1].yearTaxSavings).toBe(0);
    expect(data[4].yearTaxSavings).toBeGreaterThan(0);
  });

  it('totalProfits grows every year', () => {
    const { data } = computeProjection(defaults);
    for (let i = 2; i <= TOTAL_YEARS; i++) {
      expect(data[i].totalProfits).toBeGreaterThan(data[i - 1].totalProfits);
    }
  });

  it('stock balance grows every year', () => {
    const { data } = computeProjection(defaults);
    for (let i = 2; i <= TOTAL_YEARS; i++) {
      expect(data[i].stockBalance).toBeGreaterThan(data[i - 1].stockBalance);
    }
  });

  it('doNothingPosition is always negative', () => {
    const { data } = computeProjection(defaults);
    for (let i = 1; i <= TOTAL_YEARS; i++) {
      expect(data[i].doNothingPosition).toBeLessThan(0);
    }
  });

  it('isReachable when enough properties fit in buying phase', () => {
    const { isReachable } = computeProjection({
      ...defaults,
      enoughNumber: 1_000,
      propertiesPerYear: 10,
      buyingYears: 10,
    });
    expect(isReachable).toBe(true);
  });

  it('isReachable is false with impossible target', () => {
    const { isReachable } = computeProjection({
      ...defaults,
      enoughNumber: 500_000,
      propertiesPerYear: 1,
      buyingYears: 1,
    });
    expect(isReachable).toBe(false);
  });

  it('100% equity gives roughly 4x the equity of 25%', () => {
    const full = computeProjection({ ...defaults, equityPct: 100 });
    const qtr  = computeProjection({ ...defaults, equityPct: 25 });
    expect(full.data[5].equity).toBeCloseTo(qtr.data[5].equity * 4, -3);
  });

  describe('loan modeling', () => {
    it('no loan: capitalDeployed = full purchase price * equityRate', () => {
      const { data } = computeProjection({ ...defaults, ltv: 0, equityPct: 100 });
      // Year 1: 2 properties * $2M * 100% equity, no loan
      expect(data[1].capitalDeployed).toBeCloseTo(4_000_000);
    });

    it('80% LTV: capitalDeployed is 20% of purchase price', () => {
      const { data } = computeProjection({ ...defaults, ltv: 80, equityPct: 100 });
      // Year 1: 2 * $2M * 20% down = $800K
      expect(data[1].capitalDeployed).toBeCloseTo(800_000);
    });

    it('loan reduces net cashflow vs no loan', () => {
      const noLoan = computeProjection({ ...defaults, ltv: 0 });
      const withLoan = computeProjection({ ...defaults, ltv: 75 });
      expect(withLoan.data[5].cumulativeCashflow).toBeLessThan(noLoan.data[5].cumulativeCashflow);
    });

    it('loan is paid off after loanTerm years', () => {
      const { data } = computeProjection({ ...defaults, ltv: 75, loanTerm: 10 });
      // After term ends, loan balance should be zero (or very close)
      expect(data[Math.min(15, TOTAL_YEARS)].totalLoanBalance).toBeCloseTo(0, -2);
    });

    it('higher LTV means lower equity at Y5', () => {
      const noLoan   = computeProjection({ ...defaults, ltv: 0 });
      const highLoan = computeProjection({ ...defaults, ltv: 75 });
      // More leverage → lower net equity
      expect(highLoan.data[5].equity).toBeLessThan(noLoan.data[5].equity);
    });
  });

  describe('tax bracket modeling', () => {
    it('higher state rate reduces after-tax stock savings', () => {
      const low  = computeProjection({ ...defaults, stateRate: 0 });
      const high = computeProjection({ ...defaults, stateRate: 10 });
      expect(high.data[20].stockBalance).toBeLessThan(low.data[20].stockBalance);
    });

    it('yearTaxesPaid is higher than a simple 10% flat rate would give', () => {
      const { data } = computeProjection({ ...defaults, stateRate: 0 });
      // At $300K income, marginal brackets yield more tax than 10%
      expect(data[1].yearTaxesPaid).toBeGreaterThan(300_000 * 0.10);
    });
  });
});
