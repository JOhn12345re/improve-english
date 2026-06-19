import { describe, it, expect } from 'vitest';
import { FREE_TIER_LIMITS, PREMIUM_LIMITS, TRIAL_DAYS } from './limits';

describe('Free Tier Limits', () => {
  it('should limit free tier to 3 daily lessons', () => {
    expect(FREE_TIER_LIMITS.daily_lessons).toBe(3);
  });

  it('should restrict free tier to 1 native language', () => {
    expect(FREE_TIER_LIMITS.native_languages).toBe(1);
  });

  it('should disable AI conversation for free tier', () => {
    expect(FREE_TIER_LIMITS.ai_conversation).toBe(false);
  });

  it('should disable offline mode for free tier', () => {
    expect(FREE_TIER_LIMITS.offline_mode).toBe(false);
  });

  it('should disable advanced stats for free tier', () => {
    expect(FREE_TIER_LIMITS.advanced_stats).toBe(false);
  });

  it('should disable certificate for free tier', () => {
    expect(FREE_TIER_LIMITS.certificate).toBe(false);
  });
});

describe('Premium Limits', () => {
  it('should allow unlimited daily lessons', () => {
    expect(PREMIUM_LIMITS.daily_lessons).toBe(Infinity);
  });

  it('should allow 7 native languages', () => {
    expect(PREMIUM_LIMITS.native_languages).toBe(7);
  });

  it('should enable all premium features', () => {
    expect(PREMIUM_LIMITS.ai_conversation).toBe(true);
    expect(PREMIUM_LIMITS.offline_mode).toBe(true);
    expect(PREMIUM_LIMITS.advanced_stats).toBe(true);
    expect(PREMIUM_LIMITS.certificate).toBe(true);
  });
});

describe('Trial', () => {
  it('should set trial to 7 days', () => {
    expect(TRIAL_DAYS).toBe(7);
  });
});
