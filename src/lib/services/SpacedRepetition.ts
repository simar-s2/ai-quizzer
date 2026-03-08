// SM-2 Algorithm
// score is 0–100 (your percentage). We map it to the 0–5 quality scale SM-2 expects.
// q < 3 = failed recall, q >= 3 = successful recall

export interface SRSInput {
  score: number;          // 0–100 percentage from mark-quiz
  easeFactor: number;     // current ease factor (default 2.5)
  intervalDays: number;   // current interval in days (default 0)
  repetitions: number;    // how many times reviewed successfully in a row
}

export interface SRSOutput {
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: Date;
}

function scoreToQuality(score: number): number {
  // Map 0–100 percentage to SM-2 quality 0–5
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
}

export function calculateNextReview(input: SRSInput): SRSOutput {
  const q = scoreToQuality(input.score);

  // SM-2: update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = input.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor); // EF never drops below 1.3

  let newIntervalDays: number;

  if (q < 3) {
    // Failed — reset interval, review again soon
    newIntervalDays = 1;
  } else {
    // Passed — calculate next interval
    if (input.repetitions === 0) {
      newIntervalDays = 1;
    } else if (input.repetitions === 1) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(input.intervalDays * newEaseFactor);
    }
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newIntervalDays);
  nextReviewAt.setHours(0, 0, 0, 0); // start of day

  return {
    easeFactor: Math.round(newEaseFactor * 1000) / 1000,
    intervalDays: newIntervalDays,
    nextReviewAt,
  };
}