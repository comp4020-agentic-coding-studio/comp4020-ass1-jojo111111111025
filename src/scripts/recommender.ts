// The one mechanic this prototype explains: repeated engagement narrows a
// recommendation feed even though nothing is ever explicitly removed.
// Pure and DOM-free so it can be unit tested directly — see
// spec/recommender.test.ts.

export const CATEGORIES = [
  { id: "cooking", label: "🍳 Cooking" },
  { id: "travel", label: "✈️ Travel" },
  { id: "sports", label: "⚽ Sports" },
  { id: "music", label: "🎵 Music" },
  { id: "science", label: "🔬 Science" },
  { id: "comedy", label: "😂 Comedy" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface RecommenderState {
  round: number;
  weights: number[]; // one per CATEGORIES entry, sums to 1
}

const REINFORCE = 0.25;
const DECAY = 0.95;

export function createInitialState(): RecommenderState {
  const uniform = 1 / CATEGORIES.length;
  return {
    round: 0,
    weights: CATEGORIES.map(() => uniform),
  };
}

export function chooseCategory(
  state: RecommenderState,
  categoryIndex: number,
): RecommenderState {
  const decayed = state.weights.map((w, i) =>
    i === categoryIndex ? w * DECAY + REINFORCE : w * DECAY,
  );
  const total = decayed.reduce((sum, w) => sum + w, 0);
  return {
    round: state.round + 1,
    weights: decayed.map((w) => w / total),
  };
}

export function diversity(weights: number[]): number {
  const n = weights.length;
  if (n <= 1) return 0;
  const entropy = weights.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum - p * Math.log(p);
  }, 0);
  return entropy / Math.log(n);
}

// Largest-remainder rounding: how many of `slotCount` feed slots each
// category earns for its current weight. Returns one category index per
// slot, grouped by category (rendering may reorder for display).
export function feedSlots(weights: number[], slotCount = 9): number[] {
  const raw = weights.map((w) => w * slotCount);
  const floor = raw.map(Math.floor);
  let remaining = slotCount - floor.reduce((sum, n) => sum + n, 0);

  const byRemainder = raw
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);

  const counts = [...floor];
  for (let i = 0; i < byRemainder.length && remaining > 0; i++, remaining--) {
    counts[byRemainder[i].index]++;
  }

  const slots: number[] = [];
  counts.forEach((count, categoryIndex) => {
    for (let i = 0; i < count; i++) slots.push(categoryIndex);
  });
  return slots;
}
