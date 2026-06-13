import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Zap, 
  Flame, 
  Target, 
  Grid3X3, 
  Keyboard, 
  Binary, 
  ArrowUpToLine, 
  Cpu, 
  Disc, 
  Timer, 
  Trophy, 
  Gamepad2, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  User,
  BookOpen,
  Phone
} from 'lucide-react';
import { AppMode } from '../types';
import { getStoredProfile, calculateLevelInfo } from '../lib/gameDB';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({
  currentMode,
  setMode,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile
}: SidebarProps) {

  // Dynamic profile level state loaded instantly
  const [profile, setProfile] = useState(getStoredProfile());

  useEffect(() => {
    // Poll localstorage periodically to keep sidebar profile in sync
    const handleSync = () => {
      setProfile(getStoredProfile());
    };
    window.addEventListener('storage', handleSync);
    const poller = setInterval(handleSync, 2000);
    return () => {
      window.removeEventListener('storage', handleSync);
      clearInterval(poller);
    };
  }, []);

  const lvl = calculateLevelInfo(profile.lifetimeXp);

  const menuItems = [
    { id: 'home' as AppMode, label: 'Home Dashboard', icon: Home },
    { id: 'cps-test' as AppMode, label: 'Click Speed Test', icon: Zap },
    { id: 'jitter' as AppMode, label: 'Jitter Click Test', icon: Flame },
    { id: 'kohi' as AppMode, label: 'Kohi Click Test', icon: Target },
    { id: 'mobile-arena' as AppMode, label: 'Thumb Blitz (Mobile)', icon: Gamepad2, badge: 'NEW' },
    { id: 'cupcakes-2048' as AppMode, label: 'Cupcakes 2048', icon: Grid3X3, badge: 'Game' },
    { id: 'typing' as AppMode, label: 'Typing Speed Test', icon: Keyboard },
    { id: 'spacebar-counter' as AppMode, label: 'Spacebar Counter', icon: Binary },
    { id: 'spacebar-clicker' as AppMode, label: 'Spacebar Clicker', icon: ArrowUpToLine },
    { id: 'coreball' as AppMode, label: 'Coreball Game', icon: Disc, badge: 'HOT' },
    { id: 'reaction' as AppMode, label: 'Reaction Time Test', icon: Timer },
    { id: 'challenges' as AppMode, label: 'CPS Challenges', icon: Trophy },
    { id: 'leaderboard' as AppMode, label: 'Global Leaderboards', icon: Trophy, badge: 'RANK' },
    { id: 'profile' as AppMode, label: 'My Athlete Profile', icon: User },
    { id: 'seo-library' as AppMode, label: 'Reflex Academy', icon: BookOpen, badge: 'SEO' },
  ];

  const handleSelect = (id: AppMode) => {
    setMode(id);
    setIsOpenMobile(false);
  };

  const sidebarContent = (
    <div id="sidebar-container" className="flex flex-col h-full bg-[#0e1324] border-r border-[#1e294b]">
      {/* Brand Header */}
      <div id="sidebar-brand-header" className="flex items-center justify-between p-4 border-b border-[#1e294b]">
        <div id="brand-logo-wrap" className="flex items-center gap-3">
          <div id="logo-icon" className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 glow-green">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
          {(!isCollapsed || isOpenMobile) && (
            <span id="brand-logo-text" className="font-extrabold text-lg tracking-wider text-white">
              CPS<span className="text-emerald-400">TEST</span><span className="text-xs font-semibold text-emerald-500 block">.ORG</span>
            </span>
          )}
        </div>
        
        {/* Collapse Toggle Desk */}
        <button
          id="collapse-toggle-deskt"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1a233d] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Close Toggle Mobile */}
        <button
          id="close-toggle-mobil"
          onClick={() => setIsOpenMobile(false)}
          className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1a233d]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Space */}
      <nav id="sidebar-nav-list" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151c33]'
              }`}
            >
              <div className={`flex items-center justify-center shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400 transition-colors'}`}>
                <Icon size={20} />
              </div>

              {(!isCollapsed || isOpenMobile) && (
                <div id={`label-container-${item.id}`} className="flex-1 flex items-center justify-between min-w-0">
                  <span className="text-[14px] font-semibold truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                      item.badge === 'HOT' ? 'bg-red-500/20 text-red-400' :
                      item.badge === 'AI' ? 'bg-indigo-500/20 text-indigo-400' :
                      item.badge === 'Game' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && !isOpenMobile && (
                <div className="absolute left-16 bg-[#090d1a] border border-[#1e294b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                  {item.label}
                  {item.badge && <span className="ml-1 text-[9px] text-emerald-400">({item.badge})</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* AD Area above profile */}
      {(!isCollapsed || isOpenMobile) && (
        <div id="sidebar-ad-area" className="px-4 py-3 border-t border-[#1e294b] bg-[#070b14]/50">
          <div className="w-full min-h-[90px] border border-dashed border-[#1e294b] rounded-xl flex flex-col items-center justify-center bg-slate-900/30 text-center p-2 relative">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase select-none">ADVERTISEMENT SPACE</span>
            <span className="text-[8px] font-mono text-slate-600 mt-1 select-none">ID: sidebar-ad-slot</span>
          </div>
        </div>
      )}

      {/* Mini Profile Footer */}
      {(!isCollapsed || isOpenMobile) && (
        <div id="sidebar-footer-stats" className="p-4 bg-[#0a0e1c] border-t border-[#1e294b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm select-none shadow">
              {profile.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-300 truncate">{profile.username}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">Level {lvl.level} {lvl.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container with smooth transition */}
      <aside 
        id="desktop-sidebar-root"
        className={`hidden md:block transition-all duration-300 h-screen sticky top-0 shrink-0 z-20 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div 
          id="mobile-drawer-backdrop"
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        id="mobile-sidebar-root"
        className={`fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden transition-transform duration-300 ease-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
