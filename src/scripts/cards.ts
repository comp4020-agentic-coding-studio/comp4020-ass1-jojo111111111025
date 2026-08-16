// Presentational content only — no mechanic here. Card titles are generic
// and synthetic; this is a simulation of the *pattern*, not a claim about how
// any real platform's feed works.
import type { CategoryId } from "./recommender";

export const CARD_TITLES: Record<CategoryId, string[]> = {
  cooking: ["Cooking clip #1", "Cooking clip #2", "Cooking clip #3"],
  travel: ["Travel clip #1", "Travel clip #2", "Travel clip #3"],
  sports: ["Sports clip #1", "Sports clip #2", "Sports clip #3"],
  music: ["Music clip #1", "Music clip #2", "Music clip #3"],
  science: ["Science clip #1", "Science clip #2", "Science clip #3"],
  comedy: ["Comedy clip #1", "Comedy clip #2", "Comedy clip #3"],
};

export function titleFor(categoryId: CategoryId, occurrence: number): string {
  const titles = CARD_TITLES[categoryId];
  return titles[occurrence % titles.length];
}
