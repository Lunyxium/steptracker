import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useStepData } from '../../hooks/useStepData';
import { HistoryChart } from '../../components/features/HistoryChart';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing } from '../../constants/theme';
import { formatNumber, formatDistance } from '../../utils/formatting';
import { formatDateDisplay } from '../../utils/date';
import { DayEntry } from '../../types';

export default function HistoryScreen() {
  const { user } = useAuth();
  const { history, settings, loading, refreshHistory } = useStepData(user?.uid);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  }, [refreshHistory]);

  const renderHistoryItem = ({ item }: { item: DayEntry }) => (
    <Card style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <View style={styles.historyDate}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.historyDateText}>{formatDateDisplay(item.date)}</Text>
        </View>
        {item.goalReached && (
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
        )}
      </View>
      <Text style={styles.historyStats}>
        {formatNumber(item.steps)} steps · {formatDistance(item.distance)} km
      </Text>
    </Card>
  );

  const ListHeader = () => (
    <View style={styles.chartContainer}>
      <HistoryChart data={history} goal={settings.dailyGoal} />
      <Text style={styles.sectionTitle}>Alle Einträge</Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="walk-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyText}>No step data yet</Text>
      <Text style={styles.emptySubtext}>Start walking to see your history</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

// Need to import React for useState
import React from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyItem: {
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyDateText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  historyStats: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyText: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
