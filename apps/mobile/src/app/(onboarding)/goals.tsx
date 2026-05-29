import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DailyGoalMinutes, LearningGoal } from '@englishflow/shared-types';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Screen from '@/components/ui/Screen';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useProfileStore } from '@/stores/profile.store';
import { logger } from '@/services/logger';

interface GoalOption {
  value: LearningGoal;
  emoji: string;
  labelKey: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  { value: LearningGoal.TRAVEL, emoji: '✈️', labelKey: 'onboarding.goals.travel' },
  { value: LearningGoal.WORK, emoji: '💼', labelKey: 'onboarding.goals.work' },
  { value: LearningGoal.STUDIES, emoji: '🎓', labelKey: 'onboarding.goals.studies' },
  { value: LearningGoal.LEISURE, emoji: '🎮', labelKey: 'onboarding.goals.leisure' },
  { value: LearningGoal.OTHER, emoji: '✨', labelKey: 'onboarding.goals.other' },
];

const DAILY_GOAL_OPTIONS: DailyGoalMinutes[] = [
  DailyGoalMinutes.FIVE,
  DailyGoalMinutes.TEN,
  DailyGoalMinutes.FIFTEEN,
  DailyGoalMinutes.THIRTY,
];

export default function GoalsScreen() {
  const { t } = useTranslation();
  const {
    firstName,
    lastName,
    nativeLanguage,
    level,
    learningGoal,
    dailyGoal,
    setLearningGoal,
    setDailyGoal,
    setNotificationsEnabled,
  } = useOnboardingStore();

  const setProfile = useProfileStore((s) => s.setProfile);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFinish() {
    if (!learningGoal || !level) return;
    setIsLoading(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setNotificationsEnabled(granted);

      if (granted) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t('notifications.dailyReminder.title'),
            body: t('notifications.dailyReminder.body'),
          },
          trigger: { type: 'daily', hour: 9, minute: 0 } as any,
        });
      }
    } catch {
      logger.warn('Notifications permission denied or scheduling failed', {});
    }

    // Sauvegarder le profil localement et aller au dashboard
    await setProfile({
      firstName,
      lastName,
      nativeLanguage,
      level,
      learningGoal,
      dailyGoal,
      streak: 0,
      xp: 0,
    });

    setIsLoading(false);
    router.replace('/(tabs)/dashboard');
  }

  const canContinue = learningGoal !== null;

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <View style={styles.progressRow}>
          <ProgressBar progress={1} />
          <Text style={styles.step}>{t('onboarding.step', { current: 4, total: 4 })}</Text>
        </View>

        <Text style={styles.title}>{t('onboarding.goals.title')}</Text>

        {/* Objectif */}
        <Text style={styles.sectionTitle}>{t('onboarding.goals.whyLearning')}</Text>
        <View style={styles.grid}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.goalCard, learningGoal === option.value && styles.goalCardSelected]}
              onPress={() => setLearningGoal(option.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalEmoji}>{option.emoji}</Text>
              <Text style={[styles.goalLabel, learningGoal === option.value && styles.goalLabelSelected]}>
                {t(option.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Objectif quotidien */}
        <Text style={styles.sectionTitle}>{t('onboarding.goals.dailyGoal')}</Text>
        <View style={styles.minutesRow}>
          {DAILY_GOAL_OPTIONS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[styles.minuteCard, dailyGoal === minutes && styles.minuteCardSelected]}
              onPress={() => setDailyGoal(minutes)}
              activeOpacity={0.7}
            >
              <Text style={[styles.minuteValue, dailyGoal === minutes && styles.minuteValueSelected]}>
                {minutes}
              </Text>
              <Text style={[styles.minuteLabel, dailyGoal === minutes && styles.minuteLabelSelected]}>
                {t('onboarding.goals.minutes')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notification info */}
        <View style={styles.notifInfo}>
          <Text style={styles.notifIcon}>🔔</Text>
          <Text style={styles.notifText}>{t('onboarding.goals.notifInfo')}</Text>
        </View>

        <Button
          label={t('onboarding.goals.finish')}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canContinue}
          loading={isLoading}
          onPress={handleFinish}
          style={styles.finishButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  progressRow: {
    gap: 8,
  },
  step: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: -4,
  },
  goalCard: {
    width: '47%',
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 8,
  },
  goalCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#4F46E5',
  },
  minutesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -4,
  },
  minuteCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: 2,
  },
  minuteCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  minuteValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#374151',
  },
  minuteValueSelected: {
    color: '#4F46E5',
  },
  minuteLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  minuteLabelSelected: {
    color: '#6366F1',
  },
  notifInfo: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0FDF4',
    padding: 14,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 19,
  },
  finishButton: {
    marginTop: 8,
  },
});
