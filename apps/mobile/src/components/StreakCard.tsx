import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface StreakCardProps {
  current: number;
  longest: number;
  isActiveToday: boolean;
  nextMilestone: number | null;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  3: '3 jours ! Bon debut !',
  7: '1 semaine ! Tu es regulier !',
  14: '2 semaines ! Impressionnant !',
  30: '1 mois ! Legendaire !',
  60: '2 mois ! Inarretable !',
  100: '100 jours ! Champion !',
  200: '200 jours ! Maitre absolu !',
  365: '1 an ! Incroyable !',
};

function getFlameSize(streak: number): number {
  if (streak >= 100) return 48;
  if (streak >= 30) return 44;
  if (streak >= 7) return 38;
  return 32;
}

function getFlameColor(streak: number): string {
  if (streak >= 100) return '#DC2626';
  if (streak >= 30) return '#F97316';
  if (streak >= 7) return '#FB923C';
  return '#FDBA74';
}

export default function StreakCard({ current, longest, isActiveToday, nextMilestone }: StreakCardProps) {
  const scale = useSharedValue(1);
  const flameScale = useSharedValue(0.8);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      flameScale.value = withSpring(1, { damping: 8, stiffness: 120 });
      return;
    }
    scale.value = withSequence(
      withSpring(1.05, { damping: 6 }),
      withSpring(1, { damping: 10 }),
    );
    flameScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 200 }),
      withDelay(200, withSpring(1, { damping: 8 })),
    );
  }, [current, scale, flameScale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  const flameSize = getFlameSize(current);
  const flameColor = getFlameColor(current);
  const progressToNext = nextMilestone ? current / nextMilestone : 1;
  const isMilestone = MILESTONE_MESSAGES[current];

  return (
    <Animated.View style={[styles.card, containerStyle]}>
      {/* Flame + count */}
      <View style={styles.topRow}>
        <Animated.Text style={[styles.flame, { fontSize: flameSize }, flameStyle]}>
          {current > 0 ? '\uD83D\uDD25' : '\u2744\uFE0F'}
        </Animated.Text>
        <View style={styles.countCol}>
          <Text style={[styles.countNumber, { color: flameColor }]}>{current}</Text>
          <Text style={styles.countLabel}>
            {current <= 1 ? 'jour' : 'jours'}
          </Text>
        </View>
        <View style={styles.recordBox}>
          <Text style={styles.recordLabel}>Record</Text>
          <Text style={styles.recordValue}>{longest}</Text>
        </View>
      </View>

      {/* Milestone message */}
      {isMilestone && (
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneText}>{isMilestone}</Text>
        </View>
      )}

      {/* Progress to next milestone */}
      {nextMilestone && !isMilestone && (
        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(progressToNext * 100, 100)}%`, backgroundColor: flameColor }]} />
          </View>
          <Text style={styles.progressText}>
            {nextMilestone - current} jour{nextMilestone - current > 1 ? 's' : ''} avant {nextMilestone} jours
          </Text>
        </View>
      )}

      {/* Today status */}
      <View style={[styles.todayBadge, isActiveToday ? styles.todayActive : styles.todayInactive]}>
        <Text style={styles.todayDot}>{isActiveToday ? '\u2705' : '\u26A0\uFE0F'}</Text>
        <Text style={[styles.todayText, isActiveToday ? styles.todayTextActive : styles.todayTextInactive]}>
          {isActiveToday ? "Objectif du jour atteint !" : "Fais une lecon pour garder ton streak !"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flame: {
    lineHeight: 56,
  },
  countCol: {
    flex: 1,
  },
  countNumber: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
  },
  countLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordBox: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recordLabel: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
  },
  milestoneRow: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  progressSection: {
    marginTop: 14,
    gap: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  todayBadge: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  todayActive: {
    backgroundColor: '#D1FAE5',
  },
  todayInactive: {
    backgroundColor: '#FEF3C7',
  },
  todayDot: {
    fontSize: 14,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  todayTextActive: {
    color: '#065F46',
  },
  todayTextInactive: {
    color: '#92400E',
  },
});
