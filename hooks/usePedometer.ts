import { useState, useEffect, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { PedometerData } from '../types';
import { getStartOfToday } from '../utils/date';

const POLL_INTERVAL = 5000;
// Max realistic step rate: ~3 steps/sec (fast running)
// Anything above is likely a false positive (phone pickup, unlock, etc.)
const MAX_STEPS_PER_SECOND = 3;

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

					interval = setInterval(async () => {
						try {
							const result = await Pedometer.getStepCountAsync(start, new Date());
							setSteps(result.steps);
						} catch {
							// Individual poll failed, skip this cycle
						}
					}, POLL_INTERVAL);

					return;
				} catch (e) {
					// Log the actual error so we know why hardware polling failed
					console.warn('getStepCountAsync failed:', e instanceof Error ? e.message : e);
					console.warn('Falling back to watchStepCount (accelerometer-based, less accurate)');
				}

				// --- Fallback: subscription with rate filter ---
				usesPollRef.current = false;
				const baseSteps = firestoreBaseline;
				let acceptedSteps = 0;
				let lastUpdateTime = Date.now();
				let lastRawSteps = 0;

				setSteps(firestoreBaseline);

				subscription = Pedometer.watchStepCount((result) => {
					const now = Date.now();
					const timeDelta = (now - lastUpdateTime) / 1000; // seconds
					const stepDelta = result.steps - lastRawSteps;

					// Filter: reject if step rate exceeds realistic walking/running pace
					if (timeDelta > 0 && stepDelta > 0) {
						const rate = stepDelta / timeDelta;

						if (rate <= MAX_STEPS_PER_SECOND) {
							// Realistic pace — accept all steps
							acceptedSteps += stepDelta;
						} else {
							// Too fast — cap to max realistic rate
							acceptedSteps += Math.round(MAX_STEPS_PER_SECOND * timeDelta);
						}
					}

					lastRawSteps = result.steps;
					lastUpdateTime = now;
					setSteps(baseSteps + acceptedSteps);
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
