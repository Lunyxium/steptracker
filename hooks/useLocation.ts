import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationData } from '../types';
import { calculateHaversine } from '../utils/distance';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function useLocation(enabled: boolean): LocationData {
  const [distance, setDistance] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPositionRef = useRef<LocationCoords | null>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const totalDistanceRef = useRef(0);

  const stopTracking = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      setError(null);
      setIsTracking(true);

      // Get initial position
      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      lastPositionRef.current = {
        latitude: initialPosition.coords.latitude,
        longitude: initialPosition.coords.longitude,
      };

      // Watch position changes
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (location) => {
          if (lastPositionRef.current) {
            const delta = calculateHaversine(
              lastPositionRef.current.latitude,
              lastPositionRef.current.longitude,
              location.coords.latitude,
              location.coords.longitude
            );

            // Only add distance if it's reasonable (< 100m to filter GPS jumps)
            if (delta < 0.1) {
              totalDistanceRef.current += delta;
              setDistance(totalDistanceRef.current);
            }
          }

          lastPositionRef.current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      );
    } catch (e) {
      setError('Failed to start location tracking');
      console.error('Location error:', e);
    }
  }, [enabled]);

  // Start tracking when enabled changes
  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, startTracking, stopTracking]);

  return {
    distance,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}
