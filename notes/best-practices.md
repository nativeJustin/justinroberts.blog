# Blog post structure best practices

Structural/markdown formatting conventions for `content/writing/` posts. This
is about document structure (headers, lists, nesting) — for prose voice and
tone (em-dashes, sentence rhythm, avoiding restatement), see the "Blog prose"
section of `CLAUDE.md`, which this doc doesn't duplicate.

Developed while reworking "The Most Overlooked Part of Training Brazilian
Jiu Jitsu" — that post is the reference example for everything below.

## Not every post needs headers

Narrative/reflective posts (a story, an essay, a single train of thought)
read better as flowing prose. Adding headers or bullet lists to a six-
paragraph reflection breaks the read for no benefit — there's nothing to
scan back to. "Teaching at Airlock After Dark" is the model here: zero
headers, just prose, and it's correct as-is.

How-to, routine, recipe, and reference posts (steps to follow, gear to buy,
things to avoid) benefit from structure, because readers scan these rather
than read them start to finish. The BJJ gear-cleaning post and the pickle
brine recipe are both this type.

Rule of thumb: if you'd ever ctrl-F this post to jump to one part of it,
it wants headers and lists. If you'd read it top to bottom once and be done,
it wants prose.

## Heading hierarchy

- The frontmatter `title` is the effective H1 — never add a literal `#` in
  the body.
- `##` for major sections, `###` for subsections of those. Don't skip a
  level (no jumping straight from `##` to `####`).
- Headings are structural, not decorative. If something just needs visual
  weight, use **bold**, not a heading one size too small for what it's
  wrapping.
- Headings should say what the section is about, not just label it vaguely.
  "Yes, wash your belt" beats "Belt Care."
- House style is sentence case ("Gear I use," not "Gear I Use") — matches
  the plain, unfussy voice described in `CLAUDE.md`. Title Case reads a
  little more formal/marketing than this blog's tone.

## When a routine has multiple steps, group them under one parent header

Six same-level `##` sections for six sequential steps reads like six
unrelated topics. Group them under one `##` parent ("My post-class
routine") with numbered `###` subsections instead — the numbering plus the
shared parent makes the sequence and the relationship both obvious at a
glance.

## Lists over prose for scannable info, prose for anything that needs explaining

A list of habits to avoid, ingredients, or gear recommendations is more
scannable as a bulleted list than as a paragraph. But an argument or a
rebuttal (why you *should* wash your belt, despite what people say) is prose
that follows a real train of thought — cramming that into a bullet point
would just make it harder to follow, not easier.

## Nest elaboration under the thing it elaborates on

If a section is really just expanding on one bullet from an earlier list,
nest it as a subsection under that list's parent heading, don't leave it as
a same-level sibling. A same-level heading implies "this is a new, separate
topic," and if it's actually just unpacking one line from three headings
ago, the reader has to do the work of reconnecting it themselves. This was
the exact problem with "Yes, wash your belt" sitting as its own `##` next to
"Habits I avoid" instead of nested inside it.

## Close a section on the thing it's actually about

A closing reflection or wrap-up thought belongs at the end of whatever
section it's actually summarizing, not wherever it happens to fall
structurally. In the BJJ post, "None of this is complicated, it just became
part of training" is about the whole six-step *routine*, not specifically
about belt-washing, so it closes out "My post-class routine," not "Yes,
wash your belt" (which is where it originally, accidentally, ended up after
some restructuring).

## Always hyperlink URLs

`[View on Amazon](https://a.co/d/...)` over a bare pasted link, every time.
Applies to any external reference, not just product links.

## Don't say the same thing twice back to back

If two consecutive sentences or paragraphs are restating the same point in
different words, that's not emphasis, it's padding. Cut one, or merge them
into a single sentence that says it once. (This one's really a `CLAUDE.md`
prose-voice rule, but it shows up structurally too: two paragraphs that
each restate "everything's clean now" is a structure problem as much as a
wording one.)
