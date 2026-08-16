import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../src/scripts/recommender";

// Structural contract for the Assignment 1 spec line: "the visitor does
// something that changes what they see — state the core interaction plainly
// enough to write a test for it." The mechanic itself is unit tested in
// spec/recommender.test.ts; this checks the interactive hooks actually ship
// in the built page. Real click-through state changes are verified manually
// in a browser (jsdom here doesn't execute scripts) — see CLAUDE.md.

const doc = new JSDOM(readFileSync(resolve("dist/index.html"), "utf8")).window
  .document;

describe("assignment 1: filter bubble simulator", () => {
  it("has the round counter and diversity readout", () => {
    expect(doc.querySelector('[data-testid="round-counter"]')).toBeTruthy();
    expect(doc.querySelector('[data-testid="diversity-readout"]')).toBeTruthy();
  });

  it("renders a feed of exactly 9 cards", () => {
    const feed = doc.querySelector('[data-testid="feed"]');
    expect(feed).toBeTruthy();
    const cards = doc.querySelectorAll('[data-testid="feed-card"]');
    expect(cards).toHaveLength(9);
  });

  it("every feed card is a real button carrying a valid category", () => {
    const validIds = new Set<string>(CATEGORIES.map((c) => c.id));
    const cards = doc.querySelectorAll('[data-testid="feed-card"]');
    for (const card of cards) {
      expect(card.tagName).toBe("BUTTON");
      const category = card.getAttribute("data-category");
      expect(category, "feed card must carry a data-category").toBeTruthy();
      expect(validIds.has(category!)).toBe(true);
    }
  });

  it("has a payoff line, hidden at the uniform starting state", () => {
    const payoff = doc.querySelector('[data-testid="payoff"]');
    expect(payoff).toBeTruthy();
    expect(payoff!.hasAttribute("hidden")).toBe(true);
  });

  it("has a real, keyboard-operable reset button", () => {
    const reset = doc.querySelector('[data-testid="reset"]');
    expect(reset).toBeTruthy();
    expect(reset!.tagName).toBe("BUTTON");
  });

  it("states the one idea plainly in the page's own copy", () => {
    expect(doc.body.textContent).toMatch(/narrow/i);
  });
});
