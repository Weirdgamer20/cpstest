import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Achievement, ClickRecord } from '../types';

export default function CPSChallenges() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'Sloth Survivor', description: 'Reach 4 CPS in any speed test mode.', targetCps: 4, duration: 'Any', unlocked: false, badgeEmoji: '🦥' },
    { id: '2', title: 'Casual Competitor', description: 'Reach 6.5 CPS in standard Click Speed Test.', targetCps: 6.5, duration: 'Any', unlocked: false, badgeEmoji: '🐢' },
    { id: '3', title: 'Jitter Elite', description: 'Reach 8 CPS in Jitter Click Test.', targetCps: 8, duration: 'Any', unlocked: false, badgeEmoji: '🐆' },
    { id: '4', title: 'Kohi Warrior', description: 'Reach 10 CPS in Kohi Click Test.', targetCps: 10, duration: 'Any', unlocked: false, badgeEmoji: '⚔️' },
    { id: '5', title: 'Thunder Bolt', description: 'Reach 12 CPS to exceed maximum standard human benchmarks.', targetCps: 12, duration: 'Any', unlocked: false, badgeEmoji: '⚡' },
    { id: '6', title: 'Silicon Overlord', description: 'Reach 15 CPS. Truly robotic performance.', targetCps: 15, duration: 'Any', unlocked: false, badgeEmoji: '🤖' },
  ]);

  useEffect(() => {
    try {
      const records: ClickRecord[] = JSON.parse(localStorage.getItem('cps_records') || '[]');
      if (records.length === 0) return;

      // Extract top CPS scores per test type
      const maxCpsAny = Math.max(...records.map(r => r.cps), 0);
      const maxCpsJitter = Math.max(...records.filter(r => r.type === 'jitter').map(r => r.cps), 0);
      const maxCpsKohi = Math.max(...records.filter(r => r.type === 'kohi').map(r => r.cps), 0);
      const maxCpsStandard = Math.max(...records.filter(r => r.type === 'cps').map(r => r.cps), 0);

      const updated = achievements.map(ach => {
        let isUnlocked = false;
        if (ach.id === '1') isUnlocked = maxCpsAny >= ach.targetCps;
        else if (ach.id === '2') isUnlocked = maxCpsStandard >= ach.targetCps;
        else if (ach.id === '3') isUnlocked = maxCpsJitter >= ach.targetCps;
        else if (ach.id === '4') isUnlocked = maxCpsKohi >= ach.targetCps;
        else if (ach.id === '5') isUnlocked = maxCpsAny >= ach.targetCps;
        else if (ach.id === '6') isUnlocked = maxCpsAny >= ach.targetCps;

        return { ...ach, unlocked: isUnlocked };
      });

      setAchievements(updated);
    } catch (e) {
      // safe fallback
    }
  }, []);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* HUD Ribbon */}
      <div className="bg-gradient-to-r from-[#17253f] to-[#12182c] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1.5 text-center md:text-left">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles size={14} className="animate-pulse" /> Gold Crest Achievements
          </p>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">CPS TROPHY ROOM</h2>
          <p className="text-xs text-slate-400">Complete tasks on active speedtests to stamp rare electronic medals. They are permanently stored in local memory.</p>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-mono font-extrabold text-yellow-400">{totalUnlocked} / {achievements.length}</span>
          </div>
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-44 ${
              ach.unlocked
                ? 'bg-[#10b981]/5 border-emerald-500/30'
                : 'bg-[#0e1324] border-slate-850 opacity-70'
            }`}
          >
            {/* Stamp decoration */}
            {ach.unlocked && (
              <div className="absolute top-3 right-3 text-emerald-400 animate-fadeIn bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={16} />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none filter drop-shadow">{ach.badgeEmoji}</span>
                <div>
                  <h3 className="font-extrabold text-white text-sm">{ach.title}</h3>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">
                    Target: {ach.targetCps} CPS
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-normal">{ach.description}</p>
            </div>

            <div className="border-t border-[#1e294b] pt-3 flex items-center justify-between mt-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${ach.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                {ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </span>
              <Award size={16} className={ach.unlocked ? 'text-yellow-400' : 'text-slate-650'} />
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
        <ShieldAlert size={12} className="text-slate-500 shrink-0 mt-0.5" />
        <p>Complete any Click Speed test or Kohi/Jitter challenges on the dashboard to register qualifying records and trigger claim badges instantly!</p>
      </div>
    </div>
  );
}
