import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { getTrollMessage } from '@/data/troll-messages';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import { useProfileStore } from '@/stores/profile.store';
import { useAddVocabularyWords } from '@/hooks/queries/useVocabulary';
import { api } from '@/services/api';

import type { SentenceBuildExercise, ListenTypeExercise, WordOrderExercise, MatchPairsExercise } from '@/data/lessons';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: lesson, isLoading } = useLesson(id ?? '');
  const addXp = useProfileStore((s) => s.addXp);
  const userLevel = useProfileStore((s) => s.profile?.level);
  const addWordsMutation = useAddVocabularyWords();

  const [index, setIndex] = useState(0);
  const [trollMsg, setTrollMsg] = useState('');
  const [vocabExtracted, setVocabExtracted] = useState(false);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [translationInput, setTranslationInput] = useState('');
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [listenInput, setListenInput] = useState('');
  const [wordOrderSelected, setWordOrderSelected] = useState<number[]>([]);
  const [matchLeft, setMatchLeft] = useState<number | null>(null);
  const [matchPaired, setMatchPaired] = useState<Map<number, number>>(new Map());
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

  function handleListenTypeCheck() {
    if (answerState !== 'idle') return;
    const ex = exercise as ListenTypeExercise;
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[.!?,]/g, '');
    const correct = normalize(listenInput) === normalize(ex.word);
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleFillTypeCheck() {
    if (answerState !== 'idle') return;
    const ex = exercise as Extract<Exercise, { type: 'fill' }>;
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[.!?,]/g, '');
    const correct = normalize(translationInput) === normalize(ex.answer);
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleWordOrderCheck() {
    if (answerState !== 'idle') return;
    const ex = exercise as WordOrderExercise;
    const userSentence = wordOrderSelected.map((i) => ex.shuffledWords[i]).join(' ');
    const correct = userSentence === ex.correctOrder.join(' ');
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleMatchSelect(side: 'left' | 'right', index: number) {
    if (answerState !== 'idle') return;
    const ex = exercise as MatchPairsExercise;
    if (side === 'left') {
      setMatchLeft(index);
    } else if (matchLeft !== null) {
      const newPaired = new Map(matchPaired);
      newPaired.set(matchLeft, index);
      setMatchPaired(newPaired);
      setMatchLeft(null);
      // Auto-check when all pairs are matched
      if (newPaired.size === ex.pairs.length) {
        const allCorrect = Array.from(newPaired.entries()).every(
          ([l, r]) => l === r,
        );
        setAnswerState(allCorrect ? 'correct' : 'wrong');
        if (allCorrect) setScore((s) => s + 1);
      }
    }
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
          if (ex.type === 'listen_type') {
            const ltEx = ex as ListenTypeExercise;
            words.push({ word: ltEx.word, translation: ltEx.instructionFr ?? '', level: lesson.level ?? 'A1' });
          }
          if (ex.type === 'word_order') {
            const woEx = ex as WordOrderExercise;
            words.push({ word: woEx.correctOrder.join(' '), translation: woEx.translationFr ?? '', level: lesson.level ?? 'A1' });
          }
          if (ex.type === 'match_pairs') {
            const mpEx = ex as MatchPairsExercise;
            for (const pair of mpEx.pairs) {
              words.push({ word: pair.en, translation: pair.fr, level: lesson.level ?? 'A1' });
            }
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
      setListenInput('');
      setWordOrderSelected([]);
      setMatchLeft(null);
      setMatchPaired(new Map());
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
      } else if (ex.type === 'listen_type') {
        question = (ex as ListenTypeExercise).instruction;
        correctAnswer = (ex as ListenTypeExercise).word;
      } else if (ex.type === 'word_order') {
        question = (ex as WordOrderExercise).translationFr;
        correctAnswer = (ex as WordOrderExercise).correctOrder.join(' ');
      } else if (ex.type === 'match_pairs') {
        question = (ex as MatchPairsExercise).instruction;
        correctAnswer = (ex as MatchPairsExercise).pairs.map((p) => `${p.en}=${p.fr}`).join(', ');
      }
      const result = await api.post<{ explanation: string }>('/ai/feedback', {
        exerciseType: ex.type,
        question,
        correctAnswer,
        userAnswer:
          ex.type === 'translation' || (ex.type === 'fill' && (!ex.options || ex.options.length === 0))
            ? translationInput
            : ex.type === 'listen_type'
            ? listenInput
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

          {/* Exercice Fill (with options or free typing) */}
          {exercise.type === 'fill' && exercise.options && exercise.options.length > 0 && (
            <FillView
              exercise={exercise}
              selectedOption={selectedOption}
              answerState={answerState}
              showFr={showFr}
              onSelect={handleFill}
            />
          )}
          {exercise.type === 'fill' && (!exercise.options || exercise.options.length === 0) && (
            <FillTypeView
              exercise={exercise}
              input={translationInput}
              answerState={answerState}
              showFr={showFr}
              onChangeText={setTranslationInput}
              onCheck={handleFillTypeCheck}
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

          {/* Exercice Listen & Type */}
          {exercise.type === 'listen_type' && (
            <ListenTypeView
              exercise={exercise as ListenTypeExercise}
              input={listenInput}
              answerState={answerState}
              onChangeText={setListenInput}
              onCheck={handleListenTypeCheck}
            />
          )}

          {/* Exercice Word Order */}
          {exercise.type === 'word_order' && (
            <WordOrderView
              exercise={exercise as WordOrderExercise}
              selectedWords={wordOrderSelected}
              answerState={answerState}
              showFr={showFr}
              onSelectWord={(i) => {
                if (answerState !== 'idle') return;
                if (wordOrderSelected.includes(i)) {
                  setWordOrderSelected(wordOrderSelected.filter((w) => w !== i));
                } else {
                  setWordOrderSelected([...wordOrderSelected, i]);
                }
              }}
              onCheck={handleWordOrderCheck}
            />
          )}

          {/* Exercice Match Pairs */}
          {exercise.type === 'match_pairs' && (
            <MatchPairsView
              exercise={exercise as MatchPairsExercise}
              matchLeft={matchLeft}
              matchPaired={matchPaired}
              answerState={answerState}
              onSelect={handleMatchSelect}
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
              {exercise.type === 'listen_type' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  {t('lesson.correctAnswer')} : {(exercise as ListenTypeExercise).word}
                </Text>
              )}
              {exercise.type === 'word_order' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  {t('lesson.correctAnswer')} : {(exercise as WordOrderExercise).correctOrder.join(' ')}
                </Text>
              )}
              {exercise.type === 'match_pairs' && answerState === 'wrong' && (
                <Text style={styles.feedbackExplanation}>
                  {(exercise as MatchPairsExercise).pairs.map((p) => `${p.en} = ${p.fr}`).join(', ')}
                </Text>
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

function SentenceBuildView({
  exercise,
  selectedWords,
  answerState,
  showFr,
  onSelectWord,
  onCheck,
}: {
  exercise: SentenceBuildExercise;
  selectedWords: number[];
  answerState: AnswerState;
  showFr: boolean;
  onSelectWord: (i: number) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  const builtSentence = selectedWords.map((i) => exercise.words[i]).join(' ');

  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>
        {exercise.instruction}
        {showFr && exercise.instructionFr ? `  \u2022  ${exercise.instructionFr}` : ''}
      </Text>
      {showFr && exercise.targetFr && (
        <Text style={styles.questionFr}>({exercise.targetFr})</Text>
      )}

      {/* Built sentence area */}
      <View style={sbStyles.sentenceArea}>
        {selectedWords.length > 0 ? (
          <Text style={sbStyles.builtText}>{builtSentence}</Text>
        ) : (
          <Text style={sbStyles.placeholder}>{t('lesson.tapWordsToOrder') ?? 'Tap words in order...'}</Text>
        )}
      </View>

      {/* Word chips */}
      <View style={sbStyles.wordChips}>
        {exercise.words.map((word, i) => {
          const isSelected = selectedWords.includes(i);
          let chipBg = isSelected ? '#4F46E5' : '#F3F4F6';
          let textColor = isSelected ? '#fff' : '#1F2937';

          if (answerState !== 'idle') {
            const correctPos = exercise.correctOrder.indexOf(i);
            const userPos = selectedWords.indexOf(i);
            if (correctPos === userPos && userPos !== -1) {
              chipBg = '#10B981';
              textColor = '#fff';
            } else if (isSelected) {
              chipBg = '#EF4444';
              textColor = '#fff';
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={[sbStyles.chip, { backgroundColor: chipBg }]}
              onPress={() => onSelectWord(i)}
              activeOpacity={answerState !== 'idle' ? 1 : 0.7}
            >
              <Text style={[sbStyles.chipText, { color: textColor }]}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answerState === 'idle' && selectedWords.length === exercise.words.length && (
        <Button
          label={t('lesson.check')}
          variant="primary"
          size="md"
          fullWidth
          onPress={onCheck}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

function FillTypeView({
  exercise,
  input,
  answerState,
  showFr,
  onChangeText,
  onCheck,
}: {
  exercise: Extract<Exercise, { type: 'fill' }>;
  input: string;
  answerState: AnswerState;
  showFr: boolean;
  onChangeText: (t: string) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{t('lesson.completeSentence')}</Text>
      <Text style={styles.question}>{exercise.sentence}</Text>
      {showFr && exercise.sentenceFr && (
        <Text style={styles.questionFr}>({exercise.sentenceFr})</Text>
      )}
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

function ListenTypeView({
  exercise,
  input,
  answerState,
  onChangeText,
  onCheck,
}: {
  exercise: ListenTypeExercise;
  input: string;
  answerState: AnswerState;
  onChangeText: (t: string) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{exercise.instruction}</Text>
      <View style={styles.sourceBubble}>
        <Text style={styles.sourceText}>{'\uD83D\uDD0A'} {exercise.word}</Text>
      </View>
      <Text style={styles.hint}>{exercise.instructionFr}</Text>
      <TextInput
        style={[
          styles.translationInput,
          answerState === 'correct' && styles.inputCorrect,
          answerState === 'wrong' && styles.inputWrong,
        ]}
        value={input}
        onChangeText={onChangeText}
        placeholder="Type the word..."
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

function WordOrderView({
  exercise,
  selectedWords,
  answerState,
  showFr,
  onSelectWord,
  onCheck,
}: {
  exercise: WordOrderExercise;
  selectedWords: number[];
  answerState: AnswerState;
  showFr: boolean;
  onSelectWord: (i: number) => void;
  onCheck: () => void;
}) {
  const { t } = useTranslation();
  const builtSentence = selectedWords.map((i) => exercise.shuffledWords[i]).join(' ');

  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{exercise.instruction}</Text>
      {showFr && exercise.translationFr && (
        <Text style={styles.questionFr}>({exercise.translationFr})</Text>
      )}
      <View style={sbStyles.sentenceArea}>
        {selectedWords.length > 0 ? (
          <Text style={sbStyles.builtText}>{builtSentence}</Text>
        ) : (
          <Text style={sbStyles.placeholder}>{t('lesson.tapWordsToOrder') ?? 'Tap words in order...'}</Text>
        )}
      </View>
      <View style={sbStyles.wordChips}>
        {exercise.shuffledWords.map((word, i) => {
          const isSelected = selectedWords.includes(i);
          let chipBg = isSelected ? '#4F46E5' : '#F3F4F6';
          let textColor = isSelected ? '#fff' : '#1F2937';

          if (answerState !== 'idle') {
            const userWord = selectedWords.indexOf(i) !== -1
              ? exercise.shuffledWords[i]
              : null;
            const correctAtPos = exercise.correctOrder[selectedWords.indexOf(i)];
            if (userWord && userWord === correctAtPos) {
              chipBg = '#10B981';
              textColor = '#fff';
            } else if (isSelected) {
              chipBg = '#EF4444';
              textColor = '#fff';
            }
          }

          return (
            <TouchableOpacity
              key={i}
              style={[sbStyles.chip, { backgroundColor: chipBg }]}
              onPress={() => onSelectWord(i)}
              activeOpacity={answerState !== 'idle' ? 1 : 0.7}
            >
              <Text style={[sbStyles.chipText, { color: textColor }]}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answerState === 'idle' && selectedWords.length === exercise.shuffledWords.length && (
        <Button
          label={t('lesson.check')}
          variant="primary"
          size="md"
          fullWidth
          onPress={onCheck}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
}

function MatchPairsView({
  exercise,
  matchLeft,
  matchPaired,
  answerState,
  onSelect,
}: {
  exercise: MatchPairsExercise;
  matchLeft: number | null;
  matchPaired: Map<number, number>;
  answerState: AnswerState;
  onSelect: (side: 'left' | 'right', index: number) => void;
}) {
  const { t } = useTranslation();
  // Shuffle right side once using useMemo
  const rightOrder = useMemo(() => {
    const arr = exercise.pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [exercise.pairs]);

  const pairedLeft = new Set(matchPaired.keys());
  const pairedRight = new Set(matchPaired.values());

  return (
    <View style={styles.exerciseWrap}>
      <Text style={styles.instruction}>{exercise.instruction}</Text>
      <View style={matchStyles.container}>
        {/* Left column - English */}
        <View style={matchStyles.column}>
          {exercise.pairs.map((pair, i) => {
            const isPaired = pairedLeft.has(i);
            const isActive = matchLeft === i;
            let bg = '#F9FAFB';
            let border = 'transparent';
            if (answerState !== 'idle') {
              const pairedWith = matchPaired.get(i);
              bg = pairedWith === i ? '#D1FAE5' : '#FEE2E2';
              border = pairedWith === i ? '#10B981' : '#EF4444';
            } else if (isActive) {
              bg = '#EEF2FF';
              border = '#4F46E5';
            } else if (isPaired) {
              bg = '#D1FAE5';
              border = '#10B981';
            }
            return (
              <TouchableOpacity
                key={i}
                style={[matchStyles.item, { backgroundColor: bg, borderColor: border }]}
                onPress={() => onSelect('left', i)}
                activeOpacity={answerState !== 'idle' ? 1 : 0.7}
              >
                <Text style={matchStyles.itemText}>{pair.en}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Right column - French */}
        <View style={matchStyles.column}>
          {rightOrder.map((origIdx) => {
            const pair = exercise.pairs[origIdx];
            const isPaired = pairedRight.has(origIdx);
            let bg = '#F9FAFB';
            let border = 'transparent';
            if (answerState !== 'idle') {
              const matchEntry = Array.from(matchPaired.entries()).find(([, r]) => r === origIdx);
              bg = matchEntry && matchEntry[0] === origIdx ? '#D1FAE5' : '#FEE2E2';
              border = matchEntry && matchEntry[0] === origIdx ? '#10B981' : '#EF4444';
            } else if (isPaired) {
              bg = '#D1FAE5';
              border = '#10B981';
            }
            return (
              <TouchableOpacity
                key={origIdx}
                style={[matchStyles.item, { backgroundColor: bg, borderColor: border }]}
                onPress={() => onSelect('right', origIdx)}
                activeOpacity={answerState !== 'idle' ? 1 : 0.7}
              >
                <Text style={matchStyles.itemText}>{pair.fr}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const matchStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  item: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});

const sbStyles = StyleSheet.create({
  sentenceArea: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 18,
    minHeight: 60,
    justifyContent: 'center',
  },
  builtText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
    lineHeight: 28,
  },
  placeholder: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

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
