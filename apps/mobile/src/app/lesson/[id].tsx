import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { api } from '@/services/api';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isLoading } = useLesson(id ?? '');
  const addXp = useProfileStore((s) => s.addXp);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [translationInput, setTranslationInput] = useState('');
  const [finished, setFinished] = useState(false);
  const [showFr, setShowFr] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (isLoading) return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size='large' /></View>;
  if (!lesson || !lesson.exercises) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>LeÃ§on introuvable.</Text>
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

    // Quick local check first
    if (normalize(translationInput) === normalize(ex.targetEn)) {
      setAnswerState('correct');
      setScore((s) => s + 1);
      return;
    }

    // AI soft check for near-correct answers
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
      // Fallback to strict check if AI unavailable
      setAnswerState('wrong');
    }
  }

  function handleNext() {
    if (isLast) {
      const xpEarned = Math.round((score / lesson.exercises.length) * lesson.xpReward);
      addXp(xpEarned);
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setAnswerState('idle');
      setSelectedOption(null);
      setTranslationInput('');
      setShowFr(false);
    }
  }

  if (finished) {
    const pct = Math.round((score / lesson.exercises.length) * 100);
    const xpEarned = Math.round((score / lesson.exercises.length) * lesson.xpReward);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>{pct >= 80 ? 'ðŸ†' : pct >= 50 ? 'ðŸ‘' : 'ðŸ’ª'}</Text>
          <Text style={styles.resultTitle}>LeÃ§on terminÃ©e !</Text>
          <View style={styles.resultScoreBox}>
            <Text style={styles.resultScoreText}>{score}/{lesson.exercises.length}</Text>
            <Text style={styles.resultPctText}>{pct}%</Text>
          </View>
          <Text style={styles.resultXp}>+{xpEarned} XP gagnÃ©s â­</Text>
          {pct < 60 && (
            <View style={styles.retryBanner}>
              <Text style={styles.retryText}>ðŸ’¡ Score bas ? Rejoue cette leÃ§on pour mÃ©moriser.</Text>
            </View>
          )}
          <Button
            label="Retour aux leÃ§ons"
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>âœ•</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <ProgressBar progress={progress} />
          </View>
          <Text style={styles.scoreLabel}>{score} âœ“</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.lessonTitle}>{lesson.title}</Text>

          {/* Toggle FR */}
          <TouchableOpacity style={styles.frToggle} onPress={() => setShowFr((v) => !v)}>
            <Text style={[styles.frToggleText, showFr && styles.frToggleActive]}>
              ðŸ‡«ðŸ‡· {showFr ? 'Masquer le franÃ§ais' : 'Voir en franÃ§ais'}
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
        </ScrollView>

        {/* Feedback + bouton suivant */}
        {answerState !== 'idle' && (
          <View style={[styles.feedback, answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackEmoji}>{answerState === 'correct' ? 'âœ…' : 'âŒ'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>
                {answerState === 'correct' ? 'Correct !' : 'Pas tout Ã  faitâ€¦'}
              </Text>
              {exercise.type === 'mcq' && (showFr ? exercise.explanationFr : exercise.explanation) && (
                <Text style={styles.feedbackExplanation}>
                  {showFr ? (exercise.explanationFr ?? exercise.explanation) : exercise.explanation}
                </Text>
              )}
              {exercise.type === 'translation' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  RÃ©ponse : {(exercise as Extract<Exercise, { type: 'translation' }>).targetEn}
                </Text>
              )}
              {exercise.type === 'fill' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  RÃ©ponse : {(exercise as Extract<Exercise, { type: 'fill' }>).answer}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{isLast ? 'Terminer' : 'Suivant â†’'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// â”€â”€ Sous-composants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>Choose the correct answer</Text>
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
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>Complete the sentence</Text>
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
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>
        {exercise.instructionEn ?? 'Translate into English'}
        {showFr && exercise.instructionFr ? `  â€¢  ${exercise.instructionFr}` : ''}
      </Text>
      <View style={styles.sourceBubble}>
        <Text style={styles.sourceText}>{exercise.sourceFr}</Text>
      </View>
      {exercise.hint && <Text style={styles.hint}>ðŸ’¡ Indice : {exercise.hint}</Text>}
      <TextInput
        style={[
          styles.translationInput,
          answerState === 'correct' && styles.inputCorrect,
          answerState === 'wrong' && styles.inputWrong,
        ]}
        value={input}
        onChangeText={onChangeText}
        placeholder="Votre traduction en anglaisâ€¦"
        editable={answerState === 'idle'}
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={answerState === 'idle' ? onCheck : undefined}
      />
      {answerState === 'idle' && (
        <Button
          label="VÃ©rifier"
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

