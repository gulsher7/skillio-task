import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import TextComp from '@/components/common/TextComp';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { initialsOf, svgFromDataUri } from '@/utils/svg';

type Props = {
  uri: string;
  name: string;
  size?: number;
  /** Mint dot for "teacher is online". */
  online?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Avatar({ uri, name, size = 46, online, style }: Props) {
  const box = ms(size);
  const xml = useMemo(() => svgFromDataUri(uri), [uri]);

  return (
    <View style={[{ width: box, height: box }, style]} accessibilityLabel={`${name}'s avatar`}>
      <View style={[styles.clip, { borderRadius: box / 2 }]}>
        {xml ? (
          <SvgXml xml={xml} width={box} height={box} />
        ) : (
          <TextComp style={[styles.initials, { fontSize: box * 0.38 }]}>
            {initialsOf(name)}
          </TextComp>
        )}
      </View>
      {online ? <View style={[styles.dot, { borderRadius: ms(6) }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal100,
  },
  initials: {
    fontFamily: fontFamily.display,
    color: colors.teal700,
  },
  dot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: ms(12),
    height: ms(12),
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
