import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase';

export type MorningSicknessLevel = 'none' | 'mild' | 'moderate' | 'severe';

export interface SymptomLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  pregnancyWeek: number;
  morningSickness: MorningSicknessLevel;
  energyLevel: number; // 1 to 5
  cravings: string;
  symptoms: string[];
  notes: string;
  waterGlasses: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save or update a daily symptom log in Firestore
 */
export async function saveDailySymptomLog(
  userId: string,
  log: Omit<SymptomLog, 'userId'>
): Promise<void> {
  const docPath = `users/${userId}/symptomLogs/${log.date}`;
  try {
    const docRef = doc(db, 'users', userId, 'symptomLogs', log.date);
    const nowIso = new Date().toISOString();

    const payload: SymptomLog = {
      userId,
      date: log.date,
      pregnancyWeek: log.pregnancyWeek,
      morningSickness: log.morningSickness,
      energyLevel: log.energyLevel,
      cravings: (log.cravings || '').slice(0, 500),
      symptoms: (log.symptoms || []).slice(0, 20),
      notes: (log.notes || '').slice(0, 1000),
      waterGlasses: Math.min(30, Math.max(0, log.waterGlasses || 0)),
      updatedAt: nowIso,
      createdAt: log.createdAt || nowIso,
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Fetch a single day's symptom log
 */
export async function fetchSymptomLogForDate(
  userId: string,
  dateStr: string
): Promise<SymptomLog | null> {
  const docPath = `users/${userId}/symptomLogs/${dateStr}`;
  try {
    const docRef = doc(db, 'users', userId, 'symptomLogs', dateStr);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data() as SymptomLog;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Real-time listener for user's symptom logs
 */
export function subscribeUserSymptomLogs(
  userId: string,
  onData: (logs: SymptomLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colPath = `users/${userId}/symptomLogs`;
  try {
    const colRef = collection(db, 'users', userId, 'symptomLogs');
    const q = query(colRef, orderBy('date', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: SymptomLog[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as SymptomLog) });
        });
        onData(items);
      },
      (error) => {
        if (onError) {
          onError(error as Error);
        }
        handleFirestoreError(error, OperationType.LIST, colPath);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, colPath);
    return () => {};
  }
}

/**
 * Delete a daily symptom log
 */
export async function deleteSymptomLog(userId: string, dateStr: string): Promise<void> {
  const docPath = `users/${userId}/symptomLogs/${dateStr}`;
  try {
    const docRef = doc(db, 'users', userId, 'symptomLogs', dateStr);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
