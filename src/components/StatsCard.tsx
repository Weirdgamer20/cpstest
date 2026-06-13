import React from 'react';

interface StatsCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorScheme?: 'green' | 'blue' | 'purple' | 'amber';
}

export default function StatsCard({
  id,
  title,
  value,
  subtitle,
  icon,
  colorScheme = 'green'
}: StatsCardProps) {
  
  const borderColors = {
    green: 'border-emerald-500/30 hover:border-emerald-500/60',
    blue: 'border-cyan-500/30 hover:border-cyan-500/60',
    purple: 'border-purple-500/30 hover:border-purple-500/60',
    amber: 'border-amber-500/30 hover:border-amber-500/60'
  };

  const textColors = {
    green: 'text-emerald-400',
    blue: 'text-cyan-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400'
  };

  const bgGlows = {
    green: 'group-hover:bg-emerald-500/5',
    blue: 'group-hover:bg-cyan-500/5',
    purple: 'group-hover:bg-purple-500/5',
    amber: 'group-hover:bg-amber-500/5'
  };

  return (
    <div
      id={id}
      className={`group bg-[#0e1324] border ${borderColors[colorScheme]} rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${bgGlows[colorScheme]} hover:scale-[1.02] hover:shadow-xl shadow-black/40`}
    >
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-extrabold font-mono tracking-tight ${textColors[colorScheme]}`}>
            {value}
          </p>
          {subtitle && (
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {icon && (
        <div className={`p-3.5 rounded-xl bg-[#151c33] ${textColors[colorScheme]} shadow-inner group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      )}
    </div>
  );
}
