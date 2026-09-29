import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { duration, timing } from '@/config/motion';
import { ms } from '@/styles/scaling';
import { useColors } from '@/styles/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0 to 100 */
  percent: number;
  size?: number;
  stroke?: number;
  color: string;
  track?: string;
  delay?: number;
  run?: boolean;
  children?: React.ReactNode;
};

export default function Ring({
  percent,
  size = 46,
  stroke = 6,
  color,
  track,
  delay = 0,
  run = true,
  children,
}: Props) {
  const colors = useColors();
  const box = ms(size);
  const width = ms(stroke);
  const radius = (box - width) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!run) return;
    progress.set(withDelay(delay, withTiming(percent / 100, timing(duration.count + 100))));
  }, [percent, run, delay, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.get()),
  }));

  return (
    <View style={{ width: box, height: box }}>
      <Svg width={box} height={box} style={styles.svg}>
        <Circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          stroke={track ?? colors.surface}
          strokeWidth={width}
          fill="none"
        />
        <AnimatedCircle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
