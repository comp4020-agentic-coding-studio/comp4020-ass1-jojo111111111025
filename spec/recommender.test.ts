import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  chooseCategory,
  createInitialState,
  diversity,
  feedSlots,
} from "../src/scripts/recommender";

// The core claim of this prototype, made concrete: repeated engagement with
// one category drives it to dominate the feed, and starves other categories
// out of the rendered feed, without any weight ever being forced to exactly
// zero (nothing is "explicitly removed" — see spec/README.md).

describe("createInitialState", () => {
  it("starts uniform across every category", () => {
    const state = createInitialState();
    expect(state.round).toBe(0);
    expect(state.weights).toHaveLength(CATEGORIES.length);
    for (const w of state.weights) {
      expect(w).toBeCloseTo(1 / CATEGORIES.length);
    }
  });

  it("weights sum to 1", () => {
    const { weights } = createInitialState();
    const total = weights.reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1);
  });
});

describe("chooseCategory", () => {
  it("is pure — never mutates the input state", () => {
    const state = createInitialState();
    const before = [...state.weights];
    chooseCategory(state, 0);
    expect(state.weights).toEqual(before);
  });

  it("increments the round", () => {
    const state = chooseCategory(createInitialState(), 0);
    expect(state.round).toBe(1);
  });

  it("always returns weights that sum to 1 and contain no negative or NaN entries", () => {
    let state = createInitialState();
    for (let i = 0; i < 20; i++) {
      state = chooseCategory(state, i % CATEGORIES.length);
      const total = state.weights.reduce((sum, w) => sum + w, 0);
      expect(total).toBeCloseTo(1);
      for (const w of state.weights) {
        expect(Number.isNaN(w)).toBe(false);
        expect(w).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("repeatedly choosing the same category drives its weight up and diversity down", () => {
    let state = createInitialState();
    let previousWeight = state.weights[0];
    let previousDiversity = diversity(state.weights);

    for (let round = 0; round < 10; round++) {
      state = chooseCategory(state, 0);
      expect(state.weights[0]).toBeGreaterThan(previousWeight);
      expect(diversity(state.weights)).toBeLessThan(previousDiversity);
      previousWeight = state.weights[0];
      previousDiversity = diversity(state.weights);
    }
  });
});

describe("diversity", () => {
  it("is 1 for a uniform distribution", () => {
    expect(diversity(createInitialState().weights)).toBeCloseTo(1);
  });

  it("approaches 0 as one category comes to dominate", () => {
    let state = createInitialState();
    for (let i = 0; i < 25; i++) {
      state = chooseCategory(state, 0);
    }
    expect(diversity(state.weights)).toBeLessThan(0.2);
  });
});

describe("feedSlots", () => {
  it("allocates every slot to a valid category index", () => {
    const slots = feedSlots(createInitialState().weights, 9);
    expect(slots).toHaveLength(9);
    for (const categoryIndex of slots) {
      expect(categoryIndex).toBeGreaterThanOrEqual(0);
      expect(categoryIndex).toBeLessThan(CATEGORIES.length);
    }
  });

  it("the feed becomes narrower — a starved category drops out entirely", () => {
    let state = createInitialState();
    const initialCategoryCount = new Set(feedSlots(state.weights, 9)).size;
    expect(initialCategoryCount).toBe(CATEGORIES.length);

    for (let i = 0; i < 15; i++) {
      state = chooseCategory(state, 0);
    }
    const narrowedCategoryCount = new Set(feedSlots(state.weights, 9)).size;
    expect(narrowedCategoryCount).toBeLessThan(initialCategoryCount);
  });

  it("the repeatedly-chosen category comes to dominate the feed", () => {
    let state = createInitialState();
    for (let i = 0; i < 15; i++) {
      state = chooseCategory(state, 0);
    }
    const slots = feedSlots(state.weights, 9);
    const dominantCount = slots.filter((categoryIndex) => categoryIndex === 0).length;
    expect(dominantCount).toBeGreaterThan(6);
  });
});
