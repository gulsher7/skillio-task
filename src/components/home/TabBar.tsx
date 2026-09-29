import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon, { type IconName } from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { showToast } from '@/components/common/Toast';
import { makeStyles, useColors, useTheme } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { layout, radius, shadows } from '@/styles/tokens';

const TABS: { icon: IconName; key: string }[] = [
  { icon: 'home', key: 'tabHome' },
  { icon: 'compass', key: 'tabLearn' },
  { icon: 'calendar', key: 'tabClasses' },
  { icon: 'user', key: 'tabProfile' },
];

/**
 * iOS 26 gets Apple's real liquid glass; everything else keeps the blur we
 * already had. Resolved once at module load — the answer cannot change at
 * runtime.
 */
const LIQUID_GLASS = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

type Props = {
  onHomePress: () => void;
};

export default function TabBar({ onHomePress }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { scheme } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        LIQUID_GLASS ? styles.barGlass : styles.barBlur,
        { bottom: Math.max(insets.bottom, ms(14)) },
      ]}
    >
      {LIQUID_GLASS ? (
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          style={[StyleSheet.absoluteFill, styles.glass]}
        />
      ) : (
        <>
          <BlurView
            intensity={40}
            tint={scheme === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.wash} />
        </>
      )}

      {TABS.map((tab, index) => {
        const active = index === 0;
        const label = t(`home.${tab.key}`);
        return (
          <PressableScale
            key={tab.key}
            scaleTo={0.9}
            onPress={() =>
              active ? onHomePress() : showToast(t('home.tabToast', { tab: label }), tab.icon)
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, active ? styles.iconWrapActive : null]}>
              <Icon name={tab.icon} size={21} color={active ? colors.teal700 : colors.ink3} />
            </View>
            <TextComp style={[styles.label, active ? styles.labelActive : null]}>{label}</TextComp>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: {
    position: 'absolute',
    left: ms(14),
    right: ms(14),
    height: layout.tabBarHeight,
    borderRadius: ms(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: ms(6),
    overflow: 'hidden',
  },
  /** Glass carries its own edge and shadow; a border would fight it. */
  barGlass: {
    backgroundColor: 'transparent',
  },
  barBlur: {
    borderWidth: 1,
    borderColor: c.line,
    ...shadows.tabBar,
  },
  glass: {
    borderRadius: ms(24),
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: c.chromeStrong,
  },
  tab: {
    width: ms(66),
    alignItems: 'center',
    gap: ms(3),
    paddingVertical: ms(6),
    borderRadius: radius.md,
  },
  iconWrap: {
    width: ms(44),
    height: ms(28),
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: c.teal50,
  },
  label: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    lineHeight: ms(14.3),
    color: c.ink3,
  },
  labelActive: {
    color: c.teal700,
  },
}));
