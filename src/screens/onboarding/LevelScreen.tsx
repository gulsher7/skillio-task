import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import CefrTag from '@/components/common/CefrTag';
import HintCard from '@/components/common/HintCard';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import OptionCard from '@/components/onboarding/OptionCard';
import SignalBars from '@/components/onboarding/SignalBars';
import { LEVELS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setLevel } from '@/redux/reducers/onboardingSlice';
import { spacing } from '@/styles/tokens';

export default function LevelScreen() {
  const dispatch = useAppDispatch();
  const level = useAppSelector((s) => s.onboarding.level);

  return (
    <OnboardingShell
      step={2}
      title="What's your English level?"
      subtitle="Your best guess is fine."
      onContinue={() => router.push('/daily-goal')}
      ctaDisabled={!level}
    >
      <View style={styles.list} accessibilityRole="radiogroup">
        {LEVELS.map((option, index) => (
          <OptionCard
            key={option.id}
            selected={level === option.id}
            onPress={() => dispatch(setLevel(option.id))}
            title={option.name}
            subtitle={option.description}
            titleAccessory={<CefrTag level={option.cefr} />}
            leading={<SignalBars level={index} />}
          />
        ))}
      </View>

      <HintCard style={styles.hint}>We fine-tune your level after your first practice.</HintCard>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  hint: {
    marginTop: spacing.xl,
  },
});
