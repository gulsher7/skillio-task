import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import Buddy from '@/components/brand/Buddy';
import TextComp from '@/components/common/TextComp';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setName } from '@/redux/reducers/onboardingSlice';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

const MAX_LENGTH = 20;

export default function NameScreen() {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const name = useAppSelector((s) => s.onboarding.name);
  const trimmed = name.trim();
  const input = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => input.current?.focus(), 450);
    return () => clearTimeout(timer);
  }, []);

  const submit = () => {
    if (trimmed) router.push('/plan');
  };

  return (
    <OnboardingShell
      step={5}
      title={t('name.title')}
      subtitle={t('name.subtitle')}
      onContinue={submit}
      ctaDisabled={!trimmed}
      avoidKeyboard
    >
      <View style={styles.field}>
        <TextComp variant="eyebrow">{t('name.label')}</TextComp>
        <View>
          <TextInput
            ref={input}
            value={name}
            onChangeText={(next) => dispatch(setName(next.replace(/^\s+/, '')))}
            onSubmitEditing={submit}
            maxLength={MAX_LENGTH}
            placeholder={t('name.placeholder')}
            placeholderTextColor={colors.placeholder}
            autoComplete="given-name"
            autoCorrect={false}
            returnKeyType="done"
            selectionColor={colors.teal}
            accessibilityLabel={t('name.label')}
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
              <TextComp style={styles.bubbleText}>{t('name.greeting', { name: trimmed })}</TextComp>
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>
    </OnboardingShell>
  );
}

const useStyles = makeStyles((c) => ({
  field: {
    gap: spacing.sm,
  },
  input: {
    height: ms(68),
    borderRadius: ms(22),
    borderWidth: 2,
    borderColor: c.line,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.xl,
    paddingRight: ms(64),
    fontFamily: fontFamily.displayBold,
    fontSize: ms(26),
    lineHeight: ms(33.3),
    color: c.ink,
  },
  counter: {
    position: 'absolute',
    right: ms(18),
    top: '50%',
    transform: [{ translateY: -ms(8) }],
    fontFamily: fontFamily.bold,
    fontSize: ms(12),
    color: c.ink3,
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
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.option,
    borderBottomLeftRadius: ms(6),
    paddingVertical: ms(12),
    paddingHorizontal: ms(16),
    marginBottom: ms(10),
  },
  bubbleText: {
    fontFamily: fontFamily.bold,
    fontSize: ms(16),
    lineHeight: ms(20.8),
    color: c.ink,
  },
}));
