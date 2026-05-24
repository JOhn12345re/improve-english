import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CefrLevel } from '@englishflow/shared-types';
import { useLessons } from '@/hooks/queries/useLessons';
import { useProfileStore } from '@/stores/profile.store';

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: '#10B981', A2: '#3B82F6', B1: '#F59E0B',
  B2: '#EF4444', C1: '#8B5CF6', C2: '#EC4899',
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { profile } = useProfileStore();
  const userLevel = profile?.level ?? CefrLevel.A1;
  const { data: lessons = [], isLoading } = useLessons();
  
  const nextLesson = lessons[0];
  const levelColor = LEVEL_COLORS[userLevel];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Bonjour, {profile?.firstName ?? ''} 👋
            </Text>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                <Text style={[styles.levelBadgeText, { color: levelColor }]}>{userLevel}</Text>
              </View>
              <Text style={styles.levelLabel}>Niveau actuel</Text>
            </View>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakCount}>{profile?.streak ?? 0}</Text>
            <Text style={styles.streakLabel}>jours</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>⭐ {profile?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>XP total</Text>
          </View>
          <View style={styles.statCard}>
            {isLoading ? <ActivityIndicator size="small" /> : (
              <Text style={styles.statValue}>📚 {lessons.length}</Text>
            )}
            <Text style={styles.statLabel}>Leçons dispo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🎯 {profile?.dailyGoal ?? 10}</Text>
            <Text style={styles.statLabel}>min/jour</Text>
          </View>
        </View>

        {/* Prochaine leçon */}
        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : nextLesson && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commencer maintenant</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              activeOpacity={0.85}
              onPress={() => router.push(`/lesson/${nextLesson.id}`)}
            >
              <Text style={styles.featuredEmoji}>{nextLesson.emoji}</Text>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredTitle}>{nextLesson.title}</Text>
                <Text style={styles.featuredDesc} numberOfLines={2}>{nextLesson.description}</Text>
                <View style={styles.featuredMeta}>
                  <Text style={styles.metaChip}>⏱ {nextLesson.duration} min</Text>
                  <Text style={styles.metaChip}>⭐ +{nextLesson.xpReward} XP</Text>
                </View>
              </View>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnText}>▶</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Autres leçons */}
        {!isLoading && lessons.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Toutes les leçons</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/lessons')}>
                <Text style={styles.seeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>
            {lessons.slice(1, 4).map((lesson) => {
              const color = LEVEL_COLORS[lesson.level as CefrLevel] || LEVEL_COLORS.A1;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.miniCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/lesson/${lesson.id}`)}
                >
                  <View style={[styles.miniEmoji, { backgroundColor: color + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{lesson.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle}>{lesson.title}</Text>
                    <Text style={styles.miniMeta}>{lesson.level} • {lesson.duration} min • ⭐ {lesson.xpReward} XP</Text>
                  </View>
                  <Text style={styles.miniArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  levelBadgeText: { fontSize: 13, fontWeight: '700' },
  levelLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  streakBox: { alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  streakFlame: { fontSize: 20, marginBottom: 2 },
  streakCount: { fontSize: 16, fontWeight: '800', color: '#F97316' },
  streakLabel: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  featuredCard: { backgroundColor: '#1E1B4B', borderRadius: 24, padding: 20, flexDirection: 'row', gap: 16, shadowColor: '#1E1B4B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  featuredEmoji: { fontSize: 40 },
  featuredInfo: { flex: 1, justifyContent: 'center' },
  featuredTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  featuredDesc: { fontSize: 13, color: '#9CA3AF', lineHeight: 18, marginBottom: 12 },
  featuredMeta: { flexDirection: 'row', gap: 8 },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '600', color: '#fff' },
  playBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  playBtnText: { fontSize: 16, color: '#1E1B4B', marginLeft: 4 },
  miniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F3F4F6' },
  miniEmoji: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  miniTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  miniMeta: { fontSize: 12, color: '#6B7280' },
  miniArrow: { fontSize: 24, color: '#D1D5DB', fontWeight: '300' },
});
