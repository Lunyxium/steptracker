import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { PedometerData } from '../types';
import { getStartOfToday } from '../utils/date';

export function usePedometer(firestoreBaseline: number = 0): PedometerData {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseStepsRef = useRef(0);
  const hadHistoricalRef = useRef(false);

  // When Firestore data arrives and historical steps weren't available,
  // use Firestore as the baseline so steps survive app restarts
  useEffect(() => {
    if (!hadHistoricalRef.current && firestoreBaseline > baseStepsRef.current) {
      baseStepsRef.current = firestoreBaseline;
      setSteps((prev) => Math.max(prev, firestoreBaseline));
    }
  }, [firestoreBaseline]);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const subscribe = async () => {
      try {
        // Request runtime permission (required on Android 10+)
        const { status } = await Pedometer.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Motion permission denied');
          return;
        }

        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          setError('Pedometer not available on this device');
          return;
        }

        // Get steps from midnight until now
        const start = getStartOfToday();
        const end = new Date();

        try {
          const result = await Pedometer.getStepCountAsync(start, end);
          baseStepsRef.current = result.steps;
          hadHistoricalRef.current = true;
          setSteps(result.steps);
        } catch (e) {
          // Historical steps not available — use Firestore baseline as fallback
          console.log('Historical step count not available, using Firestore baseline');
          baseStepsRef.current = firestoreBaseline;
          setSteps(firestoreBaseline);
        }

        // Subscribe to live updates
        subscription = Pedometer.watchStepCount((result) => {
          setSteps(baseStepsRef.current + result.steps);
        });
      } catch (e) {
        setError('Failed to initialize pedometer');
        console.error('Pedometer error:', e);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { steps, isAvailable, error };
}
