import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

/** The prototype was drawn at 390 × 844 (iPhone 14/15). */
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const shortSide = Math.min(width, height);
const longSide = Math.max(width, height);

const round = (n: number) => PixelRatio.roundToNearestPixel(n);

export const scale = (size: number) => round((shortSide / BASE_WIDTH) * size);
export const verticalScale = (size: number) => round((longSide / BASE_HEIGHT) * size);

/**
 * Softened scale — the usual choice for type and padding. A factor of 0.5 means
 * an SE only shrinks half as much as a pure ratio would, so nothing gets cramped.
 */
export const moderateScale = (size: number, factor = 0.5) =>
  round(size + (scale(size) - size) * factor);

export const ms = moderateScale;

export const screen = {
  width,
  height,
  /** iPhone SE and the small Androids need a little more forgiveness. */
  isSmall: shortSide < 370,
  isLarge: shortSide >= 414,
};
