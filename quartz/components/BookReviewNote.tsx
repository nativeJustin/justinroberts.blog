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
      I'm building out full reviews going forward. This one predates that, so it's just tracked
      here for now.
    </p>
  )
}
