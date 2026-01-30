import { useState, useEffect, useCallback, useRef } from 'react';
import { DayEntry, Settings } from '../types';
import { saveStepData, getStepData, getStepHistory, getSettings, saveSettings } from '../services/firestore';
import { getTodayString } from '../utils/date';
import { APP_CONFIG } from '../constants/config';

interface UseStepDataResult {
  todayData: DayEntry | null;
  history: DayEntry[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateTodayData: (steps: number, distance: number, goalReached: boolean) => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useStepData(userId: string | undefined): UseStepDataResult {
  const [todayData, setTodayData] = useState<DayEntry | null>(null);
  const [history, setHistory] = useState<DayEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({
    gpsEnabled: true,
    vibrationEnabled: true,
    dailyGoal: APP_CONFIG.DEFAULT_GOAL,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSaveRef = useRef<string>('');

  // Load initial data
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [todayResult, historyResult, settingsResult] = await Promise.all([
          getStepData(userId, getTodayString()),
          getStepHistory(userId, 30),
          getSettings(userId),
        ]);

        setTodayData(todayResult);
        setHistory(historyResult);
        setSettings(settingsResult);
      } catch (e) {
        setError('Failed to load data');
        console.error('useStepData load error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const updateTodayData = useCallback(
    async (steps: number, distance: number, goalReached: boolean) => {
      if (!userId || loading) return;

      // Never overwrite Firestore with lower values
      if (todayData && steps < todayData.steps) return;

      const today = getTodayString();
      const calories = Math.round(steps * APP_CONFIG.CALORIES_PER_STEP);

      // Prevent duplicate saves
      const saveKey = `${steps}-${distance}-${goalReached}`;
      if (saveKey === lastSaveRef.current) return;
      lastSaveRef.current = saveKey;

      try {
        await saveStepData(userId, today, {
          date: today,
          steps,
          distance,
          calories,
          goalReached,
        });

        setTodayData((prev) => ({
          id: today,
          date: today,
          steps,
          distance,
          calories,
          goalReached,
          updatedAt: new Date(),
        }));
      } catch (e) {
        console.error('Failed to save step data:', e);
      }
    },
    [userId, loading, todayData]
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<Settings>) => {
      if (!userId) return;

      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      try {
        await saveSettings(userId, updated);
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    },
    [userId, settings]
  );

  const refreshHistory = useCallback(async () => {
    if (!userId) return;

    try {
      const historyResult = await getStepHistory(userId, 30);
      setHistory(historyResult);
    } catch (e) {
      console.error('Failed to refresh history:', e);
    }
  }, [userId]);

  return {
    todayData,
    history,
    settings,
    loading,
    error,
    updateTodayData,
    updateSettings,
    refreshHistory,
  };
}
