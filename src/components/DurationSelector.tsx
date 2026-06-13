import React, { useState } from 'react';
import { Hourglass, Settings } from 'lucide-react';

interface DurationSelectorProps {
  currentDuration: string; // e.g. "1s", "5s", etc. or "Manual"
  manualSeconds: number; // custom amount of seconds
  onSelectDuration: (duration: string) => void;
  onSelectManualSeconds: (seconds: number) => void;
}

export default function DurationSelector({
  currentDuration,
  manualSeconds,
  onSelectDuration,
  onSelectManualSeconds
}: DurationSelectorProps) {
  
  const options = ['1s', '2s', '5s', '10s', '15s', '30s', '60s', '100s', 'Manual'];
  const [sliderVal, setSliderVal] = useState(manualSeconds);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderVal(val);
    onSelectManualSeconds(val);
  };

  return (
    <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <Hourglass size={16} className="text-emerald-400" />
          Select Duration
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded uppercase">
          {currentDuration === 'Manual' ? `${manualSeconds}s` : currentDuration} Active
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => {
          const isActive = currentDuration === opt;
          return (
            <button
              id={`duration-btn-${opt}`}
              key={opt}
              onClick={() => onSelectDuration(opt)}
              className={`py-2 px-1 text-xs font-bold font-mono rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10 scale-[1.03]'
                  : 'bg-[#151c33] text-slate-300 border-slate-800/40 hover:border-slate-700 hover:text-white'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {currentDuration === 'Manual' && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Settings size={13} className="text-emerald-400" /> Custom Duration:
            </span>
            <span className="font-mono text-emerald-400">{sliderVal} seconds</span>
          </div>
          <input
            id="manual-duration-slider"
            type="range"
            min="1"
            max="300"
            value={sliderVal}
            onChange={handleSliderChange}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>1s</span>
            <span>150s</span>
            <span>300s</span>
          </div>
        </div>
      )}
    </div>
  );
}
