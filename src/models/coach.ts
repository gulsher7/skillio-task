import type { Cefr } from './home';

/** How well a single word came back. Drives its colour and whether it gets a hint. */
export type WordVerdict = 'good' | 'close' | 'missed';

export type ScoredWord = {
  /** The word as it appears in the line, punctuation and all. */
  text: string;
  verdict: WordVerdict;
  /** IPA for the target sound, shown only when the word came back short. */
  ipa?: string;
  /** What the learner most likely said instead. Pairs with `ipa` in the hint. */
  heard?: string;
};

/**
 * A word the scripted run marks down, and everything the hint needs to say why.
 * `index` points into the line's whitespace-split words.
 */
export type Trip = {
  index: number;
  verdict: Exclude<WordVerdict, 'good'>;
  ipa: string;
  heard: string;
};

/**
 * One line to read aloud. `focus` names the sound the line was chosen to
 * exercise; `trip` is where a first read is expected to slip.
 */
export type CoachLine = {
  id: string;
  level: Cefr;
  text: string;
  /** The sound this line drills — copy lives in `src/lang` under `coach.focus*`. */
  focusKey: string;
  trip: Trip[];
};

export type LineAttempt = {
  lineId: string;
  words: ScoredWord[];
  /** 0–100 for this line alone. */
  score: number;
  /** 1 on the first read, 2 after the first retry, and so on. */
  takes: number;
};

export type CoachResult = {
  attempts: LineAttempt[];
  /** 0–100 across every line read. */
  score: number;
  /** Where pronunciation lands after this session, absolute. */
  level: number;
  /** The change that got it there — 0 or more on a first, baselining session. */
  delta: number;
};

/** Where the session is in its lifecycle. The orb reads this too. */
export type CoachPhase =
  | 'intro'
  | 'ready'
  | 'listening'
  | 'scoring'
  | 'scored'
  | 'silent'
  | 'denied'
  | 'summary';
