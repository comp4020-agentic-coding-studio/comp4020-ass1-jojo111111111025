// Shared between the Astro build-time initial render and the client script,
// so the first paint and every subsequent round come from the same source.
import { CATEGORIES, diversity, feedSlots, type RecommenderState } from "./recommender";
import { titleFor } from "./cards";

export interface FeedItem {
  categoryId: string;
  label: string;
  title: string;
}

export function buildFeed(state: RecommenderState): FeedItem[] {
  const slots = feedSlots(state.weights, 9);
  const occurrence: Record<string, number> = {};
  return slots.map((categoryIndex) => {
    const category = CATEGORIES[categoryIndex];
    const count = occurrence[category.id] ?? 0;
    occurrence[category.id] = count + 1;
    return { categoryId: category.id, label: category.label, title: titleFor(category.id, count) };
  });
}

export function missingCategoryLabels(state: RecommenderState): string[] {
  const present = new Set(buildFeed(state).map((item) => item.categoryId));
  return CATEGORIES.filter((c) => !present.has(c.id)).map((c) => c.label);
}

export const DIVERSITY_PAYOFF_THRESHOLD = 0.5;

export function payoffMessage(state: RecommenderState): string | null {
  if (diversity(state.weights) >= DIVERSITY_PAYOFF_THRESHOLD) return null;
  const missing = missingCategoryLabels(state);
  if (missing.length === 0) return null;
  return `Notice: you never asked to stop seeing ${missing.join(", ")} — but your feed narrowed anyway.`;
}
