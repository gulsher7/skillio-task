import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import TextComp from '@/components/common/TextComp';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';

export function LogoMark({ size = 34 }: { size?: number }) {
  const colors = useColors();
  const box = ms(size);
  return (
    <Svg width={box} height={box} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="logoFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1FC6D4" />
          <Stop offset="1" stopColor="#068C99" />
        </LinearGradient>
      </Defs>
      <Path
        d="M9 4h22a7 7 0 0 1 7 7v14a7 7 0 0 1-7 7H17l-7 6v-6H9a7 7 0 0 1-7-7V11a7 7 0 0 1 7-7z"
        fill="url(#logoFill)"
      />
      <Path
        d="M25 12.5c-1-1.4-2.8-2.1-4.8-2.1-3 0-5 1.6-5 3.9 0 5 9.6 2.9 9.6 7.3 0 2.2-2.1 3.8-5.1 3.8-2.2 0-4.1-.9-5.2-2.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <Circle cx="33" cy="6" r="4.2" fill={colors.sun} stroke="#FFFFFF" strokeWidth={1.8} />
    </Svg>
  );
}

export default function Logo({ size = 34 }: { size?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Skillio">
      <LogoMark size={size} />
      <TextComp style={styles.word}>skillio</TextComp>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  word: {
    fontFamily: fontFamily.display,
    fontSize: ms(24),
    lineHeight: ms(30.7),
    letterSpacing: -0.9,
    color: c.ink,
  },
}));
