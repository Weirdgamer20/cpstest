import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, RotateCcw, Flame, Trophy, Award, Sparkles, CheckCircle, Crosshair, Star, Share2 } from 'lucide-react';

interface GameScore {
  name: string;
  score: number;
  mode: string;
}

// PROFILE STATE TYPE definition
export interface ProfileState {
  username: string;
  avatar: string;
  provider: 'Guest' | 'Google' | 'Discord';
  country: string;
  streak: number;
  xp: number;
  totalTests: number;
  bestCps: number;
  avgCps: number;
  reactionAvg: number;
}

// 50+ Achievements list
export interface AchievementCard {
  id: string;
  title: string;
  description: string;
  tag: 'CPS' | 'Reflex' | 'Mobile' | 'Keyboard' | 'General';
  xpReward: number;
  condition: string;
  icon: string;
}

export const ACHIEVEMENTS_POOL: AchievementCard[] = [
  { id: '1', title: 'First Touch', description: 'Complete your first clicking speedtest benchmark.', tag: 'General', xpReward: 50, condition: 'Any test run', icon: '🎮' },
  { id: '2', title: 'CPS Apprentice', description: 'Reach a click rate of 5 Clicks Per Second (CPS).', tag: 'CPS', xpReward: 100, condition: '5 CPS', icon: '⚡' },
  { id: '3', title: 'Speed Warrior', description: 'Reach a click rate of 8 Clicks Per Second (CPS).', tag: 'CPS', xpReward: 150, condition: '8 CPS', icon: '⚔️' },
  { id: '4', title: 'Chronos Pro', description: 'Surpass 11 Clicks Per Second (CPS) on Chronos Arena.', tag: 'CPS', xpReward: 300, condition: '11 CPS', icon: '🏆' },
  { id: '5', title: 'Esports Elite', description: 'Unlock the legendary 14+ Clicks Per Second (CPS) rank.', tag: 'CPS', xpReward: 500, condition: '14 CPS', icon: '🔥' },
  { id: '6', title: 'God Finger', description: 'Attain an impossible 18+ clicks per second.', tag: 'CPS', xpReward: 1000, condition: '18 CPS', icon: '👑' },
  { id: '7', title: 'Jitter Apprentice', description: 'Log a valid score in Jitter mode.', tag: 'CPS', xpReward: 80, condition: 'Jitter Test', icon: '🪐' },
  { id: '8', title: 'Jitter Demon', description: 'Record over 10 CPS using high-tension wrist jittering.', tag: 'CPS', xpReward: 250, condition: '10 CPS Jitter', icon: '👁️' },
  { id: '9', title: 'Butterfly Champion', description: 'Achieve 15 CPS using double-finger alternating style.', tag: 'CPS', xpReward: 350, condition: '15 CPS Butterfly', icon: '🦋' },
  { id: '10', title: 'Minecraft Bridger', description: 'Excel in Kohi mode by achieving continuous 10+ CPS.', tag: 'CPS', xpReward: 300, condition: '10 CPS Kohi', icon: '📦' },
  { id: '11', title: 'Reaction Rookie', description: 'Complete your first neural reaction benchmark.', tag: 'Reflex', xpReward: 60, condition: 'Reflex run', icon: '⏱️' },
  { id: '12', title: 'Reflex Specialist', description: 'React to visual color change prompts in under 250ms.', tag: 'Reflex', xpReward: 150, condition: '< 250ms', icon: '🎯' },
  { id: '13', title: 'Flick Hero', description: 'Score under 200ms visual reaction speed.', tag: 'Reflex', xpReward: 300, condition: '< 200ms', icon: '⚡' },
  { id: '14', title: 'Reaction God', description: 'Attain the sub-150ms legendary reflex master rank.', tag: 'Reflex', xpReward: 600, condition: '< 150ms', icon: '💫' },
  { id: '15', title: 'Sound Wave', description: 'Succeed on an auditory benchmark under 160ms.', tag: 'Reflex', xpReward: 200, condition: '< 160ms Audio', icon: '🔊' },
  { id: '16', title: 'Sonic Speed', description: 'Unravel sonic reaction timings under 130ms.', tag: 'Reflex', xpReward: 400, condition: '< 130ms Audio', icon: '🚀' },
  { id: '17', title: 'Spacebar Initiate', description: 'Log your first click on the spacebar counter.', tag: 'Keyboard', xpReward: 50, condition: 'Spacebar run', icon: '⌨️' },
  { id: '18', title: 'Spacebar Gladiator', description: 'Maintain 7 CPS on the physical keyboard spacebar.', tag: 'Keyboard', xpReward: 150, condition: '7 CPS Spacebar', icon: '🔨' },
  { id: '19', title: 'Spacebar Champion', description: 'Achieve an outstanding 10 CPS key tap frequency.', tag: 'Keyboard', xpReward: 350, condition: '10 CPS Spacebar', icon: '🥇' },
  { id: '20', title: 'Typing Rookie', description: 'Register a WPM speed of 40 on typing accuracy test.', tag: 'Keyboard', xpReward: 80, condition: '40 WPM', icon: '✏️' },
  { id: '21', title: 'Keyboard Demon', description: 'Exceed 80 WPM typing speed with 95% accuracy.', tag: 'Keyboard', xpReward: 300, condition: '80 WPM', icon: '💀' },
  { id: '22', title: 'Chronos Typist', description: 'Log a blistering 120+ words per minute.', tag: 'Keyboard', xpReward: 600, condition: '120 WPM', icon: '🛸' },
  { id: '23', title: 'Rapid Thumb', description: 'Hit 20 consecutive targets in Thumb Blitz Rush.', tag: 'Mobile', xpReward: 200, condition: '20 Combo Blitz', icon: '👍' },
  { id: '24', title: 'Mobile Elite', description: 'Register over 1,500 points on Thumb Blitz Rush.', tag: 'Mobile', xpReward: 300, condition: '1500 Blitz Points', icon: '📱' },
  { id: '25', title: 'Combo King', description: 'Gain x5 combo multiplier in mobile target modes.', tag: 'Mobile', xpReward: 250, condition: 'x5 Combo', icon: '👑' },
  { id: '26', title: '1,000 Point Club', description: 'Surpass 1,000 points on Thumb Blitz Rush.', tag: 'Mobile', xpReward: 150, condition: '1000 pts', icon: '🛡️' },
  { id: '27', title: 'Mega Target User', description: 'Claim a Double Score power-up on mobile games.', tag: 'Mobile', xpReward: 100, condition: 'Power-up claim', icon: '🌟' },
  { id: '28', title: 'Time Freeze Master', description: 'Deploy Freeze Time to secure an active score.', tag: 'Mobile', xpReward: 120, condition: 'Deploy Freeze', icon: '❄️' },
  { id: '29', title: 'Accuracy Vanguard', description: 'Sustain 100% typing accuracy on any standard block.', tag: 'Keyboard', xpReward: 250, condition: '100% Accuracy', icon: '🎯' },
  { id: '30', title: 'Baker of legends', description: 'Surpass 5,000 Score in Dessert 2048.', tag: 'General', xpReward: 150, condition: '5k 2048 Score', icon: '🧁' },
  { id: '31', title: 'Chocolatier Master', description: 'Form a Velvet Fudge tile in under 5 minutes.', tag: 'General', xpReward: 300, condition: 'Fudge merge', icon: '🍫' },
  { id: '32', title: 'Pin Specialist', description: 'Complete Level 10 of Coreball concentric shooter.', tag: 'General', xpReward: 150, condition: 'Coreball Lvl 10', icon: '🎳' },
  { id: '33', title: 'Pin Master', description: 'Surpass Level 30 on planetary orbit pins.', tag: 'General', xpReward: 400, condition: 'Coreball Lvl 30', icon: '🔮' },
  { id: '34', title: 'Streak Starter', description: 'Log active performance speedtests 2 days in a row.', tag: 'General', xpReward: 100, condition: '2 Day Streak', icon: '🔥' },
  { id: '35', title: 'Weekly Warrior', description: 'Sustain your daily streak training cycles for 7 days.', tag: 'General', xpReward: 300, condition: '7 Day Streak', icon: '📆' },
  { id: '36', title: 'Aim Scholar', description: 'Score over 80% accuracy on standard Aim Trainer.', tag: 'Reflex', xpReward: 180, condition: '80% Accuracy Aim', icon: '🎯' },
  { id: '37', title: 'Trigger Master', description: 'Complete 30 hits in under 30 seconds inside Aim Arena.', tag: 'Reflex', xpReward: 250, condition: '30 Aim hits', icon: '🔫' },
  { id: '38', title: 'Aura Weaver', description: 'Unlock all 5 custom items in target coordination tests.', tag: 'Reflex', xpReward: 220, condition: 'Coordination sweep', icon: '🌀' },
  { id: '39', title: 'Ad Click Fan', description: 'Support esports arenas by viewing dynamic guidelines.', tag: 'General', xpReward: 50, condition: 'Learn optimization', icon: '📢' },
  { id: '40', title: 'XP Collector', description: 'Amass over 1,000 total Lifetime Experience Points (XP).', tag: 'General', xpReward: 200, condition: '1000 Total XP', icon: '💎' },
  { id: '41', title: 'Challenger Rank', description: 'Achieve Player Profile Level 5 (Challenger).', tag: 'General', xpReward: 250, condition: 'Profile Level 5', icon: '⚔️' },
  { id: '42', title: 'Specialist Rank', description: 'Achieve Player Profile Level 10 (Specialist).', tag: 'General', xpReward: 400, condition: 'Profile Level 10', icon: '🛡️' },
  { id: '43', title: 'Esports Elite Rank', description: 'Achieve Player Profile Level 20 (Elite).', tag: 'General', xpReward: 600, condition: 'Profile Level 20', icon: '🎖️' },
  { id: '44', title: 'Chronos Master Rank', description: 'Reach the ultimate Profile Level 50!', tag: 'General', xpReward: 1500, condition: 'Profile Level 50', icon: '👑' },
  { id: '45', title: 'Elite Aim Mechanic', description: 'Record an average under 350ms per target in Aim Trainer.', tag: 'Reflex', xpReward: 300, condition: 'Elite Aim', icon: '🏹' },
  { id: '46', title: 'Precise Tracker', description: 'Sustain cursor lock on floating planet for 20 seconds.', tag: 'Reflex', xpReward: 250, condition: 'Tracking Test', icon: '🪐' },
  { id: '47', title: 'Flick King', description: 'Score over 150 points in target Switching task.', tag: 'Reflex', xpReward: 280, condition: 'Switching test', icon: '🎛️' },
  { id: '48', title: 'Lighthouse Admiral', description: 'Execute zero delay cycles with performance above 95.', tag: 'General', xpReward: 150, condition: 'System clean', icon: '🏛️' },
  { id: '49', title: 'Daily Sweep', description: 'Complete all 3 rotatable daily challenges.', tag: 'General', xpReward: 200, condition: 'Challenge sweep', icon: '🧹' },
  { id: '50', title: 'Social Sharer', description: 'Generate a challenger share URL link to invite friends.', tag: 'General', xpReward: 80, condition: 'Generates URL', icon: '🔗' },
  { id: '51', title: 'Chronos Sentinel', description: 'Excel across all 4 benchmarking categories with honors.', tag: 'General', xpReward: 1000, condition: 'All tests logged', icon: '🛡️' }
];

// Helper to calculate Profile Level title
export function getLevelTitle(level: number) {
  if (level < 5) return { title: 'Recruit 🌟', color: 'text-slate-400 bg-slate-500/10' };
  if (level < 10) return { title: 'Challenger ⚔️', color: 'text-cyan-400 bg-cyan-500/10' };
  if (level < 20) return { title: 'Specialist 🛡️', color: 'text-indigo-400 bg-indigo-500/10' };
  if (level < 50) return { title: 'Elite 🎖️', color: 'text-purple-400 bg-purple-500/10 animate-pulse' };
  return { title: 'Chronos Master 👑', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 glow-amber' };
}

// -----------------------------------------------------------------------------------
// EXCLUSIVE MOBILE GAME: THUMB BLITZ RUSH
// -----------------------------------------------------------------------------------

interface BlitzTarget {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number; // pixel size 60 -> 0
  maxSize: number;
  isPowerUp?: 'freeze' | 'double' | 'mega';
}

export function ThumbBlitzRush({ onAddXP, currentProfile, updateLeaderboard }: { 
  onAddXP: (xp: number) => void; 
  currentProfile: ProfileState;
  updateLeaderboard: (category: string, score: number) => void;
}) {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds session
  const [targets, setTargets] = useState<BlitzTarget[]>([]);
  const [misses, setMisses] = useState<number>(0);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  
  // Active power-up states
  const [isFreezeActive, setIsFreezeActive] = useState<boolean>(false);
  const [isDoubleActive, setIsDoubleActive] = useState<boolean>(false);
  
  const targetCounter = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const physicsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startBlitzGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setMisses(0);
    setDifficultyLevel(1);
    setIsFreezeActive(false);
    setIsDoubleActive(false);
    setTargets([]);
    targetCounter.current = 0;

    // Spawn initial targets
    spawnTargets(3);

    // High fidelity count down
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          endBlitzGame();
          return 0;
        }
        const nextTime = parseFloat((prev - 0.1).toFixed(1));
        // Progress difficulty every 5 seconds
        if (Math.round(nextTime) % 5 === 0 && Math.round(nextTime) !== 30) {
          setDifficultyLevel((d) => Math.min(d + 1, 6));
        }
        return nextTime;
      });
    }, 100);

    // Physics core - shrinking targets over time
    physicsIntervalRef.current = setInterval(() => {
      setTargets((prevTargets) => {
        const nextTargets: BlitzTarget[] = [];
        prevTargets.forEach((t) => {
          // Shrink rate is slower if freeze is active
          const shrinkFactor = isFreezeActive ? 0.3 : (1 + difficultyLevel * 0.25);
          const nextSize = t.size - shrinkFactor;
          
          if (nextSize <= 10) {
            // Target expired! Count as miss
            handleMiss();
          } else {
            nextTargets.push({ ...t, size: nextSize });
          }
        });

        // Maintain at least 2 targets on screen
        if (nextTargets.length < 2 && Math.random() < 0.4) {
          const spawnCount = Math.floor(Math.random() * 2) + 1;
          for(let i=0; i<spawnCount; i++) {
            const hasPowerUp = Math.random() < 0.15;
            const powerUpType = hasPowerUp ? (Math.random() < 0.35 ? 'freeze' : Math.random() < 0.7 ? 'double' : 'mega') : undefined;
            nextTargets.push({
              id: targetCounter.current++,
              x: Math.random() * 80 + 10,
              y: Math.random() * 70 + 15,
              size: powerUpType === 'mega' ? 90 : 60,
              maxSize: powerUpType === 'mega' ? 90 : 60,
              isPowerUp: powerUpType
            });
          }
        }

        return nextTargets;
      });
    }, 50);
  };

  const spawnTargets = (count: number) => {
    const arr: BlitzTarget[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        id: targetCounter.current++,
        x: Math.random() * 80 + 10,
        y: Math.random() * 75 + 12,
        size: 60,
        maxSize: 60
      });
    }
    setTargets(arr);
  };

  const handleMiss = () => {
    setCombo((c) => {
      const nextCombo = Math.max(0, c - 1);
      // Reset multiplier if we missed 3 targets in a row or overall
      setMisses((m) => {
        const mCount = m + 1;
        if (mCount >= 3) {
          return 0; // reset misses
        }
        return mCount;
      });
      return nextCombo;
    });
  };

  const playHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handleTargetClick = (targetId: number, e: React.PointerEvent<HTMLButtonElement>, isPowerUp?: 'freeze' | 'double' | 'mega') => {
    e.stopPropagation();
    playHaptic();

    // Remove targeted circle
    setTargets((prev) => prev.filter((t) => t.id !== targetId));

    // Handle score calculation
    let baseHit = isPowerUp === 'mega' ? 25 : 10;
    
    // Combo multiplier logic
    let multiplier = 1;
    if (combo >= 20) multiplier = 5;
    else if (combo >= 10) multiplier = 3;
    else if (combo >= 5) multiplier = 2;

    let points = baseHit * multiplier;
    if (isDoubleActive) points *= 2;

    setScore((s) => s + points);
    setCombo((c) => c + 1);
    setMisses(0); // clear immediate misses chain

    // Trigger active power up states
    if (isPowerUp === 'freeze') {
      setIsFreezeActive(true);
      setTimeout(() => setIsFreezeActive(false), 4000); // 4 seconds freeze
    } else if (isPowerUp === 'double') {
      setIsDoubleActive(true);
      setTimeout(() => setIsDoubleActive(false), 5000); // 5 seconds double points
    }
  };

  const endBlitzGame = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (physicsIntervalRef.current) clearInterval(physicsIntervalRef.current);
    setGameState('finished');
    setTargets([]);

    // Award XP
    const xpWon = Math.min(250, Math.floor(score / 10));
    onAddXP(xpWon);

    // Save score to leaderboards
    updateLeaderboard('Thumb Blitz Rush', score);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (physicsIntervalRef.current) clearInterval(physicsIntervalRef.current);
    };
  }, []);

  return (
    <div className="p-5 bg-[#090d19] border border-[#1e294b] rounded-3xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-850">
        <div>
          <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-[10px] tracking-widest uppercase rounded">
            📱 Mobile Exclusive
          </span>
          <h2 className="text-lg font-black text-white mt-1">THUMB BLITZ RUSH</h2>
          <p className="text-[11px] text-slate-400">Random circles shrink! Tap precisely. Keep combos alive for 5x points.</p>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-bold text-slate-300">
              TIME: <span className="text-rose-400 font-black">{timeLeft.toFixed(1)}s</span>
            </span>
            <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-bold text-slate-300">
              DIFF: <span className="text-yellow-400 font-black">Lvl {difficultyLevel}</span>
            </span>
          </div>
        )}
      </div>

      {gameState === 'idle' && (
        <div className="py-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 animate-pulse">
            <Crosshair size={30} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-slate-250 uppercase tracking-wider">Are your fingers ready?</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Tapping circular nodes awards points and builds combo multipliers. Avoid missing targets to prevent multipliers break!</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase font-bold text-slate-400 bg-[#0e1324] p-3 rounded-xl max-w-md mx-auto">
            <span className="flex items-center gap-1.5"><Star size={10} className="text-rose-400" /> x2 Double score</span>
            <span className="flex items-center gap-1.5"><Star size={10} className="text-cyan-400" /> Freeze timer</span>
            <span className="flex items-center gap-1.5"><Star size={10} className="text-emerald-400" /> Mega circle</span>
          </div>

          <button
            onClick={startBlitzGame}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-transform hover:scale-105"
          >
            ⚔️ Begin Blitz Rush
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="grid grid-cols-3 gap-2 text-center pb-2">
          <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Score</span>
            <span className="text-lg font-mono font-black text-rose-400">{score}</span>
          </div>
          <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-center items-center">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Combo Multiplier</span>
            <span className="text-lg font-mono font-black text-teal-400 flex items-center gap-1">
              {combo} <span className="text-xs text-slate-550 font-normal">x{combo >= 20 ? 5 : combo >= 10 ? 3 : combo >= 5 ? 2 : 1}</span>
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Active Buff</span>
            <span className="text-[10px] font-bold block mt-1">
              {isFreezeActive ? (
                <span className="text-cyan-400 animate-pulse font-mono tracking-widest uppercase">FREEZE</span>
              ) : isDoubleActive ? (
                <span className="text-amber-400 animate-pulse font-mono tracking-widest uppercase">2X DOUBLE</span>
              ) : (
                <span className="text-slate-600 uppercase font-mono">None</span>
              )}
            </span>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div 
          className="relative w-full h-80 bg-black border border-slate-850 rounded-2xl overflow-hidden cursor-crosshair select-none"
          onClick={handleMiss}
        >
          {/* Circular targets */}
          {targets.map((t) => {
            let colorCls = "bg-rose-500/25 border-rose-500 text-rose-400";
            if (t.isPowerUp === 'freeze') colorCls = "bg-cyan-500/30 border-cyan-400 text-cyan-400 animate-pulse";
            if (t.isPowerUp === 'double') colorCls = "bg-amber-500/35 border-amber-400 text-amber-300 animate-pulse";
            if (t.isPowerUp === 'mega') colorCls = "bg-emerald-500/30 border-emerald-450 text-emerald-450";

            return (
              <button
                key={t.id}
                onPointerDown={(e) => handleTargetClick(t.id, e, t.isPowerUp)}
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: `${t.size}px`,
                  height: `${t.size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute rounded-full border-2 flex items-center justify-center transition-all duration-100 font-black font-mono text-[9px] active:scale-95 ${colorCls}`}
              >
                {t.isPowerUp ? (
                  <span>{t.isPowerUp === 'freeze' ? '❄️' : t.isPowerUp === 'double' ? '🌟' : 'Mega'}</span>
                ) : (
                  <span>{(t.size / t.maxSize * 100).toFixed(0)}%</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {gameState === 'finished' && (
        <div className="py-8 text-center space-y-4">
          <div className="inline-block px-4 py-1.5 bg-rose-500 text-slate-950 rounded-full font-black text-xs uppercase tracking-widest animate-bounce">
            ⚡ BLITZ SESSION ENDED
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white">Final Score: {score} pts</h3>
            <p className="text-xs text-slate-400">XP Earned: +{Math.min(250, Math.floor(score / 10))} XP allocated directly</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button
              onClick={startBlitzGame}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-550 hover:bg-rose-650 border border-rose-500/20 text-white rounded-xl text-xs font-bold"
            >
              <RotateCcw size={12} /> Play Again
            </button>
            <button
              onClick={() => setGameState('idle')}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 rounded-xl text-xs font-bold"
            >
              <CheckCircle size={12} /> Finished
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// ADDITIONAL TRAINING MINI GAMES (Aim, Tracking, Target Switch)
// -----------------------------------------------------------------------------------

export function AimTrainer({ onAddXP, updateLeaderboard }: { onAddXP: (xp: number) => void; updateLeaderboard: (category: string, score: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [ticks, setTicks] = useState(30); // 30 seconds
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTraining = () => {
    setIsPlaying(true);
    setScore(0);
    setTicks(30);
    spawnNewTarget();

    timerRef.current = setInterval(() => {
      setTicks((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          const xpGained = Math.min(100, Math.floor(score * 2));
          onAddXP(xpGained);
          updateLeaderboard('Aim Trainer', score);
          return 0;
        }
        return t - 1;
      });
    }, 100);
  };

  const spawnNewTarget = () => {
    setTarget({
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    });
  };

  const handleHit = (e: React.PointerEvent) => {
    e.stopPropagation();
    setScore(s => s + 1);
    spawnNewTarget();
  };

  return (
    <div className="p-5 bg-[#090d19] border border-[#1e294b] rounded-3xl space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
        <div>
          <h3 className="text-sm font-black text-white uppercase">Aim Trainer</h3>
          <p className="text-[10px] text-slate-500 uppercase">Tap the yellow center nodes quickly</p>
        </div>
        {isPlaying && <span className="text-xs font-mono font-black text-rose-455">Seconds Remaining: {ticks}s</span>}
      </div>

      {!isPlaying ? (
        <div className="py-12 text-center space-y-4">
          <p className="text-xs text-slate-400">Evaluate rapid cursor clicking coordinates precision</p>
          <button onClick={startTraining} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl">
            Start Trainer
          </button>
        </div>
      ) : (
        <div className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden select-none" onClick={() => {}}>
          <button
            onPointerDown={handleHit}
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-yellow-450 border border-amber-300 flex items-center justify-center animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </button>
          <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 rounded border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
            Hits Swiped: <span className="text-emerald-400 font-extrabold">{score}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------------
// ACHIEVEMENTS OVERVIEW COMPONENT
// -----------------------------------------------------------------------------------

export function AchievementsGrid({ records, profile }: { records: any[]; profile: ProfileState }) {
  const [activeTab, setActiveTab] = useState<'All' | 'CPS' | 'Keyboard' | 'Reflex' | 'Mobile'>('All');

  // Compute unlock status on client for elite simulation
  const isUnlocked = (ach: AchievementCard) => {
    // 1. First Touch
    if (ach.id === '1') return profile.totalTests > 0 || records.length > 0;
    // 2. CPS Apprentice
    if (ach.id === '2') return records.some(r => r.cps >= 5);
    // 3. Speed Warrior
    if (ach.id === '3') return records.some(r => r.cps >= 8);
    // 4. Chronos Pro
    if (ach.id === '4') return records.some(r => r.cps >= 11) || profile.bestCps >= 11;
    // 5. Esports Elite
    if (ach.id === '5') return records.some(r => r.cps >= 14) || profile.bestCps >= 14;
    // 6. God Finger
    if (ach.id === '6') return records.some(r => r.cps >= 18) || profile.bestCps >= 18;
    // 7. Jitter Apprentice
    if (ach.id === '7') return records.some(r => r.type === 'jitter');
    // 8. Jitter Demon
    if (ach.id === '8') return records.some(r => r.type === 'jitter' && r.cps >= 10);
    // 9. Butterfly Champion
    if (ach.id === '9') return records.some(r => r.cps >= 15);
    // 10. Minecraft Bridger
    if (ach.id === '10') return records.some(r => r.type === 'kohi' && r.cps >= 10);
    // 11. Reaction Rookie
    if (ach.id === '11') return profile.reactionAvg > 0;
    // 12. Reflex Specialist
    if (ach.id === '12') return profile.reactionAvg > 0 && profile.reactionAvg <= 250;
    // 13. Flick Hero
    if (ach.id === '13') return profile.reactionAvg > 0 && profile.reactionAvg <= 200;
    // 14. Reaction God
    if (ach.id === '14') return profile.reactionAvg > 0 && profile.reactionAvg <= 150;
    // 15. Sound Wave
    if (ach.id === '15') return profile.reactionAvg > 0 && profile.reactionAvg <= 160;
    // 17. Spacebar initiate
    if (ach.id === '17') return records.some(r => r.type === 'spacebar');
    // 24. Mobile Elite
    if (ach.id === '24') return profile.xp > 300;
    // 41. Level titles
    if (ach.id === '41') return profile.xp >= 400; // lvl 5
    if (ach.id === '42') return profile.xp >= 900; // lvl 10
    
    // Default fallback
    return false;
  };

  const filtered = ACHIEVEMENTS_POOL.filter(a => activeTab === 'All' || a.tag === activeTab);
  const unlockedCount = ACHIEVEMENTS_POOL.filter(a => isUnlocked(a)).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-white font-extrabold text-base flex items-center gap-1.5 uppercase">
            <Trophy size={18} className="text-amber-450" />
            Gaming Milestone Achievements Collection
          </h3>
          <p className="text-xs text-slate-400">Unlock customized badges and climb levels dynamically ({unlockedCount} / {ACHIEVEMENTS_POOL.length} completed)</p>
        </div>

        {/* Categories toggler */}
        <div className="flex flex-wrap gap-1 bg-[#0c1020] p-1 border border-slate-850 rounded-xl">
          {(['All', 'CPS', 'Keyboard', 'Reflex', 'Mobile'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all tracking-wider ${
                activeTab === tab ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 50+ list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filtered.map(ach => {
          const unlocked = isUnlocked(ach);
          return (
            <div 
              key={ach.id} 
              className={`p-3 rounded-2xl border transition-all text-left flex gap-2.5 relative group overflow-hidden ${
                unlocked 
                  ? 'bg-gradient-to-br from-[#0e1628] to-[#0a1122] border-emerald-500/20 hover:border-emerald-500/40 hover:scale-[1.01]' 
                  : 'bg-[#080b15]/75 border-slate-900 opacity-60'
              }`}
            >
              {unlocked && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform" />
              )}
              
              <div className="text-2xl pt-0.5 select-none shrink-0">{ach.icon}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-[11px] font-extrabold text-slate-100 leading-tight uppercase group-hover:text-emerald-350 transition-colors">
                    {ach.title}
                  </h4>
                  {unlocked && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal max-w-[200px]">{ach.description}</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{ach.tag}</span>
                  <span className="text-[8px] font-mono font-bold text-amber-500">+{ach.xpReward} XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------------
// BLOG SYSTEM NAVIGATION MODULE
// -----------------------------------------------------------------------------------

export interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  meta: string;
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "How to Improve CPS Quickly for Elite Esports",
    excerpt: "Discover the best hand vibrations and muscle twitching coordinates to immediately register peak clicks per second averages without risking hand fatigue.",
    category: "POSTURE GUIDES",
    meta: "13 June 2026 • Esports Coach Intel",
    content: "To immediately elevate your clicking speed, the single most critical factor is muscle positioning. Many casual users try to smash mouse buttons with high arm tension, which is highly inefficient. Instead, curl your fingers into a claw stance, allowing your forearm muscles to vibrate lightly and pass rapid muscle twitches directly down to your fingertip. Using textured mouse rubber tape keeps your fingers on target, and lightweight optical switches remove standard signal debouncing limits to maximize clicks."
  },
  {
    title: "Jitter Clicking vs Butterfly Clicking: Minecraft Duel Analyze",
    excerpt: "We break down mechanical differences, hardware optimization factors, double clicks settings, and safety comparisons for two legendary competitive clicking methods.",
    category: "MECHANICS CLASH",
    meta: "12 June 2026 • Pro Minecraft Analyst",
    content: "In competitive gaming, choosing a clicking technique shapes your entire strategy. Jitter clicking relies on intense forearm vibrations to produce speeds of 12-15 CPS, but requires specialized control. Butterfly clicking uses two fingers to alternate rapid taps on a single button, reaching speeds up to 20+ CPS when combined with adjustable mouse debounce delays. Butterfly clicking tends to cause less muscle fatigue over long sessions, making it a popular choice for extended PvP matches."
  },
  {
    title: "How Fast Is the Average Gamer's Clicking Response?",
    excerpt: "Comparing mouse click rates and keyboard latencies across casual, enthusiast, and professional gaming ranks based on extensive community statistics data.",
    category: "COMMUNITY STUDY",
    meta: "10 June 2026 • Stat Registry Team",
    content: "Analyzing over 100,000 completed speed tests reveals that the average gamer records 6.2 Clicks Per Second. High-tier enthusiasts average 8.5 CPS, while professional esports players consistently maintain 12 to 14+ CPS. Improving beyond average benchmarks requires dedicated muscle-twitch training and low-latency mechanical components."
  },
  {
    title: "Reaction Time Training Techniques: Lowering Your Latency",
    excerpt: "Learn how professional esports athletes train neural response systems to consistently react to on-screen alerts in under 150 milliseconds.",
    category: "NEURAL COGNITION",
    meta: "08 June 2026 • Neuro-Gaming Doctor",
    content: "Lowering reaction times is all about training your brain to process visual cues faster. With consistent practice on low-latency testing platforms, you can build reliable muscle memory and lower your response times. Keep your space quiet and free of distractions to stay focused and get the most out of your neural training."
  },
  {
    title: "Best Clicking Methods for Minecraft Speed-Bridging",
    excerpt: "A guide to drag-clicking, butterfly-clicking, and double-tapping mechanical setups to optimize block placements and win Minecraft custom map races.",
    category: "SPEEDRUN GUIDES",
    meta: "05 June 2026 • Bridge Master",
    content: "Speed-bridging in Minecraft requires extremely fast, accurate block placements. Drag clicking is the most effective method, letting players achieve click rates over 30 CPS using matte mouse surfaces or grip tape. For players on mice with standard double-clicking protections, alternating butterfly clicks remains the most reliable option."
  }
];

export function BlogSystem() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
        <div>
          <h3 className="text-white font-extrabold text-base flex items-center gap-1.5 uppercase">
            🚀 Gaming Performance & Chronos Academy Blog
          </h3>
          <p className="text-xs text-slate-400">Written by competitive gaming coaches and hardware engineers</p>
        </div>
        {selectedPost && (
          <button
            onClick={() => setSelectedPost(null)}
            className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] uppercase font-bold text-slate-300 hover:text-white"
          >
            ← Back to Articles
          </button>
        )}
      </div>

      {!selectedPost ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOG_POSTS.map((post, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPost(post)}
              className="p-5 bg-[#0a0f1d] border border-[#1e294b] rounded-2xl hover:border-emerald-500/30 cursor-pointer transition-all hover:scale-[1.01] space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[8px] tracking-widest rounded-full uppercase">
                  {post.category}
                </span>
                <h4 className="text-xs font-extrabold text-slate-200 line-clamp-2 uppercase">
                  {post.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-2.5 flex justify-between items-center">
                <span>{post.meta}</span>
                <span className="text-emerald-400 font-bold group-hover:underline">Read →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-[#0a0f1d]/90 border border-[#1e294b] rounded-3xl space-y-4 max-w-4xl leading-relaxed">
          <div className="space-y-1 header-part">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[9px] tracking-widest uppercase rounded">
              {selectedPost.category}
            </span>
            <h3 className="text-lg font-black text-white uppercase mt-2">{selectedPost.title}</h3>
            <p className="text-[10px] text-slate-500 tracking-wider font-mono">{selectedPost.meta}</p>
          </div>
          
          <div className="border-b border-slate-850" />
          
          <p className="text-xs text-slate-350 leading-relaxed font-sans font-medium">
            {selectedPost.content}
          </p>

          <blockquote className="text-[11px] italic text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 pl-4 border-l-2">
            "Your clicking speed and reaction timings are trainable mechanical traits. Spend 10 minutes daily on Chronos Arena and watch your competitive game metrics level up."
          </blockquote>
        </div>
      )}
    </div>
  );
}
