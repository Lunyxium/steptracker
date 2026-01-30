import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { usePedometer } from '../../hooks/usePedometer';
import { useLocation } from '../../hooks/useLocation';
import { useStepData } from '../../hooks/useStepData';
import { StepCounter } from '../../components/features/StepCounter';
import { StatsCard } from '../../components/features/StatsCard';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing } from '../../constants/theme';
import { formatDistance, formatCalories, calculatePercentage } from '../../utils/formatting';
import { checkAndVibrateForGoal } from '../../services/notifications';
import { APP_CONFIG } from '../../constants/config';

export default function HomeScreen() {
  const { user } = useAuth();
  const { settings, todayData, updateTodayData } = useStepData(user?.uid);
  const { steps, isAvailable: pedometerAvailable } = usePedometer(todayData?.steps ?? 0);
  const { distance: gpsDistance } = useLocation(settings.gpsEnabled, todayData?.distance ?? 0);
  const lastSaveRef = useRef(0);

  // Use GPS distance when available, otherwise estimate from steps
  const stepEstimatedDistance = steps * APP_CONFIG.STEP_LENGTH_KM;
  const distance = settings.gpsEnabled ? Math.max(gpsDistance, stepEstimatedDistance) : stepEstimatedDistance;

  const calories = Math.round(steps * APP_CONFIG.CALORIES_PER_STEP);
  const percentage = calculatePercentage(steps, settings.dailyGoal);
  const goalReached = steps >= settings.dailyGoal;

  // Check for goal achievement vibration
  useEffect(() => {
    if (steps > 0) {
      checkAndVibrateForGoal(steps, settings.dailyGoal, settings.vibrationEnabled);
    }
  }, [steps, settings.dailyGoal, settings.vibrationEnabled]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const now = Date.now();
    if (steps > 0 && now - lastSaveRef.current >= APP_CONFIG.AUTO_SAVE_INTERVAL) {
      updateTodayData(steps, distance, goalReached);
      lastSaveRef.current = now;
    }
  }, [steps, distance, goalReached, updateTodayData]);

  // Save on significant changes
  useEffect(() => {
    if (steps > 0 && steps % 100 === 0) {
      updateTodayData(steps, distance, goalReached);
    }
  }, [steps, distance, goalReached, updateTodayData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>StepTracker</Text>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={40} color={colors.textSecondary} />
          </View>
        </View>

        {/* Pedometer Status */}
        {!pedometerAvailable && (
          <Card style={styles.warningCard}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={styles.warningText}>Pedometer not available on this device</Text>
          </Card>
        )}

        {/* Step Counter */}
        <View style={styles.counterContainer}>
          <StepCounter steps={steps} goal={settings.dailyGoal} />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard icon="walk" value={formatDistance(distance)} label="km" />
          <View style={styles.statsSpacer} />
          <StatsCard icon="flame" value={formatCalories(calories)} label="kcal" />
        </View>

        {/* Goal Progress */}
        <Card style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Today's Goal</Text>
            <Text style={styles.goalPercent}>{Math.round(percentage)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
          {goalReached && (
            <View style={styles.goalReachedContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.goalReachedText}>Goal reached!</Text>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
  },
  avatar: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  warningText: {
    color: colors.warning,
    fontSize: typography.sm,
  },
  counterContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statsSpacer: {
    width: spacing.md,
  },
  goalCard: {
    marginTop: spacing.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  goalPercent: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalReachedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  goalReachedText: {
    color: colors.success,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
});
