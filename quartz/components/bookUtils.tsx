import path from "path"
import { QuartzPluginData } from "../plugins/vfile"
import { FilePath, FullSlug, joinSegments, resolveRelative, slugifyFilePath } from "../util/path"

export function coverSrc(page: QuartzPluginData): string | undefined {
  const cover = page.frontmatter?.cover as string | undefined
  if (!cover || !page.slug) return undefined
  const folder = path.dirname(page.slug)
  const rel = joinSegments(folder, cover) as FilePath
  return "/" + slugifyFilePath(rel)
}

export function yearRead(page: QuartzPluginData): number | undefined {
  const year = page.frontmatter?.year_read
  const num = typeof year === "string" ? parseInt(year, 10) : (year as number | undefined)
  return typeof num === "number" && !isNaN(num) ? num : undefined
}

export function byYearReadDescending(f1: QuartzPluginData, f2: QuartzPluginData): number {
  const y1 = yearRead(f1)
  const y2 = yearRead(f2)
  if (y1 !== undefined && y2 !== undefined) return y2 - y1
  if (y1 !== undefined) return -1
  if (y2 !== undefined) return 1

  const t1 = (f1.frontmatter?.title as string)?.toLowerCase() ?? ""
  const t2 = (f2.frontmatter?.title as string)?.toLowerCase() ?? ""
  return t1.localeCompare(t2)
}

export function BookCard({ from, book }: { from: FullSlug; book: QuartzPluginData }) {
  const src = coverSrc(book)
  const title = (book.frontmatter?.title as string) ?? book.slug
  const author = book.frontmatter?.author as string | undefined
  const rating = book.frontmatter?.rating as number | undefined
  const year = yearRead(book)

  return (
    <a class="book-card internal" href={resolveRelative(from, book.slug!)}>
      {src ? (
        <img src={src} loading="lazy" alt={title} class="book-card-cover" />
      ) : (
        <div class="book-card-cover book-card-cover-placeholder" />
      )}
      <div class="book-card-title">{title}</div>
      {author && <div class="book-card-author">{author}</div>}
      {year !== undefined && <div class="book-card-year">{year}</div>}
      {typeof rating === "number" &&
        (() => {
          const filled = Math.max(0, Math.min(5, Math.round(rating)))
          return <div class="book-card-rating">{"★".repeat(filled) + "☆".repeat(5 - filled)}</div>
        })()}
    </a>
  )
}

export const bookCardCss = `
.book-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--dark);
}

.book-card-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: var(--lightgray);
}

.book-card-cover-placeholder {
  display: flex;
}

.book-card-title {
  margin-top: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.book-card-author {
  color: var(--gray);
  font-size: 0.8rem;
}

.book-card-year {
  color: var(--gray);
  font-size: 0.75rem;
}

.book-card-rating {
  color: var(--secondary);
  font-size: 0.8rem;
  letter-spacing: 1px;
}
`
