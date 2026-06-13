import React, { useState, useRef, useEffect } from 'react';
import { Target, Zap } from 'lucide-react';

interface ClickArenaProps {
  mode: 'cps' | 'jitter' | 'kohi';
  isActive: boolean;
  isFinished: boolean;
  clicks: number;
  timeRemaining: number;
  onFirstClick: () => void;
  onClick: () => void;
  durationSeconds?: number;
  isNewRecord?: boolean;
  onReset?: () => void;
}

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export default function ClickArena({
  mode,
  isActive,
  isFinished,
  clicks,
  timeRemaining,
  onFirstClick,
  onClick,
  durationSeconds = 5,
  isNewRecord = false,
  onReset
}: ClickArenaProps) {
  
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const rippleCounter = useRef(0);
  const clickBoxRef = useRef<HTMLDivElement>(null);
  
  // Custom screen shake triggers during heavy clicking in jitter mode!
  const [shouldShake, setShouldShake] = useState(false);
  const shakeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isFinished) {
      if (onReset) {
        onReset();
      }
      return;
    }

    if (!isActive && clicks === 0) {
      onFirstClick();
    }
    
    // Increment score instantly
    onClick();

    // Trigger visual shake effect if in jitter test
    if (mode === 'jitter') {
      setShouldShake(true);
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
      shakeTimeout.current = setTimeout(() => {
        setShouldShake(false);
      }, 120);
    }

    // Spawn a touch/click ripple
    if (clickBoxRef.current) {
      const rect = clickBoxRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        id: rippleCounter.current++,
        x,
        y
      };
      
      setRipples(prev => [...prev.slice(-30), newRipple]); // keep maximum of last 30 ripples
    }
  };

  // Keyboard accessibility! Press "Enter" or "Space" while focused or just space anywhere inside click arena boundaries
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      // Simulate click
      if (isFinished) {
        if (onReset) {
          onReset();
        }
        return;
      }
      if (!isActive && clicks === 0) {
        onFirstClick();
      }
      onClick();
    }
  };

  // Clean ripples from DOM after animations pass
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Clean timeout
  useEffect(() => {
    return () => {
      if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
    };
  }, []);

  const getSizingClasses = () => {
    if (mode === 'jitter') return 'border-orange-500/20 shadow-orange-500/5';
    if (mode === 'kohi') return 'border-cyan-500/20 shadow-cyan-500/5';
    return 'border-emerald-500/20 shadow-emerald-500/5';
  };

  // Live CPS & Rank calculations
  const elapsed = durationSeconds - timeRemaining;
  const liveCps = clicks > 0 ? (clicks / (elapsed || 0.1)) : 0;

  const getLiveRank = (cps: number) => {
    if (cps < 4) return { name: 'Beginner 🌟', color: 'text-slate-450 border border-slate-500/20 bg-slate-500/10' };
    if (cps < 6) return { name: 'Casual 🚶', color: 'text-zinc-400 border border-zinc-500/20 bg-zinc-500/10' };
    if (cps < 8) return { name: 'Fighter ⚔️', color: 'text-amber-500 border border-amber-500/20 bg-amber-500/10' };
    if (cps < 10) return { name: 'Specialist 🎯', color: 'text-cyan-400 border border-cyan-500/20 bg-cyan-500/10' };
    if (cps < 12) return { name: 'Elite ☄️', color: 'text-indigo-400 border border-indigo-500/20 bg-indigo-500/10' };
    if (cps < 15) return { name: 'Godlike 🔥', color: 'text-purple-400 border border-purple-500/20 bg-purple-500/10' };
    return { name: 'Esports Elite 🏎️', color: 'text-rose-500 border border-rose-500/35 bg-rose-500/10 glow-rose' };
  };

  const rank = getLiveRank(liveCps);

  // Time remaining percentage for progress bar
  const progressPercent = isActive ? (timeRemaining / durationSeconds) * 100 : 100;

  // Determine Dynamic Activity Status Message
  const getStatusMessage = () => {
    if (!isActive && clicks === 0) return 'Status: Idle';
    if (isFinished) {
      if (isNewRecord) return 'Status: NEW PERSONAL BEST! 🏆';
      return 'Status: Completed';
    }
    if (timeRemaining < 1.5) return 'Status: FINAL SECOND! ⚡';
    return 'Status: DURING TEST ☄️';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs text-slate-400 px-1 font-bold">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          TARGET INTERACTION ZONE
        </span>
        <span className="flex items-center gap-1.5">
          <Zap size={12} className="text-emerald-400" />
          <span className="text-emerald-350">{getStatusMessage()}</span>
        </span>
      </div>

      <div
        id="click-arena-zone"
        ref={clickBoxRef}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        className={`w-full h-80 rounded-3xl border bg-[#050811] flex flex-col items-center justify-center relative overflow-hidden select-none cursor-pointer outline-none transition-all ${
          isFinished ? 'opacity-90 hover:bg-[#071026] active:scale-[0.99] border-emerald-500/35 hover:scale-[1.002]' : 'hover:bg-[#070b18] active:scale-[0.98]'
        } ${getSizingClasses()} ${
          shouldShake ? 'animate-bounce-micro' : ''
        }`}
      >
        {/* Cool decorative reticle rings for Kohi mode */}
        {mode === 'kohi' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-64 h-64 border-4 border-dashed border-cyan-400 rounded-full animate-spin-slow" />
            <div className="w-48 h-48 border-2 border-cyan-400 rounded-full absolute" />
            <div className="w-12 h-12 border border-cyan-400 rounded-full absolute" />
            <Target size={40} className="text-cyan-400 absolute" />
          </div>
        )}

        {/* Shaking intense flame design for Jitter mode */}
        {mode === 'jitter' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-500 to-transparent animate-pulse" />
          </div>
        )}

        {/* Standard subtle green pulsing grid background */}
        {mode === 'cps' && (
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 to-transparent pointer-events-none" />
        )}

        {/* Live Rank floating tag */}
        {(isActive || isFinished) && (
          <div className="absolute top-4 left-4 z-20">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${rank.color}`}>
              Rank: {rank.name}
            </div>
          </div>
        )}

        {/* Instruction overlay */}
        <div className="text-center z-10 p-6 pointer-events-none">
          {!isActive && clicks === 0 ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto animate-pulse">
                <Target size={24} className="text-emerald-400" />
              </div>
              <p className="text-xl md:text-2xl font-black text-white tracking-wider uppercase">
                CLICK TO START
              </p>
              <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">
                Tapping immediately registers and starts the timer
              </p>
            </div>
          ) : isFinished ? (
            <div className="space-y-4">
              {isNewRecord ? (
                <div className="px-5 py-2 bg-yellow-500 text-slate-950 font-black tracking-widest text-sm rounded-full animate-bounce inline-block mb-1">
                  🏆 NEW RECORD!
                </div>
              ) : (
                <p className="text-2xl font-black text-rose-500 tracking-wide uppercase">TIME COMPLETED</p>
              )}
              <h4 className="text-5xl font-black font-mono text-white leading-none">{clicks}</h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Final Speed: {(clicks / durationSeconds).toFixed(2)} CPS
              </p>
              <div className="pt-2">
                <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm animate-pulse inline-block">
                  ⚡ Click anywhere to Reset & Retry
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-6xl font-black text-white font-mono leading-none tracking-tight">{clicks}</p>
              <p className="text-xs text-emerald-400 font-black tracking-widest uppercase animate-pulse">
                {timeRemaining <= 1 ? "⚡ FINISH STRONG!" : "KEEP GOING!"}
              </p>
              <div className="px-3 py-1 bg-slate-900/40 border border-slate-800 rounded-lg max-w-[200px] mx-auto">
                <p className="text-[10px] text-slate-400 font-bold uppercase font-mono">
                  Remaining: {timeRemaining.toFixed(1)}s
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Custom pointerdown Click ripples */}
        {ripples.map((rip) => (
          <span
            key={rip.id}
            style={{
              left: rip.x - 35,
              top: rip.y - 35,
            }}
            className={`absolute w-[70px] h-[70px] rounded-full pointer-events-none opacity-0 select-none animate-ripple duration-700 ${
              mode === 'jitter' ? 'bg-orange-500/40 border border-orange-400/50' :
              mode === 'kohi' ? 'bg-cyan-500/40 border border-cyan-400/50' :
              'bg-emerald-500/40 border border-emerald-400/50'
            }`}
          />
        ))}

        {/* Floating progress bar beneath the main zone inside the arena container */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#151c33]">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Screen shake style definitions injected directly */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0.1);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes bounce-micro {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 3px) rotate(-1deg); }
          50% { transform: translate(3px, -2px) rotate(1deg); }
          75% { transform: translate(-3px, -2px); }
        }
        .animate-bounce-micro {
          animation: bounce-micro 0.12s infinite;
        }
      `}</style>
    </div>
  );
}
