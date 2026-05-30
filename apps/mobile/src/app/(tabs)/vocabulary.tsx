import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import Button from '@/components/ui/Button';
import { useDueVocabulary, useReviewVocabulary } from '@/hooks/queries/useVocabulary';

const RATING_BUTTONS = [
  { rating: 1 as const, color: '#EF4444', bg: '#FEE2E2' },
  { rating: 2 as const, color: '#F59E0B', bg: '#FEF3C7' },
  { rating: 3 as const, color: '#10B981', bg: '#D1FAE5' },
  { rating: 4 as const, color: '#3B82F6', bg: '#DBEAFE' },
];

export default function VocabularyScreen() {
  const { t } = useTranslation();
  const { data: dueWords = [], isLoading, refetch } = useDueVocabulary();
  const reviewMutation = useReviewVocabulary();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const flipValue = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipValue.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flipValue.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));

  const handleFlip = useCallback(() => {
    flipValue.value = withTiming(flipped ? 0 : 1, { duration: 300 });
    setFlipped((f) => !f);
  }, [flipped, flipValue]);

  const handleRate = useCallback(
    async (rating: 1 | 2 | 3 | 4) => {
      const word = dueWords[currentIndex];
      if (!word) return;

      reviewMutation.mutate({ vocabularyId: word.id, quality: rating });
      setReviewedCount((c) => c + 1);

      // Reset flip
      flipValue.value = withTiming(0, { duration: 200 });
      setFlipped(false);

      if (currentIndex + 1 < dueWords.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setSessionDone(true);
      }
    },
    [currentIndex, dueWords, flipValue, reviewMutation],
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setReviewedCount(0);
    setSessionDone(false);
    setFlipped(false);
    flipValue.value = 0;
    refetch();
  }, [flipValue, refetch]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no words due
  if (dueWords.length === 0 && !sessionDone) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('vocabulary.title')}</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\u2705'}</Text>
            <Text style={styles.emptyTitle}>{t('vocabulary.allDone')}</Text>
            <Text style={styles.emptySubtitle}>{t('vocabulary.allDoneDesc')}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t('vocabulary.toReview')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>{t('vocabulary.learned')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0%</Text>
              <Text style={styles.statLabel}>{t('vocabulary.mastery')}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Session complete
  if (sessionDone) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.doneEmoji}>{'\uD83C\uDF89'}</Text>
          <Text style={styles.doneTitle}>{t('vocabulary.sessionDone')}</Text>
          <Text style={styles.doneSubtitle}>
            {t('vocabulary.reviewedCount', { count: reviewedCount })}
          </Text>
          <Button
            label={t('vocabulary.reviewAgain')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleRestart}
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Active review
  const currentWord = dueWords[currentIndex];
  const remaining = dueWords.length - currentIndex;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('vocabulary.title')}</Text>
          <Text style={styles.counter}>
            {currentIndex + 1}/{dueWords.length}
          </Text>
        </View>

        <Text style={styles.remainingText}>
          {t('vocabulary.remaining', { count: remaining })}
        </Text>

        {/* Flashcard */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFlip}
          style={styles.cardContainer}
          accessibilityLabel={t('vocabulary.tapToFlip')}
        >
          <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
            <Text style={styles.cardLabel}>{t('vocabulary.english')}</Text>
            <Text style={styles.cardWord}>{currentWord?.word ?? ''}</Text>
            <Text style={styles.cardHint}>{t('vocabulary.tapToFlip')}</Text>
          </Animated.View>

          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <Text style={styles.cardLabel}>{t('vocabulary.translation')}</Text>
            <Text style={styles.cardWord}>{currentWord?.translation ?? ''}</Text>
            {currentWord?.partOfSpeech && (
              <Text style={styles.cardPos}>{currentWord.partOfSpeech}</Text>
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Rating buttons (only visible when flipped) */}
        {flipped && (
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>{t('vocabulary.howWell')}</Text>
            <View style={styles.ratingRow}>
              {RATING_BUTTONS.map(({ rating, color, bg }) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingBtn, { backgroundColor: bg, borderColor: color }]}
                  onPress={() => handleRate(rating)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.ratingBtnText, { color }]}>
                    {t(`vocabulary.rating${rating}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B' },
  counter: { fontSize: 15, fontWeight: '700', color: '#6366F1', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  remainingText: { fontSize: 13, color: '#9CA3AF', marginTop: 4, marginBottom: 20 },
  cardContainer: { flex: 1, maxHeight: 320, marginBottom: 24 },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardFront: { backgroundColor: '#1E1B4B' },
  cardBack: { backgroundColor: '#EEF2FF' },
  cardLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  cardWord: { fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 42 },
  cardHint: { position: 'absolute', bottom: 20, fontSize: 12, fontWeight: '500' },
  cardPos: { fontSize: 14, fontWeight: '500', color: '#6366F1', marginTop: 8 },
  ratingSection: { gap: 12, paddingBottom: 24 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  ratingBtnText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#4F46E5' },
  statLabel: { fontSize: 11, color: '#6366F1', fontWeight: '500', textAlign: 'center' },
  emptyState: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  doneEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B4B' },
  doneSubtitle: { fontSize: 16, color: '#6B7280' },
});
