# Assignment 1 reflection

**The breakthrough that moved the work forward** was realising that "one idea,
one mechanic" only holds together if the mechanic can be interrogated on its
own — separately from the page it's rendered into. Writing
`src/scripts/recommender.ts` as pure, DOM-free functions meant I could assert
the actual claim of the prototype (repeated engagement narrows the feed,
round after round, without anything being explicitly removed) as a real
sequence of twenty-plus rounds, not a single before/after screenshot. That
same separation is what let a structural test, a real DOM click-through test,
and the build-time Astro render all share one `feed.ts` without drifting apart.
The second breakthrough was smaller but more uncomfortable: this sandbox has
no working GUI browser, and the honest response wasn't to eyeball the code
and assume the click handler worked, but to write a test that actually fires
`click()` at the real script in a real DOM and watch the feed narrow.

**What this changed about the developer I want to be** is my tolerance for
"it should work" as a stopping point. It would have been easy to treat a
green `assignment-1.test.ts` — which only checks the hooks exist — as good
enough, especially against a deadline and a broken browser tool. The gap
between a page that *has* a reset button and a page where clicking it
*actually resets the state* is exactly the gap a marker clicks through in the
first ten seconds. I'd rather build the harder, more honest check than ship
confidence I haven't earned, and I want that to be the default, not the thing
I reach for only when the easy path is blocked.
