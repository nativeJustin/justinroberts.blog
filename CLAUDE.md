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
    `HomeHighlights` — extend this rather than duplicating card markup again.
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
  - Graph View is hidden — it looked sparse with only a couple of nodes; revisit once there's more
    real content (blog posts, not just books/about).
  - `HomeHighlights` (stat + favorites) only renders here. The "Favorite Books" heading uses the
    shared `.eyebrow` class (uppercase, letter-spaced) instead of a plain `<h3>`, for visual
    consistency with other section labels on the site — it was originally just "Favorites" styled
    as a header, which read as an unclear, easy-to-miss label.
  - The homepage's "Start with [[writing/index|the latest posts]]" link used to point at
    `books/index` — a leftover placeholder from before `content/writing/` existed. Fixed once real
    posts landed there; if you ever see a homepage link pointing at the wrong section, check for
    this kind of stale-placeholder pattern.
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
- **Comments** (`quartz/components/Comments.tsx`, giscus — vendored with upstream Quartz but not
  wired in by default) is turned on in `sharedPageComponents.afterBody` in `quartz.layout.ts`,
  gated by a local `isCommentablePage()` check: comments only show on real posts, excluding
  `index`, `about`, `books/*`, `tags/*`, and any `*/index` folder page. This exclusion list is
  separate from (not shared with) the RSS exclusion list in `contentIndex.tsx` below — if the
  definition of "real post" changes, both lists need updating, they're not DRY. giscus config
  (`repo`, `repoId`, `category`, `categoryId`) points at this repo's own GitHub Discussions
  (category `Comments`, created for this purpose); the giscus GitHub App is installed on this repo
  and Discussions is enabled.
- **RSS feed** (`/index.xml`, auto-discoverable via a `<link rel="alternate">` tag Quartz emits on
  every page) is scoped in `quartz/plugins/emitters/contentIndex.tsx` to exclude `books/*`,
  `about`, and `index` — those are real pages (still in the sitemap for SEO) but not "posts," and
  including them flooded the feed with 146 empty book notes plus the homepage/about page. It's an
  exclude-list, not an include-list, so `content/writing/` posts are RSS-eligible by default with
  no changes needed there. The feed's channel description ("Latest N posts on Justin Roberts") is
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
  pulled with `git pull` and wired up from there.
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
- `.gitignore` didn't exist in this repo until it was added alongside the Obsidian vault setup —
  covers `node_modules/`, `public/`, `quartz/.quartz-cache/`, `.obsidian/`, and `.DS_Store`.
