import React from 'react';
import { Menu } from 'lucide-react';
import { AppMode } from '../types';

interface TopTabsProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  setIsOpenMobile: (open: boolean) => void;
}

export default function TopTabs({ currentMode, setMode, setIsOpenMobile }: TopTabsProps) {
  const tabs = [
    { id: 'cps-test' as AppMode, label: 'Clicks Per Second', color: 'from-pink-500 to-rose-500' },
    { id: 'kohi' as AppMode, label: 'Kohi Click Test', color: 'from-emerald-500 to-teal-500' },
    { id: 'jitter' as AppMode, label: 'Jitter Click Test', color: 'from-amber-500 to-orange-500' },
    { id: 'cps-test' as AppMode, label: 'Scroll Wheel Test', color: 'from-cyan-500 to-blue-500', isScroll: true },
    { id: 'typing' as AppMode, label: 'Typing Speed Test', color: 'from-indigo-500 to-purple-500' },
    { id: 'spacebar-clicker' as AppMode, label: 'Spacebar Clicker', color: 'from-fuchsia-500 to-pink-600' },
  ];

  const handleTabClick = (tab: typeof tabs[number]) => {
    setMode(tab.id);
  };

  return (
    <header className="bg-[#0e1324] border-b border-[#1e294b] sticky top-0 z-30 px-4 py-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Mobile hamburger + page context */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#151c33] md:hidden transition-colors"
              title="Menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentMode === 'home' && 'GAMER DASHBOARD'}
                {currentMode === 'cps-test' && 'CLICKS PER SECOND'}
                {currentMode === 'jitter' && 'JITTER CLICK SPEED'}
                {currentMode === 'kohi' && 'KOHI CPS SPEED'}
                {currentMode === 'cupcakes-2048' && 'CUPCAKES 2048 ARCADE'}
                {currentMode === 'typing' && 'TYPING SPEED TESTER'}
                {currentMode === 'spacebar-counter' && 'SPACEBAR HIT COUNTER'}
                {currentMode === 'spacebar-clicker' && 'SPACEBAR RAPID CLICKER'}
                {currentMode === 'coreball' && 'COREBALL TARGET INJECT'}
                {currentMode === 'reaction' && 'REACTION TIME SPEEDTEST'}
                {currentMode === 'challenges' && 'CPS TROPHY ROOM'}
              </h1>
            </div>
          </div>
        </div>

        {/* Center/Main headers: Colorful Action Navigation Ribbons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none max-w-full">
          {tabs.map((tab, idx) => {
            const isTabActive = currentMode === tab.id;
            return (
              <button
                key={idx}
                onClick={() => handleTabClick(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                  isTabActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-md shadow-emerald-500/10 scale-105`
                    : 'bg-[#151c33] text-slate-300 hover:text-white hover:bg-[#1b2545]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
