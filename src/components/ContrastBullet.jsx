import React from 'react';

const CONFIG = {
  emerald: { symbol: '✓', color: 'text-emerald-400' },
  red:     { symbol: '✗', color: 'text-red-400' },
  amber:   { symbol: '~',      color: 'text-amber-400' },
};

export default function ContrastBullet({ tone = 'emerald', children }) {
  const { symbol, color } = CONFIG[tone];
  return (
    <li className="flex gap-2.5 items-start text-sm leading-relaxed">
      <span className={`${color} font-bold flex-shrink-0 mt-0.5`}>{symbol}</span>
      <span className="text-slate-300">{children}</span>
    </li>
  );
}
