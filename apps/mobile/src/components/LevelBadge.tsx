import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getLevelInfo, getNextLevelInfo, getProgressToNext, getXpToNextLevel } from '@/data/xp-levels';

interface LevelBadgeProps {
  xp: number;
  compact?: boolean;
}

const LEVEL_COLORS: Record<number, string> = {
  1: '#6B7280', 2: '#6B7280',
  3: '#10B981', 4: '#10B981', 5: '#10B981',
  6: '#3B82F6', 7: '#3B82F6', 8: '#3B82F6',
  9: '#F59E0B', 10: '#F59E0B', 11: '#F59E0B',
  12: '#8B5CF6', 13: '#8B5CF6', 14: '#8B5CF6',
  15: '#EC4899', 16: '#EC4899', 17: '#EC4899',
  18: '#DC2626', 19: '#DC2626', 20: '#DC2626',
};

function getColor(level: number): string {
  return LEVEL_COLORS[level] ?? '#DC2626';
}

export default function LevelBadge({ xp, compact = false }: LevelBadgeProps) {
  const levelInfo = getLevelInfo(xp);
  const nextLevel = getNextLevelInfo(xp);
  const progress = getProgressToNext(xp);
  const xpToNext = getXpToNextLevel(xp);
  const color = getColor(levelInfo.level);

  const progressWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
    scale.value = withSpring(1.05, { damping: 6 });
    scale.value = withSpring(1, { damping: 10 });
  }, [xp, progress, progressWidth, scale]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
    backgroundColor: color,
  }));

  const containerAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <Text style={styles.compactIcon}>{levelInfo.icon}</Text>
        <Text style={[styles.compactLevel, { color }]}>Niv. {levelInfo.level}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.card, containerAnim]}>
      <View style={styles.topRow}>
        <Text style={styles.icon}>{levelInfo.icon}</Text>
        <View style={styles.info}>
          <View style={styles.levelRow}>
            <Text style={[styles.levelNumber, { color }]}>Niv. {levelInfo.level}</Text>
            <Text style={styles.levelTitle}>{levelInfo.title}</Text>
          </View>
          <Text style={styles.xpText}>{xp} XP</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, barStyle]} />
        </View>
        <View style={styles.progressLabels}>
          {nextLevel ? (
            <>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.progressText}>
                {xpToNext} XP avant Niv. {nextLevel.level}
              </Text>
            </>
          ) : (
            <Text style={styles.progressText}>Niveau max atteint !</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
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
  icon: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  xpText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  progressSection: {
    marginTop: 14,
    gap: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactIcon: {
    fontSize: 16,
  },
  compactLevel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
