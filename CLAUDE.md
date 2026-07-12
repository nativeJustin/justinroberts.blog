# justinroberts.blog

Justin's personal blog. Built with [Quartz](https://quartz.jzhao.xyz) v4.5.2, deployed to
Cloudflare Workers (static assets), served at `justinroberts.blog`.

## What this repo is

Content originates in Justin's private Obsidian vault (a separate, private repo). This repo is a
curated, public subset of that vault — not a mirror. Only content that's meant to be public lives
here.

This repo is also its own standalone Obsidian vault in its own right, separate from the private
one (see "Obsidian vault workflow" below). `content/writing/` posts are written directly in this
vault rather than imported — they're public from the start, so the import/strip pipeline below
doesn't apply to them. That pipeline still governs anything pulled in from the private vault
(books, and any future section that follows the same pattern).

## Content pipeline (private vault -> here)

The book library (`content/books/*.md`) was imported from the vault's `Notes/*.md` files tagged
`books`. The import rule, and the standard to follow for any future import from the vault:

- **Keep frontmatter** (title, author, genre, year_read, rating, status, cover) — it's just
  metadata, not personal.
- **Strip body text.** Personal notes/reviews in the vault's book notes are private; only the
  frontmatter and a cover image embed carry over.
- **Cover images**: copied from the vault's `Assets/` folder into `content/books/covers/`, referenced
  in frontmatter as `cover: "covers/<filename>"`, and embedded in the note body as
  `![[<filename>]]` so both the individual book page and the homepage/grid can resolve them.
- Before pulling any *new* section from the vault (BJJ notes, daily journal, etc.), re-read the
  source for personal/private content the same way — the vault is not assumed public by default.

Two source-data typos were fixed during import (safe to do — this is a copy, not the vault
itself): `Disicpline Equals Freedom` → `Discipline Equals Freedom`, `Jocko Wilink` → `Jocko
Willink`. The vault's copy still has the original typos; only this repo's copy was corrected.

Two books (`Win`, `Iron Gold`) had cover filenames in frontmatter that didn't exist anywhere in
the vault's `Assets/` folder. Covers for both were sourced separately (AI-generated cover images
uploaded directly via GitHub's web UI) and wired into `content/books/covers/`.

## Architecture

- **Quartz version is pinned to v4.5.2** (tag), not the `main`/`v5` branch. v5 is a bleeding-edge
  preview with a different (YAML-based) config format — don't upgrade to it without deliberately
  re-doing the config.
- `quartz.config.ts` / `quartz.layout.ts` — site config and page layout/component wiring.
- `quartz/styles/custom.scss` — site-wide custom CSS (e.g. `.eyebrow`). This is the intended
  place for one-off global styles; don't hand-edit the vendored component `.scss` files.
- Custom components (not part of upstream Quartz, written for this site):
  - `quartz/components/bookUtils.tsx` — shared book-card rendering (`BookCard`), cover-path
    resolution (`coverSrc`), and year-read sorting helpers. Used by both `BookGrid` and
    `HomeHighlights` — extend this rather than duplicating card markup again. A book with
    `status: reading` and no `year_read` renders a "Reading" badge instead of a blank year on the
    card, and `byYearReadDescending` sorts those books to the very top of the grid (ahead of dated
    books) — since "currently reading" is more recent than anything already finished. Books that
    are `status: reading` but already have a `year_read` (e.g. logged prematurely) are left
    untouched by both behaviors and just sort/display by their year as normal.
  - `quartz/components/BookGrid.tsx` — the full card grid on `/books/`. Wired into
    `quartz/components/pages/FolderContent.tsx` with a hard check for `fileData.slug ===
    "books/index"` (folder pages carry the `/index` suffix internally even though the URL is
    `/books/`).
  - `quartz/components/HomeHighlights.tsx` — homepage-only: a dynamic "N books logged since
    <earliest year>" stat, and a hardcoded `FAVORITES` title list rendered as a card strip. To
    change the featured books, edit the `FAVORITES` array — titles must match a book's
    frontmatter `title` exactly.
- **Homepage (`content/index.md`) has custom layout treatment**, all wired via
  `Component.ConditionalRender` in `quartz.layout.ts` keyed on `fileData.slug === "index"`:
  - Article title and content-meta (date/read-time) are hidden — the sidebar already shows the
    site name, so a duplicate heading was redundant.
  - `HomeHighlights` (stat + favorites) only renders here. The "Favorite Books" heading uses the
    shared `.eyebrow` class (uppercase, letter-spaced) instead of a plain `<h3>`, for visual
    consistency with other section labels on the site — it was originally just "Favorites" styled
    as a header, which read as an unclear, easy-to-miss label.
  - The homepage's "Start with [[writing/index|the latest posts]]" link used to point at
    `books/index` — a leftover placeholder from before `content/writing/` existed. Fixed once real
    posts landed there; if you ever see a homepage link pointing at the wrong section, check for
    this kind of stale-placeholder pattern.
- **Graph View and Backlinks are removed site-wide** (not just hidden on the homepage) —
  `defaultContentPageLayout.right` in `quartz.layout.ts` only renders `TableOfContents` now.
  Graph looked sparse with only a couple of nodes even on content pages; Backlinks wasn't pulling
  its weight since most content isn't cross-linked. Revisit if the content graph gets denser.
- **Explorer sidebar** (`quartz.layout.ts`, `explorerFilter`) excludes `about` and `tags` from the
  nav tree. `/about` is still a real, linkable page — just reachable via the footer link instead
  of the sidebar, since having it in both felt redundant.
- **Folder display names in the Explorer** come from that folder's `index.md` frontmatter
  `title`, not the raw directory name (see `FileTrieNode.displayName` in
  `quartz/util/fileTrie.ts` — it prefers the index page's title over the lowercase slug segment).
  Both `content/books/index.md` (`title: Books`) and `content/writing/index.md` (`title: Writing`)
  exist for this reason — without an index page, a folder falls back to its literal, lowercase
  directory name in the sidebar (e.g. "writing" instead of "Writing").
- **Footer** (`quartz.layout.ts`, `sharedPageComponents.footer`) is site-wide contact/subscribe
  surface, in this order: About Me, Contact (email), Subscribe via RSS (`/index.xml`), Buy Me a
  Coffee (`buymeacoffee.com/justinroberts`), GitHub. Order is deliberate: identity, then how to
  reach out, then how to follow, then how to support, then where the code lives. The email link's
  visible text is the literal address (`hello@justinroberts.blog`, prefixed with a plain-text
  "Contact:" label), not a generic "Email" label — deliberate, so it's readable/copy-pasteable
  even on a browser with no default mail client configured (a bare `mailto:` link does nothing
  visible in that case, which is normal browser behavior, not a bug — don't "fix" it by trying to
  detect mail client support). `hello@justinroberts.blog` is a Cloudflare Email Routing forward,
  not a real inbox — set up outside this repo, in the Cloudflare dashboard. `footer ul` gets
  `flex-wrap` added in `custom.scss` (not the vendored `footer.scss`) since the 5-item row is more
  likely to overflow on narrow viewports than the original 4-item version was.
- **Comments** (`quartz/components/Comments.tsx`, custom-written, not upstream Quartz) is turned
  on in `sharedPageComponents.afterBody` in `quartz.layout.ts`, gated by a local
  `isCommentablePage()` check: comments only show on real posts, excluding `index`, `about`,
  `books/*`, `tags/*`, and any `*/index` folder page. This exclusion list is a separate
  implementation (not shared code) from the RSS exclusion list in `contentIndex.tsx` below, but
  both now cover the same `*/index` folder-page case — if the definition of "real post" changes,
  both lists need updating, they're not DRY. Comments run on [Waline](https://waline.js.org/), not
  giscus — guest commenting needs only a nickname/email, no GitHub account required. The Waline
  server is a **separate Vercel project** (`justinroberts-blog-comments`, forked from Waline's own
  official Vercel deploy template — not this repo), backed by Neon Postgres via Vercel's Storage
  Marketplace integration. All of that (env vars, the Postgres database, the admin account) lives
  entirely outside this repo — don't go looking for connection strings or schema files here. The
  `serverURL` passed to `Component.Comments({ serverURL: ... })` in `quartz.layout.ts` is the only
  link between this repo and that infrastructure. Waline's client JS/CSS are **not** bundled by
  Quartz's build — `comments.inline.ts` injects `<script>`/`<link>` tags pointing at jsdelivr's CDN
  at runtime, only on pages that render the `#waline` mount point, mirroring exactly how the old
  giscus script worked (this was a deliberate choice over an npm-bundled `@waline/client` import,
  to avoid adding Vue/`@vueuse/core`/`marked` to the shared `postscript.js` loaded on every page,
  including the 146 `books/*` pages that don't show comments). Dark mode is simpler than giscus's
  was: Waline takes a `dark: 'html[saved-theme="dark"]'` selector once at `init()` and handles
  live theme switching via plain CSS — no `themechange` listener or cross-origin `postMessage`
  needed, since Waline mounts directly into the page instead of a cross-origin iframe. The
  Vercel/Neon project's `SECURE_DOMAINS` env var must list **both** `justinroberts.blog` and the
  Waline server's own domain (`justinroberts-blog-comments.vercel.app`) — Waline's admin UI is
  served from its own domain, so without listing that domain too, even the admin registration/login
  requests get rejected as untrusted origins. Comments posted under the old giscus setup live in
  this repo's GitHub Discussions (category "Comments") and were **not** migrated — the giscus
  GitHub App/Discussions category can be disabled independently, that's not tied to this change.
- **Dynamically-injected `<head>` elements need `spa-preserve`.** Quartz's SPA router
  (`quartz/components/scripts/spa.inline.ts`) strips every `<head>` element without an explicit
  `spa-preserve` attribute on each in-app navigation, then repopulates `<head>` from whatever the
  newly-fetched page's own `<head>` contains. Any `<link>`/`<script>` an inline script inserts at
  runtime (as `comments.inline.ts` does for Waline's CSS/JS) needs `spa-preserve` set explicitly,
  or it survives exactly one page load and silently disappears on the next navigation. This broke
  Waline's styling after the first click to a new post and looked like a cold-start timing bug
  rather than a missing-element bug — see `notes/bug-lore.md` for the full debugging story.
  Quartz's own server-rendered `<script>`/`<link>` tags (`quartz/util/resources.tsx`) already set
  this correctly; anything injected client-side has to do it manually.
- **External links open in a new tab** via `Plugin.CrawlLinks({ openLinksInNewTab: true })` in
  `quartz.config.ts`, paired with `rel="noopener noreferrer"` added directly in
  `quartz/plugins/transformers/links.ts` (upstream Quartz's `CrawlLinks` sets `target="_blank"`
  without it, a reverse-tabnabbing gap fixed here rather than just worked around). This only
  affects links inside markdown content — the footer's links (`Footer.tsx`) are hardcoded JSX and
  bypass this transformer entirely, so they still open in the same tab.
- **RSS feed** (`/index.xml`, auto-discoverable via a `<link rel="alternate">` tag Quartz emits on
  every page) is scoped in `quartz/plugins/emitters/contentIndex.tsx` to exclude `books/*`,
  `about`, `index`, and any `*/index` folder page (e.g. `writing/index`) — those are real pages
  (still in the sitemap for SEO) but not "posts," and including them flooded the feed with 146
  empty book notes plus the homepage/about page. The `*/index` exclusion was added after
  `content/writing/index.md` briefly leaked into the feed as an empty one-line item once the
  Writing section existed — the original exclude-list predated any non-book folder and only
  special-cased `books/*` by name. It's an exclude-list, not an include-list, so individual
  `content/writing/` posts are RSS-eligible by default with no changes needed there. The feed's
  channel description ("Latest N posts on Justin Roberts") is
  overridden in `quartz/i18n/locales/en-US.ts` (`pages.rss`) — upstream Quartz's default says
  "notes," which reads as digital-garden jargon rather than blog language.
- **Individual book pages** (`content/books/*.md`, not `books/index`) get two extra components in
  `sharedPageComponents.afterBody`, both self-gating on `fileData.slug` internally rather than
  being wrapped in `ConditionalRender`:
  - `quartz/components/BookMeta.tsx` — author, genre, a read year (or "Currently reading (started
    ...)" when frontmatter `status: reading`), and a star rating, all pulled straight from
    frontmatter.
  - `quartz/components/BookReviewNote.tsx` — a note explaining that older entries are logged, not
    reviewed. Shows unless the book's frontmatter has `reviewed: true`. Set that flag once you've
    written a real review for a given book and the note disappears automatically — no component
    change needed per book.
  - The transcluded cover image on these pages is capped at 220px and centered via
    `body[data-slug^="books/"] article img` in `custom.scss`, scoped that way (not a global `img`
    rule) so it doesn't affect the `.book-card-cover` grid images on `/books/`, which live outside
    `<article>` and have their own sizing. Without this, a cover renders at its native pixel width
    (often 600px+) and dominates the page.

## Local dev environment

- Requires **Node >=22** (pinned in `.node-version` / `package.json` engines). If the system
  default `node` resolves to something older, use `fnm` before running any npm/npx command:
  `eval "$(fnm env)" && fnm use 22`.
- `npx quartz build` occasionally fails with a spurious `npm error could not determine executable
  to run` — an `npx` resolution glitch, not a real problem with the project. If that happens, run
  the bootstrap script directly instead: `node ./quartz/bootstrap-cli.mjs build` (or `... build
  --serve` for the local dev server with file watching).

## Obsidian vault workflow

This repo's root directory is set up as its own **standalone Obsidian vault**, separate from
Justin's private vault (see "What this repo is" above). This lets him write and push directly
from Obsidian instead of going through a coding session or GitHub's web UI.

- Opened via `File → Open folder as vault` pointed at the **repo root**, not just `content/` — so
  the vault root and the git root are the same directory, and no special git-subfolder plugin
  config is needed. (Using "Create new vault" instead of "Open folder as vault" is the most likely
  way to end up looking at a blank vault with a default "Welcome" note instead of this repo.)
- Non-content folders/files are hidden from Obsidian's sidebar via `Settings → Files & Links →
  Excluded files`: `quartz`, `node_modules`, `public`, plus the root config/doc files
  (`CLAUDE.md`, `package.json`, `quartz.config.ts`, `quartz.layout.ts`, etc.). Dotfiles/dotfolders
  (`.git`, `.gitignore`, `.obsidian`) are already hidden by Obsidian's default behavior, no
  exclusion needed for those. `content/` is what's actually meant to be browsed/edited day to day.
- The **Obsidian Git** community plugin (Vinzent03) handles commit/push from inside Obsidian.
  Auto-commit/sync-on-interval is intentionally left off — pushes are manual, via the command
  palette action "Obsidian Git: Commit and push" — since an interval-based auto-push could put a
  half-finished draft live if it fires mid-edit.
- If **Obsidian Sync** is also enabled on this vault: Sync does not respect `.gitignore` (it's a
  separate mechanism, git-only). Its own selective-sync folder list needs the same exclusions —
  `node_modules`, `public`, `quartz/.quartz-cache` — or it'll try to upload build artifacts
  (thousands of files) to Obsidian's sync servers.
- Since content can now change from outside a Claude session (a direct Obsidian push), don't
  assume the working tree matches what a prior session left it in — check `git status` /
  `git log` before making assumptions about current state.

## Deploy

- **Cloudflare Workers static assets**, not classic Cloudflare Pages. Config lives in
  `wrangler.jsonc` (`assets.directory: "./public"`).
- **Cloudflare's own GitHub integration** builds and deploys automatically on every push to
  `main` (build command `npx quartz build`, deploy command `npx wrangler deploy`). There is
  intentionally **no GitHub Actions workflow** for deploy — an earlier version of this repo had
  one (`cloudflare/pages-action`, then `wrangler-action`), but Cloudflare's Git integration
  replaced it, so no `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets exist in this repo
  or its GitHub settings.
- Worker/project name is `justinroberts-blog` (dots aren't allowed in Cloudflare
  project/Worker names, hence not `justinroberts.blog`). The actual domain
  (`justinroberts.blog`) is attached as a custom domain on that Worker in the Cloudflare
  dashboard.
- Always verify a real `npx quartz build` succeeds locally (and spot-check the generated
  `public/` HTML for the specific thing you changed) before pushing — Cloudflare's build is the
  only CI here, so a broken build fails silently from a chat-only perspective until someone
  checks the dashboard.
- **SEO**: the site is submitted to both Google Search Console and Bing Webmaster Tools (Google
  verified via a DNS TXT record in Cloudflare; Bing set up via its "import from Google Search
  Console" option), with `sitemap.xml` submitted to both. None of this is reflected anywhere in
  this repo, and new posts aren't auto-submitted for indexing — after publishing something new,
  requesting indexing of that specific URL via Search Console's URL Inspection tool gets it
  crawled much faster than waiting for a routine crawl to find it.

## Working conventions established in this project

- No comments explaining *what* code does; only for non-obvious *why* (see repo-wide Claude
  conventions). Applies here too — keep component files terse.
- Prefer extending existing components/helpers (`bookUtils.tsx`) over copy-pasting markup.
- Optimize any image before committing it (an uploaded avatar went from 1.3MB → 69KB via `sharp`
  resize to 400x400 — check dimensions/filesize on anything uploaded through the GitHub web UI
  workaround below).
- Chat can't pull bytes out of a pasted image — there's no tool that saves chat image attachments
  to disk. When Justin pastes an image (avatar, cover art, etc.), the working pattern is: he
  uploads it directly to the repo via GitHub's web UI (`Add file → Upload files`), then it gets
  pulled with `git pull` and wired up from there. If the image already exists as a local file
  (e.g. saved to the Desktop) rather than pasted into chat, it can be read and processed directly
  — no GitHub web UI round-trip needed.
- **Bulk book-cover replacement pattern**: when swapping out a batch of low-quality covers, match
  each replacement image to its target by book title (case-insensitive, ignoring
  spaces/punctuation), verify every target filename actually exists in `content/books/covers/`
  before touching anything, then convert/resize with `sharp` (width capped at 400px,
  `withoutEnlargement`, `.webp` quality ~82) and overwrite the existing filename in place — no
  frontmatter changes needed since the `cover:` path doesn't change. Run any one-off conversion
  script from inside the repo root (so it resolves the local `sharp` dependency) and delete it
  afterward; don't commit throwaway scripts.
- This repo is public — a secret scan (manual grep across all tracked files + history, since
  GitHub Advanced Security isn't enabled on this personal repo) turned up nothing; keep it that
  way. `npm audit fix` was run once already to clear known dependency vulnerabilities; re-check
  periodically.
- **Blog prose** (posts, and any other user-facing copy) avoids em-dashes and follows a plain,
  human, quietly-confident voice rather than corporate/AI voice: no hollow intensifiers
  ("powerful", "seamless", etc.), varied sentence rhythm, and no restating the same insight twice
  in different words just to land it — pick the one spot where the idea should pay off and cut the
  earlier restatement instead. When revising existing text, preserve content/structure and only
  change voice; when drafting new copy, the full checklist applies.
- **Dollar signs in post body text get parsed as KaTeX math**, not literal currency, if two `$`
  appear in the same paragraph (e.g. "costs about $2.99 per month, or roughly $24 per year"
  rendered as italic math between the two `$` signs). Escape them as `\$` whenever a post mentions
  a price — found while drafting "The Workout App I Could Finally Connect to AI".
- `.gitignore` didn't exist in this repo until it was added alongside the Obsidian vault setup —
  covers `node_modules/`, `public/`, `quartz/.quartz-cache/`, `.obsidian/`, and `.DS_Store`.
- **`notes/` holds project documentation that isn't user-facing content**: `notes/bug-lore.md` for
  non-obvious bugs worth remembering (root cause, why they were hard to diagnose), and
  `notes/best-practices.md` for the structural/markdown conventions `content/writing/` posts
  should follow (headers vs. prose, nesting, section closings). Deliberately not named `docs/` —
  that name is already claimed by the `npm run docs` script (`quartz build --serve -d docs`),
  which wipes its output directory on every run and would silently delete anything committed
  there.
