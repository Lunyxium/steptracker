import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressRing } from '../ui/ProgressRing';
import { colors, typography, spacing } from '../../constants/theme';
import { formatNumber, calculatePercentage } from '../../utils/formatting';

interface StepCounterProps {
  steps: number;
  goal: number;
}

export function StepCounter({ steps, goal }: StepCounterProps) {
  const percentage = calculatePercentage(steps, goal);

  return (
    <View style={styles.container}>
      <ProgressRing progress={percentage} size={220} strokeWidth={14} />
      <View style={styles.content}>
        <Text style={styles.steps}>{formatNumber(steps)}</Text>
        <Text style={styles.label}>steps</Text>
        <View style={styles.divider} />
        <Text style={styles.goal}>/ {formatNumber(goal)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
  },
  steps: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.text,
  },
  label: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  goal: {
    fontSize: typography.base,
    color: colors.textMuted,
  },
});
