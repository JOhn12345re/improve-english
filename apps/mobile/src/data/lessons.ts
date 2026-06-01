import { CefrLevel } from '@englishflow/shared-types';

export type ExerciseType = 'mcq' | 'translation' | 'fill' | 'sentence_build';

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

export type Exercise = MCQExercise | TranslationExercise | FillExercise | SentenceBuildExercise;

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
