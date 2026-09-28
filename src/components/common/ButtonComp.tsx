import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { layout, radius, shadows } from '@/styles/tokens';

import Icon, { type IconName } from './Icon';
import PressableScale from './PressableScale';
import TextComp from './TextComp';

export type ButtonVariant = 'primary' | 'white' | 'tonal' | 'ghost' | 'ink' | 'ok' | 'no';
type Size = 'lg' | 'sm' | 'xs';

type Props = {
  children: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

const FOREGROUND: Record<ButtonVariant, string> = {
  primary: colors.surface,
  white: colors.teal700,
  tonal: colors.teal700,
  ghost: colors.teal700,
  ink: colors.surface,
  ok: colors.surface,
  no: colors.surface,
};

const BACKGROUND: Partial<Record<ButtonVariant, string>> = {
  white: colors.surface,
  tonal: colors.teal50,
  ink: colors.ink,
  ok: colors.mint,
  no: colors.berry,
};

const SHADOW: Record<ButtonVariant, ViewStyle> = {
  primary: shadows.primary,
  white: shadows.white,
  tonal: shadows.none,
  ghost: shadows.none,
  ink: shadows.white,
  ok: shadows.mint,
  no: shadows.berry,
};

const HEIGHT: Record<Size, number> = {
  lg: layout.buttonHeight,
  sm: layout.buttonHeightSm,
  xs: layout.buttonHeightXs,
};

export default function ButtonComp({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  style,
  accessibilityHint,
}: Props) {
  const inert = disabled || loading;
  const fg = inert ? colors.disabledText : FOREGROUND[variant];
  const height = HEIGHT[size];

  const body = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={size === 'lg' ? 19 : 17} color={fg} /> : null}
          <TextComp
            variant="button"
            color={fg}
            style={size === 'lg' ? styles.label : styles.labelSm}
            numberOfLines={1}
          >
            {children}
          </TextComp>
        </>
      )}
    </>
  );

  const shape: ViewStyle = {
    height,
    borderRadius: size === 'lg' ? radius.button : radius.input,
  };

  return (
    <PressableScale
      onPress={onPress}
      disabled={inert}
      haptic={variant === 'primary' || variant === 'white' ? 'medium' : 'light'}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inert, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      style={[styles.wrap, shape, !inert && variant !== 'ghost' ? SHADOW[variant] : null, style]}
    >
      {variant === 'primary' && !inert ? (
        <LinearGradient
          colors={gradients.primaryButton as unknown as [string, string, string]}
          locations={[0, 0.55, 1]}
          style={[styles.fill, shape, styles.row]}
        >
          <View style={styles.sheen} />
          {body}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fill,
            shape,
            styles.row,
            { backgroundColor: inert ? colors.disabled : (BACKGROUND[variant] ?? 'transparent') },
          ]}
        >
          {body}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
  },
  /** The 1px highlight that keeps the gradient from looking flat. */
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  label: {
    fontFamily: fontFamily.black,
    fontSize: ms(15),
  },
  labelSm: {
    fontFamily: fontFamily.black,
    fontSize: ms(13.5),
    letterSpacing: 0.8,
  },
});
