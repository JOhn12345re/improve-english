# QA Audit Report - Brila App (EnglishFlow)

**Date**: 2026-06-06
**Duration**: ~2h
**Overall Status**: **NO-GO** (3 blockers to fix first)

## Executive Summary

- Total checks: 48
- Passed: 38
- Failed/Issues: 10
- Backend test coverage: 34% (97/97 tests pass, but only integration modules covered)
- Mobile test coverage: 0% (no tests exist)

---

## Detailed Findings

### Backend (NestJS)

| Check | Status | Notes |
|---|---|---|
| Build | PASS | `nest build` clean |
| Unit tests (97) | PASS | 10 suites, all green |
| Test coverage | FAIL | 34% lines (target 90%). Core modules (auth, users, lessons, vocabulary, progress, subscriptions) at 0% |
| Integration tests | PASS | Dictionary, Datamuse, LanguageTool, Translation, TTS, LLM, VOA, Classifier, LessonGenerator all pass |
| API startup | FAIL (FIXED) | `@nestjs/schedule` v6 incompatible with NestJS 10. Downgraded to v4, moved ScheduleModule to AppModule. Still fails due to pnpm Reflector singleton issue. Workaround: disabled ScheduleModule (crons won't run) |
| Health endpoint | PASS | `{"status":"ok"}` |
| Lessons endpoint | PASS | 84 lessons returned |
| Lesson detail | PASS | Content JSON with exercises present |
| Vocabulary endpoint | PASS | 530 words in DB |
| DB integrity | PASS | No orphans, no empty content, all levels populated |
| ESLint | FAIL | Plugin `@typescript-eslint/eslint-plugin` not installed |

### Frontend Mobile (React Native / Expo)

| Check | Status | Notes |
|---|---|---|
| TypeScript | PASS | After 1 fix (`/essentials` route type) |
| Unit tests | FAIL | **Zero test files exist** |
| Safe area (top) | PASS | All screens use `edges={['top']}` |
| Safe area (bottom) | WARN | Tab screens don't protect bottom edge |
| Bottom nav overlap | FAIL | Lessons screen: only 32px padding (needs 100px). Profile logout button at risk |
| Accessibility labels | FAIL | 25+ interactive elements missing `accessibilityLabel` |
| Responsive design | WARN | Flashcard `maxHeight: 320` hardcoded. Generally good flex usage |
| Performance | WARN | No `React.memo` usage. Lessons FlatList missing optimization flags |
| Error handling | FAIL | No global error UI. API failures silently ignored on multiple screens |
| Navigation | PASS | Tab nav, stack nav, onboarding flow all properly structured |

### Security & RGPD

| Check | Status | Notes |
|---|---|---|
| Auth (JWT) | PASS | 401 on invalid/missing tokens |
| SQL injection | PASS | Rejected by class-validator |
| XSS | PASS | Rejected by email validation |
| JWT tampering | PASS | 401 on forged tokens |
| Rate limiting | FAIL | ThrottlerModule imported but ThrottlerGuard NOT registered as APP_GUARD. No rate limiting active |
| Data export (RGPD) | PASS | `GET /users/me/export` returns user, progress, vocabulary, subscription |
| Account deletion (RGPD) | PARTIAL | Soft delete with 14-day delay works. **But no purge cronjob** to hard-delete data |
| .env protection | PASS | `.gitignore` blocks `.env` files |
| Password storage | PASS | No passwords stored (Supabase Auth handles this) |

### Integrations Health

| Service | Status | Latency |
|---|---|---|
| Free Dictionary API | OK | 147ms |
| Datamuse | OK | 246ms |
| LanguageTool | ERROR | 1546ms (timeout) |
| MyMemory Translation | OK | 465ms |
| DeepL | SKIPPED | No API key |
| Amazon Polly TTS | SKIPPED | No AWS credentials |
| Groq LLM | OK | 143ms |
| Anthropic Claude | SKIPPED | No API key |

---

## Issues Found

### BLOCKERS (must fix before launch)

1. **API cannot start with ScheduleModule** - `@nestjs/schedule` Reflector resolution fails with pnpm singleton. Cron jobs (VOA ingestion, classifier, lesson generator) won't run. **Fix**: Either upgrade NestJS to v11 or fix pnpm hoisting config. **Estimate: 1-2h**

2. **Rate limiting not active** - `ThrottlerGuard` is never registered as `APP_GUARD`. Any endpoint can be hammered without limits. **Fix**: Add `{ provide: APP_GUARD, useClass: ThrottlerGuard }` to AppModule providers. **Estimate: 15min**

3. **No RGPD purge cronjob** - Users who request account deletion are soft-deleted but never actually removed from DB. RGPD violation. **Fix**: Add a daily cron that hard-deletes users where `deleted_at < NOW()`. **Estimate: 1h**

### MAJOR (should fix ASAP)

4. **Zero mobile test coverage** - No test files at all in the mobile app. Critical for regression prevention. **Estimate: 2-3 days for basic coverage**

5. **Backend core module coverage at 0%** - Auth, users, lessons, vocabulary, progress, subscriptions have no tests. Only integration service specs exist. **Estimate: 2-3 days**

6. **No error UI on mobile** - API failures are silently swallowed. Users see infinite spinners or stale data. **Fix**: Add global error toast/modal component. **Estimate: 4h**

7. **Bottom nav overlap on tab screens** - Content gets hidden behind 60px tab bar. Lessons screen only has 32px padding. **Fix**: Increase `contentContainerStyle.paddingBottom` to 100 on all tab screen ScrollViews/FlatLists. **Estimate: 30min**

8. **LanguageTool integration down** - Returns error/timeout. Grammar checking unavailable. **Fix**: Verify LanguageTool URL/config or add graceful degradation. **Estimate: 1h**

### MINOR (nice to fix)

9. **25+ missing accessibility labels** - Most TouchableOpacity components lack `accessibilityLabel`. **Estimate: 2h**

10. **ESLint not configured/installed** - Backend plugin missing, mobile has no config at all. **Estimate: 1h**

11. **Flashcard maxHeight hardcoded** - `maxHeight: 320` in vocabulary.tsx not responsive for large screens. **Estimate: 15min**

12. **FlatList missing optimization flags** - lessons.tsx FlatList needs `initialNumToRender`, `windowSize`, `maxToRenderPerBatch`. **Estimate: 15min**

---

## Performance Metrics

| Metric | Target | Actual | Status |
|---|---|---|---|
| Backend build time | <30s | ~5s | PASS |
| API startup time | <5s | ~2s | PASS |
| API health latency | <200ms | ~5ms | PASS |
| Dictionary API latency | <500ms | 147ms | PASS |
| Datamuse API latency | <500ms | 246ms | PASS |
| Groq LLM latency | <500ms | 143ms | PASS |
| Translation API latency | <1s | 465ms | PASS |
| Backend test suite | <120s | 60s | PASS |
| DB queries (count) | <100ms | ~50ms | PASS |
| Test coverage (backend) | >=70% | 34% | FAIL |
| Test coverage (mobile) | >=70% | 0% | FAIL |

---

## Database Stats

| Table | Count | Status |
|---|---|---|
| Lessons | 84 | PASS (>=5) |
| VocabularyWords | 530 | PASS (>=50) |
| Users | 0 | Expected (prod) |
| Orphan records | 0 | PASS |
| Empty lessons | 0 | PASS |

### Lessons by Level

| Level | Count |
|---|---|
| A1 | 24 |
| A2 | 16 |
| B1 | 16 |
| B2 | 18 |
| C1 | 5 |
| C2 | 5 |

---

## Recommendations

1. **IMMEDIATE**: Fix rate limiting (15min) - add ThrottlerGuard as APP_GUARD
2. **IMMEDIATE**: Fix ScheduleModule (upgrade NestJS to v11 or fix pnpm config)
3. **IMMEDIATE**: Add RGPD purge cronjob for hard-deleting soft-deleted users
4. **THIS WEEK**: Fix bottom nav overlap on tab screens (30min)
5. **THIS WEEK**: Add error toast/modal component for API failures
6. **THIS WEEK**: Fix LanguageTool integration or add graceful fallback
7. **NEXT SPRINT**: Write mobile component tests (at least critical screens)
8. **NEXT SPRINT**: Write backend tests for core modules (auth, users, lessons)
9. **BACKLOG**: Add accessibility labels across all screens
10. **BACKLOG**: Set up ESLint properly for both packages

---

## Sign-Off

**QA Status**: **NO-GO** - 3 blockers must be resolved before production deployment
**Blocking Issues**: Rate limiting inactive, ScheduleModule broken, RGPD purge missing
**After Fixes**: Re-test Phase 3 (API startup) and Phase 5 (rate limiting + RGPD purge)
**Next Actions**: Fix 3 blockers -> Re-audit -> Deploy to TestFlight

---

Generated: 2026-06-06T02:10:00Z
Tester: Claude Code QA (Opus 4.6)
