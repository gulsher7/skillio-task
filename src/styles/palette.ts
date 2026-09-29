/**
 * Two palettes with identical keys. Anything that sits on a coloured fill — the
 * teal hero, the sun-yellow XP chip, a deliberately dark pill — uses the
 * CONSTANT tokens at the bottom, because those surfaces do not change with the
 * theme and their text must not either.
 */

const constants = {
  /** Text and icons on teal/violet/mint fills. Always white. */
  onAccent: '#FFFFFF',
  /** Pills and cards that are dark on purpose, in both themes. */
  inkSurface: '#0C2A33',
  onInkSurface: '#FFFFFF',
  /** The literal white button used on top of gradients. */
  white: '#FFFFFF',
  onWhite: '#056E79',
  /** Text on the sun-yellow XP chip. */
  sunInk: '#5A3B00',
} as const;

export const lightPalette = {
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
  /** A step back from `surface` — stat tiles, inert chips. */
  subtle: '#F3F8F9',

  sun: '#FFC23D',
  sun50: '#FFF6DD',
  flame: '#FF7A45',
  flame50: '#FFEFE7',
  flameInk: '#C24A12',
  mint: '#23B37F',
  mint50: '#E3F7EE',
  mintInk: '#157A56',
  berry: '#EE4F72',
  berry50: '#FDEBEF',
  berryInk: '#B8264A',
  violet: '#7566F0',
  violet50: '#EFEDFE',
  amber: '#F29A1F',
  amber50: '#FEF3E2',
  amberInk: '#8A5200',

  selectedCard: '#F1FBFC',
  disabled: '#DAE8EB',
  disabledText: '#93ABB0',
  /** The tint behind blurred chrome (header, tab bar). */
  chrome: 'rgba(243,248,249,0.72)',
  chromeStrong: 'rgba(255,255,255,0.82)',
  scrim: 'rgba(8,30,36,0.42)',
  grab: '#D5E2E5',
  track: '#EAF2F3',
  trackLine: '#D3E2E5',
  placeholder: '#B4C7CB',
  tickBorder: '#CFDDE0',

  /** Accent hues for goal and focus options. */
  hue: {
    teal: '#08A4B3',
    amber: '#D98309',
    violet: '#6A5AE8',
    berry: '#E0426A',
    ink: '#0C2A33',
    mint: '#1E9E70',
  },
  hueTint: {
    teal: '#E3F6F8',
    amber: '#FEF1DC',
    violet: '#EFEDFE',
    berry: '#FDEBEF',
    ink: '#E6EEF0',
    mint: '#E3F7EE',
  },

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

  ...constants,
};

export const darkPalette: typeof lightPalette = {
  teal: '#19B9C8',
  teal600: '#15A6B4',
  /** Reads as text on tinted surfaces, so it inverts. */
  teal700: '#7FE0EA',
  teal50: '#10333B',
  teal100: '#16434D',
  teal200: '#1E5A66',

  ink: '#E9F4F6',
  ink2: '#A6C3C9',
  ink3: '#7795A0',
  line: '#1B3B44',
  bg: '#061A20',
  surface: '#0D2830',
  subtle: '#112F38',

  sun: '#FFC23D',
  sun50: '#3A2E10',
  flame: '#FF8A5B',
  flame50: '#3A2318',
  flameInk: '#FFB08A',
  mint: '#2CC68E',
  mint50: '#0F3329',
  mintInk: '#6FE0B6',
  berry: '#F4657F',
  berry50: '#3A1A24',
  berryInk: '#FF9DB0',
  violet: '#8E82FF',
  violet50: '#231F45',
  amber: '#F8AE3C',
  amber50: '#3A2A12',
  amberInk: '#FFCE85',

  selectedCard: '#0F3A42',
  disabled: '#1A343C',
  disabledText: '#5E7C85',
  chrome: 'rgba(6,26,32,0.72)',
  chromeStrong: 'rgba(13,40,48,0.86)',
  scrim: 'rgba(2,12,15,0.62)',
  grab: '#274C56',
  track: '#12313A',
  trackLine: '#1E4753',
  placeholder: '#5E7C85',
  tickBorder: '#2A4E58',

  hue: {
    teal: '#2ECAD8',
    amber: '#F5A93A',
    violet: '#9A8CFF',
    berry: '#FF7A95',
    ink: '#BFD8DE',
    mint: '#3FD39B',
  },
  hueTint: {
    teal: '#10333B',
    amber: '#3A2A12',
    violet: '#241F47',
    berry: '#3A1B24',
    ink: '#16323A',
    mint: '#10352A',
  },

  skill: {
    grammar: '#9A8CFF',
    vocabulary: '#F8AE3C',
    pronunciation: '#F4657F',
    speaking: '#19B9C8',
  },
  skillTint: {
    grammar: '#241F47',
    vocabulary: '#3A2A12',
    pronunciation: '#3A1B24',
    speaking: '#10333B',
  },

  ...constants,
};

export type Palette = typeof lightPalette;
export type HueName = keyof Palette['hue'];
