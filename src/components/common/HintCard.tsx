import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';
import { radius } from '@/styles/tokens';

import Icon, { type IconName } from './Icon';
import TextComp from './TextComp';

type Props = {
  children: string;
  icon?: IconName;
  background?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** A quiet aside — reassurance, a caveat, a nudge. Never an error. */
export default function HintCard({
  children,
  icon = 'info',
  background = colors.sun50,
  color = '#6E4A00',
  style,
}: Props) {
  return (
    <View style={[styles.card, { backgroundColor: background }, style]}>
      <Icon name={icon} size={18} color={color} />
      <TextComp variant="small" style={[styles.text, { color }]}>
        {children}
      </TextComp>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ms(10),
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    borderRadius: radius.input,
  },
  text: {
    flex: 1,
    lineHeight: ms(19),
  },
});
