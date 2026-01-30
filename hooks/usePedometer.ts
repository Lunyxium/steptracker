import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { PedometerData } from '../types';
import { getStartOfToday } from '../utils/date';

export function usePedometer(): PedometerData {
  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseStepsRef = useRef(0);

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const subscribe = async () => {
      try {
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
          setSteps(result.steps);
        } catch (e) {
          // Some devices don't support historical step count
          console.log('Historical step count not available');
          baseStepsRef.current = 0;
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
  }, []);

  return { steps, isAvailable, error };
}
