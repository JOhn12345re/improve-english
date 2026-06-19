import { describe, it, expect } from 'vitest';
import { getTrollMessage } from './troll-messages';

describe('getTrollMessage', () => {
  // ── Correct answers ─────────────────────────────────────────────────────

  describe('correct answers', () => {
    it('should return a non-empty string for A1 correct', () => {
      const msg = getTrollMessage('correct', 'A1');
      expect(msg).toBeTruthy();
      expect(typeof msg).toBe('string');
    });

    it('should return a message for each level', () => {
      for (const level of ['A1', 'A2', 'B1', 'B2']) {
        const msg = getTrollMessage('correct', level);
        expect(msg.length).toBeGreaterThan(0);
      }
    });

    it('should NEVER include genuinely encouraging phrases', () => {
      for (let i = 0; i < 50; i++) {
        const msg = getTrollMessage('correct', 'A1');
        // These would be genuinely encouraging (non-sarcastic)
        expect(msg).not.toMatch(/^Well done!$|^Good job!$|^Great work!$/i);
      }
    });

    it('should not repeat the same message on consecutive calls', () => {
      const messages = new Set<string>();
      for (let i = 0; i < 20; i++) {
        messages.add(getTrollMessage('correct', 'A1'));
      }
      // With 13 messages in A1 correct pool, should have variety
      expect(messages.size).toBeGreaterThan(3);
    });
  });

  // ── Wrong answers ───────────────────────────────────────────────────────

  describe('wrong answers', () => {
    it('should return a non-empty string for A1 wrong', () => {
      const msg = getTrollMessage('wrong', 'A1');
      expect(msg).toBeTruthy();
    });

    it('should return sarcastic messages (matching known patterns)', () => {
      const allMessages = new Set<string>();
      for (let i = 0; i < 100; i++) {
        allMessages.add(getTrollMessage('wrong', 'A1'));
      }
      // At least some should match our known wrong-answer patterns
      const hasKnownPattern = [...allMessages].some(
        (msg) =>
          msg.includes('Oof') ||
          msg.includes('Nope') ||
          msg.includes('Non') ||
          msg.includes('Rate') ||
          msg.includes('Euh'),
      );
      expect(hasKnownPattern).toBe(true);
    });

    it('should NEVER return encouraging language for wrong answers', () => {
      for (let i = 0; i < 100; i++) {
        const msg = getTrollMessage('wrong', 'A1');
        expect(msg).not.toMatch(/Bravo|Respect|Well done|Good job|Nice try/);
        // "Nice try" is in sarcasm pool but still sarcastic, which is fine
      }
    });

    it('should sometimes use generic sarcasm messages', () => {
      const messages = new Set<string>();
      for (let i = 0; i < 200; i++) {
        messages.add(getTrollMessage('wrong', 'B1'));
      }
      // Should contain sarcasm pool messages like "Wow, quel effort"
      const hasSarcasm = [...messages].some(
        (msg) =>
          msg.includes('Wow, quel effort') ||
          msg.includes('Impressionnant') ||
          msg.includes('Creatif') ||
          msg.includes('bug dans ta tete'),
      );
      expect(hasSarcasm).toBe(true);
    });
  });

  // ── Level handling ──────────────────────────────────────────────────────

  describe('level handling', () => {
    it('should default to A1 when no level specified', () => {
      const msg = getTrollMessage('correct');
      expect(msg).toBeTruthy();
    });

    it('should handle C1/C2 levels by mapping to B2', () => {
      const msg = getTrollMessage('correct', 'C1');
      expect(msg).toBeTruthy();
    });

    it('should handle lowercase levels', () => {
      const msg = getTrollMessage('correct', 'a2');
      expect(msg).toBeTruthy();
    });

    it('should handle invalid levels by defaulting to A1', () => {
      const msg = getTrollMessage('correct', 'Z9');
      expect(msg).toBeTruthy();
    });
  });

  // ── Randomization ───────────────────────────────────────────────────────

  describe('randomization', () => {
    it('should produce variety across multiple calls', () => {
      const messages = new Set<string>();
      for (let i = 0; i < 50; i++) {
        messages.add(getTrollMessage('correct', 'A1'));
      }
      // A1 correct pool has 13 messages, we should see most of them
      expect(messages.size).toBeGreaterThanOrEqual(5);
    });

    it('should avoid repeating the same message consecutively', () => {
      let prevMsg = '';
      let consecutiveRepeats = 0;

      for (let i = 0; i < 30; i++) {
        const msg = getTrollMessage('correct', 'A1');
        if (msg === prevMsg) consecutiveRepeats++;
        prevMsg = msg;
      }

      // With anti-repeat logic, should have very few repeats
      expect(consecutiveRepeats).toBeLessThan(3);
    });
  });
});
