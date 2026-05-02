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
  pilotYearProperties: 2,  // matches propertiesPerYear — preserves existing assertions
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

  describe('tax savings invariants', () => {
    it('yearTaxSavings never exceeds yearTaxesPaid in any year', () => {
      const { data } = computeProjection(defaults);
      for (let i = 1; i <= TOTAL_YEARS; i++) {
        expect(data[i].yearTaxSavings).toBeLessThanOrEqual(data[i].yearTaxesPaid + 0.01);
      }
    });

    it('yearTaxSavings is non-negative in all years', () => {
      const { data } = computeProjection(defaults);
      for (let i = 1; i <= TOTAL_YEARS; i++) {
        expect(data[i].yearTaxSavings).toBeGreaterThanOrEqual(0);
      }
    });

    it('cumulativeTaxSavings is monotonically non-decreasing', () => {
      const { data } = computeProjection(defaults);
      for (let i = 2; i <= TOTAL_YEARS; i++) {
        expect(data[i].cumulativeTaxSavings).toBeGreaterThanOrEqual(data[i - 1].cumulativeTaxSavings);
      }
    });

    it('yearTaxSavings is 0 in every deferred year', () => {
      const { data } = computeProjection({ ...defaults, depDeferYears: 5 });
      for (let i = 1; i <= 5; i++) {
        expect(data[i].yearTaxSavings).toBe(0);
      }
      expect(data[6].yearTaxSavings).toBeGreaterThan(0);
    });
  });

  describe('principal paydown', () => {
    it('yearPrincipalPaydown is 0 in every year when ltv=0', () => {
      const { data } = computeProjection(defaults); // defaults has ltv: 0
      for (let i = 1; i <= TOTAL_YEARS; i++) {
        expect(data[i].yearPrincipalPaydown).toBe(0);
      }
    });

    it('yearPrincipalPaydown is positive in Y1 when ltv > 0', () => {
      const { data } = computeProjection({ ...defaults, ltv: 100 });
      expect(data[1].yearPrincipalPaydown).toBeGreaterThan(0);
    });

    it('cumulativePrincipalPaydown grows every buying-phase year when ltv > 0', () => {
      const { data } = computeProjection({ ...defaults, ltv: 100 });
      for (let i = 2; i <= 5; i++) {
        expect(data[i].cumulativePrincipalPaydown).toBeGreaterThan(data[i - 1].cumulativePrincipalPaydown);
      }
    });

    it('greater ltv produces greater cumulativePrincipalPaydown at Y10', () => {
      const low  = computeProjection({ ...defaults, ltv: 50 });
      const high = computeProjection({ ...defaults, ltv: 100 });
      expect(high.data[10].cumulativePrincipalPaydown).toBeGreaterThan(low.data[10].cumulativePrincipalPaydown);
    });
  });

  describe('cashflow modeling', () => {
    it('monthlyCashflow is positive in all buying-phase years (ltv=0)', () => {
      const { data } = computeProjection(defaults);
      for (let i = 1; i <= 5; i++) {
        expect(data[i].monthlyCashflow).toBeGreaterThan(0);
      }
    });

    it('monthlyCashflow grows each buying-phase year (new properties added)', () => {
      const { data } = computeProjection(defaults);
      for (let i = 2; i <= 5; i++) {
        expect(data[i].monthlyCashflow).toBeGreaterThan(data[i - 1].monthlyCashflow);
      }
    });

    it('higher capRate yields higher monthlyCashflow at Y5', () => {
      const low  = computeProjection({ ...defaults, capRate: 6 });
      const high = computeProjection({ ...defaults, capRate: 12 });
      expect(high.data[5].monthlyCashflow).toBeGreaterThan(low.data[5].monthlyCashflow);
    });

    it('higher cashflowGrowth yields higher monthlyCashflow in holding phase', () => {
      const low  = computeProjection({ ...defaults, cashflowGrowth: 0 });
      const high = computeProjection({ ...defaults, cashflowGrowth: 5 });
      expect(high.data[15].monthlyCashflow).toBeGreaterThan(low.data[15].monthlyCashflow);
    });
  });

  describe('equity and appreciation', () => {
    it('equityGain is non-negative in all years', () => {
      const { data } = computeProjection(defaults);
      for (let i = 1; i <= TOTAL_YEARS; i++) {
        expect(data[i].equityGain).toBeGreaterThanOrEqual(0);
      }
    });

    it('higher annualAppreciation yields greater equityGain at Y20', () => {
      const low  = computeProjection({ ...defaults, annualAppreciation: 1 });
      const high = computeProjection({ ...defaults, annualAppreciation: 8 });
      expect(high.data[20].equityGain).toBeGreaterThan(low.data[20].equityGain);
    });

    it('forcedAppreciation makes Y1 totalDealValue exceed totalOriginalPurchaseCost', () => {
      const { data } = computeProjection({ ...defaults, forcedAppreciation: 30 });
      expect(data[1].totalDealValue).toBeGreaterThan(data[1].totalOriginalPurchaseCost);
    });

    it('zero forcedAppreciation keeps Y1 totalDealValue equal to purchase cost', () => {
      const { data } = computeProjection({ ...defaults, forcedAppreciation: 0, annualAppreciation: 0 });
      expect(data[1].totalDealValue).toBeCloseTo(data[1].totalOriginalPurchaseCost, -2);
    });
  });

  describe('freedom calculation', () => {
    const reachableDefaults = {
      ...defaults, enoughNumber: 10_000, propertiesPerYear: 10, buyingYears: 10,
    };

    it('cashflowAtFreedom >= enoughNumber when isReachable', () => {
      const result = computeProjection(reachableDefaults);
      expect(result.isReachable).toBe(true);
      expect(result.cashflowAtFreedom).toBeGreaterThanOrEqual(10_000);
    });

    it('yearsToReach is a finite positive integer when isReachable', () => {
      const result = computeProjection(reachableDefaults);
      expect(result.isReachable).toBe(true);
      expect(Number.isFinite(result.yearsToReach)).toBe(true);
      expect(result.yearsToReach).toBeGreaterThan(0);
    });

    it('propsNeeded is Infinity when capRate is 0 (zero cashflow per property)', () => {
      const result = computeProjection({ ...defaults, capRate: 0 });
      expect(result.propsNeeded).toBe(Infinity);
      expect(result.isReachable).toBe(false);
    });

    it('more propertiesPerYear reaches freedom sooner', () => {
      // pilotYearProperties=0 so year 1 is a pure training year; distinction is clean
      const slow = computeProjection({ ...reachableDefaults, propertiesPerYear: 2,  pilotYearProperties: 0 });
      const fast = computeProjection({ ...reachableDefaults, propertiesPerYear: 10, pilotYearProperties: 0 });
      expect(fast.yearsToReach).toBeLessThan(slow.yearsToReach);
    });
  });
});

describe('pilot-year ramp (pilotYearProperties)', () => {
  it('year 1 uses pilotYearProperties, year 2 accumulates normally', () => {
    const { data } = computeProjection({ ...defaults, pilotYearProperties: 1 });
    expect(data[1].properties).toBe(1);
    expect(data[2].properties).toBe(1 + defaults.propertiesPerYear);
  });

  it('pilotYearProperties=0 → no year-1 acquisition and zero cashflow', () => {
    const { data } = computeProjection({ ...defaults, pilotYearProperties: 0 });
    expect(data[1].properties).toBe(0);
    expect(data[1].monthlyCashflow).toBe(0);
  });

  it('null pilotYearProperties behaves like propertiesPerYear (backward compat)', () => {
    const withNull    = computeProjection({ ...defaults, pilotYearProperties: null });
    const withDefault = computeProjection({ ...defaults });
    expect(withNull.data[1].properties).toBe(withDefault.data[1].properties);
  });
});

describe('LTV slider', () => {
  it('higher LTV → more debt service → lower cashflow', () => {
    const low  = computeProjection({ ...defaults, ltv: 50,  loanRate: 6, loanTerm: 30 });
    const high = computeProjection({ ...defaults, ltv: 100, loanRate: 6, loanTerm: 30 });
    expect(low.data[1].monthlyCashflow).toBeGreaterThan(high.data[1].monthlyCashflow);
  });

  it('ltv=0 → no debt service', () => {
    const { data } = computeProjection({ ...defaults, ltv: 0 });
    expect(data[1].annualDebtService).toBe(0);
  });
});

describe('minPropsNeeded', () => {
  it('is at most propsNeeded when freedom is reachable', () => {
    const p = computeProjection({ ...defaults, ltv: 70, loanRate: 6, loanTerm: 30 });
    if (p.isReachable) {
      expect(p.minPropsNeeded).toBeLessThanOrEqual(p.propsNeeded);
    }
  });

  it('is Infinity when monthlyCashflowPerProp is 0', () => {
    const p = computeProjection({ ...defaults, capRate: 0 });
    expect(p.minPropsNeeded).toBe(Infinity);
  });
});

describe('yearsLabel', () => {
  it('returns a string when freedom is reachable', () => {
    const reachable = { ...defaults, capRate: 20, enoughNumber: 5_000 };
    const p = computeProjection(reachable);
    if (p.isReachable) {
      expect(typeof p.yearsLabel).toBe('string');
      expect(p.yearsLabel.length).toBeGreaterThan(0);
    }
  });

  it('is null when not reachable', () => {
    const p = computeProjection({ ...defaults, enoughNumber: 999_999_999 });
    expect(p.isReachable).toBe(false);
    expect(p.yearsLabel).toBeNull();
  });
});