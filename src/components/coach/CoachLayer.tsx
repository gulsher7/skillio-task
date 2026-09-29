import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { duration, easeOut, timing } from '@/config/motion';
import { sessionLines, words as splitWords } from '@/data/coachLines';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import type { CoachPhase, CoachResult, LineAttempt } from '@/models/coach';
import type { Cefr } from '@/models/home';
import { ms } from '@/styles/scaling';
import { layout } from '@/styles/tokens';
import { firstSlip, scoreLine, summarise } from '@/utils/coachScore';
import { haptics } from '@/utils/haptics';

import CoachDenied from './CoachDenied';
import CoachOrb from './CoachOrb';
import CoachSession, { type Band } from './CoachSession';
import CoachSummary from './CoachSummary';
import VoiceCanvas from './VoiceCanvas';
import { ORB, ORB_GAP, ORB_INSET } from './geometry';

/** How long the "listening back" beat runs before verdicts appear. */
const SCORING_MS = 780;
/** Per-word settle, multiplied by the line length, for the resolve sweep. */
const SWEEP_PER_WORD = 58;
/** Nobody needs to hold the mic longer than this. */
const MAX_TAKE_MS = 12000;

/** A word without the line's punctuation, for speaking it back. */
const bare = (word: string) => word.replace(/[.,!?;:]$/, '');

type Props = {
  level: Cefr;
  /** Current pronunciation score, or null when there is no skill data yet. */
  pronunciation: number | null;
  /** Home's scroll offset, so the orb can duck. */
  scrollY: SharedValue<number>;
  /** Fired once a session finishes, with the points to add. */
  onResult: (result: CoachResult) => void;
  /** Suppresses the orb while a sheet or another screen owns the foreground. */
  hidden?: boolean;
};

/**
 * Owns the coach end to end: the floating orb, the session it becomes and the
 * single canvas shared between them.
 *
 * The orb and the session are never two different things fading past each
 * other — `morph` drives one set of bars from a ring in the corner to a
 * waveform in the middle of the screen, and everything else is chrome arriving
 * around it.
 */
export default function CoachLayer({
  level,
  pronunciation,
  scrollY,
  onResult,
  hidden,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const recorder = useVoiceRecorder();

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<CoachPhase>('ready');
  const [index, setIndex] = useState(0);
  const [takes, setTakes] = useState(1);
  const [attempt, setAttempt] = useState<LineAttempt | null>(null);
  const [history, setHistory] = useState<LineAttempt[]>([]);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [band, setBand] = useState<Band | null>(null);

  const morph = useSharedValue(0);
  const live = useSharedValue(0);
  const reveal = useSharedValue(0);
  const chrome = useSharedValue(0);
  const canvas = useSharedValue(1);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const later = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const lines = useMemo(() => sessionLines(level), [level]);
  const line = lines[Math.min(index, lines.length - 1)];
  const words = useMemo(() => splitWords(line), [line]);

  // The orb sits above the tab bar, tucked against the same edge.
  const orbBottom = Math.max(insets.bottom, ms(14)) + layout.tabBarHeight + ORB_GAP;
  const ring = {
    x: width - ORB_INSET - ORB / 2,
    y: height - orbBottom - ORB / 2,
  };
  const wave = band ?? { x: width / 2, y: height / 2, width: width - ms(44) };

  const speak = useCallback(
    (text: string) => {
      Speech.stop();
      Speech.speak(text, { language: 'en-GB', rate: 0.78, pitch: 1 });
    },
    [],
  );

  // --- session control -----------------------------------------------------

  const openSession = useCallback(async () => {
    if (open) return;
    clearTimers();

    setOpen(true);
    setIndex(0);
    setTakes(1);
    setAttempt(null);
    setHistory([]);
    setResult(null);
    reveal.set(0);
    canvas.set(1);

    morph.set(withTiming(1, { duration: 620, easing: easeOut }));
    chrome.set(withTiming(1, timing(duration.enter)));

    const granted = await recorder.ensurePermission();
    setPhase(granted ? 'ready' : 'denied');
    if (!granted) canvas.set(withTiming(0, timing(duration.base)));
  }, [canvas, chrome, clearTimers, morph, open, recorder, reveal]);

  const closeSession = useCallback(() => {
    clearTimers();
    Speech.stop();
    if (recorder.recording) recorder.stop();

    live.set(withTiming(0, timing(duration.fast)));
    chrome.set(withTiming(0, timing(duration.fast)));
    morph.set(withTiming(0, { duration: 520, easing: easeOut }));
    canvas.set(withTiming(1, timing(duration.base)));

    later(() => {
      setOpen(false);
      setPhase('ready');
      setResult(null);
    }, 360);
  }, [canvas, chrome, clearTimers, later, live, morph, recorder]);

  // --- a take --------------------------------------------------------------

  const holdEnd = useCallback(async () => {
    if (!recorder.recording) return;
    clearTimers();

    const { heard } = await recorder.stop();
    live.set(withTiming(0, timing(duration.base)));

    if (!heard) {
      haptics.warning();
      setPhase('silent');
      return;
    }

    haptics.light();
    setPhase('scoring');

    later(() => {
      const next = scoreLine(line, takes);
      setAttempt(next);
      setPhase('scored');

      const sweep = words.length * SWEEP_PER_WORD;
      reveal.set(0);
      reveal.set(withTiming(words.length + 2, { duration: sweep, easing: easeOut }));

      // The correction speaks itself once the sweep has reached the word it is
      // about, so the learner hears it while looking at it.
      const slip = firstSlip(next);
      if (slip) later(() => speak(bare(slip.text)), sweep + 220);
      else haptics.success();
    }, SCORING_MS);
  }, [clearTimers, later, line, live, recorder, reveal, speak, takes, words.length]);

  // The auto-stop fires long after the take began, so it goes through a ref
  // rather than closing over whichever `holdEnd` existed when it was armed.
  const holdEndRef = useRef(holdEnd);
  useEffect(() => {
    holdEndRef.current = holdEnd;
  }, [holdEnd]);

  const holdStart = useCallback(async () => {
    if (phase === 'scoring') return;
    clearTimers();
    Speech.stop();

    setAttempt(null);
    reveal.set(0);

    const started = await recorder.start();
    if (!started) {
      setPhase('denied');
      canvas.set(withTiming(0, timing(duration.base)));
      return;
    }

    haptics.medium();
    setPhase('listening');
    live.set(withTiming(1, timing(duration.fast)));
    later(() => holdEndRef.current(), MAX_TAKE_MS);
  }, [canvas, clearTimers, later, live, phase, recorder, reveal]);

  const retry = useCallback(() => {
    clearTimers();
    Speech.stop();
    if (attempt) setHistory((h) => [...h, attempt]);
    setTakes((n) => n + 1);
    setAttempt(null);
    reveal.set(0);
    setPhase('ready');
  }, [attempt, clearTimers, reveal]);

  const next = useCallback(() => {
    clearTimers();
    Speech.stop();

    const done = attempt ? [...history, attempt] : history;
    setHistory(done);
    setAttempt(null);
    setTakes(1);
    reveal.set(0);

    if (index + 1 < lines.length) {
      setIndex((i) => i + 1);
      setPhase('ready');
      return;
    }

    const summary = summarise(done, pronunciation);
    setResult(summary);
    setPhase('summary');
    canvas.set(withTiming(0, timing(duration.base)));
    haptics.success();
  }, [attempt, canvas, clearTimers, history, index, lines.length, pronunciation, reveal]);

  const finish = useCallback(() => {
    if (result) onResult(result);
    closeSession();
  }, [closeSession, onResult, result]);

  // The session covers the screen, so Android's back gesture has to dismiss it
  // rather than walking off Home underneath.
  useEffect(() => {
    if (!open) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeSession();
      return true;
    });
    return () => sub.remove();
  }, [closeSession, open]);

  // --- nudge ---------------------------------------------------------------

  // Only ever one line, and only when there is something true to say: a learner
  // with no pronunciation data at all gets the invitation, everyone else gets
  // the sound their level is about to work on.
  const nudge = useMemo(() => {
    if (open || hidden) return null;
    return pronunciation == null
      ? t('coach.nudgeBaseline')
      : t('coach.nudgeFocus', { sound: t(`coach.focus_${lines[0].focusKey}`) });
  }, [hidden, lines, open, pronunciation, t]);

  const slip = attempt ? firstSlip(attempt) : null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {open ? (
        <Animated.View
          style={StyleSheet.absoluteFill}
          entering={FadeIn.duration(duration.fast)}
          exiting={FadeOut.duration(200)}
        >
          {phase === 'denied' ? (
            <CoachDenied onClose={closeSession} />
          ) : phase === 'summary' && result ? (
            <CoachSummary result={result} baseline={pronunciation == null} onDone={finish} />
          ) : (
            <CoachSession
              phase={phase}
              line={line}
              words={words}
              index={index}
              total={lines.length}
              attempt={attempt}
              reveal={reveal}
              chrome={chrome}
              onHoldStart={holdStart}
              onHoldEnd={holdEnd}
              onRetry={retry}
              onNext={next}
              onSpeak={() => slip && speak(bare(slip.text))}
              onClose={closeSession}
              onBand={setBand}
            />
          )}
        </Animated.View>
      ) : null}

      {!hidden ? (
        <CoachOrb
          right={ORB_INSET}
          bottom={orbBottom}
          morph={morph}
          scrollY={scrollY}
          nudge={nudge}
          onPress={openSession}
          label={t('coach.orbLabel')}
        />
      ) : null}

      {!hidden || open ? (
        <VoiceCanvas
          ring={ring}
          wave={wave}
          morph={morph}
          live={live}
          levels={recorder.levels}
          slide={recorder.slide}
          opacity={canvas}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Above the sticky header, which carries `zIndex: 20` and would otherwise
   * paint its avatar and buttons over the session — including the close button.
   * Sheets are native modals and Toast sits at 90, so both still win.
   */
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 30,
  },
});
