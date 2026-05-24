import { Injectable } from '@nestjs/common';

/**
 * Implementation simplifiee de l'algorithme FSRS (Free Spaced Repetition Scheduler).
 * Reference: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * Qualites de reponse (rating) :
 *   1 = Again (oublie)
 *   2 = Hard
 *   3 = Good
 *   4 = Easy
 */

interface FsrsCard {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
}

interface FsrsScheduleResult {
  next_review_at: Date;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  mastery_level: number;
}

const FSRS_PARAMS = {
  w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
  DECAY: -0.5,
  FACTOR: 19 / 81,
  REQUEST_RETENTION: 0.9,
};

@Injectable()
export class FsrsService {
  schedule(card: FsrsCard, rating: 1 | 2 | 3 | 4): FsrsScheduleResult {
    let { stability, difficulty, reps, lapses } = card;

    if (reps === 0) {
      // Premier passage
      stability = FSRS_PARAMS.w[rating - 1] ?? 1;
      difficulty = Math.max(1, Math.min(10, 5 - (rating - 3) * 0.72));
    } else if (rating === 1) {
      // Oubli
      lapses += 1;
      stability = Math.max(
        0.1,
        stability * Math.exp(-0.3 * lapses) * FSRS_PARAMS.w[11],
      );
      difficulty = Math.min(10, difficulty + FSRS_PARAMS.w[6] * (1 - Math.exp(-reps * 0.1)));
    } else {
      // Souvenir
      const retrievability = Math.pow(1 + FSRS_PARAMS.FACTOR * (reps / stability), FSRS_PARAMS.DECAY);
      const stabilityGain = FSRS_PARAMS.w[8] * Math.exp(FSRS_PARAMS.w[9] * (1 - retrievability));
      stability = stability * (Math.exp(stabilityGain * Math.max(1, rating)) + FSRS_PARAMS.w[10] * (1 - retrievability));
      difficulty = Math.max(1, difficulty - FSRS_PARAMS.w[6] * (rating - 3));
    }

    reps += 1;

    const interval = Math.round(
      (stability / FSRS_PARAMS.FACTOR) *
        (Math.pow(FSRS_PARAMS.REQUEST_RETENTION, 1 / FSRS_PARAMS.DECAY) - 1),
    );

    const next_review_at = new Date();
    next_review_at.setDate(next_review_at.getDate() + Math.max(1, interval));

    const mastery_level = Math.min(1, reps / 10);

    return { next_review_at, stability, difficulty, reps, lapses, mastery_level };
  }

  getDueCount(nextReviewAt: Date): boolean {
    return new Date() >= nextReviewAt;
  }
}
