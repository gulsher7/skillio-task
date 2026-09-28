import { StyleSheet, View } from 'react-native';

import IconTile from '@/components/common/IconTile';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { PLAN_OPTIONS, TOPUP_OPTIONS } from '@/data/mock';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

type Props = {
  mode: 'plans' | 'topup';
  onChoose: (lessons: number, label: string) => void;
};

export default function PlansSheet({ mode, onChoose }: Props) {
  const topUp = mode === 'topup';
  const options = topUp ? TOPUP_OPTIONS : PLAN_OPTIONS;

  return (
    <View style={styles.root}>
      <View>
        <TextComp variant="h2">{topUp ? 'Top up lessons' : 'Choose a plan'}</TextComp>
        <TextComp variant="small">
          {topUp
            ? 'Lessons never expire. Use them for any live class.'
            : 'Cancel anytime. Your progress always stays yours.'}
        </TextComp>
      </View>

      {options.map((option, index) => {
        const best = index === options.length - 1;
        return (
          <PressableScale
            key={option.id}
            scaleTo={0.98}
            onPress={() => onChoose(option.lessons, option.name)}
            accessibilityRole="button"
            accessibilityLabel={`${option.name}, ${option.price}`}
            style={[styles.option, best ? styles.optionBest : null]}
          >
            <IconTile
              name={best ? 'crown' : 'gift'}
              color={best ? '#C98A00' : colors.teal}
              background={best ? colors.sun50 : colors.teal50}
              radius={14}
            />
            <View style={styles.optionText}>
              <TextComp style={styles.optionName}>{option.name}</TextComp>
              <TextComp variant="small">{option.note}</TextComp>
            </View>
            <TextComp style={styles.price}>{option.price}</TextComp>
          </PressableScale>
        );
      })}

      <TextComp variant="tiny" center>
        Prototype: choosing an option updates the Home data.
      </TextComp>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.option,
    borderWidth: 2,
    borderColor: colors.line,
  },
  optionBest: {
    borderColor: colors.teal,
    backgroundColor: colors.selectedCard,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontFamily: fontFamily.black,
    fontSize: ms(14.5),
    color: colors.ink,
  },
  price: {
    fontFamily: fontFamily.display,
    fontSize: ms(16),
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
});
