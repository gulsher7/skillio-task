import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import IconTile from '@/components/common/IconTile';
import OptionCard from '@/components/onboarding/OptionCard';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { GOALS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setGoal } from '@/redux/reducers/onboardingSlice';
import { spacing } from '@/styles/tokens';

export default function GoalScreen() {
  const dispatch = useAppDispatch();
  const goal = useAppSelector((s) => s.onboarding.goal);

  return (
    <OnboardingShell
      step={1}
      title="What do you want to improve?"
      subtitle="Pick the one that matters most right now."
      onContinue={() => router.push('/level')}
      ctaDisabled={!goal}
    >
      <View style={styles.list} accessibilityRole="radiogroup">
        {GOALS.map((option) => (
          <OptionCard
            key={option.id}
            selected={goal === option.id}
            onPress={() => dispatch(setGoal(option.id))}
            title={option.label}
            subtitle={option.sub}
            leading={<IconTile name={option.icon} color={option.color} background={option.tint} />}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
