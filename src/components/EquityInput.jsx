import React from 'react';

const LEVERAGE_PRESETS = [
  { pct: 10,  label: 'reputation', desc: 'You lend your name and reputation; partners bring capital and execute' },
  { pct: 25,  label: 'knowledge',  desc: 'You structure the deal; partners bring capital and execute' },
  { pct: 50,  label: 'capital',    desc: 'You co-invest meaningfully for bigger upside' },
  { pct: 100, label: 'solo',       desc: 'Full ownership — you do everything yourself' },
];

export default function EquityInput({ value, onChange }) {
  const matched = LEVERAGE_PRESETS.find((p) => p.pct === value);
  const desc = matched
    ? `Use this for ${matched.label} leverage — ${matched.desc}`
    : 'Custom equity position · No capital required at Y0';

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">% Deal Controlled</label>
        <span className="text-sm font-bold text-emerald-400 tabular-nums">{value}%</span>
      </div>
      <div className="grid grid-cols-4 gap-1 mb-1.5">
        {LEVERAGE_PRESETS.map(({ pct, label }) => (
          <button
            key={pct}
            onClick={() => onChange(pct)}
            className={`px-1 py-1.5 rounded-lg transition-colors ${
              value === pct
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="text-xs font-bold leading-none">{pct}%</div>
            <div className={`text-[9px] mt-1 leading-none font-medium ${
              value === pct ? 'text-slate-800' : 'text-slate-500'
            }`}>{label}</div>
          </button>
        ))}
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={5}
        max={100}
        step={5}
        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
      {/* Fixed height prevents sidebar from resizing when description text changes length */}
      <p className="text-[10px] text-slate-500 leading-tight min-h-[2.5rem]">{desc}</p>
    </div>
  );
}
