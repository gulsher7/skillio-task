import type { SkillKey } from '@/models/home';

export type Question = {
  skill: SkillKey;
  /** Two parts means a fill-in-the-gap prompt; one part is a plain question. */
  prompt: [string] | [string, string];
  answers: string[];
  correct: number;
  why: string;
};

const RAW: Question[] = [
  {
    skill: 'grammar',
    prompt: ["I'm really looking forward", 'you this weekend.'],
    answers: ['to seeing', 'to see', 'seeing', 'for seeing'],
    correct: 0,
    why: '"Look forward to" is followed by the -ing form.',
  },
  {
    skill: 'vocabulary',
    prompt: ['Which word means "extremely tired"?'],
    answers: ['exhausted', 'excited', 'anxious', 'amazed'],
    correct: 0,
    why: '"Exhausted" is a stronger way to say very tired.',
  },
  {
    skill: 'speaking',
    prompt: ['Could you', 'me up from the station at six?'],
    answers: ['pick', 'take', 'get', 'bring'],
    correct: 0,
    why: '"Pick someone up" means to collect them.',
  },
  {
    skill: 'grammar',
    prompt: ['She', 'in London since 2019.'],
    answers: ['has lived', 'lives', 'is living', 'lived'],
    correct: 0,
    why: 'Use the present perfect with "since" for something still true.',
  },
  {
    skill: 'speaking',
    prompt: ['Your friend says "Thanks so much!" The most natural reply is…'],
    answers: ['No worries!', 'Yes, thanks.', 'It is nothing matter.', 'You are welcome for.'],
    correct: 0,
    why: '"No worries!" is a friendly, natural reply.',
  },
  {
    skill: 'vocabulary',
    prompt: ['Choose the opposite of "generous".'],
    answers: ['stingy', 'kind', 'wealthy', 'honest'],
    correct: 0,
    why: 'A stingy person does not like to share.',
  },
  {
    skill: 'pronunciation',
    prompt: ['Which word has a silent letter?'],
    answers: ['knife', 'kitten', 'kettle', 'kind'],
    correct: 0,
    why: 'The "k" in knife is silent: /naɪf/.',
  },
  {
    skill: 'grammar',
    prompt: ['If I', 'more time, I would travel more.'],
    answers: ['had', 'have', 'will have', 'would have'],
    correct: 0,
    why: 'The second conditional uses the past simple after "if".',
  },
  {
    skill: 'vocabulary',
    prompt: ['"To break the ice" means to…'],
    answers: [
      'start a friendly conversation',
      'feel very cold',
      'end a friendship',
      'make a mistake',
    ],
    correct: 0,
    why: 'It means making people feel relaxed at first.',
  },
  {
    skill: 'pronunciation',
    prompt: ['Where is the stress in "photographer"?'],
    answers: ['pho-TOG-ra-pher', 'PHO-to-gra-pher', 'pho-to-GRA-pher', 'pho-to-gra-PHER'],
    correct: 0,
    why: 'The stress falls on the second syllable: pho-TOG-ra-pher.',
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

export const QUESTIONS: Question[] = RAW.map((q, i) => {
  const order = SHUFFLE[i];
  return {
    ...q,
    answers: order.map((j) => q.answers[j]),
    correct: order.indexOf(q.correct),
  };
});
