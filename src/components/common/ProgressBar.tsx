import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { duration, timing } from '@/config/motion';
import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';

type Props = {
  /** 0 to 1 */
  progress: number;
  height?: number;
  color?: string;
  gradient?: readonly string[];
  track?: string;
  delay?: number;
  animationDuration?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export default function ProgressBar({
  progress,
  height = ms(12),
  color = colors.teal,
  gradient,
  track = colors.bg,
  delay = 0,
  animationDuration = duration.count,
  style,
  accessibilityLabel,
}: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, progress));
    width.set(withDelay(delay, withTiming(clamped, timing(animationDuration))));
  }, [progress, delay, animationDuration, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }, style]}
    >
      <Animated.View style={[styles.fill, { borderRadius: height / 2 }, fill]}>
        {gradient ? (
          <LinearGradient
            colors={gradient as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />
        )}
        <View style={[styles.sheen, { top: height * 0.24, height: Math.max(2, height * 0.24) }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    left: ms(6),
    right: ms(6),
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
