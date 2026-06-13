import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ShieldAlert, Disc, HelpCircle } from 'lucide-react';

interface MountedPin {
  angle: number; // current angle in radians
}

export default function CoreballGame() {
  const [level, setLevel] = useState(1);
  const [pinsLeft, setPinsLeft] = useState(8);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'victory'>('idle');
  const [score, setScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const angleRef = useRef(0); // rotation angle of core
  const pinsRef = useRef<MountedPin[]>([
    { angle: 0 },
    { angle: Math.PI / 2 },
    { angle: Math.PI },
    { angle: (3 * Math.PI) / 2 }
  ]); // initial core pins

  const requestRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Sound generator
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playPinSound = (vibe: 'shoot' | 'crash' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (vibe === 'shoot') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
      } else if (vibe === 'crash') {
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(80, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const initLevel = (lvl: number) => {
    setLevel(lvl);
    const pinsToShoot = 6 + lvl * 2; // more pins per level
    setPinsLeft(pinsToShoot);
    setGameState('playing');
    isPlayingRef.current = true;
    
    // Core pins configuration
    pinsRef.current = [
      { angle: 0 },
      { angle: Math.PI / 3 },
      { angle: (2 * Math.PI) / 3 },
      { angle: Math.PI },
      { angle: (4 * Math.PI) / 3 },
      { angle: (5 * Math.PI) / 3 }
    ].slice(0, Math.min(6, 3 + lvl)); // configure density based on level
  };

  const startGame = () => {
    setScore(0);
    initLevel(1);
  };

  // Firing action
  const firePin = () => {
    if (gameState !== 'playing' || pinsLeft <= 0) return;

    playPinSound('shoot');

    // The pin will target the central core wheel at exact contact angle (usually pointing straight up, which is 3*Math.PI/2, or pointing down from 3*Math.PI/2 depending on canvas layout). Let's say we fire from the bottom straight up, so the contact is at angle level Math.PI / 2 of the wheel.
    const contactAngle = (Math.PI / 2) - angleRef.current;
    
    // Normalize angle to 0 - 2*Math.PI
    const normAngle = ((contactAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Collision detection with existing pins on the core!
    const collisionThreshold = 0.14; // in radians (~8 degrees spacing buffer)
    let isCollide = false;

    for (const pin of pinsRef.current) {
      const pinNorm = ((pin.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const diff = Math.abs(pinNorm - normAngle);
      const cyclDiff = Math.min(diff, Math.PI * 2 - diff);
      
      if (cyclDiff < collisionThreshold) {
        isCollide = true;
        break;
      }
    }

    if (isCollide) {
      // Boom! Crash game over
      playPinSound('crash');
      setGameState('gameover');
      isPlayingRef.current = false;
    } else {
      // Successfully attach pin
      pinsRef.current.push({ angle: contactAngle });
      setScore((s) => s + 10);
      
      setPinsLeft((left) => {
        const nextLeft = left - 1;
        if (nextLeft === 0) {
          // Cleared Level!
          playPinSound('win');
          setGameState('victory');
          isPlayingRef.current = false;
        }
        return nextLeft;
      });
    }
  };

  // Keyboard Spacebar Firing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'playing') {
          e.preventDefault();
          firePin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pinsLeft]);

  // Main canvas rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cX = canvas.width / 2;
      const cY = 180; // center of central rotating node
      const rCore = 40; // core circle radius
      const lenStem = 80;

      // Update rotation angle
      if (gameState === 'playing') {
        // level speed adjusts rotation
        const speed = 0.015 + level * 0.005; 
        angleRef.current += speed;
      }

      // 1. Draw central rotating big core node
      ctx.beginPath();
      ctx.arc(cX, cY, rCore, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981'; // green Coreball
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Show level number centered in core
      ctx.fillStyle = '#090d16';
      ctx.font = 'bold 22px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(level.toString(), cX, cY);

      // 2. Draw all mounted needles / pins pointing out
      pinsRef.current.forEach((pin) => {
        // calculate absolute tip point
        const currAngle = pin.angle + angleRef.current;
        const stemX = cX + Math.cos(currAngle) * lenStem;
        const stemY = cY + Math.sin(currAngle) * lenStem;

        // Draw pin line
        ctx.beginPath();
        ctx.moveTo(cX + Math.cos(currAngle) * rCore, cY + Math.sin(currAngle) * rCore);
        ctx.lineTo(stemX, stemY);
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw little node at tip of needle
        ctx.beginPath();
        ctx.arc(stemX, stemY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f3f4f6';
        ctx.fill();
      });

      // 3. Draw incoming needles queue at the bottom ready to shoot
      if (gameState === 'playing') {
        const startY = 320;
        const spacing = 22;
        // Draw primary needle pointing straight towards core
        ctx.beginPath();
        ctx.moveTo(cX, startY);
        ctx.lineTo(cX, cY + lenStem + 20);
        ctx.strokeStyle = '#f59e0b'; // amber preview
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cX, startY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Draw following nodes as simple circles
        for (let i = 1; i < Math.min(pinsLeft, 5); i++) {
          ctx.beginPath();
          ctx.arc(cX, startY + i * spacing, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();
        }
      }

      if (isPlayingRef.current || gameState === 'gameover') {
        requestRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, pinsLeft, level]);

  const handleNextLevel = () => {
    initLevel(level + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            <span>🎮 Canvas Arcade physics</span>
          </p>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">COREBALL CHALLENGE</h2>
          <p className="text-xs text-slate-400">Launch incoming pins into the central rotating hub! Overlapping other pins causes immediate gameover.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <div className="bg-[#151c33] border border-[#1e294b] px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Score</span>
            <span className="text-xs font-mono font-bold text-white">{score} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playable Core Canvas area */}
        <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1e294b] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden h-[450px]">
          {gameState === 'idle' ? (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Disc size={36} className="text-emerald-400" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Launch Coreball Applet</h2>
              <p className="text-xs text-slate-400">Attach needle pins to the central core without overlaps. It gets progressively faster!</p>
              <button
                onClick={startGame}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all"
              >
                Inaugurate Level 1
              </button>
            </div>
          ) : (
            <>
              {/* Canvas element */}
              <canvas
                ref={canvasRef}
                width={360}
                height={400}
                onClick={firePin}
                className="cursor-pointer select-none bg-[#090d16] rounded-xl border border-slate-850"
              />

              {/* Status HUD elements on top of raw canvas */}
              <div className="absolute top-6 left-6 text-xs text-left">
                <p className="text-slate-400">LEVEL <strong className="text-white">{level}</strong></p>
                <p className="text-slate-500 font-mono">Pins remaining: {pinsLeft}</p>
              </div>

              <div className="absolute top-6 right-6 text-xs text-right text-slate-400 pointer-events-none">
                <p className="font-bold">SPACEBAR or CLICK</p>
                <p className="text-[10px] text-slate-500 font-mono">triggers a firing sequence</p>
              </div>

              {/* Game Over Display */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-10 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-2">
                    <RotateCcw className="text-rose-450 animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-extrabold text-rose-500 uppercase">Core Pins Intersected!</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Level {level} collision detected. Try aiming for wider open wedges!</p>
                  <div className="flex gap-2.5 w-full max-w-xs">
                    <button
                      onClick={() => initLevel(level)}
                      className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={startGame}
                      className="flex-1 py-2.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl"
                    >
                      Restart From Level 1
                    </button>
                  </div>
                </div>
              )}

              {/* Victory Display */}
              {gameState === 'victory' && (
                <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center p-6 text-center z-10 animate-fadeIn">
                  <span className="text-5xl animate-bounce">🏆⭐</span>
                  <h3 className="text-xl font-extrabold text-emerald-400 uppercase mt-2">Level Finished!</h3>
                  <p className="text-xs text-emerald-300 mt-1 mb-4">You completed Level {level} with zero collisions.</p>
                  <button
                    onClick={handleNextLevel}
                    className="w-full max-w-xs py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase rounded-xl transition-all"
                  >
                    Proceed to Level {level + 1}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right rules/details panel */}
        <div className="lg:col-span-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1e294b] pb-2">
            <HelpCircle size={15} className="text-emerald-400" /> Game Rules
          </h3>

          <div className="text-xs text-slate-300 space-y-3">
            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1">
              <p className="font-bold text-emerald-400 uppercase">OBJECTIVE:</p>
              <p>Launch all yellow pins from your bottom tray securely into the green rotating Coreball without overlapping any already attached needles.</p>
            </div>

            <div className="p-3 bg-[#151c33] rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-slate-200 uppercase">CONTROLS:</p>
              <p>1. Press the <span className="font-bold text-white uppercase font-mono bg-slate-850 px-1.5 py-0.5 rounded border border-transparent">SPACEBAR</span> or <span className="font-bold text-white uppercase font-mono bg-slate-850 px-1.5 py-0.5 rounded border border-transparent">ENTER</span> key to shoot.</p>
              <p>2. Alternatively, tap anywhere inside the game canvas directly to shoot!</p>
            </div>
          </div>

          <div className="p-3 bg-[#12182c]/40 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[11px] text-slate-500">
            <ShieldAlert size={14} className="text-slate-600 shrink-0 mt-0.5" />
            <p>Each ascending level speeds up the wheel spinning rate and starts with more needles pre-stuck onto the core to squeeze your margin of error!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
