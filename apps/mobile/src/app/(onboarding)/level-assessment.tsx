import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CefrLevel } from '@englishflow/shared-types';
import type { AssessmentQuestion, AssessmentResult } from '@englishflow/shared-types';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Screen from '@/components/ui/Screen';
import { useOnboardingStore } from '@/stores/onboarding.store';

// Questions de test rapide intégrées (pas besoin d'appel API pour le placement initial)
const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    question: 'What is the capital of England?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    correct_index: 1,
    level_indicator: CefrLevel.A1,
  },
  {
    id: 'q2',
    question: 'Choose the correct sentence:',
    options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She goed to school.'],
    correct_index: 1,
    level_indicator: CefrLevel.A2,
  },
  {
    id: 'q3',
    question: 'Complete: "I have been working here ___ 2019."',
    options: ['for', 'since', 'during', 'from'],
    correct_index: 1,
    level_indicator: CefrLevel.B1,
  },
  {
    id: 'q4',
    question: 'What does "ubiquitous" mean?',
    options: ['Rare and unique', 'Present everywhere', 'Extremely loud', 'Very old'],
    correct_index: 1,
    level_indicator: CefrLevel.B2,
  },
  {
    id: 'q5',
    question: 'Choose the most appropriate word: "The politician\'s speech was full of ___."',
    options: ['equivocations', 'happiness', 'sentences', 'questions'],
    correct_index: 0,
    level_indicator: CefrLevel.C1,
  },
];

function calculateLevel(score: number, total: number): CefrLevel {
  const ratio = score / total;
  if (ratio < 0.2) return CefrLevel.A1;
  if (ratio < 0.4) return CefrLevel.A2;
  if (ratio < 0.6) return CefrLevel.B1;
  if (ratio < 0.8) return CefrLevel.B2;
  return CefrLevel.C1;
}

type Mode = 'choice' | 'quiz' | 'result';

export default function LevelAssessmentScreen() {
  const { t } = useTranslation();
  const { setLevel } = useOnboardingStore();

  const [mode, setMode] = useState<Mode>('choice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  function handleBeginner() {
    setLevel(CefrLevel.A1);
    router.push('/(onboarding)/goals');
  }

  function handleStartQuiz() {
    setMode('quiz');
  }

  function handleSelectOption(index: number) {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);

    const correct = ASSESSMENT_QUESTIONS[currentIndex].correct_index === index;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        const finalScore = correct ? score + 1 : score;
        const level = calculateLevel(finalScore, ASSESSMENT_QUESTIONS.length);
        setResult({ level, score: finalScore, total: ASSESSMENT_QUESTIONS.length });
        setLevel(level);
        setMode('result');
      }
    }, 800);
  }

  function handleConfirmResult() {
    router.push('/(onboarding)/goals');
  }

  if (mode === 'choice') {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.progressRow}>
            <ProgressBar progress={0.5} />
            <Text style={styles.step}>{t('onboarding.step', { current: 2, total: 4 })}</Text>
          </View>
          <Text style={styles.title}>{t('onboarding.levelAssessment.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.levelAssessment.subtitle')}</Text>

          <View style={styles.choices}>
            <TouchableOpacity style={styles.choiceCard} onPress={handleBeginner} activeOpacity={0.8}>
              <Text style={styles.choiceEmoji}>👋</Text>
              <Text style={styles.choiceTitle}>{t('onboarding.levelAssessment.beginner')}</Text>
              <Text style={styles.choiceDesc}>{t('onboarding.levelAssessment.beginnerDesc')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.choiceCard, styles.choiceCardPrimary]} onPress={handleStartQuiz} activeOpacity={0.8}>
              <Text style={styles.choiceEmoji}>🎯</Text>
              <Text style={[styles.choiceTitle, styles.choiceTitlePrimary]}>
                {t('onboarding.levelAssessment.evaluate')}
              </Text>
              <Text style={[styles.choiceDesc, styles.choiceDescPrimary]}>
                {t('onboarding.levelAssessment.evaluateDesc')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  if (mode === 'quiz') {
    const question = ASSESSMENT_QUESTIONS[currentIndex];
    const progress = (currentIndex + 1) / ASSESSMENT_QUESTIONS.length;

    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.progressRow}>
            <ProgressBar progress={progress} />
            <Text style={styles.step}>
              {t('onboarding.levelAssessment.questionOf', {
                current: currentIndex + 1,
                total: ASSESSMENT_QUESTIONS.length,
              })}
            </Text>
          </View>

          <Text style={styles.question}>{question.question}</Text>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              let optionStyle = styles.option;
              if (answered && index === question.correct_index) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
              } else if (answered && index === selectedOption && index !== question.correct_index) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
              } else if (selectedOption === index) {
                optionStyle = { ...styles.option, ...styles.optionSelected };
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={optionStyle}
                  onPress={() => handleSelectOption(index)}
                  activeOpacity={answered ? 1 : 0.7}
                >
                  <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}.</Text>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Screen>
    );
  }

  // result
  return (
    <Screen>
      <View style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>🎉</Text>
        <Text style={styles.resultTitle}>{t('onboarding.levelAssessment.resultTitle')}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{result?.level}</Text>
        </View>
        <Text style={styles.resultScore}>
          {t('onboarding.levelAssessment.resultScore', {
            score: result?.score,
            total: result?.total,
          })}
        </Text>
        <Button
          label={t('common.continue')}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleConfirmResult}
          style={styles.resultButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    gap: 20,
  },
  progressRow: {
    gap: 8,
  },
  step: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: -8,
  },
  choices: {
    gap: 14,
    marginTop: 8,
  },
  choiceCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  choiceCardPrimary: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  choiceEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  choiceTitlePrimary: {
    color: '#4F46E5',
  },
  choiceDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  choiceDescPrimary: {
    color: '#6366F1',
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
    lineHeight: 28,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    width: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  resultEmoji: {
    fontSize: 64,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  levelBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultScore: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultButton: {
    marginTop: 16,
    width: '100%',
  },
});
