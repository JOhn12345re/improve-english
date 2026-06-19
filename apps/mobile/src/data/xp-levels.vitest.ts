import { describe, it, expect } from 'vitest';
import {
  getLevelInfo,
  getNextLevelInfo,
  getProgressToNext,
  getXpToNextLevel,
  didLevelUp,
} from './xp-levels';

describe('xp-levels', () => {
  // ── getLevelInfo ─────────────────────────────────────────────────────────

  describe('getLevelInfo', () => {
    it('should return level 1 for 0 XP', () => {
      const info = getLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.title).toBe('Debutant');
    });

    it('should return level 2 for 50 XP', () => {
      expect(getLevelInfo(50).level).toBe(2);
    });

    it('should return level 2 for 119 XP (just below level 3)', () => {
      expect(getLevelInfo(119).level).toBe(2);
    });

    it('should return level 3 for exactly 120 XP', () => {
      expect(getLevelInfo(120).level).toBe(3);
    });

    it('should return level 20 for very high XP', () => {
      const info = getLevelInfo(99999);
      expect(info.level).toBe(20);
      expect(info.title).toBe('Omniscient');
    });

    it('should return level 1 for negative XP', () => {
      expect(getLevelInfo(-10).level).toBe(1);
    });
  });

  // ── getNextLevelInfo ────────────────────────────────────────────────────

  describe('getNextLevelInfo', () => {
    it('should return level 2 info when at level 1', () => {
      const next = getNextLevelInfo(0);
      expect(next).not.toBeNull();
      expect(next!.level).toBe(2);
      expect(next!.xpRequired).toBe(50);
    });

    it('should return null when at max level', () => {
      const next = getNextLevelInfo(15000);
      expect(next).toBeNull();
    });
  });

  // ── getProgressToNext ───────────────────────────────────────────────────

  describe('getProgressToNext', () => {
    it('should return 0 at the start of a level', () => {
      const progress = getProgressToNext(0);
      expect(progress).toBe(0);
    });

    it('should return 0.5 halfway through level 1 (25/50)', () => {
      const progress = getProgressToNext(25);
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it('should return 1 at max level', () => {
      const progress = getProgressToNext(15000);
      expect(progress).toBe(1);
    });

    it('should not exceed 1', () => {
      const progress = getProgressToNext(99999);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  // ── getXpToNextLevel ────────────────────────────────────────────────────

  describe('getXpToNextLevel', () => {
    it('should return 50 at 0 XP (need 50 for level 2)', () => {
      expect(getXpToNextLevel(0)).toBe(50);
    });

    it('should return 25 at 25 XP', () => {
      expect(getXpToNextLevel(25)).toBe(25);
    });

    it('should return 0 at max level', () => {
      expect(getXpToNextLevel(15000)).toBe(0);
    });
  });

  // ── didLevelUp ──────────────────────────────────────────────────────────

  describe('didLevelUp', () => {
    it('should detect level up from 1 to 2', () => {
      const result = didLevelUp(40, 60);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(2);
    });

    it('should return null when no level change', () => {
      const result = didLevelUp(10, 30);
      expect(result).toBeNull();
    });

    it('should detect level up across multiple levels', () => {
      const result = didLevelUp(0, 200);
      expect(result).not.toBeNull();
      expect(result!.level).toBe(4); // 200 = Explorateur
    });

    it('should return null when XP decreases (should not happen)', () => {
      const result = didLevelUp(100, 10);
      expect(result).toBeNull();
    });

    it('should return the new level info with title and icon', () => {
      const result = didLevelUp(40, 60);
      expect(result).toEqual(
        expect.objectContaining({
          level: 2,
          title: 'Curieux',
        }),
      );
    });
  });
});
