import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { DayEntry, Settings } from '../types';
import { APP_CONFIG } from '../constants/config';

// Save or update today's step data
export async function saveStepData(
  userId: string,
  date: string,
  data: Omit<DayEntry, 'id' | 'updatedAt'>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'steps', date);
  await setDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

// Get step data for a specific date
export async function getStepData(userId: string, date: string): Promise<DayEntry | null> {
  const docRef = doc(db, 'users', userId, 'steps', date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      date,
      steps: data.steps || 0,
      distance: data.distance || 0,
      calories: data.calories || 0,
      goalReached: data.goalReached || false,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  return null;
}

// Get step history (last N entries)
export async function getStepHistory(userId: string, limitCount: number = 30): Promise<DayEntry[]> {
  const stepsRef = collection(db, 'users', userId, 'steps');
  const q = query(stepsRef, orderBy('updatedAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);

  const entries: DayEntry[] = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    entries.push({
      id: docSnap.id,
      date: docSnap.id,
      steps: data.steps || 0,
      distance: data.distance || 0,
      calories: data.calories || 0,
      goalReached: data.goalReached || false,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  });

  return entries;
}

// Save user settings
export async function saveSettings(userId: string, settings: Settings): Promise<void> {
  const docRef = doc(db, 'users', userId, 'settings', 'preferences');
  await setDoc(docRef, settings, { merge: true });
}

// Get user settings
export async function getSettings(userId: string): Promise<Settings> {
  const docRef = doc(db, 'users', userId, 'settings', 'preferences');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      gpsEnabled: data.gpsEnabled ?? true,
      vibrationEnabled: data.vibrationEnabled ?? true,
      dailyGoal: data.dailyGoal ?? APP_CONFIG.DEFAULT_GOAL,
    };
  }

  // Return defaults
  return {
    gpsEnabled: true,
    vibrationEnabled: true,
    dailyGoal: APP_CONFIG.DEFAULT_GOAL,
  };
}
