// @vitest-environment jsdom
//
// The other spec files check the mechanic in isolation (recommender.test.ts)
// and that the interactive hooks exist in the built markup
// (assignment-1.test.ts) — neither one actually clicks anything. This file
// imports the real src/scripts/main.ts and dispatches real DOM click events
// against it, so the exact wiring that ships (event delegation, render(),
// innerHTML rebuild) is exercised end to end, not just its pieces.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

function bodyMarkup(): string {
  const html = readFileSync(resolve("dist/index.html"), "utf8");
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!match) throw new Error("dist/index.html has no <body> — run pnpm build first");
  // Drop the bundled <script> — this test imports src/scripts/main.ts itself
  // instead of letting the built bundle run.
  return match[1].replace(/<script[\s\S]*?<\/script>/, "");
}

async function loadPage() {
  document.body.innerHTML = bodyMarkup();
  vi.resetModules();
  await import("../src/scripts/main");
}

function click(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`no element for ${selector}`);
  el.click();
}

function roundValue(): number {
  return Number(document.querySelector("#round-value")!.textContent);
}

function diversityValue(): number {
  return Number(document.querySelector("#diversity-value")!.textContent);
}

function payoffHidden(): boolean {
  return document.querySelector('[data-testid="payoff"]')!.hasAttribute("hidden");
}

describe("real click-through of the shipped script", () => {
  beforeEach(async () => {
    await loadPage();
  });

  it("starts at round 0 with all 6 topics showing and the payoff hidden", () => {
    expect(roundValue()).toBe(0);
    expect(diversityValue()).toBe(6);
    expect(payoffHidden()).toBe(true);
    expect(document.querySelectorAll('[data-testid="feed-card"]')).toHaveLength(9);
  });

  it("a single click on a real feed card advances the round and re-renders the feed", () => {
    click('[data-category="cooking"]');
    expect(roundValue()).toBe(1);
    expect(document.querySelectorAll('[data-testid="feed-card"]')).toHaveLength(9);
  });

  it("repeatedly clicking the same category narrows the feed and reveals the payoff, in the live DOM", () => {
    for (let round = 0; round < 15; round++) {
      // The dominant category keeps a slot every round by construction, so
      // this selector never goes stale even as other categories drop out.
      click('[data-category="cooking"]');
    }
    expect(roundValue()).toBe(15);
    expect(diversityValue()).toBeLessThan(6);
    expect(payoffHidden()).toBe(false);
    const payoffText = document.querySelector('[data-testid="payoff"]')!.textContent;
    expect(payoffText).toMatch(/narrowed anyway/i);

    const cookingCards = document.querySelectorAll('[data-category="cooking"]');
    expect(cookingCards.length).toBeGreaterThan(6);
  });

  it("reset restores the uniform starting state after the feed has narrowed", () => {
    for (let round = 0; round < 15; round++) {
      click('[data-category="cooking"]');
    }
    expect(diversityValue()).toBeLessThan(6);

    click('[data-testid="reset"]');

    expect(roundValue()).toBe(0);
    expect(diversityValue()).toBe(6);
    expect(payoffHidden()).toBe(true);
    expect(document.querySelectorAll('[data-testid="feed-card"]')).toHaveLength(9);
  });

  it("clicking outside any card (e.g. the feed's own padding) does nothing", () => {
    const feed = document.querySelector('[data-testid="feed"]')!;
    feed.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(roundValue()).toBe(0);
  });
});
