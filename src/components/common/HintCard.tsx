import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ms } from '@/styles/scaling';
import { useColors } from '@/styles/theme';
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
export default function HintCard({ children, icon = 'info', background, color, style }: Props) {
  const colors = useColors();
  const tone = color ?? colors.amberInk;

  return (
    <View style={[styles.card, { backgroundColor: background ?? colors.sun50 }, style]}>
      <Icon name={icon} size={18} color={tone} />
      <TextComp variant="small" style={[styles.text, { color: tone }]}>
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
