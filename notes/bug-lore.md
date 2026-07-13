# Bug lore

Non-obvious bugs worth remembering, so future debugging doesn't start from zero.

## Waline comments lost all styling after the first SPA navigation

**Symptom:** the Waline comment widget rendered correctly (styled, green Submit
button, proper layout) on whichever post you landed on first. Clicking through
to any other post via the site's normal in-app navigation left the widget
functional — comments still loaded and could still be submitted — but
completely unstyled: plain browser-default form fields, no card layout, a
default bulleted list instead of the "Latest / Oldest / Hottest" tab row. A
hard reload of the second page fixed it, only for the same thing to happen
again on the next SPA navigation.

**Root cause:** `quartz/components/scripts/comments.inline.ts` loads Waline's
CSS by creating a `<link rel="stylesheet">` element at runtime and appending
it to `document.head`, then caches that as "done" in a module-level promise
(`walineStylesPromise`) so it's never re-inserted.

Quartz's SPA router (`quartz/components/scripts/spa.inline.ts`) rewrites
`document.head` on every in-app navigation:

```ts
// spa.inline.ts
const elementsToRemove = document.head.querySelectorAll(":not([spa-preserve])")
elementsToRemove.forEach((el) => el.remove())
```

Any `<head>` element without an explicit `spa-preserve` attribute gets
stripped on every navigation and replaced with whatever the newly-fetched
page's own `<head>` contains. Our dynamically-injected stylesheet `<link>`
was never part of any page's server-rendered `<head>` (it's added purely at
runtime) and wasn't marked `spa-preserve`, so it survived exactly one
navigation: the first page load that created it. The moment you clicked to a
second page, the router's cleanup pass removed it — but our own
`walineStylesPromise` cache had no way to know that happened, so on the next
`nav` event it just returned the already-resolved promise and skipped
re-inserting anything. Waline's JS still worked fine on the second page
because dynamic `import()` results are cached by the browser's module
registry independently of the DOM, so only the visual styling was affected,
not functionality — which made this look like a flaky loading/timing issue
rather than a missing-element bug.

**Fix:** set `stylesheet.setAttribute("spa-preserve", "")` on the
dynamically-created `<link>` before appending it. This is the actual
mechanism Quartz provides for "don't touch this on navigation" — the same
attribute is used on Quartz's own server-rendered `<script>`/`<link>` tags in
`quartz/util/resources.tsx`. Once set, the element is exempt from the
head-cleanup pass and survives every subsequent navigation, so the load-once
promise caching is correct again.

**Why this was hard to diagnose:** the reported symptom ("hangs on first
load, reload fixes it") initially pointed at Vercel/Neon cold-start latency,
which is a real and separate phenomenon on this project's free-tier hosting.
That red herring was reasonable — a slow first request really can produce a
visible flash of unstyled content — but it's not what was actually happening
here, since the break specifically followed *navigation*, not just "the
first request of a session." The distinguishing signal, once specifically
asked for, was: "it worked on the first page, then I clicked to a new one and
it broke" — cold-start theories don't explain why a *second* page would be
worse than the first. Any bug report involving Quartz + dynamically-injected
`<head>` content should check `spa.inline.ts`'s cleanup pass first.

**Where:** `quartz/components/scripts/comments.inline.ts`,
`quartz/components/scripts/spa.inline.ts` (the mechanism, not the bug),
`quartz/util/resources.tsx` (existing correct usage of `spa-preserve` to
crib from).

## Explorer sidebar wouldn't scroll, and wheel input was silently swallowed

**Symptom:** with 146+ books, expanding the Explorer's folder list on desktop
just grew the sidebar past the bottom of the viewport instead of scrolling
internally — the rest of the list was simply unreachable. After a first fix
made the list *technically* scrollable (verified by setting `scrollTop`
directly and by Playwright's synthetic `mouse.wheel()` at a wide viewport),
real mouse-wheel/trackpad scrolling in an actual browser still did nothing
when the cursor was resting over a book link inside an open folder.

**Root cause, part 1 (no bounded height):** `.explorer` and `.explorer-content`
had no height constraint on desktop — `flex: 0 1 auto` with default
`min-height: auto` means a flex item won't shrink below its content's
intrinsic size. With no ancestor clipping it, the sidebar just grew as tall
as the full list, and the `overflow-y: auto` already present on
`.explorer-content` never had a bounded box to scroll within. Fix: give
`.explorer` and `.explorer-content` `flex: 1 1 auto; min-height: 0;` inside
`@media all and not ($mobile)`, so they fill (and are clipped to) the
remaining height in the sidebar's `height: 100vh` flex column.

**Root cause, part 2 (scroll chaining blocked):** even after part 1, real
wheel input still didn't move the list — only programmatic `scrollTop`
writes did, which is a false-positive signal (`element.scrollTop = n` works
on any non-`visible`-overflow element regardless of whether user-driven
scroll can reach it; only a genuine `mouse.wheel()` simulation exercises the
real code path). The actual blocker: `overscroll-behavior: contain` was
applied via `.explorer-content { & ul { ... } }` — a descendant selector
that matches *every* nested `<ul>`, not just the top-level scrollable list.
Each per-folder list (`.folder-outer > ul`) also has `overflow: hidden`
(needed for its own open/closed grid-accordion animation), which is enough
to make it a "scroll container" in the CSS Overscroll Behavior spec's eyes —
so `overscroll-behavior: contain` on *that* element tells the browser not to
chain unconsumed scroll delta past it, even though the element itself never
visibly scrolls anything. Any wheel event that started over a link inside an
open folder got absorbed right there and never reached the real scrolling
ancestor (`.explorer-ul`). Fix: scope the rule to `.explorer-content > ul`
(direct child only) instead of `.explorer-content ul` (all descendants).

**Why this was hard to diagnose:** `element.scrollTop = n` succeeding is not
proof that user-driven scrolling works — it will happily move the scroll
position of an `overflow: hidden` element too. Any verification of "is this
actually scrollable" needs a real (or `page.mouse.wheel()`-simulated) wheel
event with the cursor positioned over the actual nested content a user would
hover, not just a JS-side scrollTop assertion.

**Where:** `quartz/components/styles/explorer.scss`.

## Mobile header: site title wrapped to two lines despite `white-space: nowrap`

**Symptom:** `.page-title` ("Justin Roberts" in the sidebar/mobile header)
wrapped onto two lines on narrow viewports even after setting
`white-space: nowrap` directly on `.page-title`. The nowrap declaration was
visibly present and correctly scoped in the compiled CSS, and
`getComputedStyle(pageTitleEl).whiteSpace` even reported `"nowrap"` — yet
the actual `<a>` text node inside it still wrapped.

**Root cause:** `quartz/styles/base.scss` has a global rule —
`a, p, ul, ... { overflow-wrap: break-word; text-wrap: pretty; }` — applied
site-wide for prose readability. In modern CSS, `white-space` is a shorthand
for the `white-space-collapse` and `text-wrap` longhands. Setting
`text-wrap: pretty` directly on the `<a>` element resets just the
`text-wrap` component of its own computed `white-space` back to wrapping —
and since inheritance only applies to properties with *no* explicit
declaration on the element itself, this explicit (if indirect, via a
shorthand-adjacent longhand) declaration on the `<a>` wins over whatever its
parent `.page-title` specifies, regardless of selector specificity between
the two rules. Checking `getComputedStyle` on the *parent* (`.page-title`)
showed "nowrap" correctly the whole time; the bug only showed up when
checking the computed style of the child `<a>` that actually contains the
text.

**Fix:** add a rule that targets the anchor directly —
`.page-title a { white-space: nowrap; }` — so it has an explicit declaration
of its own that overrides the global `a { text-wrap: pretty }` rule (higher
specificity than the bare `a` selector, and no longer relying on
inheritance).

**Why this was hard to diagnose:** nothing in the DOM or computed styles of
the element you'd naturally inspect first (`.page-title`) was wrong — the
override lived on a *child* element via a longhand of a property (`text-wrap`)
that doesn't read as obviously related to `white-space` unless you already
know they're the same shorthand family. Any "I set `white-space: nowrap` and
it's still wrapping" bug on this site should check for a `text-wrap` (or
`white-space-collapse`) declaration on the specific text-containing element,
not just its ancestors.

**Where:** `quartz/components/PageTitle.tsx`, `quartz/styles/base.scss`
(the global `text-wrap: pretty` rule, not itself a bug).
