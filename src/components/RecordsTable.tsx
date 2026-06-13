import React, { useState } from 'react';
import { ClickRecord } from '../types';
import { Trash2, History, ChevronDown, ChevronUp, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface RecordsTableProps {
  records: ClickRecord[];
  onClearHistory: () => void;
  onMockImport?: () => void;
}

export default function RecordsTable({ records, onClearHistory, onMockImport }: RecordsTableProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'cps' | 'jitter' | 'kohi' | 'spacebar'>('all');

  const filtered = records.filter(r => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  return (
    <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 space-y-4">
      {/* Header section with toggle and clear */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-bold text-white tracking-wider uppercase text-sm hover:text-emerald-400 transition-colors text-left"
        >
          <History size={16} className="text-emerald-400" />
          <span>Previous Records ({filtered.length})</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {records.length > 0 && isExpanded && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
            title="Clear persistent local storage records"
          >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'cps', 'jitter', 'kohi', 'spacebar'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-extrabold ${
                  filterType === type
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#151c33] text-slate-400 border border-transparent hover:bg-[#1a2340]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Table display */}
          {filtered.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl space-y-2">
              <FileSpreadsheet size={32} className="mx-auto text-slate-600" />
              <p className="text-slate-400 text-xs font-medium">No speed records stored for this filter category.</p>
              <p className="text-slate-500 text-[10px]">Complete a speedtest above to save your first record!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1e294b] text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Interval</th>
                    <th className="py-2.5 px-3 text-right">Clicks</th>
                    <th className="py-2.5 px-3 text-right text-emerald-400">CPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {filtered.slice(0, 15).map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#151c33]/30 transition-colors">
                      <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                          rec.type === 'kohi' ? 'bg-amber-500/10 text-amber-400' :
                          rec.type === 'jitter' ? 'bg-orange-500/10 text-orange-400' :
                          rec.type === 'spacebar' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {rec.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                        {rec.duration}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-200">
                        {rec.clicks}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-400">
                        {rec.cps.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 15 && (
                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-500">Showing 15 latest records</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
