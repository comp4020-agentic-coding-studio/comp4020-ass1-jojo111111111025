# Process overview

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and each brief adds its own word count and moment count.

## What I built

A filter bubble simulator: a feed of nine synthetic cards across six neutral
categories, where clicking a card reinforces its category and decays the
rest, and the next feed is redrawn from those updated weights. A round
counter and a diversity readout ("Showing N of 6 topics") make the narrowing
legible without the visitor doing the math, and a payoff line names exactly
which topics have quietly dropped out once the feed has visibly narrowed. One
idea, stated once in the copy and once in the mechanic: repeated engagement
can narrow what a recommender shows you, even though nobody ever asked for
the other topics to be removed.

## The moments that mattered

1. **Keeping the mechanic pure paid off immediately.** `chooseCategory`,
   `diversity`, and `feedSlots` in `src/scripts/recommender.ts` take no DOM
   and return new state rather than mutating — so the actual claim
   ("repeatedly choosing one category drives its weight up and diversity down,
   round after round") could be asserted directly as a monotonic sequence over
   20+ rounds, not just spot-checked at one point in time. That test caught
   what a single before/after snapshot wouldn't have: a poorly-tuned decay
   constant would still pass a two-point check while plateauing or oscillating
   over a longer run.
   ([`6c1e5a4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-jojo111111111025/commit/6c1e5a4))

2. **Plain rounding would have silently broken the "always 9 cards"
   invariant.** Turning six category weights into nine feed slots by naive
   `Math.round` doesn't guarantee the results sum to 9 — rounding error can
   leave you with 8 or 10. `feedSlots` instead floors every category's share,
   then hands out the remaining slots to whichever categories had the largest
   fractional remainder, so the slot count is exactly 9 by construction for
   any weight distribution. `spec/recommender.test.ts` asserts the length
   directly so a future change to the mechanic can't quietly reintroduce the
   drift.
   ([`6c1e5a4`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-jojo111111111025/commit/6c1e5a4))

3. **This sandbox has no working GUI browser, so I didn't just take the
   structural check on faith.** `agent-browser`'s bundled Chrome fails to
   launch here (`libnspr4.so: cannot open shared object file`, and there's no
   root to install it), which meant I couldn't open the page and click
   through rounds myself the way `CLAUDE.md` asks. Rather than ship on the
   strength of `spec/assignment-1.test.ts` alone — which only checks the
   hooks exist, not that clicking them does anything — I wrote
   `spec/interaction.test.ts`, which imports the real `src/scripts/main.ts`
   and fires real `click()` events at a jsdom DOM built from `dist/index.html`.
   It caught that the wiring actually works end to end: a single click
   advances the round and re-renders exactly 9 cards; 15 clicks on one
   category narrow the diversity readout below 6 and reveal the payoff line
   with the right missing-topics text; reset restores round 0 and full
   diversity. That's real coverage of the exact code that ships, not a
   re-implementation of it — but it's a fallback for a missing browser, not a
   substitute for one, and `CLAUDE.md` now says so for next time.
   ([`2e86022`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-jojo111111111025/commit/2e86022)
   through
   [`6bc2d9d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-jojo111111111025/commit/6bc2d9d))

4. **The whole build had landed as one uncommitted pile before I checked
   `git status`.** Five files' worth of the actual assignment (the mechanic,
   the content, the page wiring, two spec files, and a `CLAUDE.md` update)
   were sitting unstaged on top of the stack-conversion commit — exactly the
   "single dump the night before" this repo's own `CLAUDE.md` calls the
   weakest form of evidence. I split it into five commits along real seams
   (mechanic → content → page wiring → verification test → harness) instead
   of one `git add -A`, so the history at least shows the pieces the work is
   actually made of, even though they land in one sitting rather than
   spread across the week.
   ([`6c1e5a4...6bc2d9d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-jojo111111111025/compare/32b1a72...6bc2d9d))

## Before you ship

`pnpm check:evidence` verifies these citations resolve to real commits, that
the current reflection entry is in `reflections/`, and that `CLAUDE.md` is
there. It checks that the map is traceable, not that it's good.
