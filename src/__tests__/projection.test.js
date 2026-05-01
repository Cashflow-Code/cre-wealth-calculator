import { describe, it, expect } from 'vitest';
import { computeProjection, TOTAL_YEARS } from '../utils/projection.js';

const defaults = {
  income: 300_000,
  taxRate: 37,
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
};

describe('computeProjection', () => {
  it('Y0 starts at zero', () => {
    const { data } = computeProjection(defaults);
    const y0 = data[0];
    expect(y0.totalProfits).toBe(0);
    expect(y0.equity).toBe(0);
    expect(y0.cumulativeCashflow).toBe(0);
    expect(y0.cumulativeTaxSavings).toBe(0);
    expect(y0.stockBalance).toBe(0);
  });

  it('returns TOTAL_YEARS + 1 data points (Y0 through Y20)', () => {
    const { data } = computeProjection(defaults);
    expect(data).toHaveLength(TOTAL_YEARS + 1);
  });

  it('buying phase accumulates properties correctly', () => {
    const { data } = computeProjection(defaults);
    expect(data[1].properties).toBe(2);
    expect(data[3].properties).toBe(6);
    expect(data[5].properties).toBe(10);
    // hold phase — no new properties
    expect(data[6].properties).toBe(10);
    expect(data[10].properties).toBe(10);
  });

  it('isBuyingPhase is true during buying years only', () => {
    const { data } = computeProjection(defaults);
    expect(data[1].isBuyingPhase).toBe(true);
    expect(data[5].isBuyingPhase).toBe(true);
    expect(data[6].isBuyingPhase).toBe(false);
    expect(data[20].isBuyingPhase).toBe(false);
  });

  it('depDeferYears=0 means tax savings eligible from year 1', () => {
    const { data } = computeProjection({ ...defaults, depDeferYears: 0 });
    expect(data[1].depEligible).toBe(true);
    expect(data[1].yearTaxSavings).toBeGreaterThan(0);
  });

  it('depDeferYears=3 defers eligibility until year 4', () => {
    const { data } = computeProjection({ ...defaults, depDeferYears: 3 });
    expect(data[1].depEligible).toBe(false);
    expect(data[2].depEligible).toBe(false);
    expect(data[3].depEligible).toBe(false);
    expect(data[4].depEligible).toBe(true);
    expect(data[1].yearTaxSavings).toBe(0);
    expect(data[4].yearTaxSavings).toBeGreaterThan(0);
  });

  it('totalProfits grows monotonically over the projection', () => {
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

  it('doNothingPosition is always negative (cumulative taxes paid)', () => {
    const { data } = computeProjection(defaults);
    for (let i = 1; i <= TOTAL_YEARS; i++) {
      expect(data[i].doNothingPosition).toBeLessThan(0);
    }
  });

  it('isReachable when enough properties can be bought in phase', () => {
    const { isReachable } = computeProjection({
      ...defaults,
      enoughNumber: 1_000,
      propertiesPerYear: 10,
      buyingYears: 10,
    });
    expect(isReachable).toBe(true);
  });

  it('isReachable is false when target requires more properties than available', () => {
    const { isReachable } = computeProjection({
      ...defaults,
      enoughNumber: 500_000, // extremely high target
      propertiesPerYear: 1,
      buyingYears: 1,
    });
    expect(isReachable).toBe(false);
  });

  it('100% equity means full deal value flows to investor', () => {
    const full  = computeProjection({ ...defaults, equityPct: 100 });
    const half  = computeProjection({ ...defaults, equityPct: 50 });
    expect(full.data[5].equity).toBeCloseTo(half.data[5].equity * 2, 0);
  });
});
