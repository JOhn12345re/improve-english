import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLesson } from '@/hooks/queries/useLessons';
import { Exercise } from '@/data/lessons';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useProfileStore } from '@/stores/profile.store';
import { useAddVocabularyWords } from '@/hooks/queries/useVocabulary';
import { api } from '@/services/api';

import type { SentenceBuildExercise } from '@/data/lessons';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: lesson, isLoading } = useLesson(id ?? '');
  const addXp = useProfileStore((s) => s.addXp);
  const addWordsMutation = useAddVocabularyWords();

  const [index, setIndex] = useState(0);
  const [vocabExtracted, setVocabExtracted] = useState(false);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [translationInput, setTranslationInput] = useState('');
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [showFr, setShowFr] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (isLoading) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size='large' /></View>;
  if (!lesson || !lesson.exercises) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>{t('lesson.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const exercise = lesson.exercises[index];
  const progress = (index + 1) / lesson.exercises.length;
  const isLast = index === lesson.exercises.length - 1;

  function handleMCQ(optionIndex: number) {
    if (answerState !== 'idle') return;
    const ex = exercise as Extract<Exercise, { type: 'mcq' }>;
    const correct = optionIndex === ex.correctIndex;
    setSelectedOption(optionIndex);
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleFill(optionIndex: number, answer: string) {
    if (answerState !== 'idle') return;
    const ex = exercise as Extract<Exercise, { type: 'fill' }>;
    const correct = answer === ex.answer;
    setSelectedOption(optionIndex);
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  async function handleTranslationCheck() {
    if (answerState !== 'idle') return;
    const ex = exercise as Extract<Exercise, { type: 'translation' }>;
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[.!?,]/g, '');

    if (normalize(translationInput) === normalize(ex.targetEn)) {
      setAnswerState('correct');
      setScore((s) => s + 1);
      return;
    }

    try {
      const result = await api.post<{ correct: boolean; explanation: string }>(
        '/ai/translation-check',
        {
          sourceFr: ex.sourceFr,
          correctEn: ex.targetEn,
          userAnswer: translationInput,
          level: 'A1',
        },
      );
      setAnswerState(result.correct ? 'correct' : 'wrong');
      if (result.correct) setScore((s) => s + 1);
      if (!result.correct && result.explanation) {
        setAiExplanation(result.explanation);
      }
    } catch {
      setAnswerState('wrong');
    }
  }

  function handleSentenceBuildCheck() {
    if (answerState !== 'idle') return;
    const ex = exercise as SentenceBuildExercise;
    const correct = JSON.stringify(selectedWords) === JSON.stringify(ex.correctOrder);
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      const xpEarned = Math.round((score / (lesson?.exercises?.length ?? 1)) * (lesson?.xpReward ?? 0));
      addXp(xpEarned);
      setFinished(true);

      // Extract vocabulary words from exercises and add to review queue
      if (!vocabExtracted && lesson?.exercises) {
        setVocabExtracted(true);
        const words: Array<{ word: string; translation: string; level: string }> = [];
        for (const ex of lesson.exercises) {
          if (ex.type === 'mcq' && ex.options && ex.correctIndex !== undefined) {
            const answer = ex.options[ex.correctIndex];
            const questionFr = (ex as any).questionFr ?? '';
            if (answer && answer.length > 2 && answer.length < 40) {
              words.push({ word: answer, translation: questionFr, level: lesson.level ?? 'A1' });
            }
          }
          if (ex.type === 'fill' && ex.answer) {
            const sentenceFr = (ex as any).sentenceFr ?? '';
            words.push({ word: ex.answer, translation: sentenceFr, level: lesson.level ?? 'A1' });
          }
          if (ex.type === 'translation' && ex.targetEn) {
            words.push({ word: ex.targetEn, translation: (ex as any).sourceFr ?? '', level: lesson.level ?? 'A1' });
          }
          if (ex.type === 'sentence_build') {
            const sbEx = ex as SentenceBuildExercise;
            words.push({ word: sbEx.targetSentence, translation: sbEx.targetFr ?? '', level: lesson.level ?? 'A1' });
          }
        }
        if (words.length > 0) {
          addWordsMutation.mutate(words.slice(0, 10));
        }
      }
    } else {
      setIndex((i) => i + 1);
      setAnswerState('idle');
      setSelectedOption(null);
      setTranslationInput('');
      setSelectedWords([]);
      setShowFr(false);
      setAiExplanation(null);
    }
  }

  async function handleAskAi() {
    if (aiLoading || answerState !== 'wrong') return;
    setAiLoading(true);
    try {
      const ex = exercise;
      let question = '';
      let correctAnswer = '';
      if (ex.type === 'mcq') {
        question = ex.question;
        correctAnswer = ex.options[ex.correctIndex];
      } else if (ex.type === 'fill') {
        question = ex.sentence;
        correctAnswer = ex.answer;
      } else if (ex.type === 'translation') {
        question = ex.sourceFr;
        correctAnswer = ex.targetEn;
      } else if (ex.type === 'sentence_build') {
        question = (ex as SentenceBuildExercise).targetFr;
        correctAnswer = (ex as SentenceBuildExercise).targetSentence;
      }
      const result = await api.post<{ explanation: string }>('/ai/feedback', {
        exerciseType: ex.type,
        question,
        correctAnswer,
        userAnswer:
          ex.type === 'translation'
            ? translationInput
            : selectedOption !== null && ex.type === 'mcq'
            ? ex.options[selectedOption]
            : selectedOption !== null && ex.type === 'fill'
            ? ex.options[selectedOption]
            : '',
        level: 'A1',
      });
      setAiExplanation(result.explanation);
    } catch {
      setAiExplanation(t('lesson.aiUnavailable'));
    } finally {
      setAiLoading(false);
    }
  }

  if (finished) {
    const pct = Math.round((score / lesson.exercises.length) * 100);
    const xpEarned = Math.round((score / lesson.exercises.length) * lesson.xpReward);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{pct >= 80 ? '\u{1F3C6}' : pct >= 50 ? '\u{1F44D}' : '\u{1F4AA}'}</Text>
          <Text style={styles.resultTitle}>{t('lesson.completed')}</Text>
          <View style={styles.resultScoreBox}>
            <Text style={styles.resultScoreText}>{score}/{lesson.exercises.length}</Text>
            <Text style={styles.resultPctText}>{pct}%</Text>
          </View>
          <Text style={styles.resultXp}>+{xpEarned} {t('lesson.xpEarned')}</Text>
          {pct < 60 && (
            <View style={styles.retryBanner}>
              <Text style={styles.retryText}>{t('lesson.retryHint')}</Text>
            </View>
          )}
          <Button
            label={t('lesson.backToLessons')}
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.back()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel={t('common.back')}>
            <Text style={styles.backText}>{'\u2715'}</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <ProgressBar progress={progress} />
          </View>
          <Text style={styles.scoreLabel}>{score} {'\u2714'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          {/* Toggle FR */}
          <TouchableOpacity style={styles.frToggle} onPress={() => setShowFr((v) => !v)} accessibilityLabel={t('lesson.toggleTranslation')}>
            <Text style={[styles.frToggleText, showFr && styles.frToggleActive]}>
              {showFr ? t('lesson.hideNative') : t('lesson.showNative')}
            </Text>
          </TouchableOpacity>

          {/* Exercice MCQ */}
          {exercise.type === 'mcq' && (
            <MCQView
              exercise={exercise}
              selectedOption={selectedOption}
              answerState={answerState}
              showFr={showFr}
              onSelect={handleMCQ}
            />
          )}

          {/* Exercice Fill */}
          {exercise.type === 'fill' && (
            <FillView
              exercise={exercise}
              selectedOption={selectedOption}
              answerState={answerState}
              showFr={showFr}
              onSelect={handleFill}
            />
          )}

          {/* Exercice Translation */}
          {exercise.type === 'translation' && (
            <TranslationView
              exercise={exercise}
              input={translationInput}
              answerState={answerState}
              showFr={showFr}
              onChangeText={setTranslationInput}
              onCheck={handleTranslationCheck}
            />
          )}

          {/* Exercice Sentence Build */}
          {exercise.type === 'sentence_build' && (
            <SentenceBuildView
              exercise={exercise as SentenceBuildExercise}
              selectedWords={selectedWords}
              answerState={answerState}
              showFr={showFr}
              onSelectWord={(i) => {
                if (answerState !== 'idle') return;
                if (selectedWords.includes(i)) {
                  setSelectedWords(selectedWords.filter((w) => w !== i));
                } else {
                  setSelectedWords([...selectedWords, i]);
                }
              }}
              onCheck={handleSentenceBuildCheck}
            />
          )}
        </ScrollView>

        {/* Feedback + bouton suivant */}
        {answerState !== 'idle' && (
          <View style={[styles.feedback, answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.feedbackEmoji}>{answerState === 'correct' ? '\u2705' : '\u274C'}</Text>
              <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>
                {answerState === 'correct' ? t('lesson.correct') : t('lesson.incorrect')}
              </Text>
              {exercise.type === 'mcq' && (showFr ? exercise.explanationFr : exercise.explanation) && (
                <Text style={styles.feedbackExplanation}>
                  {showFr ? (exercise.explanationFr ?? exercise.explanation) : exercise.explanation}
                </Text>
              )}
              {exercise.type === 'translation' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  {t('lesson.correctAnswer')} : {(exercise as Extract<Exercise, { type: 'translation' }>).targetEn}
                </Text>
              )}
              {exercise.type === 'fill' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  {t('lesson.correctAnswer')} : {(exercise as Extract<Exercise, { type: 'fill' }>).answer}
                </Text>
              )}
              {exercise.type === 'fill' && (exercise as any).explanation && (
                <Text style={styles.feedbackExplanation}>
                  {showFr ? ((exercise as any).explanationFr ?? (exercise as any).explanation) : (exercise as any).explanation}
                </Text>
              )}
              {exercise.type === 'translation' && (exercise as any).explanation && (
                <Text style={styles.feedbackExplanation}>
                  {showFr ? ((exercise as any).explanationFr ?? (exercise as any).explanation) : (exercise as any).explanation}
                </Text>
              )}
              {exercise.type === 'sentence_build' && (
                <>
                  {answerState === 'wrong' && (
                    <Text style={styles.feedbackExplanation}>
                      {t('lesson.correctAnswer')} : {(exercise as SentenceBuildExercise).targetSentence}
                    </Text>
                  )}
                  {(exercise as SentenceBuildExercise).explanation && (
                    <Text style={styles.feedbackExplanation}>
                      {showFr ? ((exercise as SentenceBuildExercise).explanationFr ?? (exercise as SentenceBuildExercise).explanation) : (exercise as SentenceBuildExercise).explanation}
                    </Text>
                  )}
                </>
              )}
              </View>
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext} accessibilityLabel={t('lesson.next')}>
              <Text style={styles.nextBtnText}>{isLast ? t('lesson.finish') : t('lesson.next')}</Text>
            </TouchableOpacity>
            </View>
            {answerState === 'wrong' && (
              <View style={{ marginTop: 10 }}>
                {aiExplanation ? (
                  <View style={styles.aiBox}>
                    <Text style={styles.aiLabel}>{t('lesson.aiExplanation')}</Text>
                    <Text style={styles.aiText}>{aiExplanation}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.aiBtn} onPress={handleAskAi} disabled={aiLoading} accessibilityLabel={t('lesson.askAi')}>
                    {aiLoading
                      ? <ActivityIndicator size="small" color="#4F46E5" />
                      : <Text style={styles.aiBtnText}>{t('lesson.askAi')}</Text>
                    }
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -- Sous-composants --

function MCQView({
  exercise,
  selectedOption,
  answerState,
  showFr,
  onSelect,
}: {
  exercise: Extract<Exercise, { type: 'mcq' }>;
  selectedOption: number | null;
  answerState: AnswerState;
  showFr: boolean;
  onSelect: (i: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{t('lesson.chooseCorrect')}</Text>
      <Text style={styles.question}>{exercise.question}</Text>
      {showFr && exercise.questionFr && (
        <Text style={styles.questionFr}>({exercise.questionFr})</Text>
      )}
      <View style={styles.options}>
        {exercise.options.map((opt, i) => {
          let bg = '#F9FAFB';
          let border = 'transparent';
          if (answerState !== 'idle') {
            if (i === exercise.correctIndex) { bg = '#D1FAE5'; border = '#10B981'; }
            else if (i === selectedOption) { bg = '#FEE2E2'; border = '#EF4444'; }
          } else if (i === selectedOption) {
            bg = '#EEF2FF'; border = '#4F46E5';
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => onSelect(i)}
              activeOpacity={answerState !== 'idle' ? 1 : 0.7}
            >
              <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function FillView({
  exercise,
  selectedOption,
  answerState,
  showFr,
  onSelect,
}: {
  exercise: Extract<Exercise, { type: 'fill' }>;
  selectedOption: number | null;
  answerState: AnswerState;
  showFr: boolean;
  onSelect: (i: number, answer: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{t('lesson.completeSentence')}</Text>
      <Text style={styles.question}>{exercise.sentence}</Text>
      {showFr && exercise.sentenceFr && (
        <Text style={styles.questionFr}>({exercise.sentenceFr})</Text>
      )}
      <View style={styles.options}>
        {exercise.options.map((opt, i) => {
          let bg = '#F9FAFB';
          let border = 'transparent';
          if (answerState !== 'idle') {
            if (opt === exercise.answer) { bg = '#D1FAE5'; border = '#10B981'; }
            else if (i === selectedOption) { bg = '#FEE2E2'; border = '#EF4444'; }
          } else if (i === selectedOption) {
            bg = '#EEF2FF'; border = '#4F46E5';
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor: border }]}
              onPress={() => onSelect(i, opt)}
              activeOpacity={answerState !== 'idle' ? 1 : 0.7}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TranslationView({
  exercise,
  input,
  answerState,
  showFr,
  onChangeText,
  onCheck,
}: {
  exercise: Extract<Exercise, { type: 'translation' }>;
  input: string;
  answerState: AnswerState;
  showFr: boolean;
  onChangeText: (t: string) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>
        {exercise.instructionEn ?? t('lesson.translateToEnglish')}
        {showFr && exercise.instructionFr ? `  \u2022  ${exercise.instructionFr}` : ''}
      </Text>
      <View style={styles.sourceBubble}>
        <Text style={styles.sourceText}>{exercise.sourceFr}</Text>
      </View>
      {exercise.hint && <Text style={styles.hint}>{t('lesson.hint')} : {exercise.hint}</Text>}
      <TextInput
        style={[
          styles.translationInput,
          answerState === 'correct' && styles.inputCorrect,
          answerState === 'wrong' && styles.inputWrong,
        ]}
        value={input}
        onChangeText={onChangeText}
        placeholder={t('lesson.translationPlaceholder')}
        editable={answerState === 'idle'}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={answerState === 'idle' ? onCheck : undefined}
      />
      {answerState === 'idle' && (
        <Button
          label={t('lesson.check')}
          variant="primary"
          size="md"
          fullWidth
          disabled={input.trim().length === 0}
          onPress={onCheck}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  errorText: { textAlign: 'center', marginTop: 100, color: '#EF4444', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
  progressWrap: { flex: 1 },
  scoreLabel: { fontSize: 14, fontWeight: '700', color: '#4F46E5', minWidth: 30 },
  body: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  lessonTitle: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  exerciseWrap: { gap: 16 },
  instruction: { fontSize: 13, fontWeight: '600', color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.5 },
  question: { fontSize: 22, fontWeight: '800', color: '#1E1B4B', lineHeight: 30 },
  options: { gap: 10, marginTop: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  optionLetter: { fontSize: 14, fontWeight: '700', color: '#4F46E5', width: 22 },
  optionText: { flex: 1, fontSize: 16, color: '#1F2937', lineHeight: 22 },
  sourceBubble: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 18,
  },
  sourceText: { fontSize: 20, fontWeight: '700', color: '#1E1B4B', lineHeight: 28 },
  hint: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  translationInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginTop: 4,
  },
  inputCorrect: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  inputWrong: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  feedbackCorrect: { backgroundColor: '#D1FAE5' },
  feedbackWrong: { backgroundColor: '#FEE2E2' },
  feedbackEmoji: { fontSize: 28 },
  feedbackTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  feedbackExplanation: { fontSize: 13, color: '#374151', marginTop: 2, lineHeight: 18 },
  nextBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  resultEmoji: { fontSize: 72 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#1E1B4B' },
  resultScoreBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 4,
  },
  resultScoreText: { fontSize: 36, fontWeight: '900', color: '#4F46E5' },
  resultPctText: { fontSize: 18, color: '#6366F1', fontWeight: '600' },
  resultXp: { fontSize: 16, color: '#F97316', fontWeight: '700' },
  retryBanner: { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14, width: '100%' },
  retryText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  aiBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  aiBtnText: { fontSize: 14, fontWeight: '600' as const, color: '#4F46E5' },
  aiBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  aiLabel: { fontSize: 12, fontWeight: '700' as const, color: '#4F46E5' },
  aiText: { fontSize: 13, color: '#374151', lineHeight: 18 },
  frToggle: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  frToggleText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  frToggleActive: { color: '#4F46E5' },
  questionFr: { fontSize: 15, color: '#9CA3AF', fontStyle: 'italic', marginTop: -8 },
});
