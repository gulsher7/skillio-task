import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import Buddy from '@/components/brand/Buddy';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setName } from '@/redux/reducers/onboardingSlice';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

const MAX_LENGTH = 20;

export default function NameScreen() {
  const dispatch = useAppDispatch();
  const name = useAppSelector((s) => s.onboarding.name);
  const trimmed = name.trim();
  const input = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 450);
    return () => clearTimeout(t);
  }, []);

  const submit = () => {
    if (trimmed) router.push('/plan');
  };

  return (
    <OnboardingShell
      step={5}
      title="What should we call you?"
      subtitle="We'll use it to personalize your plan."
      onContinue={submit}
      ctaDisabled={!trimmed}
      avoidKeyboard
    >
      <View style={styles.field}>
        <TextComp variant="eyebrow">First name</TextComp>
        <View>
          <TextInput
            ref={input}
            value={name}
            onChangeText={(next) => dispatch(setName(next.replace(/^\s+/, '')))}
            onSubmitEditing={submit}
            maxLength={MAX_LENGTH}
            placeholder="Your first name"
            placeholderTextColor="#B4C7CB"
            autoComplete="given-name"
            autoCorrect={false}
            returnKeyType="done"
            selectionColor={colors.teal}
            accessibilityLabel="First name"
            style={styles.input}
          />
          <TextComp style={styles.counter}>
            {name.length}/{MAX_LENGTH}
          </TextComp>
        </View>
      </View>

      <View style={styles.greeting}>
        <Buddy size={86} mood={trimmed ? 'cheer' : 'happy'} float={false} id="name" />
        {trimmed ? (
          <Animated.View
            entering={ZoomIn.springify().damping(13).stiffness(180)}
            style={styles.bubble}
          >
            <Animated.View entering={FadeIn.delay(60)}>
              <TextComp style={styles.bubbleText}>Nice to meet you, {trimmed}! 🎉</TextComp>
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  input: {
    height: ms(68),
    borderRadius: ms(22),
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingRight: ms(64),
    fontFamily: fontFamily.displayBold,
    fontSize: ms(26),
    color: colors.ink,
  },
  counter: {
    position: 'absolute',
    right: ms(18),
    top: '50%',
    transform: [{ translateY: -ms(8) }],
    fontFamily: fontFamily.bold,
    fontSize: ms(12),
    color: colors.ink3,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
    minHeight: ms(96),
  },
  bubble: {
    flexShrink: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.option,
    borderBottomLeftRadius: ms(6),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginBottom: ms(10),
  },
  bubbleText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    color: colors.ink,
  },
});
