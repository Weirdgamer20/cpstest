import React, { useState, useEffect } from 'react';
import { Award, User, RefreshCw, Layers, ShieldCheck, Mail, Users, Globe, Flame, BarChart, Zap, CheckCircle2, Lock, Search } from 'lucide-react';
import { getStoredProfile, saveProfile, calculateLevelInfo, getStoredAchievements, saveAchievements, AchievementItem, UserProfile } from '../lib/gameDB';
import SheetsSyncManager from './SheetsSyncManager';
import { ClickRecord } from '../types';

interface ProfileSystemProps {
  records?: ClickRecord[];
  setRecords?: (records: ClickRecord[]) => void;
  profile?: any;
  setProfile?: (profile: any) => void;
}

export default function ProfileSystem({
  records = [],
  setRecords = () => {},
  profile: propsProfile,
  setProfile: propsSetProfile,
}: ProfileSystemProps) {
  const [localProfile, setLocalProfileState] = useState<any>(() => propsProfile || getStoredProfile());

  useEffect(() => {
    if (propsProfile) {
      setLocalProfileState(propsProfile);
    }
  }, [propsProfile]);

  const setLocalProfile = (updated: any) => {
    setLocalProfileState(updated);
    if (propsSetProfile) {
      propsSetProfile(updated);
    }
  };

  const profile = localProfile;
  const setProfile = setLocalProfile;

  const [achievements, setAchievements] = useState<AchievementItem[]>(getStoredAchievements());
  const [achQuery, setAchQuery] = useState('');
  const [achFilter, setAchFilter] = useState<'all' | 'unlocked' | 'locked' | 'cps' | 'reaction' | 'typing' | 'mobile'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editable Profile fields
  const [username, setUsername] = useState(profile.username);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [country, setCountry] = useState(profile.country);

  // Keep editing fields synchronized when profile shifts
  useEffect(() => {
    setUsername(profile.username || '');
    setAvatar(profile.avatar || '🐱');
    setCountry(profile.country || 'US');
  }, [profile]);

  // Levels Calculations
  const lvlInfo = calculateLevelInfo(profile.lifetimeXp);

  const triggerMockLogin = (provider: 'Google' | 'Discord') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated: UserProfile = {
        ...profile,
        authProvider: provider,
        username: provider === 'Google' ? 'GoogleGamer_GP' : 'DiscordTapper_DX',
        avatar: provider === 'Google' ? '👽' : '⚔️',
        country: 'US'
      };
      setProfile(updated);
      setUsername(updated.username);
      setAvatar(updated.avatar);
      setCountry(updated.country);
      saveProfile(updated);

      // Trigger achievement unlock for logging in!
      let achievementsList = [...achievements];
      const matchIdx = achievementsList.findIndex((a) => a.id === 'first-click');
      if (matchIdx !== -1 && !achievementsList[matchIdx].unlocked) {
        achievementsList[matchIdx].unlocked = true;
        setAchievements(achievementsList);
        saveAchievements(achievementsList);
        alert(`🏆 Achievement Unlocked: ${achievementsList[matchIdx].title}! +${achievementsList[matchIdx].xpReward} XP awarded.`);
        
        // Add XP reward
        updated.lifetimeXp += achievementsList[matchIdx].xpReward;
        saveProfile(updated);
        setProfile({ ...updated });
      }
    }, 1200);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      username,
      avatar,
      country
    };
    setProfile(updated);
    saveProfile(updated);
    alert('Profile configurations updated successfully!');
  };

  const filteredAchievements = achievements.filter((ach) => {
    // text query matches title or description
    const textMatch =
      ach.title.toLowerCase().includes(achQuery.toLowerCase()) ||
      ach.description.toLowerCase().includes(achQuery.toLowerCase());

    if (!textMatch) return false;

    // Filters matching category or lock states
    if (achFilter === 'unlocked') return ach.unlocked;
    if (achFilter === 'locked') return !ach.unlocked;
    if (achFilter === 'cps') return ach.category === 'cps';
    if (achFilter === 'reaction') return ach.category === 'reaction';
    if (achFilter === 'typing') return ach.category === 'typing';
    if (achFilter === 'mobile') return ach.category === 'mobile';

    return true;
  });

  const countUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div id="profile-container-root" className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* Title block */}
      <div>
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <User size={14} className="text-emerald-400" />
          <span>GAMER PROFILE PROFILE PROGRESSION ENGINE</span>
        </p>
        <h1 className="text-2xl font-black text-white mt-1 uppercase tracking-wide">
          esports athlete record
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize credentials, bind platform authenticators, monitor experience parameters, and evaluate completed achievement tiers.
        </p>
      </div>

      {/* Main Double Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Account Summary, Edit, and Authentication Providers (lg:col-span-4) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Identity Card */}
          <div className="p-5 bg-gradient-to-tr from-[#0e1324] to-[#121a30] border border-[#1e294b] rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              <span className="text-5xl select-none bg-slate-900 border border-slate-800 p-2.5 rounded-2xl w-20 h-20 flex items-center justify-center animate-pulse">
                {profile.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 rounded-full">
                  {lvlInfo.title}
                </span>
                <h2 className="text-xl font-black text-white truncate mt-1.5 leading-tight">{profile.username}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold flex items-center gap-1 uppercase tracking-wider">
                  <span>🌍 Region: {profile.country}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">{profile.authProvider} Account</span>
                </p>
              </div>
            </div>

            {/* Level Progression Progress meter */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-300">Level {lvlInfo.level} Specialist</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {profile.lifetimeXp} / {lvlInfo.xpToNext} XP
                </span>
              </div>
              
              <div className="h-2.5 w-full bg-slate-900 border border-slate-850 rounded-full overflow-hidden">
                <div
                  style={{ width: `${lvlInfo.percent}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>RECRUIT</span>
                <span>CHALLENGER (LVL 5)</span>
                <span>SPECIALIST (LVL 10)</span>
                <span>ELITE (LVL 20)</span>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleUpdateProfile} className="p-5 bg-[#080c18] border border-slate-850 rounded-3xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Configure Custom Credentials</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black text-slate-400 block uppercase tracking-widest mb-1.5">Gamer handles</label>
                <input
                  type="text"
                  maxLength={18}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0d1120] border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50 font-bold transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block uppercase tracking-widest mb-1.5 font-sans">Avatar Character</label>
                  <select
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-[#0d1120] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-emerald-500/50 font-bold"
                  >
                    <option value="🦖">🦖 Dino Tapper</option>
                    <option value="👽">👽 Extraterrestrial</option>
                    <option value="🧙‍♂️">🧙‍♂️ Esports Wizard</option>
                    <option value="🦊">🦊 Quick Reflex Fox</option>
                    <option value="🦾">🦾 Cyber Android</option>
                    <option value="🏎️">🏎️ Formula Racer</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 block uppercase tracking-widest mb-1.5 font-sans">Flag Region</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0d1120] border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-emerald-500/50 font-bold"
                  >
                    <option value="US">🇺🇸 United States</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="KR">🇰🇷 South Korea</option>
                    <option value="FI">🇫🇮 Finland</option>
                    <option value="FI">🇨🇦 Canada</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#151c33] border border-slate-800 hover:border-emerald-500/30 text-white font-extrabold text-xs uppercase tracking-wide rounded-xl transition-all hover:bg-[#1b2545] cursor-pointer"
            >
              Update Credentials
            </button>
          </form>

          {/* Real Google Sheets & Firebase Cloud Synchronization Dashboard */}
          <div className="mt-4">
            <SheetsSyncManager 
              records={records}
              setRecords={setRecords}
              localProfile={profile}
              setLocalProfile={setProfile}
              onShowNotification={(msg, type) => {
                console.log(`[Sync Notice] ${type}: ${msg}`);
              }}
            />
          </div>
        </div>

        {/* Right Column: Achievements catalog, locking states and filters (lg:col-span-8) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active stats indicators card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#080c18] border border-slate-850 rounded-2xl text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Completed Badges</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {countUnlocked} / {achievements.length}
              </span>
            </div>
            <div className="p-3.5 bg-[#080c18] border border-slate-850 rounded-2xl text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Stamina Streak</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-purple-400 flex items-center justify-center gap-1">
                <Flame size={16} fill="currentColor" fillRule="evenodd" className="text-orange-500" />
                <span>{profile.currentStreak} days</span>
              </span>
            </div>
            <div className="p-3.5 bg-[#080c18] border border-slate-850 rounded-2xl text-center">
              <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Lifetime XP</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                {profile.lifetimeXp} XP
              </span>
            </div>
          </div>

          <div className="p-5 bg-[#080c18] border border-[#1e294b] rounded-3xl space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Esports Achievements Catalog (50+)</h3>
                <p className="text-xs text-slate-400">Unlock specialty titles across CPS speed, acoustic reactions, typing accuracy, and mobile challenges.</p>
              </div>

              {/* Achievements query limits */}
              <div className="relative w-full md:w-56">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-550">
                  <Search size={12} />
                </span>
                <input
                  type="text"
                  placeholder="Query achievements..."
                  value={achQuery}
                  onChange={(e) => setAchQuery(e.target.value)}
                  className="w-full bg-[#0d1120] border border-slate-850 rounded-xl py-1.5 pl-8.5 pr-3 text-[11px] font-semibold text-slate-300 placeholder-slate-500 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Achievements filter tabs */}
            <div className="flex flex-wrap gap-1 bg-[#0d1120] p-1 border border-slate-850 rounded-xl">
              {(['all', 'unlocked', 'locked', 'cps', 'reaction', 'typing', 'mobile'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAchFilter(tab)}
                  className={`py-1 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                    achFilter === tab
                      ? 'bg-slate-900 border border-slate-800 text-white font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Achievements scrollable list block */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      ach.unlocked
                        ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                        : 'bg-black/35 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-xl select-none ${
                        ach.unlocked ? 'glow-green' : ''
                      }`}>
                        {ach.unlocked ? ach.badgeEmoji : '🔒'}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
                          <span>{ach.title}</span>
                          {ach.unlocked && (
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-450 font-medium leading-normal mt-0.5">{ach.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        ach.unlocked ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-550/15' : 'text-slate-500 bg-slate-900/50'
                      }`}>
                        +{ach.xpReward} XP
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-500 font-mono text-[11px]">
                  No achievements catalog matching selection criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
