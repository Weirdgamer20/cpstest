import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Timer, 
  RefreshCw, 
  Zap, 
  Award, 
  ShieldAlert, 
  HeartCrack, 
  Volume2, 
  VolumeX, 
  Grid3X3, 
  Sparkles, 
  Activity,
  Flame,
  Target,
  Trophy
} from 'lucide-react';

type ReactionMode = 'visual' | 'audio' | 'precision';

interface PrecisionTarget {
  id: number;
  active: boolean;
}

export default function ReactionTimeTest() {
  const [mode, setMode] = useState<ReactionMode>('visual');
  const [testState, setTestState] = useState<'idle' | 'waiting' | 'ready' | 'result' | 'fail'>('idle');
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  
  // Audio configuration & state
  const [isMuted, setIsMuted] = useState(false);

  // Session Statistics databases
  const [historyVisual, setHistoryVisual] = useState<number[]>([]);
  const [historyAudio, setHistoryAudio] = useState<number[]>([]);
  const [historyPrecision, setHistoryPrecision] = useState<number[]>([]);

  const [sessionStreak, setSessionStreak] = useState(0);
  const [peakStreak, setPeakStreak] = useState(0);
  const [totalTries, setTotalTries] = useState(0);

  // Precision Mode Sub-states
  const [precisionTargets, setPrecisionTargets] = useState<PrecisionTarget[]>([]);
  const [precisionClicksCompleted, setPrecisionClicksCompleted] = useState(0);
  const startTimePrecisionRef = useRef<number>(0);
  const [precisionActiveIdx, setPrecisionActiveIdx] = useState<number | null>(null);

  // Timekeeper refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Programmatic Synth Feedback
  const triggerSynthTone = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // quiet fail on browser interactions blocker
    }
  }, [isMuted]);

  // Visual & Audio round launcher
  const startTest = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setReactionMs(null);

    if (mode === 'precision') {
      // Launch target grid frenzy directly
      startPrecisionTest();
      return;
    }

    setTestState('waiting');

    // Esports randomized interval between 1.5s to 4s
    const randomDelay = 1500 + Math.random() * 2500;
    
    timeoutRef.current = setTimeout(() => {
      setTestState('ready');
      startTimeRef.current = Date.now();
      
      if (mode === 'audio') {
        // Trigger high pitch alert tone
        triggerSynthTone(880, 0.35, 'triangle');
      }
    }, randomDelay);
  };

  // Precision Mode initiation
  const startPrecisionTest = () => {
    setTestState('ready');
    setPrecisionClicksCompleted(0);
    // Seed 9 target nodes of the grid
    const initialList = Array.from({ length: 9 }, (_, r) => ({ id: r, active: false }));
    setPrecisionTargets(initialList);
    
    // Choose starting focus node
    const randomIdx = Math.floor(Math.random() * 9);
    initialList[randomIdx].active = true;
    setPrecisionActiveIdx(randomIdx);
    
    startTimePrecisionRef.current = Date.now();
    triggerSynthTone(440, 0.1, 'sine');
  };

  const handlePrecisionNodeClick = (nodeIndex: number) => {
    if (testState !== 'ready') return;
    
    if (nodeIndex === precisionActiveIdx) {
      // Hit correct target!
      const currentStamp = Date.now();
      const steps = precisionClicksCompleted + 1;
      
      triggerSynthTone(600 + steps * 50, 0.12, 'sine');
      
      if (steps >= 5) {
        // Log finished performance
        const elapsedTotal = currentStamp - startTimePrecisionRef.current;
        const avgPerTarget = Math.round(elapsedTotal / 5);
        setReactionMs(avgPerTarget);
        setTestState('result');
        setHistoryPrecision((prev) => [avgPerTarget, ...prev.slice(0, 15)]);
        setSessionStreak((s) => s + 1);
        setTotalTries((t) => t + 1);
      } else {
        setPrecisionClicksCompleted(steps);
        // Reshuffle node grid
        setPrecisionTargets((prev) => {
          const next = prev.map((n) => ({ ...n, active: false }));
          // Find different index
          let newIdx = Math.floor(Math.random() * 9);
          while (newIdx === nodeIndex) {
            newIdx = Math.floor(Math.random() * 9);
          }
          next[newIdx].active = true;
          setPrecisionActiveIdx(newIdx);
          return next;
        });
      }
    } else {
      // Misclick / failure penalty!
      triggerSynthTone(120, 0.3, 'sawtooth');
      setTestState('fail');
      setSessionStreak(0);
    }
  };

  const handleTrigger = () => {
    if (testState === 'waiting') {
      // Clang early false start
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      triggerSynthTone(150, 0.4, 'sawtooth');
      setTestState('fail');
      setSessionStreak(0);
    } else if (testState === 'ready') {
      // Success!
      const elapsed = Date.now() - startTimeRef.current;
      setReactionMs(elapsed);
      setTestState('result');
      setSessionStreak((s) => s + 1);
      setTotalTries((t) => t + 1);

      // Save to correct history stack
      if (mode === 'visual') {
        setHistoryVisual((prev) => [elapsed, ...prev.slice(0, 15)]);
        triggerSynthTone(1000, 0.15, 'sine');
      } else if (mode === 'audio') {
        setHistoryAudio((prev) => [elapsed, ...prev.slice(0, 15)]);
        triggerSynthTone(1200, 0.15, 'sine');
      }
    }
  };

  const handleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTestState('idle');
    setReactionMs(null);
  };

  const clearHistory = () => {
    setHistoryVisual([]);
    setHistoryAudio([]);
    setHistoryPrecision([]);
    setSessionStreak(0);
    setTotalTries(0);
    triggerSynthTone(180, 0.25, 'sine');
  };

  // Sync peak streak counter
  useEffect(() => {
    if (sessionStreak > peakStreak) {
      setPeakStreak(sessionStreak);
    }
  }, [sessionStreak, peakStreak]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Mode Selection handler
  const selectMode = (newMode: ReactionMode) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMode(newMode);
    setTestState('idle');
    setReactionMs(null);
    triggerSynthTone(520, 0.1, 'sine');
  };

  // Compute stats based on active mode
  const currentHistory = mode === 'visual' ? historyVisual : mode === 'audio' ? historyAudio : historyPrecision;
  const bestReaction = currentHistory.length > 0 ? Math.min(...currentHistory) : null;
  const averageReaction = currentHistory.length > 0 
    ? Math.round(currentHistory.reduce((a, b) => a + b, 0) / currentHistory.length) 
    : null;

  // Reflex Evaluator Text Ranker
  const getReactionRank = (ms: number) => {
    if (mode === 'precision') {
      if (ms < 250) return { title: 'Godlike Aim 🎯', color: 'text-rose-400', desc: 'Scurrying target precision equivalent to standard FPS esports champs!' };
      if (ms < 350) return { title: 'Sharp Reflexes ⚡', color: 'text-indigo-300', desc: 'Brilliant spatial coordination speed. Keep pushing!' };
      if (ms < 450) return { title: 'Competent Gamer 🎮', color: 'text-cyan-400', desc: 'Healthy coordination rates. Better than general standards.' };
      return { title: 'Sluggish Clicks 🐢', color: 'text-amber-400', desc: 'Warm up your shoulder muscles and inspect tactile switches.' };
    } else {
      if (ms < 150) return { title: 'Godlike Reflexes 🏎️', color: 'text-amber-400', desc: 'Human peak reaction potential! Incredible neural response frames.' };
      if (ms < 200) return { title: 'A-Tier Pro Esports 🎮', color: 'text-indigo-400', desc: 'Esports tournament speed caliber. Razor sharp focus!' };
      if (ms < 250) return { title: 'Swift Response ⚡', color: 'text-emerald-450', desc: 'Highly snappy reaction. Great coordination buffers.' };
      if (ms < 350) return { title: 'Average Human 🚶', color: 'text-slate-200', desc: 'Decent feedback. Standard reaction averages round 250ms.' };
      return { title: 'Hardware Delay Device 🐢', color: 'text-rose-450', desc: 'Slow delay. Ensure your display is not introducing monitor input lag!' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic inline styles for neon animations */}
      <style>{`
        @keyframes strobePulse {
          0%, 100% { border-color: rgb(16, 185, 129); box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { border-color: rgb(34, 197, 94); box-shadow: 0 0 40px rgba(34, 197, 94, 0.7); }
        }
        .reaction-strobe {
          animation: strobePulse 1s infinite;
        }
      `}</style>

      {/* Intro info card */}
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-center justify-between game-card-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1.5 text-center md:text-left z-10">
          <p className="text-[10px] font-extrabold text-emerald-450 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest inline-flex items-center gap-1">
            <Sparkles size={11} className="animate-pulse" />
            Competitive Neural Benchmark
          </p>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase mt-1">
            ⚡ REFLEX NEURAL CHRONOS ARENA
          </h2>
          <p className="text-xs text-slate-350 max-w-xl">
            Evaluate your raw optical, acoustic, and spatial reaction speeds. Swivel through modes, hear synthesized audio cues, and build premium esports response stats.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 z-10 shrink-0">
          {/* Mute and global config options */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-500/10 text-rose-450 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title={isMuted ? "Unmute Reflex Sounds" : "Mute Reflex Sounds"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {(historyVisual.length > 0 || historyAudio.length > 0 || historyPrecision.length > 0) && (
            <button
              onClick={clearHistory}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset Session logs
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2.5 bg-[#151c33] hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 cursor-pointer transition-colors"
            title="Reset Arena Mode"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Reactive Multi-choice Mode Selector Header Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => selectMode('visual')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'visual'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-lg'
              : 'bg-[#0e1324] border-[#1e294b] text-slate-400 hover:text-slate-200 hover:bg-[#121930]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap size={16} className={mode === 'visual' ? 'text-emerald-400' : 'text-slate-400'} />
            <span className="text-xs font-black uppercase tracking-wider block">Visual reflex (Classic)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Wait for cards to switch to vibrant green, then strike the panel instantly.</p>
        </button>

        <button
          onClick={() => selectMode('audio')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'audio'
              ? 'bg-cyan-500/10 border-cyan-500/30 text-white shadow-lg'
              : 'bg-[#0e1324] border-[#1e294b] text-slate-400 hover:text-slate-200 hover:bg-[#121930]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Volume2 size={16} className={mode === 'audio' ? 'text-cyan-400' : 'text-slate-400'} />
            <span className="text-xs font-black uppercase tracking-wider block">Auditory React (Chimes)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Shut your eyes and wait. Strike as soon as you hear the high-frequency beep signal.</p>
        </button>

        <button
          onClick={() => selectMode('precision')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            mode === 'precision'
              ? 'bg-rose-500/10 border-rose-500/30 text-white shadow-lg'
              : 'bg-[#0e1324] border-[#1e294b] text-slate-400 hover:text-slate-200 hover:bg-[#121930]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Grid3X3 size={16} className={mode === 'precision' ? 'text-rose-450' : 'text-slate-400'} />
            <span className="text-xs font-black uppercase tracking-wider block">Aura coordination Grid</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Rapidly touch 5 consecutive target centers shifting coords inside a 3x3 layout.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playable Arena Block */}
        <div className="lg:col-span-8 space-y-4">
          {/* Visual Reactor Box */}
          {mode === 'visual' && (
            <>
              {testState === 'idle' && (
                <div
                  onClick={startTest}
                  className="w-full h-82 rounded-2xl border border-dashed border-slate-800 bg-[#0c0f1b]/60 hover:bg-[#12162a]/50 flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 transition-all group"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Timer size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-wide">Launch Visual Reflex Test</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                    Tap anywhere on this panel. Wait for the box to flash <span className="text-emerald-400 font-bold">VIBRANT GREEN</span>, then hit in milliseconds!
                  </p>
                </div>
              )}

              {testState === 'waiting' && (
                <div
                  onClick={handleTrigger}
                  className="w-full h-82 rounded-2xl border-2 border-rose-500/25 bg-gradient-to-tr from-[#1b1013] to-[#250d12] flex flex-col items-center justify-center text-center cursor-pointer select-none p-6"
                >
                  <span className="w-4 h-4 bg-rose-500 rounded-full animate-ping mb-3" />
                  <h3 className="text-2xl font-black text-rose-450 uppercase tracking-widest animate-pulse">WAIT FOR GREEN SIGNAL...</h3>
                  <p className="text-[11px] text-rose-400 mt-2 lowercase font-mono">Clicking prematurely results in a false-start penalty!</p>
                </div>
              )}

              {testState === 'ready' && (
                <div
                  onClick={handleTrigger}
                  className="w-full h-82 rounded-2xl border-4 text-slate-950 bg-gradient-to-tr from-emerald-450 to-green-500 flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 transform scale-[1.01] reaction-strobe"
                >
                  <h3 className="text-5xl font-black uppercase tracking-wider animate-bounce text-[#030712]">
                    STRIKE NOW!
                  </h3>
                  <p className="text-xs font-black text-emerald-950 uppercase mt-2 tracking-widest">Tap, Tap, Tap!</p>
                </div>
              )}
            </>
          )}

          {/* Audio Reactor Box */}
          {mode === 'audio' && (
            <>
              {testState === 'idle' && (
                <div
                  onClick={startTest}
                  className="w-full h-82 rounded-2xl border border-dashed border-slate-800 bg-[#0c0f1b]/60 hover:bg-[#12162a]/50 flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 transition-all group"
                >
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Volume2 size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-wide">Launch Acoustic Ear-Test</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                    Make sure your sound volume is on! Tap the screen, then rest your eyes and strike our board the absolute split-second you hear the high tone chime.
                  </p>
                </div>
              )}

              {testState === 'waiting' && (
                <div
                  onClick={handleTrigger}
                  className="w-full h-82 rounded-2xl border-2 border-slate-800 bg-[#07090f] flex flex-col items-center justify-center text-center cursor-pointer select-none p-6"
                >
                  <div className="w-9 h-9 rounded-full border-t-2 border-cyan-400 animate-spin mb-4" />
                  <h3 className="text-lg font-black text-slate-350 uppercase tracking-wider">Acoustics loading...</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs uppercase font-mono tracking-widest text-[9px]">
                    Visual indicators are hidden. Rely purely on ear response!
                  </p>
                </div>
              )}

              {testState === 'ready' && (
                <div
                  onClick={handleTrigger}
                  className="w-full h-82 rounded-2xl border-4 text-[#030712] bg-gradient-to-tr from-cyan-400 to-teal-500 flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 transform scale-[1.01] shadow-2xl"
                >
                  <h3 className="text-4xl font-black uppercase tracking-wider animate-pulse text-[#070a13]">
                    CLICK SCREEN!
                  </h3>
                  <p className="text-[10px] font-bold text-slate-900 uppercase mt-2 font-mono">BEEEEEEP TONE SOUNDING NOW</p>
                </div>
              )}
            </>
          )}

          {/* Precision Aim Reactor Grid */}
          {mode === 'precision' && (
            <>
              {testState === 'idle' && (
                <div
                  onClick={startTest}
                  className="w-full h-82 rounded-2xl border border-dashed border-slate-800 bg-[#0c0f1b]/60 hover:bg-[#12162a]/50 flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 transition-all group"
                >
                  <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Target size={28} />
                  </div>
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-wide">Launch Target Grid Frenzy</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                    This tests visual spatial coordinates & tracking. 5 flashing targets will spawn one-by-one. Strike each correct target instantly. Misclicks fail the evaluation.
                  </p>
                </div>
              )}

              {testState === 'ready' && (
                <div className="w-full h-82 bg-[#0a0d18] rounded-2xl border border-slate-850 p-4 flex flex-col items-center justify-between">
                  {/* Grid header mini status */}
                  <div className="flex justify-between items-center w-full text-xs border-b border-slate-850 pb-2">
                    <span className="text-slate-400 font-bold">🎯 TARGET AIM HIT SPEED</span>
                    <span className="font-mono text-pink-400 font-extrabold bg-pink-500/10 px-2.5 py-0.5 rounded">
                      HIT: {precisionClicksCompleted} / 5
                    </span>
                  </div>

                  {/* 3x3 target canvas */}
                  <div className="grid grid-cols-3 gap-3 w-max mx-auto my-auto p-1">
                    {precisionTargets.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handlePrecisionNodeClick(item.id)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border flex items-center justify-center transition-all ${
                          item.active
                            ? 'bg-rose-500 text-white border-rose-450 shadow-lg shadow-rose-500/30 scale-105 active:scale-95 animate-pulse'
                            : 'bg-slate-900/60 border-slate-850 text-slate-700 hover:border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        {item.active ? (
                          <Target size={26} className="text-white animate-spin" />
                        ) : (
                          <span className="text-slate-800 font-mono text-sm">•</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Misclicks fail immediately</span>
                </div>
              )}
            </>
          )}

          {/* Result announcement state */}
          {testState === 'result' && (
            <div
              onClick={startTest}
              className="w-full h-82 rounded-2xl border border-emerald-500/20 bg-gradient-to-tr from-[#0b1419] via-[#09111e] to-[#0c1c22] flex flex-col items-center justify-center text-center cursor-pointer select-none p-6 game-card-glow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <Award size={48} className="text-emerald-450 mb-2 animate-bounce" />
              <p className="text-xs text-slate-450 font-black uppercase tracking-widest">Reaction score computed</p>
              
              <h1 className="text-5xl font-black text-white font-mono mt-1">
                {reactionMs} <span className="text-lg font-bold text-slate-400">ms</span>
              </h1>
              
              {reactionMs && (
                <div className="mt-4 p-2.5 px-4 bg-slate-900/80 rounded-xl border border-slate-850 max-w-sm">
                  <p className={`text-sm font-black font-sans uppercase tracking-wide ${getReactionRank(reactionMs).color}`}>
                    {getReactionRank(reactionMs).title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium px-2">
                    {getReactionRank(reactionMs).desc}
                  </p>
                </div>
              )}
              
              <p className="text-[11px] text-emerald-400 mt-4 font-bold uppercase tracking-widest">
                👉 Click anywhere on this panel to test again
              </p>
            </div>
          )}

          {/* Fail early / error announcement state */}
          {testState === 'fail' && (
            <div
              onClick={startTest}
              className="w-full h-82 rounded-2xl border border-amber-500/20 bg-gradient-to-tr from-[#1f1614] to-[#12080a] flex flex-col items-center justify-center text-center cursor-pointer select-none p-6"
            >
              <HeartCrack size={44} className="text-amber-400 mb-2" />
              <h3 className="text-xl font-extrabold text-amber-400 uppercase tracking-wide">
                False Start / Misclick!
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mt-2 mb-4 leading-relaxed">
                {mode === 'precision' 
                  ? 'Your aim coordinates drifted! You clicked the incorrect tile coordinate during reaction frenzy.'
                  : 'You struck the panel prior to the proper stimulus triggers. Maintain perfect mechanical patience!'
                }
              </p>
              <button
                onClick={startTest}
                className="py-2.5 px-6 rounded-xl bg-amber-500 text-[#070a13] text-xs font-black uppercase tracking-wider transition-transform hover:scale-105 cursor-pointer"
              >
                Restart Reflex Run
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Esports statistics tracker */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1e294b] pb-2">
              <Activity size={14} className="text-emerald-400" />
              Session Dash Metrics
            </h3>

            {/* Streak metrics */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-[#151c33]/40 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-0.5">Active Streak</span>
                <span className="text-base font-mono font-extrabold text-orange-400 flex items-center justify-center gap-1">
                  <Flame size={14} />
                  {sessionStreak}
                </span>
              </div>
              <div className="p-3 bg-[#151c33]/40 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-0.5">Peak Session Streak</span>
                <span className="text-base font-mono font-extrabold text-white flex items-center justify-center gap-1">
                  <Trophy size={14} className="text-yellow-405" />
                  {peakStreak}
                </span>
              </div>
            </div>

            {/* Averages readout based on mode */}
            <div className="p-3.5 bg-slate-900/50 rounded-xl border border-slate-850 space-y-2.5">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">
                📊 Mode Metrics: {mode.toUpperCase()}
              </span>
              
              <div className="grid grid-cols-2 gap-1 text-center font-mono">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Shortest Response</span>
                  <span className="text-sm font-black text-white">
                    {bestReaction ? `${bestReaction} ms` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase block">Session Mean</span>
                  <span className="text-sm font-black text-emerald-400">
                    {averageReaction ? `${averageReaction} ms` : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progressive CSS-based scatter / performance graph */}
            {currentHistory.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest block">
                  📈 Reflected Milliseconds Chart
                </span>
                
                <div className="flex h-16 items-end gap-1.5 bg-[#090b14] border border-slate-850 p-2 rounded-lg">
                  {[...currentHistory].reverse().map((ms, idx) => {
                    // Normalize relative bar size with respect to 500ms max scale
                    const computedPct = Math.min(100, Math.max(10, ((500 - ms) / 450) * 100));
                    return (
                      <div 
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-sm hover:from-cyan-400 hover:to-cyan-200 transition-all cursor-pointer relative group-item"
                        style={{ height: `${computedPct}%` }}
                        title={`Round: ${ms}ms`}
                      >
                        {/* Custom tooltip */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#03060f] border border-[#1e294b] text-[8px] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 text-white font-mono">
                          {ms}ms
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historical Table list */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-400 font-bold uppercase block">Session Runs History:</span>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {currentHistory.length === 0 ? (
                  <p className="text-[9px] text-slate-500 text-center py-4">No reflexes evaluated for this session.</p>
                ) : (
                  currentHistory.map((ms, index) => (
                    <div key={index} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-850 text-[11px] font-mono">
                      <span className="text-slate-500 text-[10px]">Trial #{currentHistory.length - index}</span>
                      <span className={ms < 180 ? 'text-emerald-400 font-bold' : ms < 250 ? 'text-cyan-400' : 'text-slate-350'}>
                        {ms} ms
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 bg-[#151c33]/40 rounded-xl border border-slate-850 text-[10px] text-slate-450 flex items-start gap-1.5 leading-relaxed">
              <ShieldAlert size={12} className="text-emerald-400 shrink-0 mt-0.5" />
              <p>Optimum visual response sits around 180ms. Test on high physical refresh-rate (144Hz+) displays for precise hardware performance!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
