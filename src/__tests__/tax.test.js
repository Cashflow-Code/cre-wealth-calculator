import { describe, it, expect } from 'vitest';
import {
  computeFederalTax,
  marginalRate,
  effectiveRate,
  computeTotalTax,
  taxSavingsFromDeduction,
} from '../utils/tax.js';

describe('computeFederalTax', () => {
  it('returns 0 for zero income', () => {
    expect(computeFederalTax(0)).toBe(0);
  });

  it('returns 0 for negative income', () => {
    expect(computeFederalTax(-5_000)).toBe(0);
  });

  it('10% bracket only', () => {
    // $10,000: 10% on all
    expect(computeFederalTax(10_000)).toBeCloseTo(1_000);
  });

  it('crosses 10% into 12% bracket', () => {
    // $11,600 @ 10% = $1,160; $400 @ 12% = $48 → $1,208
    expect(computeFederalTax(12_000)).toBeCloseTo(1_208);
  });

  it('$300K uses five brackets and is less than 37% flat', () => {
    const tax = computeFederalTax(300_000);
    expect(tax).toBeGreaterThan(50_000);
    expect(tax).toBeLessThan(300_000 * 0.37);
  });

  it('is monotonically increasing', () => {
    expect(computeFederalTax(200_000)).toBeGreaterThan(computeFederalTax(100_000));
    expect(computeFederalTax(500_000)).toBeGreaterThan(computeFederalTax(200_000));
  });
});

describe('marginalRate', () => {
  it('returns 0.10 for income in lowest bracket', () => {
    expect(marginalRate(5_000)).toBe(0.10);
  });

  it('returns 0.22 for income around $80K', () => {
    expect(marginalRate(80_000)).toBe(0.22);
  });

  it('returns 0.37 for income above $609K', () => {
    expect(marginalRate(700_000)).toBe(0.37);
  });

  it('returns 0 for zero or negative income', () => {
    expect(marginalRate(0)).toBe(0);
    expect(marginalRate(-100)).toBe(0);
  });
});

describe('effectiveRate', () => {
  it('is always below the top marginal rate', () => {
    expect(effectiveRate(300_000)).toBeLessThan(0.37);
  });

  it('increases as income grows', () => {
    expect(effectiveRate(200_000)).toBeGreaterThan(effectiveRate(100_000));
  });

  it('returns 0 for zero income', () => {
    expect(effectiveRate(0)).toBe(0);
  });
});

describe('computeTotalTax', () => {
  it('adds state rate on top of federal', () => {
    const federal = computeFederalTax(100_000);
    const total = computeTotalTax(100_000, 0.05);
    expect(total).toBeCloseTo(federal + 5_000);
  });

  it('matches federal when stateRate is 0', () => {
    expect(computeTotalTax(100_000, 0)).toBeCloseTo(computeFederalTax(100_000));
  });

  it('treats negative income as zero', () => {
    expect(computeTotalTax(-10_000, 0.05)).toBe(0);
  });
});

describe('taxSavingsFromDeduction', () => {
  it('returns 0 for zero deduction', () => {
    expect(taxSavingsFromDeduction(300_000, 0, 0.05)).toBe(0);
  });

  it('savings are positive for valid deduction', () => {
    expect(taxSavingsFromDeduction(300_000, 50_000, 0.05)).toBeGreaterThan(0);
  });

  it('savings cannot exceed total tax on income', () => {
    const total = computeTotalTax(300_000, 0.05);
    // Deducting more than income still caps at total tax
    expect(taxSavingsFromDeduction(300_000, 1_000_000, 0.05)).toBeCloseTo(total);
  });

  it('larger deduction yields larger savings', () => {
    const s1 = taxSavingsFromDeduction(300_000, 50_000, 0.05);
    const s2 = taxSavingsFromDeduction(300_000, 100_000, 0.05);
    expect(s2).toBeGreaterThan(s1);
  });
});
