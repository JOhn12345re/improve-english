import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CefrLevel } from '@englishflow/shared-types';
import { useLessons, type Lesson } from '@/hooks/queries/useLessons';
import { useProfileStore } from '@/stores/profile.store';

const LEVEL_COLORS: Record<CefrLevel, string> = {
  A1: '#10B981', A2: '#3B82F6', B1: '#F59E0B',
  B2: '#EF4444', C1: '#8B5CF6', C2: '#EC4899',
};

export default function LessonsScreen() {
  const { t } = useTranslation();
  const { profile } = useProfileStore();
  const userLevel = profile?.level ?? CefrLevel.A1;
  const { data: lessons = [], isLoading } = useLessons();

  function renderItem({ item }: { item: Lesson }) {
    const color = LEVEL_COLORS[item.level as CefrLevel] || LEVEL_COLORS.A1;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/lesson/${item.id}`)}
      >
        <View style={[styles.emojiBox, { backgroundColor: color + '20' }]}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.levelBadgeText, { color }]}>{item.level}</Text>
            </View>
            <Text style={styles.metaText}>⏱ {item.duration} min</Text>
            <Text style={styles.metaText}>⭐ {item.xpReward} XP</Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('lessons.title')}</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Chargement...' : `${lessons.length} leçon${lessons.length > 1 ? 's' : ''} disponible${lessons.length > 1 ? 's' : ''} • Niveau ${userLevel}`}
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, gap: 4 },
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B' },
  subtitle: { fontSize: 14, color: '#6B7280' },
  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  emojiBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  cardDesc: { fontSize: 12, color: '#9CA3AF', lineHeight: 16 },
  cardMeta: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 },
  levelBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  levelBadgeText: { fontSize: 11, fontWeight: '700' },
  metaText: { fontSize: 11, color: '#9CA3AF' },
  arrow: { fontSize: 22, color: '#D1D5DB', fontWeight: '300' },
});
