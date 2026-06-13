import React from 'react';
import { AppMode } from '../types';
import { Gamepad2, Zap, Hourglass, HelpCircle, Grid3X3, Disc, Keyboard, Cpu, Target, ArrowRight } from 'lucide-react';

interface GameItem {
  id: AppMode;
  name: string;
  description: string;
  emoji: string;
  badge: 'NEW' | 'HOT' | 'PVP' | 'TACTICAL' | 'REFLEX' | 'KEYBOARD';
  iconColor: string;
  badgeColor: string;
}

interface GamesHubProps {
  onSelectGame: (id: AppMode) => void;
}

export default function GamesHub({ onSelectGame }: GamesHubProps) {
  const gamesList: GameItem[] = [
    {
      id: 'mobile-arena',
      name: 'Thumb Blitz Rush',
      description: 'The premier mobile arena game. Tap shrinking circular target nodes, use Frozen, Double points, and Mega multipliers power-ups!',
      emoji: '🎮',
      badge: 'NEW',
      iconColor: 'from-pink-500 to-rose-600',
      badgeColor: 'bg-pink-550/15 text-pink-400 border-pink-500/20'
    },
    {
      id: 'cupcakes-2048',
      name: 'Cupcakes 2048',
      description: 'Merge culinary desserts into a clean 2048 grid. Combine cupcakes to reach high-grade treats and score maximum confectionery points!',
      emoji: '🧁',
      badge: 'HOT',
      iconColor: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-550/15 text-purple-400 border-purple-500/20'
    },
    {
      id: 'coreball',
      name: 'Coreball Pin Orbit',
      description: 'Strategic timing concentric puzzle game. Pin outer needle darts onto a rotating central nuclear core without overlapping existing needles!',
      emoji: '🎈',
      badge: 'HOT',
      iconColor: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-550/15 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'cps-test',
      name: 'Standard Click Speed (CPS)',
      description: 'Calibrate your clicks-per-second capabilities across 1s, 5s, 10s up to 100s or manual timers. Logs records with sub-millisecond safety.',
      emoji: '⚡',
      badge: 'PVP',
      iconColor: 'from-yellow-500 to-amber-600',
      badgeColor: 'bg-yellow-550/15 text-yellow-400 border-yellow-500/20'
    },
    {
      id: 'reaction',
      name: 'Neural Reaction Time',
      description: 'Settle neurological visual-to-motor delays with millisecond precision click benches. Test reflexes under competitive sensory filters.',
      emoji: '🎯',
      badge: 'REFLEX',
      iconColor: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-550/15 text-cyan-400 border-cyan-500/20'
    },
    {
      id: 'typing',
      name: 'Esports Typing Test',
      description: 'Evaluate words-per-minute (WPM) speed thresholds and keyboard accuracy indices with interactive real-time text layouts.',
      emoji: '⌨️',
      badge: 'KEYBOARD',
      iconColor: 'from-emerald-500 to-green-600',
      badgeColor: 'bg-emerald-550/15 text-emerald-450 border-emerald-500/20'
    },
    {
      id: 'jitter',
      name: 'Jitter Clicking Trainer',
      description: 'Test wrist muscle vibration speed with tensed forearm feedback. Amplified shaking elements assist high-frequency clickers.',
      emoji: '🔥',
      badge: 'TACTICAL',
      iconColor: 'from-rose-500 to-orange-600',
      badgeColor: 'bg-rose-550/15 text-rose-450 border-rose-500/20'
    },
    {
      id: 'kohi',
      name: 'Kohi Click Bench',
      description: 'Recreate classic Minecraft server coordinate precision trials. Click bounding outer rings to maximize target registration.',
      emoji: '🎯',
      badge: 'PVP',
      iconColor: 'from-blue-500 to-purple-600',
      badgeColor: 'bg-blue-550/15 text-blue-400 border-blue-500/20'
    },
    {
      id: 'spacebar-counter',
      name: 'Spacebar Tapping Speed',
      description: 'Log mechanical key actuation rates over standard intervals. Evaluate individual key travel speeds and spring bounce limits.',
      emoji: '📊',
      badge: 'KEYBOARD',
      iconColor: 'from-slate-550 to-slate-700',
      badgeColor: 'bg-slate-550/15 text-slate-350 border-slate-500/20'
    }
  ];

  return (
    <div id="games-hub-wrapper" className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* Title Header */}
      <div>
        <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
          <Gamepad2 size={14} className="text-emerald-400" />
          <span>Interactive Esports Arcade Hub</span>
        </span>
        <h1 className="text-2xl font-black text-white uppercase tracking-wide mt-1">
          Gaming & Training Arenas
        </h1>
        <p className="text-xs text-slate-405 mt-1">
          Evaluate physical hand dexterity, visual neurological speeds, keystroke latency, and strategic puzzle layouts inside custom ports.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {gamesList.map((game) => (
          <div
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            className="p-5 bg-[#080c18] border border-slate-850 hover:border-emerald-500/30 rounded-2xl flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] cursor-pointer group relative overflow-hidden"
          >
            {/* Visual gradient backdrop */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${game.iconColor} flex items-center justify-center text-xl shadow`}>
                  <span>{game.emoji}</span>
                </div>

                <span className={`text-[9px] uppercase font-black px-2.5 py-0.5 border rounded-md tracking-wider ${game.badgeColor}`}>
                  {game.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                  {game.name}
                </h3>
                <p className="text-xs text-slate-400 leading-normal font-sans font-medium line-clamp-3">
                  {game.description}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-850/60 mt-4 pt-3 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">
              <span>Launch Arena</span>
              <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
