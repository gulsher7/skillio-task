import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import Buddy from '@/components/brand/Buddy';
import Logo from '@/components/brand/Logo';
import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import LanguagePicker from '@/components/common/LanguagePicker';
import TextComp from '@/components/common/TextComp';
import { showToast } from '@/components/common/Toast';
import FloatChip from '@/components/onboarding/FloatChip';
import { STAGGER } from '@/config/motion';
import { DEFAULTS } from '@/data/mock';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms, screen } from '@/styles/scaling';
import { spacing } from '@/styles/tokens';

const ORBIT = ms(300);
const BUDDY = screen.isSmall ? 140 : 170;

export default function WelcomeScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const skipToHome = () => {
    showToast(t('welcome.signedIn', { name: DEFAULTS.userName }), 'user');
    router.replace('/home');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + ms(10) }]}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.topRow}>
        <Logo />
        <LanguagePicker />
      </Animated.View>

      <View style={styles.hero}>
        <Svg width={ORBIT} height={ORBIT} style={styles.orbits}>
          <Circle
            cx={ORBIT / 2}
            cy={ORBIT / 2}
            r={ORBIT / 2 - 2}
            stroke="rgba(8,164,179,0.22)"
            strokeWidth={2}
            strokeDasharray="7 9"
            fill="none"
          />
          <Circle
            cx={ORBIT / 2}
            cy={ORBIT / 2}
            r={ORBIT * 0.35}
            stroke="rgba(8,164,179,0.12)"
            strokeWidth={2}
            fill="none"
          />
        </Svg>

        <Buddy size={BUDDY} id="welcome" />

        <FloatChip style={styles.chipHello} rotate={-6}>
          <TextComp style={styles.chipText}>{t('welcome.chipHello')}</TextComp>
        </FloatChip>

        <FloatChip style={styles.chipXp} rotate={5} delay={600} background={colors.sun}>
          <Icon name="bolt" size={16} color={colors.sunInk} />
          <TextComp style={[styles.chipText, { color: colors.sunInk }]}>
            {t('welcome.chipXp', { count: DEFAULTS.practice.xpReward })}
          </TextComp>
        </FloatChip>

        <FloatChip style={styles.chipLevel} rotate={4} delay={1200}>
          <TextComp style={styles.cefr}>B1</TextComp>
          <Icon name="chevronRight" size={14} color={colors.ink3} strokeWidth={3} />
          <TextComp style={[styles.cefr, styles.cefrNext]}>B2</TextComp>
        </FloatChip>

        <FloatChip style={styles.chipStreak} rotate={-4} delay={1800}>
          <Icon name="flame" size={17} color={colors.flame} />
          <TextComp style={[styles.chipText, { color: colors.flameInk }]}>
            {t('welcome.chipStreak', { count: DEFAULTS.game.streakDays })}
          </TextComp>
        </FloatChip>
      </View>

      <Animated.View
        entering={FadeInDown.delay(STAGGER * 2)
          .springify()
          .damping(18)}
        style={styles.copy}
      >
        <TextComp variant="h1" center style={styles.headline}>
          {t('welcome.headline')}
          {'\n'}
          <TextComp variant="h1" style={styles.headlineAccent}>
            {t('welcome.headlineAccent')}
          </TextComp>
        </TextComp>
        <TextComp variant="body" center>
          {t('welcome.subtitle')}
        </TextComp>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(STAGGER * 4)
          .springify()
          .damping(18)}
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <ButtonComp onPress={() => router.push('/goal')}>{t('welcome.getStarted')}</ButtonComp>
        <ButtonComp variant="ghost" size="sm" onPress={skipToHome}>
          {t('welcome.haveAccount')}
        </ButtonComp>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
  },
  hero: {
    flex: 1,
    minHeight: ms(280),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbits: {
    position: 'absolute',
  },
  chipHello: { left: ms(20), top: '16%' },
  chipXp: { right: ms(18), top: '24%' },
  chipLevel: { left: ms(28), bottom: '20%' },
  chipStreak: { right: ms(24), bottom: '10%' },
  chipText: {
    fontFamily: fontFamily.black,
    fontSize: ms(14),
    lineHeight: ms(18.2),
    color: c.ink,
  },
  cefr: {
    fontFamily: fontFamily.display,
    fontSize: ms(12),
    lineHeight: ms(15.4),
    paddingHorizontal: ms(7),
    paddingVertical: ms(3),
    borderRadius: ms(8),
    overflow: 'hidden',
    backgroundColor: c.teal50,
    color: c.teal700,
  },
  cefrNext: {
    backgroundColor: c.teal,
    color: c.onAccent,
  },
  copy: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
  },
  headline: {
    fontSize: ms(34),
    lineHeight: ms(38),
  },
  headlineAccent: {
    fontSize: ms(34),
    lineHeight: ms(38),
    color: c.teal,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    gap: spacing.xs,
  },
}));
