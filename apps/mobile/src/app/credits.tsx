import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface Source {
  name: string;
  description: string;
  license: string;
  url: string;
}

const SOURCES: Source[] = [
  {
    name: 'VOA Learning English',
    description: 'Articles and audio content from Voice of America — daily English lessons for learners.',
    license: 'Public Domain (U.S. Government)',
    url: 'https://learningenglish.voanews.com',
  },
  {
    name: 'Project Gutenberg',
    description: 'Classic English grammar books and reading materials.',
    license: 'Public Domain',
    url: 'https://www.gutenberg.org',
  },
  {
    name: 'Internet Archive',
    description: 'Open-access English language teaching materials.',
    license: 'Public Domain / CC-BY',
    url: 'https://archive.org/details/englishlanguageteaching',
  },
  {
    name: 'Datamuse API',
    description: 'Word relationships and frequency data used for vocabulary exercises.',
    license: 'Free for non-commercial use',
    url: 'https://www.datamuse.com/api/',
  },
  {
    name: 'Tatoeba',
    description: 'Multilingual example sentences for translation exercises.',
    license: 'CC-BY 2.0 FR',
    url: 'https://tatoeba.org',
  },
];

export default function CreditsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sources & Credits</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          EnglishFlow uses content from the following open-access sources.
          We are grateful to these projects for making their content freely available.
        </Text>

        {SOURCES.map((source) => (
          <View key={source.name} style={styles.card}>
            <Text style={styles.sourceName}>{source.name}</Text>
            <Text style={styles.sourceDesc}>{source.description}</Text>
            <View style={styles.row}>
              <Text style={styles.licenseLabel}>License: </Text>
              <Text style={styles.licenseValue}>{source.license}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Linking.openURL(source.url)}
              accessibilityLabel={`Visit ${source.name} website`}
            >
              <Text style={styles.link}>{source.url}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All generated exercises are derived from public domain or openly licensed content.
            If you believe a content attribution is missing or incorrect, please contact us.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: { padding: 4, marginRight: 12 },
  backText: { fontSize: 20, color: '#4F46E5' },
  title: { fontSize: 18, fontWeight: '700', color: '#1E1B4B' },
  content: { padding: 16, gap: 12 },
  intro: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceName: { fontSize: 15, fontWeight: '700', color: '#1E1B4B' },
  sourceDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  licenseLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  licenseValue: { fontSize: 12, color: '#059669', fontWeight: '500' },
  link: { fontSize: 12, color: '#4F46E5', textDecorationLine: 'underline', marginTop: 2 },
  footer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  footerText: { fontSize: 12, color: '#166534', lineHeight: 18 },
});
