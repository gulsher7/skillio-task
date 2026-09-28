import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/styles/colors';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { radius, shadows } from '@/styles/tokens';

import Icon, { type IconName } from './Icon';
import TextComp from './TextComp';

type ToastPayload = { id: number; message: string; icon: IconName };

let listener: ((t: ToastPayload) => void) | null = null;
let nextId = 0;

/** Call from anywhere — screens, sheets, stores. */
export function showToast(message: string, icon: IconName = 'check') {
  nextId += 1;
  listener?.({ id: nextId, message, icon });
}

const VISIBLE_MS = 2600;

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listener = (next) => {
      if (timer.current) clearTimeout(timer.current);
      setToast(next);
      timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
    };
    return () => {
      listener = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <View pointerEvents="none" style={[styles.host, { top: insets.top + ms(8) }]}>
      <Animated.View
        key={toast.id}
        entering={SlideInUp.springify().damping(16).stiffness(180)}
        exiting={FadeOut.duration(180)}
        accessibilityRole="alert"
        style={styles.toast}
      >
        <View style={styles.iconWrap}>
          <Icon name={toast.icon} size={16} color={colors.surface} />
        </View>
        <TextComp style={styles.text} numberOfLines={2}>
          {toast.message}
        </TextComp>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    maxWidth: '92%',
    backgroundColor: colors.ink,
    paddingVertical: ms(11),
    paddingLeft: ms(12),
    paddingRight: ms(16),
    borderRadius: radius.input,
    ...shadows.toast,
  },
  iconWrap: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(9),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  text: {
    flexShrink: 1,
    fontFamily: fontFamily.bold,
    fontSize: ms(14),
    lineHeight: ms(19),
    color: colors.surface,
  },
});
