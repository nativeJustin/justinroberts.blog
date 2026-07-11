import { QuartzComponent, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { yearRead } from "./bookUtils"

export const BookMeta: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
  const isBookPage = fileData.slug?.startsWith("books/") && fileData.slug !== "books/index"
  if (!isBookPage) {
    return <></>
  }

  const author = fileData.frontmatter?.author as string | undefined
  const genre = fileData.frontmatter?.genre as string | undefined
  const status = fileData.frontmatter?.status as string | undefined
  const started = fileData.frontmatter?.started as string | undefined
  const rating = fileData.frontmatter?.rating as number | undefined
  const year = yearRead(fileData)

  const statusText =
    status === "reading"
      ? started
        ? `Currently reading (started ${started})`
        : "Currently reading"
      : year !== undefined
        ? `Read in ${year}`
        : undefined

  const parts = [author, genre, statusText].filter(Boolean) as string[]
  const filledStars =
    typeof rating === "number" ? "★".repeat(Math.max(0, Math.min(5, Math.round(rating)))) : undefined
  const emptyStars = filledStars !== undefined ? "☆".repeat(5 - filledStars.length) : undefined

  if (parts.length === 0 && filledStars === undefined) {
    return <></>
  }

  return (
    <p class={classNames(displayClass, "book-meta")}>
      {parts.join(" · ")}
      {filledStars !== undefined && (parts.length > 0 ? " · " : "")}
      {filledStars !== undefined && (
        <span class="book-meta-rating">
          {filledStars}
          {emptyStars}
        </span>
      )}
    </p>
  )
}
