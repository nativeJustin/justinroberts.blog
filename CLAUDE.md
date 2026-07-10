# justinroberts.blog

Justin's personal blog. Built with [Quartz](https://quartz.jzhao.xyz) v4.5.2, deployed to
Cloudflare Workers (static assets), served at `justinroberts.blog`.

## What this repo is

Content originates in Justin's private Obsidian vault (a separate, private repo). This repo is a
curated, public subset of that vault — not a mirror. Only content that's meant to be public lives
here.

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
  - `HomeHighlights` (stat + favorites) only renders here.
- **Explorer sidebar** (`quartz.layout.ts`, `explorerFilter`) excludes `about` and `tags` from the
  nav tree. `/about` is still a real, linkable page — just reachable via the footer link instead
  of the sidebar, since having it in both felt redundant.
- **Footer** (`quartz.layout.ts`, `sharedPageComponents.footer`) is site-wide contact/subscribe
  surface: About Me, Subscribe via RSS (`/index.xml`), the contact email, and GitHub. The email
  link's visible text is the literal address (`hello@justinroberts.blog`), not a generic "Email"
  label — deliberate, so it's readable/copy-pasteable even on a browser with no default mail
  client configured (a bare `mailto:` link does nothing visible in that case, which is normal
  browser behavior, not a bug — don't "fix" it by trying to detect mail client support).
  `hello@justinroberts.blog` is a Cloudflare Email Routing forward, not a real inbox — set up
  outside this repo, in the Cloudflare dashboard.
- **RSS feed** (`/index.xml`, auto-discoverable via a `<link rel="alternate">` tag Quartz emits on
  every page) is scoped in `quartz/plugins/emitters/contentIndex.tsx` to exclude `books/*`,
  `about`, and `index` — those are real pages (still in the sitemap for SEO) but not "posts," and
  including them flooded the feed with 146 empty book notes plus the homepage/about page. The
  feed will be empty until real posts get added outside `content/books/`; that's expected, not a
  bug. If posts eventually get their own folder (e.g. `content/writing/`), this exclusion list
  won't need to change — it's an exclude-list, not an include-list, so new top-level content is
  RSS-eligible by default. The feed's channel description ("Latest N posts on Justin Roberts") is
  overridden in `quartz/i18n/locales/en-US.ts` (`pages.rss`) — upstream Quartz's default says
  "notes," which reads as digital-garden jargon rather than blog language.

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
