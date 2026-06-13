import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Play, 
  Trophy, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Grid3X3,
  Moon,
  Clock,
  Undo2
} from 'lucide-react';

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
}

interface FloatingScore {
  id: string;
  val: number;
}

type FlavorProfile = 'cupcakes' | 'candies' | 'doughnuts';

interface FlavorDetail {
  name: string;
  emoji: string;
  color: string;
  desc: string;
  bgGrad: string;
}

const THEME_FLAVORS: Record<FlavorProfile, Record<number, FlavorDetail>> = {
  cupcakes: {
    2: { name: 'Vanilla Sparkle', emoji: '🧁', color: 'text-indigo-400 border-indigo-500/30', bgGrad: 'from-indigo-950/40 to-indigo-900/30', desc: 'Starting simple!' },
    4: { name: 'Velvet Fudge', emoji: '🍩', color: 'text-violet-300 border-violet-500/40', bgGrad: 'from-violet-950/40 to-violet-900/40', desc: 'Slight chocolate upgrade.' },
    8: { name: 'Ruby Gloss', emoji: '🍰', color: 'text-pink-300 border-pink-500/40', bgGrad: 'from-pink-950/40 to-pink-900/40', desc: 'Sweet raspberry glaze.' },
    16: { name: 'Matcha Whip', emoji: '🍵', color: 'text-emerald-350 border-emerald-500/40', bgGrad: 'from-emerald-950/40 to-emerald-900/40', desc: 'Clean organic power!' },
    32: { name: 'Caramel Lava', emoji: '🍯', color: 'text-amber-300 border-amber-500/40', bgGrad: 'from-amber-950/40 to-amber-900/40', desc: 'Hot molten core.' },
    64: { name: 'Cosmic Mint', emoji: '🍧', color: 'text-cyan-300 border-cyan-500/40', bgGrad: 'from-cyan-950/40 to-cyan-900/40', desc: 'Refreshing moon rock flavor.' },
    128: { name: 'Pecan Glaze', emoji: '🥜', color: 'text-yellow-250 border-yellow-600/40', bgGrad: 'from-yellow-950/40 to-yellow-900/40', desc: 'Roasted nut crunch.' },
    256: { name: 'Oreo Blast', emoji: '🍪', color: 'text-slate-200 border-slate-500/50', bgGrad: 'from-slate-900 to-slate-800', desc: 'Double chocolate cookies!' },
    512: { name: 'Golden Glitter', emoji: '👑', color: 'text-amber-400 border-yellow-500/60 glow-green', bgGrad: 'from-amber-900/50 to-yellow-800/40', desc: 'Decorated gold leaf glaze!' },
    1024: { name: 'Truffle Overlord', emoji: '💎', color: 'text-purple-300 border-purple-500/70', bgGrad: 'from-purple-950/60 to-indigo-950/50', desc: 'Extravagant luxury sweet.' },
    2048: { name: 'Sovereign Emperor', emoji: '🦄', color: 'text-rose-350 border-rose-500/80 animate-pulse', bgGrad: 'from-rose-950/70 via-fuchsia-950/60 to-slate-950', desc: 'Mouthwatering master achievement!' }
  },
  candies: {
    2: { name: 'Sour Gummy', emoji: '🍬', color: 'text-emerald-400 border-emerald-500/30', bgGrad: 'from-emerald-950/30 to-teal-900/20', desc: 'Zesty tingle!' },
    4: { name: 'Plum Drop', emoji: '🍭', color: 'text-pink-300 border-pink-500/30', bgGrad: 'from-pink-950/30 to-purple-900/20', desc: 'Sugar boiled fruit gem.' },
    8: { name: 'Licorice Twist', emoji: '🍢', color: 'text-amber-200 border-amber-500/30', bgGrad: 'from-amber-950/30 to-orange-950/20', desc: 'Distinct deep molasses flavor.' },
    16: { name: 'Peppermint Swirl', emoji: '🍥', color: 'text-red-400 border-red-500/30', bgGrad: 'from-red-950/30 to-rose-900/25', desc: 'Refreshing cold holiday notes.' },
    32: { name: 'Berry Jelly', emoji: '🍇', color: 'text-violet-300 border-violet-500/40', bgGrad: 'from-violet-950/30 to-purple-900/30', desc: 'Juicy jelly chewiness.' },
    64: { name: 'Lemon Crystal', emoji: '🍋', color: 'text-yellow-300 border-yellow-500/30', bgGrad: 'from-yellow-950/30 to-amber-950/20', desc: 'Crisp citrus crust.' },
    128: { name: 'Toffee Fudge', emoji: '🍫', color: 'text-amber-450 border-amber-600/40', bgGrad: 'from-orange-980/30 to-yellow-980/20', desc: 'Warm cream crunch.' },
    256: { name: 'Marshmallow Puff', emoji: '🍡', color: 'text-teal-300 border-teal-500/30', bgGrad: 'from-teal-950/30 to-slate-900/30', desc: 'Soft and cloud-like.' },
    512: { name: 'Golden Honeycomb', emoji: '🍯', color: 'text-yellow-400 border-yellow-500/50', bgGrad: 'from-yellow-900/40 to-slate-950/40', desc: 'Sweet golden hive extraction.' },
    1024: { name: 'Cotton Galaxy', emoji: '🌌', color: 'text-cyan-300 border-cyan-550/50', bgGrad: 'from-cyan-950/40 to-violet-950/40', desc: 'Whipped cloud dust!' },
    2048: { name: 'Candy Sovereign', emoji: '👑', color: 'text-indigo-300 border-indigo-500/80 animate-bounce', bgGrad: 'from-indigo-950 to-slate-950', desc: 'Sugar perfection achieved!' }
  },
  doughnuts: {
    2: { name: 'Strawberry Ring', emoji: '🍩', color: 'text-pink-300 border-pink-500/30', bgGrad: 'from-pink-950/30 to-slate-900/30', desc: 'Feminine pink sprinkles!' },
    4: { name: 'Choco Frosted', emoji: '🥯', color: 'text-amber-300 border-amber-850/40', bgGrad: 'from-amber-980/30 to-stone-900/30', desc: 'Double premium cocoa glaze.' },
    8: { name: 'Matcha Custard', emoji: '🍵', color: 'text-emerald-450 border-emerald-500/30', bgGrad: 'from-emerald-950/30 to-indigo-950/20', desc: 'Filled with green tea velvet.' },
    16: { name: 'Cinnamon Swirl', emoji: '🥨', color: 'text-orange-350 border-orange-500/30', bgGrad: 'from-orange-950/30 to-yellow-950/20', desc: 'Baked sugar glaze swirl.' },
    32: { name: 'Blueberry Velvet', emoji: '🫐', color: 'text-blue-300 border-blue-500/40', bgGrad: 'from-blue-950/30 to-cyan-950/25', desc: 'Wild forest berry icing.' },
    64: { name: 'Golden Beignet', emoji: '🥞', color: 'text-amber-400 border-amber-500/40', bgGrad: 'from-yellow-950/30 to-amber-900/20', desc: 'Dusted with organic ice sugar.' },
    128: { name: 'Salted Caramel', emoji: '🍮', color: 'text-yellow-500 border-yellow-600/40', bgGrad: 'from-amber-900/20 to-orange-900/20', desc: 'Savoury dark syrup pull.' },
    256: { name: 'Mochi Special', emoji: '🍡', color: 'text-red-300 border-red-500/40', bgGrad: 'from-red-950/30 to-slate-900/30', desc: 'Chewy Japanese formulation.' },
    512: { name: 'Royal Custard', emoji: '🍨', color: 'text-yellow-300 border-yellow-450/40 glow-green', bgGrad: 'from-yellow-950/40 to-slate-950', desc: 'Elite high cream pastry.' },
    1024: { name: 'Ruby Confetti', emoji: '❇️', color: 'text-fuchsia-400 border-fuchsia-500/50', bgGrad: 'from-fuchsia-950/30 to-purple-950/30', desc: 'Glossed in birthday sparkles.' },
    2048: { name: 'Doughnut Sovereign', emoji: '🌌', color: 'text-rose-400 border-rose-550/70', bgGrad: 'from-rose-950 to-stone-950', desc: 'The absolute ruler of pastries!' }
  }
};

export default function Cupcakes2048() {
  const [flavor, setFlavor] = useState<FlavorProfile>('cupcakes');
  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('2048_best') || '0', 10);
  });
  
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  
  // Game metrics tracking
  const [movesCount, setMovesCount] = useState(0);
  const [mergesCount, setMergesCount] = useState(0);
  const [highestValue, setHighestValue] = useState(2);
  const [combosActive, setCombosActive] = useState(0);

  // Undo memory (holds up to 10 previous steps)
  const [undoHistory, setUndoHistory] = useState<{ grid: number[][]; score: number; moves: number; merges: number; combo: number }[]>([]);

  // Keyboard visuals highlighting
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Procedural Web Audio Synthesizer
  const playSound = useCallback((type: 'move' | 'merge' | 'gameover' | 'victory' | 'undo') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'merge') {
        osc.type = 'triangle';
        // Delightful bubbly chime sound
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.08); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start();
        osc.stop(now + 0.28);
      } else if (type === 'undo') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.51);
        osc.start();
        osc.stop(ctx.currentTime + 0.51);
      } else if (type === 'victory') {
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start();
        osc.stop(now + 0.45);
      }
    } catch (e) {
      // safe fallback for browser security blockers
    }
  }, [isMuted]);

  // Spawn random tile
  const spawnNewTile = (targetGrid: number[][]) => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (targetGrid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length === 0) return targetGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    const updated = targetGrid.map((rowArr) => [...rowArr]);
    updated[r][c] = val;
    return updated;
  };

  // Initialize fresh round
  const createNewGame = useCallback(() => {
    let freshGrid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    freshGrid = spawnNewTile(spawnNewTile(freshGrid));
    setGrid(freshGrid);
    setScore(0);
    setMovesCount(0);
    setMergesCount(0);
    setHighestValue(2);
    setCombosActive(0);
    setUndoHistory([]);
    setGameOver(false);
    setVictory(false);
    playSound('move');
  }, [playSound]);

  useEffect(() => {
    createNewGame();
  }, [createNewGame]);

  // Save best score to localStorage
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      try {
        localStorage.setItem('2048_best', score.toString());
      } catch (e) {}
    }
  }, [score, bestScore]);

  // Compress Row
  const compress = (row: number[]): { compressed: number[]; scoreGained: number; merges: number; peakVal: number } => {
    let clean = row.filter((val) => val !== 0);
    let finalRow = [];
    let scoreGained = 0;
    let merges = 0;
    let peakVal = 0;
    
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === clean[i + 1] && clean[i] !== undefined) {
        const newVal = clean[i] * 2;
        finalRow.push(newVal);
        scoreGained += newVal;
        merges += 1;
        if (newVal > peakVal) peakVal = newVal;
        i++; // skip next since it merged
        if (newVal === 2048) {
          setVictory(true);
        }
      } else {
        finalRow.push(clean[i]);
        if (clean[i] > peakVal) peakVal = clean[i];
      }
    }

    while (finalRow.length < 4) {
      finalRow.push(0);
    }
    return { compressed: finalRow, scoreGained, merges, peakVal };
  };

  const rotateLeft = (currGrid: number[][]): number[][] => {
    let rotated = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        rotated[3 - c][r] = currGrid[r][c];
      }
    }
    return rotated;
  };

  const triggerScorePopup = (val: number) => {
    const id = Math.random().toString();
    setFloatingScores((prev) => [...prev, { id, val }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  const handleMove = (dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    
    let currentGrid = grid.map((r) => [...r]);
    let shiftedGrid = currentGrid;
    let totalScoreGained = 0;
    let moveMerges = 0;
    let localHighest = highestValue;
    
    // Rotate grid to process all directional swipes as "left compress" moves
    if (dir === 'left') {
      const results = shiftedGrid.map((row) => compress(row));
      shiftedGrid = results.map((res) => res.compressed);
      totalScoreGained = results.reduce((acc, curr) => acc + curr.scoreGained, 0);
      moveMerges = results.reduce((acc, curr) => acc + curr.merges, 0);
      const peaks = results.map(r => r.peakVal);
      localHighest = Math.max(localHighest, ...peaks);
    } 
    else if (dir === 'right') {
      // Reverse each row, compress, then reverse back
      const results = shiftedGrid.map((row) => {
        const { compressed, scoreGained, merges, peakVal } = compress([...row].reverse());
        return { compressed: compressed.reverse(), scoreGained, merges, peakVal };
      });
      shiftedGrid = results.map((res) => res.compressed);
      totalScoreGained = results.reduce((acc, curr) => acc + curr.scoreGained, 0);
      moveMerges = results.reduce((acc, curr) => acc + curr.merges, 0);
      const peaks = results.map(r => r.peakVal);
      localHighest = Math.max(localHighest, ...peaks);
    } 
    else if (dir === 'up') {
      // Rotate left, compress, rotate back right
      let rot = rotateLeft(shiftedGrid);
      const results = rot.map((row) => compress(row));
      rot = results.map((res) => res.compressed);
      totalScoreGained = results.reduce((acc, curr) => acc + curr.scoreGained, 0);
      moveMerges = results.reduce((acc, curr) => acc + curr.merges, 0);
      const peaks = results.map(r => r.peakVal);
      localHighest = Math.max(localHighest, ...peaks);
      shiftedGrid = rotateLeft(rotateLeft(rotateLeft(rot)));
    } 
    else if (dir === 'down') {
      // Rotate right (aka rotate left 3 times), compress, rotate left
      let rot = rotateLeft(rotateLeft(rotateLeft(shiftedGrid)));
      const results = rot.map((row) => compress(row));
      rot = results.map((res) => res.compressed);
      totalScoreGained = results.reduce((acc, curr) => acc + curr.scoreGained, 0);
      moveMerges = results.reduce((acc, curr) => acc + curr.merges, 0);
      const peaks = results.map(r => r.peakVal);
      localHighest = Math.max(localHighest, ...peaks);
      shiftedGrid = rotateLeft(rot);
    }

    // Check if grid actually changed
    let hasChanged = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (shiftedGrid[r][c] !== grid[r][c]) {
          hasChanged = true;
          break;
        }
      }
    }

    if (hasChanged) {
      // Capture undo state prior to shifting
      setUndoHistory((prev) => {
        const entry = {
          grid: grid.map((r) => [...r]),
          score: score,
          moves: movesCount,
          merges: mergesCount,
          combo: combosActive
        };
        return [entry, ...prev].slice(0, 10);
      });

      const spawnGrid = spawnNewTile(shiftedGrid);
      setGrid(spawnGrid);
      
      if (totalScoreGained > 0) {
        setScore((prev) => prev + totalScoreGained);
        triggerScorePopup(totalScoreGained);
        playSound('merge');
        setCombosActive((prev) => prev + 1);
      } else {
        playSound('move');
        setCombosActive(0);
      }

      setMovesCount((prev) => prev + 1);
      setMergesCount((prev) => prev + moveMerges);
      if (localHighest > highestValue) {
        setHighestValue(localHighest);
      }

      checkGameOver(spawnGrid);
    }
  };

  const checkGameOver = (g: number[][]) => {
    // Check empty cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return;
      }
    }
    // Check adjacent matches
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (r < 3 && g[r][c] === g[r + 1][c]) return;
        if (c < 3 && g[r][c] === g[r][c + 1]) return;
      }
    }
    setGameOver(true);
    playSound('gameover');
  };

  const handleUndo = () => {
    if (undoHistory.length === 0) return;
    const previous = undoHistory[0];
    setGrid(previous.grid);
    setScore(previous.score);
    setMovesCount(previous.moves);
    setMergesCount(previous.merges);
    setCombosActive(previous.combo);
    setUndoHistory((prev) => prev.slice(1));
    setGameOver(false);
    playSound('undo');
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault(); // prevent viewport scrolling
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          setPressedKey('left');
          handleMove('left');
          break;
        case 'ArrowRight':
          setPressedKey('right');
          handleMove('right');
          break;
        case 'ArrowUp':
          setPressedKey('up');
          handleMove('up');
          break;
        case 'ArrowDown':
          setPressedKey('down');
          handleMove('down');
          break;
        default:
          break;
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [grid, gameOver, highestValue, movesCount, mergesCount, combosActive, score, undoHistory]);

  return (
    <div className="space-y-6">
      {/* CSS Custom Keyframe rules injected dynamically for score floating and slide popups */}
      <style>{`
        @keyframes floatScore {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-48px) scale(0.85); opacity: 0; }
        }
        .animate-float-score {
          animation: floatScore 0.8s ease-out forwards;
        }
        @keyframes popUp {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-up {
          animation: popUp 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* Intro info card */}
      <div className="bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-center justify-between game-card-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1.5 text-center md:text-left z-10">
          <p className="text-[10px] font-extrabold text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20 uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles size={11} className="animate-spin text-pink-400" strokeWidth={3} />
            Arcade Master Merger
          </p>
          <h2 className="text-2xl font-black text-white tracking-wide uppercase mt-1">
            🧁 CUPCAKES & DESSERTS 2048
          </h2>
          <p className="text-xs text-slate-350 max-w-xl">
            Slide and combine scrumptious bakery treats to unleash the royal <span className="text-pink-400 font-bold">2048 Sovereign Dessert</span>! Harness high-fidelity undo actions, customized flavor skins, and programmatic retro chimes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 z-10 shrink-0">
          <div className="text-center bg-[#151c33] border border-slate-800 px-3.5 py-1.5 rounded-xl min-w-[75px] relative">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Score</span>
            <span className="text-lg font-mono font-extrabold text-[#f3f4f6]">{score}</span>
            {/* Float values popup elements */}
            {floatingScores.map((fs) => (
              <span 
                key={fs.id} 
                className="absolute left-1/2 -top-4 -translate-x-1/2 font-mono font-black text-pink-400 text-sm animate-float-score"
              >
                +{fs.val}
              </span>
            ))}
          </div>

          <div className="text-center bg-[#151c33] border border-slate-800 px-3.5 py-1.5 rounded-xl min-w-[75px]">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Best</span>
            <span className="text-lg font-mono font-extrabold text-[#10b981]">{bestScore}</span>
          </div>

          {/* Sound, Undo & Reset toolkit row */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMuted 
                  ? 'bg-rose-500/10 text-rose-450 border-rose-500/20 hover:bg-rose-500/20' 
                  : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              onClick={handleUndo}
              disabled={undoHistory.length === 0}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                undoHistory.length === 0
                  ? 'bg-slate-900/30 text-slate-600 border-slate-850 cursor-not-allowed'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-550/20 hover:bg-emerald-500/20'
              }`}
              title={`Undo Last Move (${undoHistory.length} left)`}
            >
              <div className="flex items-center gap-1">
                <Undo2 size={15} />
                <span className="text-[10px] font-bold font-mono">{undoHistory.length}</span>
              </div>
            </button>

            <button
              onClick={createNewGame}
              className="p-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 rounded-xl border border-pink-500/20 transition-all font-bold cursor-pointer"
              title="Reset Game"
            >
              <RefreshCw size={15} className="animate-hover-spin" />
            </button>
          </div>
        </div>
      </div>

      {/* Control config deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Customization Switcher */}
        <div className="p-4 bg-[#0e1324] border border-[#1e294b] rounded-2xl flex flex-col justify-between">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-2">
            🎨 Select Flavor Theme
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['cupcakes', 'candies', 'doughnuts'] as FlavorProfile[]).map((prf) => (
              <button
                key={prf}
                onClick={() => {
                  setFlavor(prf);
                  playSound('move');
                }}
                className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  flavor === prf 
                    ? 'bg-pink-500/15 border-pink-500/30 text-pink-400 shadow-sm'
                    : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:text-slate-200'
                }`}
              >
                {prf === 'cupcakes' && '🧁 Bakery'}
                {prf === 'candies' && '🍬 Candy'}
                {prf === 'doughnuts' && '🍩 Donuts'}
              </button>
            ))}
          </div>
        </div>

        {/* Combos tracker */}
        <div className="p-4 bg-[#0e1324] border border-[#1e294b] rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Active merges streak</span>
            <p className="text-xl font-mono font-black text-pink-400 mt-1 flex items-center gap-2">
              <Flame size={18} className={combosActive > 0 ? "text-orange-450 animate-pulse" : "text-slate-600"} />
              {combosActive} Combos
            </p>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Continuous merge hits</span>
        </div>

        {/* Metrics readout */}
        <div className="p-4 bg-[#0e1324] border border-[#1e294b] rounded-2xl grid grid-cols-3 gap-2 text-center">
          <div className="p-1 px-1.5 bg-[#151c33]/40 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Moves</span>
            <span className="text-xs font-mono font-black text-rose-350">{movesCount}</span>
          </div>
          <div className="p-1 px-1.5 bg-[#151c33]/40 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Merges</span>
            <span className="text-xs font-mono font-black text-indigo-350">{mergesCount}</span>
          </div>
          <div className="p-1 px-1.5 bg-[#151c33]/40 rounded-xl border border-slate-850">
            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Peak Dessert</span>
            <span className="text-xs font-mono font-black text-emerald-450">{highestValue}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playable Grid */}
        <div id="cupcake-arena" className="lg:col-span-7 bg-[#0e1324] border border-[#1e294b] rounded-2xl p-4 md:p-6 relative">
          <div className="grid grid-cols-4 gap-3 bg-[#0a0d18] p-3.5 rounded-xl border border-slate-850/80">
            {grid.map((row, rIdx) => (
              row.map((val, cIdx) => {
                const spec = THEME_FLAVORS[flavor][val] || THEME_FLAVORS['cupcakes'][val];
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 md:p-2 text-center transition-all duration-200 select-none relative overflow-hidden ${
                      val === 0 
                        ? 'bg-[#12182c]/15 border-slate-850/40 text-transparent' 
                        : `bg-gradient-to-tr ${spec?.bgGrad || 'from-slate-900 to-slate-800'} ${spec?.color || 'text-slate-200 border-slate-700'} animate-pop-up`
                    }`}
                  >
                    {val > 0 ? (
                      <>
                        <span className="text-2xl md:text-3.5xl filter drop-shadow animate-pulse">{spec?.emoji}</span>
                        <span className="text-[9px] md:text-[11px] font-black tracking-wide leading-tight mt-1.5 truncate max-w-full">
                          {spec?.name}
                        </span>
                        <div className="absolute bottom-1 right-2 bg-black/30 px-1 py-0.5 rounded text-[8px] md:text-[9px] font-mono font-extrabold text-neutral-300">
                          {val}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-800 font-mono text-sm">•</span>
                    )}
                  </div>
                );
              })
            ))}
          </div>

          {/* Interactive virtual keyboard arrow map */}
          <div className="mt-5 flex flex-col items-center justify-between gap-4 p-4 bg-[#090c16]/80 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
              🕹️ Controller Desk (Tap Buttons or Use Arrow Keys)
            </span>
            <div className="flex flex-col items-center gap-1.5">
              {/* Up */}
              <button
                onClick={() => handleMove('up')}
                className={`w-14 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all border ${
                  pressedKey === 'up'
                    ? 'bg-pink-500/20 border-pink-550 text-pink-400 shadow shadow-pink-500/20 transform scale-95'
                    : 'bg-[#151c33] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>▲</span>
                <span className="text-[8px] text-slate-500 font-mono">UP</span>
              </button>
              {/* Left, Down, Right */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleMove('left')}
                  className={`w-14 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all border ${
                    pressedKey === 'left'
                      ? 'bg-pink-500/20 border-pink-550 text-pink-400 shadow shadow-pink-500/20 transform scale-95'
                      : 'bg-[#151c33] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>◀</span>
                  <span className="text-[8px] text-slate-500 font-mono">LEFT</span>
                </button>
                <button
                  onClick={() => handleMove('down')}
                  className={`w-14 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all border ${
                    pressedKey === 'down'
                      ? 'bg-pink-500/20 border-pink-550 text-pink-400 shadow shadow-pink-500/20 transform scale-95'
                      : 'bg-[#151c33] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>▼</span>
                  <span className="text-[8px] text-slate-500 font-mono">DOWN</span>
                </button>
                <button
                  onClick={() => handleMove('right')}
                  className={`w-14 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all border ${
                    pressedKey === 'right'
                      ? 'bg-pink-500/20 border-pink-550 text-pink-400 shadow shadow-pink-500/20 transform scale-95'
                      : 'bg-[#151c33] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>▶</span>
                  <span className="text-[8px] text-slate-500 font-mono">RIGHT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Game Over Display */}
          {gameOver && (
            <div className="absolute inset-0 bg-[#090b14]/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
              <span className="text-5xl animate-bounce">💔</span>
              <h2 className="text-2xl font-black text-rose-500 mt-3 uppercase tracking-wide">No Merges Left!</h2>
              <p className="text-xs text-slate-400 mt-1 mb-4 max-w-xs">
                Your oven ran dry! You did amazing, executing <strong className="text-white">{movesCount}</strong> slides and earning a sweet score of <strong className="text-pink-400">{score}</strong>.
              </p>
              
              <div className="flex gap-3">
                {undoHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="py-2.5 px-5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 font-extrabold uppercase text-xs hover:bg-indigo-500/30 tracking-wide transition-all cursor-pointer"
                  >
                    Undo Last Move ({undoHistory.length})
                  </button>
                )}
                <button
                  onClick={createNewGame}
                  className="py-2.5 px-5 rounded-xl bg-pink-500 text-slate-950 font-black uppercase text-xs hover:opacity-90 tracking-wide transition-all cursor-pointer"
                >
                  Bake Fresh Desserts
                </button>
              </div>
            </div>
          )}

          {/* Victory Overlay */}
          {victory && (
            <div className="absolute inset-0 bg-emerald-950/95 border-2 border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn bg-gradient-to-tr from-[#0e2118] via-[#040806] to-[#0d1c1a]">
              <span className="text-6xl animate-bounce">👑🦄🧁</span>
              <h2 className="text-2xl font-black text-emerald-400 mt-3 uppercase tracking-widest">
                2048 SOVEREIGN UNLOCKED!
              </h2>
              <p className="text-xs text-emerald-300 mt-1 mb-5 max-w-sm">
                You merged your desserts with ultimate logical mastery! That is truly a world-class baking score metric. Keep pressing onward!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setVictory(false);
                    playSound('move');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#0e1324] border border-slate-800 text-slate-200 text-xs font-black font-mono cursor-pointer hover:border-slate-700"
                >
                  Keep Merging
                </button>
                <button
                  onClick={createNewGame}
                  className="py-2.5 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  Restart Master Round
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legend / Info Cards */}
        <div className="lg:col-span-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5 border-b border-[#1e294b] pb-2">
            <HelpCircle size={15} className="text-pink-400" /> 
            Flavor Merging Hierarchy
          </h3>

          <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
            {(Object.entries(THEME_FLAVORS[flavor]) as [string, FlavorDetail][]).map(([value, item]) => (
              <div 
                key={value} 
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-850 hover:border-slate-750 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl filter drop-shadow-sm">{item.emoji}</span>
                  <div>
                    <h4 className="font-extrabold text-[#f3f4f6] text-xs flex items-center gap-1.5">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-[11px] text-pink-400 bg-pink-500/5 border border-pink-500/10 px-2 py-0.5 rounded-md">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#151c33]/70 border border-slate-800 space-y-2 text-xs text-slate-350">
            <p className="font-extrabold text-slate-200 uppercase tracking-wide flex items-center gap-1">
              <Clock size={13} className="text-pink-400" />
              INSTRUCTIONS FOR BAKING:
            </p>
            <p className="leading-relaxed text-[11px]">
              Tapping arrow directions slides all dessert boxes concurrently. Similar flavors colliding merge to yield double the points! 
            </p>
            <p className="leading-relaxed text-[11px] text-emerald-400 font-medium">
              Pro tip: Harness up to <strong className="font-mono">10 consecutive Undo moves</strong> when you get trapped!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
