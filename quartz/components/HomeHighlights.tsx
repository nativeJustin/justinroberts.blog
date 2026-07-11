import { QuartzComponent, QuartzComponentProps } from "./types"
import { QuartzPluginData } from "../plugins/vfile"
import { BookCard, bookCardCss, yearRead } from "./bookUtils"

const FAVORITES = [
  "Red Rising",
  "The Goal",
  "The Phoenix Project",
  "Unicorn Project",
  "Discipline Equals Freedom",
  "Exhalation",
  "Smarter Not Harder",
  "The Dark Tower",
]

export const HomeHighlights: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const books = allFiles.filter((f) => f.slug?.startsWith("books/") && f.slug !== "books/index")

  const years = books.map(yearRead).filter((y): y is number => y !== undefined)
  const sinceYear = years.length > 0 ? Math.min(...years) : undefined

  const favorites = FAVORITES.map((title) =>
    books.find((b) => (b.frontmatter?.title as string) === title),
  ).filter((b): b is QuartzPluginData => b !== undefined)

  return (
    <div class="home-highlights">
      <p class="book-stat">
        {books.length} books logged{sinceYear ? ` since ${sinceYear}` : ""}
      </p>

      {favorites.length > 0 && (
        <>
          <p class="favorites-heading eyebrow">Favorite Books</p>
          <div class="book-strip">
            {favorites.map((book) => (
              <BookCard from={fileData.slug!} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

HomeHighlights.css =
  bookCardCss +
  `
.home-highlights {
  margin-top: 2rem;
}

.book-stat {
  font-family: var(--codeFont);
  font-size: 0.85rem;
  color: var(--gray);
  margin: 0 0 2rem;
}

.favorites-heading {
  margin: 0 0 1rem;
}

.book-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
  max-width: 640px;
}
`
