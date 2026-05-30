import { CefrLevel } from '@englishflow/shared-types';

export type ExerciseType = 'mcq' | 'translation' | 'fill';

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
}

export interface FillExercise {
  type: 'fill';
  sentence: string;
  sentenceFr: string;
  answer: string;
  options: string[];
}

export type Exercise = MCQExercise | TranslationExercise | FillExercise;

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
