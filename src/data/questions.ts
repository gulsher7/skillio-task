import type { SkillKey } from '@/models/home';

export type Question = {
  id: string;
  skill: SkillKey;
  /** A gap-fill prompt has a second half; a plain question does not. */
  gapFill: boolean;
  answers: string[];
  correct: number;
};

/**
 * Prompts and explanations live in `src/lang` under `practice.q1…q10`; the
 * answers are the English being taught, so they never get translated.
 */
const RAW: Question[] = [
  {
    id: 'q1',
    skill: 'grammar',
    gapFill: true,
    answers: ['to seeing', 'to see', 'seeing', 'for seeing'],
    correct: 0,
  },
  {
    id: 'q2',
    skill: 'vocabulary',
    gapFill: false,
    answers: ['exhausted', 'excited', 'anxious', 'amazed'],
    correct: 0,
  },
  {
    id: 'q3',
    skill: 'speaking',
    gapFill: true,
    answers: ['pick', 'take', 'get', 'bring'],
    correct: 0,
  },
  {
    id: 'q4',
    skill: 'grammar',
    gapFill: true,
    answers: ['has lived', 'lives', 'is living', 'lived'],
    correct: 0,
  },
  {
    id: 'q5',
    skill: 'speaking',
    gapFill: false,
    answers: ['No worries!', 'Yes, thanks.', 'It is nothing matter.', 'You are welcome for.'],
    correct: 0,
  },
  {
    id: 'q6',
    skill: 'vocabulary',
    gapFill: false,
    answers: ['stingy', 'kind', 'wealthy', 'honest'],
    correct: 0,
  },
  {
    id: 'q7',
    skill: 'pronunciation',
    gapFill: false,
    answers: ['knife', 'kitten', 'kettle', 'kind'],
    correct: 0,
  },
  {
    id: 'q8',
    skill: 'grammar',
    gapFill: true,
    answers: ['had', 'have', 'will have', 'would have'],
    correct: 0,
  },
  {
    id: 'q9',
    skill: 'vocabulary',
    gapFill: false,
    answers: [
      'start a friendly conversation',
      'feel very cold',
      'end a friendship',
      'make a mistake',
    ],
    correct: 0,
  },
  {
    id: 'q10',
    skill: 'pronunciation',
    gapFill: false,
    answers: ['pho-TOG-ra-pher', 'PHO-to-gra-pher', 'pho-to-GRA-pher', 'pho-to-gra-PHER'],
    correct: 0,
  },
];

/** Authoring is easier with the right answer first; players shouldn't see that. */
const SHUFFLE = [
  [1, 0, 2, 3],
  [2, 3, 0, 1],
  [0, 1, 2, 3],
  [3, 1, 0, 2],
  [1, 2, 0, 3],
  [2, 0, 3, 1],
  [3, 2, 1, 0],
  [1, 0, 3, 2],
  [0, 2, 1, 3],
  [2, 1, 0, 3],
];

export const QUESTIONS: Question[] = RAW.map((question, i) => {
  const order = SHUFFLE[i];
  return {
    ...question,
    answers: order.map((j) => question.answers[j]),
    correct: order.indexOf(question.correct),
  };
});
