// 2024 US federal income tax brackets (single filer)
const BRACKETS_2024 = [
  { rate: 0.10, upTo: 11_600 },
  { rate: 0.12, upTo: 47_150 },
  { rate: 0.22, upTo: 100_525 },
  { rate: 0.24, upTo: 191_950 },
  { rate: 0.32, upTo: 243_725 },
  { rate: 0.35, upTo: 609_350 },
  { rate: 0.37, upTo: Infinity },
];

export function computeFederalTax(income) {
  if (income <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { rate, upTo } of BRACKETS_2024) {
    const chunk = Math.min(income, upTo) - prev;
    if (chunk <= 0) break;
    tax += chunk * rate;
    prev = upTo;
  }
  return tax;
}

export function marginalRate(income) {
  if (income <= 0) return 0;
  for (const { rate, upTo } of BRACKETS_2024) {
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
