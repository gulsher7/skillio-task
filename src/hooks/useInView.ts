import { useCallback, useRef, useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Fires once, when a card has scrolled far enough up to be worth animating.
 * Cheaper than an IntersectionObserver-style measure on every frame: we keep the
 * card's layout offset on the UI thread and compare it to the scroll position.
 */
export function useInView(scrollY: SharedValue<number>, revealOffset = 120) {
  const { height } = useWindowDimensions();
  const [inView, setInView] = useState(false);
  const top = useSharedValue(Number.MAX_SAFE_INTEGER);
  const fired = useRef(false);

  const reveal = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    setInView(true);
  }, []);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const y = event.nativeEvent.layout.y;
      top.set(y);
      if (y < height - revealOffset) reveal();
    },
    [height, revealOffset, reveal, top],
  );

  useAnimatedReaction(
    () => scrollY.get(),
    (scroll) => {
      if (top.get() - scroll < height - revealOffset) runOnJS(reveal)();
    },
  );

  return { onLayout, inView };
}
