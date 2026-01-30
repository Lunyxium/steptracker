import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayString } from '../utils/date';

/**
 * Check if goal is reached and vibrate (only once per day)
 */
export async function checkAndVibrateForGoal(
  currentSteps: number,
  goal: number,
  vibrationEnabled: boolean
): Promise<boolean> {
  if (!vibrationEnabled || currentSteps < goal) {
    return false;
  }

  const today = getTodayString();
  const key = `goalReached_${today}`;

  try {
    const alreadyVibrated = await AsyncStorage.getItem(key);

    if (!alreadyVibrated) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await AsyncStorage.setItem(key, 'true');
      return true;
    }
  } catch (error) {
    console.error('Error checking goal vibration:', error);
  }

  return false;
}

/**
 * Trigger a light haptic feedback
 */
export async function lightHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Haptics not available on some devices
  }
}

/**
 * Trigger a medium haptic feedback
 */
export async function mediumHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Haptics not available on some devices
  }
}
