import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius } from '@/styles/tokens';

import Icon, { type IconName } from './Icon';
import TextComp from './TextComp';

type Props = {
  label: string;
  icon?: IconName;
  color?: string;
  background?: string;
  size?: 'sm' | 'md';
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** A pulsing dot instead of an icon — the "Live now" treatment. */
  leading?: React.ReactNode;
};

export default function Chip({
  label,
  icon,
  color = colors.teal700,
  background = colors.teal50,
  size = 'md',
  uppercase,
  style,
  textStyle,
  leading,
}: Props) {
  const small = size === 'sm';
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: background, paddingVertical: small ? ms(4) : ms(5.5) },
        style,
      ]}
    >
      {leading}
      {icon ? <Icon name={icon} size={small ? 12.5 : 14} color={color} strokeWidth={2.6} /> : null}
      <TextComp
        style={[
          styles.text,
          { color, fontSize: small ? ms(11.5) : ms(12.5) },
          uppercase ? styles.upper : null,
          textStyle,
        ]}
      >
        {label}
      </TextComp>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    paddingHorizontal: ms(9),
    borderRadius: radius.chip,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fontFamily.black,
    fontVariant: ['tabular-nums'],
  },
  upper: {
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
});
