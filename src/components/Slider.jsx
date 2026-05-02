import React from 'react';

export default function Slider({ label, value, onChange, min, max, step, format, sublabel, disabled }) {
  return (
    <div className={`space-y-1.5 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 disabled:cursor-not-allowed"
      />
      {sublabel && <p className="text-[10px] text-slate-500 leading-tight">{sublabel}</p>}
    </div>
  );
}
