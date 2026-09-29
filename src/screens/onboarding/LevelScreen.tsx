import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const level = useAppSelector((s) => s.onboarding.level);

  return (
    <OnboardingShell
      step={2}
      title={t('level.title')}
      subtitle={t('level.subtitle')}
      onContinue={() => router.push('/daily-goal')}
      ctaDisabled={!level}
    >
      <View style={styles.list} accessibilityRole="radiogroup">
        {LEVELS.map((option, index) => (
          <OptionCard
            key={option.id}
            selected={level === option.id}
            onPress={() => dispatch(setLevel(option.id))}
            title={t(`level.${option.id}`)}
            subtitle={t(`level.${option.id}Desc`)}
            titleAccessory={<CefrTag level={option.cefr} />}
            leading={<SignalBars level={index} />}
          />
        ))}
      </View>

      <HintCard style={styles.hint}>{t('level.hint')}</HintCard>
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
