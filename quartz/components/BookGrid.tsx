import { QuartzComponent, QuartzComponentProps } from "./types"
import { BookCard, bookCardCss, byYearReadDescending } from "./bookUtils"

export const BookGrid: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const books = allFiles
    .filter((f) => f.slug !== fileData.slug && f.slug?.startsWith("books/"))
    .sort(byYearReadDescending)

  return (
    <div class="book-grid">
      {books.map((book) => (
        <BookCard from={fileData.slug!} book={book} />
      ))}
    </div>
  )
}

BookGrid.css =
  bookCardCss +
  `
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
}
`
