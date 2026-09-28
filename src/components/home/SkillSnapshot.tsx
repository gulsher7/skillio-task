import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import AnimatedNumber from '@/components/common/AnimatedNumber';
import ButtonComp from '@/components/common/ButtonComp';
import Card from '@/components/common/Card';
import Icon from '@/components/common/Icon';
import PressableScale from '@/components/common/PressableScale';
import Ring from '@/components/common/Ring';
import SectionHeader from '@/components/common/SectionHeader';
import TextComp from '@/components/common/TextComp';
import { duration, timing } from '@/config/motion';
import { SKILL_META, SKILL_ORDER } from '@/data/mock';
import type { HomeData, SkillKey } from '@/models/home';
import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

const ANALYSE_MS = 1500;
const TILE_HEIGHT = ms(84);

type Props = {
  skills: HomeData['skillSnapshot'];
  inView: boolean;
  onUnlock: () => void;
  highlightKey?: number | null;
};

export default function SkillSnapshot({ skills, inView, onUnlock, highlightKey }: Props) {
  const [flipped, setFlipped] = useState<SkillKey | null>(null);
  const empty = skills.grammar == null;

  const weakest = empty
    ? null
    : SKILL_ORDER.reduce((low, key) => ((skills[key] ?? 0) < (skills[low] ?? 0) ? key : low));

  return (
    <Card highlightKey={highlightKey}>
      <SectionHeader
        title="Skill snapshot"
        trailing={empty ? null : <TextComp variant="eyebrow">Tap a skill</TextComp>}
      />

      <Animated.View layout={LinearTransition.springify().damping(20)}>
        {empty ? (
          <EmptyState key="empty" onUnlock={onUnlock} />
        ) : (
          <Animated.View
            key="filled"
            entering={FadeIn.duration(320)}
            exiting={FadeOut.duration(140)}
          >
            <View style={styles.growth}>
              <GrowthTile
                value={skills.overallImprovementPercent ?? 0}
                label="Overall improvement"
                icon="trend"
                color={colors.mintInk}
                background={colors.mint50}
                run={inView}
              />
              <GrowthTile
                value={skills.growthPercent ?? 0}
                label="Growth since last check-in"
                icon="sparkle"
                color={colors.teal700}
                background={colors.teal50}
                run={inView}
              />
            </View>

            <View style={styles.grid}>
              {SKILL_ORDER.map((key, index) => (
                <SkillTile
                  key={key}
                  skill={key}
                  percent={skills[key] ?? 0}
                  focus={weakest === key}
                  flipped={flipped === key}
                  onPress={() => setFlipped(flipped === key ? null : key)}
                  run={inView}
                  delay={index * 80}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </Card>
  );
}

function GrowthTile({
  value,
  label,
  icon,
  color,
  background,
  run,
}: {
  value: number;
  label: string;
  icon: 'trend' | 'sparkle';
  color: string;
  background: string;
  run: boolean;
}) {
  return (
    <View style={[styles.growthTile, { backgroundColor: background }]}>
      <View style={styles.growthValue}>
        <Icon name={icon} size={19} color={color} strokeWidth={2.6} />
        <AnimatedNumber
          value={value}
          run={run}
          prefix="+"
          suffix="%"
          style={[styles.growthNumber, { color }]}
        />
      </View>
      <TextComp style={[styles.growthLabel, { color }]}>{label}</TextComp>
    </View>
  );
}

function SkillTile({
  skill,
  percent,
  focus,
  flipped,
  onPress,
  run,
  delay,
}: {
  skill: SkillKey;
  percent: number;
  focus: boolean;
  flipped: boolean;
  onPress: () => void;
  run: boolean;
  delay: number;
}) {
  const meta = SKILL_META[skill];
  const turn = useSharedValue(0);

  useEffect(() => {
    turn.set(withTiming(flipped ? 1 : 0, timing(duration.base)));
  }, [flipped, turn]);

  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${turn.get() * 180}deg` }],
    opacity: turn.get() < 0.5 ? 1 : 0,
  }));

  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${turn.get() * 180 + 180}deg` }],
    opacity: turn.get() > 0.5 ? 1 : 0,
  }));

  const surface = useAnimatedStyle(() => ({
    backgroundColor: turn.get() > 0.5 ? meta.color : meta.tint,
  }));

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label} ${percent} percent. ${flipped ? meta.tip : 'Tap for detail.'}`}
      style={styles.tileWrap}
    >
      <Animated.View style={[styles.tile, surface]}>
        <Animated.View style={[styles.face, front]}>
          <View style={styles.tileTop}>
            <Ring percent={percent} color={meta.color} run={run} delay={delay}>
              <Icon name={meta.icon} size={16} color={meta.color} strokeWidth={2.4} />
            </Ring>
            <AnimatedNumber
              value={percent}
              run={run}
              delay={delay}
              suffix="%"
              style={styles.percent}
            />
          </View>
          <TextComp style={styles.tileName} numberOfLines={1}>
            {meta.label}
          </TextComp>
        </Animated.View>

        <Animated.View style={[styles.face, styles.faceBack, back]}>
          <TextComp style={styles.backTitle}>
            {meta.label} · {percent}%
          </TextComp>
          <TextComp style={styles.backTip}>{meta.tip}</TextComp>
        </Animated.View>

        {focus && !flipped ? (
          <View style={styles.focusTag}>
            <TextComp style={styles.focusText}>Focus</TextComp>
          </View>
        ) : null}
      </Animated.View>
    </PressableScale>
  );
}

function EmptyState({ onUnlock }: { onUnlock: () => void }) {
  const reduced = useReducedMotion();
  const [analysing, setAnalysing] = useState(false);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!analysing || reduced) return;
    spin.set(withRepeat(withTiming(360, { duration: 1600, easing: Easing.linear }), -1, false));
  }, [analysing, reduced, spin]);

  useEffect(() => {
    if (!analysing) return;
    const id = setTimeout(onUnlock, ANALYSE_MS);
    return () => clearTimeout(id);
  }, [analysing, onUnlock]);

  const rotation = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      exiting={FadeOut.duration(140)}
      style={styles.empty}
    >
      <View style={styles.ghosts}>
        {SKILL_ORDER.map((key) => (
          <View key={key} style={styles.ghost}>
            <Animated.View style={[styles.ghostRing, rotation]}>
              <Svg width={ms(54)} height={ms(54)} viewBox="0 0 54 54">
                <Circle
                  cx="27"
                  cy="27"
                  r="24"
                  fill="none"
                  stroke={analysing ? colors.teal : '#CFDFE2'}
                  strokeWidth={3}
                  strokeDasharray="6 7"
                  strokeLinecap="round"
                />
              </Svg>
              {analysing ? null : <TextComp style={styles.ghostMark}>?</TextComp>}
            </Animated.View>
            <TextComp style={styles.ghostLabel} numberOfLines={1}>
              {key === 'pronunciation' ? 'Pronunc.' : SKILL_META[key].label}
            </TextComp>
          </View>
        ))}
      </View>

      <View>
        <TextComp variant="title">No skill data yet</TextComp>
        <TextComp variant="small" style={styles.emptyCopy}>
          Take a quick 5-minute check-in and we&apos;ll map your grammar, vocabulary, pronunciation
          and speaking.
        </TextComp>
      </View>

      <ButtonComp
        variant="tonal"
        icon={analysing ? undefined : 'sparkle'}
        loading={analysing}
        onPress={() => setAnalysing(true)}
      >
        {analysing ? 'Analyzing your answers…' : 'Take the check-in'}
      </ButtonComp>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  growth: {
    flexDirection: 'row',
    gap: ms(10),
    marginBottom: spacing.md,
  },
  growthTile: {
    flex: 1,
    gap: ms(2),
    paddingVertical: ms(12),
    paddingHorizontal: ms(14),
    borderRadius: radius.button,
  },
  growthValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  growthNumber: {
    fontFamily: fontFamily.display,
    fontSize: ms(24),
    letterSpacing: -0.6,
  },
  growthLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(12.5),
    lineHeight: ms(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(10),
  },
  tileWrap: {
    width: '47.4%',
    flexGrow: 1,
  },
  tile: {
    height: TILE_HEIGHT,
    borderRadius: radius.option,
    overflow: 'hidden',
  },
  face: {
    ...StyleSheet.absoluteFill,
    padding: ms(12),
    justifyContent: 'center',
    gap: ms(6),
    backfaceVisibility: 'hidden',
  },
  faceBack: {
    gap: ms(3),
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  percent: {
    fontFamily: fontFamily.display,
    fontSize: ms(22),
    letterSpacing: -0.5,
    color: colors.ink,
  },
  tileName: {
    fontFamily: fontFamily.bold,
    fontSize: ms(14),
    color: colors.ink,
  },
  backTitle: {
    fontFamily: fontFamily.black,
    fontSize: ms(13),
    color: colors.surface,
  },
  backTip: {
    fontFamily: fontFamily.medium,
    fontSize: ms(12.5),
    lineHeight: ms(17),
    color: 'rgba(255,255,255,0.92)',
  },
  focusTag: {
    position: 'absolute',
    top: ms(8),
    right: ms(8),
    paddingHorizontal: ms(6),
    paddingVertical: ms(3),
    borderRadius: ms(6),
    backgroundColor: colors.flame50,
  },
  focusText: {
    fontFamily: fontFamily.black,
    fontSize: ms(9.5),
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.flameInk,
  },
  empty: {
    gap: spacing.base,
  },
  ghosts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: ms(8),
  },
  ghost: {
    flex: 1,
    alignItems: 'center',
    gap: ms(6),
  },
  ghostRing: {
    width: ms(54),
    height: ms(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostMark: {
    position: 'absolute',
    fontFamily: fontFamily.display,
    fontSize: ms(18),
    color: '#B7C9CD',
  },
  ghostLabel: {
    fontFamily: fontFamily.bold,
    fontSize: ms(11.5),
    color: colors.ink3,
  },
  emptyCopy: {
    marginTop: ms(2),
    lineHeight: ms(19),
  },
});
