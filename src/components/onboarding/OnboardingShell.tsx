import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ButtonComp from '@/components/common/ButtonComp';
import IconButton from '@/components/common/IconButton';
import ProgressBar from '@/components/common/ProgressBar';
import TextComp from '@/components/common/TextComp';
import { duration, STAGGER } from '@/config/motion';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { spacing } from '@/styles/tokens';

export const ONBOARDING_STEPS = 5;

type Props = {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onContinue: () => void;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  /** Sits above the CTA — currently only the Plan screen uses it. */
  footerExtra?: React.ReactNode;
  /** The Plan screen is past the numbered steps, so it shows a tick instead. */
  complete?: boolean;
  /** Only the Name step has an input to keep clear of the keyboard. */
  avoidKeyboard?: boolean;
};

/** Back button, progress, one question, one sticky CTA. Every step wears this. */
export default function OnboardingShell({
  step,
  title,
  subtitle,
  children,
  onContinue,
  ctaLabel = 'Continue',
  ctaDisabled,
  footerExtra,
  complete,
  avoidKeyboard,
}: Props) {
  const insets = useSafeAreaInsets();
  const Root = avoidKeyboard ? KeyboardAvoidingView : View;

  return (
    <Root style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + ms(6) }]}>
        <IconButton name="chevronLeft" label="Go back" onPress={() => router.back()} />
        <ProgressBar
          progress={complete ? 1 : step / ONBOARDING_STEPS}
          height={ms(10)}
          gradient={['#34C6D3', colors.teal]}
          track="#DFEBED"
          animationDuration={duration.slow}
          style={styles.bar}
          accessibilityLabel={`Step ${step} of ${ONBOARDING_STEPS}`}
        />
        <TextComp style={styles.count}>{complete ? '✓' : `${step}/${ONBOARDING_STEPS}`}</TextComp>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.delay(STAGGER).springify().damping(18)}
          style={styles.intro}
        >
          <TextComp variant="h1">{title}</TextComp>
          {subtitle ? <TextComp variant="body">{subtitle}</TextComp> : null}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(STAGGER * 2)
            .springify()
            .damping(18)}
        >
          {children}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {footerExtra}
        <ButtonComp onPress={onContinue} disabled={ctaDisabled}>
          {ctaLabel}
        </ButtonComp>
      </View>
    </Root>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(14),
    paddingHorizontal: spacing.gutter,
    paddingBottom: ms(4),
  },
  bar: {
    flex: 1,
  },
  count: {
    minWidth: ms(30),
    textAlign: 'right',
    fontFamily: fontFamily.black,
    fontSize: ms(13),
    color: colors.ink3,
    fontVariant: ['tabular-nums'],
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: ms(18),
    paddingBottom: ms(24),
    gap: spacing.xl,
  },
  intro: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.bg,
  },
});
