import path from "path"
import { QuartzComponent, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { FilePath, joinSegments, resolveRelative, slugifyFilePath } from "../util/path"
import { byDateAndAlphabeticalFolderFirst } from "./PageList"

function coverSrc(page: QuartzPluginData): string | undefined {
  const cover = page.frontmatter?.cover as string | undefined
  if (!cover || !page.slug) return undefined
  const folder = path.dirname(page.slug)
  const rel = joinSegments(folder, cover) as FilePath
  return "/" + slugifyFilePath(rel)
}

export const BookGrid: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
  const books = allFiles
    .filter((f) => f.slug !== fileData.slug && f.slug?.startsWith("books/"))
    .sort(byDateAndAlphabeticalFolderFirst(cfg))

  return (
    <div class="book-grid">
      {books.map((book) => {
        const src = coverSrc(book)
        const title = (book.frontmatter?.title as string) ?? book.slug
        const author = book.frontmatter?.author as string | undefined
        const rating = book.frontmatter?.rating as number | undefined

        return (
          <a class="book-card internal" href={resolveRelative(fileData.slug!, book.slug!)}>
            {src ? (
              <img src={src} loading="lazy" alt={title} class="book-card-cover" />
            ) : (
              <div class="book-card-cover book-card-cover-placeholder" />
            )}
            <div class="book-card-title">{title}</div>
            {author && <div class="book-card-author">{author}</div>}
            {typeof rating === "number" && (
              <div class="book-card-rating">
                {"★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating))}
              </div>
            )}
          </a>
        )
      })}
    </div>
  )
}

BookGrid.css = `
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
}

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

.book-card-rating {
  color: var(--secondary);
  font-size: 0.8rem;
  letter-spacing: 1px;
}
`
