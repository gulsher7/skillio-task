import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
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
import { colors } from '@/styles/colors';
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
      <SectionHeader title="Your journey" trailing={<TextComp variant="eyebrow">CEFR</TextComp>} />

      <View
        onLayout={onSvgLayout}
        style={styles.canvas}
        accessibilityRole="progressbar"
        accessibilityLabel={`${progress.currentCefrLevel} to ${progress.nextCefrLevel}, ${target} percent complete`}
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

          <Path d={JOURNEY_D} fill="none" stroke="#EAF2F3" strokeWidth={14} strokeLinecap="round" />
          <Path
            d={JOURNEY_D}
            fill="none"
            stroke="#FFFFFF"
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

          <Circle cx={40} cy={92} r={27} fill={colors.teal} stroke="#FFFFFF" strokeWidth={4} />
          <SvgText
            x={40}
            y={99}
            textAnchor="middle"
            fontFamily={fontFamily.display}
            fontSize={21}
            fill="#FFFFFF"
          >
            {progress.currentCefrLevel}
          </SvgText>

          <Circle
            cx={286}
            cy={44}
            r={29}
            fill="#FFFFFF"
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
            Overall progress to {progress.nextCefrLevel}
          </TextComp>
        </View>
        <Chip
          label={DEFAULTS.weeksToNextLevel}
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
  const point = journeyPointAt(at);

  const dot = useAnimatedStyle(() => {
    const passed = ride.get() >= at ? 1 : 0;
    return {
      transform: [
        { translateX: point.x * scale - ms(6.5) },
        { translateY: point.y * scale - ms(6.5) },
      ],
      backgroundColor: interpolateColor(passed, [0, 1], ['#EAF2F3', '#FFFFFF']),
      borderColor: interpolateColor(passed, [0, 1], ['#D3E2E5', colors.teal]),
      opacity: scale > 0 ? 1 : 0,
    };
  });

  return <Animated.View style={[styles.milestone, dot]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
  },
  milestone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ms(13),
    height: ms(13),
    borderRadius: ms(6.5),
    borderWidth: 3,
  },
  traveller: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TRAVELLER,
    height: TRAVELLER,
    borderRadius: TRAVELLER / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travellerTag: {
    position: 'absolute',
    bottom: TRAVELLER - ms(2),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    borderRadius: ms(9),
    backgroundColor: colors.ink,
  },
  travellerTagText: {
    width: ms(34),
    fontFamily: fontFamily.display,
    fontSize: ms(12),
    lineHeight: ms(15),
    color: colors.surface,
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
    letterSpacing: -1,
    color: colors.ink,
  },
  legendLabel: {
    marginTop: ms(2),
    color: colors.ink2,
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
    paddingVertical: ms(6),
    borderRadius: ms(9),
    overflow: 'hidden',
    backgroundColor: colors.bg,
    color: '#A8BBBF',
  },
  rungPast: {
    backgroundColor: colors.teal50,
    color: colors.teal700,
  },
  rungCurrent: {
    backgroundColor: colors.teal,
    color: colors.surface,
  },
  rungNext: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderWidth: 2,
    borderColor: colors.teal,
  },
});
