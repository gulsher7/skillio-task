import type { Cefr } from '@/models/home';
import type { CoachLine } from '@/models/coach';

/**
 * Lines to read aloud, grouped by the level they suit. The sentences themselves
 * are the English being taught, so — like the practice answers — they are never
 * translated; only the chrome around them is. Copy for `focusKey` lives in
 * `src/lang` under `coach.focus*`.
 *
 * Every line drills one sound that reliably catches learners out, and `trip`
 * marks where a first read is expected to slip. See README for why the scoring
 * is scripted rather than measured.
 */
const LINES: CoachLine[] = [
  // --- A2 ---
  {
    id: 'a2-1',
    level: 'A2',
    text: 'I think this is the right one.',
    focusKey: 'th',
    trip: [{ index: 1, verdict: 'close', ipa: '/θɪŋk/', heard: '/sɪŋk/' }],
  },
  {
    id: 'a2-2',
    level: 'A2',
    text: 'She works very hard every week.',
    focusKey: 'vw',
    trip: [{ index: 2, verdict: 'missed', ipa: '/ˈveri/', heard: '/ˈweri/' }],
  },
  {
    id: 'a2-3',
    level: 'A2',
    text: 'We watched a film and walked home.',
    focusKey: 'ed',
    trip: [{ index: 2, verdict: 'close', ipa: '/wɒtʃt/', heard: '/ˈwɒtʃɪd/' }],
  },
  {
    id: 'a2-4',
    level: 'A2',
    text: 'The ship is leaving the beach.',
    focusKey: 'shortLong',
    trip: [{ index: 1, verdict: 'missed', ipa: '/ʃɪp/', heard: '/ʃiːp/' }],
  },

  // --- B1 ---
  {
    id: 'b1-1',
    level: 'B1',
    text: 'I thought the weather would be better than this.',
    focusKey: 'th',
    trip: [
      { index: 1, verdict: 'close', ipa: '/θɔːt/', heard: '/tɔːt/' },
      { index: 3, verdict: 'missed', ipa: '/ˈweðə/', heard: '/ˈweθə/' },
    ],
  },
  {
    id: 'b1-2',
    level: 'B1',
    text: 'She recommended a quiet village by the river.',
    focusKey: 'stress',
    trip: [{ index: 1, verdict: 'missed', ipa: '/ˌrekəˈmendɪd/', heard: '/ˈrekəmendɪd/' }],
  },
  {
    id: 'b1-3',
    level: 'B1',
    text: 'We walked through the park and talked for hours.',
    focusKey: 'ed',
    trip: [
      { index: 1, verdict: 'close', ipa: '/wɔːkt/', heard: '/ˈwɔːkɪd/' },
      { index: 2, verdict: 'missed', ipa: '/θruː/', heard: '/θrəʊ/' },
    ],
  },
  {
    id: 'b1-4',
    level: 'B1',
    text: "I'd rather have left a little earlier.",
    focusKey: 'linking',
    trip: [{ index: 1, verdict: 'close', ipa: '/ˈrɑːðə/', heard: '/ˈrɑːzə/' }],
  },

  // --- B2 ---
  {
    id: 'b2-1',
    level: 'B2',
    text: 'The government eventually acknowledged the problem.',
    focusKey: 'stress',
    trip: [
      { index: 1, verdict: 'missed', ipa: '/ˈɡʌvənmənt/', heard: '/ˈɡʌvəmənt/' },
      { index: 3, verdict: 'close', ipa: '/əkˈnɒlɪdʒd/', heard: '/æknaʊˈlɛdʒd/' },
    ],
  },
  {
    id: 'b2-2',
    level: 'B2',
    text: 'Thoroughly rethinking it would be worthwhile.',
    focusKey: 'th',
    trip: [{ index: 0, verdict: 'missed', ipa: '/ˈθʌrəli/', heard: '/ˈθɔːrəfli/' }],
  },
  {
    id: 'b2-3',
    level: 'B2',
    text: 'Comfortable clothes are absolutely essential.',
    focusKey: 'silent',
    trip: [{ index: 0, verdict: 'close', ipa: '/ˈkʌmftəbl/', heard: '/ˈkʌmfɔːtəbl/' }],
  },
  {
    id: 'b2-4',
    level: 'B2',
    text: 'She particularly enjoyed the literature module.',
    focusKey: 'stress',
    trip: [{ index: 1, verdict: 'missed', ipa: '/pəˈtɪkjələli/', heard: '/ˌpɑːtɪkjʊˈlɑːli/' }],
  },
];

/** Levels either side of the learner's, nearest first, so there is always a line. */
const NEIGHBOURS: Record<Cefr, Cefr[]> = {
  A1: ['A2', 'B1', 'B2'],
  A2: ['B1', 'B2'],
  B1: ['B2', 'A2'],
  B2: ['B1', 'A2'],
  C1: ['B2', 'B1'],
  C2: ['B2', 'B1'],
};

export const LINES_PER_SESSION = 4;

/**
 * The lines for one session, pitched at the learner's level and topped up from
 * the nearest levels if that bucket is short.
 */
export function sessionLines(level: Cefr, count = LINES_PER_SESSION): CoachLine[] {
  const at = LINES.filter((line) => line.level === level);
  const pool = [...at];

  for (const fallback of NEIGHBOURS[level]) {
    if (pool.length >= count) break;
    pool.push(...LINES.filter((line) => line.level === fallback));
  }

  return pool.slice(0, count);
}

export const words = (line: CoachLine) => line.text.split(' ');
