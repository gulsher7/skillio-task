import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon, { type IconName } from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { showToast } from '@/components/common/Toast';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { layout, radius, shadows } from '@/styles/tokens';

const TABS: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Home' },
  { icon: 'compass', label: 'Learn' },
  { icon: 'calendar', label: 'Classes' },
  { icon: 'user', label: 'Profile' },
];

type Props = {
  onHomePress: () => void;
};

export default function TabBar({ onHomePress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, ms(14)) }]}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.wash} />

      {TABS.map((tab, index) => {
        const active = index === 0;
        return (
          <PressableScale
            key={tab.label}
            scaleTo={0.9}
            onPress={() =>
              active ? onHomePress() : showToast(`${tab.label} is outside this prototype`, tab.icon)
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, active ? styles.iconWrapActive : null]}>
              <Icon name={tab.icon} size={21} color={active ? colors.teal700 : colors.ink3} />
            </View>
            <TextComp style={[styles.label, active ? styles.labelActive : null]}>
              {tab.label}
            </TextComp>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.tabBar,
  },
  wash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.82)',
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
    backgroundColor: colors.teal50,
  },
  label: {
    fontFamily: fontFamily.black,
    fontSize: ms(11),
    color: colors.ink3,
  },
  labelActive: {
    color: colors.teal700,
  },
});
