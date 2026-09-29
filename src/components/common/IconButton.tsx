import { View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useColors } from '@/styles/theme';
import { ms } from '@/styles/scaling';
import { radius } from '@/styles/tokens';

import Icon, { type IconName } from './Icon';
import PressableScale from './PressableScale';

type Props = {
  name: IconName;
  onPress?: () => void;
  label: string;
  size?: number;
  color?: string;
  /** A small berry dot, for the unread bell. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function IconButton({ name, onPress, label, size = 20, color, dot, style }: Props) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.button, style]}
    >
      <Icon name={name} size={size} color={color ?? colors.ink} />
      {dot ? <View style={styles.dot} /> : null}
    </PressableScale>
  );
}

const SIZE = ms(42);

const useStyles = makeStyles((c) => ({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.line,
  },
  dot: {
    position: 'absolute',
    top: ms(8),
    right: ms(9),
    width: ms(9),
    height: ms(9),
    borderRadius: ms(4.5),
    backgroundColor: c.berry,
    borderWidth: 2,
    borderColor: c.surface,
  },
}));
