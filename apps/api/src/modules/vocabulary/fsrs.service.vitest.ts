import { describe, it, expect, beforeEach } from 'vitest';
import { FsrsService } from './fsrs.service';

describe('FsrsService', () => {
  let service: FsrsService;

  beforeEach(() => {
    service = new FsrsService();
  });

  // ── schedule ────────────────────────────────────────────────────────────

  describe('schedule', () => {
    const newCard = { stability: 1, difficulty: 5, reps: 0, lapses: 0 };

    it('should handle first review (reps=0)', () => {
      const result = service.schedule(newCard, 3);

      expect(result.reps).toBe(1);
      expect(result.stability).toBeGreaterThan(0);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);
      expect(result.difficulty).toBeLessThanOrEqual(10);
      expect(result.mastery_level).toBeGreaterThan(0);
      expect(result.next_review_at).toBeInstanceOf(Date);
    });

    it('should set higher stability for "Easy" (4) than "Again" (1)', () => {
      const easy = service.schedule(newCard, 4);
      const again = service.schedule(newCard, 1);

      expect(easy.stability).toBeGreaterThan(again.stability);
    });

    it('should increase lapses on "Again" (1) for an existing card', () => {
      const card = { stability: 5, difficulty: 4, reps: 5, lapses: 0 };
      const result = service.schedule(card, 1);

      expect(result.lapses).toBe(1);
    });

    it('should reduce stability on "Again"', () => {
      const card = { stability: 10, difficulty: 4, reps: 5, lapses: 0 };
      const result = service.schedule(card, 1);

      expect(result.stability).toBeLessThan(10);
    });

    it('should increase stability on "Good" (3) for existing card', () => {
      const card = { stability: 5, difficulty: 5, reps: 3, lapses: 0 };
      const result = service.schedule(card, 3);

      expect(result.stability).toBeGreaterThan(5);
    });

    it('should increase reps by 1 each time', () => {
      const card = { stability: 3, difficulty: 5, reps: 7, lapses: 0 };
      const result = service.schedule(card, 3);

      expect(result.reps).toBe(8);
    });

    it('should set next_review_at in the future', () => {
      const result = service.schedule(newCard, 3);
      const now = new Date();

      expect(result.next_review_at.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should cap mastery_level at 1', () => {
      const card = { stability: 100, difficulty: 1, reps: 15, lapses: 0 };
      const result = service.schedule(card, 4);

      expect(result.mastery_level).toBeLessThanOrEqual(1);
    });

    it('should keep difficulty between 1 and 10', () => {
      // Very easy answers should not go below 1
      let card = { stability: 5, difficulty: 1.5, reps: 5, lapses: 0 };
      let result = service.schedule(card, 4);
      expect(result.difficulty).toBeGreaterThanOrEqual(1);

      // Very hard answers (Again) should not exceed 10
      card = { stability: 5, difficulty: 9.5, reps: 20, lapses: 5 };
      result = service.schedule(card, 1);
      expect(result.difficulty).toBeLessThanOrEqual(10);
    });

    it('should reduce difficulty on easier ratings', () => {
      const card = { stability: 5, difficulty: 6, reps: 5, lapses: 0 };
      const result = service.schedule(card, 4); // Easy

      expect(result.difficulty).toBeLessThan(6);
    });
  });

  // ── getDueCount ─────────────────────────────────────────────────────────

  describe('getDueCount', () => {
    it('should return true for past dates', () => {
      const past = new Date('2020-01-01');
      expect(service.getDueCount(past)).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date('2099-01-01');
      expect(service.getDueCount(future)).toBe(false);
    });
  });
});
