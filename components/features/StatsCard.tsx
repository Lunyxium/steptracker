import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { colors, typography, spacing } from '../../constants/theme';

interface StatsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

export function StatsCard({ icon, value, label }: StatsCardProps) {
  return (
    <Card style={styles.card}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  value: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
