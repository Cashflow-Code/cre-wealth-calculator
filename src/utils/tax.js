// 2026 US federal income tax brackets (single filer, TCJA extended + inflation adj.)
const BRACKETS_2026 = [
  { rate: 0.10, upTo: 12_200 },
  { rate: 0.12, upTo: 49_750 },
  { rate: 0.22, upTo: 106_150 },
  { rate: 0.24, upTo: 202_800 },
  { rate: 0.32, upTo: 257_400 },
  { rate: 0.35, upTo: 643_700 },
  { rate: 0.37, upTo: Infinity },
];

export function computeFederalTax(income) {
  if (income <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { rate, upTo } of BRACKETS_2026) {
    const chunk = Math.min(income, upTo) - prev;
    if (chunk <= 0) break;
    tax += chunk * rate;
    prev = upTo;
  }
  return tax;
}

export function marginalRate(income) {
  if (income <= 0) return 0;
  for (const { rate, upTo } of BRACKETS_2026) {
    if (income <= upTo) return rate;
  }
  return 0.37;
}

export function effectiveRate(income) {
  return income > 0 ? computeFederalTax(income) / income : 0;
}

// Federal + flat state tax on a given income
export function computeTotalTax(income, stateRateDecimal = 0) {
  const safe = Math.max(0, income);
  return computeFederalTax(safe) + safe * stateRateDecimal;
}

// Exact tax saved by a deduction, accounting for bracket cliffs
export function taxSavingsFromDeduction(income, deduction, stateRateDecimal = 0) {
  if (deduction <= 0) return 0;
  return (
    computeTotalTax(income, stateRateDecimal) -
    computeTotalTax(Math.max(0, income - deduction), stateRateDecimal)
  );
}
