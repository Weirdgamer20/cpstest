import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Play, RotateCcw, Trophy, Sparkles, Snowflake, Star, ZapOff } from 'lucide-react';
import { getStoredProfile, saveProfile, calculateLevelInfo } from '../lib/gameDB';

interface SpawnedTarget {
  id: number;
  x: number; // percentage (5 to 90)
  y: number; // percentage (10 to 80)
  size: number; // starts at 100% and shrinks to 0
  isMega: boolean;
  isFreezePower: boolean;
  isDoublePower: boolean;
  createdAt: number;
}

interface ThumbBlitzRushProps {
  onScoreSubmitted?: (score: number) => void;
  onXPUnlocked?: (xp: number, message: string) => void;
}

export default function ThumbBlitzRush({ onScoreSubmitted, onXPUnlocked }: ThumbBlitzRushProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30.0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [missedHits, setMissedHits] = useState(0);
  
  // Power-up States
  const [isFrozen, setIsFrozen] = useState(false);
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);
  const [activePowerUpText, setActivePowerUpText] = useState<string>('');

  // Target storage list
  const [targets, setTargets] = useState<SpawnedTarget[]>([]);
  const targetCounter = useRef(0);
  const [gameDifficulty, setGameDifficulty] = useState(1); // 1 to 6 (increases every 5 seconds)

  // Timer reference loops
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const targetSpawnRef = useRef<NodeJS.Timeout | null>(null);
  const shrinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vibration support
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Start the elite challenge
  const startChallenge = () => {
    setIsPlaying(true);
    setIsFinished(false);
    setScore(0);
    setTimeRemaining(30.0);
    setCombo(0);
    setMaxCombo(0);
    setMissedHits(0);
    setGameDifficulty(1);
    setIsFrozen(false);
    setDoubleScoreActive(false);
    setActivePowerUpText('');
    setTargets([]);
    
    targetCounter.current = 0;

    // Spawn first target immediately
    spawnTarget();

    // 1. Core Game Timeline loop
    const gameStart = Date.now();
    gameTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - gameStart) / 1000;
      const left = Math.max(0, 30.0 - elapsed);
      setTimeRemaining(parseFloat(left.toFixed(1)));

      // Difficulty ramps up every 5 seconds
      const currentDifficulty = Math.min(6, Math.floor(elapsed / 5) + 1);
      setGameDifficulty(currentDifficulty);

      if (left <= 0) {
        endChallenge();
      }
    }, 100);

    // 2. Continuous target spawn loop based on difficulty
    const triggerSpawnLoop = () => {
      // spawn rate goes from 1100ms at difficulty 1 to 500ms at difficulty 6
      const spawnInterval = Math.max(450, 1100 - (gameDifficulty * 100));
      targetSpawnRef.current = setTimeout(() => {
        if (isPlaying) {
          spawnTarget();
          triggerSpawnLoop();
        }
      }, spawnInterval);
    };
    triggerSpawnLoop();

    // 3. Target shrinking loop
    shrinkTimerRef.current = setInterval(() => {
      if (isFrozen) return; // Freeze Time powerup suspends shrink

      setTargets((prev) => {
        const next: SpawnedTarget[] = [];
        for (const target of prev) {
          // Shrink rate increases with difficulty
          const decay = 2 + (gameDifficulty * 1.5);
          const nextSize = target.size - decay;

          if (nextSize <= 0) {
            // Target expired (missed completely!)
            setCombo((c) => {
              // Missed targets count toward breaker
              setMissedHits((m) => {
                const updatedMiss = m + 1;
                if (updatedMiss >= 3) {
                  // Resets combo multiplier!
                  return 0; // reset misses accumulator
                }
                return updatedMiss;
              });
              return 0; // reset active combo
            });
          } else {
            next.push({ ...target, size: nextSize });
          }
        }
        return next;
      });
    }, 50);
  };

  const endChallenge = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetSpawnRef.current) clearTimeout(targetSpawnRef.current);
    if (shrinkTimerRef.current) clearInterval(shrinkTimerRef.current);

    setIsPlaying(false);
    setIsFinished(true);
    setTargets([]);

    // Submit score to local leaderboard logic
    if (onScoreSubmitted) {
      onScoreSubmitted(score);
    }

    // Award XP
    const profile = getStoredProfile();
    const earnedXp = Math.floor(score / 5);
    profile.lifetimeXp += earnedXp;
    profile.totalTests += 1;
    saveProfile(profile);

    if (onXPUnlocked) {
      onXPUnlocked(earnedXp, `Completed Thumb Blitz Rush! Earned +${earnedXp} XP`);
    }
  };

  const spawnTarget = () => {
    // Generate randomized coordinates ensuring safe boundaries inside frame
    const x = Math.floor(Math.random() * 80) + 10; // 10% to 90%
    const y = Math.floor(Math.random() * 70) + 15; // 15% to 85%

    // Power-up generation logic (random chances)
    const roll = Math.random();
    let isMega = false;
    let isFreezePower = false;
    let isDoublePower = false;

    if (roll < 0.12) {
      isMega = true; // Mega target: huge 50-point target
    } else if (roll >= 0.12 && roll < 0.18) {
      isFreezePower = true; // Freeze target (ice blue)
    } else if (roll >= 0.18 && roll < 0.24) {
      isDoublePower = true; // Double points target (purple star)
    }

    const newTarget: SpawnedTarget = {
      id: targetCounter.current++,
      x,
      y,
      size: 100, // Starts at 100% full scale
      isMega,
      isFreezePower,
      isDoublePower,
      createdAt: Date.now()
    };

    setTargets((prev) => [...prev.slice(-12), newTarget]);
  };

  const handleTargetTap = (e: React.MouseEvent, tapped: SpawnedTarget) => {
    e.stopPropagation();
    triggerHaptic();

    // Calculate Hit Score points based on size clicked (extra reward for fast reflex tapping while size is large!)
    let pointsEarned = 10;
    let activePowerText = '';

    if (tapped.isMega) {
      pointsEarned = 50;
      activePowerText = '🎯 MEGA IMPACT! +50';
    } else if (tapped.isFreezePower) {
      pointsEarned = 15;
      setIsFrozen(true);
      activePowerText = '❄️ FREEZE TIME ACTIVE!';
      setTimeout(() => setIsFrozen(false), 5000);
    } else if (tapped.isDoublePower) {
      pointsEarned = 20;
      setDoubleScoreActive(true);
      activePowerText = '✖️ DOUBLE SCORE ACTIVATED!';
      setTimeout(() => setDoubleScoreActive(false), 5000);
    } else {
      // Speed multiplier reward
      if (tapped.size > 80) pointsEarned = 15; // Speed Reflex Bonus!
    }

    // Apply combo multipliers: 5 hits -> x2, 10 hits -> x3, 20 hits -> x5
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);

    let multiplier = 1;
    if (newCombo >= 20) multiplier = 5;
    else if (newCombo >= 10) multiplier = 3;
    else if (newCombo >= 5) multiplier = 2;

    if (doubleScoreActive) {
      multiplier *= 2;
    }

    const calculatedPoints = pointsEarned * multiplier;
    setScore((s) => s + calculatedPoints);

    if (activePowerText) {
      setActivePowerUpText(activePowerText);
      setTimeout(() => setActivePowerUpText(''), 3000);
    }

    // Clear the tapped target instantly
    setTargets((prev) => prev.filter((t) => t.id !== tapped.id));
    setMissedHits(0); // broken miss chain reset
  };

  const handleArenaFault = () => {
    if (!isPlaying) return;
    // Tapping blank coordinate breaks combo multiplier
    setCombo(0);
    setMissedHits(0);
    triggerHaptic();
  };

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (targetSpawnRef.current) clearTimeout(targetSpawnRef.current);
      if (shrinkTimerRef.current) clearInterval(shrinkTimerRef.current);
    };
  }, []);

  const getComboClass = () => {
    if (combo >= 20) return 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    if (combo >= 10) return 'text-amber-400 scale-105';
    if (combo >= 5) return 'text-emerald-400';
    return 'text-slate-400';
  };

  return (
    <div id="thumb-blitz-outer" className="space-y-5 flex flex-col h-full bg-[#080c18] border border-[#1e294b] p-4 sm:p-5 rounded-3xl relative overflow-hidden">
      
      {/* Target ambient light rings */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Grid details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 border-b border-slate-850 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-3 py-1 rounded-full">
            📱 Mobile-First Special Edition
          </span>
          <h2 className="text-xl font-black text-white mt-1.5 uppercase tracking-wide flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400 animate-pulse" /> THUMB BLITZ RUSH
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Rapid circular targets benchmarking. Tap fast before decay cycles hit 0.</p>
        </div>

        {!isPlaying && (
          <button
            onClick={startChallenge}
            className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/10 cursor-pointer"
          >
            <Play size={13} fill="currentColor" />
            <span>Launch Arena</span>
          </button>
        )}
      </div>

      {/* Interface readouts during active gaming loops */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 z-10">
        <div className="p-2 sm:p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Game Timer</span>
          <span className="text-lg sm:text-2xl font-mono font-black text-purple-400">{timeRemaining.toFixed(1)}s</span>
        </div>
        <div className="p-2 sm:p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scores</span>
          <span className="text-lg sm:text-2xl font-mono font-black text-emerald-400">{score}</span>
        </div>
        <div className="p-2 sm:p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Combo Rate</span>
          <span className={`text-lg sm:text-2xl font-mono font-black transition-all ${getComboClass()}`}>
            {combo}x
          </span>
        </div>
        <div className="p-2 sm:p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Difficulty</span>
          <span className="text-lg sm:text-2xl font-mono font-black text-cyan-400">LVL {gameDifficulty}</span>
        </div>
      </div>

      {/* Main Touch Playable Arena */}
      <div 
        id="thumb-blitz-grid"
        onClick={handleArenaFault}
        className="relative flex-1 min-h-[360px] bg-slate-950/80 border border-slate-850 rounded-2xl overflow-hidden select-none cursor-crosshair flex items-center justify-center"
      >
        {isFrozen && (
          <div className="absolute inset-0 bg-[#3b82f6]/10 pointer-events-none border border-cyan-400/30 flex items-center justify-center animate-pulse z-10">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-slate-900/90 px-3 py-1.5 rounded-full border border-cyan-400/30">
              ❄️ FREEZE MATRIX ACTIVATED
            </span>
          </div>
        )}

        {doubleScoreActive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#a855f7]/20 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-purple-400 tracking-widest uppercase z-15 flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            <span>2X Score Points</span>
          </div>
        )}

        {activePowerUpText && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1e294b]/95 border border-slate-800 text-slate-200 text-xs px-3.5 py-1.5 rounded-xl font-black z-20 shadow-xl tracking-wider uppercase animate-bounce">
            {activePowerUpText}
          </div>
        )}

        {!isPlaying && !isFinished ? (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-pulse">
              <Target size={28} className="text-emerald-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">Ready for Blitz?</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Random circular targets shrink over time. Tap fast without miss triggers to stack huge score multipliers.</p>
            </div>
            <button
              onClick={startChallenge}
              className="py-2 px-6 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-100 hover:text-white transition-all text-xs font-bold rounded-xl cursor-pointer"
            >
              Start Practice Session
            </button>
          </div>
        ) : isFinished ? (
          <div className="text-center p-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto text-slate-950 font-black text-2xl">
              🏆
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase">Challenge Completed!</h3>
              <p className="text-xs text-slate-400">Your total achievements recorded in profile cache:</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
              <div className="p-2.5 bg-[#0d1120] border border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Final score</span>
                <span className="text-base font-black text-emerald-400 font-mono">{score} pts</span>
              </div>
              <div className="p-2.5 bg-[#0d1120] border border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Max Combo</span>
                <span className="text-base font-black text-purple-400 font-mono">{maxCombo} hits</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={startChallenge}
                className="py-2 px-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-400/5"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  const textToCopy = `🔥 I scored ${score} pts in Thumb Blitz Rush on Chronos Arena! Can you beat me?`;
                  navigator.clipboard.writeText(textToCopy);
                  alert('Challenge text copied to clipboard!');
                }}
                className="py-2 px-4 bg-[#151c33] border border-slate-850 hover:bg-[#1b2545] text-slate-300 font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Share Score
              </button>
            </div>
          </div>
        ) : (
          targets.map((target) => {
            const sizePx = target.isMega ? 75 : 45;
            
            // Render customized coloring depending on target power-ups
            let bgClass = 'bg-radial-gradient from-emerald-500 to-emerald-600 border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
            let iconElement = <Target size={14} className="text-slate-950" />;

            if (target.isMega) {
              bgClass = 'bg-radial-gradient from-amber-500 to-orange-600 border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse';
              iconElement = <Star size={18} className="text-slate-950" fill="currentColor" />;
            } else if (target.isFreezePower) {
              bgClass = 'bg-radial-gradient from-cyan-400 to-blue-600 border border-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.5)]';
              iconElement = <Snowflake size={14} className="text-white" />;
            } else if (target.isDoublePower) {
              bgClass = 'bg-radial-gradient from-purple-500 to-indigo-600 border border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]';
              iconElement = <Trophy size={14} className="text-white" />;
            }

            return (
              <button
                key={target.id}
                onClick={(e) => handleTargetTap(e, target)}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: `scale(${target.size / 100})`,
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  marginTop: `-${sizePx / 2}px`,
                  marginLeft: `-${sizePx / 2}px`,
                  transition: 'transform 0.05s linear'
                }}
                className={`absolute rounded-full flex items-center justify-center cursor-pointer select-none active:scale-95 ${bgClass}`}
              >
                {iconElement}
              </button>
            );
          })
        )}
      </div>

      {/* Rules list */}
      <div className="p-3.5 bg-[#0e1324]/50 border border-slate-850 rounded-xl space-y-1.5 text-xs text-slate-400">
        <p className="font-extrabold text-[#10b981] uppercase tracking-wider text-[10px]">How to score and activate multipliers:</p>
        <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed font-medium">
          <li>Normal targets reward 10 points. Speed Reflex Bonus rewards +5 total points if hit quickly.</li>
          <li>Powerups: <span className="text-amber-400 font-bold">Mega Targets (+50 pts)</span>, <span className="text-cyan-400 font-bold">Freeze Time (stops shrink timers)</span>, and <span className="text-purple-400 font-bold">Double Scope (2x scoring multiplier for 5s)</span>.</li>
          <li>Multiplier ramps at: <span className="text-emerald-400 font-bold">5 hits (x2)</span>, <span className="text-amber-400 font-bold">10 hits (x3)</span>, and <span className="text-rose-500 font-bold">20 hits (x5)</span>. Blank coordinate clicks or 3 missed targets break and reset indices.</li>
        </ul>
      </div>
    </div>
  );
}
