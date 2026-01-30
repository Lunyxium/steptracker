import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useStepData } from '../../hooks/useStepData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { formatNumber } from '../../utils/formatting';
import { APP_CONFIG } from '../../constants/config';
import { mediumHaptic } from '../../services/notifications';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { settings, updateSettings } = useStepData(user?.uid);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleGoalChange = (delta: number) => {
    const newGoal = settings.dailyGoal + delta;
    if (newGoal >= APP_CONFIG.MIN_GOAL && newGoal <= APP_CONFIG.MAX_GOAL) {
      mediumHaptic();
      updateSettings({ dailyGoal: newGoal });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <Card style={styles.userCard}>
          <Ionicons name="person-circle" size={48} color={colors.textSecondary} />
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            <Text style={styles.userLabel}>Email Account</Text>
          </View>
        </Card>

        {/* Tracking Settings */}
        <Text style={styles.sectionTitle}>Tracking</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>GPS Tracking</Text>
            </View>
            <Switch
              value={settings.gpsEnabled}
              onValueChange={(value) => updateSettings({ gpsEnabled: value })}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={settings.gpsEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>Vibration bei Ziel</Text>
            </View>
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={settings.vibrationEnabled ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        {/* Daily Goal */}
        <Text style={styles.sectionTitle}>Tagesziel</Text>
        <Card style={styles.goalCard}>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => handleGoalChange(-APP_CONFIG.GOAL_STEP)}
            disabled={settings.dailyGoal <= APP_CONFIG.MIN_GOAL}
          >
            <Ionicons
              name="remove-circle"
              size={32}
              color={settings.dailyGoal <= APP_CONFIG.MIN_GOAL ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
          <View style={styles.goalValue}>
            <Text style={styles.goalNumber}>{formatNumber(settings.dailyGoal)}</Text>
            <Text style={styles.goalLabel}>Schritte</Text>
          </View>
          <TouchableOpacity
            style={styles.goalButton}
            onPress={() => handleGoalChange(APP_CONFIG.GOAL_STEP)}
            disabled={settings.dailyGoal >= APP_CONFIG.MAX_GOAL}
          >
            <Ionicons
              name="add-circle"
              size={32}
              color={settings.dailyGoal >= APP_CONFIG.MAX_GOAL ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button title="Logout" onPress={handleLogout} variant="danger" style={styles.logoutButton} />

        {/* Version */}
        <Text style={styles.version}>Version {APP_CONFIG.VERSION}</Text>
      </View>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.text,
  },
  userLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.base,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  goalButton: {
    padding: spacing.sm,
  },
  goalValue: {
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.text,
  },
  goalLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.sm,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
