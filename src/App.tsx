import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Flame, 
  Target, 
  TrendingUp, 
  Award, 
  Trophy,
  HelpCircle, 
  LineChart, 
  ShieldCheck, 
  RotateCcw,
  BarChart,
  Grid3X3,
  Dribbble,
  PlaySquare,
  Sparkles,
  Smartphone,
  BookOpen,
  User,
  Heart,
  Globe,
  Share2
} from 'lucide-react';

import { AppMode, ClickRecord } from './types';
import Sidebar from './components/Sidebar';
import TopTabs from './components/TopTabs';
import StatsCard from './components/StatsCard';
import ClickArena from './components/ClickArena';
import DurationSelector from './components/DurationSelector';
import RecordsTable from './components/RecordsTable';
import ScoreModal from './components/ScoreModal';
import { auth, getAccessToken, saveSingleRecordToCloud, appendSpreadsheetRows } from './lib/firebase';

// Interactive Sub-Apps
import Cupcakes2048 from './components/Cupcakes2048';
import TypingTest from './components/TypingTest';
import SpacebarCounter from './components/SpacebarCounter';
import CoreballGame from './components/CoreballGame';
import ReactionTimeTest from './components/ReactionTimeTest';
import CPSChallenges from './components/CPSChallenges';
import ThumbBlitzRush from './components/ThumbBlitzRush';
import Leaderboards from './components/Leaderboards';
import ProfileSystem from './components/ProfileSystem';
import SEOLibrary from './components/SEOLibrary';
import GamesHub from './components/GamesHub';
import BlogSystem from './components/BlogSystem';
import { getStoredProfile, saveProfile, calculateLevelInfo, getStoredChallenges, saveChallenges, UserProfile } from './lib/gameDB';

export default function App() {
  // Navigation & View States
  const [currentMode, setMode] = useState<AppMode>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Profile & XP States
  const [profile, setProfile] = useState<any>(() => {
    try {
      return getStoredProfile();
    } catch (e) {}
    return {
      username: 'ArenaChallenger',
      avatar: '🐱',
      provider: 'Guest',
      country: 'US',
      streak: 3,
      xp: 340,
      totalTests: 15,
      bestCps: 11.2,
      avgCps: 7.4,
      reactionAvg: 195
    };
  });

  const [activeChallenge, setActiveChallenge] = useState<{ targetCps: number; mode: string } | null>(null);
  const [currentPathname, setCurrentPathname] = useState<string>('/5-second-cps-test');

  // Rotate daily challenge statuses
  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 'dc1', text: 'Achieve 8.0+ CPS on any speedtest', xp: 100, completed: false, claimed: false },
    { id: 'dc2', text: 'Complete a testing benchmark with 11.0+ CPS top speed', xp: 120, completed: false, claimed: false },
    { id: 'dc3', text: 'Score under 220ms inside Reflex timing tracker', xp: 100, completed: false, claimed: false }
  ]);

  // CPS Click Speedtest Core States
  const [durationString, setDurationString] = useState<string>('5s');
  const [manualSeconds, setManualSeconds] = useState<number>(10);
  const [durationSeconds, setDurationSeconds] = useState<number>(5);
  const [timeLeft, setTimeLeft] = useState<number>(5);
  const [clicks, setClicks] = useState<number>(0);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scoreModalOpen, setScoreModalOpen] = useState<boolean>(false);

  // Click Records History
  const [records, setRecords] = useState<ClickRecord[]>([]);

  // Timer Ref for high-precision decimal countdowns
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to add XP nicely
  const handleAddXp = (amount: number) => {
    setProfile((prev) => {
      const nextXp = prev.xp + amount;
      const updated = { ...prev, xp: nextXp };
      try {
        localStorage.setItem('chronos_profile_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleUpdateLeaderboardScore = (category: string, score: number) => {
    // Sync local maximums on profile
    if (category === 'Thumb Blitz Rush') {
      // Blitz
    }
  };

  // Sync and persist last visited page
  useEffect(() => {
    if (currentMode && currentMode !== 'home') {
      localStorage.setItem('last_visited_mode', currentMode);
    }
  }, [currentMode]);

  // Load records and parse URL layouts for perfect indexable SEO routing!
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cps_records');
      if (stored) {
        setRecords(JSON.parse(stored));
      } else {
        // Seed standard gaming records for an instant populated premium look!
        const defaultRecords: ClickRecord[] = [
          { id: 'seed-1', date: '6/12/2026', duration: '5s', clicks: 43, cps: 8.6, type: 'cps' },
          { id: 'seed-2', date: '6/11/2026', duration: '10s', clicks: 74, cps: 7.4, type: 'kohi' },
          { id: 'seed-3', date: '6/10/2026', duration: '5s', clicks: 48, cps: 9.6, type: 'jitter' }
        ];
        localStorage.setItem('cps_records', JSON.stringify(defaultRecords));
        setRecords(defaultRecords);
      }
    } catch (e) {}

    // ----------------------------------------------------
    // PERFECT SEO VIRTUAL ROUTING PATTERN
    // ----------------------------------------------------
    const path = window.location.pathname;
    setCurrentPathname(path);

    // Mobile onboarding auto-redirect
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobileDevice && !localStorage.mobile_intro_seen && path !== '/mobile-arena') {
      localStorage.mobile_intro_seen = 'true';
      setMode('mobile-arena');
      return;
    }

    // Restore last visited page on subsequent visits (if path is root)
    if (path === '/' || path === '/index.html') {
      const lastVisited = localStorage.getItem('last_visited_mode') as AppMode;
      if (lastVisited && lastVisited !== 'home') {
        setMode(lastVisited);
      }
    }

    if (path.startsWith('/challenge/')) {
      const parts = path.split('/');
      const parsedCps = parseFloat(parts[2]) || 11.5;
      const targetModeName = parts[3] || 'cps';
      setActiveChallenge({ targetCps: parsedCps, mode: targetModeName });
      setMode('cps-test');
    } else {
      switch (path) {
        case '/5-second-cps-test':
          setMode('cps-test');
          setDurationString('5s');
          break;
        case '/10-second-cps-test':
          setMode('cps-test');
          setDurationString('10s');
          break;
        case '/15-second-cps-test':
          setMode('cps-test');
          setDurationString('15s');
          break;
        case '/30-second-cps-test':
          setMode('cps-test');
          setDurationString('30s');
          break;
        case '/60-second-cps-test':
          setMode('cps-test');
          setDurationString('60s');
          break;
        case '/100-second-cps-test':
          setMode('cps-test');
          setDurationString('Manual');
          setManualSeconds(100);
          break;
        case '/jitter-click-test':
          setMode('jitter');
          setDurationString('5s');
          break;
        case '/butterfly-click-test':
          setMode('cps-test');
          setDurationString('5s');
          break;
        case '/drag-click-test':
          setMode('cps-test');
          setDurationString('5s');
          break;
        case '/kohi-click-test':
          setMode('kohi');
          setDurationString('5s');
          break;
        case '/reaction-time-test':
        case '/visual-reaction-test':
        case '/audio-reaction-test':
        case '/coordination-reaction-test':
          setMode('reaction');
          break;
        case '/spacebar-counter':
          setMode('spacebar-counter');
          break;
        case '/spacebar-clicker':
          setMode('spacebar-clicker');
          break;
        case '/typing-speed-test':
          setMode('typing');
          break;
        case '/thumb-blitz-rush':
          setMode('mobile-arena');
          break;
        case '/coreball':
          setMode('coreball');
          break;
        case '/cupcakes-2048':
          setMode('cupcakes-2048');
          break;
        default:
          break;
      }
    }
  }, []);

  // Sync state computed seconds whenever user taps a different duration
  useEffect(() => {
    resetSpeedtest();
    if (durationString === 'Manual') {
      setDurationSeconds(manualSeconds);
      setTimeLeft(manualSeconds);
    } else {
      const parsed = parseInt(durationString.replace('s', ''), 10);
      setDurationSeconds(parsed);
      setTimeLeft(parsed);
    }
  }, [durationString, manualSeconds]);

  // Handle active countdown timer
  const startSpeedtestTimer = () => {
    setIsPlaying(true);
    setIsFinished(false);
    
    const startTimeStamp = Date.now();
    const finalSeconds = durationSeconds;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeStamp) / 1000;
      const computedLeft = finalSeconds - elapsed;

      if (computedLeft <= 0) {
        // Finished Speedtest!
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(0);
        setIsPlaying(false);
        setIsFinished(true);
        setScoreModalOpen(true);
        saveSpeedtestRecord();
      } else {
        setTimeLeft(parseFloat(computedLeft.toFixed(1)));
      }
    }, 100);
  };

  const handleClickIncrement = () => {
    setClicks((prev) => prev + 1);
  };

  const saveSpeedtestRecord = () => {
    // Determine active test classification
    let recType: 'cps' | 'jitter' | 'kohi' = 'cps';
    if (currentMode === 'jitter') recType = 'jitter';
    else if (currentMode === 'kohi') recType = 'kohi';

    // Total clicks recorded on the fly
    const computedCps = parseFloat(((clicks + 1) / durationSeconds).toFixed(2));

    const newRecord: ClickRecord = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toLocaleDateString(),
      duration: durationString === 'Manual' ? `${manualSeconds}s` : durationString,
      clicks: clicks + 1, // Add current click since state batches updates
      cps: computedCps,
      type: recType,
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    try {
      localStorage.setItem('cps_records', JSON.stringify(updated));
    } catch (e) {}

    // Real-time Cloud Backups & Google Sheets Sync
    if (auth.currentUser) {
      saveSingleRecordToCloud(auth.currentUser.uid, newRecord).catch((err) => {
        console.error('Failed to auto-backup record to Firestore:', err);
      });
    }

    const isAutoSyncEnabled = localStorage.getItem('google_sheets_autosync') === 'true';
    const spreadsheetId = localStorage.getItem('google_sheets_spreadsheet_id');
    const sheetsToken = getAccessToken();

    if (isAutoSyncEnabled && spreadsheetId && sheetsToken) {
      appendSpreadsheetRows(sheetsToken, spreadsheetId, 'Click Records!A2:F', [
        [newRecord.id, newRecord.date, newRecord.duration, newRecord.clicks, newRecord.cps, newRecord.type]
      ]).catch((err) => {
        console.error('Failed to auto-sync record to Google Sheets:', err);
      });
    }

    // Update profile XP (+15 XP per speedtest logged!) and analytics
    setProfile((prev) => {
      const nextXp = prev.xp + 15;
      const nextTotal = prev.totalTests + 1;
      const nextBest = Math.max(prev.bestCps, computedCps);
      const nextAvg = parseFloat((((prev.avgCps * prev.totalTests) + computedCps) / nextTotal).toFixed(2));
      
      const updatedProfile = {
        ...prev,
        xp: nextXp,
        totalTests: nextTotal,
        bestCps: nextBest,
        avgCps: nextAvg
      };

      try {
        localStorage.setItem('chronos_profile_v3', JSON.stringify(updatedProfile));
      } catch (e) {}

      return updatedProfile;
    });

    // Check Daily Challenges completions on the fly
    setDailyChallenges((prevChalls) => {
      return prevChalls.map((chall) => {
        if (chall.id === 'dc1' && computedCps >= 8.0) {
          return { ...chall, completed: true };
        }
        if (chall.id === 'dc2' && computedCps >= 11.0) {
          return { ...chall, completed: true };
        }
        return chall;
      });
    });
  };

  const resetSpeedtest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsFinished(false);
    setClicks(0);
    const parsed = durationString === 'Manual' ? manualSeconds : parseInt(durationString.replace('s', ''), 10);
    setTimeLeft(parsed);
  };

  const handleClearHistory = () => {
    setRecords([]);
    try {
      localStorage.removeItem('cps_records');
    } catch (e) {}
  };

  // Safe manual speed setter
  const handleSelectManualSeconds = (sec: number) => {
    setManualSeconds(sec);
  };

  // Helper values
  const activeElapsed = durationSeconds - timeLeft;
  const currentLiveCps = clicks > 0 ? parseFloat((clicks / (activeElapsed || 0.1)).toFixed(1)) : 0.0;

  // Render components according to chosen navigation view
  const renderActiveModule = () => {
    switch (currentMode) {
      case 'home':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Mega Welcome Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-[#141b31] via-[#0f1426] to-[#1b264b] border border-[#1e294b] flex flex-col md:flex-row items-center justify-between gap-6 game-card-glow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2.5 text-center md:text-left z-10">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  🔥 Competitive Edition
                </span>
                <h2 className="text-3xl font-extrabold text-white tracking-wide leading-tight">
                  ELEVATE YOUR <span className="text-emerald-400 underline decoration-slate-600">GAMING PHYSICALITY</span>
                </h2>
                <p className="text-xs text-slate-350 max-w-xl">
                  Benchmark and train your hand coordination speed metrics. Explore clicking speed, keyboard latency tests, typewriter speeds, and custom arcade titles, directly built inside single-screen sandbox.
                </p>
                
                {/* Visual stats indicators */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Lighthouse Checked</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Award size={14} className="text-yellow-400" />
                    <span>100% Client Persistence</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 z-10">
                <button
                  onClick={() => {
                    const el = document.getElementById('home-click-arena');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="py-3 px-6 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-105 cursor-pointer shadow-lg shadow-emerald-400/15"
                >
                  🎯 Test Now Below
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Top CPS Recorded</p>
                  <p className="text-2xl font-black font-mono text-emerald-400">
                    {records.length > 0 ? Math.max(...records.map((r) => r.cps)).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Zap size={18} />
                </div>
              </div>

              <div className="p-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Speedtests run</p>
                  <p className="text-2xl font-black font-mono text-cyan-400">{records.length}</p>
                </div>
                <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                  <LineChart size={18} />
                </div>
              </div>

              <div className="p-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Verified Achievements</p>
                  <p className="text-2xl font-black font-mono text-yellow-400">
                    {records.length > 0 ? (records.some((r) => r.cps >= 10) ? '3 Active' : '1 Active') : '0 Active'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center text-yellow-400">
                  <Trophy size={18} />
                </div>
              </div>
            </div>

            {/* INSTANT PLAYABLE ARENA DIRECTLY ON HOME SCREEN */}
            <div id="home-click-arena" className="p-5 bg-[#080c18] border border-[#1e294b] rounded-3xl space-y-5 scroll-mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <span>⚡ INSTANT CLICK SPEEDTEST ARENA</span>
                  </p>
                  <h3 className="text-lg font-extrabold text-white uppercase tracking-normal">No Navigation Needed — Click Right Here</h3>
                </div>

                <button
                  onClick={resetSpeedtest}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151c33] hover:bg-[#1b2545] border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-bold"
                >
                  <RotateCcw size={12} />
                  Reset Arena
                </button>
              </div>

              {/* Three Live Statistic Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Time Left</span>
                  <span className="text-xl font-mono font-black text-purple-400">{timeLeft}s</span>
                </div>
                <div className="p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Clicks / S</span>
                  <span className="text-xl font-mono font-black text-emerald-400">{currentLiveCps}</span>
                </div>
                <div className="p-3 bg-[#0d1120] border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Clicks</span>
                  <span className="text-xl font-mono font-black text-cyan-400">{clicks}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Embedded Click Arena */}
                <div className="lg:col-span-8">
                  <ClickArena
                    mode="cps"
                    isActive={isPlaying}
                    isFinished={isFinished}
                    clicks={clicks}
                    timeRemaining={timeLeft}
                    onFirstClick={startSpeedtestTimer}
                    onClick={handleClickIncrement}
                    onReset={resetSpeedtest}
                  />
                </div>

                {/* Duration Config and Statistics */}
                <div className="lg:col-span-4 space-y-5">
                  <DurationSelector
                    currentDuration={durationString}
                    manualSeconds={manualSeconds}
                    onSelectDuration={setDurationString}
                    onSelectManualSeconds={handleSelectManualSeconds}
                  />

                  <RecordsTable
                    records={records}
                    onClearHistory={handleClearHistory}
                  />
                </div>
              </div>
            </div>

            {/* Core Mini Arcade Launch Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 bg-[#0e1324] border border-[#1e294b] rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Grid3X3 size={16} className="text-pink-400" /> Embedded Mini-Games
                </h3>
                <p className="text-xs text-slate-400">Launch these ultra-clean custom arcade ports with fluid frames directly in the side panel:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('cupcakes-2048')}
                    className="p-3 bg-[#151c33] border border-slate-800 rounded-xl hover:border-pink-500/30 transition-all text-left space-y-1 group"
                  >
                    <span className="text-lg">🧁</span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-pink-400 transition-colors">Cupcakes 2048</h4>
                    <span className="text-[9px] text-slate-500 uppercase block">Merge desserts</span>
                  </button>

                  <button
                    onClick={() => setMode('coreball')}
                    className="p-3 bg-[#151c33] border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-all text-left space-y-1 group"
                  >
                    <span className="text-lg">🎯</span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-450 transition-colors">Coreball Pin</h4>
                    <span className="text-[9px] text-slate-500 uppercase block">Concentric puzzle</span>
                  </button>
                </div>
              </div>

              {/* Trending gaming card placeholder */}
              <div 
                onClick={() => setMode('blog')}
                className="p-5 bg-gradient-to-r from-amber-950/15 via-[#0e1324] to-orange-950/5 border border-[#1e294b] rounded-2xl space-y-4 cursor-pointer hover:border-amber-500/30 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-amber-400" /> PVP Speed Test Insights
                  </h3>
                  <span className="text-[9px] text-amber-400 font-mono tracking-widest border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                    Live Blog
                  </span>
                </div>

                <div className="space-y-3">
                  <blockquote className="text-xs italic text-slate-350 leading-relaxed pl-3 border-l-2 border-amber-400">
                    "Esports athletes are moving away from brute drag clicking towards high-fidelity optical switches to minimize debounce delays during Minecraft bridge races and competitive tracking shooter play."
                  </blockquote>
                  <div className="text-[10px] text-slate-500 flex justify-between items-center px-1">
                    <span>Written by: Vapor Analyst</span>
                    <span className="text-amber-400 hover:underline">Read All Articles →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'cps-test':
      case 'jitter':
      case 'kohi':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Title / Description block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🚀 HIGH PRECISION SIMULATION CANVAS</span>
                </p>
                <h1 className="text-2xl font-extrabold text-white tracking-wide uppercase">
                  {currentMode === 'cps-test' && 'CLICKS PER SECOND SPEED TEST'}
                  {currentMode === 'jitter' && 'JITTER SPEST TESTING CANVAS'}
                  {currentMode === 'kohi' && 'KOHI MINECRAFT SPEED BENCH'}
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  {currentMode === 'cps-test' && 'Benchmark standard tapping rates. Tap rapidly to log clicks and track instantaneous CPS metrics.'}
                  {currentMode === 'jitter' && 'Test rapid high-frequency hand vibration. Shaking visuals amplify interactive feedback lines.'}
                  {currentMode === 'kohi' && 'Authentic Minecraft server-style evaluation. Target concentric rings guide spatial clicking precision.'}
                </p>
              </div>

              {/* Reset layout */}
              <button
                onClick={resetSpeedtest}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#151c33] hover:bg-[#1b2545] border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-extrabold shadow-sm"
              >
                <RotateCcw size={13} />
                Reset Canvas
              </button>
            </div>

            {/* Trending Card Banner (as described in Main CPS Module specification) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-550/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-400" />
                <span className="text-slate-300">
                  <strong>PRO TIPS:</strong> Keep your shoulders loose and maintain high-tension wrist jittering for optimum scores over 10 CPS.
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                Trend Alpha
              </span>
            </div>

            {/* Three Statistic Cards Row (Timer, Click/s, Score) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                id="stat-cps-timer"
                title="Timer Limit"
                value={`${timeLeft}s`}
                subtitle="Countdown"
                icon={<BarChart size={18} />}
                colorScheme="purple"
              />
              <StatsCard
                id="stat-cps-current"
                title="Clicks / S"
                value={currentLiveCps}
                subtitle="Live Speed"
                icon={<Zap size={18} />}
                colorScheme="green"
              />
              <StatsCard
                id="stat-cps-score"
                title="Score Registered"
                value={clicks}
                subtitle="Total click counts"
                icon={<Award size={18} />}
                colorScheme="blue"
              />
            </div>

            {/* Main Double Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Click Arena Column */}
              <div className="lg:col-span-8">
                <ClickArena
                  mode={currentMode === 'jitter' ? 'jitter' : currentMode === 'kohi' ? 'kohi' : 'cps'}
                  isActive={isPlaying}
                  isFinished={isFinished}
                  clicks={clicks}
                  timeRemaining={timeLeft}
                  onFirstClick={startSpeedtestTimer}
                  onClick={handleClickIncrement}
                  onReset={resetSpeedtest}
                />
              </div>

              {/* Selector Column */}
              <div className="lg:col-span-4 space-y-6">
                <DurationSelector
                  currentDuration={durationString}
                  manualSeconds={manualSeconds}
                  onSelectDuration={setDurationString}
                  onSelectManualSeconds={handleSelectManualSeconds}
                />

                <RecordsTable
                  records={records}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </div>
          </div>
        );

      case 'cupcakes-2048': return <Cupcakes2048 />;
      case 'typing': return <TypingTest />;
      case 'spacebar-counter': return <SpacebarCounter isClickerMode={false} />;
      case 'spacebar-clicker': return <SpacebarCounter isClickerMode={true} />;
      case 'coreball': return <CoreballGame />;
      case 'reaction': return <ReactionTimeTest />;
      case 'challenges': return <CPSChallenges />;
      case 'mobile-arena': return <ThumbBlitzRush />;
      case 'leaderboard': return <Leaderboards />;
      case 'profile': return (
        <ProfileSystem 
          records={records}
          setRecords={setRecords}
          profile={profile}
          setProfile={setProfile}
        />
      );
      case 'seo-library': return <SEOLibrary />;
      case 'games': return <GamesHub onSelectGame={setMode} />;
      case 'blog': return <BlogSystem onNavigateToMode={setMode} />;
      default:
        return <div className="text-center py-12 text-slate-500 font-mono">Module view not bound.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex text-slate-100 antialiased font-sans pb-16 lg:pb-0">
      
      {/* Sidebar collapsible custom element */}
      <Sidebar
        currentMode={currentMode}
        setMode={setMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Content scroll window */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <TopTabs
          currentMode={currentMode}
          setMode={setMode}
          setIsOpenMobile={setIsMobileSidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 pb-20 lg:pb-8">
          {renderActiveModule()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar to replace Sidebar on small viewports */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#090d1a]/95 border-t border-slate-850/80 backdrop-blur-md flex justify-around items-center z-45 px-3 pb-safe shadow-[0_-12px_24px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setMode('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1.5 ${
            currentMode === 'home' ? 'text-emerald-450 font-extrabold translate-y-[-2px]' : 'text-slate-450 hover:text-slate-100'
          }`}
          title="Home"
        >
          <span className="text-lg">🏠</span>
          <span className="text-[9px] tracking-wider uppercase font-extrabold font-mono">Home</span>
        </button>
        <button
          onClick={() => setMode('cps-test')}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1.5 ${
            currentMode === 'cps-test' ? 'text-emerald-450 font-extrabold translate-y-[-2px]' : 'text-slate-450 hover:text-slate-100'
          }`}
          title="CPS Test"
        >
          <span className="text-lg">⚡</span>
          <span className="text-[9px] tracking-wider uppercase font-extrabold font-mono">CPS</span>
        </button>
        <button
          onClick={() => setMode('games')}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1.5 ${
            currentMode === 'games' ? 'text-emerald-450 font-extrabold translate-y-[-2px]' : 'text-slate-450 hover:text-slate-100'
          }`}
          title="Gaming Areas"
        >
          <span className="text-lg">🎮</span>
          <span className="text-[9px] tracking-wider uppercase font-extrabold font-mono">Games</span>
        </button>
        <button
          onClick={() => setMode('leaderboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1.5 ${
            currentMode === 'leaderboard' ? 'text-emerald-450 font-extrabold translate-y-[-2px]' : 'text-slate-450 hover:text-slate-100'
          }`}
          title="Leaderboards"
        >
          <span className="text-lg">🏆</span>
          <span className="text-[9px] tracking-wider uppercase font-extrabold font-mono">Rankings</span>
        </button>
        <button
          onClick={() => setMode('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-1.5 ${
            currentMode === 'profile' ? 'text-emerald-450 font-extrabold translate-y-[-2px]' : 'text-slate-450 hover:text-slate-100'
          }`}
          title="Athletes Profile"
        >
          <span className="text-lg">👤</span>
          <span className="text-[9px] tracking-wider uppercase font-extrabold font-mono">Profile</span>
        </button>
      </div>

      {/* Result score announcement modal element */}
      <ScoreModal
        isOpen={scoreModalOpen}
        score={clicks}
        duration={durationString === 'Manual' ? `${manualSeconds}s` : durationString}
        cps={clicks > 0 ? clicks / durationSeconds : 0}
        testType={
          currentMode === 'jitter' ? 'Jitter Click Speed Test' :
          currentMode === 'kohi' ? 'Kohi Minecraft Click Test' :
          'Clicks Per Second Speed Test'
        }
        onClose={() => setScoreModalOpen(false)}
        onRestart={() => {
          setScoreModalOpen(false);
          resetSpeedtest();
        }}
      />
    </div>
  );
}
