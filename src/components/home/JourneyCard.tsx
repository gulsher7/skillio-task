import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import Avatar from '@/components/brand/Avatar';
import AnimatedNumber from '@/components/common/AnimatedNumber';
import Card from '@/components/common/Card';
import Chip from '@/components/common/Chip';
import SectionHeader from '@/components/common/SectionHeader';
import TextComp from '@/components/common/TextComp';
import { duration, timing } from '@/config/motion';
import { DEFAULTS } from '@/data/mock';
import type { Cefr, HomeData } from '@/models/home';
import { makeStyles, useColors } from '@/styles/theme';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { spacing } from '@/styles/tokens';
import {
  JOURNEY_D,
  JOURNEY_LENGTH,
  JOURNEY_VIEWBOX,
  JOURNEY_X,
  JOURNEY_Y,
  journeyPointAt,
} from '@/utils/journeyPath';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LADDER: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MILESTONES = [25, 50, 75];
const TRAVELLER = ms(30);
const MILESTONE = ms(13);
const MILESTONE_HALF = MILESTONE / 2;

type Props = {
  progress: HomeData['progress'];
  avatarUrl: string;
  name: string;
  inView: boolean;
  highlightKey?: number | null;
};

/**
 * Progress as a road rather than a bar. The student sees where they started,
 * where they are and what they are walking towards — a percentage alone doesn't
 * say any of that.
 */
export default function JourneyCard({ progress, avatarUrl, name, inView, highlightKey }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const { t } = useTranslation();
  const [scale, setScale] = useState(0);

  const target = progress.overallProgressPercent;
  const ride = useSharedValue(0);

  useEffect(() => {
    if (!inView) return;
    ride.set(withDelay(120, withTiming(target, timing(duration.journey))));
  }, [inView, target, ride]);

  const onSvgLayout = (event: LayoutChangeEvent) => {
    setScale(event.nativeEvent.layout.width / JOURNEY_VIEWBOX.width);
  };

  const road = useAnimatedProps(() => ({
    strokeDashoffset: JOURNEY_LENGTH * (1 - ride.get() / 100),
  }));

  const traveller = useAnimatedStyle(() => {
    const index = Math.max(0, Math.min(100, Math.round(ride.get())));
    return {
      transform: [
        { translateX: JOURNEY_X[index] * scale - TRAVELLER / 2 },
        { translateY: JOURNEY_Y[index] * scale - TRAVELLER / 2 },
      ],
      opacity: scale > 0 ? 1 : 0,
    };
  });

  const currentIndex = LADDER.indexOf(progress.currentCefrLevel);

  return (
    <Card highlightKey={highlightKey}>
      <SectionHeader
        title={t('journey.title')}
        trailing={<TextComp variant="eyebrow">{t('journey.cefr')}</TextComp>}
      />

      <View
        onLayout={onSvgLayout}
        style={styles.canvas}
        accessibilityRole="progressbar"
        accessibilityLabel={t('journey.a11y', {
          from: progress.currentCefrLevel,
          to: progress.nextCefrLevel,
          percent: target,
        })}
        accessibilityValue={{ min: 0, max: 100, now: target }}
      >
        <Svg
          width="100%"
          height={JOURNEY_VIEWBOX.height * (scale || 1)}
          viewBox={`0 0 ${JOURNEY_VIEWBOX.width} ${JOURNEY_VIEWBOX.height}`}
        >
          <Defs>
            <LinearGradient id="journeyRoad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.teal} />
              <Stop offset="1" stopColor={colors.mint} />
            </LinearGradient>
          </Defs>

          <Path
            d={JOURNEY_D}
            fill="none"
            stroke={colors.track}
            strokeWidth={14}
            strokeLinecap="round"
          />
          <Path
            d={JOURNEY_D}
            fill="none"
            stroke={colors.surface}
            strokeWidth={2}
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
          <AnimatedPath
            d={JOURNEY_D}
            fill="none"
            stroke="url(#journeyRoad)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={JOURNEY_LENGTH}
            animatedProps={road}
          />

          <Circle
            cx={40}
            cy={92}
            r={27}
            fill={colors.teal}
            stroke={colors.surface}
            strokeWidth={4}
          />
          <SvgText
            x={40}
            y={99}
            textAnchor="middle"
            fontFamily={fontFamily.display}
            fontSize={21}
            fill={colors.onAccent}
          >
            {progress.currentCefrLevel}
          </SvgText>

          <Circle
            cx={286}
            cy={44}
            r={29}
            fill={colors.surface}
            stroke={colors.mint}
            strokeWidth={3.5}
            strokeDasharray="5 4"
          />
          <SvgText
            x={286}
            y={51}
            textAnchor="middle"
            fontFamily={fontFamily.display}
            fontSize={21}
            fill={colors.ink}
          >
            {progress.nextCefrLevel}
          </SvgText>
          <Path d="M300 8v20" stroke={colors.ink} strokeWidth={2.5} strokeLinecap="round" />
          <Path d="M300 9h14l-4 5 4 5h-14z" fill={colors.sun} />
        </Svg>

        {MILESTONES.map((milestone) => (
          <Milestone key={milestone} at={milestone} ride={ride} scale={scale} />
        ))}

        <Animated.View style={[styles.traveller, traveller]} pointerEvents="none">
          <Avatar uri={avatarUrl} name={name} size={26} />
          <View style={styles.travellerTag}>
            <AnimatedNumber
              value={target}
              run={inView}
              suffix="%"
              duration={duration.journey}
              style={styles.travellerTagText}
            />
          </View>
        </Animated.View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendLeft}>
          <AnimatedNumber
            value={target}
            run={inView}
            duration={duration.journey}
            suffix="%"
            style={styles.big}
          />
          <TextComp variant="small" style={styles.legendLabel}>
            {t('journey.overall', { level: progress.nextCefrLevel })}
          </TextComp>
        </View>
        <Chip
          label={t('journey.weeksToGo', { count: DEFAULTS.weeksToNextLevel })}
          icon="flag"
          size="sm"
          color={colors.mintInk}
          background={colors.mint50}
        />
      </View>

      <View style={styles.ladder}>
        {LADDER.map((step, index) => (
          <TextComp
            key={step}
            style={[
              styles.rung,
              index < currentIndex ? styles.rungPast : null,
              index === currentIndex ? styles.rungCurrent : null,
              index === currentIndex + 1 ? styles.rungNext : null,
            ]}
          >
            {step}
          </TextComp>
        ))}
      </View>
    </Card>
  );
}

function Milestone({ at, ride, scale }: { at: number; ride: SharedValue<number>; scale: number }) {
  const styles = useStyles();
  const colors = useColors();
  const point = journeyPointAt(at);

  const dot = useAnimatedStyle(() => {
    const passed = ride.get() >= at ? 1 : 0;
    return {
      transform: [
        { translateX: point.x * scale - MILESTONE_HALF },
        { translateY: point.y * scale - MILESTONE_HALF },
      ],
      backgroundColor: interpolateColor(passed, [0, 1], [colors.track, colors.surface]),
      borderColor: interpolateColor(passed, [0, 1], [colors.trackLine, colors.teal]),
      opacity: scale > 0 ? 1 : 0,
    };
  });

  return <Animated.View style={[styles.milestone, dot]} pointerEvents="none" />;
}

const useStyles = makeStyles((c) => ({
  canvas: {
    width: '100%',
  },
  milestone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MILESTONE,
    height: MILESTONE,
    borderRadius: MILESTONE_HALF,
    borderWidth: 3,
  },
  traveller: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TRAVELLER,
    height: TRAVELLER,
    borderRadius: TRAVELLER / 2,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travellerTag: {
    position: 'absolute',
    bottom: TRAVELLER - ms(2),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(9),
    backgroundColor: c.inkSurface,
  },
  travellerTagText: {
    width: ms(34),
    fontFamily: fontFamily.display,
    fontSize: ms(12),
    lineHeight: ms(15),
    color: c.onInkSurface,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  legendLeft: {
    flexShrink: 1,
  },
  big: {
    fontFamily: fontFamily.display,
    fontSize: ms(36),
    lineHeight: ms(46.1),
    letterSpacing: -1,
    color: c.ink,
  },
  legendLabel: {
    marginTop: ms(2),
    color: c.ink2,
  },
  ladder: {
    flexDirection: 'row',
    gap: ms(6),
    marginTop: spacing.lg,
  },
  rung: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamily.display,
    fontSize: ms(12.5),
    lineHeight: ms(16),
    paddingVertical: ms(6),
    borderRadius: ms(9),
    overflow: 'hidden',
    backgroundColor: c.bg,
    color: c.ink3,
  },
  rungPast: {
    backgroundColor: c.teal50,
    color: c.teal700,
  },
  rungCurrent: {
    backgroundColor: c.teal,
    color: c.onInkSurface,
  },
  rungNext: {
    backgroundColor: c.surface,
    color: c.ink,
    borderWidth: 2,
    borderColor: c.teal,
  },
}));
