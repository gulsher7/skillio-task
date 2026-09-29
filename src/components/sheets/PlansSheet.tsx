import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import IconTile from '@/components/common/IconTile';
import PressableScale from '@/components/common/PressableScale';
import TextComp from '@/components/common/TextComp';
import { PLAN_OPTIONS, TOPUP_OPTIONS } from '@/data/mock';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

type Props = {
  mode: 'plans' | 'topup';
  onChoose: (lessons: number, label: string) => void;
};

export default function PlansSheet({ mode, onChoose }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const topUp = mode === 'topup';
  const options = topUp ? TOPUP_OPTIONS : PLAN_OPTIONS;

  return (
    <View style={styles.root}>
      <View>
        <TextComp variant="h2">{t(topUp ? 'sheets.topUp' : 'sheets.choosePlan')}</TextComp>
        <TextComp variant="small">
          {t(topUp ? 'sheets.topUpBody' : 'sheets.choosePlanBody')}
        </TextComp>
      </View>

      {options.map((option, index) => {
        const best = index === options.length - 1;
        const name = t(option.nameKey);
        return (
          <PressableScale
            key={option.id}
            scaleTo={0.98}
            onPress={() => onChoose(option.lessons, name)}
            accessibilityRole="button"
            accessibilityLabel={`${name}, ${option.price}`}
            style={[styles.option, best ? styles.optionBest : null]}
          >
            <IconTile
              name={best ? 'crown' : 'gift'}
              color={best ? colors.amberInk : colors.teal}
              background={best ? colors.sun50 : colors.teal50}
              radius={14}
            />
            <View style={styles.optionText}>
              <TextComp style={styles.optionName}>{name}</TextComp>
              <TextComp variant="small">
                {t(best ? 'sheets.bestValue' : 'sheets.goodToStart')}
              </TextComp>
            </View>
            <TextComp style={styles.price}>{option.price}</TextComp>
          </PressableScale>
        );
      })}

      <TextComp variant="tiny" center>
        {t('sheets.prototypeNote')}
      </TextComp>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
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
    borderColor: c.line,
  },
  optionBest: {
    borderColor: c.teal,
    backgroundColor: c.selectedCard,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontFamily: fontFamily.black,
    fontSize: ms(14.5),
    lineHeight: ms(18.9),
    color: c.ink,
  },
  price: {
    fontFamily: fontFamily.display,
    fontSize: ms(16),
    lineHeight: ms(20.5),
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
}));
