import { describe, it, expect } from 'vitest';
import { fmt } from '../utils/fmt.js';

describe('fmt', () => {
  it('formats zero', () => {
    expect(fmt(0)).toBe('$0');
  });

  it('formats values under $1K', () => {
    expect(fmt(500)).toBe('$500');
    expect(fmt(999)).toBe('$999');
  });

  it('formats thousands', () => {
    expect(fmt(1_000)).toBe('$1K');
    expect(fmt(5_500)).toBe('$6K'); // rounds
    expect(fmt(999_999)).toBe('$1000K');
  });

  it('formats millions', () => {
    expect(fmt(1_000_000)).toBe('$1.00M');
    expect(fmt(1_500_000)).toBe('$1.50M');
    expect(fmt(2_750_000)).toBe('$2.75M');
  });

  it('formats billions', () => {
    expect(fmt(1_000_000_000)).toBe('$1.00B');
    expect(fmt(2_500_000_000)).toBe('$2.50B');
  });

  it('formats negative values', () => {
    expect(fmt(-500)).toBe('-$500');
    expect(fmt(-5_000)).toBe('-$5K');
    expect(fmt(-1_500_000)).toBe('-$1.50M');
    expect(fmt(-2_000_000_000)).toBe('-$2.00B');
  });

  it('handles boundary between K and M', () => {
    // 999_999 is still K range
    expect(fmt(999_999).endsWith('K')).toBe(true);
    // 1_000_000 flips to M
    expect(fmt(1_000_000).endsWith('M')).toBe(true);
  });

  it('rounds $1,500 to $2K (midpoint rounds up)', () => {
    expect(fmt(1_500)).toBe('$2K');
  });
});
