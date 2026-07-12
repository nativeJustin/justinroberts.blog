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
