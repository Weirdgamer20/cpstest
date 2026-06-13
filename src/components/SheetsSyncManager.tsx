import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Plus, 
  Link as LinkIcon, 
  RefreshCw, 
  CheckCircle, 
  ExternalLink, 
  AlertCircle, 
  LogOut, 
  Sparkles,
  ArrowUp,
  Download
} from 'lucide-react';
import { 
  auth, 
  googleSignIn, 
  logoutAndReset, 
  syncUserProfile, 
  syncClickRecordsToCloud, 
  fetchCloudRecords, 
  createGoogleSpreadsheet, 
  exportRecordsBufferToSheet,
  setAccessToken,
  getAccessToken
} from '../lib/firebase';
import { ClickRecord } from '../types';
import { User } from 'firebase/auth';

interface SheetsSyncManagerProps {
  records: ClickRecord[];
  setRecords: (records: ClickRecord[]) => void;
  localProfile: any;
  setLocalProfile: (profile: any) => void;
  onShowNotification?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function SheetsSyncManager({
  records,
  setRecords,
  localProfile,
  setLocalProfile,
  onShowNotification
}: SheetsSyncManagerProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isSheetCreating, setIsSheetCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sheets settings
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('google_sheets_spreadsheet_id') || '';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('google_sheets_spreadsheet_url') || '';
  });
  const [autoSync, setAutoSync] = useState<boolean>(() => {
    return localStorage.getItem('google_sheets_autosync') === 'true';
  });

  // Manual linked spreadsheet ID
  const [manualSheetId, setManualSheetId] = useState('');

  // Sync auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setAccessTokenState(null);
        setAccessToken(null);
      }
    });
    return unsub;
  }, []);

  // Sync local token if updated on the fly
  useEffect(() => {
    const checkToken = setInterval(() => {
      const currentToken = getAccessToken();
      if (currentToken !== accessToken) {
        setAccessTokenState(currentToken);
      }
    }, 1000);
    return () => clearInterval(checkToken);
  }, [accessToken]);

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessTokenState(res.accessToken);
        setAccessToken(res.accessToken);
        if (onShowNotification) {
          onShowNotification('Successfully authenticated via Google Integration!', 'success');
        }
      }
    } catch (e: any) {
      console.error(e);
      if (onShowNotification) {
        onShowNotification('Sign in authentication failed. Please retry.', 'error');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out from Cloud sync?')) {
      await logoutAndReset();
      setCurrentUser(null);
      setAccessTokenState(null);
      if (onShowNotification) {
        onShowNotification('Signed out from Google Cloud sync.', 'info');
      }
    }
  };

  // 1. Firebase Cloud Firestore Operations
  const handleBackupToFirestore = async () => {
    if (!currentUser) return;
    setIsCloudSyncing(true);
    try {
      // Sync profile
      const syncedProfile = await syncUserProfile(currentUser, {
        xp: localProfile.lifetimeXp,
        totalTests: localProfile.totalTests,
        bestCps: localProfile.bestCps,
        avgCps: localProfile.averageCps
      });

      // Update local profile with merged cloud values if needed
      if (syncedProfile) {
        const merged = {
          ...localProfile,
          lifetimeXp: syncedProfile.xp,
          totalTests: syncedProfile.totalTests,
          bestCps: syncedProfile.bestCps,
          averageCps: syncedProfile.avgCps,
          authProvider: 'Google' as const
        };
        setLocalProfile(merged);
        localStorage.setItem('chronos_profile_v3', JSON.stringify(merged));
      }

      // Sync all Click Records
      if (records.length > 0) {
        await syncClickRecordsToCloud(currentUser.uid, records);
      }

      if (onShowNotification) {
        onShowNotification('All stats & click records synced securely to Cloud Firestore!', 'success');
      }
    } catch (e: any) {
      console.error(e);
      if (onShowNotification) {
        onShowNotification('Failed to sync data to Firestore.', 'error');
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleFetchFromFirestore = async () => {
    if (!currentUser) return;
    if (!confirm('This will fetch your cloud records and merge them into your local performance tracking history. Continue?')) {
      return;
    }
    setIsCloudSyncing(true);
    try {
      const cloudProfile = await syncUserProfile(currentUser);
      if (cloudProfile) {
        const updated = {
          ...localProfile,
          lifetimeXp: cloudProfile.xp,
          totalTests: cloudProfile.totalTests,
          bestCps: cloudProfile.bestCps,
          averageCps: cloudProfile.avgCps,
          authProvider: 'Google' as const
        };
        setLocalProfile(updated);
        localStorage.setItem('chronos_profile_v3', JSON.stringify(updated));
      }

      const cloudRecords = await fetchCloudRecords(currentUser.uid);
      if (cloudRecords.length > 0) {
        // Merge cloud records with local records avoiding duplicates
        const localIds = new Set(records.map(r => r.id));
        const newRecords = [...records];
        cloudRecords.forEach(cr => {
          if (!localIds.has(cr.id)) {
            newRecords.push(cr);
          }
        });
        
        // Sort descending by date or id
        newRecords.sort((a,b) => b.id.localeCompare(a.id));
        setRecords(newRecords);
        localStorage.setItem('cps_records', JSON.stringify(newRecords));
        
        if (onShowNotification) {
          onShowNotification(`Successfully recovered ${cloudRecords.length} records from your Google Cloud!`, 'success');
        }
      } else {
        if (onShowNotification) {
          onShowNotification('No previous records found on your cloud profile.', 'info');
        }
      }
    } catch (e: any) {
      console.error(e);
      if (onShowNotification) {
        onShowNotification('Failed to fetch from Cloud Firestore.', 'error');
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // 2. Google Sheets REST operations
  const handleCreateNewSheet = async () => {
    const token = accessToken || getAccessToken();
    if (!token) {
      if (onShowNotification) {
        onShowNotification('Authenticator expired. Please re-sign-in to request Sheets permissions.', 'error');
      }
      return;
    }
    
    setIsSheetCreating(true);
    try {
      const title = `CPSTEST - ${currentUser?.displayName || 'Gamer'} Speed Records`;
      const sheet = await createGoogleSpreadsheet(token, title);
      
      setSpreadsheetId(sheet.id);
      setSpreadsheetUrl(sheet.url);
      localStorage.setItem('google_sheets_spreadsheet_id', sheet.id);
      localStorage.setItem('google_sheets_spreadsheet_url', sheet.url);

      if (onShowNotification) {
        onShowNotification('Branded Google Sheet created successfully!', 'success');
      }
    } catch (e: any) {
      console.error(e);
      if (onShowNotification) {
        onShowNotification(e.message || 'Failed to create Google Sheet.', 'error');
      }
    } finally {
      setIsSheetCreating(false);
    }
  };

  const handleLinkExistingSheet = () => {
    if (!manualSheetId.trim()) return;
    
    const id = manualSheetId.trim();
    const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;
    
    setSpreadsheetId(id);
    setSpreadsheetUrl(url);
    localStorage.setItem('google_sheets_spreadsheet_id', id);
    localStorage.setItem('google_sheets_spreadsheet_url', url);
    setManualSheetId('');

    if (onShowNotification) {
      onShowNotification('Linked existing Google Spreadsheet!', 'success');
    }
  };

  const handleDisassociateSheet = () => {
    if (confirm('Are you sure you want to unlink the current spreadsheet? Records will remain untouched inside Google Sheets.')) {
      setSpreadsheetId('');
      setSpreadsheetUrl('');
      localStorage.removeItem('google_sheets_spreadsheet_id');
      localStorage.removeItem('google_sheets_spreadsheet_url');
      if (onShowNotification) {
        onShowNotification('Spreadsheet unlinked.', 'info');
      }
    }
  };

  const handleExportAllToSheet = async () => {
    const token = accessToken || getAccessToken();
    if (!token || !spreadsheetId) return;

    setIsExporting(true);
    try {
      await exportRecordsBufferToSheet(token, spreadsheetId, records);
      if (onShowNotification) {
        onShowNotification(`Export completed! Appended ${records.length} records as rows into Sheets.`, 'success');
      }
    } catch (e: any) {
      console.error(e);
      if (onShowNotification) {
        onShowNotification(e.message || 'Failed to export rows to Spreadsheet.', 'error');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const toggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    localStorage.setItem('google_sheets_autosync', String(nextVal));
    if (onShowNotification) {
      onShowNotification(`Google Sheets Auto-Sync: ${nextVal ? 'ENABLED' : 'DISABLED'}`, 'info');
    }
  };

  return (
    <div id="sheets-sync-panel-container" className="p-5 bg-gradient-to-tr from-[#0e1324] to-[#12162d] border border-[#1e294b] rounded-3xl space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header section with icons */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e294b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Cloud size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-rose border-0 m-0 text-white uppercase tracking-wider flex items-center gap-2">
              <span>Google Cloud & Sheets Engine</span>
              <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full">REAL</span>
            </h3>
            <p className="text-[10px] text-slate-400">Save test values in real-time, backup parameters, & export lists to Google Sheets.</p>
          </div>
        </div>
      </div>

      {/* Guest Authentication Action Check */}
      {!currentUser ? (
        <div className="p-4 bg-slate-900/50 border border-dashed border-slate-850 rounded-2xl space-y-3.5 text-center">
          <AlertCircle size={28} className="mx-auto text-yellow-500 bg-yellow-500/5 p-1 rounded-lg" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Awaiting Google Authentication</h4>
            <p className="text-[10px] text-slate-500">Log in securely with Google to grant permission to write rows directly to spreadsheets and secure your athlete profile in Firebase Firestore database.</p>
          </div>
          
          <button
            type="button"
            disabled={isAuthLoading}
            onClick={handleSignIn}
            className="py-2.5 px-6 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
          >
            {isAuthLoading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="animate-pulse" />
            )}
            <span>Sign in with Google Account</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* User Logged Info Display */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl border border-slate-700 shadow"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center font-bold text-slate-950 text-sm">
                  {currentUser.displayName?.substring(0, 2) || 'US'}
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-white leading-normal">{currentUser.displayName}</p>
                <p className="text-[10px] text-slate-500">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="py-1.5 px-3 bg-slate-800 hover:bg-red-950 hover:text-red-400 hover:border-red-500/20 text-slate-400 border border-slate-750 text-[10px] font-extrabold uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Disconnect</span>
            </button>
          </div>

          {/* Grid splitting Firestore vs Google Sheets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: Firebase Persistent Sync Box */}
            <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <Database size={11} />
                  <span>Firebase Backups</span>
                </span>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mt-2">Durable Firestore Storage</h4>
                <p className="text-[10px] text-slate-400 mt-1">Export your local stats and click history into secure Firestore database, allowing cross-device tracking.</p>
              </div>

              <div className="flex gap-2 pt-2.5">
                <button
                  onClick={handleBackupToFirestore}
                  disabled={isCloudSyncing}
                  className="flex-1 py-2 bg-[#151c33] border border-slate-750 hover:border-emerald-500/30 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-xl transition-all hover:bg-[#1f284d] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCloudSyncing ? <RefreshCw size={12} className="animate-spin" /> : <ArrowUp size={12} />}
                  <span>Backup to Cloud</span>
                </button>
                <button
                  onClick={handleFetchFromFirestore}
                  disabled={isCloudSyncing}
                  className="flex-1 py-2 bg-slate-950/50 border border-slate-850 hover:border-emerald-500/20 text-slate-400 font-extrabold text-[10px] uppercase tracking-wide rounded-xl transition-all hover:bg-slate-900 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCloudSyncing ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                  <span>Restore from Cloud</span>
                </button>
              </div>
            </div>

            {/* Box 2: Google Sheets Sync Box */}
            <div className="p-4 bg-[#061e13]/10 border border-[#113123]/40 rounded-2xl space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <Database size={11} />
                  <span>Spreadsheets Auth</span>
                </span>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mt-2">Google Sheets Link Status</h4>
                
                {spreadsheetId ? (
                  <div className="mt-1.5 p-2 bg-[#092217] border border-[#1d4432] rounded-xl text-[10px] space-y-1 text-emerald-400">
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>Linked to spreadsheet</span>
                    </p>
                    <p className="font-mono text-[9px] text-slate-400 truncate select-all">{spreadsheetId}</p>
                    
                    <div className="pt-1.5 flex items-center justify-between gap-2.5">
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Document</span>
                        <ExternalLink size={10} />
                      </a>

                      <button
                        onClick={handleDisassociateSheet}
                        className="text-red-400 text-[9px] font-black uppercase hover:underline cursor-pointer"
                      >
                        Unlink Sheet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    <p className="text-[10px] text-slate-400 leading-normal">Setup a spreadsheet to export records automatically in real-time or export them now.</p>
                    
                    <button
                      onClick={handleCreateNewSheet}
                      disabled={isSheetCreating}
                      className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isSheetCreating ? (
                        <RefreshCw size={11} className="animate-spin" />
                      ) : (
                        <Plus size={11} />
                      )}
                      <span>Create New Branded Sheet</span>
                    </button>

                    {/* Manual spreadsheet id form */}
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Paste existing Sheet ID..."
                        value={manualSheetId}
                        onChange={(e) => setManualSheetId(e.target.value)}
                        className="flex-1 bg-[#091510] border border-[#1b3d2f] rounded-lg px-2 text-[9px] text-emerald-300 outline-none placeholder-[#1c4735]"
                      />
                      <button
                        onClick={handleLinkExistingSheet}
                        className="py-1 px-2 border border-[#1b3d2f] hover:bg-[#153428] text-slate-300 font-bold text-[9px] uppercase rounded-lg transition-all cursor-pointer"
                      >
                        <LinkIcon size={10} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {spreadsheetId && (
                <div id="attached-spreadsheet-actions" className="space-y-2 pt-2 border-t border-[#133727]/30">
                  {/* Auto-Sync Toggle widget */}
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-semibold">Auto-Sync new completed tests</span>
                    <button
                      onClick={toggleAutoSync}
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center ${
                        autoSync ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 bg-white rounded-full transition-transform absolute shadow ${
                          autoSync ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={handleExportAllToSheet}
                    disabled={isExporting || records.length === 0}
                    className="w-full py-1.5 bg-[#092d1c] border border-[#1c4832] hover:bg-[#0f442b] disabled:bg-slate-950/20 disabled:text-slate-600 disabled:border-slate-900 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isExporting ? <RefreshCw size={11} className="animate-spin" /> : <ArrowUp size={11} />}
                    <span>Sync all ({records.length}) records to Sheet</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
