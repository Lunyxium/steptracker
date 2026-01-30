import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { PedometerData } from '../types';
import { getStartOfToday } from '../utils/date';

const POLL_INTERVAL = 5000; // Poll hardware counter every 5 seconds

export function usePedometer(firestoreBaseline: number = 0): PedometerData {
	const [steps, setSteps] = useState(0);
	const [isAvailable, setIsAvailable] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const usesPollRef = useRef(false);

	// Fallback: update from Firestore when subscription mode can't get historical data
	useEffect(() => {
		if (!usesPollRef.current && firestoreBaseline > 0) {
			setSteps((prev) => Math.max(prev, firestoreBaseline));
		}
	}, [firestoreBaseline]);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;
		let subscription: Pedometer.Subscription | null = null;

		const setup = async () => {
			try {
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

				// --- Primary: poll the hardware step counter ---
				const start = getStartOfToday();

				try {
					const initial = await Pedometer.getStepCountAsync(start, new Date());
					setSteps(Math.max(initial.steps, firestoreBaseline));
					usesPollRef.current = true;

					// Poll periodically — reads from the OS hardware counter,
					// not the accelerometer, so only real steps are counted
					interval = setInterval(async () => {
						try {
							const result = await Pedometer.getStepCountAsync(start, new Date());
							setSteps(result.steps);
						} catch {
							// Individual poll failed, skip this cycle
						}
					}, POLL_INTERVAL);

					return; // Success — don't set up subscription fallback
				} catch (e) {
					console.log('Hardware step counter not available, falling back to watchStepCount');
				}

				// --- Fallback: accelerometer-based subscription ---
				usesPollRef.current = false;
				const baseSteps = firestoreBaseline;
				setSteps(firestoreBaseline);

				subscription = Pedometer.watchStepCount((result) => {
					setSteps(baseSteps + result.steps);
				});
			} catch (e) {
				setError('Failed to initialize pedometer');
				console.error('Pedometer error:', e);
			}
		};

		setup();

		return () => {
			if (interval) clearInterval(interval);
			if (subscription) subscription.remove();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { steps, isAvailable, error };
}
