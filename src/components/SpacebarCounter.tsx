import React, { useState, useEffect, useRef } from 'react';
import { Binary, RefreshCw, Key, Volume2, VolumeX, Zap } from 'lucide-react';

interface SpacebarCounterProps {
  isClickerMode?: boolean; // If true, functions as the Spacebar Clicker (timed check)
}

export default function SpacebarCounter({ isClickerMode = false }: SpacebarCounterProps) {
  const [clicks, setClicks] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [duration, setDuration] = useState(10); // default 10 seconds for timer
  const [timeLeft, setTimeLeft] = useState(10);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio simulation! Synthesize a satisfying physical keyclick sound using Web Audio API so it works instantly without external dependencies!
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Node 1: Oscillator (for high pitch snap)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setIsActive(true);
    setTimeLeft(duration);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsActive(false);
          setIsFinished(true);
          // Save score
          saveRecord();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const saveRecord = () => {
    try {
      const records = JSON.parse(localStorage.getItem('cps_records') || '[]');
      const newRecord = {
        id: Math.random().toString(36).substring(7),
        date: new Date().toLocaleDateString(),
        duration: `${duration}s`,
        clicks: clicks + 1, // include this last trig
        cps: (clicks + 1) / duration,
        type: 'spacebar'
      };
      records.unshift(newRecord);
      localStorage.setItem('cps_records', JSON.stringify(records));
    } catch (e) {
      // ignore quota limits
    }
  };

  const handleTrigger = () => {
    if (isClickerMode && isFinished) return;

    playClickSound();

    if (isClickerMode && !isActive && clicks === 0) {
      startTimer();
    }

    setClicks((prev) => prev + 1);

    // Visual depress animation trigger
    setIsKeyPressed(true);
    setTimeout(() => {
      setIsKeyPressed(false);
    }, 85);
  };

  // Physical spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault(); // Stop window spacebar scrolling!
        if (e.repeat) return; // ignore duplicates on holding down key
        handleTrigger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isFinished, clicks, duration, isClickerMode]);

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setClicks(0);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
  };

  useEffect(() => {
    handleReset();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duration, isClickerMode]);

  const currentCps = clicks > 0 ? (clicks / (duration - timeLeft || 0.1)).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Options dashboard */}
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            <span>⌨️ Keyboard latency trainer</span>
          </p>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">
            {isClickerMode ? 'SPACEBAR CLICK SPEED TEST' : 'SPACEBAR COUNTER'}
          </h2>
          <p className="text-xs text-slate-400">
            {isClickerMode
              ? 'Rapid-tap the spacebar under precise time pressure! Test your keystrokes speed.'
              : 'Press the spacebar to count. Great for testing hardware latency and debounce issues.'}
          </p>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-3">
          {isClickerMode && (
            <div className="flex bg-[#12172a] rounded-xl border border-slate-800 p-1">
              {[5, 10, 30].map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    duration === t
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Synthesizer click sound"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-205 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Reset counter stats"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Info Stats row */}
      {isClickerMode && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0e1324] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Time Left</span>
            <span className="text-2xl font-mono font-extrabold text-[#f3f4f6]">{timeLeft}s</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0e1324] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Keystrokes</span>
            <span className="text-2xl font-mono font-extrabold text-pink-400">{clicks}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0e1324] border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Speed CPS</span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">{currentCps}</span>
          </div>
        </div>
      )}

      {/* HUGE Spacebar click canvas */}
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-8 flex flex-col items-center justify-center min-h-[340px] text-center relative overflow-hidden">
        <div className="space-y-3 z-10 select-none pointer-events-none mb-8">
          {!isClickerMode ? (
            <>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total Counts Tracked</p>
              <h1 className="text-6xl font-black text-white font-mono tracking-wide">{clicks}</h1>
              <p className="text-xs text-slate-500">Tap your physical Spacebar or click the giant key below!</p>
            </>
          ) : !isActive && clicks === 0 ? (
            <>
              <p className="text-xl font-extrabold text-white uppercase tracking-wider">TAP SPACEBAR TO INITIATE</p>
              <p className="text-xs text-slate-400 font-medium">Starts the countdown immediately on first press.</p>
            </>
          ) : isFinished ? (
            <div className="space-y-2">
              <span className="text-3xl">🏆</span>
              <p className="text-xl font-bold text-emerald-400 uppercase">SPEEDTEST COMPLETED</p>
              <p className="text-sm text-slate-300 font-mono">You hit the spacebar {clicks} times, averaging {currentCps} strokes/sec.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest animate-pulse text-pink-400">KEEP PUSHING!</p>
              <h1 className="text-6xl font-black text-white font-mono">{clicks}</h1>
              <p className="text-xs text-slate-500">Countdown: {timeLeft}s remaining</p>
            </>
          )}
        </div>

        {/* Giant Interactive Spacebar Key */}
        <div
          id="giant-spacebar-trigger"
          onClick={handleTrigger}
          className={`w-full max-w-xl h-24 rounded-2xl border-4 relative cursor-pointer select-none transition-all duration-75 flex items-center justify-center ${
            isKeyPressed
              ? 'bg-[#151c33] border-emerald-500 shadow-inner translate-y-2 bg-gradient-to-t from-emerald-500/10 to-transparent'
              : 'bg-[#111629] border-slate-750 hover:border-slate-600 shadow-[0_12px_0_rgba(15,23,42,1)] active:translate-y-2'
          }`}
        >
          <div className="absolute inset-x-0 bottom-0 h-2 bg-black/20 rounded-b-xl" />
          <div className="flex items-center gap-2 text-slate-400 font-bold tracking-wider text-xs pointer-events-none select-none uppercase">
            <Key size={14} className={isKeyPressed ? 'text-emerald-400' : 'text-slate-500'} />
            <span className={isKeyPressed ? 'text-[#f3f4f6]' : ''}>SPACEBAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
