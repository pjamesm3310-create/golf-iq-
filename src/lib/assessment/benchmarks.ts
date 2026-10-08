// Approximate per-round stats for amateur golfers by typical 18-hole score.
// These are rounded, illustrative figures in line with commonly published amateur
// averages — good enough to rank where strokes go, not precise statistics.

export interface Benchmark {
  /** Share of 14 tee shots that end up in play. */
  teeInPlay: number;
  penalties: number;
  greens: number;
  /** Share of chips/pitches finishing inside ~6 feet. */
  chipInside6ft: number;
  putts: number;
  threePutts: number;
  blowUps: number;
}

const TABLE: { score: number; stats: Benchmark }[] = [
  { score: 72, stats: { teeInPlay: 0.78, penalties: 0.3, greens: 12, chipInside6ft: 0.62, putts: 30, threePutts: 0.5, blowUps: 0.5 } },
  { score: 80, stats: { teeInPlay: 0.68, penalties: 0.8, greens: 8, chipInside6ft: 0.5, putts: 32, threePutts: 1, blowUps: 1.5 } },
  { score: 90, stats: { teeInPlay: 0.58, penalties: 1.8, greens: 4.5, chipInside6ft: 0.38, putts: 34, threePutts: 2, blowUps: 3.5 } },
  { score: 100, stats: { teeInPlay: 0.48, penalties: 3, greens: 2.5, chipInside6ft: 0.28, putts: 36, threePutts: 3, blowUps: 6 } },
  { score: 110, stats: { teeInPlay: 0.4, penalties: 4.5, greens: 1.2, chipInside6ft: 0.2, putts: 38, threePutts: 4, blowUps: 8.5 } },
  { score: 120, stats: { teeInPlay: 0.32, penalties: 6, greens: 0.5, chipInside6ft: 0.15, putts: 40, threePutts: 5, blowUps: 11 } },
];

/** Linear interpolation between table rows; scores outside the table clamp to its ends. */
export function benchmarkFor(score: number): Benchmark {
  const first = TABLE[0];
  const last = TABLE[TABLE.length - 1];
  if (score <= first.score) return { ...first.stats };
  if (score >= last.score) return { ...last.stats };

  const upperIndex = TABLE.findIndex((row) => row.score >= score);
  const lower = TABLE[upperIndex - 1];
  const upper = TABLE[upperIndex];
  const t = (score - lower.score) / (upper.score - lower.score);
  const stats = {} as Benchmark;
  for (const key of Object.keys(lower.stats) as (keyof Benchmark)[]) {
    stats[key] = lower.stats[key] + (upper.stats[key] - lower.stats[key]) * t;
  }
  return stats;
}
