import {
  Atlas,
  Canvas,
  Circle,
  Group,
  rect,
  Rect,
  useRSXformBuffer,
  useTexture,
  type SkRect,
} from '@shopify/react-native-skia';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Easing, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const PALETTE = ['#08A4B3', '#FFC23D', '#FF7A45', '#23B37F', '#7566F0', '#EE4F72', '#7FE1EA'];

const SPRITE = 18;
const SHEET = { width: SPRITE * PALETTE.length, height: SPRITE * 2 };

const MAX_PARTICLES = 200;
/** ox, oy, vx, vy, rotation, spin, phase */
const STRIDE = 7;

const LIFE_MS = 2600;
const LIFE_S = LIFE_MS / 1000;
const GRAVITY = 1500;

export type ConfettiBurst = {
  /** 0–1 of the screen */
  x?: number;
  y?: number;
  count?: number;
  spread?: number;
};

export type ConfettiHandle = {
  fire: (burst?: ConfettiBurst) => void;
};

/**
 * Skia keeps this to one canvas and one draw call — 200 pieces of paper without
 * 200 views. Positions are solved analytically from a single clock, so the
 * worklet never has to integrate state between frames.
 */
const Confetti = forwardRef<ConfettiHandle>((_props, ref) => {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const [sprites, setSprites] = useState<SkRect[]>([]);
  const clock = useSharedValue(0);
  const count = useSharedValue(0);
  const seeds = useSharedValue<number[]>(new Array(MAX_PARTICLES * STRIDE).fill(0));

  const texture = useTexture(
    <Group>
      {PALETTE.map((color, i) => (
        <Rect
          key={`r${i}`}
          x={i * SPRITE}
          y={0}
          width={SPRITE}
          height={SPRITE * 0.64}
          color={color}
        />
      ))}
      {PALETTE.map((color, i) => (
        <Circle
          key={`c${i}`}
          cx={i * SPRITE + SPRITE / 2}
          cy={SPRITE * 1.5}
          r={SPRITE * 0.3}
          color={color}
        />
      ))}
    </Group>,
    SHEET,
  );

  const fire = useCallback(
    ({ x = 0.5, y = 0.3, count: amount = 150, spread = 1 }: ConfettiBurst = {}) => {
      if (reduced) return;

      const total = Math.min(MAX_PARTICLES, amount);
      const nextSeeds = new Array(MAX_PARTICLES * STRIDE).fill(0);
      const nextSprites: SkRect[] = [];

      for (let i = 0; i < total; i += 1) {
        const colorIndex = Math.floor(Math.random() * PALETTE.length);
        const round = Math.random() < 0.3;
        nextSprites.push(
          round
            ? rect(colorIndex * SPRITE, SPRITE, SPRITE, SPRITE)
            : rect(colorIndex * SPRITE, 0, SPRITE, SPRITE * 0.64),
        );

        const base = i * STRIDE;
        nextSeeds[base] = width * x;
        nextSeeds[base + 1] = height * y;
        nextSeeds[base + 2] = (Math.random() - 0.5) * 900 * spread;
        nextSeeds[base + 3] = -(420 + Math.random() * 900);
        nextSeeds[base + 4] = Math.random() * Math.PI * 2;
        nextSeeds[base + 5] = (Math.random() - 0.5) * 14;
        nextSeeds[base + 6] = Math.random() * Math.PI * 2;
      }

      seeds.set(nextSeeds);
      setSprites(nextSprites);
      count.set(total);

      clock.set(0);
      clock.set(withTiming(1, { duration: LIFE_MS, easing: Easing.linear }));
    },
    [clock, count, height, reduced, seeds, width],
  );

  useImperativeHandle(ref, () => ({ fire }), [fire]);

  const transforms = useRSXformBuffer(sprites.length, (xform, i) => {
    'worklet';
    const t = clock.get() * LIFE_S;
    const base = i * STRIDE;
    const s = seeds.get();

    const px = s[base] + s[base + 2] * t;
    const py = s[base + 1] + s[base + 3] * t + 0.5 * GRAVITY * t * t;
    const angle = s[base + 4] + s[base + 5] * t;

    // Paper catches the light as it tumbles, and shrinks away at the end.
    const flutter = 0.55 + 0.45 * Math.abs(Math.cos(t * 7 + s[base + 6]));
    const fade = clock.get() > 0.8 ? Math.max(0, 1 - (clock.get() - 0.8) / 0.2) : 1;
    const scale = flutter * fade;

    const scos = Math.cos(angle) * scale;
    const ssin = Math.sin(angle) * scale;
    const cx = SPRITE / 2;
    const cy = SPRITE / 2;

    // Atlas rotates around the sprite's top-left, so offset back to its centre.
    xform.set(scos, ssin, px - (scos * cx - ssin * cy), py - (ssin * cx + scos * cy));
  });

  if (!sprites.length) return null;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Atlas image={texture} sprites={sprites} transforms={transforms} />
    </Canvas>
  );
});

Confetti.displayName = 'Confetti';
export default Confetti;
