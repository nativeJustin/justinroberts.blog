import { QuartzComponent, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

export const BookReviewNote: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
  const isBookPage = fileData.slug?.startsWith("books/") && fileData.slug !== "books/index"
  const reviewed = fileData.frontmatter?.reviewed === true
  if (!isBookPage || reviewed) {
    return <></>
  }

  return (
    <p class={classNames(displayClass, "book-review-note")}>
      I'm writing full reviews for books going forward. This one was logged before that started,
      so it's tracked here without one.
    </p>
  )
}
