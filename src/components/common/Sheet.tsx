import { useCallback, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { duration, easeIn, springSoft, timing } from '@/config/motion';
import { colors } from '@/styles/colors';
import { ms } from '@/styles/scaling';
import { radius, spacing } from '@/styles/tokens';

const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 800;
const EXIT_MS = 260;

type Props = {
  /** Called once the sheet has finished sliding away — unmount it here. */
  onClose: () => void;
  label: string;
  /** A function child receives `close`, for buttons that dismiss then act. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Sheets with long bodies (plans, results) scroll inside. */
  scrollable?: boolean;
};

/**
 * A bottom sheet built on Reanimated and Gesture Handler rather than a library,
 * so the drag, the spring and the scrim all share the app's motion tokens.
 * The parent owns mounting: render it to open, and it calls onClose when the
 * exit animation is done.
 */
export default function Sheet({ onClose, label, children, scrollable }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const translateY = useSharedValue(height);
  const scrim = useSharedValue(0);

  useEffect(() => {
    scrim.set(withTiming(1, timing(duration.base)));
    translateY.set(withSpring(0, { damping: 22, stiffness: 210, mass: 0.9 }));
  }, [scrim, translateY]);

  const dismiss = useCallback(() => {
    scrim.set(withTiming(0, { duration: duration.fast, easing: easeIn }));
    translateY.set(
      withTiming(height, { duration: EXIT_MS, easing: easeIn }, (finished) => {
        if (finished) runOnJS(onClose)();
      }),
    );
  }, [height, onClose, scrim, translateY]);

  const pan = Gesture.Pan()
    .activeOffsetY(12)
    .onUpdate((event) => {
      translateY.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        runOnJS(dismiss)();
      } else {
        translateY.set(withSpring(0, springSoft));
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.get() }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  const body = (
    <View style={styles.body}>
      <View style={styles.grab} />
      {typeof children === 'function' ? children(dismiss) : children}
    </View>
  );

  return (
    <Modal transparent visible animationType="none" onRequestClose={dismiss} statusBarTranslucent>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            accessibilityLabel={label}
            style={[
              styles.sheet,
              { maxHeight: height * 0.86, paddingBottom: insets.bottom + spacing.xxl },
              sheetStyle,
            ]}
          >
            {scrollable ? (
              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {body}
              </ScrollView>
            ) : (
              body
            )}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    backgroundColor: 'rgba(8,30,36,0.42)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: spacing.xl,
    paddingTop: ms(10),
  },
  body: {
    gap: spacing.base,
  },
  grab: {
    width: ms(40),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: '#D5E2E5',
    alignSelf: 'center',
    marginBottom: ms(6),
  },
});
