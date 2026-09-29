import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

/** Bars across the waveform. One more is held back as the incoming sample. */
export const BARS = 46;

/** How often we ask the recorder for a level. ~17 reads a second. */
const POLL_MS = 58;

/**
 * Metering is dB full-scale: 0 is clipping, silence runs off toward -160. Real
 * speech into a phone mic lives in a much narrower band than that, so the floor
 * is set where a quiet room sits rather than at the theoretical bottom —
 * otherwise every normal voice maps to the top two pixels of the waveform.
 */
const DB_FLOOR = -48;
const DB_CEIL = -6;

/** Below this, for the whole take, nothing was said. */
const SILENCE = 0.06;

const normalise = (db: number) => {
  'worklet';
  if (!Number.isFinite(db)) return 0;
  const t = (db - DB_FLOOR) / (DB_CEIL - DB_FLOOR);
  // Voices spend most of their time low in the band; the curve lifts the
  // quiet end so ordinary speech uses the whole height.
  return Math.pow(Math.max(0, Math.min(1, t)), 0.62);
};

export type PermissionState = 'unknown' | 'granted' | 'denied';

/**
 * Wraps `expo-audio` for the one thing the coach needs: hold to record, and a
 * live level smooth enough to draw at 60fps.
 *
 * The recorder only meters about seventeen times a second, so the waveform
 * keeps one sample of headroom and reports how far it is between the last two
 * (`slide`). Skia interpolates across that gap, which turns 17Hz of data into
 * continuous motion without inventing amplitude that wasn't there.
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });

  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [recording, setRecording] = useState(false);

  /** Ring of normalised levels, oldest first, plus the incoming sample. */
  const levels = useSharedValue<number[]>(new Array(BARS + 1).fill(0));
  /** 0→1 across the current sample window, for interpolating between bars. */
  const slide = useSharedValue(0);
  /** The newest level, unslid — for anything that pulses rather than scrolls. */
  const level = useSharedValue(0);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const peak = useRef(0);

  const stopPolling = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const ensurePermission = useCallback(async () => {
    const status = await requestRecordingPermissionsAsync();
    const granted = status.granted;
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  const start = useCallback(async () => {
    if (!(await ensurePermission())) return false;

    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();

    peak.current = 0;
    levels.set(new Array(BARS + 1).fill(0));
    slide.set(0);
    level.set(0);
    setRecording(true);

    stopPolling();
    timer.current = setInterval(() => {
      const db = recorder.getStatus().metering;
      const next = db == null ? 0 : normalise(db);
      if (next > peak.current) peak.current = next;

      // Shift the ring and hand the new sample to the far end, then run the
      // slide across one window so the draw has somewhere to interpolate to.
      levels.set([...levels.get().slice(1), next]);
      level.set(withTiming(next, { duration: POLL_MS, easing: Easing.linear }));
      slide.set(0);
      slide.set(withTiming(1, { duration: POLL_MS, easing: Easing.linear }));
    }, POLL_MS);

    return true;
  }, [ensurePermission, level, levels, recorder, slide, stopPolling]);

  /** Stops the take and reports whether it actually contained a voice. */
  const stop = useCallback(async () => {
    stopPolling();
    setRecording(false);

    try {
      await recorder.stop();
    } catch {
      // A take that never got going is not worth surfacing.
    }

    // Hand the route back so the correction can be spoken through the speaker
    // rather than the earpiece.
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});

    level.set(withTiming(0, { duration: 220 }));
    return { heard: peak.current >= SILENCE, peak: peak.current };
  }, [level, recorder, stopPolling]);

  return { permission, recording, levels, slide, level, start, stop, ensurePermission };
}
