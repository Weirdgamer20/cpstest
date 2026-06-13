import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClickRecord } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure Google OAuth Provider with Sheets scope
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Firestore Error Handling System as mandated by security parameters
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Memory Cache for Access Token to interact with Google Sheets API directly
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In trigger (returns User & access token for Sheets)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    
    // Auto-create/sync user profile on login
    if (result.user) {
      await syncUserProfile(result.user);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Logout handler
export const logoutAndReset = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Access token getter
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Set manual token if retrieved otherwise (or to preserve inside session)
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// ----------------------------------------------------
// FIRESTORE SERVICES (SYNC RECORDS & PROFILES)
// ----------------------------------------------------

export interface CloudProfile {
  uid: string;
  email: string;
  xp: number;
  totalTests: number;
  bestCps: number;
  avgCps: number;
}

// Sync profile data to Firestore
export const syncUserProfile = async (user: User, localProfileData?: { xp: number; totalTests: number; bestCps: number; avgCps: number }) => {
  const userRef = doc(db, 'users', user.uid);
  try {
    // Check if cloud profile already exists
    const cloudSnap = await getDoc(userRef);
    let finalProfile: CloudProfile;

    if (cloudSnap.exists()) {
      const dbData = cloudSnap.data() as CloudProfile;
      if (localProfileData) {
        // Merge - favor highest metrics
        finalProfile = {
          uid: user.uid,
          email: user.email || '',
          xp: Math.max(dbData.xp, localProfileData.xp),
          totalTests: Math.max(dbData.totalTests, localProfileData.totalTests),
          bestCps: Math.max(dbData.bestCps, localProfileData.bestCps),
          avgCps: parseFloat(((dbData.avgCps + localProfileData.avgCps) / 2).toFixed(2))
        };
      } else {
        finalProfile = dbData;
      }
    } else {
      // First time, seed with local data or standard defaults
      finalProfile = {
        uid: user.uid,
        email: user.email || '',
        xp: localProfileData?.xp || 0,
        totalTests: localProfileData?.totalTests || 0,
        bestCps: localProfileData?.bestCps || 0,
        avgCps: localProfileData?.avgCps || 0
      };
    }

    await setDoc(userRef, finalProfile);
    return finalProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
};

// Upload standard records batch to Firestore
export const syncClickRecordsToCloud = async (userId: string, records: ClickRecord[]) => {
  try {
    const batch = writeBatch(db);
    records.forEach((record) => {
      const docRef = doc(db, 'users', userId, 'records', record.id);
      batch.set(docRef, {
        id: record.id,
        date: record.date,
        duration: record.duration,
        clicks: record.clicks,
        cps: record.cps,
        type: record.type
      });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/records [batch]`);
  }
};

// Add single record to cloud
export const saveSingleRecordToCloud = async (userId: string, record: ClickRecord) => {
  const path = `users/${userId}/records/${record.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'records', record.id);
    await setDoc(docRef, {
      id: record.id,
      date: record.date,
      duration: record.duration,
      clicks: record.clicks,
      cps: record.cps,
      type: record.type
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Download records from cloud
export const fetchCloudRecords = async (userId: string): Promise<ClickRecord[]> => {
  const recordsCol = collection(db, 'users', userId, 'records');
  try {
    const querySnap = await getDocs(recordsCol);
    const cloudRecords: ClickRecord[] = [];
    querySnap.forEach((doc) => {
      cloudRecords.push(doc.data() as ClickRecord);
    });
    return cloudRecords;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/records`);
    return [];
  }
};

// ----------------------------------------------------
// GOOGLE SHEETS REST API OPERATIONS
// ----------------------------------------------------

/**
 * Creates a brand new spreadsheet in Google Sheets and returns the ID and URL
 */
export const createGoogleSpreadsheet = async (accessToken: string, titleStr: string = 'CPS Click Speed Test Records'): Promise<{ id: string; url: string }> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: titleStr
      },
      sheets: [
        {
          properties: {
            title: 'Click Records'
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const parsedError = await response.json().catch(() => ({}));
    throw new Error(parsedError.error?.message || 'Failed to create Google Spreadsheet');
  }

  const result = await response.json();
  const id = result.spreadsheetId;
  const url = result.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`;

  // Initialize spreadsheet with header row automatically
  await appendSpreadsheetRows(accessToken, id, 'Click Records!A1:F1', [
    ['Test ID', 'Date Logged', 'Duration', 'Clicks Recorded', 'CPS (Clicks/Sec)', 'Category']
  ]);

  return { id, url };
};

/**
 * Appends rows of values to a given spreadsheet
 */
export const appendSpreadsheetRows = async (
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rows: string[][] | number[][] | any[][]
): Promise<any> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: range,
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!response.ok) {
    const parsedError = await response.json().catch(() => ({}));
    throw new Error(parsedError.error?.message || 'Failed to append data to Google Sheet');
  }

  return await response.json();
};

/**
 * Batch exports entire records list to Google Sheets
 */
export const exportRecordsBufferToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  records: ClickRecord[]
): Promise<void> => {
  if (records.length === 0) return;
  const dataRows = records.map(rec => [
    rec.id,
    rec.date,
    rec.duration,
    rec.clicks,
    rec.cps,
    rec.type
  ]);

  await appendSpreadsheetRows(accessToken, spreadsheetId, 'Click Records!A2:F', dataRows);
};
