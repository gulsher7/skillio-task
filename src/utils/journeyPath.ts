type Point = { x: number; y: number };
type Cubic = [Point, Point, Point, Point];

/**
 * The winding road on the Journey card. Drawn in a 326×138 box; the traveller
 * rides it, so we need real points along it, not just a `d` string.
 */
export const JOURNEY_VIEWBOX = { width: 326, height: 138 };
export const JOURNEY_D = 'M40 92 C 96 92, 104 36, 162 48 S 232 100, 286 44';

const SEGMENTS: Cubic[] = [
  [
    { x: 40, y: 92 },
    { x: 96, y: 92 },
    { x: 104, y: 36 },
    { x: 162, y: 48 },
  ],
  // The `S` command mirrors the previous control point: 2·end − c2.
  [
    { x: 162, y: 48 },
    { x: 220, y: 60 },
    { x: 232, y: 100 },
    { x: 286, y: 44 },
  ],
];

function pointAt([p0, p1, p2, p3]: Cubic, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
}

const RESOLUTION = 240;

/** Dense walk of the curve, carrying cumulative length so we can resample evenly. */
function walk() {
  const points: Point[] = [];
  const lengths: number[] = [];
  let total = 0;

  SEGMENTS.forEach((segment, index) => {
    for (let step = index === 0 ? 0 : 1; step <= RESOLUTION; step += 1) {
      const point = pointAt(segment, step / RESOLUTION);
      if (points.length) {
        const previous = points[points.length - 1];
        total += Math.hypot(point.x - previous.x, point.y - previous.y);
      }
      points.push(point);
      lengths.push(total);
    }
  });

  return { points, lengths, total };
}

const { points, lengths, total } = walk();

export const JOURNEY_LENGTH = total;

/**
 * 101 points spaced by equal arc length, so index === percent. The traveller
 * reads straight out of this on the UI thread.
 */
function resample() {
  const out: Point[] = [];
  let cursor = 0;

  for (let percent = 0; percent <= 100; percent += 1) {
    const target = (total * percent) / 100;
    while (cursor < lengths.length - 1 && lengths[cursor + 1] < target) cursor += 1;

    const from = lengths[cursor];
    const to = lengths[Math.min(cursor + 1, lengths.length - 1)];
    const span = to - from;
    const t = span > 0 ? (target - from) / span : 0;

    const a = points[cursor];
    const b = points[Math.min(cursor + 1, points.length - 1)];
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }

  return out;
}

const sampled = resample();

/** Flat arrays keep the worklet cheap — no object allocation per frame. */
export const JOURNEY_X = sampled.map((p) => p.x);
export const JOURNEY_Y = sampled.map((p) => p.y);

export const journeyPointAt = (percent: number) =>
  sampled[Math.round(Math.max(0, Math.min(100, percent)))];
