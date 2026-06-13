import React, { useState } from 'react';
import { Trophy, ShieldAlert, CheckCircle, Search, Star, Calendar } from 'lucide-react';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  country: string;
  score: number;
  suffix: string;
  date: string;
  isVerified: boolean;
}

export const SEEDED_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  "CPS Test": [
    { id: 'l1', rank: 1, username: 'FrictionGod', avatar: '🦅', country: 'US', score: 18.2, suffix: 'CPS', date: 'Today', isVerified: true },
    { id: 'l2', rank: 2, username: 'ViperClickz', avatar: '🐍', country: 'DE', score: 15.5, suffix: 'CPS', date: 'Today', isVerified: true },
    { id: 'l3', rank: 3, username: 'Bridger_X', avatar: '🐹', country: 'CA', score: 14.1, suffix: 'CPS', date: 'Today', isVerified: true },
    { id: 'l4', rank: 4, username: 'KohiWarrior', avatar: '⚔️', country: 'PL', score: 12.8, suffix: 'CPS', date: 'Today', isVerified: true },
    { id: 'l5', rank: 5, username: 'ClawMaster', avatar: '🐱', country: 'GB', score: 11.9, suffix: 'CPS', date: 'Today', isVerified: false }
  ],
  "Reflex Test": [
    { id: 'r1', rank: 1, username: 'SonicNerve', avatar: '🧠', country: 'JP', score: 135, suffix: 'ms', date: 'Today', isVerified: true },
    { id: 'r2', rank: 2, username: 'FlickPro', avatar: '🎯', country: 'US', score: 148, suffix: 'ms', date: 'Today', isVerified: true },
    { id: 'r3', rank: 3, username: 'NeuroTwitch', avatar: '⚡', country: 'KR', score: 155, suffix: 'ms', date: 'Today', isVerified: true },
    { id: 'r4', rank: 4, username: 'Starlight', avatar: '🌟', country: 'FR', score: 172, suffix: 'ms', date: 'Today', isVerified: false }
  ],
  "Thumb Blitz Rush": [
    { id: 'b1', rank: 1, username: 'BlitzAce', avatar: '🦁', country: 'AU', score: 2840, suffix: 'pts', date: 'Today', isVerified: true },
    { id: 'b2', rank: 2, username: 'ThumbNinja', avatar: '🥷', country: 'SG', score: 2350, suffix: 'pts', date: 'Today', isVerified: true },
    { id: 'b3', rank: 3, username: 'MobileGamer_99', avatar: '👾', country: 'BR', score: 1950, suffix: 'pts', date: 'Today', isVerified: false }
  ],
  "Typing Speed": [
    { id: 't1', rank: 1, username: 'KeySmasher', avatar: '⌨️', country: 'US', score: 142, suffix: 'WPM', date: 'Today', isVerified: true },
    { id: 't2', rank: 2, username: 'WordWeaver', avatar: '🧙', country: 'NZ', score: 125, suffix: 'WPM', date: 'Today', isVerified: true },
    { id: 't3', rank: 3, username: 'TypeRacer', avatar: '🏎️', country: 'SE', score: 112, suffix: 'WPM', date: 'Today', isVerified: false }
  ]
};

export default function DynamicLeaderboards({ localUserScore, activeGameCategory }: { localUserScore?: number, activeGameCategory: string }) {
  const [activeCategory, setActiveCategory] = useState<'CPS Test' | 'Reflex Test' | 'Thumb Blitz Rush' | 'Typing Speed'>('CPS Test');
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'All-Time'>('Daily');
  const [searchQuery, setSearchQuery] = useState('');

  const entries = SEEDED_LEADERBOARDS[activeCategory] || [];

  // Robust Anti-Cheat detector engine
  const runAntiCheatCheck = (score: number, category: string): { status: 'passed' | 'warning' | 'flagged', reason: string } => {
    if (category === 'CPS Test') {
      if (score > 25) return { status: 'flagged', reason: 'Abnormal click interval detected. Suspicious macro manipulation pattern!' };
      if (score > 18) return { status: 'warning', reason: 'Extraordinary click throughput. Pending physical device review.' };
    }
    if (category === 'Reflex Test') {
      if (score < 60) return { status: 'flagged', reason: 'Zero-latency response detected. Automatic human nerve delay bypass error!' };
      if (score < 110) return { status: 'warning', reason: 'Exceptional reflex speed. Exceeds 99.9% of verified gaming limits.' };
    }
    return { status: 'passed', reason: 'Performance matches genuine human biomechanical coordinate constraints.' };
  };

  const filteredEntries = entries.filter(e => e.username.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render details
  return (
    <div className="p-6 bg-[#090d19] border border-[#1e294b] rounded-3xl space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-850">
        <div>
          <h2 className="text-base font-extrabold text-white uppercase flex items-center gap-2">
            <Trophy size={18} className="text-amber-450 animate-bounce" />
            Chronos Competitive Esports Leaderboard
          </h2>
          <p className="text-xs text-slate-400">Anti-cheat engine actively checks speeds and mechanical postures for verifiability</p>
        </div>

        {/* Search capability */}
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search competitor nickname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Nav Options Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Toggles */}
        <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-850/60">
          {(["CPS Test", "Reflex Test", "Thumb Blitz Rush", "Typing Speed"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider ${
                activeCategory === cat ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeframe Toggles */}
        <div className="flex gap-1.5 bg-[#0d1222] p-1 rounded-xl border border-slate-850">
          {(['Daily', 'Weekly', 'Monthly', 'All-Time'] as const).map(time => (
            <button
              key={time}
              onClick={() => setTimeframe(time)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                timeframe === time ? 'bg-[#151c33] text-white border border-slate-800' : 'text-slate-500 hover:text-slate-350'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Competitors List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredEntries.map((player, index) => {
          const check = runAntiCheatCheck(player.score, activeCategory);
          return (
            <div 
              key={player.id} 
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                index === 0 ? 'bg-amber-500/10 border-amber-500/20' : 
                index === 1 ? 'bg-slate-300/5 border-slate-300/10' : 
                index === 2 ? 'bg-amber-700/5 border-amber-700/10' :
                'bg-slate-950/50 border-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Seed placement */}
                <span className={`w-5 text-center font-mono font-black ${
                  index === 0 ? 'text-amber-400' : 
                  index === 1 ? 'text-slate-300' : 
                  index === 2 ? 'text-amber-700' : 
                  'text-slate-500'
                }`}>
                  #{player.rank}
                </span>

                {/* Avatar & Username */}
                <span className="text-lg select-none">{player.avatar}</span>
                <div>
                  <span className="font-extrabold text-slate-200 block uppercase tracking-wide">
                    {player.username}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                    Region: {player.country} • {player.date}
                  </span>
                </div>
              </div>

              {/* Verified score status badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-mono font-black text-emerald-450 block">
                    {player.score} <span className="text-[10px] text-slate-550">{player.suffix}</span>
                  </span>
                </div>

                {/* Validation badge */}
                {check.status === 'flagged' ? (
                  <div className="p-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30" title={check.reason}>
                    <ShieldAlert size={12} />
                  </div>
                ) : player.isVerified ? (
                  <div className="p-1 rounded bg-emerald-500/10 text-emerald-405 border border-emerald-500/30 font-semibold text-[9px] uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
                  </div>
                ) : (
                  <div className="p-1 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[9px] uppercase tracking-normal">
                    Pending
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
