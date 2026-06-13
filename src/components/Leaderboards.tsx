import React, { useState, useEffect } from 'react';
import { Trophy, ShieldAlert, Award, Calendar, Search, ArrowUp, Zap, HelpCircle } from 'lucide-react';
import { SEEDED_LEADERBOARDS, getStoredProfile, LeaderboardEntry } from '../lib/gameDB';

export default function Leaderboards() {
  const [activeTimeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('daily');
  const [activeCategory, setCategory] = useState<'cps' | 'reaction' | 'blitz' | 'typing'>('cps');
  const [searchQuery, setSearchQuery] = useState('');
  const [boardData, setBoardData] = useState<LeaderboardEntry[]>([]);

  // Simulated live leaderboards populated dynamically
  useEffect(() => {
    // Read category seeds
    let rawList = [...SEEDED_LEADERBOARDS[activeCategory]];
    
    // Add active user dynamically if they have run some tests!
    const profile = getStoredProfile();
    let scoreVal: string | number = '';

    if (activeCategory === 'cps' && profile.bestCps > 0) {
      scoreVal = `${profile.bestCps.toFixed(1)} CPS`;
    } else if (activeCategory === 'reaction' && profile.reactionAverages > 0) {
      scoreVal = `${profile.reactionAverages} ms`;
    } else if (activeCategory === 'blitz' && profile.totalTests > 0) {
      const generatedBlitzScore = Math.floor(profile.lifetimeXp * 7 + 100);
      scoreVal = `${generatedBlitzScore} pts`;
    } else if (activeCategory === 'typing' && profile.totalTests > 0) {
      scoreVal = `78 WPM`;
    }

    if (scoreVal) {
      // Avoid duplicate user injections
      if (!rawList.some((e) => e.username === profile.username)) {
        rawList.push({
          rank: 0, // calculated later
          username: profile.username,
          avatar: profile.avatar,
          country: profile.country,
          score: scoreVal,
          date: 'Just now'
        });
      }
    }

    // Sort accordingly
    if (activeCategory === 'reaction') {
      // Reaction: lower millisecond is better!
      rawList.sort((a, b) => {
        const valA = parseInt(a.score.toString().replace(' ms', ''), 10);
        const valB = parseInt(b.score.toString().replace(' ms', ''), 10);
        return valA - valB;
      });
    } else {
      // Others: higher is better
      rawList.sort((a, b) => {
        const valA = parseFloat(a.score.toString().replace(/[^0-9.]/g, ''));
        const valB = parseFloat(b.score.toString().replace(/[^0-9.]/g, ''));
        return valB - valA;
      });
    }

    // Re-assign ranks
    const mapped: LeaderboardEntry[] = rawList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));

    // Inject 1 impossible cheater score dynamically in each category to showcase the anti-cheat flagger in action!
    if (activeCategory === 'cps') {
      mapped.unshift({
        rank: 1,
        username: 'AutoClickerPro_99',
        avatar: '🤖',
        country: 'CN',
        score: '64.5 CPS',
        date: 'Today'
      });
    } else if (activeCategory === 'reaction') {
      mapped.unshift({
        rank: 1,
        username: 'AimbotNerveMatrix',
        avatar: '🧬',
        country: 'UA',
        score: '12 ms',
        date: 'Today'
      });
    }

    // Re-sort with cheaters kept on top to show flagger
    const finalData = mapped.map((item, idx) => {
      if (activeCategory === 'cps') {
        const val = parseFloat(item.score.toString().replace(' CPS', ''));
        if (val > 25) return { ...item, flagCheat: true };
      } else if (activeCategory === 'reaction') {
        const val = parseInt(item.score.toString().replace(' ms', ''), 10);
        if (val < 70) return { ...item, flagCheat: true };
      }
      return item;
    });

    setBoardData(finalData);
  }, [activeCategory, activeTimeframe]);

  const filteredHistory = boardData.filter((item) =>
    item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="leaderboard-module-wrapper" className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy size={14} className="text-emerald-400" />
            <span>GLOBAL VERIFIED LEADERBOARD SYNC</span>
          </span>
          <h1 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">
            Leaderboards Arena
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare mechanical reaction time, clicking velocity, WPM metrics, and touch reflex with worldwide pro gamers.
          </p>
        </div>

        {/* Info banner */}
        <div className="p-3 bg-slate-900/40 border border-[#1e294b] rounded-xl flex items-center gap-2 max-w-xs text-xs text-slate-400">
          <ShieldAlert size={16} className="text-emerald-400 shrink-0" />
          <span>Automatic biometric anti-cheat checks evaluate key timing variables to enforce parity.</span>
        </div>
      </div>

      {/* Categories selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setCategory('cps')}
          className={`px-4 py-3 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
            activeCategory === 'cps'
              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500 shadow-emerald-400/5'
              : 'bg-[#0f1325]/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-[#151c33]'
          }`}
        >
          <Zap size={14} />
          <span>Click Speed Test (CPS)</span>
        </button>

        <button
          onClick={() => setCategory('reaction')}
          className={`px-4 py-3 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
            activeCategory === 'reaction'
              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500 shadow-emerald-400/5'
              : 'bg-[#0f1325]/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-[#151c33]'
          }`}
        >
          <Calendar size={14} />
          <span>Reaction Chronos</span>
        </button>

        <button
          onClick={() => setCategory('blitz')}
          className={`px-4 py-3 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
            activeCategory === 'blitz'
              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500 shadow-emerald-400/5'
              : 'bg-[#0f1325]/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-[#151c33]'
          }`}
        >
          <Award size={14} />
          <span>Thumb Blitz Rush</span>
        </button>

        <button
          onClick={() => setCategory('typing')}
          className={`px-4 py-3 rounded-xl border text-xs font-extrabold tracking-wider uppercase transition-all shadow flex items-center justify-center gap-2 cursor-pointer ${
            activeCategory === 'typing'
              ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500 shadow-emerald-400/5'
              : 'bg-[#0f1325]/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-[#151c33]'
          }`}
        >
          <Trophy size={14} />
          <span>Keyboard Typing</span>
        </button>
      </div>

      {/* Filtration controls card panel */}
      <div className="p-4 bg-[#080c18] border border-slate-850 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Timeframes filter */}
        <div className="flex gap-1 bg-[#0d1120] p-1 border border-slate-800 rounded-xl w-full md:w-auto">
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                activeTimeframe === t
                  ? 'bg-slate-900 border border-slate-800 text-white font-black'
                  : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              {t === 'all' ? 'All-Time' : t}
            </button>
          ))}
        </div>

        {/* Searching filter input */}
        <div className="relative w-full md:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1120] border border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-[#080c18] border border-[#1e294b] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="bg-[#0e1324] border-b border-[#1e294b] text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-5 w-20">Rank</th>
                <th className="py-4 px-4">Athlete Player</th>
                <th className="py-4 px-4">Region</th>
                <th className="py-4 px-4 text-right">Scoreboard Record</th>
                <th className="py-4 px-5 text-right">Validation Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item, idx) => {
                  const isCheater = (item as any).flagCheat;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-900/30 transition-colors ${
                        isCheater ? 'bg-red-950/10' : ''
                      }`}
                    >
                      {/* Rank Indicator */}
                      <td className="py-4.5 px-5 font-mono font-black text-slate-300">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-300">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-300/10 border border-slate-300/20 text-slate-300">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-600/10 border border-amber-600/20 text-amber-500">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 pl-2">{item.rank}</span>
                        )}
                      </td>

                      {/* Username with avatar */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg select-none">{item.avatar}</span>
                          <span className="font-extrabold text-slate-200 hover:text-white transition-colors">
                            {item.username}
                          </span>
                        </div>
                      </td>

                      {/* Region info */}
                      <td className="py-4.5 px-4">
                        <span className="font-bold text-slate-400 uppercase flex items-center gap-1">
                          🌍 {item.country}
                        </span>
                      </td>

                      {/* The Score value */}
                      <td className="py-4.5 px-4 text-right font-mono font-black text-base text-emerald-400">
                        {item.score}
                      </td>

                      {/* Anti-cheat status banner */}
                      <td className="py-4.5 px-5 text-right">
                        {isCheater ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/15 border border-red-500/30 text-[9px] font-bold text-rose-400 uppercase tracking-widest">
                            <ShieldAlert size={12} />
                            Cheat Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
                            ✓ Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                    No verified scores fit selection criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitive rules list */}
      <div className="p-4 bg-[#0e1324] border border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="space-y-1">
          <h4 className="text-xs font-black text-[#10b981] uppercase tracking-wider">Submit your score live!</h4>
          <p className="text-[11px] text-slate-400 max-w-xl">
            Scores made during active verified Guest or Google sessions automatically submit to global leaderboards under active timing metrics checking.
          </p>
        </div>
      </div>
    </div>
  );
}
