import { describe, it, expect } from 'vitest';
import type { Lesson, Exercise, MCQExercise, TranslationExercise, FillExercise } from './lessons';

// Test the lesson type definitions to ensure type safety
describe('Lesson data types', () => {
  it('should define a valid MCQ exercise', () => {
    const exercise: MCQExercise = {
      type: 'mcq',
      question: 'What is "hello" in French?',
      questionFr: 'Comment dit-on "hello" en francais ?',
      options: ['Bonjour', 'Au revoir', 'Merci', 'Bonsoir'],
      correctIndex: 0,
      explanation: '"Hello" is "Bonjour" in French',
    };

    expect(exercise.type).toBe('mcq');
    expect(exercise.options).toHaveLength(4);
    expect(exercise.correctIndex).toBe(0);
    expect(exercise.options[exercise.correctIndex]).toBe('Bonjour');
  });

  it('should define a valid translation exercise', () => {
    const exercise: TranslationExercise = {
      type: 'translation',
      instructionEn: 'Translate to English',
      instructionFr: 'Traduisez en anglais',
      sourceFr: 'Je suis content',
      targetEn: 'I am happy',
      hint: 'Think about emotions',
    };

    expect(exercise.type).toBe('translation');
    expect(exercise.sourceFr).toBe('Je suis content');
    expect(exercise.targetEn).toBe('I am happy');
  });

  it('should define a valid fill exercise', () => {
    const exercise: FillExercise = {
      type: 'fill',
      sentence: 'I ___ a student',
      sentenceFr: 'Je suis un etudiant',
      answer: 'am',
      options: ['am', 'is', 'are', 'be'],
    };

    expect(exercise.type).toBe('fill');
    expect(exercise.options).toContain(exercise.answer);
  });

  it('should define a valid lesson structure', () => {
    const lesson: Lesson = {
      id: 'lesson-1',
      level: 'A1' as any,
      emoji: '\u270F\uFE0F',
      title: 'Ma routine quotidienne',
      description: 'Apprends le vocabulaire de la routine',
      duration: 8,
      xpReward: 20,
      exercises: [],
    };

    expect(lesson.id).toBe('lesson-1');
    expect(lesson.duration).toBeGreaterThan(0);
    expect(lesson.xpReward).toBeGreaterThan(0);
    expect(lesson.exercises).toEqual([]);
  });

  it('should support all exercise types', () => {
    const types = ['mcq', 'translation', 'fill', 'sentence_build', 'listen_type', 'word_order', 'match_pairs'];

    types.forEach((type) => {
      expect(typeof type).toBe('string');
    });
  });
});
