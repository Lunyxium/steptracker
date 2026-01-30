import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors, typography, spacing } from '../../constants/theme';
import { DayEntry } from '../../types';
import { getLastNDays, getWeekdayAbbrev } from '../../utils/date';

interface HistoryChartProps {
  data: DayEntry[];
  goal: number;
}

export function HistoryChart({ data, goal }: HistoryChartProps) {
  const last7Days = getLastNDays(7);

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach((entry) => {
    dataMap.set(entry.date, entry.steps);
  });

  // Find max value for scaling
  const maxSteps = Math.max(goal, ...data.map((d) => d.steps));

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Letzte 7 Tage</Text>
      <View style={styles.chartContainer}>
        {last7Days.map((date) => {
          const steps = dataMap.get(date) || 0;
          const heightPercent = maxSteps > 0 ? (steps / maxSteps) * 100 : 0;
          const isGoalReached = steps >= goal;

          return (
            <View key={date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercent, 5)}%`,
                      backgroundColor: isGoalReached ? colors.primary : colors.surfaceLight,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{getWeekdayAbbrev(date)}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
