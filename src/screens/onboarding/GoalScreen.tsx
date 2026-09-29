import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import IconTile from '@/components/common/IconTile';
import OptionCard from '@/components/onboarding/OptionCard';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import { GOALS } from '@/data/onboardingOptions';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setGoal } from '@/redux/reducers/onboardingSlice';
import { useColors } from '@/styles/theme';
import { spacing } from '@/styles/tokens';

export default function GoalScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const dispatch = useAppDispatch();
  const goal = useAppSelector((s) => s.onboarding.goal);

  return (
    <OnboardingShell
      step={1}
      title={t('goal.title')}
      subtitle={t('goal.subtitle')}
      onContinue={() => router.push('/level')}
      ctaDisabled={!goal}
    >
      <View style={styles.list} accessibilityRole="radiogroup">
        {GOALS.map((option) => (
          <OptionCard
            key={option.id}
            selected={goal === option.id}
            onPress={() => dispatch(setGoal(option.id))}
            title={t(`goal.${option.id}`)}
            subtitle={t(`goal.${option.id}Sub`)}
            leading={
              <IconTile
                name={option.icon}
                color={colors.hue[option.hue]}
                background={colors.hueTint[option.hue]}
              />
            }
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
