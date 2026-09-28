import { StyleSheet, View } from 'react-native';

import HintCard from '@/components/common/HintCard';
import Icon from '@/components/common/Icon';
import ProgressBar from '@/components/common/ProgressBar';
import Ring from '@/components/common/Ring';
import TextComp from '@/components/common/TextComp';
import { SKILL_META, SKILL_ORDER } from '@/data/mock';
import type { PracticeResult } from '@/models/home';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';
import { formatDuration } from '@/utils/date';

type Props = {
  result: PracticeResult;
  xpReward: number;
};

export default function ResultsSheet({ result, xpReward }: Props) {
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
          <TextComp variant="eyebrow">Today&apos;s results</TextComp>
          <TextComp style={styles.score}>
            {result.correct}/{result.total}
          </TextComp>
          <TextComp variant="small" style={styles.meta}>
            {result.accuracy}% accuracy · {formatDuration(result.seconds)}
          </TextComp>
        </View>
      </View>

      <View style={styles.skills}>
        {SKILL_ORDER.map((key) => {
          const score = result.bySkill[key];
          if (!score) return null;
          const meta = SKILL_META[key];
          return (
            <View key={key} style={styles.skillRow}>
              <View style={[styles.skillIcon, { backgroundColor: meta.tint }]}>
                <Icon name={meta.icon} size={16} color={meta.color} strokeWidth={2.4} />
              </View>
              <TextComp style={styles.skillName}>{meta.label}</TextComp>
              <ProgressBar
                progress={score[0] / score[1]}
                color={meta.color}
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
          {`Added to review: ${result.missed.join(', ')}`}
        </HintCard>
      ) : null}

      <HintCard icon="bolt" background={colors.sun50} color="#6E4A00">
        {`+${xpReward} XP earned · streak extended`}
      </HintCard>
    </View>
  );
}

const styles = StyleSheet.create({
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
    letterSpacing: -1,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    color: colors.ink2,
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
    color: colors.ink,
  },
  skillBar: {
    width: ms(100),
  },
  skillScore: {
    width: ms(34),
    textAlign: 'right',
    fontFamily: fontFamily.display,
    fontSize: ms(14),
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
});
