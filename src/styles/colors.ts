export const colors = {
  teal: '#08A4B3',
  teal600: '#07909E',
  teal700: '#056E79',
  teal50: '#ECF8F9',
  teal100: '#CDEEF1',
  teal200: '#9EDDE3',

  ink: '#0C2A33',
  ink2: '#48656C',
  ink3: '#8AA3A9',
  line: '#E2EDEF',
  bg: '#F3F8F9',
  surface: '#FFFFFF',

  /** XP */
  sun: '#FFC23D',
  sun50: '#FFF6DD',
  sunInk: '#5A3B00',
  /** streak */
  flame: '#FF7A45',
  flame50: '#FFEFE7',
  flameInk: '#C24A12',
  /** success, growth */
  mint: '#23B37F',
  mint50: '#E3F7EE',
  mintInk: '#157A56',
  /** wrong answer, live */
  berry: '#EE4F72',
  berry50: '#FDEBEF',
  berryInk: '#B8264A',
  /** level */
  violet: '#7566F0',
  violet50: '#EFEDFE',
  /** warnings, no lessons left */
  amber: '#F29A1F',
  amber50: '#FEF3E2',
  amberInk: '#8A5200',

  selectedCard: '#F1FBFC',
  disabled: '#DAE8EB',
  disabledText: '#93ABB0',

  skill: {
    grammar: '#7566F0',
    vocabulary: '#F29A1F',
    pronunciation: '#EE4F72',
    speaking: '#08A4B3',
  },
  skillTint: {
    grammar: '#EFEDFE',
    vocabulary: '#FEF3E2',
    pronunciation: '#FDEBEF',
    speaking: '#E3F6F8',
  },
} as const;

export const gradients = {
  primaryButton: ['#12B3C2', '#08A4B3', '#0799A7'],
  /** practice hero, not done yet */
  questCard: ['#12B7C6', '#08A4B3', '#067D89'],
  /** practice hero, done for today */
  questDone: ['#123A45', '#0C2A33', '#0A2229'],
  celebrate: ['#17BCCB', '#07808D'],
  journey: ['#08A4B3', '#23B37F'],
  xpBar: ['#FFD36A', '#FFB21E'],
  streakDay: ['#FFA25E', '#FF7A45'],
  planHeader: ['#0AAFBE', '#067F8C'],
  noPlanCard: ['#123A45', '#0C2A33'],
  tierChip: ['#FFE3A1', '#FFC23D'],
  logo: ['#1FC6D4', '#068C99'],
  buddy: ['#2CD0DD', '#0795A4'],
} as const;

export type SkillKey = keyof typeof colors.skill;
