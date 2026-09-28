import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import Icon, { type IconName } from '@/components/common/Icon';
import type { Badge } from '@/models/home';
import { ms } from '@/styles/scaling';

const GLYPH: Record<Badge['glyph'], IconName> = {
  flame: 'flame',
  book: 'book',
  mic: 'mic',
};

type Props = {
  badge: Badge;
  size?: number;
};

export default function BadgeArt({ badge, size = 52 }: Props) {
  const box = ms(size);
  const locked = !!badge.locked;

  return (
    <View style={{ width: box, height: box, opacity: locked ? 0.45 : 1 }}>
      <Svg width={box} height={box} viewBox="0 0 52 52">
        <Defs>
          <LinearGradient id={`badge-${badge.id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={locked ? '#B9C7CB' : badge.colors[0]} />
            <Stop offset="1" stopColor={locked ? '#8FA3A9' : badge.colors[1]} />
          </LinearGradient>
        </Defs>
        <Path
          d="M26 2l19 9v15c0 12-8 20-19 24C15 46 7 38 7 26V11z"
          fill={`url(#badge-${badge.id})`}
        />
        <Path
          d="M26 7l15 7v12c0 9.5-6.4 16-15 19.4C17.4 42 11 35.5 11 26V14z"
          fill="#FFFFFF"
          opacity={0.18}
        />
      </Svg>
      <View style={styles.glyph}>
        <Icon
          name={locked ? 'lock' : GLYPH[badge.glyph]}
          size={size * 0.42}
          color="#FFFFFF"
          strokeWidth={2.6}
          solid={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    /** The shield's visual centre sits a touch above its bounding box. */
    paddingBottom: '12%',
  },
});
