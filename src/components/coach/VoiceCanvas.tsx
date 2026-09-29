import { Canvas, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { StyleSheet } from 'react-native';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { BARS } from '@/hooks/useVoiceRecorder';
import { useColors } from '@/styles/theme';

const TAU = Math.PI * 2;

/** Shortest a bar ever gets, so the ring never breaks into dots. */
const BASE = 3;
/** How much of a bar is amplitude, collapsed and expanded. */
const RING_SPAN = 9;
const WAVE_SPAN = 58;

const RING_RADIUS = 17;
const STROKE = 3;

/** Speed and wavelength of the idle travelling wave. */
const BREATH_HZ = 0.55;
const BREATH_WAVES = 2;

type Geometry = {
  /** Centre of the collapsed ring, in screen coordinates. */
  ring: { x: number; y: number };
  /** The expanded waveform's band, in screen coordinates. */
  wave: { x: number; y: number; width: number };
};

type Props = Geometry & {
  /** 0 = ring at the orb, 1 = waveform in the session. */
  morph: SharedValue<number>;
  /** 0 = idle breathing, 1 = driven by the microphone. */
  live: SharedValue<number>;
  /** Rolling mic levels, oldest first, with one sample of headroom. */
  levels: SharedValue<number[]>;
  /** How far we are between the last two samples. */
  slide: SharedValue<number>;
  /** Fades the whole surface — used while the session dismisses. */
  opacity?: SharedValue<number>;
};

/**
 * The one drawing surface the coach owns, in a single full-screen canvas that
 * never resizes — only what it draws moves.
 *
 * Every bar is described the same way in both states: a centre point, a
 * direction and a half-length. Collapsed, the centres sit on a circle and point
 * outward; expanded, they sit on a line and point up. Morphing is then just
 * interpolating those three things, so the ring genuinely unrolls into the
 * waveform rather than one cross-fading into the other.
 *
 * Amplitude is a second, independent axis: `live` blends the idle travelling
 * wave into the microphone's levels, which lets the orb keep breathing while it
 * expands and only start listening once it has arrived.
 */
export default function VoiceCanvas({
  ring,
  wave,
  morph,
  live,
  levels,
  slide,
  opacity,
}: Props) {
  const colors = useColors();
  const clock = useSharedValue(0);

  useFrameCallback((frame) => {
    clock.set(clock.get() + (frame.timeSincePreviousFrame ?? 16) / 1000);
  });

  const path = useDerivedValue(() => {
    const p = Skia.PathBuilder.Make();
    const m = morph.get();
    const l = live.get();
    const samples = levels.get();
    const blend = slide.get();
    const time = clock.get();

    const half = wave.width / 2;

    for (let i = 0; i < BARS; i += 1) {
      const t = i / (BARS - 1);

      // --- amplitude ---
      // Idle: a wave traveling around the ring, so nothing is ever still.
      const breath = 0.38 + 0.3 * Math.sin(time * TAU * BREATH_HZ + t * TAU * BREATH_WAVES);
      // Live: interpolated across the gap between two metering reads.
      const mic = samples[i] + (samples[i + 1] - samples[i]) * blend;
      const amp = breath + (mic - breath) * l;

      // --- geometry ---
      const angle = -Math.PI / 2 + t * TAU;
      const rx = ring.x + Math.cos(angle) * RING_RADIUS;
      const ry = ring.y + Math.sin(angle) * RING_RADIUS;

      const wx = wave.x - half + t * wave.width;
      const wy = wave.y;

      const cx = rx + (wx - rx) * m;
      const cy = ry + (wy - ry) * m;

      // Radial when collapsed, straight up when expanded.
      let dx = Math.cos(angle) * (1 - m);
      let dy = Math.sin(angle) * (1 - m) + m;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;

      const span = RING_SPAN + (WAVE_SPAN - RING_SPAN) * m;
      const reach = (BASE + amp * span) / 2;

      p.moveTo(cx - dx * reach, cy - dy * reach);
      p.lineTo(cx + dx * reach, cy + dy * reach);
    }

    return p.build();
  });

  // The gradient spans the waveform when expanded and the orb when not, so the
  // colour ramp arrives with the geometry instead of sweeping across the screen.
  const gradientStart = useDerivedValue(() =>
    vec(
      ring.x - RING_RADIUS + (wave.x - wave.width / 2 - (ring.x - RING_RADIUS)) * morph.get(),
      ring.y,
    ),
  );
  const gradientEnd = useDerivedValue(() =>
    vec(
      ring.x + RING_RADIUS + (wave.x + wave.width / 2 - (ring.x + RING_RADIUS)) * morph.get(),
      ring.y,
    ),
  );

  const strokeWidth = useDerivedValue(() => STROKE + morph.get() * 0.6);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Path
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        opacity={opacity}
      >
        <LinearGradient
          start={gradientStart}
          end={gradientEnd}
          colors={[colors.teal, colors.skill.pronunciation]}
        />
      </Path>
    </Canvas>
  );
}
