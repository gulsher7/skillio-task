import { words } from '@/data/coachLines';
import type { CoachLine, LineAttempt, ScoredWord, WordVerdict } from '@/models/coach';

const WEIGHT: Record<WordVerdict, number> = {
  good: 1,
  close: 0.55,
  missed: 0,
};

/** One rung up the ladder, for what a retry earns you. */
const BETTER: Record<WordVerdict, WordVerdict> = {
  missed: 'close',
  close: 'good',
  good: 'good',
};

const lift = (verdict: WordVerdict, takes: number): WordVerdict => {
  let out = verdict;
  for (let i = 1; i < takes; i += 1) out = BETTER[out];
  return out;
};

/**
 * Scores one read of a line.
 *
 * The verdicts are scripted — see README — but they are not static: each retry
 * lifts every tripped word one rung, so a learner who listens to the correction
 * and reads it again is actually rewarded for it. That keeps the retry button
 * honest, and it means a reviewer pressing it twice doesn't see the same screen
 * three times.
 */
export function scoreLine(line: CoachLine, takes = 1): LineAttempt {
  const source = words(line);
  const tripped = new Map(line.trip.map((trip) => [trip.index, trip]));

  const scored: ScoredWord[] = source.map((text, index) => {
    const trip = tripped.get(index);
    if (!trip) return { text, verdict: 'good' };

    const verdict = lift(trip.verdict, takes);
    // Once a word lands, the hint that explained it has done its job.
    return verdict === 'good'
      ? { text, verdict }
      : { text, verdict, ipa: trip.ipa, heard: trip.heard };
  });

  const total = scored.reduce((sum, word) => sum + WEIGHT[word.verdict], 0);

  return {
    lineId: line.id,
    words: scored,
    score: Math.round((total / scored.length) * 100),
    takes,
  };
}

/** The first word still worth coaching, which is what the hint talks about. */
export const firstSlip = (attempt: LineAttempt): ScoredWord | null =>
  attempt.words.find((word) => word.verdict !== 'good' && word.ipa) ?? null;

/**
 * Turns a run of attempts into the number that goes back to Home. Only the best
 * take of each line counts — the session is measuring what you can say by the
 * end of it, not how you started.
 */
export function summarise(attempts: LineAttempt[], current: number | null) {
  const best = new Map<string, LineAttempt>();
  for (const attempt of attempts) {
    const seen = best.get(attempt.lineId);
    if (!seen || attempt.score > seen.score) best.set(attempt.lineId, attempt);
  }

  const kept = [...best.values()];
  const score = kept.length
    ? Math.round(kept.reduce((sum, attempt) => sum + attempt.score, 0) / kept.length)
    : 0;

  // With no baseline the session *is* the baseline, so the whole score lands.
  // Otherwise it nudges the existing number toward what was just read, which
  // keeps one good session from rewriting the skill outright.
  const next = current == null ? score : Math.round(current + (score - current) * 0.35);
  const clamped = Math.max(0, Math.min(100, next));

  return {
    attempts,
    score,
    level: clamped,
    delta: current == null ? clamped : clamped - current,
  };
}
