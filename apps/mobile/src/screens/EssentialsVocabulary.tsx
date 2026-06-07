import { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '@/services/api';

// ── Types ──────────────────────────────────────────────────────────────────

interface EssentialWord {
  id: string;
  word_en: string;
  translations_json: { fr: string };
  level: string;
  ipa?: string;
  part_of_speech?: string;
  frequency?: string;
  importance?: number;
  examples_json?: Array<{ en: string; fr: string; audioUrl?: string }>;
  audio_url?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2'] as const;

const LEVEL_COLORS: Record<string, string> = {
  A1: '#10B981',
  A2: '#3B82F6',
  B1: '#F59E0B',
  B2: '#EF4444',
};

const POS_LABELS: Record<string, string> = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  pronoun: 'pron.',
  preposition: 'prep.',
  conjunction: 'conj.',
  interjection: 'interj.',
  determiner: 'det.',
  number: 'num.',
};

// ── Component ──────────────────────────────────────────────────────────────

export default function EssentialsVocabulary() {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: words = [], isLoading } = useQuery<EssentialWord[]>({
    queryKey: ['essentials-vocabulary'],
    queryFn: () => api.get<EssentialWord[]>('/vocabulary?pack=essentials-500'),
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    let list = words;
    if (selectedLevel !== 'All') {
      list = list.filter((w) => w.level === selectedLevel);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.word_en.toLowerCase().includes(q) ||
          w.translations_json?.fr?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [words, selectedLevel, search]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const renderWord = useCallback(
    ({ item }: { item: EssentialWord }) => {
      const isExpanded = expandedId === item.id;
      const levelColor = LEVEL_COLORS[item.level] || '#6B7280';

      return (
        <TouchableOpacity
          style={styles.wordCard}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.wordHeader}>
            <View style={styles.wordMain}>
              <Text style={styles.wordText}>{item.word_en}</Text>
              {item.part_of_speech && (
                <Text style={styles.posText}>
                  {POS_LABELS[item.part_of_speech] || item.part_of_speech}
                </Text>
              )}
              {item.ipa && <Text style={styles.ipaText}>{item.ipa}</Text>}
            </View>
            <View style={styles.wordRight}>
              <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                <Text style={[styles.levelText, { color: levelColor }]}>{item.level}</Text>
              </View>
              <Text style={styles.translationText}>{item.translations_json?.fr}</Text>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.expandedSection}>
              {item.examples_json && item.examples_json.length > 0 && (
                <View style={styles.examplesContainer}>
                  {item.examples_json.map((ex, i) => (
                    <View key={i} style={styles.exampleRow}>
                      <Text style={styles.exampleEn}>{ex.en}</Text>
                      <Text style={styles.exampleFr}>{ex.fr}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.learnButton}>
                <Text style={styles.learnButtonText}>Add to my deck</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [expandedId, toggleExpand],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading vocabulary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>{'\u2190'}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Essential 500</Text>
            <Text style={styles.headerSubtitle}>
              {filtered.length} words {selectedLevel !== 'All' ? `(${selectedLevel})` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search words..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Level filter */}
      <View style={styles.filterRow}>
        {LEVELS.map((level) => {
          const isActive = selectedLevel === level;
          const color = level === 'All' ? '#4F46E5' : LEVEL_COLORS[level] || '#6B7280';
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: color + '20', borderColor: color },
              ]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && { color, fontWeight: '600' },
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Word list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderWord}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={15}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  wordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordMain: {
    flex: 1,
    marginRight: 12,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  posText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },
  ipaText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  wordRight: {
    alignItems: 'flex-end',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  translationText: {
    fontSize: 14,
    color: '#4B5563',
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  examplesContainer: {
    marginBottom: 12,
  },
  exampleRow: {
    marginBottom: 8,
  },
  exampleEn: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  exampleFr: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 2,
  },
  learnButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  learnButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
