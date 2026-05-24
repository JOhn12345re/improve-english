import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/ui/Button';

export default function VocabularyScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('vocabulary.title')}</Text>
        <Text style={styles.subtitle}>{t('vocabulary.subtitle')}</Text>

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

        <Button
          label={t('vocabulary.startReview')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20, gap: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1E1B4B' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: -12 },
  statsRow: { flexDirection: 'row', gap: 10 },
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
});
