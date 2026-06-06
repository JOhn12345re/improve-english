import { CefrLevel } from '@englishflow/shared-types';

export type ExerciseType = 'mcq' | 'translation' | 'fill' | 'sentence_build' | 'listen_type' | 'word_order' | 'match_pairs';

export interface MCQExercise {
  type: 'mcq';
  question: string;
  questionFr: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  explanationFr?: string;
}

export interface TranslationExercise {
  type: 'translation';
  instructionEn: string;
  instructionFr: string;
  sourceFr: string;
  targetEn: string;
  hint?: string;
  explanation?: string;
  explanationFr?: string;
}

export interface FillExercise {
  type: 'fill';
  sentence: string;
  sentenceFr: string;
  answer: string;
  options: string[];
  explanation?: string;
  explanationFr?: string;
}

export interface SentenceBuildExercise {
  type: 'sentence_build';
  instruction: string;
  instructionFr: string;
  words: string[];
  correctOrder: number[];
  targetSentence: string;
  targetFr: string;
  explanation?: string;
  explanationFr?: string;
}

export interface ListenTypeExercise {
  type: 'listen_type';
  instruction: string;
  instructionFr: string;
  word: string;
  audioUrl?: string;
}

export interface WordOrderExercise {
  type: 'word_order';
  instruction: string;
  instructionFr: string;
  shuffledWords: string[];
  correctOrder: string[];
  translationFr: string;
}

export interface MatchPairsExercise {
  type: 'match_pairs';
  instruction: string;
  instructionFr: string;
  pairs: Array<{ en: string; fr: string }>;
}

export type Exercise = MCQExercise | TranslationExercise | FillExercise | SentenceBuildExercise | ListenTypeExercise | WordOrderExercise | MatchPairsExercise;

export interface Lesson {
  id: string;
  level: CefrLevel;
  emoji: string;
  title: string;
  description: string;
  duration: number;
  xpReward: number;
  exercises: Exercise[];
}
