import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import { Pressable, StyleSheet, View, type View as RNView } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ButtonComp from '@/components/common/ButtonComp';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import TextComp from '@/components/common/TextComp';
import { duration, enterDown, springPop, springSoft, timing } from '@/config/motion';
import type { CoachLine, CoachPhase, LineAttempt } from '@/models/coach';
import { fontFamily } from '@/styles/fontFamily';
import { ms } from '@/styles/scaling';
import { makeStyles, useColors, useTheme } from '@/styles/theme';
import { radius, shadows } from '@/styles/tokens';
import { firstSlip } from '@/utils/coachScore';

import { WAVE_HEIGHT } from './geometry';
import WordLine from './WordLine';

export type Band = { x: number; y: number; width: number };

/** Dot widths, resolved at module load — scaling never changes at runtime. */
const DOT = ms(6);
const DOT_CURRENT = ms(18);

type Props = {
  phase: CoachPhase;
  line: CoachLine;
  words: string[];
  index: number;
  total: number;
  attempt: LineAttempt | null;
  /** Sweep position of the word-by-word resolve, in words. */
  reveal: SharedValue<number>;
  /** Fades the card without touching the canvas drawn over it. */
  chrome: SharedValue<number>;
  onHoldStart: () => void;
  onHoldEnd: () => void;
  onRetry: () => void;
  onNext: () => void;
  onSpeak: () => void;
  onClose: () => void;
  onBand: (band: Band) => void;
};

/**
 * The expanded coach. Everything here is chrome around a hole: the waveform in
 * the middle of the card is drawn by `VoiceCanvas`, one layer up, so the bars
 * that were the orb a moment ago are the same bars listening now.
 */
export default function CoachSession({
  phase,
  line,
  words,
  index,
  total,
  attempt,
  reveal,
  chrome,
  onHoldStart,
  onHoldEnd,
  onRetry,
  onNext,
  onSpeak,
  onClose,
  onBand,
}: Props) {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scheme } = useTheme();
  const { t } = useTranslation();

  const band = useRef<RNView>(null);
  const slip = attempt ? firstSlip(attempt) : null;
  const slipIndex = slip ? attempt!.words.indexOf(slip) : null;

  const listening = phase === 'listening';
  const scored = phase === 'scored';

  const card = useAnimatedStyle(() => ({ opacity: chrome.get() }));

  const status =
    phase === 'listening'
      ? t('coach.listening')
      : phase === 'scoring'
        ? t('coach.scoring')
        : phase === 'silent'
          ? t('coach.silentTitle')
          : t('coach.holdHint');

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View entering={FadeIn.duration(duration.base)} exiting={FadeOut.duration(220)}>
        <BlurView
          intensity={scheme === 'dark' ? 40 : 28}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.scrim} />
      </Animated.View>

      <Animated.View
        style={[styles.card, { paddingTop: insets.top + ms(8) }, card]}
        pointerEvents="box-none"
      >
        <View style={styles.head}>
          <IconButton name="x" onPress={onClose} label={t('common.close')} color={colors.ink} />
          <View style={styles.dots}>
            {Array.from({ length: total }, (_, i) => (
              <Dot key={i} done={i < index} current={i === index} />
            ))}
          </View>
          <View style={styles.headSpacer} />
        </View>

        <Animated.View entering={enterDown()} style={styles.focus}>
          <Icon name="wave" size={14} color={colors.skill.pronunciation} />
          <TextComp style={styles.focusText}>{t(`coach.focus_${line.focusKey}`)}</TextComp>
        </Animated.View>

        <View style={styles.body}>
          <WordLine
            text={words}
            scored={attempt?.words ?? null}
            reveal={reveal}
            focusIndex={slipIndex}
            onWordPress={scored ? onSpeak : undefined}
          />

          {/* The canvas draws into this gap; nothing is rendered inside it. */}
          <View
            ref={band}
            style={styles.band}
            onLayout={() =>
              band.current?.measureInWindow((x, y, width, height) =>
                onBand({ x: x + width / 2, y: y + height / 2, width }),
              )
            }
          />

          {scored && slip ? (
            <Animated.View
              key={slip.text}
              entering={FadeIn.duration(duration.base).delay(160)}
              exiting={FadeOut.duration(140)}
              style={styles.hint}
            >
              <Pressable onPress={onSpeak} style={styles.hintRow} accessibilityRole="button">
                <View style={styles.hintPlay}>
                  <Icon name="play" size={13} color={colors.onAccent} />
                </View>
                <View style={styles.hintText}>
                  <TextComp style={styles.hintWord}>{strip(slip.text)}</TextComp>
                  <TextComp style={styles.hintIpa}>
                    {slip.ipa}
                    <TextComp style={styles.hintHeard}>
                      {'   '}
                      {t('coach.youSaid')} {slip.heard}
                    </TextComp>
                  </TextComp>
                </View>
              </Pressable>
            </Animated.View>
          ) : null}

          {phase === 'silent' ? (
            <Animated.View entering={FadeIn.duration(duration.base)} style={styles.silent}>
              <TextComp style={styles.silentBody} center>
                {t('coach.silentBody')}
              </TextComp>
            </Animated.View>
          ) : null}
        </View>

        <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, ms(16)) }]}>
          {scored ? (
            <Animated.View entering={enterDown(80)} style={styles.actions}>
              <ButtonComp variant="tonal" size="sm" icon="refresh" onPress={onRetry} style={styles.flex}>
                {t('coach.retry')}
              </ButtonComp>
              <ButtonComp size="sm" icon="arrowRight" onPress={onNext} style={styles.flex}>
                {index + 1 === total ? t('coach.finish') : t('coach.next')}
              </ButtonComp>
            </Animated.View>
          ) : (
            <>
              <TextComp style={styles.status} center>
                {status}
              </TextComp>
              <HoldMic
                listening={listening}
                busy={phase === 'scoring'}
                onStart={onHoldStart}
                onEnd={onHoldEnd}
                label={t('coach.holdLabel')}
              />
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

/** Punctuation is part of the line but not part of the word being coached. */
const strip = (word: string) => word.replace(/[.,!?;:]$/, '');

function Dot({ done, current }: { done: boolean; current: boolean }) {
  const styles = useStyles();
  const style = useAnimatedStyle(() => ({
    width: withSpring(current ? DOT_CURRENT : DOT, springSoft),
    opacity: withTiming(done || current ? 1 : 0.32, timing(duration.fast)),
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

function HoldMic({
  listening,
  busy,
  onStart,
  onEnd,
  label,
}: {
  listening: boolean;
  busy: boolean;
  onStart: () => void;
  onEnd: () => void;
  label: string;
}) {
  const styles = useStyles();
  const colors = useColors();

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(listening ? 1.12 : 1, springPop) }],
  }));

  const halo = useAnimatedStyle(() => ({
    opacity: withTiming(listening ? 0.28 : 0, timing(duration.base)),
    transform: [{ scale: withSpring(listening ? 1.55 : 1, springSoft) }],
  }));

  return (
    <View style={styles.micWrap}>
      <Animated.View style={[styles.halo, halo]} pointerEvents="none" />
      <Animated.View style={style}>
        <Pressable
          onPressIn={onStart}
          onPressOut={onEnd}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.mic, listening ? styles.micLive : null, busy ? styles.micBusy : null]}
        >
          <Icon name="mic" size={26} color={colors.onAccent} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: c.scrim,
  },
  card: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: ms(22),
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headSpacer: {
    width: ms(44),
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
  },
  dot: {
    height: ms(6),
    borderRadius: radius.pill,
    backgroundColor: c.onAccent,
  },
  focus: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: ms(6),
    marginTop: ms(18),
    paddingHorizontal: ms(12),
    paddingVertical: ms(7),
    borderRadius: radius.pill,
    backgroundColor: c.skillTint.pronunciation,
  },
  focusText: {
    fontFamily: fontFamily.black,
    fontSize: ms(11.5),
    letterSpacing: 0.2,
    color: c.skill.pronunciation,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  band: {
    height: WAVE_HEIGHT,
    marginTop: ms(14),
  },
  hint: {
    alignSelf: 'center',
    backgroundColor: c.surface,
    borderRadius: radius.card,
    paddingHorizontal: ms(14),
    paddingVertical: ms(12),
    ...shadows.white,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },
  hintPlay: {
    width: ms(32),
    height: ms(32),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.skill.pronunciation,
  },
  hintText: {
    gap: ms(2),
  },
  hintWord: {
    fontFamily: fontFamily.displayBold,
    fontSize: ms(17),
    color: c.ink,
  },
  hintIpa: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(13),
    color: c.skill.pronunciation,
  },
  hintHeard: {
    fontFamily: fontFamily.medium,
    fontSize: ms(12.5),
    color: c.ink3,
  },
  silent: {
    alignSelf: 'center',
    maxWidth: ms(260),
  },
  silentBody: {
    fontFamily: fontFamily.medium,
    fontSize: ms(14),
    lineHeight: ms(20),
    color: c.ink2,
  },
  foot: {
    alignItems: 'center',
    gap: ms(14),
  },
  status: {
    fontFamily: fontFamily.semibold,
    fontSize: ms(13.5),
    color: c.ink2,
  },
  actions: {
    flexDirection: 'row',
    gap: ms(10),
    alignSelf: 'stretch',
  },
  flex: {
    flex: 1,
  },
  micWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: ms(72),
    height: ms(72),
    borderRadius: radius.pill,
    backgroundColor: c.skill.pronunciation,
  },
  mic: {
    width: ms(72),
    height: ms(72),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.teal,
    ...shadows.primary,
  },
  micLive: {
    backgroundColor: c.skill.pronunciation,
  },
  micBusy: {
    opacity: 0.6,
  },
}));
