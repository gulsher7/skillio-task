import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import HintCard from '@/components/common/HintCard';
import Icon from '@/components/common/Icon';
import ProgressBar from '@/components/common/ProgressBar';
import Ring from '@/components/common/Ring';
import TextComp from '@/components/common/TextComp';
import { SKILL_ICON, SKILL_ORDER } from '@/data/mock';
import type { PracticeResult } from '@/models/home';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { formatDuration } from '@/utils/date';
import { skillKeys } from '@/utils/i18nKeys';

type Props = {
  result: PracticeResult;
  xpReward: number;
};

export default function ResultsSheet({ result, xpReward }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <Ring
          percent={result.accuracy}
          size={96}
          stroke={10}
          color={colors.mint}
          track={colors.mint50}
        />
        <View style={styles.summaryText}>
          <TextComp variant="eyebrow">{t('sheets.resultsEyebrow')}</TextComp>
          <TextComp style={styles.score}>
            {result.correct}/{result.total}
          </TextComp>
          <TextComp variant="small" style={styles.meta}>
            {t('sheets.resultsMeta', {
              accuracy: result.accuracy,
              time: formatDuration(result.seconds),
            })}
          </TextComp>
        </View>
      </View>

      <View style={styles.skills}>
        {SKILL_ORDER.map((key) => {
          const score = result.bySkill[key];
          if (!score) return null;
          const tone = { color: colors.skill[key], tint: colors.skillTint[key] };
          return (
            <View key={key} style={styles.skillRow}>
              <View style={[styles.skillIcon, { backgroundColor: tone.tint }]}>
                <Icon name={SKILL_ICON[key]} size={16} color={tone.color} strokeWidth={2.4} />
              </View>
              <TextComp style={styles.skillName}>{t(skillKeys(key).label)}</TextComp>
              <ProgressBar
                progress={score[0] / score[1]}
                color={tone.color}
                height={ms(10)}
                style={styles.skillBar}
              />
              <TextComp style={styles.skillScore}>
                {score[0]}/{score[1]}
              </TextComp>
            </View>
          );
        })}
      </View>

      {result.missed.length ? (
        <HintCard icon="refresh" background={colors.bg} color={colors.ink2}>
          {t('sheets.addedToReview', { items: result.missed.join(', ') })}
        </HintCard>
      ) : null}

      <HintCard icon="bolt" background={colors.sun50} color="#6E4A00">
        {t('sheets.xpEarnedStreak', { count: xpReward })}
      </HintCard>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  summaryText: {
    flex: 1,
  },
  score: {
    fontFamily: fontFamily.display,
    fontSize: ms(34),
    lineHeight: ms(43.5),
    letterSpacing: -1,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    color: c.ink2,
  },
  skills: {
    gap: spacing.md,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  skillIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillName: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: ms(14),
    lineHeight: ms(18.2),
    color: c.ink,
  },
  skillBar: {
    width: ms(100),
  },
  skillScore: {
    width: ms(34),
    textAlign: 'right',
    fontFamily: fontFamily.display,
    fontSize: ms(14),
    lineHeight: ms(17.9),
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
}));
